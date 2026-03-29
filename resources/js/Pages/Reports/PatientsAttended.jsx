import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PatientsAttended({ auth, patients, filters }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const { settings } = usePage().props;

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('reports.patients-attended'), {
            start_date: startDate,
            end_date: endDate
        }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('dashboard')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <span className="text-xl">←</span>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-widest">
                            Reporte de Pacientes Atendidos
                        </h2>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="bg-brand-primary text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-sm active:scale-95 flex items-center gap-2"
                    >
                        🖨️ Imprimir
                    </button>
                </div>
            }
        >
            <Head title="Listado de Pacientes Atendidos" />

            <div className="py-8 print:py-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6 print:m-0 print:p-0 print:w-full print:max-w-none">

                    {/* Header Impresión - Unificado */}
                    <div className="hidden print:block mb-8 border-b-2 border-brand-primary pb-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                {settings?.site_logo && (
                                    <img 
                                        src={settings.site_logo.startsWith('http') || settings.site_logo.startsWith('/') ? settings.site_logo : `/storage/${settings.site_logo}`} 
                                        alt="" 
                                        className="h-16 w-auto object-contain" 
                                    />
                                )}
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 uppercase leading-none">
                                        {auth.user?.branch?.name || settings?.site_name || 'CANBULL'}
                                    </h1>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                                        {auth.user?.branch?.address || 'Veterinaria Regional'}
                                        {auth.user?.branch?.phone && ` | TEL: ${auth.user.branch.phone}`}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Reporte Operativo Clínico</h1>
                                <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mt-1">
                                    Periodo: {startDate ? format(new Date(`${startDate}T00:00:00`), "dd/MMM/yyyy", { locale: es }) : 'Inicio'} Al {endDate ? format(new Date(`${endDate}T01:00:00`), "dd/MMM/yyyy", { locale: es }) : 'Fin'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-xl overflow-hidden print:rounded-none print:border-none print:shadow-none">
                        
                        {/* Filtros */}
                        <div className="p-8 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 print:hidden flex justify-between items-end">
                            <form onSubmit={handleFilterSubmit} className="flex gap-4 items-end">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fecha de Apertura</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-brand-primary w-48"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fecha de Cierre</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-brand-primary w-48"
                                        />
                                        <button type="submit" className="bg-brand-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition">
                                            Filtrar Lista
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Atenciones</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{patients.length}</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto print:overflow-visible">
                            <table className="w-full text-left print:text-[10px]">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/40 text-[10px] font-black text-gray-400 uppercase tracking-widest print:bg-gray-100 print:text-black border-b dark:border-gray-700">
                                        <th className="px-8 py-5">Fecha / Hora</th>
                                        <th className="px-8 py-5">Paciente y Propietario</th>
                                        <th className="px-8 py-5">Médico Responsable</th>
                                        <th className="px-8 py-5">Concepto de Atención</th>
                                        <th className="px-8 py-5 text-center">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 print:divide-gray-400">
                                    {patients.length > 0 ? patients.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-gray-900/30 transition-colors group">
                                            <td className="px-8 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-tighter print:text-black whitespace-nowrap">
                                                {format(new Date(row.date), "dd/MMM/yyyy", { locale: es })}
                                                <span className="block text-[10px] font-normal italic opacity-60 lowercase">{format(new Date(row.date), "HH:mm:ss")}</span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-gray-800 dark:text-gray-100 uppercase tracking-tight">{row.pet_name}</span>
                                                    <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">{row.pet_owner}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="font-black text-xs text-gray-700 dark:text-slate-300 uppercase italic opacity-70 group-hover:opacity-100">DVM. {row.vet_name}</span>
                                            </td>
                                            <td className="px-8 py-4 text-xs text-gray-600 dark:text-slate-400 italic">
                                                {row.reason || 'Sin observación específica cargada.'}
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900 rounded-lg">
                                                    {row.type}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-12 text-center font-black text-gray-400 uppercase tracking-widest text-xs">
                                                No se registraron atenciones en este periodo.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
