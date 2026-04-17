import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS = {
    scheduled: { label: 'PROGRAMADA', text: 'text-blue-700 bg-blue-50 border-blue-200' },
    completed: { label: 'COMPLETADA', text: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    cancelled: { label: 'CANCELADA', text: 'text-red-700 bg-red-50 border-red-200' },
};

export default function Index({ auth, euthanasias, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');

    const permissions = auth.permissions || [];
    const can = (permission) => permissions.includes(permission) || auth.user.role === 'admin';

    const applyFilters = (newFilters) => {
        router.get(route('euthanasias.index'), newFilters, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight flex items-center gap-2 uppercase tracking-tight">
                        <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span>
                        Gestión de Eutanasia
                    </h2>
                    {can('manage euthanasias') && (
                        <Link
                            href={route('euthanasias.create')}
                            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 flex items-center gap-2 active:scale-95"
                        >
                            <span>+ Nuevo Registro</span>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Eutanasia — Registros" />

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
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); applyFilters({ search: e.target.value, status }); }}
                                    placeholder="Buscar por paciente o folio..."
                                    className="w-full bg-white dark:bg-[#1B2132] border-slate-200 dark:border-gray-700 hover:border-brand-primary/50 focus:border-brand-primary focus:ring-brand-primary rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all shadow-inner"
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <span className="hidden lg:block text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Filtrar por:</span>
                                <select
                                    value={status}
                                    onChange={e => { setStatus(e.target.value); applyFilters({ search, status: e.target.value }); }}
                                    className="w-full md:w-48 bg-white dark:bg-[#1B2132] border-slate-200 dark:border-gray-700 focus:border-brand-primary focus:ring-brand-primary rounded-xl py-2.5 px-4 text-xs font-black text-slate-700 dark:text-slate-300 shadow-sm transition-all uppercase tracking-tight"
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="scheduled">Programada</option>
                                    <option value="completed">Completada</option>
                                    <option value="cancelled">Cancelada</option>
                                </select>
                            </div>
                        </div>

                        {/* Listado */}
                        <div className="p-0">
                            {euthanasias.length === 0 ? (
                                <div className="text-center py-20 px-6">
                                    <div className="text-6xl mb-6 opacity-20 transform hover:scale-110 transition-transform">🕊️</div>
                                    <h3 className="text-xl font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Sin registros</h3>
                                    <p className="text-slate-500 text-sm mb-8">No hay procedimientos que coincidan con los filtros.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100 dark:divide-gray-800 text-slate-700 dark:text-slate-300">
                                    {euthanasias.map(e => (
                                        <li key={e.id} className="group hover:bg-brand-primary transition-all duration-150">
                                            <Link href={route('euthanasias.show', e.id)} className="block px-5 py-2.5">
                                                <div className="flex items-center justify-between">
                                                    {/* Info Paciente y Motivo */}
                                                    <div className="flex items-center min-w-0 gap-4 flex-1">
                                                        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20 rounded-xl flex items-center justify-center text-lg font-black text-purple-600 group-hover:text-white shadow-inner border dark:border-gray-700 transition-all group-hover:scale-110">
                                                            {e.pet?.name?.charAt(0) || 'P'}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-white truncate uppercase tracking-tight">
                                                                    {e.pet?.name || 'Paciente Desconocido'}
                                                                </p>
                                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border group-hover:bg-white group-hover:text-brand-primary group-hover:border-white transition-colors shadow-sm tracking-[0.1em] ${STATUS[e.status]?.text}`}>
                                                                    {STATUS[e.status]?.label}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-white/80 font-bold uppercase tracking-wide truncate max-w-xl italic">
                                                                <span className="truncate">{e.pet?.species || '-'} • {e.pet?.breed || 'Sin Raza'} • {e.reason || 'S/M'}</span>
                                                                <span className="hidden sm:inline-block w-1 h-1 bg-slate-300 group-hover:bg-white/30 rounded-full"></span>
                                                                <span className="hidden sm:inline-flex items-center gap-1 font-black tracking-widest text-[9px]">
                                                                    👤 {e.pet?.owner?.name || 'S/A'}
                                                                </span>
                                                                <span className="hidden sm:inline-block w-1 h-1 bg-slate-300 group-hover:bg-white/30 rounded-full"></span>
                                                                <span className="hidden sm:inline-flex items-center gap-1 font-black tracking-widest text-[9px] opacity-70">
                                                                    👨‍⚕️ {e.veterinarian?.name || 'S/V'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Fecha y Folio */}
                                                    <div className="flex items-center gap-5 ml-4">
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-[9px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">Procedimiento</p>
                                                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 group-hover:text-white whitespace-nowrap">
                                                                {e.performed_at ? format(new Date(e.performed_at), "d MMM • HH:mm", { locale: es }).toUpperCase() : 'PENDIENTE'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right hidden lg:block w-20">
                                                            <p className="text-[9px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">Folio</p>
                                                            <p className="text-[10px] font-mono font-black text-slate-500 group-hover:text-white/90">
                                                                {e.folio}
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
