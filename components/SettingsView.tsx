
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

  // Script GAS BLINDADO: Umbral mínimo de coincidencias (Mantenemos la versión segura)
  const gasCode = `// ⚠️ COPIA Y PEGA ESTE CÓDIGO COMPLETO EN SCRIPT.GOOGLE.COM

const SHEET_INV = "inventario";
const SHEET_CAT = "catalogo";

function success(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function error(msg) {
  return ContentService.createTextOutput(JSON.stringify({ error: msg })).setMimeType(ContentService.MimeType.JSON);
}

// BUSQUEDA INTELIGENTE CON UMBRAL DE SEGURIDAD
function findHeaderRow(sheet, keywords) {
  const data = sheet.getDataRange().getValues();
  let bestRow = { index: -1, values: [], allData: data, matchCount: 0 };

  // Escaneamos las primeras 30 filas
  for (let i = 0; i < Math.min(data.length, 30); i++) {
    const rowValues = data[i].map(c => String(c).trim().toUpperCase());
    // Contamos coincidencias exactas
    const matchCount = keywords.filter(k => rowValues.includes(k.toUpperCase())).length;
    
    // UMBRAL CRÍTICO: Ignoramos filas con menos de 3 coincidencias para evitar
    // confundir un título (ej: "LISTADO CIF") con la cabecera real.
    // Si la hoja tiene pocas columnas, ajustamos el umbral dinámicamente.
    const threshold = Math.min(3, keywords.length); 

    if (matchCount >= threshold && matchCount > bestRow.matchCount) {
      bestRow = { index: i, values: data[i], allData: data, matchCount: matchCount };
    }
  }

  // Si no encontramos nada con el umbral, usamos la primera fila por defecto (fallback)
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
  const invInfo = findHeaderRow(invSheet, ["ID", "CODIGO", "EQUIPO", "EMPRESA"]);
  const invHeaders = invInfo.values;
  const invData = invInfo.allData;
  const invStartIndex = invInfo.index + 1;

  const inventoryList = [];
  if (invData.length > invStartIndex) {
    for (let i = invStartIndex; i < invData.length; i++) {
      let rowObj = {};
      let hasData = false;
      for (let j = 0; j < invHeaders.length; j++) {
         const header = String(invHeaders[j]).trim();
         if (header) {
           rowObj[header] = invData[i][j];
           if (rowObj[header]) hasData = true;
         }
      }
      if (hasData) inventoryList.push(rowObj);
    }
  }

  // --- CATALOGO ---
  const TARGET_HEADERS = ["PROVEEDOR", "EMPRESA", "TIPO", "DISPOSITIVO", "UBICACION", "PROPIEDAD", "CIF", "ESTADO", "MATERIAL", "COMPAÑIA", "CREADO_POR", "BYOD"];
  
  const catInfo = findHeaderRow(catSheet, TARGET_HEADERS);
  const catHeaders = catInfo.values;
  const catData = catInfo.allData;
  const catStartIndex = catInfo.index + 1;

  const catalogObj = {};
  TARGET_HEADERS.forEach(k => catalogObj[k] = []);

  const headerMap = {};
  const usedColumns = new Set(); // Evitar colisiones de columnas
  
  // Mapeo Estricto
  catHeaders.forEach((h, i) => {
    const key = String(h).trim().toUpperCase();
    if (TARGET_HEADERS.includes(key)) {
       const normalizedKey = TARGET_HEADERS.find(k => k === key);
       // Si esta clave no está mapeada Y esta columna no ha sido usada
       if (!headerMap.hasOwnProperty(normalizedKey) && !usedColumns.has(i)) {
          headerMap[normalizedKey] = i;
          usedColumns.add(i);
       }
    }
  });

  if (catData.length > catStartIndex) {
    for (let i = catStartIndex; i < catData.length; i++) {
       Object.keys(headerMap).forEach(key => {
         const colIdx = headerMap[key];
         const val = catData[i][colIdx];
         if (val && String(val).trim() !== "") {
           catalogObj[key].push(String(val).trim());
         }
       });
    }
  }

  return success({
    inventario: inventoryList,
    catalogo: catalogObj
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return error("Busy");

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_INV);
    const req = JSON.parse(e.postData.contents);
    
    // Header dinámico inventario
    const invInfo = findHeaderRow(sheet, ["ID", "CODIGO"]);
    const headers = invInfo.values;
    const headerRowIdx = invInfo.index + 1; 
    
    const headerMap = {};
    headers.forEach((h, i) => { 
      const key = String(h).trim();
      if(key) headerMap[key] = i + 1; 
    });

    const action = req.action;
    const data = req.data;

    if (action === 'upsert') {
      const lastRow = sheet.getLastRow();
      let targetRow = -1;
      
      if (headerMap['ID'] && data.ID) {
        const idsRange = sheet.getRange(headerRowIdx + 1, headerMap['ID'], Math.max(lastRow - headerRowIdx, 1), 1);
        const ids = idsRange.getValues().flat();
        for(let i=0; i<ids.length; i++) {
          if(String(ids[i]) == String(data.ID)) {
            targetRow = headerRowIdx + 1 + i;
            break;
          }
        }
      }

      if (targetRow === -1) {
        targetRow = lastRow + 1;
        if (targetRow > headerRowIdx + 1) {
           try {
             sheet.getRange(targetRow - 1, 1, 1, sheet.getLastColumn()).copyTo(sheet.getRange(targetRow, 1), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
           } catch(err) {}
        }
      }

      for (const [key, val] of Object.entries(data)) {
        if (headerMap[key]) {
          let valueToWrite = val;
          if (['FECHA', 'FECHA_COMPRA', 'CON_FECHA'].includes(key)) {
             valueToWrite = "'" + val;
          }
          sheet.getRange(targetRow, headerMap[key]).setValue(valueToWrite);
        }
      }
      if (headerMap['ID'] && data.ID) {
         sheet.getRange(targetRow, headerMap['ID']).setValue(data.ID);
      }
    }
    else if (action === 'delete') {
       if (headerMap['ID'] && data.ID) {
        const lastRow = sheet.getLastRow();
        const ids = sheet.getRange(headerRowIdx + 1, headerMap['ID'], Math.max(lastRow - headerRowIdx, 1), 1).getValues().flat();
        for(let i=0; i<ids.length; i++) {
          if(String(ids[i]) == String(data.ID)) {
            sheet.deleteRow(headerRowIdx + 1 + i);
            break;
          }
        }
       }
    }
    else if (action === 'update_catalog') {
        const catSheet = ss.getSheetByName(SHEET_CAT);
        catSheet.clear();
        
        const TARGET_HEADERS = ["PROVEEDOR", "EMPRESA", "TIPO", "DISPOSITIVO", "UBICACION", "PROPIEDAD", "CIF", "ESTADO", "MATERIAL", "COMPAÑIA", "CREADO_POR", "BYOD"];
        
        catSheet.getRange(1, 1, 1, TARGET_HEADERS.length).setValues([TARGET_HEADERS]);
        
        const maxLen = Math.max(...TARGET_HEADERS.map(k => (data[k] || []).length));
        
        if (maxLen > 0) {
           const rows = [];
           for(let i=0; i<maxLen; i++) {
              const row = TARGET_HEADERS.map(k => (data[k] && data[k][i]) ? data[k][i] : "");
              rows.push(row);
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
            <h4 className="font-black text-sm uppercase">GAS (Google Apps Script)</h4>
          </div>
          <p className="text-xs font-bold text-amber-800/70 leading-relaxed">
             Este código contiene la lógica de seguridad para evitar la corrupción de datos. Asegúrate de tener esta versión actualizada en tu editor de Apps Script.
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
