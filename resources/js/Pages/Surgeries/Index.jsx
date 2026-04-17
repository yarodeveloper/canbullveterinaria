import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Index({ auth, surgeries, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

    const permissions = auth.permissions || [];
    const can = (permission) => permissions.includes(permission) || auth.user.role === 'admin';

    const getStatusStyle = (status) => {
        const styles = {
            scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
            'in-progress': 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse',
            completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusLabel = (status) => {
        const labels = {
            scheduled: 'PROGRAMADA',
            'in-progress': 'EN QUIRÓFANO',
            completed: 'FINALIZADA',
            cancelled: 'CANCELADA',
        };
        return labels[status] || status.toUpperCase();
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                route('surgeries.index'),
                { search: searchTerm, status: statusFilter },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight flex items-center gap-2 uppercase tracking-tight">
                        <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span>
                        Programación Quirúrgica
                    </h2>
                    {can('manage surgeries') && (
                        <Link
                            href={route('surgeries.create')}
                            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 flex items-center gap-2 active:scale-95"
                        >
                            <span>+ Programar Cirugía</span>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Cirugías" />

            <div className="py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#1B2132] overflow-hidden shadow-sm sm:rounded-[2rem] border dark:border-gray-700/50">
                        {/* Filtros */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-gray-900/40 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="w-full md:w-1/2 relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 group-focus-within:text-brand-primary transition-colors">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar por paciente, procedimiento o cirujano..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white dark:bg-[#1B2132] border-slate-200 dark:border-gray-700 hover:border-brand-primary/50 focus:border-brand-primary focus:ring-brand-primary rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all shadow-inner"
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <span className="hidden lg:block text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Filtrar por:</span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full md:w-48 bg-white dark:bg-[#1B2132] border-slate-200 dark:border-gray-700 focus:border-brand-primary focus:ring-brand-primary rounded-xl py-2.5 px-4 text-xs font-black text-slate-700 dark:text-slate-300 shadow-sm transition-all uppercase tracking-tight"
                                >
                                    <option value="all">TODOS LOS ESTADOS</option>
                                    <option value="scheduled">Programadas</option>
                                    <option value="in-progress">En Quirófano</option>
                                    <option value="completed">Finalizadas</option>
                                    <option value="cancelled">Canceladas</option>
                                </select>
                            </div>
                        </div>

                        {/* Listado / Tabla compacta */}
                        <div className="p-0">
                            {surgeries.length > 0 ? (
                                <ul className="divide-y divide-gray-100 dark:divide-gray-800 text-slate-700 dark:text-slate-300">
                                    {surgeries.map((surgery) => (
                                        <li key={surgery.id} className="group hover:bg-brand-primary transition-all duration-150">
                                            <Link href={route('surgeries.show', surgery.id)} className="block px-5 py-2.5">
                                                <div className="flex items-center justify-between">
                                                    {/* Info Paciente y Cirugía */}
                                                    <div className="flex items-center min-w-0 gap-4 flex-1">
                                                        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20 rounded-xl flex items-center justify-center text-xl shadow-inner border dark:border-gray-700 transition-all group-hover:scale-110">
                                                            {surgery.pet.species === 'Canino' ? '🐕' : '🐈'}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-white truncate uppercase tracking-tight">
                                                                    {surgery.pet.name}
                                                                </p>
                                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border group-hover:bg-white group-hover:text-brand-primary group-hover:border-white transition-colors shadow-sm tracking-[0.1em] ${getStatusStyle(surgery.status)}`}>
                                                                    {getStatusLabel(surgery.status)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-white/80 font-bold uppercase tracking-wide truncate max-w-xl italic">
                                                                <span className="truncate">{surgery.pet.species} • {surgery.pet.breed || 'Sin Raza'} • {surgery.surgery_type}</span>
                                                                <span className="hidden sm:inline-block w-1 h-1 bg-slate-300 group-hover:bg-white/30 rounded-full"></span>
                                                                <span className="hidden sm:inline-flex items-center gap-1 font-black tracking-widest text-[9px]">
                                                                    👤 {surgery.pet.owner?.name || 'S/A'}
                                                                </span>
                                                                <span className="hidden sm:inline-block w-1 h-1 bg-slate-300 group-hover:bg-white/30 rounded-full"></span>
                                                                <span className="hidden sm:inline-flex items-center gap-1 font-black tracking-widest text-[9px] opacity-70">
                                                                    👨‍⚕️ {surgery.lead_surgeon?.name || 'S/V'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Info Fecha y Acciones */}
                                                    <div className="flex items-center gap-5 ml-4">
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-[9px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">Fecha Quirúrgica</p>
                                                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 group-hover:text-white whitespace-nowrap">
                                                                {format(new Date(surgery.scheduled_at), "d MMM • HH:mm", { locale: es }).toUpperCase()}
                                                            </p>
                                                        </div>
                                                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white border border-white shadow-sm ring-1 ring-white/50">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-20 px-6">
                                    <div className="text-6xl mb-6 opacity-20 transform hover:scale-110 transition-transform">🏥</div>
                                    <h3 className="text-xl font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                        {searchTerm || statusFilter !== 'all' ? 'No se encontraron resultados' : 'No hay cirugías programadas'}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-8">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'Intenta con otros términos de búsqueda.'
                                            : 'Administra el quirófano y protocolos quirúrgicos desde aquí.'}
                                    </p>
                                    {(!searchTerm && statusFilter === 'all' && can('manage surgeries')) && (
                                        <Link
                                            href={route('surgeries.create')}
                                            className="inline-block bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20"
                                        >
                                            Programar Primera Cirugía
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
