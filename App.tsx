
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  BarChart3, 
  PlusCircle, 
  Settings, 
  Search, 
  Menu, 
  X,
  Package,
  Bot,
  Bell
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('zubi_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('zubi_catalog', JSON.stringify(catalog));
  }, [catalog]);

  const stats = useMemo(() => {
    return {
      total: inventory.length,
      laptops: inventory.filter(i => i.tipo.toLowerCase().includes('portatil')).length,
      phones: inventory.filter(i => i.tipo.toLowerCase().includes('móvil') || i.tipo.toLowerCase().includes('sim')).length,
      active: inventory.filter(i => ['alta', 'prestado', 'reserva'].includes(i.estado.toLowerCase())).length,
      value: inventory.reduce((acc, item) => {
        const val = parseFloat(item.coste.replace(/[^\d.-]/g, '').replace(',', '.'));
        return acc + (isNaN(val) ? 0 : val);
      }, 0)
    };
  }, [inventory]);

  const handleAddItem = (newItem: InventoryItem) => {
    if (editingItem) {
      setInventory(prev => prev.map(item => item.id === newItem.id ? newItem : item));
      setEditingItem(null);
    } else {
      const nextId = inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1;
      setInventory(prev => [...prev, { ...newItem, id: nextId }]);
    }
    setView('inventory');
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm('¿Confirmas que deseas eliminar este activo permanentemente?')) {
      setInventory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setView('add');
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard stats={stats} inventory={inventory} setView={setView} />;
      case 'inventory':
        return <InventoryList inventory={inventory} onEdit={handleEdit} onDelete={handleDeleteItem} initialSearch={globalSearch} />;
      case 'add':
        return <InventoryForm onSubmit={handleAddItem} initialData={editingItem} catalog={catalog} onCancel={() => { setEditingItem(null); setView('inventory'); }} />;
      case 'reports':
        return <Reports inventory={inventory} />;
      case 'settings':
        return <SettingsView catalog={catalog} setCatalog={setCatalog} />;
      default:
        return <Dashboard stats={stats} inventory={inventory} setView={setView} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar Móvil/Desktop */}
      <aside className={`bg-slate-900 text-white transition-all duration-500 ${isSidebarOpen ? 'w-72' : 'w-24'} flex flex-col shrink-0 z-30 shadow-[10px_0_40px_rgba(0,0,0,0.1)]`}>
        <div className="p-6 flex items-center gap-4 border-b border-white/5 h-20">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20 shrink-0">
            <Package size={24} className="text-white" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
               <h1 className="font-black text-lg tracking-tight whitespace-nowrap">Zubi Inv <span className="text-blue-500">PRO</span></h1>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Advanced IT Control</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-10 overflow-y-auto px-4 space-y-2 custom-scrollbar">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Panel de Control" 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
            expanded={isSidebarOpen} 
          />
          <NavItem 
            icon={<Database size={20} />} 
            label="Inventario" 
            active={view === 'inventory'} 
            onClick={() => setView('inventory')} 
            expanded={isSidebarOpen} 
          />
          <NavItem 
            icon={<PlusCircle size={20} />} 
            label="Registrar Activo" 
            active={view === 'add'} 
            onClick={() => { setEditingItem(null); setView('add'); }} 
            expanded={isSidebarOpen} 
          />
          <NavItem 
            icon={<BarChart3 size={20} />} 
            label="Informes de Capital" 
            active={view === 'reports'} 
            onClick={() => setView('reports')} 
            expanded={isSidebarOpen} 
          />
        </nav>

        <div className="p-6 border-t border-white/5 bg-slate-900/50">
          <NavItem 
            icon={<Settings size={20} />} 
            label="Configuración" 
            active={view === 'settings'} 
            onClick={() => setView('settings')} 
            expanded={isSidebarOpen} 
          />
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full mt-6 flex items-center justify-center p-3 rounded-2xl hover:bg-slate-800 text-slate-500 transition-all hover:text-white border border-transparent hover:border-white/10"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-6">
             <div className="md:hidden">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><Menu size={20}/></button>
             </div>
            <h2 className="font-black text-slate-900 text-xl tracking-tight capitalize">
              {view === 'add' ? (editingItem ? 'Edición de Activo' : 'Nuevo Activo') : view === 'dashboard' ? 'Inicio' : view}
            </h2>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:block relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar en el ecosistema..." 
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (view !== 'inventory') setView('inventory');
                }}
                className="bg-slate-50 border-transparent border-2 focus:border-blue-600 focus:bg-white rounded-2xl pl-12 pr-6 py-2.5 text-sm w-80 transition-all outline-none font-bold text-slate-800 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <button 
                onClick={() => setIsAIChatOpen(true)}
                className="group relative flex items-center gap-3 bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-black hover:scale-105 transition-all shadow-xl shadow-blue-500/20"
              >
                <Bot size={18} />
                <span className="hidden xl:inline uppercase tracking-widest">Auditor IA</span>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>
              
              <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-2xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-4 ml-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 leading-none">Vicente Saez</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">IT Director</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-slate-100 flex items-center justify-center text-white font-black text-sm shadow-xl">
                  VS
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-50/50">
          {renderView()}
        </div>
      </main>

      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} inventory={inventory} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, expanded }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all relative group ${
      active 
        ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' 
        : 'text-slate-500 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className={`flex shrink-0 w-8 items-center justify-center ${active ? 'scale-110 transition-transform' : 'group-hover:scale-110 transition-transform'}`}>{icon}</div>
    {expanded && <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{label}</span>}
    {!expanded && active && (
      <div className="absolute left-0 w-1.5 h-8 bg-blue-600 rounded-r-full" />
    )}
  </button>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  expanded: boolean;
}

export default App;
