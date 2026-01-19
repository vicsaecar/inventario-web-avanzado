
import React from 'react';
import { 
  Laptop, 
  Smartphone, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  PackageCheck,
  ChevronRight,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  UserX,
  Plus,
  ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { InventoryItem, ViewType } from '../types';

interface DashboardProps {
  stats: {
    total: number;
    laptops: number;
    phones: number;
    active: number;
    value: number;
  };
  inventory: InventoryItem[];
  setView: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, inventory, setView }) => {
  const statusData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach(item => {
      // Fix: Property 'estado' changed to 'ESTADO'
      counts[item.ESTADO] = (counts[item.ESTADO] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  const companyData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach(item => {
      // Fix: Property 'empresa' changed to 'EMPRESA'
      counts[item.EMPRESA] = (counts[item.EMPRESA] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [inventory]);

  const recentAssets = React.useMemo(() => {
    // Fix: Property 'id' changed to 'ID'
    return [...inventory].sort((a, b) => b.ID - a.ID).slice(0, 4);
  }, [inventory]);

  const smartAlerts = React.useMemo(() => {
    const alerts = [];
    const highValueNoOwner = inventory.filter(i => {
      // Fix: Property 'coste' changed to 'COSTE'
      const val = parseFloat(i.COSTE?.replace(/[^\d.-]/g, '').replace(',', '.') || '0');
      // Fix: Property 'asignado' changed to 'ASIGNADO'
      return val > 500 && (i.ASIGNADO === 'Sin asignar' || !i.ASIGNADO);
    });
    
    if (highValueNoOwner.length > 0) {
      alerts.push({
        id: 'high-value',
        title: `${highValueNoOwner.length} Equipos críticos sin dueño`,
        desc: 'Activos de alto valor requieren asignación formal.',
        icon: <UserX className="text-rose-500" />,
        color: 'bg-rose-50 border-rose-100 text-rose-700'
      });
    }

    // Fix: Property 'estado' changed to 'ESTADO'
    const lostAssets = inventory.filter(i => i.ESTADO === 'Extraviado');
    if (lostAssets.length > 0) {
      alerts.push({
        id: 'lost-assets',
        title: `${lostAssets.length} Activos marcados como perdidos`,
        desc: 'Inicie protocolo de baja o rastreo inmediato.',
        icon: <ShieldAlert className="text-amber-500" />,
        color: 'bg-amber-50 border-amber-100 text-amber-700'
      });
    }

    return alerts;
  }, [inventory]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Visión Operativa</h1>
          <p className="text-slate-500 text-sm mt-3 font-medium">Estado actual del ecosistema tecnológico de Zubi.</p>
        </div>
        <button 
          onClick={() => setView('add')}
          className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus size={20}/> Registrar Activo
        </button>
      </div>

      {/* Smart Alerts Section - Horizontal Grid */}
      {smartAlerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {smartAlerts.map(alert => (
            <div key={alert.id} className={`p-6 rounded-[2rem] border-2 flex items-center gap-6 ${alert.color} animate-in zoom-in-95 duration-500 hover:scale-[1.02] transition-transform cursor-pointer shadow-sm`}>
              <div className="p-4 bg-white rounded-2xl shadow-lg shadow-black/5">
                {alert.icon}
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-tight">{alert.title}</h4>
                <p className="text-xs opacity-75 mt-1.5 font-bold">{alert.desc}</p>
              </div>
              <ChevronRight className="ml-auto opacity-40" size={20} />
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards - Refined */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Volumen Activos" value={stats.total} icon={<PackageCheck className="text-blue-600" />} trend="Historial consolidado" color="bg-blue-50" />
        <StatCard label="Cómputo / PC" value={stats.laptops} icon={<Laptop className="text-indigo-600" />} trend="Core de la empresa" color="bg-indigo-50" />
        <StatCard label="Disponibilidad" value={`${stats.total > 0 ? Math.round((stats.active/stats.total)*100) : 0}%`} icon={<Activity className="text-emerald-600" />} trend="Tasa de operatividad" color="bg-emerald-50" />
        <StatCard label="Capital Invertido" value={`${stats.value.toLocaleString()} €`} icon={<DollarSign className="text-amber-600" />} trend="Valor adquisición" color="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Company Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-black text-slate-900 text-xl flex items-center gap-3 uppercase tracking-tighter">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              Impacto por Entidad
            </h3>
            <button onClick={() => setView('reports')} className="text-xs font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-all flex items-center gap-2">
              Ver Reportes <ArrowUpRight size={14}/>
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tick={{fontWeight: 700}} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tick={{fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: 800}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={48}>
                  {companyData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown - Circular */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-black text-slate-900 text-xl mb-10 flex items-center gap-3 uppercase tracking-tighter">
             <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
             Estados
          </h3>
          <div className="h-60 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={10} dataKey="value" stroke="none">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900 leading-none">{stats.total}</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Total</span>
            </div>
          </div>
          <div className="mt-10 space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {statusData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-900">{item.value}</span>
                  <span className="text-[11px] text-slate-300 font-black">{stats.total > 0 ? Math.round((item.value/stats.total)*100) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-slate-900 text-xl flex items-center gap-3 uppercase tracking-tighter">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            Últimos Activos Registrados
          </h3>
          <button onClick={() => setView('inventory')} className="text-xs font-black text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2">
            Ver todo el inventario <ArrowRight size={14}/>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentAssets.map(item => (
            // Fix: Property 'id' changed to 'ID'
            <div key={item.ID} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer" onClick={() => setView('inventory')}>
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 group-hover:scale-110 transition-transform">
                   <PackageCheck className="text-blue-600" size={18}/>
                </div>
                {/* Fix: Property 'codigo' changed to 'CODIGO' */}
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">{item.CODIGO}</span>
              </div>
              {/* Fix: Property 'equipo' changed to 'EQUIPO' */}
              <h4 className="font-bold text-slate-800 truncate mb-1">{item.EQUIPO}</h4>
              {/* Fix: Property 'asignado' changed to 'ASIGNADO' */}
              <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{item.ASIGNADO}</p>
              {/* Fix: Property 'descripcion' changed to 'DESCRIPCION' */}
              <p className="text-[9px] text-slate-300 font-medium italic truncate mt-1">{item.DESCRIPCION || 'Sin descripción'}</p>
            </div>
          ))}
          {recentAssets.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-400 font-medium">No hay activos registrados recientemente.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; trend: string; color: string; }> = ({ label, value, icon, trend, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-default">
    <div className="flex justify-between items-start">
      <div className={`p-4 rounded-3xl ${color} group-hover:scale-110 transition-transform shadow-sm`}>{icon}</div>
      <div className="text-right">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <h4 className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{value}</h4>
      </div>
    </div>
    <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
      <p className="text-[11px] text-slate-500 font-bold flex items-center gap-2 uppercase tracking-tight">
        <Clock size={14} className="text-emerald-500" /> {trend}
      </p>
      <div className="w-1.5 h-1.5 rounded-full bg-slate-100 group-hover:bg-blue-600 transition-colors"></div>
    </div>
  </div>
);

export default Dashboard;
