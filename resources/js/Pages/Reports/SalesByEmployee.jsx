import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SalesByEmployee({ auth, sales, filters }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const { settings } = usePage().props;

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('reports.sales-by-employee'), {
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
                            Ventas por Empleado
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
            <Head title="Reporte de Ventas por Empleado" />

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
                                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Ventas por Colaborador</h1>
                                <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mt-1">
                                    Periodo: {startDate ? format(new Date(`${startDate}T00:00:00`), "dd/MMM/yyyy", { locale: es }) : 'Inicio'} Al {endDate ? format(new Date(`${endDate}T01:00:00`), "dd/MMM/yyyy", { locale: es }) : 'Fin'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-xl overflow-hidden print:rounded-none print:border-none print:shadow-none">
                        
                        {/* Filtros */}
                        <div className="p-8 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 print:hidden">
                            <form onSubmit={handleFilterSubmit} className="flex gap-4 items-end">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Rango de Inicio</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-brand-primary w-48"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Rango de Fin</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-brand-primary w-48"
                                        />
                                        <button type="submit" className="bg-brand-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition">
                                            Generar Reporte
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="overflow-x-auto print:overflow-visible">
                            <table className="w-full text-left print:text-[10px]">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/40 text-[10px] font-black text-gray-400 uppercase tracking-widest print:bg-gray-100 print:text-black border-b dark:border-gray-700">
                                        <th className="px-8 py-5">Nombre del Empleado</th>
                                        <th className="px-8 py-5 text-center">Tickets Generados</th>
                                        <th className="px-8 py-5 text-center">Unidades Vendidas</th>
                                        <th className="px-8 py-5 text-right">Monto Total</th>
                                        <th className="px-8 py-5 text-right">% de Participación</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 print:divide-gray-400">
                                    {sales.length > 0 ? (
                                        (() => {
                                            const grandTotal = sales.reduce((acc, curr) => acc + parseFloat(curr.total_sales), 0);
                                            return sales.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-gray-900/30 transition-colors group">
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-xs">
                                                                {row.employee_name.charAt(0)}
                                                            </div>
                                                            <span className="font-black text-sm text-gray-800 dark:text-gray-100 uppercase tracking-tight">{row.employee_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4 text-center font-bold text-gray-600 dark:text-gray-400">{row.ticket_count}</td>
                                                    <td className="px-8 py-4 text-center font-bold text-gray-600 dark:text-gray-400">{row.item_count}</td>
                                                    <td className="px-8 py-4 text-right">
                                                        <span className="font-black text-sm text-emerald-500">${parseFloat(row.total_sales).toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <span className="text-[10px] font-black text-slate-400">
                                                                {grandTotal > 0 ? ((parseFloat(row.total_sales) / grandTotal) * 100).toFixed(1) : 0}%
                                                            </span>
                                                            <div className="w-16 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-brand-primary" 
                                                                    style={{ width: grandTotal > 0 ? `${(parseFloat(row.total_sales) / grandTotal) * 100}%` : '0%' }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ));
                                        })()
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-12 text-center font-black text-gray-400 uppercase tracking-widest text-xs">
                                                No se registraron ventas en este periodo.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {sales.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-gray-50 dark:bg-gray-900/40 font-black border-t dark:border-gray-700">
                                            <td className="px-8 py-5 uppercase text-[10px] tracking-widest">Totales Genenales</td>
                                            <td className="px-8 py-5 text-center text-sm">{sales.reduce((acc, curr) => acc + parseInt(curr.ticket_count), 0)}</td>
                                            <td className="px-8 py-5 text-center text-sm">{sales.reduce((acc, curr) => acc + parseFloat(curr.item_count), 0)}</td>
                                            <td className="px-8 py-5 text-right text-base text-brand-primary">
                                                ${sales.reduce((acc, curr) => acc + parseFloat(curr.total_sales), 0).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-5 text-right text-xs">100.0%</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
