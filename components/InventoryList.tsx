
import React, { useState, useMemo, useRef } from 'react';
import { 
  Edit3, Trash2, Monitor, Cpu, Search, X, MapPin, Tag, Hash, 
  Smartphone, User, Building2, Calendar, CreditCard, Info, ShieldCheck, Wifi,
  ArrowUpDown, Database, ClipboardList, HardDrive, PhoneCall, Banknote,
  ArrowUp, ArrowDown
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
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const filteredData = useMemo(() => {
    return inventory.filter(item => {
      const searchStr = Object.values(item).join(' ').toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [inventory, searchTerm]);

  // Lista exacta según la última corrección del usuario
  const MASTER_TABLE_COLUMNS = [
    'ID', 'CODIGO', 'EQUIPO', 'EMPRESA', 'DESCRIPCION', 'TIPO', 'PROPIEDAD', 'CIF', 
    'ASIGNADO', 'CORREO', 'ADM', 'FECHA', 'UBICACION', 'ESTADO', 'MATERIAL', 
    'BEFORE', 'BYOD', 'MODELO', 'SERIAL_NUMBER', 'CARACTERISTICAS', 'PROVEEDOR', 
    'FECHA_COMPRA', 'FACTURA', 'COSTE', 'CREADO_POR', 'RESPONSABLE', 'DISPOSITIVO', 
    'TARJETA_SIM', 'CON_FECHA', 'COMPAÑIA', 'PIN', 'Nº_TELEFONO', 'PUK', 'TARIFA', 
    'IMEI_1', 'IMEI_2', 'CORREO_SSO', 'ETIQ'
  ];

  const handleScrollToTop = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollToBottom = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ top: tableContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Buscador de Alto Impacto */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all" size={20} />
          <input 
            type="text" placeholder="Buscador Maestro de Celdas (Sincronizado 1:1)..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-2.5 bg-slate-50 border-transparent border-2 focus:border-blue-500 focus:bg-white rounded-[1.25rem] text-sm outline-none font-bold transition-all shadow-inner"
          />
        </div>
        <div className="shrink-0">
           <div className="px-6 py-4 bg-slate-900 rounded-2xl text-white flex items-center gap-4 shadow-xl border border-slate-800">
              <Database className="text-blue-400" size={20} />
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">{filteredData.length} Activos</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Sincronización Integra</span>
              </div>
           </div>
        </div>
      </div>

      {/* Súper-Tabla Clon del Libro Google Sheets */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col relative">
        <div ref={tableContainerRef} className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar scroll-smooth">
          <table className="w-full text-left border-collapse min-w-[3800px]">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-10 border-b border-slate-200">
              <tr>
                {MASTER_TABLE_COLUMNS.map(col => (
                  <HeaderCell key={col} label={col} />
                ))}
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right sticky right-0 bg-slate-50/95 border-l border-slate-200">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.ID} className="hover:bg-blue-50/40 transition-colors cursor-pointer group" onClick={() => setSelectedItem(item)}>
                  {/* Generar celdas dinámicamente basadas en el orden maestro */}
                  {MASTER_TABLE_COLUMNS.map(col => {
                    const value = (item as any)[col];
                    if (col === 'ID') return <td key={col} className="px-6 py-4 text-xs font-black text-slate-300">#{value}</td>;
                    if (col === 'CODIGO') return <td key={col} className="px-6 py-4"><span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg border border-blue-200">{value}</span></td>;
                    if (col === 'EQUIPO') return (
                      <td key={col} className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                            {String(item.TIPO || '').toLowerCase().includes('portatil') ? <Monitor size={14} className="text-blue-600"/> : <Smartphone size={14} className="text-indigo-600"/>}
                          </div>
                          <span className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{value}</span>
                        </div>
                      </td>
                    );
                    if (col === 'ESTADO') return (
                      <td key={col} className="px-6 py-4">
                        <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          String(value).toLowerCase() === 'alta' ? 'bg-emerald-100 text-emerald-700' : 
                          String(value).toLowerCase() === 'baja' ? 'bg-rose-100 text-rose-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {value}
                        </span>
                      </td>
                    );
                    if (col === 'COSTE') return <td key={col} className="px-6 py-4 text-xs font-black text-emerald-600">{value}</td>;
                    if (col === 'Nº_TELEFONO') return <td key={col} className="px-6 py-4 text-xs font-black text-blue-600 font-mono tracking-tighter">{value}</td>;
                    
                    return <td key={col} className="px-6 py-4 text-xs font-bold text-slate-500 truncate max-w-[180px]">{value}</td>;
                  })}
                  
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

        {/* Floating Navigation Arrows */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-30">
          <button 
            onClick={handleScrollToTop}
            className="p-3 bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 shadow-xl rounded-full transition-all active:scale-95 group"
            title="Ir al inicio"
          >
            <ArrowUp size={20} className="group-hover:-translate-y-0.5 transition-transform" />
          </button>
          <button 
            onClick={handleScrollToBottom}
            className="p-3 bg-slate-900 text-white hover:bg-blue-600 shadow-xl rounded-full transition-all active:scale-95 group"
            title="Ir al final"
          >
            <ArrowDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Visor Lateral Detallado */}
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
                <button onClick={() => setSelectedItem(null)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><X size={24} /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar bg-white">
                {/* Agrupamos los 38 campos en secciones legibles */}
                <SectionDetail title="Identificación y Clasificación" icon={<Tag size={18}/>}>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                    <Field label="CÓDIGO" value={selectedItem.CODIGO} />
                    <Field label="TIPO" value={selectedItem.TIPO} />
                    <Field label="DISPOSITIVO" value={selectedItem.DISPOSITIVO} />
                    <Field label="ETIQ" value={selectedItem.ETIQ} isHighlight />
                  </div>
                </SectionDetail>

                <SectionDetail title="Marco Corporativo" icon={<Building2 size={18}/>}>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                    <Field label="EMPRESA" value={selectedItem.EMPRESA} />
                    <Field label="CIF" value={selectedItem.CIF} />
                    <Field label="PROPIEDAD" value={selectedItem.PROPIEDAD} />
                    <Field label="UBICACIÓN" value={selectedItem.UBICACION} />
                  </div>
                </SectionDetail>

                <SectionDetail title="Operativa y Asignación" icon={<User size={18}/>}>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                    <Field label="ASIGNADO" value={selectedItem.ASIGNADO} isHighlight />
                    <Field label="CORREO" value={selectedItem.CORREO} />
                    <Field label="CORREO_SSO" value={selectedItem.CORREO_SSO} />
                    <Field label="RESPONSABLE" value={selectedItem.RESPONSABLE} />
                    <Field label="ADM" value={selectedItem.ADM} />
                    <Field label="ESTADO" value={selectedItem.ESTADO} />
                    <Field label="MATERIAL" value={selectedItem.MATERIAL} />
                    <Field label="FECHA" value={selectedItem.FECHA} />
                  </div>
                </SectionDetail>

                <SectionDetail title="Especificaciones Técnicas" icon={<Cpu size={18}/>}>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                    <Field label="MODELO" value={selectedItem.MODELO} />
                    <Field label="SERIAL_NUMBER" value={selectedItem.SERIAL_NUMBER} />
                    <Field label="BEFORE" value={selectedItem.BEFORE} />
                    <Field label="BYOD" value={selectedItem.BYOD} />
                  </div>
                  <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Descripción Adicional</p>
                    <p className="text-xs text-slate-700 font-bold leading-relaxed">{selectedItem.DESCRIPCION || 'Sin descripción.'}</p>
                  </div>
                </SectionDetail>

                <SectionDetail title="Comunicaciones" icon={<Wifi size={18}/>}>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                    <Field label="Nº_TELEFONO" value={selectedItem.Nº_TELEFONO} isHighlight />
                    <Field label="COMPAÑÍA" value={selectedItem.COMPAÑIA} />
                    <Field label="TARIFA" value={selectedItem.TARIFA} />
                    <Field label="IMEI_1" value={selectedItem.IMEI_1} />
                    <Field label="IMEI_2" value={selectedItem.IMEI_2} />
                    <Field label="TARJETA_SIM" value={selectedItem.TARJETA_SIM} />
                    <Field label="PIN" value={selectedItem.PIN} />
                    <Field label="PUK" value={selectedItem.PUK} />
                  </div>
                </SectionDetail>

                <SectionDetail title="Historial Financiero" icon={<Banknote size={18}/>}>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                    <Field label="PROVEEDOR" value={selectedItem.PROVEEDOR} />
                    <Field label="FECHA_COMPRA" value={selectedItem.FECHA_COMPRA} />
                    <Field label="FACTURA" value={selectedItem.FACTURA} />
                    <Field label="COSTE" value={selectedItem.COSTE} isHighlight />
                    <Field label="CREADO_POR" value={selectedItem.CREADO_POR} />
                  </div>
                </SectionDetail>
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
  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group/h transition-colors whitespace-nowrap">
    <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
      {label} <ArrowUpDown size={10} className="opacity-30 group-hover/h:opacity-100 transition-opacity" />
    </div>
  </th>
);

const SectionDetail: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
       <div className="bg-slate-50 p-3 rounded-2xl text-slate-400">{icon}</div>
       <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{title}</h4>
    </div>
    {children}
  </div>
);

const Field: React.FC<{ label: string; value: any; isHighlight?: boolean }> = ({ label, value, isHighlight }) => (
  <div className="space-y-2">
    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
    <p className={`text-xs font-bold truncate ${isHighlight ? 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block' : 'text-slate-900'}`}>
      {value || <span className="text-slate-200">---</span>}
    </p>
  </div>
);

export default InventoryList;
