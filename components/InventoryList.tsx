
import React, { useState, useMemo } from 'react';
import { 
  Edit3, Trash2, Monitor, Cpu, Search, X, MapPin, Tag, Hash, 
  Smartphone, User, Building2, Calendar, CreditCard, Info, ShieldCheck, Wifi
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
      const searchStr = `${item.EQUIPO} ${item.CODIGO} ${item.ASIGNADO} ${item.EMPRESA} ${item.SERIAL_NUMBER} ${item.MODELO}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [inventory, searchTerm]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Buscador de Alto Rendimiento */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative group">
        <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all" size={18} />
        <input 
          type="text" placeholder="Buscar por equipo, código, responsable, modelo o serial..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent border-2 focus:border-blue-500 focus:bg-white rounded-2xl text-sm outline-none font-bold"
        />
        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1.5 rounded-lg tracking-widest">{filteredData.length} Activos</span>
        </div>
      </div>

      {/* Tabla con Scroll Horizontal */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 overflow-hidden">
        <div className="overflow-auto h-full custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">ID / Código</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Equipo / Modelo</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Empresa</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Responsable</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => (
                <tr key={item.ID} className="hover:bg-blue-50/40 transition-colors cursor-pointer group" onClick={() => setSelectedItem(item)}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm shrink-0">
                        <Hash size={16} className="text-slate-400"/>
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-xs">#{item.ID}</div>
                        <div className="text-[10px] text-blue-600 font-black mt-1 uppercase">{item.CODIGO}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-900 text-sm">{item.EQUIPO}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{item.MODELO} {item.SERIAL_NUMBER ? `• SN: ${item.SERIAL_NUMBER}` : ''}</div>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-600 text-xs uppercase">{item.EMPRESA}</td>
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-800 text-sm">{item.ASIGNADO}</div>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase">{item.UBICACION}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      item.ESTADO?.toLowerCase() === 'alta' ? 'bg-emerald-50 text-emerald-600' : 
                      item.ESTADO?.toLowerCase() === 'baja' ? 'bg-rose-50 text-rose-600' : 
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {item.ESTADO}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2.5 hover:bg-white text-blue-600 rounded-xl shadow-sm border border-transparent hover:border-blue-100"><Edit3 size={16}/></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(item.ID); }} className="p-2.5 hover:bg-white text-rose-600 rounded-xl shadow-sm border border-transparent hover:border-rose-100"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visor de Detalles Lateral (Panel de 38 campos) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedItem(null)}></div>
          <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
                <div className="flex items-center gap-5">
                   <div className="bg-blue-600 p-4 rounded-3xl shadow-xl text-white font-bold tracking-widest uppercase">{selectedItem.CODIGO}</div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{selectedItem.EQUIPO}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase mt-2">ID: {selectedItem.ID} • {selectedItem.TIPO}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all"><X size={24} /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                {/* Categoría 1: Identidad */}
                <DetailSection title="Identidad Corporativa" icon={<Building2 size={18}/>}>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <DetailItem label="Empresa" value={selectedItem.EMPRESA} />
                      <DetailItem label="CIF" value={selectedItem.CIF} />
                      <DetailItem label="Propiedad" value={selectedItem.PROPIEDAD} />
                      <DetailItem label="Código" value={selectedItem.CODIGO} />
                      <DetailItem label="Tipo Activo" value={selectedItem.TIPO} />
                      <DetailItem label="Ubicación" value={selectedItem.UBICACION} />
                   </div>
                </DetailSection>

                {/* Categoría 2: Asignación */}
                <DetailSection title="Asignación y Usuario" icon={<User size={18}/>}>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <DetailItem label="Asignado a" value={selectedItem.ASIGNADO} highlight />
                      <DetailItem label="Correo" value={selectedItem.CORREO} />
                      <DetailItem label="Correo SSO" value={selectedItem.CORREO_SSO} />
                      <DetailItem label="Responsable" value={selectedItem.RESPONSABLE} />
                      <DetailItem label="ADM" value={selectedItem.ADM} />
                      <DetailItem label="BYOD" value={selectedItem.BYOD} />
                   </div>
                </DetailSection>

                {/* Categoría 3: Hardware */}
                <DetailSection title="Especificaciones Técnicas" icon={<Cpu size={18}/>}>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <DetailItem label="Modelo" value={selectedItem.MODELO} />
                      <DetailItem label="Serial Number" value={selectedItem.SERIAL_NUMBER} />
                      <DetailItem label="Dispositivo" value={selectedItem.DISPOSITIVO} />
                      <DetailItem label="Estado" value={selectedItem.ESTADO} />
                      <DetailItem label="Material" value={selectedItem.MATERIAL} />
                      <DetailItem label="Etiqueta" value={selectedItem.ETIQ} />
                   </div>
                   <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Características / Descripción</p>
                      <p className="text-xs text-slate-700 font-bold leading-relaxed">{selectedItem.CARACTERISTICAS || 'Sin detalles técnicos.'}</p>
                   </div>
                </DetailSection>

                {/* Categoría 4: Comunicaciones */}
                <DetailSection title="Comunicaciones y SIM" icon={<Wifi size={18}/>}>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <DetailItem label="SIM Card" value={selectedItem.TARJETA_SIM} />
                      <DetailItem label="Compañía" value={selectedItem.COMPAÑIA} />
                      <DetailItem label="Teléfono" value={selectedItem.Nº_TELEFONO} highlight />
                      <DetailItem label="IMEI 1" value={selectedItem.IMEI_1} />
                      <DetailItem label="IMEI 2" value={selectedItem.IMEI_2} />
                      <DetailItem label="Tarifa" value={selectedItem.TARIFA} />
                      <DetailItem label="PIN" value={selectedItem.PIN} />
                      <DetailItem label="PUK" value={selectedItem.PUK} />
                   </div>
                </DetailSection>

                {/* Categoría 5: Financiero */}
                <DetailSection title="Información Financiera" icon={<CreditCard size={18}/>}>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <DetailItem label="Tienda" value={selectedItem.TIENDA} />
                      <DetailItem label="Coste" value={selectedItem.COSTE} highlight />
                      <DetailItem label="Factura" value={selectedItem.FACTURA} />
                      <DetailItem label="Fecha Compra" value={selectedItem.FECHA_COMPRA} />
                      <DetailItem label="Creado Por" value={selectedItem.CREADO_POR} />
                   </div>
                </DetailSection>
             </div>

             <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0 flex gap-4">
                <button 
                  onClick={() => { setSelectedItem(null); onEdit(selectedItem); }}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 size={18}/> Editar Registro
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
       <div className="text-blue-600">{icon}</div>
       <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h4>
    </div>
    {children}
  </div>
);

const DetailItem: React.FC<{ label: string; value: any; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="space-y-1.5">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-xs font-bold truncate ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>
      {value || <span className="text-slate-200">---</span>}
    </p>
  </div>
);

export default InventoryList;
