import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Show({ auth, product, transactions, categories }) {
    const [showLotModal, setShowLotModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);

    // Permission Check Helper
    const hasPermission = (permission) => {
        return auth.user?.role === 'admin' || auth.permissions?.includes(permission);
    };

    // Adjustment states
    const [adjLotId, setAdjLotId] = useState(null);
    const [adjType, setAdjType] = useState('out');
    const [adjQty, setAdjQty] = useState('');
    const [adjReason, setAdjReason] = useState('');

    const { data, setData, post, processing, reset, errors } = useForm({
        lot_number: '',
        expiration_date: '',
        quantity: '',
        unit_cost: '',
        provider: '',
        notes: ''
    });

    const submitLot = (e) => {
        e.preventDefault();
        post(route('inventory.lots.store', product.id), {
            onSuccess: () => {
                setShowLotModal(false);
                reset();
            }
        });
    };

    const openAdjustModal = (lotId, changeType) => {
        setAdjLotId(lotId);
        setAdjType(changeType);
        setAdjQty('');
        setAdjReason('');
        setShowAdjustModal(true);
    };

    const submitAdjust = (e) => {
        e.preventDefault();
        if (!adjQty || isNaN(adjQty) || adjQty <= 0) return alert('Cantidad inválida');
        if (!adjReason.trim()) return alert('Debe ingresar un motivo');

        let finalQty = parseFloat(adjQty);
        if (adjType === 'out') {
            finalQty = -Math.abs(finalQty);
        } else if (adjType === 'return') {
            finalQty = Math.abs(finalQty);
        }

        router.post(route('inventory.adjust', product.id), {
            lot_id: adjLotId,
            quantity: finalQty,
            type: adjType,
            notes: adjReason
        }, {
            preserveScroll: true,
            onSuccess: () => setShowAdjustModal(false),
        });
    };

    const { data: editData, setData: setEditData, put: updateProduct, processing: editProcessing, errors: editErrors } = useForm({
        product_category_id: product.product_category_id || '',
        name: product.name || '',
        sku: product.sku || '',
        unit: product.unit || 'pieza',
        min_stock: product.min_stock || 0,
        price: product.price || '',
        tax_iva: product.tax_iva !== undefined ? product.tax_iva : 16,
        tax_ieps: product.tax_ieps !== undefined ? product.tax_ieps : 0,
        is_controlled: product.is_controlled || false,
        is_active: product.is_active !== undefined ? product.is_active : true,
    });

    const [showEditModal, setShowEditModal] = useState(false);

    const submitEdit = (e) => {
        e.preventDefault();
        updateProduct(route('inventory.update', product.id), {
            onSuccess: () => setShowEditModal(false)
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href={route('inventory.index')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center text-slate-500">
                           <span className="text-xl">←</span>
                        </Link>
                        <h2 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight flex items-center gap-2 uppercase tracking-tight">
                            <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span>
                            Kardex: <span className="text-brand-primary opacity-80">{product.name}</span>
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowLotModal(true)}
                            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 flex items-center gap-2 active:scale-95"
                        >
                            <span>+ Registrar Entrada</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Stock - ${product.name}`} />

            <div className="py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-6">
                        {/* Panel Izquierdo: Resumen Producto */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 p-6 shadow-sm relative">
                                {hasPermission('manage inventory') || auth.user?.role === 'admin' ? (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-brand-primary hover:text-white text-slate-400 rounded-xl transition-all shadow-inner border dark:border-slate-700"
                                        title="Editar Catálogo"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                ) : null}

                                <div className="flex items-center gap-4 border-b dark:border-slate-700/50 pb-5 mb-5 pr-10">
                                    <div className="w-14 h-14 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner border dark:border-slate-700">
                                        {product.category?.icon || '📦'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-snug truncate" title={product.name}>{product.name}</h3>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{product.category?.name || 'SIN CATEGORÍA'}</p>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-70">Identificador/SKU</span>
                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{product.sku || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border dark:border-slate-800">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Stock Físico Real</span>
                                        <div className="text-right">
                                            <span className="font-black text-brand-primary text-xl leading-none">{parseFloat(product.current_stock)}</span>
                                            <p className="text-[8px] font-black text-slate-400 uppercase mt-0.5">{product.unit}s</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-70">Precio Público</span>
                                        <span className="font-black text-sm text-slate-900 dark:text-white">${parseFloat(product.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl text-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">IVA Aplicado</p>
                                            <p className="font-black text-xs text-slate-600 dark:text-slate-300">{parseFloat(product.tax_iva)}%</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl text-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Mínimo Alerta</p>
                                            <p className="font-black text-xs text-slate-600 dark:text-slate-300">{parseFloat(product.min_stock)}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-70">Controlado</span>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black border tracking-widest ${product.is_controlled ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            {product.is_controlled ? 'SÍ (REQUERIDO)' : 'NO (LIBRE)'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Historial de Movimientos */}
                            <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 shadow-sm overflow-hidden">
                                <div className="p-5 border-b dark:border-slate-700/50 bg-slate-50/50 dark:bg-gray-900/30">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kardex de Operaciones</h4>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {transactions.map(t => (
                                        <div key={t.id} className="p-4 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black border shadow-sm ${t.type === 'in' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {t.type === 'in' ? '↓' : '↑'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-tight leading-none italic">
                                                        {t.type === 'in' ? 'Entrada' : t.type === 'sale' ? 'Venta' : t.type === 'return' ? 'Devolución' : 'Salida/Ajuste'}
                                                    </p>
                                                    <p className={`text-[11px] font-black tracking-tighter ${t.type === 'in' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {t.type === 'in' ? '+' : '-'}{parseFloat(t.quantity)}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-bold dark:text-slate-400 truncate opacity-80" title={t.notes}>{t.notes || 'S/M'}</p>
                                                <p className="text-[8px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mt-1">
                                                    {format(new Date(t.created_at), "dd MMM HH:mm", { locale: es })} • {t.user.name.split(' ')[0]}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Panel Central: Lotes Activos */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] border dark:border-slate-700/50 shadow-sm overflow-hidden">
                                <div className="p-4 border-b dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/30">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Desglose de Lotes en Existencia</h4>
                                    <span className="text-[9px] font-black py-1 px-3 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 text-slate-400 uppercase">Activos: {product.lots.filter(l => parseFloat(l.current_quantity) > 0).length}</span>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {product.lots.length > 0 ? product.lots.map(lot => {
                                        const isExpired = lot.expiration_date && new Date(lot.expiration_date) < new Date();
                                        const qty = parseFloat(lot.current_quantity);
                                        return (
                                            <div key={lot.id} className={`group py-2.5 px-5 hover:bg-brand-primary transition-all duration-150 flex items-center justify-between gap-4 ${qty <= 0 ? 'opacity-40 grayscale' : ''}`}>
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-16 flex flex-col items-center justify-center border-r dark:border-slate-700/50 pr-4 group-hover:border-white/30 transition-colors">
                                                        <p className="text-lg font-black text-brand-primary group-hover:text-white leading-none tracking-tighter">{qty}</p>
                                                        <p className="text-[8px] font-black text-slate-400 group-hover:text-white/60 uppercase mt-1 leading-none italic">Unid.</p>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h5 className="font-black text-slate-900 dark:text-white group-hover:text-white text-sm uppercase tracking-tight truncate">Lote #{lot.lot_number}</h5>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${isExpired ? 'text-red-500 group-hover:text-white' : 'text-slate-400 group-hover:text-white/70'}`}>
                                                                {lot.expiration_date ? format(new Date(lot.expiration_date), "dd MMM yyyy", { locale: es }).toUpperCase() : 'N/A SIN FECHA'}
                                                            </span>
                                                            {isExpired && <span className="text-[8px] font-black px-1.5 py-0.5 bg-red-100 text-red-600 border border-red-200 rounded group-hover:bg-white group-hover:text-red-600 group-hover:border-white shadow-sm">EXPIRADO</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openAdjustModal(lot.id, 'out')} className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-[9px] font-black uppercase border border-white/40 hover:bg-white hover:text-brand-primary transition-all active:scale-95">Salida</button>

                                                        {hasPermission('manage returns') && (
                                                            <button onClick={() => openAdjustModal(lot.id, 'return')} className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-[9px] font-black uppercase border border-white/40 hover:bg-white hover:text-brand-primary transition-all active:scale-95">Devol.</button>
                                                        )}

                                                        <button onClick={() => openAdjustModal(lot.id, 'adjustment')} className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-[9px] font-black uppercase border border-white/40 hover:bg-white hover:text-brand-primary transition-all active:scale-95">Ajuste</button>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center text-slate-300 group-hover:hidden transition-all">
                                                        ⚙️
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="py-20 text-center opacity-40">
                                            <div className="text-5xl mb-4">📦</div>
                                            <p className="font-black text-slate-500 uppercase tracking-[0.2em] text-xs">No hay lotes con existencia registrados</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Entrada de Lote */}
            {showLotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1B2132] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border dark:border-slate-700">
                        <div className="p-8 border-b dark:border-slate-700/50 flex justify-between items-start bg-slate-50/50 dark:bg-gray-900/40">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Entrada de Mercancía</h3>
                                <p className="text-[10px] font-black text-brand-primary mt-1 uppercase tracking-widest italic opacity-80">{product.name} • SKU: {product.sku}</p>
                            </div>
                            <button type="button" onClick={() => setShowLotModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all font-black text-2xl">×</button>
                        </div>
                        <form onSubmit={submitLot} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Número de Lote / ID</label>
                                    <input
                                        type="text"
                                        value={data.lot_number}
                                        onChange={e => setData('lot_number', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-brand-primary font-bold shadow-inner text-sm placeholder:opacity-30"
                                        placeholder="Ej: LB-0024-X"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Vencimiento</label>
                                    <input
                                        type="date"
                                        value={data.expiration_date}
                                        onChange={e => setData('expiration_date', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-brand-primary font-bold shadow-inner text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Cant. a Ingresar</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.quantity}
                                        onChange={e => setData('quantity', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-brand-primary font-black text-xl shadow-inner text-brand-primary placeholder:text-slate-300"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Costo Unitario <span className="opacity-50">(SIN IVA)</span></label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.unit_cost}
                                            onChange={e => setData('unit_cost', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3.5 pl-10 pr-6 focus:ring-2 focus:ring-brand-primary font-bold shadow-inner text-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Fabricante / Proveedor</label>
                                <input
                                    type="text"
                                    value={data.provider}
                                    onChange={e => setData('provider', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-brand-primary font-bold shadow-inner text-sm"
                                    placeholder="Nombre de la distribuidora o laboratorio..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Referencia de Compra / Notas</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold text-sm shadow-inner"
                                    rows="2"
                                    placeholder="Factura #, Remisión, Código autorizante..."
                                ></textarea>
                                {!!product.is_controlled && <p className="text-red-500 text-[9px] font-black mt-1 ml-1 bg-red-50 p-2 rounded-lg border border-red-100 uppercase tracking-tighter leading-tight italic">⚠️ Advertencia: Este es un medicamento controlado. Asegúrese de registrar los datos de la receta médica en las notas.</p>}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Generando Registro...' : 'Finalizar e Ingresar al Stock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Devolución / Ajuste / Salida */}
            {showAdjustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-700">
                        <div className="p-6 border-b dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/30">
                            <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                                {adjType === 'return' ? 'Registrar Devolución' : adjType === 'out' ? 'Registrar Salida' : 'Ajustar Inventario'}
                            </h3>
                            <button onClick={() => setShowAdjustModal(false)} className="w-8 h-8 flex items-center justify-center text-2xl text-slate-400 hover:text-red-500 transition font-black">×</button>
                        </div>
                        <form onSubmit={submitAdjust} className="p-6 space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic opacity-70">Operación a Realizar</label>
                                    <select
                                        value={adjType}
                                        onChange={(e) => setAdjType(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary font-black uppercase tracking-tight text-xs text-slate-700 dark:text-slate-300 shadow-sm"
                                    >
                                        <option value="out">Salida Baja/Mermas (- Resta)</option>
                                        <option value="return">Devolución Cliente (+ Suma)</option>
                                        <option value="adjustment">Ajuste de Conteo (+ / -)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic opacity-70">Cantidad de Artículos</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={adjQty}
                                        onChange={e => setAdjQty(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-brand-primary font-black text-2xl text-center text-brand-primary shadow-inner"
                                        placeholder="0"
                                        required
                                    />
                                    {adjType === 'adjustment' && <p className="text-[8px] text-slate-400 text-center uppercase tracking-widest font-black mt-1 italic text-brand-primary opacity-60">Usa números negativos (-) si el conteo indica STOCK FALTANTE.</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic opacity-70">Justificación del Movimiento</label>
                                    <textarea
                                        value={adjReason}
                                        onChange={e => setAdjReason(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary font-bold text-xs"
                                        rows="3"
                                        placeholder="Describa brevemente la razón de este cambio..."
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className={`w-full text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 text-xs ${adjType === 'return' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' :
                                    adjType === 'out' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' :
                                        'bg-brand-primary hover:bg-opacity-90 shadow-brand-primary/20'
                                    }`}
                            >
                                Confirmar {adjType === 'return' ? 'Devolución' : adjType === 'out' ? 'Salida' : 'Ajuste'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Edición de Producto */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1B2132] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border dark:border-slate-700">
                        <div className="p-8 border-b dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/30">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Editar Perfil de Artículo</h3>
                            <button onClick={() => setShowEditModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 text-slate-400 font-black text-2xl transition-all">×</button>
                        </div>
                        <form onSubmit={submitEdit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Categoría del Catálogo</label>
                                    <select
                                        value={editData.product_category_id}
                                        onChange={e => setEditData('product_category_id', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-6 focus:ring-2 focus:ring-brand-primary font-bold text-xs shadow-inner uppercase tracking-tight"
                                        required
                                    >
                                        <option value="" disabled>Seleccionar...</option>
                                        {categories && categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nombre Comercial</label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={e => setEditData('name', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-6 focus:ring-2 focus:ring-brand-primary font-black text-sm uppercase tracking-tight shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Unidad de Medida</label>
                                    <select
                                        value={editData.unit}
                                        onChange={e => setEditData('unit', e.target.value)}
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Precio al Público</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editData.price}
                                            onChange={e => setEditData('price', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 pl-10 pr-6 focus:ring-2 focus:ring-brand-primary font-black text-sm shadow-inner"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5 col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">SKU / Clave</label>
                                    <input
                                        type="text"
                                        value={editData.sku}
                                        onChange={e => setEditData('sku', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-6 focus:ring-2 focus:ring-brand-primary font-bold text-xs shadow-inner"
                                    />
                                </div>
                                <div className="space-y-1.5 col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Mín. Stock</label>
                                    <input
                                        type="number"
                                        value={editData.min_stock}
                                        onChange={e => setEditData('min_stock', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-6 focus:ring-2 focus:ring-brand-primary font-black text-xs text-center shadow-inner"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">IVA (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editData.tax_iva}
                                        onChange={e => setEditData('tax_iva', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/40 border-none rounded-2xl py-3 px-6 focus:ring-2 focus:ring-brand-primary font-bold text-xs text-center shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t dark:border-slate-700/50">
                                <label className="flex items-center gap-4 cursor-pointer p-4 bg-red-50/50 hover:bg-red-100/50 border border-red-100 rounded-2xl transition shadow-sm group">
                                    <input
                                        type="checkbox"
                                        checked={editData.is_controlled}
                                        onChange={e => setEditData('is_controlled', e.target.checked)}
                                        className="w-6 h-6 text-red-600 rounded bg-white border-red-300 focus:ring-red-600 focus:ring-2"
                                    />
                                    <div className="flex-1">
                                        <span className="block text-sm font-black text-red-800 uppercase tracking-tight group-hover:scale-[1.01] transition-transform">Medicamento de Uso Controlado</span>
                                        <span className="block text-[10px] font-bold text-red-600/70 mt-0.5 leading-tight italic">⚠️ Los movimientos de este producto serán auditados y requieren documentación física detallada.</span>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                                >
                                    {editProcessing ? 'Actualizando Datos...' : 'Guardar Cambios en Catálogo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
