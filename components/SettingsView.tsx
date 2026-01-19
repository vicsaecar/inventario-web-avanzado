
import React, { useState } from 'react';
import { Catalog } from '../types';
import { 
  Plus, X, Info, Cloud, Globe, ExternalLink, ShieldCheck, 
  Building2, Store, Tag, MapPin, Layers, Wifi, UserCog, CreditCard, Search,
  Activity, Package, Smartphone, Trash2, RefreshCcw
} from 'lucide-react';

interface SettingsViewProps {
  catalog: Catalog;
  setCatalog: React.Dispatch<React.SetStateAction<Catalog>>;
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  onCatalogUpdate: (newCatalog: Catalog) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ catalog, setCatalog, sheetUrl, setSheetUrl, onCatalogUpdate }) => {
  const [activeCategory, setActiveCategory] = useState<keyof Catalog | 'cloud'>('cloud');
  const [newItem, setNewItem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tempUrl, setTempUrl] = useState(sheetUrl);

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
    if (activeCategory === 'cloud') return;
    if (!newItem.trim()) return;
    if (catalog[activeCategory].includes(newItem.trim())) {
      alert('Elemento duplicado');
      return;
    }
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

  const handleSaveUrl = () => {
    setSheetUrl(tempUrl);
    alert('Endpoint guardado. Intentando sincronizar...');
  };

  const handleClearCache = () => {
    if (window.confirm("ATENCIÓN: Se borrarán los datos locales y se forzará una descarga limpia desde el Cloud. ¿Continuar?")) {
      localStorage.removeItem('zubi_inventory');
      localStorage.removeItem('zubi_catalog');
      window.location.reload();
    }
  };

  const filteredItems = activeCategory === 'cloud' ? [] : (catalog[activeCategory as keyof Catalog] || []).filter(item => 
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row h-[750px]">
        {/* Sidebar de Ajustes */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col">
          <div className="p-8 pb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuración Central</h3>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setSearchTerm(''); }}
                className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${
                  activeCategory === cat.key ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-white hover:text-slate-900'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </nav>
          {/* Zona de Acción Inferior Fija */}
          <div className="p-6 border-t border-slate-200 bg-white">
             <button 
                onClick={handleClearCache}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all border border-rose-100"
             >
                <Trash2 size={16} /> Limpiar Cache Local
             </button>
          </div>
        </div>

        {/* Área de Contenido Principal */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {activeCategory === 'cloud' ? (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-6">
                    <div className="bg-blue-600 p-4 rounded-3xl shadow-xl text-white">
                      <Cloud size={32}/>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Cloud Sync</h2>
                      <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Enlace con Google Apps Script</p>
                    </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Globe size={150} />
                    </div>
                    <div className="relative z-10">
                      <h4 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400 mb-4">URL de Implementación</h4>
                      <input 
                          type="text" 
                          value={tempUrl}
                          onChange={(e) => setTempUrl(e.target.value)}
                          placeholder="https://script.google.com/macros/s/.../exec"
                          className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-blue-400 focus:border-blue-500 focus:bg-white/10 outline-none transition-all"
                      />
                      <button 
                          onClick={handleSaveUrl}
                          className="mt-6 w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl"
                      >
                          <ShieldCheck size={20}/> Conectar con Google Sheets
                      </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <h5 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                      <Info size={16}/> Protocolo de Lectura
                    </h5>
                    <ul className="text-xs text-slate-600 space-y-4 font-bold">
                      <li className="flex gap-4 items-start"><span className="text-blue-600">A.</span> La pestaña de inventario debe contener 38 columnas.</li>
                      <li className="flex gap-4 items-start"><span className="text-blue-600">B.</span> El ID debe ser la primera columna (Columna A).</li>
                      <li className="flex gap-4 items-start"><span className="text-blue-600">C.</span> Configure permisos en GAS como "Anyone".</li>
                    </ul>
                  </div>
                  <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 flex flex-col justify-center">
                    <p className="text-blue-900/60 text-xs font-bold leading-relaxed italic">
                      "Sistema optimizado para el mapeo dinámico de cabeceras de Google Sheets, ignorando caracteres especiales y mayúsculas."
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">
                      {categories.find(c => c.key === activeCategory)?.icon}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{categories.find(c => c.key === activeCategory)?.label}</h2>
                  </div>
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                        type="text" 
                        placeholder="Filtrar..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-6 py-2.5 bg-slate-100 border-none rounded-full text-[10px] font-black uppercase focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <form onSubmit={handleAddItem} className="mb-8 flex gap-4">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={`Nueva opción para ${categories.find(c => c.key === activeCategory)?.label}...`}
                    className="flex-1 bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all shadow-sm"
                  />
                  <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 transition-all shadow-xl flex items-center gap-3 active:scale-95">
                    <Plus size={18} /> Añadir
                  </button>
                </form>

                <div className="flex-1 pb-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                      <div key={item} className="group bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all">
                        <span className="text-[11px] font-black text-slate-700 truncate uppercase tracking-tight">{item}</span>
                        <button onClick={() => handleRemoveItem(item)} className="p-2 text-slate-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100 bg-white rounded-xl shadow-sm border border-slate-100">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="col-span-full py-24 text-center flex flex-col items-center gap-4">
                          <Layers className="text-slate-200" size={48} />
                          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Categoría sin elementos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
