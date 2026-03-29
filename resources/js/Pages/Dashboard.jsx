import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard({ auth, stats, peakHours = [], appointmentsByType = [], revenueData = [], hospitalizationOccupancy = [], dailyPatients = [], yearlySales = [], recentActivities = [], adminMetrics, vetMetrics, receptionMetrics, filters }) {
    
    // COLORS CONFIG
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

    const handleDateChange = (e, field) => {
        const newFilters = { ...filters, [field]: e.target.value };
        router.get(route('dashboard'), newFilters, { preserveState: true, replace: true, preserveScroll: true });
    };

    // Helper for Stat Cards (High Density)
    const StatCard = ({ title, value, icon, trend, colorClass = "bg-brand-primary/10 text-brand-primary" }) => (
        <div className="bg-white dark:bg-[#1B2132] p-5 rounded-[1.8rem] border dark:border-slate-700/50 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all border-b-4 border-b-transparent hover:border-b-brand-primary">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-70 italic group-hover:opacity-100 transition-opacity">{title}</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none group-hover:scale-105 transition-transform origin-left">{value}</h4>
                {trend && <span className="text-[8px] font-bold text-emerald-500 mt-1 block uppercase tracking-tighter">↑ {trend} respecto al mes pasado</span>}
            </div>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:rotate-6 transition-transform ${colorClass}`}>
                {icon}
            </div>
        </div>
    );

    const isAdmin = auth.user.role === 'admin' && !!adminMetrics;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight flex items-center gap-2 uppercase tracking-tight">
                        <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span>
                        Dashboard Inteligente
                    </h2>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border dark:border-slate-700">
                        <input 
                            type="date" 
                            value={filters?.start_date || ''} 
                            onChange={(e) => handleDateChange(e, 'start_date')}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-tighter text-slate-500 focus:ring-0 p-1"
                        />
                        <span className="text-slate-300">/</span>
                        <input 
                            type="date" 
                            value={filters?.end_date || ''} 
                            onChange={(e) => handleDateChange(e, 'end_date')}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-tighter text-slate-500 focus:ring-0 p-1"
                        />
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Principal" />

            <div className="py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* TOP SUMMARY (Primary Metrics) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard 
                            title="Agenda Hoy" 
                            value={stats?.appointments_today || 0} 
                            icon="📅" 
                            colorClass="bg-brand-primary/10 text-brand-primary"
                        />
                         <StatCard 
                            title="Total Pacientes Atendidos" 
                            value={stats?.total_patients_attended || 0} 
                            icon="🐾" 
                            colorClass="bg-indigo-50 text-indigo-600"
                        />
                         <StatCard 
                            title="Ventas del Día" 
                            value={"$" + (receptionMetrics?.sales_today || 0).toLocaleString()} 
                            icon="💰" 
                            colorClass="bg-emerald-50 text-emerald-600"
                        />
                        <StatCard 
                            title="Total Mascotas" 
                            value={receptionMetrics?.total_pets || 0} 
                            icon="🐶" 
                            colorClass="bg-amber-50 text-amber-600"
                        />
                    </div>

                    {/* YEARLY SALES TREND (Restored & Improved) */}
                    {isAdmin && (
                        <div className="bg-[#1B2132] dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl border border-white/5 overflow-hidden group">
                           <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">Tendencia de Ingresos Anual</h3>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-2">Crecimiento operativo mensual - {(new Date()).getFullYear()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Total Facturado Anual</p>
                                    <p className="text-3xl font-black text-white tracking-tighter">${(yearlySales.reduce((acc, curr) => acc + curr.revenue, 0)).toLocaleString()}</p>
                                </div>
                           </div>
                           <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={yearlySales}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: '800'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: '800'}} tickFormatter={(v) => `$${v >= 1000 ? v/1000 + 'k' : v}`} />
                                        <Tooltip contentStyle={{ borderRadius: '1.2rem', backgroundColor: '#1B2132', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontWeight: '800' }} />
                                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                           </div>
                        </div>
                    )}

                    {/* BUSINESS METRICS ROW */}
                    {isAdmin && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Participación de Ventas por Rubro (Improved) */}
                            <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 p-6 shadow-sm overflow-hidden flex flex-col">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic leading-none">Participación por Rubro</h3>
                                <div className="h-[250px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={adminMetrics.sales_by_type || []}
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={5}
                                                dataKey="total"
                                                nameKey="rubro"
                                            >
                                                {(adminMetrics.sales_by_type || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{ borderRadius: '1rem', fontSize: '10px', fontWeight: '800' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Ingreso Tot.</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">${(adminMetrics.total_revenue_month || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 border-t dark:border-slate-700 pt-4">
                                    {(adminMetrics.sales_by_type || []).slice(0, 6).map((item, idx) => (
                                        <div key={idx} className="flex flex-col">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                                                <span className="text-[9px] font-black uppercase text-slate-500 truncate">{item.rubro}</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 pl-3">${(item.total || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ventas por Colaborador */}
                            <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 p-6 shadow-sm overflow-hidden">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic leading-none">Ventas por Colaborador</h3>
                                <div className="space-y-5">
                                    {(adminMetrics.sales_by_seller || []).map((item, idx) => (
                                        <div key={idx} className="group">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-inner">
                                                        {item.seller_name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold uppercase tracking-tight text-slate-900 dark:text-white leading-none mb-1 truncate">{item.seller_name}</span>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{item.tickets || 0} tickets emitidos</span>
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-black text-brand-primary tracking-tighter leading-none">${parseFloat(item.total).toLocaleString()}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden border dark:border-slate-700/50 shadow-inner">
                                                <div 
                                                    className="h-full bg-brand-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                                                    style={{ width: `${(adminMetrics.total_revenue_month > 0 ? (item.total / adminMetrics.total_revenue_month) * 100 : 0)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ventas por Tipo de Servicio (Visual Detail) */}
                            <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 p-6 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic leading-none">Ventas por Tipo de Servicio</h3>
                                <div className="h-[180px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={adminMetrics.sales_by_type || []} layout="vertical">
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="rubro" type="category" hide />
                                            <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '800' }} />
                                            <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {(adminMetrics.sales_by_type || []).slice(0, 4).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[10px] bg-slate-50/50 dark:bg-slate-900/40 p-2 rounded-xl border dark:border-slate-800">
                                            <span className="font-black text-slate-500 uppercase tracking-widest truncate max-w-[60%]">{item.rubro}</span>
                                            <span className="font-bold text-slate-900 dark:text-white italic">{item.sales_count} atenciones</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* PULSE ROW (Clinical & Activities) */}
                    <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
                        
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Tendencia de Pacientes Atendidos */}
                            <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">Tendencia de Pacientes (7 días)</h3>
                                    <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-xl">
                                        <p className="text-[8px] font-black uppercase tracking-widest leading-none">Último día</p>
                                        <p className="text-sm font-black leading-none mt-1">{dailyPatients.length > 0 ? dailyPatients[dailyPatients.length - 1].count : 0} PAC.</p>
                                    </div>
                                </div>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={dailyPatients}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: '800'}} />
                                            <YAxis hide />
                                            <Tooltip contentStyle={{ borderRadius: '1rem', fontSize: '9px', fontWeight: '800' }} />
                                            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} dot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Peak Hours Chart */}
                            <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 p-6 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic">Carga Operativa por Horas</h3>
                                <div className="h-[150px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={peakHours}>
                                            <defs>
                                                <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: '800'}} tickFormatter={(v) => `${v}:00`} />
                                            <YAxis hide />
                                            <Tooltip contentStyle={{ borderRadius: '1rem', fontSize: '10px', fontWeight: '800' }} labelFormatter={(v) => `${v}:00 hrs`} />
                                            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPeak)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT SIDEBAR (Pulse of the Clinic) */}
                        <div className="space-y-6">
                            
                             {/* Agendamientos por Tipo */}
                             <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 p-6 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Agenda por tipo</h3>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    {(appointmentsByType || []).map((item, idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border dark:border-slate-800 flex flex-col items-center text-center">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 italic grow">{item.type || 'S/M'}</span>
                                            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">{item.total}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Medical Capacity */}
                            <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 overflow-hidden shadow-sm">
                                <div className="p-5 border-b dark:border-slate-700/50 bg-slate-50/50 dark:bg-gray-900/30 font-black text-[10px] text-slate-400 uppercase tracking-widest italic">
                                    Ocupación Hospitalaria
                                </div>
                                <div className="p-5">
                                    <div className="h-[80px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={hospitalizationOccupancy}>
                                                <Line type="stepAfter" dataKey="count" stroke="#ef4444" strokeWidth={3} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-[10px] font-black">
                                            <span className="text-slate-400 uppercase tracking-widest">En Hospital</span>
                                            <span className="text-rose-500 uppercase">{vetMetrics?.active_hospitalizations || 0} pacientes</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black">
                                            <span className="text-slate-400 uppercase tracking-widest">Cirugías Pend.</span>
                                            <span className="text-amber-500 uppercase">{vetMetrics?.pending_surgeries || 0} programadas</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bitácora de Actividad */}
                            <div className="bg-white dark:bg-[#1B2132] rounded-[2.2rem] border dark:border-slate-700/50 overflow-hidden shadow-sm">
                                <div className="p-5 border-b dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/30">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Bitácora Global</h4>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {recentActivities.map((log) => (
                                        <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 group transition-colors">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] shadow-inner group-hover:scale-110 transition-transform">
                                                {log.model === 'MedicalRecord' ? '🩺' : log.model === 'Receipt' ? '🧾' : '📝'}
                                            </div>
                                            <div className="min-w-0 pr-2">
                                                <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate leading-tight">
                                                    {log.user?.split(' ')[0] || 'Sistema'} <span className="text-slate-400 italic lowercase font-normal">{log.event}</span> {log.model}
                                                </p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{log.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
