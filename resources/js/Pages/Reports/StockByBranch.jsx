import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function StockByBranch({ auth, stockData, branches, filters = {} }) {
    const { settings } = usePage().props;
    
    // Grouping stock by product
    const groupedStock = stockData.reduce((acc, curr) => {
        if (!acc[curr.product_name]) {
            acc[curr.product_name] = { 
                name: curr.product_name, 
                sku: curr.sku, 
                branches: {},
                total_stock: 0,
                total_value: 0
            };
        }
        acc[curr.product_name].branches[curr.branch_name] = curr.current_quantity;
        acc[curr.product_name].total_stock += parseFloat(curr.current_quantity);
        acc[curr.product_name].total_value += parseFloat(curr.total_cost_value);
        return acc;
    }, {});

    const productList = Object.values(groupedStock);

    const handleFilterChange = (e) => {
        router.get(route('reports.stock-by-branch'), { branch_id: e.target.value }, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('inventory.index')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <span className="text-xl">←</span>
                        </Link>
                        <h2 className="font-black text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-tighter">
                            Inventario Comparativo por Sucursal
                        </h2>
                    </div>
                    
                    {auth.user.role === 'admin' && (
                        <div className="flex items-center gap-3">
                            <select 
                                value={filters?.branch_id || ''} 
                                onChange={handleFilterChange}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-brand-primary min-w-[200px]"
                            >
                                <option value="">Todas las sucursales</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => window.print()}
                                className="bg-brand-primary text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-sm active:scale-95 flex items-center gap-2"
                            >
                                🖨️ Imprimir
                            </button>
                        </div>
                    )}

                    {auth.user.role !== 'admin' && (
                        <button
                            onClick={() => window.print()}
                            className="bg-brand-primary text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-sm active:scale-95 flex items-center gap-2"
                        >
                            🖨️ Imprimir
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Reporte de Stock por Sucursal" />

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
                                        {settings?.site_name || 'CANBULL'}
                                    </h1>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                                        {filters?.branch_id ? `Reporte de Sucursal: ${branches.find(b => b.id == filters.branch_id)?.name}` : 'Consolidado Multisucursal - Reporte de Auditoría Global'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Cierre de Inventario Global</h1>
                                <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mt-1">
                                    Generado el: {format(new Date(), "dd/MMM/yyyy HH:mm:ss", { locale: es })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-xl overflow-hidden print:rounded-none print:border-none print:shadow-none">
                        
                        <div className="p-8 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 print:hidden">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1 italic">Consolidación de Existencias</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Comparativa de stock disponible entre todas las sedes activas.</p>
                        </div>

                        <div className="overflow-x-auto print:overflow-visible">
                            <table className="w-full text-left print:text-[9px]">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/40 text-[10px] font-black text-gray-400 uppercase tracking-widest print:bg-gray-100 print:text-black border-b dark:border-gray-700">
                                        <th className="px-8 py-5">Producto / SKU</th>
                                        {branches.filter(b => !filters?.branch_id || b.id == filters.branch_id).map(branch => (
                                            <th key={branch.id} className="px-4 py-5 text-center bg-slate-100/30 dark:bg-slate-800/20">{branch.name}</th>
                                        ))}
                                        <th className="px-8 py-5 text-center bg-brand-primary/5 text-brand-primary">Stock Total</th>
                                        <th className="px-8 py-5 text-right bg-brand-primary/5 text-brand-primary">Valuación Al Costo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 print:divide-gray-400">
                                    {productList.length > 0 ? productList.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-gray-900/30 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-gray-800 dark:text-gray-100 uppercase tracking-tight leading-none mb-1">{row.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{row.sku || 'SIN SKU'}</span>
                                                </div>
                                            </td>
                                            {branches.filter(b => !filters?.branch_id || b.id == filters.branch_id).map(branch => {
                                                const quantity = row.branches[branch.name] || 0;
                                                return (
                                                    <td key={branch.id} className={`px-4 py-4 text-center font-black ${quantity > 0 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 opacity-30 text-xs'}`}>
                                                        {parseFloat(quantity)}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-8 py-4 text-center bg-brand-primary/5">
                                                <span className="text-lg font-black text-brand-primary tracking-tighter">{row.total_stock}</span>
                                            </td>
                                            <td className="px-8 py-4 text-right bg-brand-primary/5">
                                                <span className="font-black text-sm text-emerald-500">${row.total_value.toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={branches.length + 3} className="px-8 py-12 text-center font-black text-gray-400 uppercase tracking-widest text-xs">
                                                No se encontraron exitencias cargadas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {productList.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-gray-50 dark:bg-gray-900/40 font-black border-t dark:border-gray-700">
                                            <td className="px-8 py-5 uppercase text-[10px] tracking-widest text-slate-400">Totales de Red</td>
                                            {branches.filter(b => !filters?.branch_id || b.id == filters.branch_id).map(branch => {
                                                const branchTotal = productList.reduce((acc, curr) => acc + (curr.branches[branch.name] || 0), 0);
                                                return (
                                                    <td key={branch.id} className="px-4 py-5 text-center text-[10px] font-black italic text-slate-500">{branchTotal} UNID.</td>
                                                );
                                            })}
                                            <td className="px-8 py-5 text-center text-sm text-brand-primary">{productList.reduce((acc, curr) => acc + curr.total_stock, 0)}</td>
                                            <td className="px-8 py-5 text-right text-base text-emerald-500 font-extrabold">
                                                ${productList.reduce((acc, curr) => acc + curr.total_value, 0).toLocaleString()}
                                            </td>
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
