import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Index({ auth, hospitalizations, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

    const getStatusStyle = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-700 border-green-200',
            discharged: 'bg-blue-100 text-blue-700 border-blue-200',
            expired: 'bg-red-100 text-red-700 border-red-200',
            euthanized: 'bg-purple-100 text-purple-700 border-purple-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusLabel = (status) => {
        const labels = {
            active: 'HOSPITALIZADO',
            discharged: 'ALTA MÉDICA',
            expired: 'DEFUNCIÓN',
            euthanized: 'EUTHANASIA',
        };
        return labels[status] || status.toUpperCase();
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                route('hospitalizations.index'),
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
                    <h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Zonas de Hospitalización</h2>
                    <Link
                        href={route('hospitalizations.create')}
                        className="bg-brand-primary text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-primary-100"
                    >
                        + Ingresar Paciente
                    </Link>
                </div>
            }
        >
            <Head title="Hospitalización" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#1B2132] overflow-hidden shadow-sm sm:rounded-[2rem] border dark:border-gray-700">
                        {/* Filtros */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="w-full md:w-1/2 relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-brand-primary transition-colors">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar paciente o motivo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white dark:bg-[#1B2132] border-slate-300 dark:border-slate-700 hover:border-brand-primary/50 focus:border-brand-primary focus:ring-brand-primary rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all shadow-sm"
                                />
                            </div>
                            <div className="w-full md:w-auto">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full md:w-48 bg-white dark:bg-[#1B2132] border-slate-300 dark:border-slate-700 focus:border-brand-primary focus:ring-brand-primary rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm transition-all"
                                >
                                    <option value="all">TODOS LOS ESTADOS</option>
                                    <option value="active">Activos</option>
                                    <option value="discharged">Altas Médicas</option>
                                    <option value="expired">Defunciones</option>
                                    <option value="euthanized">Eutanasias</option>
                                </select>
                            </div>
                        </div>

                        {/* Listado / Tabla compacta */}
                        <div className="p-0">
                            {hospitalizations.length > 0 ? (
                                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {hospitalizations.map((hospitalization) => (
                                        <li key={hospitalization.id} className="group hover:bg-brand-primary transition-colors">
                                            <Link href={route('hospitalizations.show', hospitalization.id)} className="block px-6 py-5">
                                                <div className="flex items-center justify-between">

                                                    {/* Info Paciente y Motivo */}
                                                    <div className="flex items-center min-w-0 gap-5 flex-1">
                                                        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                                            {hospitalization.pet.species === 'Canino' ? '🐕' : '🐈'}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-3">
                                                                 <p className="text-base font-black text-slate-900 dark:text-white group-hover:text-white truncate">
                                                                    {hospitalization.pet.name}
                                                                </p>
                                                                 <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest group-hover:bg-white group-hover:text-brand-primary group-hover:border-white ${getStatusStyle(hospitalization.status)}`}>
                                                                    {getStatusLabel(hospitalization.status)}
                                                                </span>
                                                            </div>
                                                             <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 group-hover:text-white/80 font-bold uppercase tracking-wide">
                                                                <span>{hospitalization.reason}</span>
                                                                <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 group-hover:bg-white/30 rounded-full"></span>
                                                                <span className="hidden sm:inline-flex items-center gap-1">
                                                                    👨‍⚕️ {hospitalization.veterinarian?.name || 'No asignado'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Info Fecha y Acciones */}
                                                    <div className="flex items-center gap-6 ml-4">
                                                        <div className="text-right hidden sm:block">
                                                             <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5">Ingresado</p>
                                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-white">
                                                                {format(new Date(hospitalization.admission_date), "d MMM, HH:mm", { locale: es })}
                                                            </p>
                                                        </div>
                                                        <div className="hidden md:flex flex-shrink-0">
                                                             <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-[#1B2132] border-2 border-slate-200 dark:border-slate-700/50 group-hover:border-white group-hover:bg-white/20 group-hover:text-white text-gray-300 transition-colors">
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
                            ) : (
                                <div className="text-center py-20 px-6">
                                    <div className="text-6xl mb-6 opacity-20 transform hover:scale-110 transition-transform">🏥</div>
                                    <h3 className="text-xl font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                        {searchTerm || statusFilter !== 'all' ? 'No se encontraron resultados' : 'No hay pacientes hospitalizados'}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'Intenta borrar algunos filtros.'
                                            : 'Las zonas de hospitalización se encuentran completamente libres.'}
                                    </p>
                                    {(!searchTerm && statusFilter === 'all') && (
                                        <Link
                                            href={route('hospitalizations.create')}
                                            className="inline-block bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20"
                                        >
                                            Ingresar Primer Paciente
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
