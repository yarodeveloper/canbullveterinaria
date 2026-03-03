import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

export default function Index({ auth, products, categories, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search_term || '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.selected_category || 'all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm !== (filters?.search_term || '') || selectedCategory !== (filters?.selected_category || 'all')) {
                router.get(route('inventory.index'), {
                    search_term: searchTerm,
                    selected_category: selectedCategory,
                }, { preserveState: true, replace: true, preserveScroll: true });
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, selectedCategory]);

    const { data, setData, post, processing, reset, errors } = useForm({
        product_category_id: '',
        name: '',
        sku: '',
        unit: 'pieza',
        min_stock: 5,
        price: '',
        is_controlled: false,
    });

    const submitProduct = (e) => {
        e.preventDefault();
        post(route('inventory.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Inventario y Farmacia</h2>
                    <div className="flex gap-3">
                        {auth.user?.role === 'admin' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                + Nuevo Artículo
                            </button>
                        )}
                        <Link
                            href={route('inventory.audit')}
                            className="bg-brand-primary text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Auditoría de Inventario
                        </Link>
                        <Link
                            href={route('inventory.movements')}
                            className="bg-white dark:bg-gray-800 border dark:border-gray-700 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            📊 Entradas y Salidas
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Inventario" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    {/* Filtros y Buscador */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border dark:border-gray-700 flex flex-col md:flex-row gap-6">
                        <div className="flex-1 relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o SKU..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-brand-primary placeholder:text-gray-400 font-bold"
                            />
                        </div>
                        <div className="md:w-64">
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                            >
                                <option value="all">Todas las categorías</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tabla Estilo Kardex */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/40 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">
                                        <th className="px-6 py-3">Articulo</th>
                                        <th className="px-6 py-3 text-center">SKU</th>
                                        <th className="px-6 py-3 text-center">Categoria</th>
                                        <th className="px-6 py-3 text-center">Disponible</th>
                                        <th className="px-6 py-3 text-center">P. Público</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                        <th className="px-6 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {products.data.length > 0 ? products.data.map(product => {
                                        const isLowStock = product.current_stock <= product.min_stock;
                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                                                <td className="px-6 py-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center text-lg shrink-0">
                                                            {product.category.icon || '📦'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-black text-gray-900 dark:text-gray-100 text-sm uppercase tracking-tight group-hover:text-brand-primary transition-colors truncate" title={product.name}>
                                                                {product.name}
                                                            </p>
                                                            {!!product.is_controlled && (
                                                                <span className="text-[8px] font-black text-red-500 uppercase tracking-widest block mt-0.5">⚠️ Controlado</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-2 text-center text-xs font-bold text-gray-500">
                                                    {product.sku || '-'}
                                                </td>
                                                <td className="px-6 py-2 text-center">
                                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                                                        {product.category.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-2 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-lg leading-none font-black ${isLowStock ? 'text-red-500' : 'text-brand-primary'}`}>
                                                            {parseFloat(product.current_stock).toLocaleString()}
                                                        </span>
                                                        <span className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">{product.unit}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-2 text-center text-sm font-black text-gray-900 dark:text-gray-100">
                                                    ${parseFloat(product.price).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-2 text-center">
                                                    {isLowStock ? (
                                                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-red-200">
                                                            Poco Stock
                                                        </span>
                                                    ) : (
                                                        <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-200">
                                                            OK
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-2 text-center">
                                                    <Link
                                                        href={route('inventory.show', product.id)}
                                                        className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-brand-primary px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-colors"

                                                    >
                                                        Kardex →
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                                <div className="text-3xl mb-2 opacity-50">📦</div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">No se encontraron artículos</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {products.links && products.links.length > 3 && (
                            <div className="p-4 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 flex justify-center">
                                <div className="flex flex-wrap gap-1">
                                    {products.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-colors ${!link.url ? 'text-gray-400 cursor-not-allowed opacity-50' :
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

            {/* Modal de Creación de Producto */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border dark:border-gray-700">
                        <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Nuevo Artículo al Catálogo</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-2xl opacity-30 hover:opacity-100">×</button>
                        </div>
                        <form onSubmit={submitProduct} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Artículo</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                    placeholder="Ej. Vacuna Rabia, Croquetas 5kg..."
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
                                    <select
                                        value={data.product_category_id}
                                        onChange={e => setData('product_category_id', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                        required
                                    >
                                        <option value="">Seleccione Categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.product_category_id && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.product_category_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unidad de Medida</label>
                                    <select
                                        value={data.unit}
                                        onChange={e => setData('unit', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                        required
                                    >
                                        <option value="pieza">Pieza (PZA)</option>
                                        <option value="frasco">Frasco</option>
                                        <option value="caja">Caja</option>
                                        <option value="bulto">Bulto / Saco</option>
                                        <option value="ml">Mililitros (ML)</option>
                                        <option value="gramo">Gramos (G)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SKU / Clave</label>
                                    <input
                                        type="text"
                                        value={data.sku}
                                        onChange={e => setData('sku', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                        placeholder="Opcional"
                                    />
                                    {errors.sku && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.sku}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Público</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.price}
                                            onChange={e => setData('price', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 pl-10 pr-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    {errors.price && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.price}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Mínimo</label>
                                    <input
                                        type="number"
                                        value={data.min_stock}
                                        onChange={e => setData('min_stock', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t dark:border-gray-700">
                                <label className="flex items-center gap-4 cursor-pointer p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl transition">
                                    <input
                                        type="checkbox"
                                        checked={data.is_controlled}
                                        onChange={e => setData('is_controlled', e.target.checked)}
                                        className="w-6 h-6 text-red-600 rounded bg-white border-red-300 focus:ring-red-600 focus:ring-2"
                                    />
                                    <div>
                                        <span className="block text-sm font-black text-red-800 uppercase tracking-tight">Es Medicamento Controlado</span>
                                        <span className="block text-xs font-bold text-red-600/70 mt-0.5">La Ley requiere bitácora con registro de receta médica o médico autorizante para cada movimiento.</span>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-50 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Guardando Artículo...' : 'Registrar en Catálogo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
