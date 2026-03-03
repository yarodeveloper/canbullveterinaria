import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Audit({ auth, alerts, products }) {
    const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' or 'count'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [includeZeroStock, setIncludeZeroStock] = useState(true);

    const uniqueCategories = [...new Set(products.map(p => p.category.name))].sort();

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || p.category.name === selectedCategory;
        const matchesStock = includeZeroStock || parseFloat(p.current_stock) > 0;

        return matchesSearch && matchesCategory && matchesStock;
    });

    // Group filtered products by category for the count sheet
    const groupedProducts = filteredProducts.reduce((acc, product) => {
        if (!acc[product.category.name]) acc[product.category.name] = [];
        acc[product.category.name].push(product);
        return acc;
    }, {});

    const handleCountSubmit = (productId, count) => {
        // Here we could add a feature to save the count, but for now we'll just allow triggering an adjustment
        // To do a real "conteo", we'd typically create an Audit model and register counts.
        // For now, this is a physical check sheet viewing page.
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 print:hidden">
                        <Link href={route('inventory.index')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <span className="text-xl">←</span>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-widest">
                            Auditoría de Inventario
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Auditoría de Inventario" />

            <div className="py-12 print:py-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8 print:m-0 print:p-0 print:w-full print:max-w-none">

                    {/* Tabs */}
                    <div className="flex gap-4 border-b dark:border-gray-700 pb-4 print:hidden">
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors shadow-sm ${activeTab === 'alerts' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50'}`}
                        >
                            Alertas de Stock & Caducidad ({alerts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('count')}
                            className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors shadow-sm ${activeTab === 'count' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50'}`}
                        >
                            Hoja de Conteo Físico
                        </button>
                    </div>

                    {activeTab === 'alerts' && (
                        <div className="space-y-6">
                            {alerts.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-12 text-center shadow-xl border dark:border-gray-700">
                                    <div className="text-6xl mb-4">✅</div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-2">Todo en orden</h3>
                                    <p className="text-gray-500 font-bold">No hay productos bajo el stock mínimo ni caducidades próximas.</p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-900/40 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">
                                                    <th className="px-8 py-5">Articulo</th>
                                                    <th className="px-8 py-5 text-center">SKU</th>
                                                    <th className="px-8 py-5 text-center">Stock Local</th>
                                                    <th className="px-8 py-5 text-center">Alertas Encontradas</th>
                                                    <th className="px-8 py-5 text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y dark:divide-gray-700">
                                                {alerts.map(product => {
                                                    const isLowStock = product.current_stock <= product.min_stock;
                                                    const expiringLots = product.lots.filter(lot => {
                                                        if (!lot.expiration_date) return false;
                                                        const days = differenceInDays(new Date(lot.expiration_date), new Date());
                                                        return days <= 90;
                                                    });

                                                    return (
                                                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                                                            <td className="px-8 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-xl">
                                                                        {product.category.icon || '📦'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                                                                            {product.name}
                                                                        </p>
                                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{product.category.name}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-4 text-center">
                                                                <span className="text-xs font-bold text-gray-500">{product.sku || '-'}</span>
                                                            </td>
                                                            <td className="px-8 py-4 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <span className={`text-xl font-black ${isLowStock ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>
                                                                        {parseFloat(product.current_stock).toLocaleString()}
                                                                    </span>
                                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Min: {parseFloat(product.min_stock)} {product.unit}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-4 text-center">
                                                                <div className="flex flex-col gap-2 items-center">
                                                                    {isLowStock && (
                                                                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-200">
                                                                            ⚠️ Poco Stock / Reponer
                                                                        </span>
                                                                    )}
                                                                    {expiringLots.map(lot => {
                                                                        const days = differenceInDays(new Date(lot.expiration_date), new Date());
                                                                        const isExpired = days < 0;
                                                                        return (
                                                                            <span key={lot.id} className={`${isExpired ? 'bg-red-100 text-red-600 border-red-200' : 'bg-amber-100 text-amber-600 border-amber-200'} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border`}>
                                                                                {isExpired ? 'Lote Vencido' : `Lote Vence en ${days} días`}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-4 text-center">
                                                                <Link
                                                                    href={route('inventory.show', product.id)}
                                                                    className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-brand-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-colors"
                                                                >
                                                                    Atender →
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'count' && (
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] print:rounded-none border dark:border-gray-700 print:border-none shadow-xl print:shadow-none overflow-hidden">
                            {/* Header y Filtros (Ocultos al Imprimir) */}
                            <div className="p-8 border-b dark:border-gray-700 print:hidden flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Hoja de Conteo Físico</h3>
                                    <p className="text-xs text-gray-500 font-bold">Imprime esta hoja para realizar el inventario agrupado por categorías.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="relative w-full sm:w-64">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            placeholder="Buscar artículo..."
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-brand-primary text-sm font-bold"
                                        />
                                    </div>
                                    <select
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-primary text-sm font-bold min-w-[200px]"
                                    >
                                        <option value="all">Todas las Categorías</option>
                                        {uniqueCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl border border-transparent hover:border-gray-200 transition">
                                        <input
                                            type="checkbox"
                                            checked={includeZeroStock}
                                            onChange={e => setIncludeZeroStock(e.target.checked)}
                                            className="w-5 h-5 text-brand-primary rounded bg-white border-gray-300 focus:ring-brand-primary focus:ring-2"
                                        />
                                        <span className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-300 tracking-widest">Incluir Vacíos (≤0)</span>
                                    </label>
                                    <button
                                        onClick={() => window.print()}
                                        className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition active:scale-95"
                                    >
                                        🖨️ Imprimir Formato
                                    </button>
                                </div>
                            </div>

                            {/* Título sólo visible en impresión */}
                            <div className="hidden print:block p-8 border-b-2 border-black text-center mb-6">
                                <h1 className="text-3xl font-black uppercase tracking-widest mb-2">Formato de Auditoría e Inventario Físico</h1>
                                <p className="font-bold">Fecha: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
                            </div>

                            <div className="overflow-x-auto print:overflow-visible">
                                <table className="w-full text-left print:text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900/40 text-[10px] font-black text-gray-400 uppercase tracking-widest print:bg-gray-200 print:text-black">
                                            <th className="px-8 py-4 print:px-2">SKU</th>
                                            <th className="px-8 py-4 print:px-2">Producto</th>
                                            <th className="px-8 py-4 text-center print:px-2">Teórico</th>
                                            <th className="px-8 py-4 text-center print:px-2 print:min-w-[100px]">Stock Físico (Conteo)</th>
                                            <th className="px-8 py-4 text-center print:hidden">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700 print:divide-gray-300">
                                        {Object.keys(groupedProducts).length > 0 ? Object.keys(groupedProducts).sort().map(categoryName => (
                                            <React.Fragment key={categoryName}>
                                                {/* Header de la Categoría */}
                                                <tr className="bg-brand-primary/5 dark:bg-brand-primary/10 print:bg-gray-100">
                                                    <td colSpan="5" className="px-8 py-3 font-black text-brand-primary uppercase tracking-widest text-xs print:text-black print:px-2 print:border-y print:border-black">
                                                        📁 Categoría: {categoryName}
                                                        <span className="ml-2 text-gray-500 opacity-60">({groupedProducts[categoryName].length} items)</span>
                                                    </td>
                                                </tr>
                                                {/* Filas de los productos agrupados */}
                                                {groupedProducts[categoryName].map(product => (
                                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                                        <td className="px-8 py-3 print:py-2 font-bold text-gray-400 text-xs print:text-black print:px-2">
                                                            {product.sku || '-'}
                                                        </td>
                                                        <td className="px-8 py-3 print:py-2 font-bold text-gray-900 dark:text-gray-100 print:text-black print:px-2">
                                                            {product.name}
                                                        </td>
                                                        <td className="px-8 py-3 print:py-2 text-center font-black text-gray-500 opacity-60 print:text-black print:px-2">
                                                            {parseFloat(product.current_stock)}
                                                        </td>
                                                        <td className="px-8 py-3 print:py-2 text-center print:px-2">
                                                            <div className="print:hidden">
                                                                <input
                                                                    type="text"
                                                                    className="w-20 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1 focus:ring-2 focus:ring-brand-primary text-sm font-bold"
                                                                    placeholder="C"
                                                                />
                                                            </div>
                                                            <div className="hidden print:block border-b-2 border-dashed border-gray-400 w-full h-6 mt-1"></div>
                                                        </td>
                                                        <td className="px-8 py-3 text-center print:hidden">
                                                            <Link
                                                                href={route('inventory.show', product.id)}
                                                                className="text-[10px] font-black flex items-center justify-center uppercase tracking-widest text-brand-primary hover:underline"
                                                            >
                                                                Kardex →
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-12 text-center font-black text-gray-400 uppercase tracking-widest">
                                                    No hay artículos que coincidan con los filtros.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
