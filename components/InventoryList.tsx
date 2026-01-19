
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Edit3, 
  Trash2, 
  Monitor,
  Cpu,
  Smartphone,
  Search,
  X,
  MapPin,
  Tag,
  Hash,
  FileText,
  ChevronRight
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
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [viewMode, setViewMode] = useState<'standard' | 'full'>('standard');

  useEffect(() => setSearchTerm(initialSearch), [initialSearch]);

  const filteredData = useMemo(() => {
    return inventory.filter(item => {
      const searchStr = `${item.equipo} ${item.codigo} ${item.asignado} ${item.serialNumber} ${item.empresa} ${item.descripcion}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'All' || item.tipo === typeFilter;
      const matchesStatus = statusFilter === 'All' || item.estado === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [inventory, searchTerm, typeFilter, statusFilter]);

  const getIcon = (tipo: string) => {
    const t = tipo?.toLowerCase() || "";
    if (t.includes('portatil')) return <Monitor size={18} className="text-blue-500" />;
    if (t.includes('móvil') || t.includes('sim')) return <Smartphone size={18} className="text-purple-500" />;
    return <Cpu size={18} className="text-slate-400" />;
  };

  const allHeaders = [
    'ID', 'CODIGO', 'EQUIPO', 'EMPRESA', 'DESCRIPCION', 'TIPO', 'PROPIEDAD', 'CIF', 'ASIGNADO', 'CORREO', 'ADM', 'FECHA', 
    'UBICACION', 'ESTADO', 'MATERIAL', 'BEFORE', 'BYOD', 'MODELO', 'SERIAL NUMBER', 'CARACTERISTICAS', 
    'TIENDA', 'FECHA COMPRA', 'FACTURA', 'COSTE', 'CREADO POR', 'RESPONSABLE', 'DISPOSITIVO', 
    'TARJETA SIM', 'CON FECHA', 'COMPAÑIA', 'PIN', 'Nº TELEFONO', 'PUK', 'TARIFA', 'IMEI 1', 'IMEI 2', 
    'CORREO_SSO', 'ETIQ'
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[300px] relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all" size={18} />
            <input 
              type="text" placeholder="Búsqueda avanzada..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-50 border-transparent border-2 focus:border-blue-500 focus:bg-white rounded-2xl text-sm outline-none font-bold"
            />
          </div>
          <button onClick={() => setViewMode(viewMode === 'standard' ? 'full' : 'standard')} className="px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-slate-100 hover:bg-slate-50 transition-all">
            {viewMode === 'standard' ? 'Tabla Completa' : 'Vista Estándar'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="filter-select">
            <option value="All">Tipos</option>
            {CATALOG.tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="All">Estados</option>
            {CATALOG.estados.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10">
              <tr className="border-b border-slate-100">
                {viewMode === 'standard' ? (
                  <>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Activo / ID</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Empresa</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Asignado</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Descripción</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Estado</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Acción</th>
                  </>
                ) : (
                  allHeaders.map(h => (
                    <th key={h} className="px-6 py-5 text-[9px] font-black uppercase tracking-tighter text-slate-400 border-r border-slate-100 last:border-0">{h}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors cursor-pointer group" onClick={() => setSelectedItem(item)}>
                  {viewMode === 'standard' ? (
                    <>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">{getIcon(item.tipo)}</div>
                          <div>
                            <div className="font-bold text-slate-900 leading-none">{item.equipo}</div>
                            <div className="text-[10px] text-blue-600 font-black mt-1.5">{item.codigo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-slate-600 text-sm">{item.empresa}</td>
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-800">{item.asignado}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{item.ubicacion}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{item.descripcion || '---'}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          item.estado === 'Alta' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>{item.estado}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 hover:bg-white text-indigo-600 rounded-lg"><Edit3 size={16}/></button>
                          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 hover:bg-white text-rose-600 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    allHeaders.map((header, idx) => {
                      const fieldMap: Record<string, keyof InventoryItem> = {
                        'ID': 'id', 'CODIGO': 'codigo', 'EQUIPO': 'equipo', 'EMPRESA': 'empresa', 'DESCRIPCION': 'descripcion',
                        'TIPO': 'tipo', 'PROPIEDAD': 'propiedad', 'CIF': 'cif', 'ASIGNADO': 'asignado', 'CORREO': 'correo',
                        'ADM': 'adm', 'FECHA': 'fecha', 'UBICACION': 'ubicacion', 'ESTADO': 'estado', 'MATERIAL': 'material',
                        'BEFORE': 'before', 'BYOD': 'byod', 'MODELO': 'modelo', 'SERIAL NUMBER': 'serialNumber',
                        'CARACTERISTICAS': 'caracteristicas', 'TIENDA': 'tienda', 'FECHA COMPRA': 'fechaCompra',
                        'FACTURA': 'factura', 'COSTE': 'coste', 'CREADO POR': 'creadoPor', 'RESPONSABLE': 'responsable',
                        'DISPOSITIVO': 'dispositivo', 'TARJETA SIM': 'tarjetaSim', 'CON FECHA': 'conFecha',
                        'COMPAÑIA': 'compania', 'PIN': 'pin', 'Nº TELEFONO': 'numeroTelefono', 'PUK': 'puk',
                        'TARIFA': 'tarifa', 'IMEI 1': 'imei1', 'IMEI 2': 'imei2', 'CORREO_SSO': 'correoSso', 'ETIQ': 'etiq'
                      };
                      const key = fieldMap[header];
                      return <td key={idx} className="px-6 py-4 text-xs font-medium text-slate-600 border-r border-slate-50 truncate max-w-[150px]">{String(item[key] || '')}</td>;
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedItem(null)}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
                <div className="flex items-center gap-5">
                   <div className="bg-blue-600 p-4 rounded-3xl shadow-xl">{React.cloneElement(getIcon(selectedItem.tipo) as React.ReactElement<any>, { size: 28, className: 'text-white' })}</div>
                   <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{selectedItem.equipo}</h3>
                   </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><X size={24} /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <DetailBadge label="ID Interno" value={selectedItem.codigo} icon={<Hash size={14}/>} />
                   <DetailBadge label="Estado" value={selectedItem.estado} color="blue" />
                   <DetailBadge label="Categoría" value={selectedItem.tipo} icon={<Tag size={14}/>} />
                   <DetailBadge label="Ubicación" value={selectedItem.ubicacion} icon={<MapPin size={14}/>} />
                </div>
                <div className="space-y-6">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] border-b pb-2">Usuario y Empresa</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailRow label="Asignado a" value={selectedItem.asignado} />
                      <DetailRow label="Empresa" value={selectedItem.empresa} />
                      <DetailRow label="CIF" value={selectedItem.cif} />
                      <DetailRow label="Correo Corporativo" value={selectedItem.correo || '---'} />
                   </div>
                   <div className="mt-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</span>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed mt-2">{selectedItem.descripcion || 'Sin descripción.'}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      <style>{`.filter-select { @apply bg-white border-2 border-slate-100 rounded-2xl px-5 py-2.5 text-xs outline-none focus:border-blue-500 font-bold text-slate-700 shadow-sm cursor-pointer; }`}</style>
    </div>
  );
};

const DetailBadge: React.FC<any> = ({ label, value, icon, color = 'gray' }) => (
  <div className={`p-4 rounded-2xl border ${color === 'blue' ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-white border-slate-100 text-slate-900'}`}>
    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">{icon} {label}</p>
    <p className="text-xs font-black truncate">{value || '---'}</p>
  </div>
);

const DetailRow: React.FC<any> = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">{label}</span>
    <span className="text-slate-900 font-bold text-sm truncate">{value || '---'}</span>
  </div>
);

export default InventoryList;
