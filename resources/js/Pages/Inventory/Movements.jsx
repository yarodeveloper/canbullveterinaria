import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Movements({ auth, transactions, categories, filters }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [searchTerm, setSearchTerm] = useState(filters.search_term || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.selected_category || 'all');
    const [selectedType, setSelectedType] = useState(filters.selected_type || 'all');
    const { settings } = usePage().props;

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('inventory.movements'), {
            start_date: startDate,
            end_date: endDate,
            search_term: searchTerm,
            selected_category: selectedCategory,
            selected_type: selectedType
        }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('inventory.index')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <span className="text-xl">←</span>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-widest">
                            Reporte de Entradas y Salidas
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
            <Head title="Reporte de Movimientos" />

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
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Reporte Analítico de Movimientos</h2>
                                <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mt-1">
                                    Periodo: {startDate ? format(new Date(`${startDate}T00:00:00`), "dd/MMM/yyyy", { locale: es }) : 'Inicio'} Al {endDate ? format(new Date(`${endDate}T01:00:00`), "dd/MMM/yyyy", { locale: es }) : 'Fin'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] border dark:border-gray-700 shadow-xl overflow-hidden print:rounded-none print:border-none print:shadow-none">

                        {/* Filtros */}
                        <div className="p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 print:hidden flex flex-col md:flex-row gap-4 items-end">
                            <form onSubmit={handleFilterSubmit} className="flex gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Fecha Inicio</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-brand-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Fecha Fin</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-brand-primary"
                                        />
                                        <button type="submit" className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2 rounded-xl text-xs font-black uppercase hover:opacity-90 transition">
                                            Filtrar
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <div className="flex-1 w-full mx-auto md:ml-auto md:w-auto flex flex-col md:flex-row gap-4 md:justify-end">
                                <div className="relative w-full md:w-64">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Buscar producto/SKU..."
                                        className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl py-2 pl-9 pr-4 text-sm font-bold focus:ring-brand-primary"
                                    />
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl py-2 px-4 focus:ring-brand-primary text-sm font-bold md:w-48"
                                >
                                    <option value="all">Todas las Categorías</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedType}
                                    onChange={e => setSelectedType(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl py-2 px-4 focus:ring-brand-primary text-sm font-bold md:w-40"
                                >
                                    <option value="all">Todos los Movs</option>
                                    <option value="in">Entradas</option>
                                    <option value="out">Salidas</option>
                                    <option value="sale">Ventas</option>
                                    <option value="return">Devoluciones</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto print:overflow-visible">
                            <table className="w-full text-left print:text-[8px] print:leading-none">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/40 text-[10px] font-black text-gray-400 uppercase tracking-widest print:bg-gray-200 print:text-black border-b dark:border-gray-700 print:border-black">
                                        <th className="px-6 py-3 print:px-0.5 print:py-0.5">Fecha / Hora</th>
                                        <th className="px-6 py-3 print:px-0.5 print:py-0.5">Artículo</th>
                                        <th className="px-6 py-3 print:px-0.5 print:py-0.5 text-center">SKU</th>
                                        <th className="px-6 py-3 print:px-0.5 print:py-0.5 text-center">Tipo</th>
                                        <th className="px-6 py-3 print:px-0.5 print:py-0.5 text-center">Cantidad</th>
                                        <th className="px-6 py-3 print:px-0.5 print:py-0.5">Notas / Detalle</th>
                                        <th className="px-6 py-3 print:px-0.5 print:py-0.5">Usuario</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700 print:divide-gray-400">
                                    {transactions.data.length > 0 ? transactions.data.map(t => (
                                        <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group print:border-b print:border-gray-200">
                                            <td className="px-6 py-3 print:px-0.5 print:py-0.5 text-xs text-gray-500 print:text-black font-bold whitespace-nowrap">
                                                {format(new Date(t.created_at), "dd/MMM/yyyy", { locale: es })}
                                                <span className="block text-[10px] print:text-[7px] text-gray-400 font-normal">{format(new Date(t.created_at), "HH:mm:ss")}</span>
                                            </td>
                                            <td className="px-6 py-3 print:px-0.5 print:py-0.5">
                                                <Link href={route('inventory.show', t.product.id)} className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-primary transition-colors text-sm uppercase tracking-tight print:text-black print:text-[8px] print:no-underline pointer-events-none print:pointer-events-auto">
                                                    {t.product.name}
                                                </Link>
                                                <p className="text-[9px] print:text-[7px] text-gray-400 uppercase tracking-widest">{t.product.category.name}</p>
                                            </td>
                                            <td className="px-6 py-3 print:px-0.5 print:py-0.5 text-center text-xs font-bold text-gray-500 print:text-black print:text-[8px]">
                                                {t.product.sku || '-'}
                                            </td>
                                            <td className="px-6 py-3 print:px-0.5 print:py-0.5 text-center">
                                                <span className={`inline-block px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest print:border print:bg-transparent ${t.type === 'in' ? 'bg-emerald-100 text-emerald-700 print:border-emerald-500' :
                                                    t.type === 'return' ? 'bg-purple-100 text-purple-700 print:border-purple-500' :
                                                        t.type === 'sale' ? 'bg-blue-100 text-blue-700 print:border-blue-500' :
                                                            'bg-amber-100 text-amber-700 print:border-amber-500'
                                                    }`}>
                                                    {t.type === 'in' ? '↑ Entrada' : t.type === 'return' ? '↑ Devoluc.' : t.type === 'sale' ? '↓ Venta' : '↓ Salida'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 print:px-0.5 print:py-0.5 text-center">
                                                <span className={`text-lg print:text-xs font-black ${t.type === 'in' || t.type === 'return' ? 'text-emerald-500 print:text-black' : 'text-amber-500 print:text-black'
                                                    }`}>
                                                    {t.type === 'in' || t.type === 'return' ? '+' : '-'}{parseFloat(t.quantity)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 print:px-0.5 print:py-0.5 text-xs text-gray-500 print:text-black w-1/3">
                                                <p className="font-bold italic print:font-normal print:not-italic print:uppercase overflow-hidden print:text-[7px] print:leading-tight">{t.notes || '-'}</p>
                                                {t.lot && <p className="text-[9px] print:text-[7px] text-gray-400 uppercase tracking-widest mt-0.5">Lote: {t.lot.lot_number}</p>}
                                            </td>
                                            <td className="px-6 py-3 print:px-0.5 print:py-0.5 text-[10px] print:text-[7px] font-bold text-gray-500 uppercase tracking-widest print:text-black">
                                                {t.user.name}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center font-black text-gray-400 uppercase tracking-widest text-xs">
                                                No se encontraron movimientos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {transactions.links && transactions.links.length > 3 && (
                            <div className="p-4 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 flex justify-center print:hidden">
                                <div className="flex flex-wrap gap-1">
                                    {transactions.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 text-xs font-black uppercase rounded-lg transition-colors ${!link.url ? 'text-gray-400 cursor-not-allowed opacity-50' :
                                                link.active ? 'bg-brand-primary text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
