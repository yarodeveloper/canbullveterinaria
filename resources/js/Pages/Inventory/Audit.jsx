import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Audit({ auth, alerts, products, expiringLots = [] }) {
    const [activeTab, setActiveTab] = useState('alerts'); // 'alerts', 'count', or 'expiring'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [includeZeroStock, setIncludeZeroStock] = useState(true);
    const { settings } = usePage().props;

    const getExpirationAlertParams = (lotDate) => {
        if (!lotDate) return null;
        const diffDays = differenceInDays(new Date(lotDate), new Date());
        if (diffDays < 0) return { label: 'Vencido', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300', emoji: '⚠️' };
        if (diffDays <= 30) return { label: 'Vence < 1 mes', color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300', emoji: '🚨' };
        if (diffDays <= 60) return { label: 'Vence < 2 meses', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300', emoji: '⚠️' };
        if (diffDays <= 90) return { label: 'Vence < 3 meses', color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300', emoji: '⏱' };
        return null;
    };

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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 print:hidden">
                        <Link href={route('inventory.index')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center text-slate-500">
                           <span className="text-xl">←</span>
                        </Link>
                        <h2 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight flex items-center gap-2 uppercase tracking-tight">
                            <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span>
                            Auditoría de Inventario
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Auditoría de Inventario" />

            <div className="py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20 print:py-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6 print:m-0 print:p-0 print:w-full print:max-w-none">

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 border-b dark:border-slate-700/50 pb-4 print:hidden">
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm active:scale-95 ${activeTab === 'alerts' ? 'bg-red-50 text-red-600 border border-red-200 shadow-red-200/20' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50'}`}
                        >
                            🚨 Alertas Generales ({alerts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('expiring')}
                            className={`px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm active:scale-95 ${activeTab === 'expiring' ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-orange-200/20' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50'}`}
                        >
                            ⏱ Por Vencer Pronto ({expiringLots.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('count')}
                            className={`px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm active:scale-95 ${activeTab === 'count' ? 'bg-brand-primary text-white shadow-brand-primary/20' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50'}`}
                        >
                            📝 Hoja de Conteo Físico
                        </button>
                    </div>

                    {activeTab === 'alerts' && (
                        <div className="space-y-6">
                            {alerts.length === 0 ? (
                                <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] p-12 text-center shadow-xl border dark:border-slate-700/50">
                                    <div className="text-6xl mb-6 opacity-20 transform hover:scale-110 transition-transform">✅</div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Todo en orden</h3>
                                    <p className="text-slate-500 font-bold text-sm">No hay productos bajo el stock mínimo ni caducidades próximas.</p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-gray-900/40 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-700/50">
                                                    <th className="px-6 py-3">Artículo</th>
                                                    <th className="px-6 py-3 text-center">SKU</th>
                                                    <th className="px-6 py-3 text-center">Stock Local</th>
                                                    <th className="px-6 py-3 text-center">Alertas Encontradas</th>
                                                    <th className="px-6 py-3 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {alerts.map(product => {
                                                    const isLowStock = product.current_stock <= product.min_stock;
                                                    const expiringLotsInAlert = product.lots.filter(lot => {
                                                        if (!lot.expiration_date) return false;
                                                        const days = differenceInDays(new Date(lot.expiration_date), new Date());
                                                        return days <= 90;
                                                    });

                                                    return (
                                                        <tr key={product.id} className="hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 transition-colors group">
                                                            <td className="px-6 py-2.5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                                                                        {product.category.icon || '📦'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                                                                            {product.name}
                                                                        </p>
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none block mt-0.5">{product.category.name}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-2.5 text-center text-xs font-bold text-slate-500">
                                                                {product.sku || '-'}
                                                            </td>
                                                            <td className="px-6 py-2.5 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <span className={`text-sm font-black ${isLowStock ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                                                        {parseFloat(product.current_stock).toLocaleString()}
                                                                    </span>
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">Min: {parseFloat(product.min_stock)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-2.5 text-center">
                                                                <div className="flex flex-wrap gap-1 justify-center items-center">
                                                                    {isLowStock && (
                                                                        <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-red-200 shadow-sm">
                                                                            ⚠️ Poco Stock
                                                                        </span>
                                                                    )}
                                                                    {expiringLotsInAlert.map(lot => {
                                                                        const alertData = getExpirationAlertParams(lot.expiration_date);
                                                                        if (!alertData) return null;
                                                                        return (
                                                                            <span key={lot.id} className={`${alertData.color} px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border shadow-sm`}>
                                                                                {alertData.label}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-2.5 text-right">
                                                                <Link
                                                                    href={route('inventory.show', product.id)}
                                                                    className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-brand-primary px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-95 border dark:border-slate-700"
                                                                >
                                                                    Detalles →
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

                    {activeTab === 'expiring' && (
                        <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none">
                            <div className="p-6 border-b dark:border-slate-700/50 flex flex-col lg:flex-row justify-between lg:items-center gap-6 print:hidden bg-slate-50/50 dark:bg-gray-900/30">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Reporte de Caducidades</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic opacity-70">Próximos 3 meses • Ordenados por proximidad</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => window.print()}
                                        className="bg-brand-primary text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 active:scale-95 flex items-center gap-2"
                                    >
                                        🖨️ <span className="hidden sm:inline">Imprimir Reporte</span>
                                    </button>
                                </div>
                            </div>

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
                                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Reporte de Caducidades Próximas</h2>
                                        <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mt-1">
                                            Emissión: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto print:overflow-visible">
                                <table className="w-full text-left print:text-[8px] print:leading-none">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-gray-900/40 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-700/50 print:bg-gray-200 print:text-black">
                                            <th className="px-6 py-3 print:px-0.5 print:py-0.5 font-bold">Fecha Caducidad</th>
                                            <th className="px-6 py-3 print:px-0.5 print:py-0.5 font-bold">Artículo</th>
                                            <th className="px-6 py-3 text-center print:px-0.5 print:py-0.5 font-bold">Lote</th>
                                            <th className="px-6 py-3 text-center print:px-0.5 print:py-0.5 font-bold">Stock</th>
                                            <th className="px-6 py-3 text-center print:px-0.5 print:py-0.5 font-bold">Estado</th>
                                            <th className="px-6 py-3 text-right print:hidden font-bold">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-gray-300">
                                        {expiringLots.length > 0 ? expiringLots.map(lot => {
                                            const alertData = getExpirationAlertParams(lot.expiration_date);
                                            const formattedDate = format(new Date(lot.expiration_date), 'dd/MM/yyyy');
                                            return (
                                                <tr key={lot.id} className="hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 transition-colors group print:border-b print:border-gray-100">
                                                    <td className="px-6 py-2.5 print:px-0.5 print:py-0.5 font-black text-slate-900 dark:text-white print:text-black whitespace-nowrap text-xs print:text-[8px]">
                                                        {formattedDate}
                                                    </td>
                                                    <td className="px-6 py-2.5 print:px-0.5 print:py-0.5">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-xs text-slate-900 dark:text-white print:text-black print:text-[8px] uppercase tracking-tight">
                                                                {lot.product?.name}
                                                            </span>
                                                            <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                                                                {lot.product?.category?.name} {lot.product?.sku ? `| SKU: ${lot.product.sku}` : ''}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-2.5 print:px-0.5 print:py-0.5 text-center font-bold text-slate-500 text-[11px] print:text-[7px]">
                                                        {lot.lot_number || '-'}
                                                    </td>
                                                    <td className="px-6 py-2.5 print:px-0.5 print:py-0.5 text-center text-xs print:text-[8px]">
                                                        <span className="font-black text-slate-900 dark:text-white print:text-black">
                                                            {parseFloat(lot.current_quantity)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-2.5 print:px-0.5 print:py-0.5 text-center print:text-[7px]">
                                                        {alertData && (
                                                            <span className={`${alertData.color} px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border print:border-none print:text-black print:bg-transparent shadow-sm whitespace-nowrap`}>
                                                                {alertData.label}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-2.5 text-right print:hidden">
                                                        <Link
                                                            href={route('inventory.show', lot.product_id)}
                                                            className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-brand-primary px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-95 border dark:border-slate-700"
                                                        >
                                                            Puntaje →
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="6" className="px-8 py-12 text-center text-slate-400">
                                                    <div className="text-5xl mb-3 opacity-20">🎉</div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No hay caducidades en puerta</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'count' && (
                        <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] print:rounded-none border dark:border-slate-700/50 print:border-none shadow-sm print:shadow-none overflow-hidden">
                            {/* Header y Filtros (Ocultos al Imprimir) */}
                            <div className="p-6 border-b dark:border-slate-700/50 print:hidden flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 bg-slate-50/50 dark:bg-gray-900/30">
                                <div className="max-w-md">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Hoja de Conteo Físico</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic opacity-70 leading-relaxed">Formato optimizado para toma física de inventario. Agrupado por categorías.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative w-full sm:w-64">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50">🔍</span>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            placeholder="Buscar artículo..."
                                            className="w-full bg-white dark:bg-[#1B2132] border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary text-xs font-bold shadow-sm"
                                        />
                                    </div>
                                    <select
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        className="bg-white dark:bg-[#1B2132] border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-primary text-xs font-black uppercase tracking-tight min-w-[180px] shadow-sm"
                                    >
                                        <option value="all">Categorías (Todas)</option>
                                        {uniqueCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-[#1B2132] px-4 py-2.5 rounded-xl border dark:border-slate-700 hover:border-brand-primary/50 transition shadow-sm">
                                        <input
                                            type="checkbox"
                                            checked={includeZeroStock}
                                            onChange={e => setIncludeZeroStock(e.target.checked)}
                                            className="w-4 h-4 text-brand-primary rounded bg-white border-slate-300 focus:ring-brand-primary focus:ring-2"
                                        />
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Incluir Vacíos</span>
                                    </label>
                                    <button
                                        onClick={() => window.print()}
                                        className="bg-brand-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 active:scale-95 flex items-center gap-2"
                                    >
                                        🖨️ <span className="hidden sm:inline">Imprimir Formato</span>
                                    </button>
                                </div>
                            </div>

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
                                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Hoja para Conteo Físico de Inventario</h2>
                                        <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mt-1">
                                            Fecha de Auditoría: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto print:overflow-visible">
                                <table className="w-full text-left print:text-[8px] print:leading-none">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-gray-900/40 text-[9px] font-black text-slate-400 uppercase tracking-widest print:bg-gray-200 print:text-black">
                                            <th className="px-8 py-3 print:px-0.5 print:py-0.5 font-bold">SKU</th>
                                            <th className="px-6 py-3 print:px-0.5 print:py-0.5 font-bold">Producto / Artículo</th>
                                            <th className="px-6 py-3 text-center print:px-0.5 print:py-0.5 font-bold">Teórico</th>
                                            <th className="px-6 py-3 text-center print:px-0.5 print:py-0.5 print:min-w-[80px] font-bold">Conteo Físico</th>
                                            <th className="px-6 py-3 text-right print:hidden font-bold pr-8">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-gray-300">
                                        {Object.keys(groupedProducts).length > 0 ? Object.keys(groupedProducts).sort().map(categoryName => (
                                            <React.Fragment key={categoryName}>
                                                {/* Header de la Categoría */}
                                                <tr className="bg-slate-50 dark:bg-slate-900/20 print:bg-gray-100">
                                                    <td colSpan="5" className="px-8 py-2 font-black text-brand-primary uppercase tracking-widest text-[10px] print:text-black print:px-0.5 print:py-0.5 print:text-[9px] border-y dark:border-slate-700/50 print:border-black italic">
                                                        📁 {categoryName} <span className="ml-2 text-slate-400 dark:text-slate-500 opacity-60 print:text-gray-900 not-italic font-bold">({groupedProducts[categoryName].length} productos)</span>
                                                    </td>
                                                </tr>
                                                {/* Filas de los productos agrupados */}
                                                {groupedProducts[categoryName].map(product => (
                                                    <tr key={product.id} className="hover:bg-brand-primary/5 transition-colors group print:border-b print:border-gray-100">
                                                        <td className="px-8 py-2.5 text-xs font-black text-slate-500 dark:text-slate-400 print:text-[8px]">
                                                            {product.sku || '-'}
                                                        </td>
                                                        <td className="px-6 py-2.5">
                                                            <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors print:text-[8px]">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest print:hidden">{product.unit}s</p>
                                                        </td>
                                                        <td className="px-6 py-2.5 text-center">
                                                            <span className="font-black text-sm text-slate-900 dark:text-white print:text-[8px]">
                                                                {parseFloat(product.current_stock)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-2.5 text-center">
                                                            <div className="mx-auto w-20 h-10 border-b-2 border-slate-200 dark:border-slate-700 print:border-black/30 group-hover:border-brand-primary transition-colors"></div>
                                                        </td>
                                                        <td className="px-6 py-2.5 text-right print:hidden pr-8">
                                                            <Link
                                                                href={route('inventory.show', product.id)}
                                                                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand-primary transition-all flex items-center justify-center border dark:border-slate-700"
                                                                title="Ver Kardex"
                                                            >
                                                                🔍
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-12 text-center text-slate-400">
                                                    <div className="text-5xl mb-3 opacity-20">📦</div>
                                                    <p className="text-sm font-black uppercase tracking-widest">No se encontraron productos</p>
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
