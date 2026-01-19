
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  BarChart3, 
  PlusCircle, 
  Settings, 
  Search, 
  Menu, 
  Package,
  Bot,
  UploadCloud,
  Cloud,
  CloudOff,
  RefreshCw
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
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('zubi_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  const [catalog, setCatalog] = useState<Catalog>(() => {
    const saved = localStorage.getItem('zubi_catalog');
    return saved ? JSON.parse(saved) : INITIAL_CATALOG;
  });
  const [sheetUrl, setSheetUrl] = useState<string>(() => localStorage.getItem('zubi_sheet_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Sincronización con Google Sheets (Lectura)
  const syncWithSheets = useCallback(async () => {
    if (!sheetUrl) return;
    setIsSyncing(true);
    try {
      const response = await fetch(sheetUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setInventory(data);
        setLastSync(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Error sync:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [sheetUrl]);

  // Sincronización con Google Sheets (Escritura)
  const pushToSheets = async (action: 'upsert' | 'delete', item: InventoryItem) => {
    if (!sheetUrl) return;
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors', // Necesario para Apps Script en algunos entornos
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data: item })
      });
      // Como usamos 'no-cors', no podemos leer la respuesta, pero el envío se realiza
    } catch (error) {
      console.error("Error pushing to sheets:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem('zubi_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('zubi_catalog', JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem('zubi_sheet_url', sheetUrl);
  }, [sheetUrl]);

  // Carga inicial desde la nube si hay URL
  useEffect(() => {
    if (sheetUrl) syncWithSheets();
  }, [sheetUrl, syncWithSheets]);

  const stats = useMemo(() => {
    return {
      total: inventory.length,
      laptops: inventory.filter(i => i.tipo.toLowerCase().includes('portatil')).length,
      phones: inventory.filter(i => i.tipo.toLowerCase().includes('móvil') || i.tipo.toLowerCase().includes('sim')).length,
      active: inventory.filter(i => ['alta', 'prestado', 'reserva'].includes(i.estado.toLowerCase())).length,
      value: inventory.reduce((acc, item) => {
        const valStr = item.coste?.replace(/[^\d.-]/g, '').replace(',', '.') || '0';
        const val = parseFloat(valStr);
        return acc + (isNaN(val) ? 0 : val);
      }, 0)
    };
  }, [inventory]);

  const handleAddItem = async (newItem: InventoryItem) => {
    let updatedItem = { ...newItem };
    if (editingItem) {
      setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
      setEditingItem(null);
    } else {
      const nextId = inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1;
      updatedItem = { ...newItem, id: nextId };
      setInventory(prev => [...prev, updatedItem]);
    }
    
    if (sheetUrl) await pushToSheets('upsert', updatedItem);
    setView('inventory');
  };

  const handleDeleteItem = async (id: number) => {
    const itemToDelete = inventory.find(i => i.id === id);
    if (itemToDelete && window.confirm('¿Eliminar este activo de la Web y la Hoja de Cálculo?')) {
      setInventory(prev => prev.filter(item => item.id !== id));
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
          <NavItem icon={<Database size={20} />} label="Activos" active={view === 'inventory'} onClick={() => setView('inventory')} expanded={isSidebarOpen} />
          <NavItem icon={<PlusCircle size={20} />} label="Nuevo" active={view === 'add'} onClick={() => { setEditingItem(null); setView('add'); }} expanded={isSidebarOpen} />
          <NavItem icon={<BarChart3 size={20} />} label="Informes" active={view === 'reports'} onClick={() => setView('reports')} expanded={isSidebarOpen} />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
          {sheetUrl && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${isSyncing ? 'animate-pulse text-blue-400' : 'text-emerald-400'}`}>
              {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <Cloud size={16} />}
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase">Nube Conectada</span>
                  {lastSync && <span className="text-[8px] text-slate-500">Sync: {lastSync}</span>}
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
            <h2 className="font-black text-slate-900 text-xl tracking-tight uppercase">{view}</h2>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={syncWithSheets} 
              disabled={!sheetUrl || isSyncing}
              className={`p-2.5 rounded-xl border-2 transition-all ${!sheetUrl ? 'hidden' : 'border-slate-100 text-slate-400 hover:border-blue-500 hover:text-blue-500'}`}
              title="Sincronizar ahora con Google Sheets"
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setIsAIChatOpen(true)} className="flex items-center gap-3 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-black transition-all shadow-xl shadow-blue-500/20">
              <Bot size={18} /> <span className="hidden xl:inline tracking-widest uppercase">Consultor IA</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
          {view === 'settings' ? (
            <SettingsView catalog={catalog} setCatalog={setCatalog} sheetUrl={sheetUrl} setSheetUrl={setSheetUrl} />
          ) : (
            view === 'dashboard' ? <Dashboard stats={stats} inventory={inventory} setView={setView} /> :
            view === 'inventory' ? <InventoryList inventory={inventory} onEdit={handleEdit} onDelete={handleDeleteItem} initialSearch={globalSearch} /> :
            view === 'add' ? <InventoryForm onSubmit={handleAddItem} initialData={editingItem} catalog={catalog} onCancel={() => { setEditingItem(null); setView('inventory'); }} /> :
            view === 'reports' ? <Reports inventory={inventory} /> : null
          )}
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
