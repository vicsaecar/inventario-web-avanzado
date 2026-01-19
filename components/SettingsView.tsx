
import React, { useState } from 'react';
import { Catalog } from '../types';
import { Plus, X, Save, RefreshCcw, Info } from 'lucide-react';

interface SettingsViewProps {
  catalog: Catalog;
  setCatalog: React.Dispatch<React.SetStateAction<Catalog>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ catalog, setCatalog }) => {
  const [activeCategory, setActiveCategory] = useState<keyof Catalog>('empresas');
  const [newItem, setNewItem] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    if (catalog[activeCategory].includes(newItem.trim())) {
      alert('Este elemento ya existe');
      return;
    }
    setCatalog(prev => ({
      ...prev,
      [activeCategory]: [...prev[activeCategory], newItem.trim()]
    }));
    setNewItem('');
  };

  const removeItem = (itemToRemove: string) => {
    setCatalog(prev => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter(item => item !== itemToRemove)
    }));
  };

  const categories: { key: keyof Catalog; label: string }[] = [
    { key: 'empresas', label: 'Empresas' },
    { key: 'tipos', label: 'Tipos de Activo' },
    { key: 'ubicaciones', label: 'Ubicaciones' },
    { key: 'estados', label: 'Estados' },
    { key: 'tiendas', label: 'Proveedores' },
    { key: 'materiales', label: 'Categorías Material' },
    { key: 'dispositivos', label: 'Categorías Dispositivo' }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Gestión de Catálogos</h3>
          <nav className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat.key ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{categories.find(c => c.key === activeCategory)?.label}</h2>
              <p className="text-slate-500 text-sm mt-1">Gestione los valores que aparecerán en los desplegables del inventario.</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-full text-blue-600">
              <RefreshCcw size={20} />
            </div>
          </div>

          <form onSubmit={handleAddItem} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={`Añadir nuevo valor a ${activeCategory}...`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <Plus size={18} /> Añadir
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {catalog[activeCategory].map((item) => (
              <div
                key={item}
                className="group bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-sm font-medium text-slate-700 truncate">{item}</span>
                <button
                  onClick={() => removeItem(item)}
                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {catalog[activeCategory].length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl">
              <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Info size={24} />
              </div>
              <p className="text-slate-400 font-medium">No hay elementos en esta categoría</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
