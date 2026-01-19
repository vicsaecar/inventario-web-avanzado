
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
  Cloud,
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

  // Sincronización robusta: Prioriza datos remotos
  const syncWithSheets = useCallback(async () => {
    if (!sheetUrl) {
      const saved = localStorage.getItem('zubi_inventory');
      setInventory(saved ? JSON.parse(saved) : INITIAL_INVENTORY);
      return;
    }
    setIsSyncing(true);
    setSyncError(null);
    try {
      const response = await fetch(sheetUrl, { method: 'GET', redirect: 'follow' });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setInventory(data);
        localStorage.setItem('zubi_inventory', JSON.stringify(data));
        setLastSync(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Sync Error:", error);
      setSyncError("Cloud Sync Failed");
      const saved = localStorage.getItem('zubi_inventory');
      setInventory(saved ? JSON.parse(saved) : INITIAL_INVENTORY);
    } finally {
      setIsSyncing(false);
    }
  }, [sheetUrl]);

  const pushToSheets = async (action: 'upsert' | 'delete', item: InventoryItem) => {
    if (!sheetUrl) return;
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data: item })
      });
      // Delay corto para asegurar que Google Sheets haya procesado antes de refrescar
      setTimeout(syncWithSheets, 2000); 
    } catch (error) {
      console.error("Push Error:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem('zubi_catalog', JSON.stringify(catalog));
    localStorage.setItem('zubi_sheet_url', sheetUrl);
  }, [catalog, sheetUrl]);

  useEffect(() => {
    syncWithSheets();
  }, [sheetUrl, syncWithSheets]);

  const stats = useMemo(() => {
    return {
      total: inventory.length,
      laptops: inventory.filter(i => i.TIPO?.toLowerCase().includes('portatil')).length,
      phones: inventory.filter(i => i.TIPO?.toLowerCase().includes('móvil') || i.TIPO?.toLowerCase().includes('sim')).length,
      active: inventory.filter(i => ['alta', 'prestado', 'reserva'].includes(i.ESTADO?.toLowerCase())).length,
      value: inventory.reduce((acc, item) => {
        const valStr = item.COSTE?.replace(/[^\d.-]/g, '').replace(',', '.') || '0';
        const val = parseFloat(valStr);
        return acc + (isNaN(val) ? 0 : val);
      }, 0)
    };
  }, [inventory]);

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
    if (itemToDelete && window.confirm('¿Borrar registro permanentemente en Cloud?')) {
      setInventory(prev => prev.filter(item => item.ID !== id));
      if (sheetUrl) await pushToSheets('delete', itemToDelete);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setView('add');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <aside className={`bg-slate-900 text-white transition-all duration-500 ${isSidebarOpen ? 'w-72' : 'w-24'} flex flex-col shrink-0 z-30 shadow-2xl`}>
        <div className="p-6 flex items-center gap-4 border-b border-white/5 h-20">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-xl shrink-0">
            <Package size={24} className="text-white" />
          </div>
          {isSidebarOpen && <h1 className="font-black text-lg tracking-tight uppercase">Zubi <span className="text-blue-500">Sync</span></h1>}
        </div>

        <nav className="flex-1 py-10 overflow-y-auto px-4 space-y-2 custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={20} />} label="Panel" active={view === 'dashboard'} onClick={() => setView('dashboard')} expanded={isSidebarOpen} />
          <NavItem icon={<Database size={20} />} label="Inventario" active={view === 'inventory'} onClick={() => setView('inventory')} expanded={isSidebarOpen} />
          <NavItem icon={<PlusCircle size={20} />} label="Añadir" active={view === 'add'} onClick={() => { setEditingItem(null); setView('add'); }} expanded={isSidebarOpen} />
          <NavItem icon={<BarChart3 size={20} />} label="Informes" active={view === 'reports'} onClick={() => setView('reports')} expanded={isSidebarOpen} />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
          {sheetUrl && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${isSyncing ? 'animate-pulse text-blue-400' : syncError ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : syncError ? <AlertCircle size={16} /> : <Cloud size={16} />}
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase">{syncError ? 'Cloud Error' : 'Google Sync'}</span>
                  {lastSync && !syncError && <span className="text-[8px] text-slate-500">Last: {lastSync}</span>}
                </div>
              )}
            </div>
          )}
          <NavItem icon={<Settings size={20} />} label="Ajustes" active={view === 'settings'} onClick={() => setView('settings')} expanded={isSidebarOpen} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-20">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><Menu size={20}/></button>
            <h2 className="font-black text-slate-900 text-xl tracking-tight uppercase">{view === 'add' ? (editingItem ? 'Editar Activo' : 'Nuevo Activo') : view}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={syncWithSheets} disabled={!sheetUrl || isSyncing} className={`p-2.5 rounded-xl border-2 transition-all ${!sheetUrl ? 'hidden' : 'border-slate-100 text-slate-400 hover:border-blue-500 hover:text-blue-500'}`}>
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setIsAIChatOpen(true)} className="flex items-center gap-3 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-black transition-all shadow-xl shadow-blue-500/20">
              <Bot size={18} /> <span className="hidden xl:inline tracking-widest uppercase">Consultor IA</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
          {view === 'settings' ? <SettingsView catalog={catalog} setCatalog={setCatalog} sheetUrl={sheetUrl} setSheetUrl={setSheetUrl} /> :
            view === 'dashboard' ? <Dashboard stats={stats} inventory={inventory} setView={setView} /> :
            view === 'inventory' ? <InventoryList inventory={inventory} onEdit={handleEdit} onDelete={handleDeleteItem} /> :
            view === 'add' ? <InventoryForm onSubmit={handleAddItem} initialData={editingItem} catalog={catalog} onCancel={() => setView('inventory')} /> :
            view === 'reports' ? <Reports inventory={inventory} /> : null}
        </div>
      </main>

      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} inventory={inventory} />
    </div>
  );
};

const NavItem: React.FC<any> = ({ icon, label, active, onClick, expanded }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
    <div className="flex shrink-0 w-8 items-center justify-center">{icon}</div>
    {expanded && <span className="text-xs font-black uppercase tracking-widest">{label}</span>}
  </button>
);

export default App;
