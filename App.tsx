
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
  Bell,
  UploadCloud
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
        const valStr = item.coste?.replace(/[^\d.-]/g, '').replace(',', '.') || '0';
        const val = parseFloat(valStr);
        return acc + (isNaN(val) ? 0 : val);
      }, 0)
    };
  }, [inventory]);

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim().toUpperCase());
      const newItems: InventoryItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Manejo básico de comas dentro de comillas si fuera necesario, pero asumiendo CSV simple
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const item: any = {};
        
        headers.forEach((header, index) => {
          const val = values[index]?.replace(/^"|"$/g, '').trim() || '';
          
          // Mapeo manual basado en las cabeceras del usuario
          switch(header) {
            case 'ID': item.id = parseInt(val) || i; break;
            case 'CODIGO': item.codigo = val; break;
            case 'EQUIPO': item.equipo = val; break;
            case 'EMPRESA': item.empresa = val; break;
            case 'DESCRIPCION': item.descripcion = val; break;
            case 'TIPO': item.tipo = val; break;
            case 'PROPIEDAD': item.propiedad = val; break;
            case 'CIF': item.cif = val; break;
            case 'ASIGNADO': item.asignado = val; break;
            case 'CORREO': item.correo = val; break;
            case 'ADM': item.adm = val; break;
            case 'FECHA': item.fecha = val; break;
            case 'UBICACION': item.ubicacion = val; break;
            case 'ESTADO': item.estado = val; break;
            case 'MATERIAL': item.material = val; break;
            case 'BEFORE': item.before = val; break;
            case 'BYOD': item.byod = val; break;
            case 'MODELO': item.modelo = val; break;
            case 'SERIAL NUMBER': item.serialNumber = val; break;
            case 'CARACTERISTICAS': item.caracteristicas = val; break;
            case 'TIENDA': item.tienda = val; break;
            case 'FECHA COMPRA': item.fechaCompra = val; break;
            case 'FACTURA': item.factura = val; break;
            case 'COSTE': item.coste = val; break;
            case 'CREADO POR': item.creadoPor = val; break;
            case 'RESPONSABLE': item.responsable = val; break;
            case 'DISPOSITIVO': item.dispositivo = val; break;
            case 'TARJETA SIM': item.tarjetaSim = val; break;
            case 'CON FECHA': item.conFecha = val; break;
            case 'COMPAÑIA': item.compania = val; break;
            case 'PIN': item.pin = val; break;
            case 'Nº TELEFONO': item.numeroTelefono = val; break;
            case 'PUK': item.puk = val; break;
            case 'TARIFA': item.tarifa = val; break;
            case 'IMEI 1': item.imei1 = val; break;
            case 'IMEI 2': item.imei2 = val; break;
            case 'CORREO_SSO': item.correoSso = val; break;
            case 'ETIQ': item.etiq = val; break;
          }
        });
        if (item.codigo || item.equipo) newItems.push(item as InventoryItem);
      }

      if (newItems.length > 0) {
        setInventory(newItems);
        // Actualizar catálogos automáticamente con los valores importados
        const updateCatalog = (key: keyof Catalog, field: keyof InventoryItem) => {
          const uniqueValues = Array.from(new Set(newItems.map(item => String(item[field] || '')).filter(v => v !== '')));
          setCatalog(prev => ({
            ...prev,
            [key]: Array.from(new Set([...prev[key], ...uniqueValues]))
          }));
        };

        updateCatalog('empresas', 'empresa');
        updateCatalog('ubicaciones', 'ubicacion');
        updateCatalog('tipos', 'tipo');
        updateCatalog('tiendas', 'tienda');
        
        alert(`¡Éxito! Se han importado ${newItems.length} registros.`);
        setView('inventory');
      }
    };
    reader.readAsText(file);
  };

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
      <aside className={`bg-slate-900 text-white transition-all duration-500 ${isSidebarOpen ? 'w-72' : 'w-24'} flex flex-col shrink-0 z-30 shadow-2xl`}>
        <div className="p-6 flex items-center gap-4 border-b border-white/5 h-20">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-xl shrink-0">
            <Package size={24} className="text-white" />
          </div>
          {isSidebarOpen && <h1 className="font-black text-lg tracking-tight uppercase">Zubi <span className="text-blue-500">Inventory</span></h1>}
        </div>

        <nav className="flex-1 py-10 overflow-y-auto px-4 space-y-2 custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={20} />} label="Panel" active={view === 'dashboard'} onClick={() => setView('dashboard')} expanded={isSidebarOpen} />
          <NavItem icon={<Database size={20} />} label="Activos" active={view === 'inventory'} onClick={() => setView('inventory')} expanded={isSidebarOpen} />
          <NavItem icon={<PlusCircle size={20} />} label="Nuevo" active={view === 'add'} onClick={() => { setEditingItem(null); setView('add'); }} expanded={isSidebarOpen} />
          <NavItem icon={<BarChart3 size={20} />} label="Informes" active={view === 'reports'} onClick={() => setView('reports')} expanded={isSidebarOpen} />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <label className="flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer hover:bg-slate-800 text-slate-400 hover:text-white transition-all group">
            <UploadCloud size={20} className="group-hover:scale-110 transition-transform" />
            {isSidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Importar CSV</span>}
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
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
            <div className="hidden lg:block relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={18} />
              <input 
                type="text" placeholder="Búsqueda global..." value={globalSearch}
                onChange={(e) => { setGlobalSearch(e.target.value); if (view !== 'inventory') setView('inventory'); }}
                className="bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl pl-12 pr-6 py-2.5 text-sm w-64 transition-all outline-none font-bold"
              />
            </div>
            <button onClick={() => setIsAIChatOpen(true)} className="flex items-center gap-3 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-black transition-all shadow-xl shadow-blue-500/20">
              <Bot size={18} /> <span className="hidden xl:inline tracking-widest uppercase">Consultor IA</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
          {renderView()}
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
