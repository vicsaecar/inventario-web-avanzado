
import React, { useState, useMemo } from 'react';
import { 
  Edit3, Trash2, Monitor, Cpu, Search, X, MapPin, Tag, Hash, 
  Smartphone, User, Building2, Calendar, CreditCard, Info, ShieldCheck, Wifi,
  ChevronRight, ArrowUpDown, Filter, Database
} from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryListProps {
  inventory: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ inventory, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredData = useMemo(() => {
    return inventory.filter(item => {
      const searchStr = Object.values(item).join(' ').toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [inventory, searchTerm]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Buscador y Controles */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Buscar en todos los campos (38 columnas)..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent border-2 focus:border-blue-500 focus:bg-white rounded-2xl text-sm outline-none font-bold transition-all"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
           <div className="px-5 py-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
              <Database className="text-blue-600" size={18} />
              <span className="text-xs font-black text-blue-800 uppercase tracking-widest">{filteredData.length} Registros Sincronizados</span>
           </div>
        </div>
      </div>

      {/* Tabla Principal con Scroll Horizontal */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-10 border-b border-slate-200">
              <tr>
                <HeaderCell label="ID" />
                <HeaderCell label="Código" />
                <HeaderCell label="Equipo" />
                <HeaderCell label="Modelo / Serial" />
                <HeaderCell label="Empresa" />
                <HeaderCell label="Asignado" />
                <HeaderCell label="Ubicación" />
                <HeaderCell label="Estado" />
                <HeaderCell label="Material" />
                <HeaderCell label="Nº Teléfono" />
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right sticky right-0 bg-slate-50/95">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.ID} className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => setSelectedItem(item)}>
                  <td className="px-6 py-4"><span className="text-xs font-black text-slate-400">#{item.ID}</span></td>
                  <td className="px-6 py-4"><span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded-md uppercase tracking-tighter">{item.CODIGO}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                        {item.TIPO?.toLowerCase().includes('portatil') ? <Monitor size={14} className="text-blue-500"/> : <Smartphone size={14} className="text-indigo-500"/>}
                      </div>
                      <span className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{item.EQUIPO}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] font-bold text-slate-600 uppercase">{item.MODELO || '---'}</div>
                    <div className="text-[9px] text-slate-400 font-medium">SN: {item.SERIAL_NUMBER || '---'}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{item.EMPRESA}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-800">{item.ASIGNADO}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{item.UBICACION}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      item.ESTADO?.toLowerCase() === 'alta' ? 'bg-emerald-100 text-emerald-700' : 
                      item.ESTADO?.toLowerCase() === 'baja' ? 'bg-rose-100 text-rose-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.ESTADO}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.MATERIAL}</td>
                  <td className="px-6 py-4 text-xs font-black text-blue-600 tracking-tighter">{item.Nº_TELEFONO || '---'}</td>
                  <td className="px-6 py-4 text-right sticky right-0 bg-white/80 backdrop-blur-sm group-hover:bg-blue-50/0">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 hover:bg-white text-blue-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"><Edit3 size={16}/></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(item.ID); }} className="p-2 hover:bg-white text-rose-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visor de Detalles Lateral - EXHAUSTIVO 38 CAMPOS */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedItem(null)}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
                <div className="flex items-center gap-5">
                   <div className="bg-blue-600 p-4 rounded-3xl shadow-xl text-white font-black tracking-widest uppercase">{selectedItem.CODIGO}</div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{selectedItem.EQUIPO}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase mt-1.5 flex items-center gap-2">
                        <Hash size={12} className="text-blue-600"/> ID: {selectedItem.ID} • {selectedItem.TIPO}
                      </p>
                   </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100"><X size={24} /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar bg-white">
                {/* 1. Marco Corporativo */}
                <DetailGroup title="Información Corporativa" icon={<Building2 size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                      <DetailField label="Empresa" value={selectedItem.EMPRESA} />
                      <DetailField label="Propiedad" value={selectedItem.PROPIEDAD} />
                      <DetailField label="CIF" value={selectedItem.CIF} />
                      <DetailField label="Ubicación" value={selectedItem.UBICACION} />
                      <DetailField label="Creado Por" value={selectedItem.CREADO_POR} />
                      <DetailField label="Responsable" value={selectedItem.RESPONSABLE} />
                   </div>
                </DetailGroup>

                {/* 2. Asignación y Operativa */}
                <DetailGroup title="Asignación y Estado" icon={<User size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                      <DetailField label="Asignado a" value={selectedItem.ASIGNADO} isHighlight />
                      <DetailField label="Correo" value={selectedItem.CORREO} />
                      <DetailField label="Correo SSO" value={selectedItem.CORREO_SSO} />
                      <DetailField label="ADM" value={selectedItem.ADM} />
                      <DetailField label="Fecha Alta" value={selectedItem.FECHA} />
                      <DetailField label="Estado Actual" value={selectedItem.ESTADO} isHighlight color="blue" />
                      <DetailField label="Material" value={selectedItem.MATERIAL} />
                      <DetailField label="Etiqueta" value={selectedItem.ETIQ} />
                   </div>
                </DetailGroup>

                {/* 3. Hardware y Técnico */}
                <DetailGroup title="Especificaciones Hardware" icon={<Cpu size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                      <DetailField label="Modelo" value={selectedItem.MODELO} />
                      <DetailField label="Serial Number" value={selectedItem.SERIAL_NUMBER} isHighlight />
                      <DetailField label="Categoría Dispositivo" value={selectedItem.DISPOSITIVO} />
                      <DetailField label="Before" value={selectedItem.BEFORE} />
                      <DetailField label="BYOD" value={selectedItem.BYOD} />
                   </div>
                   <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Info size={12}/> Características Técnicas</p>
                      <p className="text-xs text-slate-700 font-bold leading-relaxed">{selectedItem.CARACTERISTICAS || 'Sin descripción técnica detallada.'}</p>
                   </div>
                </DetailGroup>

                {/* 4. Conectividad y Telefonía */}
                <DetailGroup title="Comunicaciones y SIM" icon={<Wifi size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                      <DetailField label="Nº Teléfono" value={selectedItem.Nº_TELEFONO} isHighlight color="indigo" />
                      <DetailField label="Compañía" value={selectedItem.COMPAÑIA} />
                      <DetailField label="IMEI_1" value={selectedItem.IMEI_1} />
                      <DetailField label="IMEI_2" value={selectedItem.IMEI_2} />
                      <DetailField label="SIM Card" value={selectedItem.TARJETA_SIM} />
                      <DetailField label="Fecha SIM" value={selectedItem.CON_FECHA} />
                      <DetailField label="Tarifa" value={selectedItem.TARIFA} />
                      <DetailField label="PIN" value={selectedItem.PIN} />
                      <DetailField label="PUK" value={selectedItem.PUK} />
                   </div>
                </DetailGroup>

                {/* 5. Finanzas */}
                <DetailGroup title="Gestión Financiera" icon={<CreditCard size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                      <DetailField label="Proveedor / Tienda" value={selectedItem.TIENDA} />
                      <DetailField label="Factura" value={selectedItem.FACTURA} />
                      <DetailField label="Fecha Compra" value={selectedItem.FECHA_COMPRA} />
                      <DetailField label="Coste" value={selectedItem.COSTE} isHighlight color="emerald" />
                   </div>
                   <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción Adicional</p>
                      <p className="text-xs text-slate-700 font-bold leading-relaxed italic">{selectedItem.DESCRIPCION || 'Sin observaciones adicionales.'}</p>
                   </div>
                </DetailGroup>
             </div>

             <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0 flex gap-4">
                <button 
                  onClick={() => { setSelectedItem(null); onEdit(selectedItem); }}
                  className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Edit3 size={20}/> Editar este Activo
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HeaderCell: React.FC<{ label: string }> = ({ label }) => (
  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
    <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
      {label} <ArrowUpDown size={10} className="opacity-40" />
    </div>
  </th>
);

const DetailGroup: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
       <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 shadow-sm">{icon}</div>
       <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{title}</h4>
    </div>
    {children}
  </div>
);

const DetailField: React.FC<{ label: string; value: any; isHighlight?: boolean; color?: string }> = ({ label, value, isHighlight, color }) => {
  const getHighlightColor = () => {
    switch(color) {
      case 'blue': return 'text-blue-600';
      case 'indigo': return 'text-indigo-600';
      case 'emerald': return 'text-emerald-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-1.5 group">
      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-400 transition-colors">{label}</p>
      <p className={`text-xs font-bold truncate ${isHighlight ? `${getHighlightColor()} text-sm font-black` : 'text-slate-900'}`}>
        {value || <span className="text-slate-200">NO DEFINIDO</span>}
      </p>
    </div>
  );
};

export default InventoryList;
