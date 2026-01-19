
import React, { useState } from 'react';
import { Catalog } from '../types';
import { Plus, X, RefreshCcw, Info, Cloud, Globe, ExternalLink, ShieldCheck } from 'lucide-react';

interface SettingsViewProps {
  catalog: Catalog;
  setCatalog: React.Dispatch<React.SetStateAction<Catalog>>;
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ catalog, setCatalog, sheetUrl, setSheetUrl }) => {
  const [activeCategory, setActiveCategory] = useState<keyof Catalog | 'cloud'>('empresas');
  const [newItem, setNewItem] = useState('');
  const [tempUrl, setTempUrl] = useState(sheetUrl);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCategory === 'cloud') return;
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
    if (activeCategory === 'cloud') return;
    setCatalog(prev => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter(item => item !== itemToRemove)
    }));
  };

  const handleSaveUrl = () => {
    setSheetUrl(tempUrl);
    alert('URL de sincronización guardada. La App se conectará con Google Sheets.');
  };

  const categories: { key: keyof Catalog | 'cloud'; label: string; icon?: React.ReactNode }[] = [
    { key: 'cloud', label: 'Conexión Sheets', icon: <Cloud size={16}/> },
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
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-6 flex flex-col">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Configuración Central</h3>
          <nav className="space-y-1.5 flex-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                  activeCategory === cat.key ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-white hover:text-slate-900'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </nav>
          <div className="mt-10 p-5 bg-blue-50 rounded-3xl border border-blue-100">
             <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Info size={14} />
                <span className="text-[9px] font-black uppercase">Nota de Sistema</span>
             </div>
             <p className="text-[10px] text-blue-900/60 font-bold leading-relaxed italic">
                Los cambios en los catálogos afectan a los desplegables de toda la aplicación.
             </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-10">
          {activeCategory === 'cloud' ? (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Sincronización Cloud</h2>
                  <p className="text-slate-500 text-sm mt-2 font-medium">Vincula tu inventario con Google Sheets mediante Apps Script.</p>
               </div>

               <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-6 shadow-2xl">
                  <div className="flex items-center gap-4">
                     <div className="bg-blue-600 p-3 rounded-2xl"><Globe size={24}/></div>
                     <div>
                        <h4 className="font-black text-sm uppercase tracking-widest">URL de la Aplicación Web</h4>
                        <p className="text-white/40 text-[10px] uppercase font-bold mt-1">Implementación de Apps Script</p>
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                     <input 
                        type="text" 
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="w-full bg-white/10 border-2 border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-blue-400 focus:border-blue-500 outline-none transition-all placeholder:text-white/20"
                     />
                     <button 
                        onClick={handleSaveUrl}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                     >
                        <ShieldCheck size={18}/> Activar Conexión en la Nube
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white border-2 border-slate-100 rounded-3xl">
                     <h5 className="font-black text-xs text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <ExternalLink size={14} className="text-blue-500"/> ¿Cómo obtener la URL?
                     </h5>
                     <ol className="text-[11px] text-slate-500 space-y-2 font-bold leading-relaxed">
                        <li>1. Abre tu Google Sheet.</li>
                        <li>2. Ve a Extensiones {'>'} Apps Script.</li>
                        <li>3. Pega el código de sincronización.</li>
                        <li>4. Implementar {'>'} Nueva implementación.</li>
                        <li>5. Tipo: Aplicación Web.</li>
                        <li>6. Acceso: "Cualquiera".</li>
                     </ol>
                  </div>
                  <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex flex-col justify-center">
                     <h5 className="font-black text-xs text-emerald-900 uppercase tracking-widest mb-2">Estado de Datos</h5>
                     <p className="text-[11px] text-emerald-900/60 font-bold leading-relaxed">
                        Cuando la URL está activa, los cambios se guardan tanto en este navegador como en tu hoja de Google Sheets automáticamente.
                     </p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{categories.find(c => c.key === activeCategory)?.label}</h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">Gestiona los valores dinámicos del catálogo maestro.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-400">
                  <RefreshCcw size={20} />
                </div>
              </div>

              <form onSubmit={handleAddItem} className="mb-8">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={`Nuevo valor para ${activeCategory}...`}
                    className="flex-1 bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl flex items-center gap-3"
                  >
                    <Plus size={18} /> Añadir
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(catalog[activeCategory as keyof Catalog] || []).map((item) => (
                  <div
                    key={item}
                    className="group bg-white border-2 border-slate-50 p-4 rounded-2xl flex items-center justify-between hover:border-blue-100 hover:bg-blue-50/20 transition-all"
                  >
                    <span className="text-xs font-black text-slate-700 truncate uppercase tracking-tight">{item}</span>
                    <button
                      onClick={() => removeItem(item)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {catalog[activeCategory as keyof Catalog]?.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <div className="bg-white w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200 shadow-sm">
                    <Info size={32} />
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Sin elementos configurados</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
