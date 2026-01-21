
import React, { useState, useMemo } from 'react';
import { Catalog } from '../types';
import { 
  Plus, X, Search, Building2, Store, Tag, MapPin, Layers, Wifi, UserCog, CreditCard,
  Activity, Package, Smartphone, ShieldCheck
} from 'lucide-react';

interface CatalogViewProps {
  catalog: Catalog;
  onCatalogUpdate: (newCatalog: Catalog) => void;
}

const CatalogView: React.FC<CatalogViewProps> = ({ catalog, onCatalogUpdate }) => {
  const [activeCategory, setActiveCategory] = useState<keyof Catalog>('PROVEEDOR');
  const [newItem, setNewItem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Definición estricta de las categorías permitidas según la hoja "catalogo"
  const categories: { key: keyof Catalog; label: string; icon: React.ReactNode }[] = [
    { key: 'PROVEEDOR', label: 'Proveedores', icon: <Store size={16}/> },
    { key: 'EMPRESA', label: 'Empresas', icon: <Building2 size={16}/> },
    { key: 'TIPO', label: 'Tipos de Activo', icon: <Tag size={16}/> },
    { key: 'DISPOSITIVO', label: 'Gamas Dispositivo', icon: <Layers size={16}/> },
    { key: 'UBICACION', label: 'Ubicaciones', icon: <MapPin size={16}/> },
    { key: 'PROPIEDAD', label: 'Propiedad Legal', icon: <CreditCard size={16}/> },
    { key: 'CIF', label: 'CIF EMPRESA', icon: <ShieldCheck size={16}/> },
    { key: 'ESTADO', label: 'Estados Operativos', icon: <Activity size={16}/> },
    { key: 'MATERIAL', label: 'Materiales', icon: <Package size={16}/> },
    { key: 'COMPAÑIA', label: 'Compañías Tel.', icon: <Wifi size={16}/> },
    { key: 'CREADO_POR', label: 'Responsables', icon: <UserCog size={16}/> },
    { key: 'BYOD', label: 'Política BYOD', icon: <Smartphone size={16}/> }
  ];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newItem.trim();
    if (!val) return;
    
    // Evitar duplicados (case insensitive)
    const currentList = catalog[activeCategory] || [];
    if (currentList.some(item => item.toLowerCase() === val.toLowerCase())) {
        alert("Este valor ya existe en la categoría.");
        return;
    }
    
    // Añadir y ORDENAR alfabéticamente inmediatamente (localeCompare maneja acentos y ñ)
    const updatedList = [...currentList, val].sort((a, b) => 
        a.localeCompare(b, 'es', { sensitivity: 'base' })
    );
    
    // Actualización segura del catálogo
    const updated = { ...catalog, [activeCategory]: updatedList };
    onCatalogUpdate(updated);
    setNewItem('');
  };

  const handleRemoveItem = (itemToRemove: string) => {
    if (window.confirm(`¿Eliminar "${itemToRemove}" de ${activeCategory}?`)) {
      const updated = { ...catalog, [activeCategory]: (catalog[activeCategory] || []).filter(item => item !== itemToRemove) };
      onCatalogUpdate(updated);
    }
  };

  const filteredItems = useMemo(() => {
    const items = catalog[activeCategory] || [];
    return items.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [catalog, activeCategory, searchTerm]);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[750px] max-h-[85vh]">
        {/* Sidebar de Categorías */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="p-8"><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categorías</h3></div>
          <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
            {categories.map((cat) => (
              <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setSearchTerm(''); }} className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${activeCategory === cat.key ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}>{cat.icon} {cat.label}</button>
            ))}
          </nav>
        </div>

        {/* Contenido de la Lista */}
        <div className="flex-1 overflow-y-auto p-10 bg-white custom-scrollbar">
          {/* AÑADIDO: key={activeCategory} para forzar remontaje y limpiar estado visual */}
          <div key={activeCategory} className="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">{categories.find(c => c.key === activeCategory)?.icon}</div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{categories.find(c => c.key === activeCategory)?.label}</h2>
              </div>
              <div className="relative">
                 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                 <input 
                   type="text" 
                   placeholder="Buscar..." 
                   value={searchTerm} 
                   onChange={(e) => setSearchTerm(e.target.value)} 
                   className="pl-10 pr-6 py-2.5 bg-slate-100 border-none rounded-full text-[10px] font-black uppercase focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none w-full sm:w-64 md:w-96" 
                 />
              </div>
            </div>

            <form onSubmit={handleAddItem} className="mb-8 flex gap-4">
              <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={`Añadir nuevo valor a ${activeCategory}...`} className="flex-1 bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all shadow-sm" />
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
        </div>
      </div>
    </div>
  );
};

export default CatalogView;
