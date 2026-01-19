
import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { INITIAL_INVENTORY, CATALOG as INITIAL_CATALOG } from './constants';
import { InventoryItem, ViewType, Catalog } from './types';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import InventoryForm from './components/InventoryForm';
import Reports from './components/Reports';
import SettingsView from './components/SettingsView';
import AIChat from './components/AIChat';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [catalog, setCatalog] = useState<Catalog>(() => {
    const saved = localStorage.getItem('zubi_catalog');
    return saved ? JSON.parse(saved) : INITIAL_CATALOG;
  });
  const [sheetUrl, setSheetUrl] = useState<string>(() => localStorage.getItem('zubi_sheet_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const MASTER_COLUMNS = [
    'ID', 'CODIGO', 'EQUIPO', 'EMPRESA', 'DESCRIPCION', 'TIPO', 'PROPIEDAD', 'CIF', 
    'ASIGNADO', 'CORREO', 'ADM', 'FECHA', 'UBICACION', 'ESTADO', 'MATERIAL', 
    'BEFORE', 'BYOD', 'MODELO', 'SERIAL_NUMBER', 'CARACTERISTICAS', 'TIENDA', 
    'FECHA_COMPRA', 'FACTURA', 'COSTE', 'CREADO_POR', 'RESPONSABLE', 'DISPOSITIVO', 
    'TARJETA_SIM', 'CON_FECHA', 'COMPAÑIA', 'PIN', 'Nº_TELEFONO', 'PUK', 'TARIFA', 
    'IMEI_1', 'IMEI_2', 'CORREO_SSO', 'ETIQ'
  ];

  const normalizeKey = (s: string) => 
    String(s).toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

  const syncWithSheets = useCallback(async (forcedUrl?: string) => {
    const urlToUse = forcedUrl || sheetUrl;
    if (!urlToUse) {
      const savedInv = localStorage.getItem('zubi_inventory');
      if (savedInv) setInventory(JSON.parse(savedInv));
      return;
    }
    
    setIsSyncing(true);
    setSyncError(null);
    try {
      const response = await fetch(urlToUse, { method: 'GET', redirect: 'follow' });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const data = await response.json();
      console.log("Payload recibido:", data);

      // 1. EXTRAER INVENTARIO (Prioridad absoluta a la clave 'inventario')
      let rawInvData = data.inventario || data.inventory || (Array.isArray(data) ? data : null);
      
      if (rawInvData && Array.isArray(rawInvData)) {
        const processedInv = rawInvData.map((row: any, idx: number) => {
          const item: any = {};
          
          if (Array.isArray(row)) {
            // Si la fila tiene menos de 20 columnas, probablemente sea basura o del catálogo, la ignoramos
            if (row.length < 20) return null;
            
            MASTER_COLUMNS.forEach((col, colIdx) => {
              const val = row[colIdx];
              item[col] = (val === null || val === undefined) ? "" : String(val).trim();
            });
          } else if (typeof row === 'object') {
            // Si el objeto tiene muy pocas llaves, no es un registro de inventario
            if (Object.keys(row).length < 10) return null;

            MASTER_COLUMNS.forEach(col => {
              const targetNorm = normalizeKey(col);
              const foundKey = Object.keys(row).find(k => normalizeKey(k) === targetNorm);
              const val = foundKey ? row[foundKey] : row[col];
              item[col] = (val === null || val === undefined) ? "" : String(val).trim();
            });
          } else {
            return null;
          }
          
          const parsedId = parseInt(String(item.ID));
          item.ID = isNaN(parsedId) ? (idx + 1) : parsedId;
          return item as InventoryItem;
        }).filter(item => 
          item !== null && 
          item.CODIGO && 
          item.CODIGO.toLowerCase() !== "codigo" &&
          item.CODIGO.trim() !== ""
        );

        if (processedInv.length > 0) {
          setInventory(processedInv);
          localStorage.setItem('zubi_inventory', JSON.stringify(processedInv));
        }
      }

      // 2. EXTRAER CATÁLOGO (Clave 'catalogo')
      const rawCat = data.catalogo || data.catalog;
      if (rawCat && typeof rawCat === 'object' && !Array.isArray(rawCat)) {
        const newCatalog: Catalog = { ...catalog };
        let updated = false;
        Object.keys(newCatalog).forEach(key => {
          const sheetKey = Object.keys(rawCat).find(k => normalizeKey(k) === normalizeKey(key));
          const list = rawCat[sheetKey || key];
          if (Array.isArray(list)) {
            newCatalog[key as keyof Catalog] = list
              .filter((v: any) => v && String(v).trim() !== "" && String(v).toLowerCase() !== normalizeKey(key))
              .map(v => String(v).trim());
            updated = true;
          }
        });
        if (updated) {
          setCatalog(newCatalog);
          localStorage.setItem('zubi_catalog', JSON.stringify(newCatalog));
        }
      }

      setLastSync(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Sync Failure:", error);
      setSyncError("Error de sincronización");
      const saved = localStorage.getItem('zubi_inventory');
      if (saved) setInventory(JSON.parse(saved));
    } finally {
      setIsSyncing(false);
    }
  }, [sheetUrl, catalog]);

  const pushToSheets = async (action: 'upsert' | 'delete' | 'update_catalog', data: any) => {
    if (!sheetUrl) return;
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data })
      });
      setTimeout(() => syncWithSheets(), 3000); 
    } catch (error) {
      setSyncError("Error de guardado");
    }
  };

  useEffect(() => {
    syncWithSheets();
  }, [sheetUrl]);

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
      setEditingItem(null);
    } else {
      const nextId = inventory.length > 0 ? Math.max(...inventory.map(i => Number(i.ID) || 0)) + 1 : 1;
      updatedItem = { ...newItem, ID: nextId };
      setInventory(prev => [...prev, updatedItem]);
    }
    if (sheetUrl) await pushToSheets('upsert', updatedItem);
    setView('inventory');
  };

  const handleDeleteItem = async (id: number) => {
    const itemToDelete = inventory.find(i => i.ID === id);
    if (itemToDelete && window.confirm(`¿Confirmas eliminar ${itemToDelete.CODIGO}?`)) {
      setInventory(prev => prev.filter(item => item.ID !== id));
      if (sheetUrl) await pushToSheets('delete', itemToDelete);
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
                {view === 'settings' && 'Gestión Cloud'}
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
           view === 'add' ? <InventoryForm onSubmit={handleAddItem} initialData={editingItem} catalog={catalog} onCancel={() => setView('inventory')} /> :
           view === 'reports' ? <Reports inventory={inventory} /> :
           view === 'settings' ? <SettingsView catalog={catalog} setCatalog={setCatalog} sheetUrl={sheetUrl} setSheetUrl={(u) => { setSheetUrl(u); localStorage.setItem('zubi_sheet_url', u); syncWithSheets(u); }} onCatalogUpdate={(c) => { setCatalog(c); localStorage.setItem('zubi_catalog', JSON.stringify(c)); if (sheetUrl) pushToSheets('update_catalog', c); }} /> : null}
        </div>
      </main>
      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} inventory={inventory} />
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }`}</style>
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
