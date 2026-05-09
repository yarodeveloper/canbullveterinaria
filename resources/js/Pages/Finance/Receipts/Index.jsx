import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Pagination from '@/Components/Pagination';

export default function Index({ auth, receipts, filters, totalSalesSum }) {
    const handleFilterChange = (key, value) => {
        router.get(route('receipts.index'), {
            ...filters,
            [key]: value
        }, { preserveState: true });
    };

    const getStatusStyle = (status) => {
        const styles = {
            paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <h2 className="font-black text-xl text-slate-900 dark:text-white leading-tight uppercase tracking-tight">Ventas y Auditoría</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control de ingresos y descuentos autorizados</p>
                    </div>
                    <Link
                        href={route('receipts.create')}
                        className="bg-brand-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20"
                    >
                        🛍️ Nuevo Cobro
                    </Link>
                </div>
            }
        >
            <Head title="Historial de Ventas" />

            <div className="py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">
                    
                    {/* Filtros Premium Compactos */}
                    <div className="bg-white dark:bg-[#1B2132] p-5 rounded-[2rem] border dark:border-gray-700 shadow-xl flex flex-wrap gap-6 items-center justify-between">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="min-w-[180px]">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Rango de Fechas</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="date" 
                                        value={filters.start_date || ''} 
                                        onChange={e => handleFilterChange('start_date', e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg py-1.5 px-2 focus:ring-1 focus:ring-brand-primary font-bold text-[10px] shadow-inner"
                                    />
                                    <input 
                                        type="date" 
                                        value={filters.end_date || ''} 
                                        onChange={e => handleFilterChange('end_date', e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg py-1.5 px-2 focus:ring-1 focus:ring-brand-primary font-bold text-[10px] shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                <input 
                                    type="checkbox" 
                                    id="only_discounts"
                                    checked={filters.only_discounts || false}
                                    onChange={e => handleFilterChange('only_discounts', e.target.checked)}
                                    className="w-3.5 h-3.5 text-brand-primary rounded focus:ring-brand-primary border-slate-300"
                                />
                                <label htmlFor="only_discounts" className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                                    Solo Descuentos
                                </label>
                            </div>
                            <button 
                                onClick={() => router.get(route('receipts.index'))}
                                className="px-2 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition"
                            >
                                Limpiar
                            </button>
                        </div>

                        {/* Indicador de Total de Ventas Consultadas */}
                        <div className="bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 rounded-2xl px-6 py-2.5 flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.2em] leading-none mb-1">Total en Consulta</span>
                                <span className="text-xl font-black text-brand-primary tracking-tighter leading-none">
                                    ${parseFloat(totalSalesSum || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center text-lg shadow-lg shadow-brand-primary/20">
                                📊
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1B2132] overflow-hidden shadow-2xl sm:rounded-[2.5rem] border dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-gray-900/40 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] border-b dark:border-gray-700">
                                        <th className="px-6 py-3">Folio / Fecha</th>
                                        <th className="px-6 py-3">Cliente / Estado</th>
                                        <th className="px-6 py-3">Método</th>
                                        <th className="px-6 py-3">Auditoría Cortesía</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                        <th className="px-6 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                                    {receipts.data.map((receipt) => (
                                        <tr key={receipt.id} className="group hover:bg-slate-50/80 dark:hover:bg-gray-800/40 transition-all duration-300">
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-[11px]">#{receipt.receipt_number}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                                                        {format(new Date(receipt.date), "dd/MM/yyyy HH:mm", { locale: es })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <p className="font-black text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-tight truncate max-w-[140px]" title={receipt.client.name}>{receipt.client.name}</p>
                                                <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[7px] font-black border uppercase tracking-wider ${getStatusStyle(receipt.status)}`}>
                                                    {receipt.status === 'paid' ? 'Pagado' : receipt.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                                                    {receipt.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                {receipt.manual_discount_total > 0 ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">Desc: -${parseFloat(receipt.manual_discount_total).toFixed(2)}</span>
                                                        <div className="text-[8px] font-bold text-slate-400 italic truncate max-w-[120px]" title={receipt.discount_reason}>
                                                            "{receipt.discount_reason}"
                                                        </div>
                                                        <span className="text-[7px] font-black text-slate-400 uppercase">Autorizó: {receipt.authorizer?.name?.split(' ')[0] || 'Admin'}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[8px] font-bold text-slate-300 uppercase italic">Sin cortesía</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <p className="text-sm font-black text-brand-primary tracking-tighter leading-none">${parseFloat(receipt.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Link
                                                        href={route('receipts.show', receipt.id)}
                                                        className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-brand-primary rounded-lg transition border dark:border-slate-700"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </Link>
                                                    <Link
                                                        href={route('receipts.print', receipt.id)}
                                                        className="p-1.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg transition border border-brand-primary/20"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación Standard Compacta */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-gray-900/40">
                            <Pagination links={receipts.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
