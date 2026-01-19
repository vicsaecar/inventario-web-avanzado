
import React, { useState, useMemo } from 'react';
import { 
  Edit3, Trash2, Monitor, Cpu, Search, X, MapPin, Tag, Hash, 
  Smartphone, User, Building2, Calendar, CreditCard, Info, ShieldCheck, Wifi,
  ArrowUpDown, Database, ClipboardList, HardDrive, PhoneCall, Banknote
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
      {/* Buscador de Alto Impacto */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all" size={18} />
          <input 
            type="text" placeholder="Buscador Universal (Escanea las 38 columnas de datos)..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent border-2 focus:border-blue-500 focus:bg-white rounded-2xl text-sm outline-none font-bold transition-all"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
           <div className="px-5 py-4 bg-slate-900 rounded-2xl text-white flex items-center gap-3 shadow-lg">
              <Database className="text-blue-400" size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{filteredData.length} Registros Activos</span>
           </div>
        </div>
      </div>

      {/* Tabla con Estructura de Clon del Sheet */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[2200px]">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-10 border-b border-slate-200">
              <tr>
                <HeaderCell label="ID" />
                <HeaderCell label="CODIGO" />
                <HeaderCell label="EQUIPO" />
                <HeaderCell label="EMPRESA" />
                <HeaderCell label="ASIGNADO" />
                <HeaderCell label="UBICACION" />
                <HeaderCell label="ESTADO" />
                <HeaderCell label="MATERIAL" />
                <HeaderCell label="MODELO" />
                <HeaderCell label="SERIAL_NUMBER" />
                <HeaderCell label="Nº_TELEFONO" />
                <HeaderCell label="IMEI_1" />
                <HeaderCell label="COSTE" />
                <HeaderCell label="FACTURA" />
                <HeaderCell label="TIPO" />
                <HeaderCell label="ETIQ" />
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right sticky right-0 bg-slate-50/95 border-l border-slate-200">ACCION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.ID} className="hover:bg-blue-50/40 transition-colors cursor-pointer group" onClick={() => setSelectedItem(item)}>
                  <td className="px-6 py-5"><span className="text-xs font-black text-slate-400">#{item.ID}</span></td>
                  <td className="px-6 py-5"><span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg uppercase tracking-tight shadow-sm border border-blue-200">{item.CODIGO}</span></td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm shrink-0 group-hover:scale-110 transition-all">
                        {item.TIPO?.toLowerCase().includes('portatil') ? <Monitor size={14} className="text-blue-600"/> : <Smartphone size={14} className="text-indigo-600"/>}
                      </div>
                      <span className="text-sm font-bold text-slate-900 truncate max-w-[220px]">{item.EQUIPO}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-500 uppercase">{item.EMPRESA}</td>
                  <td className="px-6 py-5 text-xs font-black text-slate-800 tracking-tight italic">{item.ASIGNADO}</td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-500 uppercase">{item.UBICACION}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      item.ESTADO?.toLowerCase() === 'alta' ? 'bg-emerald-100 text-emerald-700' : 
                      item.ESTADO?.toLowerCase() === 'baja' ? 'bg-rose-100 text-rose-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.ESTADO}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-400 uppercase">{item.MATERIAL}</td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-500">{item.MODELO}</td>
                  <td className="px-6 py-5 text-xs font-medium text-slate-400 font-mono">{item.SERIAL_NUMBER}</td>
                  <td className="px-6 py-5 text-xs font-black text-blue-600 tracking-tighter">{item.Nº_TELEFONO || '---'}</td>
                  <td className="px-6 py-5 text-xs font-medium text-slate-400 font-mono">{item.IMEI_1}</td>
                  <td className="px-6 py-5 text-xs font-black text-emerald-600">{item.COSTE}</td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-400 uppercase">{item.FACTURA}</td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-400">{item.TIPO}</td>
                  <td className="px-6 py-5"><span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{item.ETIQ}</span></td>
                  
                  <td className="px-6 py-5 text-right sticky right-0 bg-white/90 backdrop-blur-sm border-l border-slate-50 group-hover:bg-blue-100/50">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2.5 hover:bg-white text-blue-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"><Edit3 size={16}/></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(item.ID); }} className="p-2.5 hover:bg-white text-rose-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visor de Detalles Lateral - 38 Campos Organizados */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedItem(null)}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-200">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
                <div className="flex items-center gap-5">
                   <div className="bg-slate-900 p-4 rounded-2xl shadow-xl text-white font-black tracking-widest uppercase border-b-4 border-blue-600">{selectedItem.CODIGO}</div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{selectedItem.EQUIPO}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase mt-2 flex items-center gap-2">
                        <Hash size={12} className="text-blue-600"/> ID: {selectedItem.ID} • {selectedItem.TIPO}
                      </p>
                   </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"><X size={24} /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar bg-white">
                {/* 1. Datos de Identidad */}
                <DetailGroup title="Datos de Identidad" icon={<ClipboardList size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                      <DetailField label="CODIGO" value={selectedItem.CODIGO} isHighlight />
                      <DetailField label="TIPO" value={selectedItem.TIPO} />
                      <DetailField label="DISPOSITIVO" value={selectedItem.DISPOSITIVO} />
                      <DetailField label="ID" value={`#${selectedItem.ID}`} />
                   </div>
                   <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Descripción</p>
                      <p className="text-xs text-slate-700 font-bold leading-relaxed">{selectedItem.DESCRIPCION || 'Sin descripción adicional.'}</p>
                   </div>
                </DetailGroup>

                {/* 2. Marco Corporativo */}
                <DetailGroup title="Marco Corporativo" icon={<Building2 size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                      <DetailField label="EMPRESA" value={selectedItem.EMPRESA} />
                      <DetailField label="CIF" value={selectedItem.CIF} />
                      <DetailField label="PROPIEDAD" value={selectedItem.PROPIEDAD} />
                      <DetailField label="UBICACION" value={selectedItem.UBICACION} />
                      <DetailField label="ETIQ" value={selectedItem.ETIQ} isHighlight color="indigo" />
                   </div>
                </DetailGroup>

                {/* 3. Operativa y Asignación */}
                <DetailGroup title="Operativa y Asignación" icon={<User size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                      <DetailField label="ASIGNADO" value={selectedItem.ASIGNADO} isHighlight color="blue" />
                      <DetailField label="CORREO" value={selectedItem.CORREO} />
                      <DetailField label="CORREO_SSO" value={selectedItem.CORREO_SSO} />
                      <DetailField label="RESPONSABLE" value={selectedItem.RESPONSABLE} />
                      <DetailField label="ADM" value={selectedItem.ADM} />
                      <DetailField label="FECHA" value={selectedItem.FECHA} />
                      <DetailField label="ESTADO" value={selectedItem.ESTADO} isHighlight color="emerald" />
                      <DetailField label="MATERIAL" value={selectedItem.MATERIAL} />
                      <DetailField label="BEFORE" value={selectedItem.BEFORE} />
                      <DetailField label="BYOD" value={selectedItem.BYOD} />
                   </div>
                </DetailGroup>

                {/* 4. Especificaciones Técnicas */}
                <DetailGroup title="Especificaciones Técnicas" icon={<HardDrive size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                      <DetailField label="MODELO" value={selectedItem.MODELO} />
                      <DetailField label="SERIAL_NUMBER" value={selectedItem.SERIAL_NUMBER} isHighlight />
                   </div>
                   <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2"><Info size={12}/> Características / Configuración</p>
                      <p className="text-xs text-slate-700 font-bold leading-relaxed italic">{selectedItem.CARACTERISTICAS || 'Sin detalles configurados.'}</p>
                   </div>
                </DetailGroup>

                {/* 5. Comunicaciones */}
                <DetailGroup title="Comunicaciones" icon={<PhoneCall size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                      <DetailField label="Nº_TELEFONO" value={selectedItem.Nº_TELEFONO} isHighlight color="blue" />
                      <DetailField label="COMPAÑIA" value={selectedItem.COMPAÑIA} />
                      <DetailField label="TARIFA" value={selectedItem.TARIFA} />
                      <DetailField label="TARJETA_SIM" value={selectedItem.TARJETA_SIM} />
                      <DetailField label="CON_FECHA" value={selectedItem.CON_FECHA} />
                      <DetailField label="IMEI_1" value={selectedItem.IMEI_1} />
                      <DetailField label="IMEI_2" value={selectedItem.IMEI_2} />
                      <DetailField label="PIN" value={selectedItem.PIN} />
                      <DetailField label="PUK" value={selectedItem.PUK} />
                   </div>
                </DetailGroup>

                {/* 6. Financiero */}
                <DetailGroup title="Gestión Financiera" icon={<Banknote size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                      <DetailField label="TIENDA" value={selectedItem.TIENDA} />
                      <DetailField label="FECHA_COMPRA" value={selectedItem.FECHA_COMPRA} />
                      <DetailField label="FACTURA" value={selectedItem.FACTURA} />
                      <DetailField label="COSTE" value={selectedItem.COSTE} isHighlight color="emerald" />
                      <DetailField label="CREADO_POR" value={selectedItem.CREADO_POR} />
                   </div>
                </DetailGroup>
             </div>

             <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0 flex gap-4">
                <button 
                  onClick={() => { setSelectedItem(null); onEdit(selectedItem); }}
                  className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-slate-200"
                >
                  <Edit3 size={18}/> Editar Registro Completo
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HeaderCell: React.FC<{ label: string }> = ({ label }) => (
  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group/h transition-colors">
    <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
      {label} <ArrowUpDown size={10} className="opacity-30 group-hover/h:opacity-100 transition-opacity" />
    </div>
  </th>
);

const DetailGroup: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-6 group/g">
    <div className="flex items-center gap-4 border-b border-slate-100 pb-4 group-hover/g:border-blue-100 transition-colors">
       <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 group-hover/g:text-blue-600 group-hover/g:bg-blue-50 transition-all">{icon}</div>
       <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover/g:text-slate-900 transition-colors">{title}</h4>
    </div>
    {children}
  </div>
);

const DetailField: React.FC<{ label: string; value: any; isHighlight?: boolean; color?: string }> = ({ label, value, isHighlight, color }) => {
  const getColorClass = () => {
    if (!isHighlight) return 'text-slate-900';
    switch(color) {
      case 'blue': return 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded';
      case 'emerald': return 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded';
      case 'indigo': return 'text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-2 group/f">
      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover/f:text-slate-400 transition-colors">{label}</p>
      <p className={`text-xs font-bold truncate ${getColorClass()}`}>
        {value || <span className="text-slate-200">---</span>}
      </p>
    </div>
  );
};

export default InventoryList;
