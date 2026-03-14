import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function Dashboard({ auth, stats, revenueData, appointmentDistribution, recentActivities }) {
    const permissions = auth.permissions || [];
    const can = (permission) => permissions.includes(permission) || auth.user.role === 'admin';

    const cards = [
        { name: 'Mascotas', value: stats.total_pets, icon: <img src="/icons/pet-dog-svgrepo-com.svg" className="w-6 h-6 icon-adaptive" alt="..." />, color: 'bg-blue-500', link: route('pets.index') },
        { name: 'Citas Hoy', value: stats.appointments_today, icon: <img src="/icons/calendar-svgrepo-com.svg" className="w-6 h-6 icon-adaptive" alt="..." />, color: 'bg-purple-500', link: route('appointments.index') },
        { name: 'Clientes', value: stats.total_clients, icon: <img src="/icons/address-svgrepo-com.svg" className="w-6 h-6 icon-adaptive" alt="..." />, color: 'bg-amber-500', link: route('clients.index') },
        { name: 'Stock Bajo', value: stats.low_stock_count, icon: <img src="/icons/box-svgrepo-com.svg" className="w-6 h-6 icon-adaptive" alt="..." />, color: 'bg-red-500', link: route('inventory.index') },
    ];

    const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444'];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black leading-tight text-white">
                        Panel de Control
                    </h2>
                    <div className="text-sm font-medium text-gray-400">
                        {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Header */}
                    <div className="mb-10 bg-gradient-to-r from-brand-primary to-brand-primary/80 p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-2">¡Hola, {auth.user.name.split(' ')[0]}! <img src="/icons/the-internet-svgrepo-com.svg" className="w-8 h-8 white-icon opacity-80" alt="" /></h1>
                            <p className="text-white/80 font-medium">Tienes {stats.appointments_today} citas programadas para el día de hoy. ¡Que sea un excelente turno!</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                        {cards.map((card, idx) => (
                            <Link
                                key={idx}
                                href={card.link}
                                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-[1.5rem] hover:border-brand-secondary transition group shadow-sm flex flex-col justify-between"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center text-2xl shadow-inner`}>
                                        {card.icon}
                                    </div>
                                    <div className="text-gray-400 group-hover:text-brand-secondary transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-wider mb-1">{card.name}</h3>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{card.value}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Revenue Chart */}
                        <div className="lg:col-span-2 space-y-8">
                            {can('view reports') && (
                                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Tendencia de Ingresos</h3>
                                            <p className="text-xs font-medium text-gray-400">Últimos 7 días de operación</p>
                                        </div>
                                        <div className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full">
                                            ACTIVO
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={revenueData}>
                                                <defs>
                                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                                    tickFormatter={(value) => `$${value}`}
                                                />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    itemStyle={{ fontSize: '12px', fontWeight: 900 }}
                                                    formatter={(value) => [`$${value}`, 'Ingresos']}
                                                />
                                                <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Appointment Distribution */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] p-8 shadow-sm">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Distribución de Consultas (Mes Actual)</h3>
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={appointmentDistribution}>
                                                <XAxis dataKey="type" hide />
                                                <Tooltip />
                                                <Bar dataKey="count" radius={[10, 10, 10, 10]}>
                                                    {appointmentDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-4">
                                        {appointmentDistribution.length > 0 ? appointmentDistribution.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 capitalize">{item.type}</span>
                                                </div>
                                                <span className="text-xs font-black text-gray-900 dark:text-white">{item.count}</span>
                                            </div>
                                        )) : (
                                            <p className="text-xs text-gray-400 italic">No hay citas este mes aún.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Actividad Reciente</h3>
                                </div>
                                <div className="space-y-6">
                                    {recentActivities.length > 0 ? recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex gap-4">
                                            <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${activity.event === 'created' ? 'bg-green-100 text-green-700' :
                                                activity.event === 'updated' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {activity.event === 'created' ? 'CRE' : activity.event === 'updated' ? 'ACT' : 'DEL'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                    {activity.user}
                                                </p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    {activity.event === 'created' ? 'registro' : activity.event === 'updated' ? 'modificó' : 'eliminó'} un {activity.model}
                                                </p>
                                                <p className="text-[9px] font-black text-gray-400 mt-1 uppercase">
                                                    {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-gray-400 text-center py-4">Sin actividad reciente</p>
                                    )}
                                </div>
                            </div>

                            {/* Low Stock Alerts */}
                            {stats.low_stock_count > 0 && (
                                <div className="bg-red-50 border border-red-100 rounded-[2rem] p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img src="/icons/bell-svgrepo-com.svg" className="w-8 h-8 text-red-600 font-bold" style={{ filter: 'invert(16%) sepia(87%) saturate(5412%) hue-rotate(352deg) brightness(94%) contrast(97%)' }} alt="Alerta" />
                                        <h3 className="text-red-900 font-black text-lg leading-tight">Alerta de Inventario</h3>
                                    </div>
                                    <p className="text-red-700 text-xs font-bold leading-relaxed mb-6">
                                        Tienes {stats.low_stock_count} productos con existencias por debajo del mínimo configurado.
                                    </p>
                                    <Link
                                        href={route('inventory.index')}
                                        className="inline-flex items-center justify-center w-full py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition"
                                    >
                                        Revisar Stock
                                    </Link>
                                </div>
                            )}

                            {/* Quote of the day (Premium detail) */}
                            <div className="bg-brand-secondary p-8 rounded-[2rem] shadow-lg shadow-secondary-100">
                                <h3 className="font-black text-brand-primary text-xl mb-4 text-center flex items-center justify-center gap-2">
                                    <img src="/icons/rocket-svgrepo-com.svg" className="w-6 h-6" style={{ filter: 'invert(37%) sepia(50%) saturate(2462%) hue-rotate(338deg) brightness(97%) contrast(99%)' }} alt="" /> Tip CanBull
                                </h3>
                                <p className="text-brand-primary/80 font-bold text-xs leading-relaxed text-center italic">
                                    "Un carnet digital completo aumenta la confianza de tus clientes y mejora el seguimiento clínico."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
