
import React, { useState } from 'react';
import { Catalog } from '../types';
import { 
  Plus, X, Info, Cloud, Globe, ExternalLink, ShieldCheck, 
  Building2, Store, Tag, MapPin, Layers, Wifi, UserCog, CreditCard, Search,
  Activity, Package, Smartphone, Trash2, Terminal, Copy, Check, AlertCircle
} from 'lucide-react';

interface SettingsViewProps {
  catalog: Catalog;
  setCatalog: React.Dispatch<React.SetStateAction<Catalog>>;
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  onCatalogUpdate: (newCatalog: Catalog) => void;
  logs?: string[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ catalog, setCatalog, sheetUrl, setSheetUrl, onCatalogUpdate, logs = [] }) => {
  const [activeCategory, setActiveCategory] = useState<keyof Catalog | 'cloud'>('cloud');
  const [newItem, setNewItem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tempUrl, setTempUrl] = useState(sheetUrl);
  const [copied, setCopied] = useState(false);

  const gasCode = `// ⚠️ COPIA Y PEGA ESTE CÓDIGO COMPLETO EN SCRIPT.GOOGLE.COM

const SHEET_INV = "inventario";
const SHEET_CAT = "catalogo";
const HEADERS = [
  'ID', 'CODIGO', 'EQUIPO', 'EMPRESA', 'DESCRIPCION', 'TIPO', 'PROPIEDAD', 'CIF', 
  'ASIGNADO', 'CORREO', 'ADM', 'FECHA', 'UBICACION', 'ESTADO', 'MATERIAL', 
  'BEFORE', 'BYOD', 'MODELO', 'SERIAL_NUMBER', 'CARACTERISTICAS', 'TIENDA', 
  'FECHA_COMPRA', 'FACTURA', 'COSTE', 'CREADO_POR', 'RESPONSABLE', 'DISPOSITIVO', 
  'TARJETA_SIM', 'CON_FECHA', 'COMPAÑIA', 'PIN', 'Nº_TELEFONO', 'PUK', 'TARIFA', 
  'IMEI_1', 'IMEI_2', 'CORREO_SSO', 'ETIQ'
];

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invSheet = ss.getSheetByName(SHEET_INV);
  const catSheet = ss.getSheetByName(SHEET_CAT);
  
  if (!invSheet || !catSheet) return error("Faltan pestañas 'inventario' o 'catalogo'");

  const invData = invSheet.getDataRange().getValues();
  const catData = catSheet.getDataRange().getValues();
  
  const catalogObj = {};
  if (catData.length > 0) {
    const catHeaders = catData[0];
    catHeaders.forEach((h, i) => {
      catalogObj[h] = catData.slice(1).map(row => row[i]).filter(v => v !== "");
    });
  }

  const payload = {
    inventario: invData.length > 1 ? invData.slice(1) : [],
    catalogo: catalogObj
  };
  
  return success(payload);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return error("Server busy");

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_INV);
    if (!sheet) { sheet = ss.insertSheet(SHEET_INV); sheet.appendRow(HEADERS); }
    
    const req = JSON.parse(e.postData.contents);
    const action = req.action;
    const data = req.data;

    if (action === 'upsert') {
      const allData = sheet.getDataRange().getValues();
      const idIdx = HEADERS.indexOf('ID');
      let rowIdx = -1;
      
      // Buscar por ID
      for (let i = 1; i < allData.length; i++) {
        if (String(allData[i][idIdx]) == String(data.ID)) {
          rowIdx = i + 1;
          break;
        }
      }

      const rowData = HEADERS.map(h => data[h] || "");

      if (rowIdx > 0) {
        // Actualizar fila existente
        sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
      } else {
        // Insertar nueva fila
        sheet.appendRow(rowData);
        
        // --- LOGICA DE COPIADO DE FORMATO ---
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          // Copiar formato de la fila anterior (lastRow - 1) a la nueva (lastRow)
          const sourceRange = sheet.getRange(lastRow - 1, 1, 1, rowData.length);
          const targetRange = sheet.getRange(lastRow, 1, 1, rowData.length);
          sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
        }
      }
    } 
    else if (action === 'delete') {
      const allData = sheet.getDataRange().getValues();
      const idIdx = HEADERS.indexOf('ID');
      for (let i = 1; i < allData.length; i++) {
        if (String(allData[i][idIdx]) == String(data.ID)) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }

    return success({ result: "ok" });
  } catch (err) {
    return error(err.toString());
  } finally {
    lock.releaseLock();
  }
}

function success(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function error(msg) {
  return ContentService.createTextOutput(JSON.stringify({ error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gasCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSafeReset = () => {
    if (window.confirm("¿Estás seguro? Esto borrará la URL de conexión y los datos locales de la caché, pero no afectará a tu Google Sheet.")) {
      // Borrado Quirúrgico: Solo eliminamos lo nuestro
      localStorage.removeItem('zubi_catalog');
      localStorage.removeItem('zubi_inventory');
      localStorage.removeItem('zubi_sheet_url');
      // Recarga forzada limpia
      window.location.reload();
    }
  };

  const categories: { key: keyof Catalog | 'cloud'; label: string; icon: React.ReactNode }[] = [
    { key: 'cloud', label: 'Sincronización Cloud', icon: <Cloud size={16}/> },
    { key: 'PROVEEDOR', label: 'Proveedores', icon: <Store size={16}/> },
    { key: 'EMPRESA', label: 'Empresas', icon: <Building2 size={16}/> },
    { key: 'TIPO', label: 'Tipos de Activo', icon: <Tag size={16}/> },
    { key: 'DISPOSITIVO', label: 'Gamas Dispositivo', icon: <Layers size={16}/> },
    { key: 'UBICACION', label: 'Ubicaciones', icon: <MapPin size={16}/> },
    { key: 'PROPIEDAD', label: 'Propiedad Legal', icon: <CreditCard size={16}/> },
    { key: 'CIF_EMPRESA', label: 'CIF Empresa', icon: <ShieldCheck size={16}/> },
    { key: 'ESTADO', label: 'Estados Operativos', icon: <Activity size={16}/> },
    { key: 'MATERIAL', label: 'Materiales', icon: <Package size={16}/> },
    { key: 'COMPAÑIA', label: 'Compañías Tel.', icon: <Wifi size={16}/> },
    { key: 'CREADO_POR', label: 'Responsables', icon: <UserCog size={16}/> },
    { key: 'BYOD', label: 'Política BYOD', icon: <Smartphone size={16}/> }
  ];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCategory === 'cloud' || !newItem.trim()) return;
    if (catalog[activeCategory].includes(newItem.trim())) return;
    const updated = { ...catalog, [activeCategory]: [...catalog[activeCategory], newItem.trim()] };
    onCatalogUpdate(updated);
    setNewItem('');
  };

  const handleRemoveItem = (itemToRemove: string) => {
    if (activeCategory === 'cloud') return;
    if (window.confirm(`¿Eliminar "${itemToRemove}"?`)) {
      const updated = { ...catalog, [activeCategory]: catalog[activeCategory].filter(item => item !== itemToRemove) };
      onCatalogUpdate(updated);
    }
  };

  const filteredItems = activeCategory === 'cloud' ? [] : (catalog[activeCategory as keyof Catalog] || []).filter(item => 
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[750px] max-h-[85vh]">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="p-8"><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuración</h3></div>
          <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
            {categories.map((cat) => (
              <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setSearchTerm(''); }} className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeCategory === cat.key ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}>{cat.icon} {cat.label}</button>
            ))}
          </nav>
          <div className="p-6 bg-slate-100 border-t border-slate-200 mt-auto">
             <button onClick={handleSafeReset} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95"><Trash2 size={16} /> Resetear Cache</button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-10 bg-white custom-scrollbar">
          {activeCategory === 'cloud' ? (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="flex items-center gap-6">
                  <div className="bg-blue-600 p-4 rounded-3xl shadow-xl text-white"><Cloud size={32}/></div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Diagnóstico Cloud</h2>
                    <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Solución de errores de sincronización</p>
                  </div>
               </div>

               {/* AVISO CRITICO */}
               <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-[2rem] space-y-4">
                  <div className="flex items-center gap-4 text-amber-700">
                    <AlertCircle size={24} />
                    <h4 className="font-black text-sm uppercase">¡ACTUALIZACIÓN REQUERIDA EN GOOGLE SCRIPT!</h4>
                  </div>
                  <p className="text-xs font-bold text-amber-800/70 leading-relaxed">
                    Para que los nuevos registros mantengan el <strong>FORMATO DE CELDA</strong> (colores, bordes) de tu hoja, debes actualizar el script.
                  </p>
                  <p className="text-xs font-bold text-amber-800/70 leading-relaxed">
                    1. Copia el código de abajo.<br/>
                    2. Pégalo en tu editor de Google Apps Script.<br/>
                    3. Pulsa "Implementar" -> "Nueva implementación".
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

               <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-4 shadow-2xl relative overflow-hidden">
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400 mb-2 font-mono">URL del Google Apps Script</h4>
                  <input type="text" value={tempUrl} onChange={(e) => setTempUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-blue-400 focus:border-blue-500 focus:bg-white/10 outline-none transition-all font-mono" />
                  <button onClick={() => setSheetUrl(tempUrl)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"><ShieldCheck size={20}/> Guardar Conexión</button>
               </div>

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
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">{categories.find(c => c.key === activeCategory)?.icon}</div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{categories.find(c => c.key === activeCategory)?.label}</h2>
                </div>
                <div className="relative">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                   <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-6 py-2.5 bg-slate-100 border-none rounded-full text-[10px] font-black uppercase focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                </div>
              </div>
              <form onSubmit={handleAddItem} className="mb-8 flex gap-4">
                <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={`Añadir a ${activeCategory}...`} className="flex-1 bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all shadow-sm" />
                <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 transition-all shadow-xl flex items-center gap-3 active:scale-95"><Plus size={18} /> Añadir</button>
              </form>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                {filteredItems.map((item) => (
                  <div key={item} className="group bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all">
                    <span className="text-[11px] font-black text-slate-700 truncate uppercase tracking-tight">{item}</span>
                    <button onClick={() => handleRemoveItem(item)} className="p-2 text-slate-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100 bg-white rounded-xl shadow-sm border border-slate-100"><X size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
