
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  BarChart3, 
  PlusCircle, 
  Settings, 
  Menu, 
  Package,
  Bot,
  RefreshCw,
  Library
} from 'lucide-react';
import { INITIAL_INVENTORY, CATALOG as INITIAL_CATALOG, DEFAULT_SHEET_URL } from './constants';
import { InventoryItem, ViewType, Catalog } from './types';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import InventoryForm from './components/InventoryForm';
import Reports from './components/Reports';
import SettingsView from './components/SettingsView';
import CatalogView from './components/CatalogView';
import AIChat from './components/AIChat';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [catalog, setCatalog] = useState<Catalog>(() => {
    const saved = localStorage.getItem('zubi_catalog');
    return saved ? JSON.parse(saved) : INITIAL_CATALOG;
  });
  const [sheetUrl, setSheetUrl] = useState<string>(() => localStorage.getItem('zubi_sheet_url') || DEFAULT_SHEET_URL);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Optimistic UI Refs
  const pendingAdds = useRef<InventoryItem[]>([]);
  const pendingEdits = useRef<InventoryItem[]>([]);
  const pendingDeletes = useRef<Set<number>>(new Set());

  const MASTER_COLUMNS = [
    'ID', 'CODIGO', 'EQUIPO', 'EMPRESA', 'DESCRIPCION', 'TIPO', 'PROPIEDAD', 'CIF', 
    'ASIGNADO', 'CORREO', 'ADM', 'FECHA', 'UBICACION', 'ESTADO', 'MATERIAL', 
    'BEFORE', 'BYOD', 'MODELO', 'SERIAL_NUMBER', 'CARACTERISTICAS', 'PROVEEDOR', 
    'FECHA_COMPRA', 'FACTURA', 'COSTE', 'CREADO_POR', 'RESPONSABLE', 'DISPOSITIVO', 
    'TARJETA_SIM', 'CON_FECHA', 'COMPAÑIA', 'PIN', 'Nº_TELEFONO', 'PUK', 'TARIFA', 
    'IMEI_1', 'IMEI_2', 'CORREO_SSO', 'ETIQ'
  ];

  const addLog = (msg: string) => {
    setSyncLogs(prev => [ `${new Date().toLocaleTimeString()} - ${msg}`, ...prev].slice(0, 50));
  };

  const normalizeDate = (val: any): string => {
    if (!val) return "";
    const str = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    if (str.includes('T')) return str.split('T')[0];
    if (str.includes('/') && str.split('/').length === 3) {
        const parts = str.split('/');
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        if (y.length === 4) return `${y}-${m}-${d}`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
    }
    return str;
  };

  const syncWithSheets = useCallback(async (forcedUrl?: string) => {
    const urlToUse = forcedUrl || sheetUrl;
    if (!urlToUse) {
      addLog("⚠️ Sin URL. Cargando datos locales...");
      const savedInv = localStorage.getItem('zubi_inventory');
      if (savedInv) setInventory(JSON.parse(savedInv));
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const cacheBuster = `?t=${new Date().getTime()}`;
      const response = await fetch(`${urlToUse}${cacheBuster}`, { method: 'GET', redirect: 'follow' });
      const data = await response.json();
      
      let rawInvData = data.inventario || (Array.isArray(data) ? data : null);
      
      if (rawInvData && Array.isArray(rawInvData)) {
        let processedInv = rawInvData.map((row: any, idx: number) => {
          const item: any = {};
          
          if (Array.isArray(row)) {
            if (row.length < 10) return null; 
            MASTER_COLUMNS.forEach((col, colIdx) => {
              const val = row[colIdx];
              if (['FECHA', 'FECHA_COMPRA', 'CON_FECHA'].includes(col)) {
                item[col] = normalizeDate(val);
              } else {
                item[col] = (val === null || val === undefined) ? "" : String(val).trim();
              }
            });
          } else if (typeof row === 'object') {
            if (Object.keys(row).length < 10) return null;
            // Para inventario mantenemos flexibilidad básica, pero para Catálogo somos estrictos
            MASTER_COLUMNS.forEach(col => {
              const val = row[col];
              if (['FECHA', 'FECHA_COMPRA', 'CON_FECHA'].includes(col)) {
                item[col] = normalizeDate(val);
              } else {
                item[col] = String(val || "").trim();
              }
            });
          } else {
            return null;
          }
          item.ID = parseInt(String(item.ID)) || (idx + 1);
          return item as InventoryItem;
        }).filter(item => item !== null && item.CODIGO && item.CODIGO.trim() !== "" && item.CODIGO.toLowerCase() !== "codigo");

        let finalInv = [...(processedInv || [])];
        const newDeletes = new Set<number>();
        finalInv = finalInv.filter(item => {
            if (pendingDeletes.current.has(item.ID)) {
                newDeletes.add(item.ID);
                return false; 
            }
            return true;
        });
        pendingDeletes.current = newDeletes;

        const activeAdds: InventoryItem[] = [];
        pendingAdds.current.forEach(localItem => {
           const exists = finalInv.some(i => i.ID === localItem.ID);
           if (!exists) {
               finalInv.push(localItem);
               activeAdds.push(localItem);
           }
        });
        pendingAdds.current = activeAdds;

        const activeEdits: InventoryItem[] = [];
        pendingEdits.current.forEach(localItem => {
             const idx = finalInv.findIndex(i => i.ID === localItem.ID);
             if (idx !== -1) {
                 const serverItem = finalInv[idx];
                 const isSynced = JSON.stringify(serverItem) === JSON.stringify(localItem);
                 if (!isSynced) {
                     finalInv[idx] = localItem;
                     activeEdits.push(localItem);
                 }
             } else {
                 finalInv.push(localItem);
                 activeEdits.push(localItem);
             }
        });
        pendingEdits.current = activeEdits;

        if (finalInv.length > 0) {
          setInventory(finalInv);
          localStorage.setItem('zubi_inventory', JSON.stringify(finalInv));
        }
        setLastSync(new Date().toLocaleTimeString());
      }

      // Procesar Catálogo STRICT MODE
      const rawCat = data.catalogo || data.catalog;
      if (rawCat) {
        setCatalog(prevCatalog => {
            const newCatalog: Catalog = { ...prevCatalog };
            const rawKeys = Object.keys(rawCat);

            // Iteramos solo sobre las claves oficiales
            Object.keys(newCatalog).forEach(key => {
              // Búsqueda exacta (case-insensitive) en los datos recibidos
              const exactKey = rawKeys.find(k => k.toUpperCase() === key.toUpperCase());

              if (exactKey && Array.isArray(rawCat[exactKey])) {
                newCatalog[key as keyof Catalog] = rawCat[exactKey]
                    .filter((v: any) => v && String(v).trim() !== "")
                    .map((v: any) => String(v).trim());
              }
            });
            localStorage.setItem('zubi_catalog', JSON.stringify(newCatalog));
            return newCatalog;
        });
      }

    } catch (error: any) {
      addLog(`🚨 Error: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  }, [sheetUrl]);

  useEffect(() => {
    if (!sheetUrl) return;
    const interval = setInterval(() => {
       if (!isSyncing) syncWithSheets();
    }, 15000);
    return () => clearInterval(interval);
  }, [sheetUrl, isSyncing, syncWithSheets]);

  const pushToSheets = async (action: 'upsert' | 'delete' | 'update_catalog', data: any) => {
    if (!sheetUrl) return;
    try {
      addLog(`📤 Enviando '${action}'...`);
      let payloadData = data;
      if (action === 'upsert' && data) {
          payloadData = { ...data };
          ['FECHA', 'FECHA_COMPRA', 'CON_FECHA'].forEach(field => {
             if (payloadData[field]) payloadData[field] = normalizeDate(payloadData[field]);
          });
      }

      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data: payloadData })
      });
      setTimeout(() => syncWithSheets(), 2500); 
    } catch (error: any) {
      addLog(`🚨 Error guardado: ${error.message}`);
    }
  };

  useEffect(() => { syncWithSheets(); }, [sheetUrl, syncWithSheets]);

  const stats = useMemo(() => ({
    total: inventory.length,
    laptops: inventory.filter(i => String(i.TIPO || '').toLowerCase().includes('pt_')).length,
    phones: inventory.filter(i => String(i.TIPO || '').toLowerCase().includes('mv_')).length,
    active: inventory.filter(i => ['alta', 'prestado', 'reserva', 'vigente', 'propiedad'].includes(String(i.ESTADO || '').toLowerCase())).length,
    value: inventory.reduce((acc, item) => {
      const val = parseFloat(String(item.COSTE || '').replace(/[^\d.-]/g, '').replace(',', '.') || '0');
      return acc + (isNaN(val) ? 0 : val);
    }, 0)
  }), [inventory]);

  const handleAddItem = async (newItem: InventoryItem) => {
    let updatedItem = { ...newItem };
    if (editingItem) {
      setInventory(prev => prev.map(item => item.ID === updatedItem.ID ? updatedItem : item));
      pendingEdits.current = [...pendingEdits.current.filter(i => i.ID !== updatedItem.ID), updatedItem];
      setEditingItem(null);
    } else {
      const nextId = inventory.length > 0 ? Math.max(...inventory.map(i => Number(i.ID) || 0)) + 1 : 1;
      updatedItem = { ...newItem, ID: nextId };
      setInventory(prev => [...prev, updatedItem]);
      pendingAdds.current = [...pendingAdds.current, updatedItem];
    }
    await pushToSheets('upsert', updatedItem);
    setView('inventory');
  };

  const handleDeleteItem = async (id: number) => {
    const itemToDelete = inventory.find(i => i.ID === id);
    if (itemToDelete && window.confirm(`¿Confirmas eliminar ${itemToDelete.CODIGO}?`)) {
      setInventory(prev => prev.filter(item => item.ID !== id));
      pendingDeletes.current.add(id);
      await pushToSheets('delete', itemToDelete);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      <aside className={`bg-slate-900 text-white transition-all duration-500 ${isSidebarOpen ? 'w-72' : 'w-24'} flex flex-col shrink-0 z-30 shadow-2xl`}>
        <div className="p-6 flex items-center gap-4 border-b border-white/5 h-20 bg-slate-950/50">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shrink-0"><Package size={22} className="text-white" /></div>
          {isSidebarOpen && <h1 className="font-black text-base tracking-widest uppercase truncate">Zubi<span className="text-blue-400 font-light tracking-normal">Cloud</span></h1>}
        </div>
        <nav className="flex-1 py-8 overflow-y-auto px-4 space-y-2 custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} expanded={isSidebarOpen} />
          <NavItem icon={<Database size={20} />} label="Inventario" active={view === 'inventory'} onClick={() => setView('inventory')} expanded={isSidebarOpen} />
          <NavItem icon={<PlusCircle size={20} />} label="Alta Registro" active={view === 'add'} onClick={() => { setEditingItem(null); setView('add'); }} expanded={isSidebarOpen} />
          <NavItem icon={<Library size={20} />} label="Catálogo" active={view === 'catalog'} onClick={() => setView('catalog')} expanded={isSidebarOpen} />
          <NavItem icon={<BarChart3 size={20} />} label="Auditoría" active={view === 'reports'} onClick={() => setView('reports')} expanded={isSidebarOpen} />
        </nav>
        <div className="p-6 border-t border-white/10 space-y-2 bg-slate-950/20">
          <NavItem icon={<Settings size={20} />} label="Ajustes" active={view === 'settings'} onClick={() => setView('settings')} expanded={isSidebarOpen} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><Menu size={20}/></button>
            <div className="flex flex-col">
              <h2 className="font-black text-slate-900 text-lg uppercase tracking-tight leading-none">
                {view === 'dashboard' && 'Control Operativo'}
                {view === 'inventory' && 'Inventario Maestro'}
                {view === 'add' && (editingItem ? `Editando #${editingItem.CODIGO}` : 'Nuevo Registro')}
                {view === 'reports' && 'Auditoría Visual'}
                {view === 'catalog' && 'Gestión de Catálogos'}
                {view === 'settings' && 'Conexión Cloud'}
              </h2>
              {lastSync && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sinc: {lastSync}</span>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {sheetUrl && (
              <button onClick={() => syncWithSheets()} disabled={isSyncing} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 transition-all font-black text-[10px] uppercase tracking-widest ${isSyncing ? 'text-slate-300' : 'text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm'}`}>
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Procesando...' : 'Refrescar'}
              </button>
            )}
            <button onClick={() => setIsAIChatOpen(true)} className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black hover:bg-blue-600 transition-all shadow-xl uppercase tracking-widest">
              <Bot size={18} /> Consultor IA
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 custom-scrollbar">
          {view === 'dashboard' ? <Dashboard stats={stats} inventory={inventory} setView={setView} /> :
           view === 'inventory' ? <InventoryList inventory={inventory} onEdit={(i) => { setEditingItem(i); setView('add'); }} onDelete={handleDeleteItem} /> :
           view === 'add' ? <InventoryForm onSubmit={handleAddItem} initialData={editingItem} catalog={catalog} onCancel={() => setView('inventory')} inventory={inventory} /> :
           view === 'reports' ? <Reports inventory={inventory} /> :
           view === 'catalog' ? <CatalogView catalog={catalog} onCatalogUpdate={(c) => { setCatalog(c); localStorage.setItem('zubi_catalog', JSON.stringify(c)); if (sheetUrl) pushToSheets('update_catalog', c); }} /> :
           view === 'settings' ? <SettingsView sheetUrl={sheetUrl} setSheetUrl={(u) => { setSheetUrl(u); localStorage.setItem('zubi_sheet_url', u); syncWithSheets(u); }} logs={syncLogs} /> : null}
        </div>
      </main>
      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} inventory={inventory} />
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 18px; height: 18px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; border: 5px solid transparent; background-clip: content-box; min-height: 100px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; border-width: 4px; }`}</style>
    </div>
  );
};

const NavItem: React.FC<any> = ({ icon, label, active, onClick, expanded }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    <div className="flex shrink-0 w-8 items-center justify-center">{icon}</div>
    {expanded && <span className="text-[10px] font-black uppercase tracking-widest truncate">{label}</span>}
  </button>
);

export default App;
