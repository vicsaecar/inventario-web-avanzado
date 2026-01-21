
import React, { useState } from 'react';
import { 
  Cloud, ShieldCheck, Terminal, Copy, Check, AlertCircle, Trash2
} from 'lucide-react';

interface SettingsViewProps {
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  logs?: string[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ sheetUrl, setSheetUrl, logs = [] }) => {
  const [tempUrl, setTempUrl] = useState(sheetUrl);
  const [copied, setCopied] = useState(false);

  // Script GAS V7: Ordenamiento Alfabético de Catálogo + Clonado V6
  const gasCode = `// ⚠️ COPIA Y PEGA ESTE CÓDIGO COMPLETO EN SCRIPT.GOOGLE.COM (Versión V7 - Auto Sort Catalog)

const SHEET_INV = "inventario";
const SHEET_CAT = "catalogo";

function success(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function error(msg) {
  return ContentService.createTextOutput(JSON.stringify({ error: msg })).setMimeType(ContentService.MimeType.JSON);
}

// NORMALIZADOR V5: Protección robusta de la Ñ
function normalizeHeader(header) {
  var key = String(header).trim().toUpperCase();
  key = key.replace(/Ñ/g, "###NY###");
  key = key.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");
  key = key.replace(/###NY###/g, "Ñ");
  return key.replace(/\\s+/g, '_').replace(/[^A-Z0-9_Ñº]/g, "");
}

function findHeaderRow(sheet, keywords) {
  const data = sheet.getDataRange().getValues();
  let bestRow = { index: -1, values: [], allData: data, matchCount: 0 };
  const normKeywords = keywords.map(k => normalizeHeader(k));

  for (let i = 0; i < Math.min(data.length, 30); i++) {
    const rowValues = data[i].map(c => normalizeHeader(c));
    const matchCount = normKeywords.filter(k => rowValues.includes(k)).length;
    const threshold = Math.min(3, keywords.length); 

    if (matchCount >= threshold && matchCount > bestRow.matchCount) {
      bestRow = { index: i, values: data[i], allData: data, matchCount: matchCount };
    }
  }

  if (bestRow.index === -1) {
     return { index: 0, values: data[0] || [], allData: data, matchCount: 0 };
  }
  return bestRow;
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invSheet = ss.getSheetByName(SHEET_INV);
  const catSheet = ss.getSheetByName(SHEET_CAT);
  
  if (!invSheet || !catSheet) return error("Faltan pestañas 'inventario' o 'catalogo'");

  // --- INVENTARIO ---
  const invInfo = findHeaderRow(invSheet, ["CODIGO", "EQUIPO", "PROVEEDOR", "SERIAL_NUMBER"]);
  const invHeaders = invInfo.values;
  const invData = invInfo.allData;
  const invStartIndex = invInfo.index + 1;

  const inventoryList = [];
  const invHeaderMap = {};
  invHeaders.forEach((h, i) => {
    const norm = normalizeHeader(h);
    invHeaderMap[i] = norm;
  });

  if (invData.length > invStartIndex) {
    for (let i = invStartIndex; i < invData.length; i++) {
      let rowObj = {};
      let hasData = false;
      Object.keys(invHeaderMap).forEach(colIdx => {
         const key = invHeaderMap[colIdx];
         const val = invData[i][colIdx];
         rowObj[key] = val;
         if (val && String(val).trim() !== "") hasData = true;
      });
      if (!rowObj.ID) rowObj.ID = i + 1;
      if (hasData) inventoryList.push(rowObj);
    }
  }

  // --- CATALOGO ---
  const TARGET_HEADERS = ["PROVEEDOR", "EMPRESA", "TIPO", "DISPOSITIVO", "UBICACION", "PROPIEDAD", "CIF", "ESTADO", "MATERIAL", "COMPAÑIA", "CREADO_POR", "BYOD"];
  const catInfo = findHeaderRow(catSheet, TARGET_HEADERS);
  const catData = catInfo.allData;
  const catStartIndex = catInfo.index + 1;
  const catHeaders = catInfo.values;

  const catalogObj = {};
  TARGET_HEADERS.forEach(k => catalogObj[k] = []);
  const catHeaderMap = {};
  catHeaders.forEach((h, i) => {
    const norm = normalizeHeader(h);
    if (TARGET_HEADERS.includes(norm)) catHeaderMap[norm] = i;
  });

  if (catData.length > catStartIndex) {
    for (let i = catStartIndex; i < catData.length; i++) {
       Object.keys(catHeaderMap).forEach(key => {
         const colIdx = catHeaderMap[key];
         const val = catData[i][colIdx];
         if (val && String(val).trim() !== "") catalogObj[key].push(String(val).trim());
       });
    }
  }

  return success({ inventario: inventoryList, catalogo: catalogObj });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return error("Busy");

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_INV);
    const req = JSON.parse(e.postData.contents);
    
    const invInfo = findHeaderRow(sheet, ["CODIGO", "EQUIPO", "PROVEEDOR"]);
    const headers = invInfo.values;
    const headerRowIdx = invInfo.index + 1; 
    
    const headerMap = {};
    headers.forEach((h, i) => { 
      const rawNorm = normalizeHeader(h);
      headerMap[rawNorm] = i + 1;
    });

    const action = req.action;
    const data = req.data; 

    if (action === 'upsert') {
      const lastRow = sheet.getLastRow();
      let targetRow = -1;
      
      // Buscar si es actualización (ID existente)
      if (headerMap['ID'] && data.ID) {
        const numRows = Math.max(lastRow - headerRowIdx, 0);
        if (numRows > 0) {
            const ids = sheet.getRange(headerRowIdx + 1, headerMap['ID'], numRows, 1).getValues().flat();
            for(let i=0; i<ids.length; i++) {
              if(String(ids[i]) == String(data.ID)) {
                targetRow = headerRowIdx + 1 + i;
                break;
              }
            }
        }
      }

      // Si es NUEVA FILA
      if (targetRow === -1) {
        targetRow = lastRow + 1;
        
        // --- LÓGICA DE CLONADO (V6) ---
        if (targetRow > headerRowIdx + 1) {
           try { 
             var sourceRange = sheet.getRange(targetRow - 1, 1, 1, sheet.getLastColumn());
             var targetRange = sheet.getRange(targetRow, 1); // Solo necesitamos celda inicio
             sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
             sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
           } catch(err) {}
        }
      }

      // Escribir datos
      for (const [key, val] of Object.entries(data)) {
        const targetCol = headerMap[normalizeHeader(key)];
        if (targetCol) {
          let valueToWrite = val;
          if (['FECHA', 'FECHA_COMPRA', 'CON_FECHA'].includes(normalizeHeader(key))) {
             valueToWrite = "'" + val;
          }
          sheet.getRange(targetRow, targetCol).setValue(valueToWrite);
        }
      }
      if (headerMap['ID'] && data.ID) sheet.getRange(targetRow, headerMap['ID']).setValue(data.ID);
    }
    else if (action === 'delete') {
       if (headerMap['ID'] && data.ID) {
        const numRows = Math.max(sheet.getLastRow() - headerRowIdx, 0);
        if (numRows > 0) {
            const ids = sheet.getRange(headerRowIdx + 1, headerMap['ID'], numRows, 1).getValues().flat();
            for(let i=0; i<ids.length; i++) {
              if(String(ids[i]) == String(data.ID)) {
                sheet.deleteRow(headerRowIdx + 1 + i);
                break;
              }
            }
        }
       }
    }
    else if (action === 'update_catalog') {
        const catSheet = ss.getSheetByName(SHEET_CAT);
        catSheet.clear();
        const TARGET_HEADERS = ["PROVEEDOR", "EMPRESA", "TIPO", "DISPOSITIVO", "UBICACION", "PROPIEDAD", "CIF", "ESTADO", "MATERIAL", "COMPAÑIA", "CREADO_POR", "BYOD"];
        catSheet.getRange(1, 1, 1, TARGET_HEADERS.length).setValues([TARGET_HEADERS]);

        // V7: ORDENAR DATOS ANTES DE ESCRIBIR
        TARGET_HEADERS.forEach(k => {
           if(data[k] && Array.isArray(data[k])) {
              data[k].sort(function(a, b) {
                 return String(a).localeCompare(String(b), 'es', { sensitivity: 'base' });
              });
           }
        });

        const maxLen = Math.max(...TARGET_HEADERS.map(k => (data[k] || []).length));
        if (maxLen > 0) {
           const rows = [];
           for(let i=0; i<maxLen; i++) {
              rows.push(TARGET_HEADERS.map(k => (data[k] && data[k][i]) ? data[k][i] : ""));
           }
           catSheet.getRange(2, 1, rows.length, TARGET_HEADERS.length).setValues(rows);
        }
    }

    return success({ result: "ok" });
  } catch (e) {
    return error(e.toString());
  } finally {
    lock.releaseLock();
  }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gasCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSafeReset = () => {
    if (window.confirm("¿Estás seguro? Esto borrará la URL de conexión y los datos locales de la caché, pero no afectará a tu Google Sheet.")) {
      localStorage.removeItem('zubi_catalog');
      localStorage.removeItem('zubi_inventory');
      localStorage.removeItem('zubi_sheet_url');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-10 space-y-8">
       {/* 0. Cabecera y Botón de Reset Arriba a la Derecha */}
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
              <div className="bg-blue-600 p-4 rounded-3xl shadow-xl text-white"><Cloud size={32}/></div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Conexión Cloud</h2>
                <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Configuración del enlace Google Sheets</p>
              </div>
          </div>
          <button onClick={handleSafeReset} className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center gap-2">
             <Trash2 size={16} /> Resetear Cache y Reiniciar
          </button>
       </div>

       {/* 1. URL del Google Apps Script */}
       <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-4 shadow-2xl relative overflow-hidden">
          <h4 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400 mb-2 font-mono">URL del Google Apps Script</h4>
          <input type="text" value={tempUrl} onChange={(e) => setTempUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-blue-400 focus:border-blue-500 focus:bg-white/10 outline-none transition-all font-mono" />
          <button onClick={() => setSheetUrl(tempUrl)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"><ShieldCheck size={20}/> Guardar Conexión</button>
       </div>

       {/* 2. GAS (Código) */}
       <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-[2rem] space-y-4">
          <div className="flex items-center gap-4 text-amber-700">
            <AlertCircle size={24} />
            <h4 className="font-black text-sm uppercase">CÓDIGO DE SERVIDOR (ACTUALIZAR - V7)</h4>
          </div>
          <p className="text-xs font-bold text-amber-800/70 leading-relaxed">
             <span className="bg-amber-200 px-1 rounded">IMPORTANTE:</span> Este código incluye ordenamiento alfabético automático de categorías.
          </p>
          <div className="relative group">
            <pre className="bg-slate-900 text-blue-400 p-6 rounded-2xl text-[10px] font-mono overflow-x-auto border-b-4 border-blue-600 max-h-60 custom-scrollbar">
              {gasCode}
            </pre>
            <button 
              onClick={handleCopyCode}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-all"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
          </div>
       </div>

       {/* 3. LOGS DEL SERVIDOR */}
       <div className="p-8 bg-slate-950 border-2 border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3"><Terminal className="text-emerald-400" size={20}/><h5 className="font-black text-xs text-emerald-400 uppercase tracking-widest">Logs del Servidor</h5></div>
          </div>
          <div className="h-48 overflow-y-auto bg-black/30 rounded-2xl p-6 font-mono text-[10px] space-y-2 custom-scrollbar border border-white/5">
             {logs.map((log, i) => (
                <div key={i} className={`pb-1 border-b border-white/5 ${log.includes('❌') || log.includes('🚨') ? 'text-rose-400' : log.includes('✅') ? 'text-emerald-400' : 'text-slate-400'}`}>{log}</div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default SettingsView;
