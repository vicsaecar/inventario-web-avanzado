
import React, { useState } from 'react';
import { Catalog } from '../types';
import { Plus, X, Search, Layers, Building2, Store, MapPin, Tag, ShieldCheck, UserCog, Wifi, CreditCard } from 'lucide-react';

interface CatalogViewProps {
  catalog: Catalog;
  onUpdate: (newCatalog: Catalog) => void;
}

const CatalogView: React.FC<CatalogViewProps> = ({ catalog, onUpdate }) => {
  const [activeCategory, setActiveCategory] = useState<keyof Catalog>('empresas');
  const [newItem, setNewItem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories: { key: keyof Catalog; label: string; icon: React.ReactNode }[] = [
    { key: 'empresas', label: 'Empresas', icon: <Building2 size={16}/> },
    { key: 'tiendas', label: 'Proveedores', icon: <Store size={16}/> },
    { key: 'tipos', label: 'Tipos de Activo', icon: <Tag size={16}/> },
    { key: 'ubicaciones', label: 'Ubicaciones', icon: <MapPin size={16}/> },
    { key: 'estados', label: 'Estados Operativos', icon: <ShieldCheck size={16}/> },
    { key: 'companias', label: 'Compañías Tel.', icon: <Wifi size={16}/> },
    { key: 'dispositivos', label: 'Gamas Dispositivo', icon: <Layers size={16}/> },
    { key: 'creadores', label: 'Responsables', icon: <UserCog size={16}/> },
    { key: 'propiedades', label: 'Propiedad Legal', icon: <CreditCard size={16}/> }
  ];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    if (catalog[activeCategory].includes(newItem.trim())) {
      alert('Este elemento ya existe en el catálogo.');
      return;
    }
    const updated = { ...catalog, [activeCategory]: [...catalog[activeCategory], newItem.trim()] };
    onUpdate(updated);
    setNewItem('');
  };

  const handleRemoveItem = (item: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${item}" del catálogo maestro?`)) {
      const updated = { ...catalog, [activeCategory]: catalog[activeCategory].filter(i => i !== item) };
      onUpdate(updated);
    }
  };

  const filteredItems = catalog[activeCategory].filter(item => 
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar en el catálogo seleccionado..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
        {/* Selector de Categoría */}
        <div className="lg:col-span-1 space-y-2 bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm overflow-y-auto custom-scrollbar">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4 leading-none">Categorías de Datos</h3>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setSearchTerm(''); }}
              className={`w-full text-left px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${
                activeCategory === cat.key ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Lista de Elementos */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
             <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">
                   {categories.find(c => c.key === activeCategory)?.icon}
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{categories.find(c => c.key === activeCategory)?.label}</h2>
             </div>
             <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-4 py-2 rounded-full uppercase tracking-widest">{filteredItems.length} Elementos</span>
          </div>

          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
             <form onSubmit={handleAddItem} className="mb-8 flex gap-4">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder={`Nuevo elemento en ${activeCategory}...`}
                  className="flex-1 bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
                <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-700 transition-all shadow-xl flex items-center gap-3 active:scale-95">
                  <Plus size={18} /> Añadir
                </button>
             </form>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <div key={item} className="group bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all cursor-default">
                    <span className="text-xs font-black text-slate-700 truncate uppercase tracking-tight">{item}</span>
                    <button onClick={() => handleRemoveItem(item)} className="p-2 text-slate-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100 bg-white rounded-xl shadow-sm border border-slate-100">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                   <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                      <Layers className="text-slate-200" size={48} />
                      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No hay resultados para esta categoría</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogView;
