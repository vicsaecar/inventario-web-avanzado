
import React, { useMemo } from 'react';
import { InventoryItem } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, AreaChart, Area 
} from 'recharts';
import { Download, Filter, FileBarChart2, Coins, TrendingUp, AlertTriangle, PieChart as PieIcon } from 'lucide-react';

interface ReportsProps {
  inventory: InventoryItem[];
}

const Reports: React.FC<ReportsProps> = ({ inventory }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach(item => { counts[item.tipo] = (counts[item.tipo] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);
  }, [inventory]);

  const costByCompany = useMemo(() => {
    const costs: Record<string, number> = {};
    inventory.forEach(item => {
      const val = parseFloat(item.coste?.replace(/[^\d.-]/g, '').replace(',', '.') || '0');
      if (!isNaN(val)) costs[item.empresa] = (costs[item.empresa] || 0) + val;
    });
    return Object.entries(costs)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);
  }, [inventory]);

  const valueByStatus = useMemo(() => {
    const statusCosts: Record<string, number> = {};
    inventory.forEach(item => {
      const val = parseFloat(item.coste?.replace(/[^\d.-]/g, '').replace(',', '.') || '0');
      if (!isNaN(val)) statusCosts[item.estado] = (statusCosts[item.estado] || 0) + val;
    });
    return Object.entries(statusCosts)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);
  }, [inventory]);

  const totalValue = costByCompany.reduce((acc, curr) => acc + curr.value, 0);

  const topAssets = useMemo(() => {
    return inventory
      .map(item => ({
        ...item,
        numericCost: parseFloat(item.coste?.replace(/[^\d.-]/g, '').replace(',', '.') || '0')
      }))
      .sort((a, b) => b.numericCost - a.numericCost)
      .slice(0, 5);
  }, [inventory]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Análisis de Capital IT</h2>
          <p className="text-slate-500 text-sm">Auditoría visual y financiera de activos tecnológicos.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all bg-white shadow-sm"
          >
            <Download size={16} /> Imprimir Reporte
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
             <Coins size={180} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 opacity-80 mb-4">
              <Coins size={22} />
              <span className="text-xs font-bold uppercase tracking-widest">Inversión Bruta</span>
            </div>
            <h3 className="text-4xl font-black">{totalValue.toLocaleString()} €</h3>
            <div className="mt-6 flex items-center gap-2 bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
               <TrendingUp size={14} />
               <span className="text-[10px] font-bold uppercase">Patrimonio Zubi Group</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Costo Promedio</p>
            <h3 className="text-3xl font-black text-slate-900">
              {(inventory.length > 0 ? totalValue / inventory.length : 0).toLocaleString(undefined, {maximumFractionDigits: 0})} €
            </h3>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              <span>Eficiencia de Gasto</span>
              <span className="text-emerald-500">Optimizado</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[75%]"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Activos Inactivos</p>
            <div className="flex items-center gap-3">
               <h3 className="text-3xl font-black text-slate-900">
                 {inventory.filter(i => ['baja', 'extraviado', 'bloqueo'].includes(i.estado.toLowerCase())).length}
               </h3>
               <div className="bg-orange-100 text-orange-600 p-1 rounded-md">
                  <AlertTriangle size={18} />
               </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold leading-tight mt-4 italic">
            Equipos fuera de circulación operativa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cost distribution Area Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <FileBarChart2 size={20} className="text-blue-500" />
              Inversión por Entidad
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">Capital</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costByCompany}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" hide />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `${val}€`} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`${value.toLocaleString()} €`, 'Inversión']}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Value by Status Pie Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <PieIcon size={20} className="text-purple-500" />
              Valor Retenido por Estado
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">Liquidez</span>
          </div>
          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={valueByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {valueByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} €`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Categories count Horizontal Bar Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-8 flex items-center gap-2">
            Volumen por Tipología
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={120} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Value Assets List */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-bold text-lg tracking-tight">Activos de Mayor Valor</h3>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top 5 Inversión</span>
          </div>
          <div className="space-y-4">
            {topAssets.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">
                      {i + 1}
                   </div>
                   <div>
                      <p className="font-bold text-slate-100 truncate max-w-[150px]">{item.equipo}</p>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter truncate max-w-[150px]">{item.codigo} • {item.empresa}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-lg font-black text-blue-400">{item.coste}</p>
                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest truncate max-w-[100px]">{item.asignado}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
