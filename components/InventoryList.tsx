
import React, { useState, useMemo } from 'react';
import { 
  Edit3, Trash2, Monitor, Cpu, Search, X, MapPin, Tag, Hash, 
  Smartphone, User, Building2, Calendar, CreditCard, Info, ShieldCheck, Wifi,
  ArrowUpDown, Database, ClipboardList, HardDrive, PhoneCall, Banknote, Mail, 
  UserCheck, MapPinned, FileSignature, ShoppingBag, Receipt, Euro, UserCog, 
  Layers, CreditCard as SimIcon, CalendarDays, Factory, Key, Phone, KeySquare, 
  Zap, Fingerprint, Lock, AtSign, Bookmark
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

  // Lista definitiva de las 38 columnas en orden exacto para los encabezados de la tabla
  const TABLE_COLUMNS = [
    'ID', 'CODIGO', 'EQUIPO', 'EMPRESA', 'DESCRIPCION', 'TIPO', 'PROPIEDAD', 'CIF', 
    'ASIGNADO', 'CORREO', 'ADM', 'FECHA', 'UBICACION', 'ESTADO', 'MATERIAL', 
    'BEFORE', 'BYOD', 'MODELO', 'SERIAL_NUMBER', 'CARACTERISTICAS', 'TIENDA', 
    'FECHA_COMPRA', 'FACTURA', 'COSTE', 'CREADO_POR', 'RESPONSABLE', 'DISPOSITIVO', 
    'TARJETA_SIM', 'CON_FECHA', 'COMPAÑIA', 'PIN', 'Nº_TELEFONO', 'PUK', 'TARIFA', 
    'IMEI_1', 'IMEI_2', 'CORREO_SSO', 'ETIQ'
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Barra de Búsqueda y Control */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all" size={20} />
          <input 
            type="text" placeholder="Buscador Maestro de Activos (Escanea las 38 columnas de datos)..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-slate-50 border-transparent border-2 focus:border-blue-500 focus:bg-white rounded-[1.5rem] text-sm outline-none font-bold transition-all shadow-inner placeholder:text-slate-400"
          />
        </div>
        <div className="shrink-0">
           <div className="px-6 py-4 bg-slate-900 rounded-2xl text-white flex items-center gap-4 shadow-xl border border-slate-800">
              <Database className="text-blue-400 animate-pulse" size={20} />
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">{filteredData.length} Activos</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Sincronizados OK</span>
              </div>
           </div>
        </div>
      </div>

      {/* Súper-Tabla Clon de la Hoja de Cálculo */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[3500px]">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-10 border-b border-slate-200">
              <tr>
                {/* Generar encabezados dinámicamente según el orden del CSV */}
                {TABLE_COLUMNS.map(col => (
                  <HeaderCell key={col} label={col} />
                ))}
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right sticky right-0 bg-slate-50/95 border-l border-slate-200">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.ID} className="hover:bg-blue-50/40 transition-colors cursor-pointer group" onClick={() => setSelectedItem(item)}>
                  <td className="px-6 py-4 text-xs font-black text-slate-300">#{item.ID}</td>
                  <td className="px-6 py-4"><span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg border border-blue-200">{item.CODIGO}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm shrink-0">
                        {item.TIPO?.toLowerCase().includes('portatil') ? <Monitor size={14} className="text-blue-600"/> : <Smartphone size={14} className="text-indigo-600"/>}
                      </div>
                      <span className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{item.EQUIPO}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.EMPRESA}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400 italic truncate max-w-[150px]">{item.DESCRIPCION}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.TIPO}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{item.PROPIEDAD}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{item.CIF}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-800 tracking-tight">{item.ASIGNADO}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400">{item.CORREO}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.ADM}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.FECHA}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.UBICACION}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      item.ESTADO?.toLowerCase() === 'alta' ? 'bg-emerald-100 text-emerald-700' : 
                      item.ESTADO?.toLowerCase() === 'baja' ? 'bg-rose-100 text-rose-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.ESTADO}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.MATERIAL}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.BEFORE}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.BYOD}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{item.MODELO}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{item.SERIAL_NUMBER}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400 italic truncate max-w-[200px]">{item.CARACTERISTICAS}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.TIENDA}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.FECHA_COMPRA}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.FACTURA}</td>
                  <td className="px-6 py-4 text-xs font-black text-emerald-600">{item.COSTE}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.CREADO_POR}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.RESPONSABLE}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.DISPOSITIVO}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{item.TARJETA_SIM}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.CON_FECHA}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{item.COMPAÑIA}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{item.PIN}</td>
                  <td className="px-6 py-4 text-xs font-black text-blue-600 font-mono tracking-tighter">{item.Nº_TELEFONO}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{item.PUK}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400 truncate max-w-[100px]">{item.TARIFA}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{item.IMEI_1}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{item.IMEI_2}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400">{item.CORREO_SSO}</td>
                  <td className="px-6 py-4"><span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 border border-slate-200 uppercase">{item.ETIQ}</span></td>
                  
                  {/* Celda de Acciones - Sticky a la derecha */}
                  <td className="px-6 py-4 text-right sticky right-0 bg-white/95 backdrop-blur-sm border-l border-slate-100 group-hover:bg-blue-100/50 transition-colors z-20">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2.5 hover:bg-white text-blue-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"><Edit3 size={18}/></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(item.ID); }} className="p-2.5 hover:bg-white text-rose-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visor Lateral de 38 Campos - ORGANIZACIÓN POR BLOQUES */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedItem(null)}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-200 overflow-hidden">
             
             {/* Cabecera del Visor */}
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
                <div className="flex items-center gap-5">
                   <div className="bg-slate-900 p-5 rounded-2xl shadow-2xl text-white font-black tracking-widest uppercase border-b-4 border-blue-600">{selectedItem.CODIGO}</div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{selectedItem.EQUIPO}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase mt-3 flex items-center gap-2 tracking-[0.1em]">
                        <Hash size={12} className="text-blue-600"/> ACTIVO ID: {selectedItem.ID} • CATEGORÍA: {selectedItem.TIPO}
                      </p>
                   </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm"><X size={24} /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar bg-white scroll-smooth pb-32">
                {/* 1. Datos Maestros */}
                <DetailGroup title="Identificación del Activo" icon={<ClipboardList size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                      <DetailField label="CODIGO" value={selectedItem.CODIGO} isHighlight />
                      <DetailField label="TIPO" value={selectedItem.TIPO} />
                      <DetailField label="DISPOSITIVO" value={selectedItem.DISPOSITIVO} />
                      <DetailField label="ETIQ" value={selectedItem.ETIQ} color="indigo" isHighlight />
                   </div>
                   <div className="mt-8 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 shadow-inner">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2"><Info size={12}/> Observaciones Generales</p>
                      <p className="text-xs text-slate-700 font-bold leading-relaxed">{selectedItem.DESCRIPCION || 'Sin descripción adicional cargada en el sistema.'}</p>
                   </div>
                </DetailGroup>

                {/* 2. Marco Legal y Corporativo */}
                <DetailGroup title="Marco Corporativo" icon={<Building2 size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                      <DetailField label="EMPRESA" value={selectedItem.EMPRESA} />
                      <DetailField label="CIF" value={selectedItem.CIF} />
                      <DetailField label="PROPIEDAD" value={selectedItem.PROPIEDAD} />
                      <DetailField label="UBICACION" value={selectedItem.UBICACION} color="blue" isHighlight />
                   </div>
                </DetailGroup>

                {/* 3. Operativa y Asignación */}
                <DetailGroup title="Gestión de Asignación" icon={<User size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                      <DetailField label="ASIGNADO" value={selectedItem.ASIGNADO} isHighlight color="blue" />
                      <DetailField label="RESPONSABLE" value={selectedItem.RESPONSABLE} />
                      <DetailField label="CORREO" value={selectedItem.CORREO} />
                      <DetailField label="CORREO_SSO" value={selectedItem.CORREO_SSO} />
                      <DetailField label="ADM" value={selectedItem.ADM} />
                      <DetailField label="FECHA ALTA" value={selectedItem.FECHA} />
                      <DetailField label="ESTADO ACTUAL" value={selectedItem.ESTADO} isHighlight color="emerald" />
                      <DetailField label="MATERIAL" value={selectedItem.MATERIAL} />
                      <DetailField label="BEFORE" value={selectedItem.BEFORE} />
                      <DetailField label="BYOD" value={selectedItem.BYOD} />
                   </div>
                </DetailGroup>

                {/* 4. Hardware y Especificaciones */}
                <DetailGroup title="Especificaciones Hardware" icon={<HardDrive size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                      <DetailField label="MODELO" value={selectedItem.MODELO} />
                      <DetailField label="SERIAL_NUMBER" value={selectedItem.SERIAL_NUMBER} isHighlight />
                   </div>
                   <div className="mt-8 p-6 bg-slate-900 rounded-[1.5rem] shadow-xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Cpu size={12} className="text-blue-400"/> Memoria Técnica</p>
                      <p className="text-xs text-blue-50 font-medium leading-relaxed italic">{selectedItem.CARACTERISTICAS || 'Datos técnicos no especificados.'}</p>
                   </div>
                </DetailGroup>

                {/* 5. Comunicaciones y SIM */}
                <DetailGroup title="Comunicaciones" icon={<PhoneCall size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                      <DetailField label="Nº_TELEFONO" value={selectedItem.Nº_TELEFONO} isHighlight color="blue" />
                      <DetailField label="COMPAÑIA" value={selectedItem.COMPAÑIA} />
                      <DetailField label="TARJETA_SIM (ICCID)" value={selectedItem.TARJETA_SIM} />
                      <DetailField label="TARIFA" value={selectedItem.TARIFA} />
                      <DetailField label="PIN" value={selectedItem.PIN} />
                      <DetailField label="PUK" value={selectedItem.PUK} />
                      <DetailField label="CON_FECHA" value={selectedItem.CON_FECHA} />
                      <DetailField label="IMEI_1" value={selectedItem.IMEI_1} />
                      <DetailField label="IMEI_2" value={selectedItem.IMEI_2} />
                   </div>
                </DetailGroup>

                {/* 6. Finanzas y Trazabilidad */}
                <DetailGroup title="Historial Financiero" icon={<Banknote size={18}/>}>
                   <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                      <DetailField label="TIENDA / PROVEEDOR" value={selectedItem.TIENDA} />
                      <DetailField label="FACTURA" value={selectedItem.FACTURA} />
                      <DetailField label="FECHA_COMPRA" value={selectedItem.FECHA_COMPRA} />
                      <DetailField label="COSTE ADQUISICIÓN" value={selectedItem.COSTE} isHighlight color="emerald" />
                      <DetailField label="CREADO_POR" value={selectedItem.CREADO_POR} />
                   </div>
                </DetailGroup>
             </div>

             {/* Footer Acciones Visor */}
             <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0 flex gap-4 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <button 
                  onClick={() => { setSelectedItem(null); onEdit(selectedItem); }}
                  className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-slate-200 group"
                >
                  <Edit3 size={20} className="group-hover:rotate-12 transition-transform" /> Editar Registro Maestro
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HeaderCell: React.FC<{ label: string }> = ({ label }) => (
  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group/h transition-colors whitespace-nowrap">
    <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
      {label} <ArrowUpDown size={10} className="opacity-20 group-hover/h:opacity-100 transition-opacity" />
    </div>
  </th>
);

const DetailGroup: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-8 group/g animate-in slide-in-from-bottom-2 duration-500">
    <div className="flex items-center gap-5 border-b border-slate-100 pb-5 group-hover/g:border-blue-200 transition-colors">
       <div className="bg-slate-50 p-3.5 rounded-2xl text-slate-400 group-hover/g:text-blue-600 group-hover/g:bg-blue-50 transition-all shadow-sm">{icon}</div>
       <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.35em] group-hover/g:text-slate-900 transition-colors">{title}</h4>
    </div>
    {children}
  </div>
);

const DetailField: React.FC<{ label: string; value: any; isHighlight?: boolean; color?: string }> = ({ label, value, isHighlight, color }) => {
  const getColorClass = () => {
    if (!isHighlight) return 'text-slate-900';
    switch(color) {
      case 'blue': return 'text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100';
      case 'emerald': return 'text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100';
      case 'indigo': return 'text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100';
      default: return 'text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100';
    }
  };

  return (
    <div className="space-y-3 group/f">
      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover/f:text-blue-400 transition-colors leading-none">{label}</p>
      <p className={`text-xs font-bold truncate transition-all ${getColorClass()}`}>
        {value || <span className="text-slate-200 tracking-widest opacity-50 italic">---</span>}
      </p>
    </div>
  );
};

export default InventoryList;
