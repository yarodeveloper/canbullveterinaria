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
                    <Link
                        href={route('euthanasias.create')}
                        className="inline-flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 dark:shadow-none hover:opacity-90 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        Nuevo Registro
                    </Link>
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

                {/* Tabla */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    {euthanasias.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <span className="text-5xl mb-3">🕊️</span>
                            <p className="font-bold">Sin registros</p>
                            <p className="text-xs mt-1">No hay procedimientos que coincidan con los filtros.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Folio</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Paciente</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Propietario</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Veterinario</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Motivo</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {euthanasias.map(e => (
                                    <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{e.folio}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm font-black text-purple-600">
                                                    {e.pet?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200">{e.pet?.name}</p>
                                                    <p className="text-[10px] text-slate-400">{e.pet?.species} • {e.pet?.breed}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{e.pet?.owner?.name || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{e.veterinarian?.name || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                            {e.performed_at ? format(new Date(e.performed_at), "dd MMM yyyy", { locale: es }) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[160px] truncate">{e.reason}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black border uppercase ${STATUS[e.status]?.text}`}>
                                                {STATUS[e.status]?.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={route('euthanasias.show', e.id)} className="text-brand-primary hover:underline text-xs font-bold">
                                                Ver →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
