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
        if (minDays < 0) return { label: 'Vencido', color: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/50 dark:text-red-300' };
        if (minDays <= 30) return { label: 'Vence < 1 mes', color: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/50 dark:text-orange-300' };
        if (minDays <= 60) return { label: 'Vence < 2 meses', color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/50 dark:text-amber-300' };
        if (minDays <= 90) return { label: 'Vence < 3 meses', color: 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300' };

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
        is_service: false,
    });

    const getBasePrice = (final, iva, ieps) => {
        const f = parseFloat(final) || 0;
        const iV = parseFloat(iva) || 0;
        const iE = parseFloat(ieps) || 0;
        const divisor = (1 + iE / 100) * (1 + iV / 100);
        return divisor > 0 ? (f / divisor).toFixed(2) : f.toFixed(2);
    };

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
        setData('is_service', selectedType === 'service');
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
                <div className="flex justify-between items-center">
                    <h2 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight flex items-center gap-2 uppercase tracking-tight">
                        <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span>
                        Inventario y Farmacia
                    </h2>
                    <div className="flex gap-2">
                        {auth.user?.role === 'admin' && (
                            <button
                                onClick={openCreateModal}
                                className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                            >
                                <span>+ Nuevo Artículo</span>
                            </button>
                        )}
                        <Link
                            href={route('inventory.audit')}
                            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 flex items-center gap-2 active:scale-95"
                        >
                            <span>Auditoría / Conteo</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Inventario" />

            <div className="py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Filtros */}
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-white dark:bg-[#1B2132] p-4 rounded-[1.5rem] shadow-sm border dark:border-slate-700/50">
                        <div className="flex bg-slate-100 dark:bg-gray-900/50 p-1 rounded-xl shrink-0">
                            <button
                                onClick={() => setSelectedType('product')}
                                className={`px-4 py-1.5 rounded-lg font-black uppercase tracking-wider text-[9px] transition-all flex items-center gap-2 ${selectedType === 'product' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                📦 Inventario
                            </button>
                            <button
                                onClick={() => setSelectedType('service')}
                                className={`px-4 py-1.5 rounded-lg font-black uppercase tracking-wider text-[9px] transition-all flex items-center gap-2 ${selectedType === 'service' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                ✂️ Servicios
                            </button>
                        </div>

                        <div className="flex-1 relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o SKU..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-xl py-2 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary text-xs font-bold shadow-inner"
                            />
                        </div>

                        <div className="lg:w-48">
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-brand-primary text-[10px] font-black uppercase tracking-tight shadow-inner"
                            >
                                <option value="all">TODAS LAS CATEGORIAS</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Listado */}
                    <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 shadow-sm overflow-hidden">
                        {products.data.length > 0 ? (
                            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                {products.data.map(product => {
                                    const isLowStock = product.current_stock <= product.min_stock;
                                    const expirationAlert = getExpirationAlert(product.lots);
                                    
                                    const content = (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center min-w-0 gap-4 flex-1">
                                                <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20 rounded-xl flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                                                    {product.category.icon || '📦'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-white uppercase tracking-tight truncate">
                                                            {product.name}
                                                        </p>
                                                        {!!product.is_controlled && (
                                                            <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-red-100 group-hover:bg-white group-hover:text-red-600 group-hover:border-white shadow-sm">
                                                                CONTROLADO
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-white/80 font-bold uppercase tracking-wide truncate italic">
                                                        <span>{product.sku || 'S/SKU'}</span>
                                                        <span className="w-1 h-1 bg-slate-300 group-hover:bg-white/30 rounded-full"></span>
                                                        <span>{product.category.name}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 ml-4">
                                                {selectedType === 'product' && (
                                                    <div className="text-right w-20">
                                                        <p className="text-[9px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5 leading-none">Stock</p>
                                                        <p className={`text-xs font-black tracking-tighter ${isLowStock ? 'text-red-500 group-hover:text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-white'}`}>
                                                            {parseFloat(product.current_stock)} <span className="text-[9px] opacity-70 italic font-bold">und.</span>
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="text-right w-24">
                                                    <p className="text-[9px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5 leading-none">P. Público</p>
                                                    <p className="text-xs font-black text-brand-primary group-hover:text-white tracking-tighter">
                                                        ${parseFloat(product.selling_price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {selectedType === 'product' && (
                                                        <div className="flex flex-col items-end gap-1 w-24">
                                                            {isLowStock && (
                                                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-red-100 group-hover:bg-white group-hover:text-red-600 shadow-sm leading-none">Poco Stock</span>
                                                            )}
                                                            {expirationAlert && (
                                                                <span className={`${expirationAlert.color} px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border group-hover:bg-white group-hover:text-brand-primary shadow-sm leading-none`}>⏰ Próximo</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white border border-white shadow-sm ring-1 ring-white/50">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <li key={product.id} className="group hover:bg-brand-primary transition-all duration-150">
                                            {selectedType === 'product' ? (
                                                <Link href={route('inventory.show', product.id)} className="block px-5 py-2.5">
                                                    {content}
                                                </Link>
                                            ) : (
                                                <div 
                                                    className="px-5 py-2.5 cursor-pointer"
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
                            <div className="text-center py-20 px-6 opacity-30">
                                <div className="text-6xl mb-6"> {selectedType === 'product' ? '📦' : '✂️'} </div>
                                <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest mb-2">No se encontraron resultados</h3>
                                <p className="text-slate-400 text-sm">Prueba ajustando los filtros o creando un nuevo registro.</p>
                            </div>
                        )}
                        {/* Paginación */}
                        {products.links && products.links.length > 3 && (
                            <div className="p-4 border-t dark:border-slate-700/50 bg-slate-50/50 dark:bg-gray-900/30 flex justify-center">
                                <div className="flex flex-wrap gap-1">
                                    {products.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${!link.url ? 'text-slate-300 cursor-not-allowed' :
                                                link.active ? 'bg-brand-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-brand-primary hover:text-white'
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

            {/* Modal de Creación / Edición */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1B2132] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border dark:border-slate-700">
                        <div className="p-8 border-b dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/40">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                                {editingProduct ? 'Editar Artículo' : 'Nuevo Artículo al Catálogo'}
                            </h3>
                            <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 text-slate-400 font-black text-2xl transition-all">×</button>
                        </div>
                        <form onSubmit={submitProduct} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nombre Comercial</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-6 focus:ring-2 focus:ring-brand-primary font-black text-sm uppercase tracking-tight shadow-inner"
                                        required
                                        placeholder="Ej: Amoxicilina 500mg"
                                    />
                                    {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Categoría</label>
                                    <select
                                        value={data.product_category_id}
                                        onChange={e => setData('product_category_id', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-6 focus:ring-2 focus:ring-brand-primary font-bold text-xs shadow-inner uppercase tracking-tight"
                                        required
                                    >
                                        <option value="" disabled>Seleccionar...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                    {errors.product_category_id && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.product_category_id}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Unidad de Medida</label>
                                    <select
                                        value={data.unit}
                                        onChange={e => setData('unit', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-6 focus:ring-2 focus:ring-brand-primary font-black text-xs shadow-inner uppercase tracking-tight"
                                        required
                                    >
                                        <option value="pieza">Pieza (PZA)</option>
                                        <option value="frasco">Frasco</option>
                                        <option value="caja">Caja</option>
                                        <option value="bulto">Bulto / Saco</option>
                                        <option value="ml">Mililitros (ML)</option>
                                        <option value="gramo">Gramos (G)</option>
                                        <option value="kg">Kilo (KG)</option>
                                        <option value="lt">Litro (LT)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Precio de Venta Final (IVA e IEPS incl.)</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.price}
                                            onChange={e => setData('price', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 pl-10 pr-6 focus:ring-2 focus:ring-brand-primary font-black text-sm shadow-inner"
                                            required
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="flex justify-between px-2">
                                        <p className="text-[9px] font-bold text-slate-400 italic">Desglose contable (Base): ${getBasePrice(data.price, data.tax_iva, data.tax_ieps)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">SKU / Clave</label>
                                    <input
                                        type="text"
                                        value={data.sku}
                                        onChange={e => setData('sku', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-6 focus:ring-2 focus:ring-brand-primary font-bold text-xs shadow-inner"
                                        placeholder="Opcional"
                                    />
                                    {errors.sku && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.sku}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Mín. Stock</label>
                                    <input
                                        type="number"
                                        value={data.min_stock}
                                        onChange={e => setData('min_stock', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-6 focus:ring-2 focus:ring-brand-primary font-black text-xs text-center shadow-inner"
                                        required
                                    />
                                    {errors.min_stock && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.min_stock}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">IVA (%)</label>
                                    <input
                                        type="number"
                                        value={data.tax_iva}
                                        onChange={e => handleTaxChange('tax_iva', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-6 focus:ring-2 focus:ring-brand-primary font-bold text-xs text-center shadow-inner"
                                        required
                                    />
                                    {errors.tax_iva && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.tax_iva}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">IEPS (%)</label>
                                    <input
                                        type="number"
                                        value={data.tax_ieps}
                                        onChange={e => handleTaxChange('tax_ieps', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-6 focus:ring-2 focus:ring-brand-primary font-bold text-xs text-center shadow-inner"
                                        required
                                    />
                                    {errors.tax_ieps && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.tax_ieps}</p>}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <label className="flex-1 flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border dark:border-slate-700/50 rounded-2xl cursor-pointer hover:bg-slate-100 transition shadow-inner">
                                    <input
                                        type="checkbox"
                                        checked={data.is_controlled}
                                        onChange={e => setData('is_controlled', e.target.checked)}
                                        className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary"
                                    />
                                    <div className="leading-tight text-left">
                                        <p className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">Controlado</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase italic">Requiere receta</p>
                                    </div>
                                </label>
                                <label className="flex-1 flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border dark:border-slate-700/50 rounded-2xl cursor-pointer hover:bg-slate-100 transition shadow-inner">
                                    <input
                                        type="checkbox"
                                        checked={data.is_service}
                                        onChange={e => setData('is_service', e.target.checked)}
                                        className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary"
                                    />
                                    <div className="leading-tight text-left">
                                        <p className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">Es Servicio</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase italic">No descuenta stock</p>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Guardando Artículo...' : editingProduct ? 'Actualizar Artículo' : 'Registrar en Catálogo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
