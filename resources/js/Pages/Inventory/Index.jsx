import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

export default function Index({ auth, products, categories, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search_term || '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.selected_category || 'all');
    const [selectedType, setSelectedType] = useState(filters?.selected_type || 'product');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const getExpirationAlert = (lots) => {
        if (!lots || lots.length === 0) return null;
        let minDays = Infinity;

        lots.forEach(lot => {
            if (lot.expiration_date && parseFloat(lot.current_quantity) > 0) {
                const expDate = new Date(lot.expiration_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                expDate.setHours(0, 0, 0, 0);
                const diffTime = expDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < minDays) {
                    minDays = diffDays;
                }
            }
        });

        if (minDays === Infinity || minDays > 90) return null;
        if (minDays < 0) return { label: 'Vencido', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300' };
        if (minDays <= 30) return { label: 'Vence < 1 mes', color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300' };
        if (minDays <= 60) return { label: 'Vence < 2 meses', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300' };
        if (minDays <= 90) return { label: 'Vence < 3 meses', color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300' };

        return null;
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm !== (filters?.search_term || '') || selectedCategory !== (filters?.selected_category || 'all') || selectedType !== (filters?.selected_type || 'product')) {
                router.get(route('inventory.index'), {
                    search_term: searchTerm,
                    selected_category: selectedCategory,
                    selected_type: selectedType,
                }, { preserveState: true, replace: true, preserveScroll: true });
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, selectedCategory, selectedType]);

    const { data, setData, post, processing, reset, errors } = useForm({
        product_category_id: '',
        name: '',
        sku: '',
        description: '',
        unit: 'pieza',
        min_stock: 5,
        price: '',
        tax_iva: 16,
        tax_ieps: 0,
        is_controlled: false,
        is_service: false, // by default
    });

    const submitProduct = (e) => {
        e.preventDefault();
        if (editingProduct) {
            router.put(route('inventory.update', editingProduct.id), data, {
                onSuccess: () => {
                    setShowCreateModal(false);
                    setEditingProduct(null);
                    reset();
                }
            });
        } else {
            post(route('inventory.store'), {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        reset();
        setShowCreateModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setData({
            product_category_id: product.product_category_id,
            name: product.name,
            sku: product.sku || '',
            description: product.description || '',
            unit: product.unit || 'pieza',
            min_stock: product.min_stock || 0,
            price: product.price || '',
            tax_iva: product.tax_iva || 0,
            tax_ieps: product.tax_ieps || 0,
            is_controlled: !!product.is_controlled,
            is_service: !!product.is_service,
        });
        setShowCreateModal(true);
    };

    const deleteProduct = (id) => {
        if (confirm('¿Estás seguro de eliminar este artículo del catálogo? Esto lo ocultará de las búsquedas pero mantendrá el historial de ventas pasadas.')) {
            router.delete(route('inventory.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="font-black text-xl text-slate-800 dark:text-white uppercase tracking-tighter">Inventario y Farmacia</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Gestión de Catálogo y Movimientos</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {auth.user?.role === 'admin' && (
                            <button
                                onClick={openCreateModal}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
                            >
                                <span className="text-sm">+</span> Nuevo Artículo
                            </button>
                        )}
                        <Link
                            href={route('inventory.audit')}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-brand-primary/20 flex items-center gap-2"
                        >
                            📊 Auditoría
                        </Link>
                        <Link
                            href={route('inventory.movements')}
                            className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                        >
                            📦 Movimientos
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Inventario" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* Compact Type Selector */}
                    <div className="flex bg-slate-100 dark:bg-gray-900/50 p-1 rounded-xl w-fit border dark:border-gray-800 shadow-sm">
                        <button
                            onClick={() => setSelectedType('product')}
                            className={`px-5 py-1.5 rounded-lg font-black uppercase tracking-wider text-[9px] transition-all flex items-center gap-2 ${selectedType === 'product' ? 'bg-white dark:bg-gray-800 text-brand-primary shadow-sm ring-1 ring-slate-200 dark:ring-gray-700' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            <span className="text-xs">📦</span> Inventario
                        </button>
                        <button
                            onClick={() => setSelectedType('service')}
                            className={`px-5 py-1.5 rounded-lg font-black uppercase tracking-wider text-[9px] transition-all flex items-center gap-2 ${selectedType === 'service' ? 'bg-white dark:bg-gray-800 text-brand-primary shadow-sm ring-1 ring-slate-200 dark:ring-gray-700' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            <span className="text-xs">✂️</span> Servicios
                        </button>
                    </div>

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

                      {/* Tabla Estilo Kardex / Listado */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-xl overflow-hidden p-0">
                        {products.data.length > 0 ? (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {products.data.map(product => {
                                    const isLowStock = product.current_stock <= product.min_stock;
                                    const expirationAlert = getExpirationAlert(product.lots);
                                    
                                    const content = (
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            {/* Info de Artículo */}
                                            <div className="flex items-center min-w-0 gap-5 flex-1 relative w-full sm:w-auto">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-gray-700 group-hover:bg-white/20 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110">
                                                    {product.category.icon || '📦'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-base font-black text-gray-900 dark:text-gray-100 group-hover:text-white uppercase tracking-tight truncate">
                                                            {product.name}
                                                        </p>
                                                        {!!product.is_controlled && (
                                                            <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-red-200 group-hover:bg-white group-hover:text-red-600">
                                                                ⚠️ Controlado
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 group-hover:text-white/80 font-bold uppercase tracking-wide truncate">
                                                        <span>{product.sku || 'Sin SKU'}</span>
                                                        <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 group-hover:bg-white/30 rounded-full"></span>
                                                        <span>{product.category.name}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Detalles (Stock / Precio / Estado) */}
                                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0">
                                                {selectedType === 'product' && (
                                                    <div className="text-left sm:text-right w-20">
                                                        <p className="text-[10px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5">Stock</p>
                                                        <p className={`text-base font-black ${isLowStock ? 'text-red-500 group-hover:text-red-200' : 'text-slate-700 dark:text-slate-300 group-hover:text-white'}`}>
                                                            {parseFloat(product.current_stock).toLocaleString()} <span className="text-[10px]">{product.unit}</span>
                                                        </p>
                                                    </div>
                                                )}

                                                                                                <div className="text-center sm:text-right w-24">
                                                    <p className="text-[10px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5">P. Público</p>
                                                    <p className="text-base font-black text-brand-primary group-hover:text-white">
                                                        ${parseFloat(product.price).toLocaleString()}
                                                    </p>
                                                </div>

                                                {selectedType === 'product' && (
                                                    <div className="text-right w-28 hidden md:block">
                                                        <div className="flex flex-col items-end gap-1">
                                                            {isLowStock ? (
                                                                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-red-200 group-hover:bg-white group-hover:text-red-600">
                                                                    Poco Stock
                                                                </span>
                                                            ) : (
                                                                <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-emerald-200 group-hover:bg-white group-hover:text-emerald-600">
                                                                    Stock OK
                                                                </span>
                                                            )}
                                                            {expirationAlert && (
                                                                <span className={`${expirationAlert.color} px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border group-hover:bg-white group-hover:text-brand-primary mt-1`}>
                                                                    ⏰ {expirationAlert.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-end gap-3 w-16">
                                                    <div className="hidden md:flex flex-shrink-0">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-[#1B2132] border-2 border-slate-200 dark:border-slate-700/50 group-hover:border-white group-hover:bg-white/20 group-hover:text-white text-gray-300 transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    {auth.user?.role === 'admin' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                deleteProduct(product.id);
                                                            }}
                                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 group-hover:bg-white/10 group-hover:text-white rounded-lg transition-all"
                                                            title="Eliminar del catálogo"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <li key={product.id} className="group hover:bg-brand-primary transition-colors cursor-pointer">
                                            {selectedType === 'product' ? (
                                                <Link href={route('inventory.show', product.id)} className="block px-6 py-5">
                                                    {content}
                                                </Link>
                                            ) : (
                                                <div 
                                                    className="px-6 py-5"
                                                    onClick={() => openEditModal(product)}
                                                >
                                                    {content}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="text-center py-20 px-6">
                                <div className="text-6xl mb-6 opacity-20 transform hover:scale-110 transition-transform">
                                    {selectedType === 'product' ? '📦' : '✂️'}
                                </div>
                                <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest mb-2">
                                    {searchTerm ? 'No se encontraron resultados' : `Sin ${selectedType === 'product' ? 'productos' : 'servicios'}`}
                                </h3>
                                <p className="text-gray-400 text-sm mb-8">
                                    {searchTerm ? 'Intenta usar otros términos de búsqueda.' : `Agrega el primer registro al catálogo.`}
                                </p>
                            </div>
                        )}
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
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border dark:border-gray-700">
                        <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter">
                                {editingProduct ? (data.is_service ? 'Editar Servicio' : 'Editar Artículo') : (data.is_service ? 'Nuevo Servicio Médico / Grooming' : 'Nuevo Artículo al Catálogo')}
                            </h3>
                            <button onClick={() => { setShowCreateModal(false); setEditingProduct(null); }} className="text-2xl opacity-30 hover:opacity-100">×</button>
                        </div>
                        <form onSubmit={submitProduct} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

                            {!editingProduct && (
                                <div className="flex gap-4 mb-4 border-b pb-4 dark:border-gray-700">
                                    <label className="flex items-center gap-2 cursor-pointer font-black uppercase tracking-widest text-xs">
                                        <input type="radio" checked={!data.is_service} onChange={() => setData({ ...data, is_service: false, unit: 'pieza', min_stock: 5 })} className="text-brand-primary focus:ring-brand-primary" />
                                        📦 Es un Producto Físico
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer font-black uppercase tracking-widest text-xs">
                                        <input type="radio" checked={data.is_service} onChange={() => setData({ ...data, is_service: true, unit: 'servicio', min_stock: 0, is_controlled: false })} className="text-brand-primary focus:ring-brand-primary" />
                                        ✂️ Es un Servicio (Consulta, Estética)
                                    </label>
                                </div>
                            )}

                            {data.is_service && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 p-4 rounded-2xl mb-4">
                                    <h4 className="font-black text-indigo-800 dark:text-indigo-300 text-sm mb-1">💡 Nota sobre Servicios</h4>
                                    <p className="text-xs text-indigo-700 dark:text-indigo-400">
                                        Los servicios no requieren llevar un control de inventario (Stock) ni caducidades.
                                        Selecciona la categoría correcta (Consultas, Cirugías, etc.) para mantener separados tus reportes de ingresos.
                                        Puedes agregar detalles extra en las notas de la descripción.
                                    </p>
                                </div>
                            )}

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
                                        {categories.filter(cat => !!cat.is_service === !!data.is_service).map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.product_category_id && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.product_category_id}</p>}
                                </div>
                                {!data.is_service && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unidad de Medida</label>
                                        <select
                                            value={data.unit}
                                            onChange={e => setData('unit', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                            required={!data.is_service}
                                        >
                                            <option value="pieza">Pieza (PZA)</option>
                                            <option value="frasco">Frasco</option>
                                            <option value="caja">Caja</option>
                                            <option value="bulto">Bulto / Saco</option>
                                            <option value="ml">Mililitros (ML)</option>
                                            <option value="gramo">Gramos (G)</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className={`grid ${data.is_service ? 'grid-cols-2' : 'grid-cols-3'} gap-6`}>
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
                                {!data.is_service && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Mínimo</label>
                                        <input
                                            type="number"
                                            value={data.min_stock}
                                            onChange={e => setData('min_stock', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                            required={!data.is_service}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción / Notas Adicionales</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold min-h-[100px]"
                                    placeholder={data.is_service ? "Ej. Incluye corte de uñas, baño garrapaticida y limpieza de oídos..." : "Notas sobre características del producto..."}
                                ></textarea>
                                {errors.description && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">IVA (%) (Eq. Medicamento = 0%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.tax_iva}
                                            onChange={e => setData('tax_iva', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 pl-6 pr-8 focus:ring-2 focus:ring-brand-primary font-bold text-gray-900 dark:text-gray-100"
                                            required
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                    </div>
                                    {errors.tax_iva && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.tax_iva}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">IEPS (%) (Eq. Dulces/Chocolate)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.tax_ieps}
                                            onChange={e => setData('tax_ieps', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 pl-6 pr-8 focus:ring-2 focus:ring-brand-primary font-bold text-gray-900 dark:text-gray-100"
                                            required
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                    </div>
                                    {errors.tax_ieps && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.tax_ieps}</p>}
                                </div>
                            </div>

                            {!data.is_service && (
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
                            )}

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-50 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Guardando...' : (editingProduct ? 'Actualizar ' : 'Registrar ') + (data.is_service ? 'Servicio' : 'Artículo')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
