import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import { useState } from 'react';

export default function Dashboard({ auth, role, stats, revenueData, appointmentDistribution, hospitalizationOccupancy, recentActivities, adminMetrics, vetMetrics, receptionMetrics, filters }) {
    const permissions = auth.permissions || [];
    const isAdmin = role === 'admin';
    const isVet = role === 'veterinarian' || isAdmin;
    const isReception = role === 'receptionist' || isAdmin;

    const [dateRange, setDateRange] = useState({
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || ''
    });

    const handleFilter = () => {
        router.get(route('dashboard'), dateRange, { preserveState: true });
    };

    // --- CARDS DINÁMICAS POR ROL ---
    const getTopCards = () => {
        let cards = [];
        if (isAdmin) {
            cards = [
                { name: 'Ingresos (Mes)', value: `$${adminMetrics.total_revenue_month.toLocaleString()}`, icon: <img src="/icons/bank-svgrepo-com.svg" className="w-7 h-7 white-icon" />, color: 'bg-emerald-500', link: route('dashboard') },
                { name: 'Egreso (Mes)', value: `$${adminMetrics.total_expenses_month.toLocaleString()}`, icon: <img src="/icons/chart-pie-svgrepo-com.svg" className="w-7 h-7 white-icon" />, color: 'bg-rose-500', link: route('cash.index') },
                { name: 'Valor Inventario', value: `$${adminMetrics.inventory_value_cost.toLocaleString()}`, icon: <img src="/icons/box-svgrepo-com.svg" className="w-7 h-7 white-icon" />, color: 'bg-indigo-500', link: route('inventory.index') },
                { name: 'Citas Hoy', value: stats.appointments_today, icon: <img src="/icons/calendar-svgrepo-com.svg" className="w-7 h-7 white-icon" />, color: 'bg-amber-500', link: route('appointments.index') },
            ];
        } else if (role === 'veterinarian') {
            cards = [
                { name: 'Consultas Hoy', value: vetMetrics.medical_records_today, icon: <img src="/icons/file-3-svgrepo-com.svg" className="w-7 h-7 white-icon" />, color: 'bg-indigo-500', link: route('pets.index') },
                { name: 'Hospitalizados', value: vetMetrics.active_hospitalizations, icon: <img src="/icons/med-kit-svgrepo-com.svg" className="w-7 h-7 white-icon" />, color: 'bg-emerald-500', link: route('hospitalizations.index') },
                { name: 'Cirugías Hoy', value: vetMetrics.surgeries_today, icon: <img src="/icons/band-aid-svgrepo-com.svg" className="w-7 h-7 white-icon" />, color: 'bg-rose-500', link: route('surgeries.index') },
                { name: 'Citas Hoy', value: stats.appointments_today, icon: <img src="/icons/calendar-svgrepo-com.svg" className="w-7 h-7 white-icon" />, color: 'bg-amber-500', link: route('appointments.index') },
            ];
        } else { // Receptionist
            cards = [
                { name: 'Venta Hoy', value: `$${receptionMetrics.sales_today.toLocaleString()}`, icon: <img src="/icons/bank-svgrepo-com.svg" className="w-7 h-7 white-icon" />, color: 'bg-emerald-500', link: route('receipts.create') },
                { name: 'Citas Hoy', value: stats.appointments_today, icon: <img src="/icons/calendar-svgrepo-com.svg" className="w-7 h-7 white-icon" />, color: 'bg-amber-500', link: route('appointments.index') },
                { name: 'Nuevos Clientes', value: receptionMetrics.new_clients_today, icon: <img src="/icons/woman-svgrepo-com.svg" className="w-7 h-7 white-icon" />, color: 'bg-blue-500', link: route('clients.index') },
                { name: 'CxC Pendientes', value: receptionMetrics.pending_payments, icon: <img src="/icons/clock-svgrepo-com.svg" className="w-7 h-7 white-icon" />, color: 'bg-indigo-500', link: route('cash-register.index') },
            ];
        }
        return cards;
    };

    const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                             <img src="/icons/imac-svgrepo-com.svg" className="w-6 h-6 white-icon" alt="" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                Dashboard {isAdmin ? 'Administrativo' : role === 'veterinarian' ? 'Médico' : 'Operativo'}
                            </h2>
                            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">{auth.user.branch?.name || 'Sucursal CanBull'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <p className="text-xs font-black text-slate-800 dark:text-white">{new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date().toLocaleDateString('es-MX', { weekday: 'long' })}</p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8 px-4 sm:px-0 bg-slate-50/50 dark:bg-slate-900/20 min-h-screen">
                <div className="mx-auto max-w-7xl">
                    
                    {/* Filtros de Fecha */}
                    {isAdmin && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex-1 w-full sm:max-w-xs">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Inicial</label>
                            <input 
                                type="date" 
                                value={dateRange.start_date}
                                onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm focus:ring-brand-primary text-sm"
                            />
                        </div>
                        <div className="flex-1 w-full sm:max-w-xs">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Final</label>
                            <input 
                                type="date" 
                                value={dateRange.end_date}
                                onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm focus:ring-brand-primary text-sm"
                            />
                        </div>
                        <button 
                            onClick={handleFilter}
                            className="w-full sm:w-auto bg-brand-primary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20 h-[42px] uppercase text-xs tracking-widest"
                        >
                            Filtrar
                        </button>
                    </div>
                    )}

                    {/* Main Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {getTopCards().map((card, idx) => (
                            <Link key={idx} href={card.link} className="group relative">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-${card.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                                            {card.icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{card.name}</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{card.value}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Charts Area */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* GRÁFICA DE INGRESOS (Rol Admin ve comparativo, otros ven tendencia) */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white">
                                            {isAdmin ? 'Ingresos vs Egresos' : 'Tendencia de Ventas'}
                                        </h3>
                                        <p className="text-xs font-medium text-gray-400">Últimos 7 días de operación</p>
                                    </div>
                                    <div className="flex gap-2">
                                         <div className="flex items-center gap-4 text-[10px] font-black uppercase">
                                             <div className="flex items-center gap-2 text-indigo-500">
                                                 <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Ingresos
                                             </div>
                                             {isAdmin && (
                                                 <div className="flex items-center gap-2 text-rose-500">
                                                     <span className="w-2 h-2 bg-rose-500 rounded-full"></span> Egresos
                                                 </div>
                                             )}
                                         </div>
                                    </div>
                                </div>
                                <div className="h-[320px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueData}>
                                            <defs>
                                                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(val) => `$${val}`} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                            <Area type="monotone" dataKey={isAdmin ? "ingresos" : "total"} stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorIn)" />
                                            {isAdmin && <Area type="monotone" dataKey="egresos" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorOut)" />}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                             {/* NUEVAS GRÁFICAS ADMIN */}
                             {isAdmin && (
                                 <div className="grid md:grid-cols-2 gap-8">
                                     {/* Ventas por Rubro */}
                                     {adminMetrics.sales_by_type && adminMetrics.sales_by_type.length > 0 && (
                                     <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-sm text-center">
                                         <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest border-b pb-4 dark:border-gray-700">Ventas por Rubro</h3>
                                         <div className="h-[250px] mb-6">
                                             <ResponsiveContainer width="100%" height="100%">
                                                 <PieChart>
                                                     <Pie data={adminMetrics.sales_by_type} dataKey="total" nameKey="rubro" cx="50%" cy="50%" outerRadius={80} label={(entry) => entry.rubro.substring(0, 10) + '...'}>
                                                         {adminMetrics.sales_by_type.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                     </Pie>
                                                     <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                                                 </PieChart>
                                             </ResponsiveContainer>
                                         </div>
                                     </div>
                                     )}

                                     {/* Ventas por Vendedor */}
                                     {adminMetrics.sales_by_seller && adminMetrics.sales_by_seller.length > 0 && (
                                     <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-sm text-center">
                                         <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest border-b pb-4 dark:border-gray-700">Ventas por Vendedor</h3>
                                         <div className="h-[250px] mb-6">
                                             <ResponsiveContainer width="100%" height="100%">
                                                 <BarChart data={adminMetrics.sales_by_seller} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                                     <XAxis type="number" tickFormatter={(val) => `$${val}`} tick={{ fontSize: 10 }} />
                                                     <YAxis type="category" dataKey="seller_name" tick={{ fontSize: 10 }} width={80} />
                                                     <Tooltip formatter={(val) => `$${Number(val).toLocaleString()}`} />
                                                     <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={20}>
                                                         {adminMetrics.sales_by_seller.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index+1) % COLORS.length]} />)}
                                                     </Bar>
                                                 </BarChart>
                                             </ResponsiveContainer>
                                         </div>
                                     </div>
                                     )}
                                     
                                     {/* Egresos por Descripción */}
                                     {adminMetrics.expenses_by_description && adminMetrics.expenses_by_description.length > 0 && (
                                     <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-sm">
                                         <h3 className="text-sm font-black text-rose-600 mb-6 uppercase tracking-widest text-center border-b pb-4 dark:border-rose-900/20">Egresos Principales</h3>
                                         <div className="grid grid-cols-1 gap-3">
                                             {adminMetrics.expenses_by_description.map((item, idx) => (
                                                 <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                                     <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[150px]" title={item.description}>{item.description}</span>
                                                     <span className="text-xs font-black text-rose-500">${Number(item.total).toLocaleString()}</span>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                     )}

                                     {/* Métodos de Pago */}
                                     {adminMetrics.sales_by_payment_method && adminMetrics.sales_by_payment_method.length > 0 && (
                                     <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-sm">
                                         <h3 className="text-sm font-black text-emerald-600 mb-6 uppercase tracking-widest text-center border-b pb-4 dark:border-emerald-900/20">Métodos de Pago</h3>
                                         <div className="grid grid-cols-1 gap-3">
                                             {adminMetrics.sales_by_payment_method.map((item, idx) => (
                                                 <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-50 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/20">
                                                     <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">{item.payment_method}</span>
                                                     <span className="text-xs font-black text-emerald-600">${Number(item.total).toLocaleString()}</span>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                     )}
                                 </div>
                             )}

                            <div className="grid md:grid-cols-2 gap-8">
                                {isVet && (
                                    <>
                                        {/* Distribución Médica */}
                                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-sm">
                                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-center border-b pb-4 dark:border-gray-700">Canalización de Consultas</h3>
                                            <div className="h-[200px] mb-6">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={appointmentDistribution}>
                                                        <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={30}>
                                                            {appointmentDistribution.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Bar>
                                                        <Tooltip />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {appointmentDistribution.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl border border-slate-50 dark:border-slate-800">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{item.type}</span>
                                                        </div>
                                                        <span className="text-xs font-black text-slate-800 dark:text-white">{item.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Ocupación Hospitalaria */}
                                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-sm">
                                            <h3 className="text-sm font-black text-emerald-600 mb-6 uppercase tracking-widest text-center border-b pb-4 dark:border-emerald-900/20">Monitor de Internados</h3>
                                            <div className="h-[200px] mb-6">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={hospitalizationOccupancy}>
                                                        <Area type="stepAfter" dataKey="count" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.1} />
                                                        <Tooltip />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl text-center">
                                                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Carga Actual</p>
                                                <p className="text-lg font-black text-emerald-950 dark:text-emerald-400">{vetMetrics.active_hospitalizations} Pacientes</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity Sidebar */}
                        <div className="space-y-8">
                            
                            {/* Inventory Alert Card (Admin y Recepción) */}
                            {isAdmin && adminMetrics.low_stock_all > 0 && (
                                <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-500/20">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-3xl">🗃️</span>
                                        <div>
                                            <h3 className="font-black text-lg leading-tight uppercase">Resurtido</h3>
                                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Alerta de Almacén</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium opacity-90 leading-relaxed mb-6">
                                        Hay <span className="font-black text-lg">{adminMetrics.low_stock_all}</span> productos por debajo del stock mínimo. Esto puede afectar las ventas de mañana.
                                    </p>
                                    <Link href={route('inventory.index')} className="block w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-center text-xs font-black uppercase tracking-widest transition-colors backdrop-blur-sm">
                                        Gestionar Compra
                                    </Link>
                                </div>
                            )}

                            {/* Actividad */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-sm">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-8 border-b pb-4 dark:border-gray-700">Operación Reciente</h3>
                                <div className="space-y-6">
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex gap-4 items-start">
                                            <div className={`mt-1 min-w-[8px] h-8 rounded-full ${activity.event === 'created' ? 'bg-emerald-500' : 'bg-indigo-500'} flex items-center justify-center p-1`}>
                                                 <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-800 dark:text-white truncate">{activity.user}</p>
                                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize">
                                                    {activity.event} {activity.model}
                                                </p>
                                                <p className="text-[9px] font-black text-brand-primary/60 uppercase mt-1 tracking-tighter">
                                                    {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tip Contextual */}
                            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl">
                                <h3 className="text-brand-primary font-black text-xs uppercase tracking-[0.2em] mb-4">CanBull Intelligence</h3>
                                <p className="text-slate-300 text-[11px] font-medium leading-relaxed italic">
                                    {isAdmin ? '"El valor del inventario ha subido un 12%. Revisa los productos próximos a caducar para evitar mermas financieras."' :
                                     role === 'veterinarian' ? '"El tiempo promedio de consulta técnica es de 25 min. Mantén el ritmo para no saturar la sala de espera."' :
                                     '"La mayoría de las cancelaciones ocurren en el turno vespertino. Implementa recordatorios vía WhatsApp 2 horas antes de la cita."'}
                                </p>
                            </div>

                            {/* MÁRGENES DE UTILIDAD (Solo Admin) */}
                            {isAdmin && (
                                <div className="bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/30 rounded-[2.5rem] p-8 shadow-sm">
                                    <h3 className="text-sm font-black text-indigo-600 mb-6 uppercase tracking-widest border-b pb-4 dark:border-indigo-900/20">Análisis de Márgenes</h3>
                                    
                                    <div className="flex items-center justify-between mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl">
                                         <div>
                                             <p className="text-[10px] font-black text-indigo-500 uppercase">Margen Bruto (Mes)</p>
                                             <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400">{adminMetrics.gross_margin_percentage}%</p>
                                         </div>
                                         <div className="w-12 h-12 bg-white dark:bg-indigo-700 rounded-xl flex items-center justify-center shadow-sm">
                                             <span className="text-xl">📈</span>
                                         </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Utilidad por Categoría</p>
                                        {adminMetrics.category_margins.map((item, idx) => (
                                            <div key={idx} className="space-y-1.5">
                                                <div className="flex justify-between text-[11px] font-bold">
                                                    <span className="text-slate-600 dark:text-slate-300">{item.category}</span>
                                                    <span className="text-indigo-600 font-black">{item.margin}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-indigo-500 rounded-full" 
                                                        style={{ width: `${Math.min(item.margin, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
