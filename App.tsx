
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

  // Sincronización robusta: Prioriza datos remotos y valida tipos
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
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const data = await response.json();
      if (Array.isArray(data)) {
        // Asegurar que el ID sea numérico para evitar desorden
        const processedData = data.map(item => ({
          ...item,
          ID: Number(item.ID) || 0
        }));
        
        setInventory(processedData);
        localStorage.setItem('zubi_inventory', JSON.stringify(processedData));
        setLastSync(new Date().toLocaleTimeString());
      } else {
        throw new Error("Invalid Data Format");
      }
    } catch (error) {
      console.error("Sync Error:", error);
      setSyncError("Fallo de conexión Cloud");
      // Cargar cache si falla internet
      const saved = localStorage.getItem('zubi_inventory');
      if (saved) setInventory(JSON.parse(saved));
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
      // Delay de seguridad para propagación de cambios en Google Servers
      setTimeout(syncWithSheets, 2500); 
    } catch (error) {
      console.error("Push Error:", error);
      setSyncError("Error al enviar datos");
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
        const valStr = item.COSTE?.toString().replace(/[^\d.-]/g, '').replace(',', '.') || '0';
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
    if (itemToDelete && window.confirm(`¿Seguro que deseas eliminar permanentemente el activo #${id} del Cloud?`)) {
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
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} expanded={isSidebarOpen} />
          <NavItem icon={<Database size={20} />} label="Activos" active={view === 'inventory'} onClick={() => setView('inventory')} expanded={isSidebarOpen} />
          <NavItem icon={<PlusCircle size={20} />} label="Nuevo Registro" active={view === 'add'} onClick={() => { setEditingItem(null); setView('add'); }} expanded={isSidebarOpen} />
          <NavItem icon={<BarChart3 size={20} />} label="Informes" active={view === 'reports'} onClick={() => setView('reports')} expanded={isSidebarOpen} />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
          {sheetUrl && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${isSyncing ? 'bg-blue-500/10 text-blue-400' : syncError ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <div className="relative">
                {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <Cloud size={16} />}
                {syncError && <AlertCircle className="absolute -top-1 -right-1 text-rose-500" size={10} />}
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-black uppercase truncate">{isSyncing ? 'Sincronizando...' : syncError ? 'Error Cloud' : 'Cloud Online'}</span>
                  {lastSync && !syncError && <span className="text-[8px] text-slate-500 font-bold">{lastSync}</span>}
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
            <h2 className="font-black text-slate-900 text-xl tracking-tight uppercase leading-none">
              {view === 'dashboard' && 'Dashboard Principal'}
              {view === 'inventory' && 'Inventario de Activos'}
              {view === 'add' && (editingItem ? `Editando Activo #${editingItem.ID}` : 'Nuevo Registro Maestro')}
              {view === 'reports' && 'Análisis de Capital'}
              {view === 'settings' && 'Configuración de Sistema'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {sheetUrl && (
              <button 
                onClick={syncWithSheets} 
                disabled={isSyncing} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${isSyncing ? 'border-slate-100 text-slate-300' : 'border-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm'}`}
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} /> 
                {isSyncing ? 'Actualizando' : 'Sincronizar'}
              </button>
            )}
            <button onClick={() => setIsAIChatOpen(true)} className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest">
              <Bot size={18} /> Consultor IA
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 custom-scrollbar">
          {view === 'settings' ? <SettingsView catalog={catalog} setCatalog={setCatalog} sheetUrl={sheetUrl} setSheetUrl={setSheetUrl} /> :
            view === 'dashboard' ? <Dashboard stats={stats} inventory={inventory} setView={setView} /> :
            view === 'inventory' ? <InventoryList inventory={inventory} onEdit={handleEdit} onDelete={handleDeleteItem} /> :
            view === 'add' ? <InventoryForm onSubmit={handleAddItem} initialData={editingItem} catalog={catalog} onCancel={() => setView('inventory')} /> :
            view === 'reports' ? <Reports inventory={inventory} /> : null}
        </div>
      </main>

      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} inventory={inventory} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

const NavItem: React.FC<any> = ({ icon, label, active, onClick, expanded }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
    <div className="flex shrink-0 w-8 items-center justify-center">{icon}</div>
    {expanded && <span className="text-[10px] font-black uppercase tracking-widest truncate">{label}</span>}
  </button>
);

export default App;
