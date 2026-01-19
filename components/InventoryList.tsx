
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  FileSpreadsheet,
  Monitor,
  Cpu,
  Smartphone,
  Search,
  Eye,
  X,
  Calendar,
  User,
  MapPin,
  Tag,
  CreditCard,
  Hash,
  Info,
  Building,
  History,
  ShieldCheck
} from 'lucide-react';
import { InventoryItem } from '../types';
import { CATALOG } from '../constants';

interface InventoryListProps {
  inventory: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
  initialSearch?: string;
}

const InventoryList: React.FC<InventoryListProps> = ({ inventory, onEdit, onDelete, initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const filteredData = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = 
        item.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.asignado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'All' || item.tipo === typeFilter;
      const matchesStatus = statusFilter === 'All' || item.estado === statusFilter;
      const matchesCompany = companyFilter === 'All' || item.empresa === companyFilter;

      return matchesSearch && matchesType && matchesStatus && matchesCompany;
    });
  }, [inventory, searchTerm, typeFilter, statusFilter, companyFilter]);

  const getIcon = (tipo: string) => {
    const t = tipo.toLowerCase();
    if (t.includes('portatil') || t.includes('pc')) return <Monitor size={18} className="text-blue-500" />;
    if (t.includes('móvil') || t.includes('phone') || t.includes('sim')) return <Smartphone size={18} className="text-purple-500" />;
    return <Cpu size={18} className="text-slate-400" />;
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    const headers = Object.keys(filteredData[0]).join(',');
    const rows = filteredData.map(item => Object.values(item).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zubi_inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative h-full flex flex-col space-y-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="p-6 border-b border-slate-100 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[300px] relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por equipo, código, serial o responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-slate-50 border-transparent border-2 focus:border-blue-500 focus:bg-white rounded-2xl text-sm transition-all outline-none font-medium"
              />
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all bg-white"
              >
                <Download size={18} /> Exportar CSV
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest mr-2">
              <Filter size={14} />
              <span>Filtros:</span>
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="filter-select">
              <option value="All">Tipos</option>
              {CATALOG.tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
              <option value="All">Estados</option>
              {CATALOG.estados.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="filter-select">
              <option value="All">Empresas</option>
              {CATALOG.empresas.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            
            <div className="ml-auto flex items-center gap-2">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                  {filteredData.length} Activos
               </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md text-slate-500 text-[10px] uppercase font-black tracking-widest z-10 shadow-sm">
              <tr>
                <th className="px-8 py-5 border-b border-slate-100">Código & Activo</th>
                <th className="px-8 py-5 border-b border-slate-100">Empresa / Propiedad</th>
                <th className="px-8 py-5 border-b border-slate-100">Responsable</th>
                <th className="px-8 py-5 border-b border-slate-100">Estado</th>
                <th className="px-8 py-5 border-b border-slate-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredData.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-blue-50/50 transition-all group cursor-pointer ${selectedItem?.id === item.id ? 'bg-blue-50/80' : ''}`} 
                  onClick={() => setSelectedItem(item)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                      <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        {getIcon(item.tipo)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.equipo}
                        </div>
                        <div className="text-[10px] text-blue-600 font-black tracking-tighter mt-0.5 bg-blue-100/30 w-fit px-2 rounded-md uppercase border border-blue-100">
                          {item.codigo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-slate-800 font-bold">{item.empresa}</span>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">{item.propiedad}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-slate-900 font-bold">{item.asignado}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1 truncate max-w-[180px]">{item.correo || item.ubicacion}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                      item.estado.toLowerCase() === 'alta' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      item.estado.toLowerCase() === 'prestado' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      item.estado.toLowerCase() === 'baja' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }} 
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Sidebar Overlay - PRO VERSION */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setSelectedItem(null)}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-[-20px_0_60px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-slate-100">
            {/* Sidebar Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
               <div className="flex items-center gap-5">
                 <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-3xl shadow-xl shadow-blue-500/30">
                    {React.cloneElement(getIcon(selectedItem.tipo) as React.ReactElement, { size: 28, className: 'text-white' })}
                 </div>
                 <div>
                   <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                     <ShieldCheck size={12} /> Activo Auditado
                   </p>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{selectedItem.equipo}</h3>
                 </div>
               </div>
               <button onClick={() => setSelectedItem(null)} className="p-3 hover:bg-white hover:shadow-sm rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100 active:scale-90">
                 <X size={24} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              {/* Badges Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DetailBadge label="ID Interno" value={selectedItem.codigo} icon={<Hash size={14}/>} />
                <DetailBadge label="Estatus" value={selectedItem.estado} color="blue" />
                <DetailBadge label="Categoría" value={selectedItem.tipo} icon={<Tag size={14}/>} />
                <DetailBadge label="Ubicación" value={selectedItem.ubicacion} icon={<MapPin size={14}/>} />
              </div>

              {/* Assignment Card */}
              <div className="space-y-6">
                <SectionTitle icon={<User size={18} />} title="Responsable de Activo" />
                <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
                   <div className="absolute -right-8 -bottom-8 text-slate-50 opacity-10">
                      <User size={160} />
                   </div>
                   <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                      <DetailRow label="Nombre Completo" value={selectedItem.asignado} />
                      <DetailRow label="Correo SSO" value={selectedItem.correo || 'Pendiente'} />
                      <DetailRow label="Empresa Legal" value={selectedItem.empresa} />
                      <DetailRow label="Fecha Asignación" value={selectedItem.fecha || 'N/A'} icon={<Calendar size={14}/>} />
                   </div>
                </div>
              </div>

              {/* Hardware Specifications */}
              <div className="space-y-6">
                <SectionTitle icon={<Info size={18} />} title="Especificaciones Técnicas" />
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DetailRow label="Modelo Fabricante" value={selectedItem.modelo || 'Genérico'} />
                    <DetailRow label="Número de Serie" value={selectedItem.serialNumber || 'N/A'} emphasis />
                  </div>
                  <div className="pt-6 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Hoja de Características</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                      {selectedItem.caracteristicas || 'Sin descripción técnica detallada.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <DetailRow label="Inversión" value={selectedItem.coste} emphasis color="blue" />
                    <DetailRow label="Canal Adquisición" value={selectedItem.tienda} />
                  </div>
                </div>
              </div>

              {/* Connectivity - Only for Mobiles/SimCards */}
              {(selectedItem.tipo.toLowerCase().includes('móvil') || selectedItem.tipo.toLowerCase().includes('sim')) && (
                <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                  <SectionTitle icon={<CreditCard size={18} />} title="Red y Conectividad" />
                  <div className="bg-slate-900 text-white p-10 rounded-[32px] shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full group-hover:bg-blue-600/40 transition-all duration-700"></div>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <DetailRowWhite label="MSISDN (Línea)" value={selectedItem.numeroTelefono || 'N/A'} />
                      <DetailRowWhite label="Operador" value={selectedItem.compania || 'N/A'} />
                      <DetailRowWhite label="ICCID (Tarjea SIM)" value={selectedItem.tarjetaSim || 'N/A'} />
                      <DetailRowWhite label="Plan / Tarifa" value={selectedItem.tarifa || 'N/A'} />
                      <DetailRowWhite label="IMEI Principal" value={selectedItem.imei1 || 'N/A'} />
                      <DetailRowWhite label="PIN/PUK Seguridad" value={`${selectedItem.pin || '****'} / ${selectedItem.puk || '****'}`} />
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Life Cycle */}
              <div className="space-y-6">
                <SectionTitle icon={<History size={18} />} title="Ciclo de Vida" />
                <div className="flex items-center gap-4 py-4 px-2">
                   <div className="flex-1 h-1.5 bg-emerald-500 rounded-full relative">
                      <div className="absolute -top-6 left-0 text-[9px] font-black text-emerald-600 uppercase">Adquisición</div>
                      <div className="absolute -bottom-2 left-0 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full shadow-sm"></div>
                   </div>
                   <div className="flex-1 h-1.5 bg-blue-500 rounded-full relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-blue-600 uppercase">Asignado</div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 border-4 border-white rounded-full shadow-sm"></div>
                   </div>
                   <div className="flex-1 h-1.5 bg-slate-200 rounded-full relative">
                      <div className="absolute -top-6 right-0 text-[9px] font-black text-slate-400 uppercase">Reposición</div>
                      <div className="absolute -bottom-2 right-0 w-4 h-4 bg-white border-2 border-slate-200 rounded-full"></div>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white flex gap-4">
              <button 
                onClick={() => { setSelectedItem(null); onEdit(selectedItem); }} 
                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
              >
                <Edit3 size={20} /> Editar Información
              </button>
              <button 
                onClick={() => { window.print(); }} 
                className="px-6 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all border border-slate-200"
              >
                <Download size={20}/>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.filter-select { @apply bg-white border-2 border-slate-100 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition-all font-bold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50; }`}</style>
    </div>
  );
};

const SectionTitle: React.FC<{ icon: React.ReactNode, title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
    <div className="text-blue-600 bg-blue-50 p-2 rounded-xl">{icon}</div>
    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h4>
  </div>
);

const DetailBadge: React.FC<{ label: string, value: string, icon?: React.ReactNode, color?: 'blue' | 'gray' }> = ({ label, value, icon, color = 'gray' }) => (
  <div className={`p-4 rounded-2xl border ${color === 'blue' ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-white border-slate-100 text-slate-900'} shadow-sm transition-all hover:shadow-md`}>
    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
      {icon} {label}
    </p>
    <p className={`text-xs font-black truncate`}>{value}</p>
  </div>
);

const DetailRow: React.FC<{ label: string, value: string, icon?: React.ReactNode, emphasis?: boolean, color?: string }> = ({ label, value, emphasis, color }) => (
  <div className={`flex justify-between items-center text-sm`}>
    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-tight">{label}</span>
    <span className={`${emphasis ? (color === 'blue' ? 'text-blue-600' : 'text-slate-900') + ' font-black text-lg' : 'text-slate-900 font-bold'} text-right truncate max-w-[65%]`}>{value}</span>
  </div>
);

const DetailRowWhite: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
    <span className="text-white/40 font-bold uppercase text-[9px] tracking-widest">{label}</span>
    <span className="text-white font-black truncate max-w-[60%] tracking-tight">{value}</span>
  </div>
);

export default InventoryList;
