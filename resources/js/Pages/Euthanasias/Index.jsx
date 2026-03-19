import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS = {
    scheduled: { label: 'PROGRAMADA', color: 'bg-blue-500', text: 'text-blue-700 bg-blue-50 border-blue-200' },
    completed: { label: 'COMPLETADA', color: 'bg-emerald-500', text: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    cancelled: { label: 'CANCELADA', color: 'bg-red-500',    text: 'text-red-700 bg-red-50 border-red-200' },
};

export default function Index({ auth, euthanasias, filters }) {
    const [search, setSearch]   = useState(filters?.search || '');
    const [status, setStatus]   = useState(filters?.status || 'all');

    const permissions = auth.permissions || [];
    const can = (permission) => permissions.includes(permission) || auth.user.role === 'admin';

    const applyFilters = (newFilters) => {
        router.get(route('euthanasias.index'), newFilters, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Eutanasia — Registros" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-2xl">🕊️</div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Eutanasia</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Registro y control de procedimientos</p>
                            </div>
                        </div>
                    </div>
                    {can('manage euthanasias') && (
                        <Link
                            href={route('euthanasias.create')}
                            className="inline-flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 dark:shadow-none hover:opacity-90 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                            Nuevo Registro
                        </Link>
                    )}
                </div>

                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); applyFilters({ search: e.target.value, status }); }}
                            placeholder="Buscar por paciente o folio..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={e => { setStatus(e.target.value); applyFilters({ search, status: e.target.value }); }}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="scheduled">Programada</option>
                        <option value="completed">Completada</option>
                        <option value="cancelled">Cancelada</option>
                    </select>
                </div>

                {/* Listado */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-0">
                    {euthanasias.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <span className="text-5xl mb-3">🕊️</span>
                            <p className="font-bold">Sin registros</p>
                            <p className="text-xs mt-1">No hay procedimientos que coincidan con los filtros.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {euthanasias.map(e => (
                                <li key={e.id} className="group hover:bg-brand-primary transition-colors">
                                    <Link href={route('euthanasias.show', e.id)} className="block px-6 py-5">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            
                                            {/* Info Paciente y Motivo */}
                                            <div className="flex items-center min-w-0 gap-5 flex-1 relative w-full sm:w-auto">
                                                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xl font-black text-purple-600 group-hover:scale-110 transition-transform group-hover:bg-white/20 group-hover:text-white">
                                                    {e.pet?.name?.charAt(0) || 'P'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-base font-black text-slate-800 dark:text-slate-200 group-hover:text-white truncate">
                                                            {e.pet?.name || 'Paciente Desconocido'}
                                                        </p>
                                                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest group-hover:bg-white group-hover:text-brand-primary group-hover:border-white ${STATUS[e.status]?.text}`}>
                                                            {STATUS[e.status]?.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 group-hover:text-white/80 font-bold uppercase tracking-wide truncate">
                                                        <span>{e.pet?.species || '-'} • {e.pet?.breed || '-'}</span>
                                                        <span className="hidden sm:inline-block w-1 h-1 bg-slate-300 group-hover:bg-white/30 rounded-full"></span>
                                                        <span className="max-w-[100px] truncate" title={e.reason}>{e.reason || 'Sin motivo especificado'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Fecha, Veterinario, y Folio */}
                                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                <div className="text-left sm:text-right">
                                                    <p className="text-[10px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5">Veterinario</p>
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-white truncate max-w-[120px]">
                                                        👨‍⚕️ {e.veterinarian?.name || 'Sin Asignar'}
                                                    </p>
                                                </div>

                                                <div className="text-right hidden sm:block w-24">
                                                    <p className="text-[10px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5">Procedimiento</p>
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-white">
                                                        {e.performed_at ? format(new Date(e.performed_at), "d MMM, HH:mm", { locale: es }) : 'Pendiente'}
                                                    </p>
                                                </div>

                                                <div className="text-right hidden sm:block w-24">
                                                    <p className="text-[10px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5">Folio</p>
                                                    <p className="text-xs font-mono font-bold text-slate-500 group-hover:text-white/90 uppercase">
                                                        {e.folio}
                                                    </p>
                                                </div>

                                                <div className="hidden md:flex flex-shrink-0">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 group-hover:border-white group-hover:bg-white/20 group-hover:text-white text-slate-300 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
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
        </AuthenticatedLayout>
    );
}
