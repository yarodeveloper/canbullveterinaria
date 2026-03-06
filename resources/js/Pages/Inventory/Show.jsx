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

        // Determinar si la cantidad es positiva o negativa. 
        // Solo 'out' (salida) debe restar explícitamente el valor introducido 
        // (asumiendo que back-end hace `lot->current_quantity += $qty`). 
        // Si es Devolución (return) o Ajuste (adjustment), el backend sumará.
        let finalQty = parseFloat(adjQty);
        if (adjType === 'out') {
            finalQty = -Math.abs(finalQty);
        } else if (adjType === 'return') {
            finalQty = Math.abs(finalQty); // Devoluciones SIEMPRE suman al inventario
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
        is_active: product.is_active !== undefined ? product.is_active : true, // Ensure we send boolean
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
                        <Link href={route('inventory.index')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <span className="text-xl">←</span>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-tighter">
                            Detalle de Stock: <span className="text-brand-primary">{product.name}</span>
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        {/* Botón de editar movido a la tarjeta */}
                        <button
                            onClick={() => setShowLotModal(true)}
                            className="bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-primary-50"
                        >
                            + Registrar Entrada (Lote)
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Stock - ${product.name}`} />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        {/* Panel Izquierdo: Resumen Producto */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 p-8 shadow-xl relative">
                                {hasPermission('manage inventory') || auth.user?.role === 'admin' ? (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-brand-primary hover:text-white text-gray-400 rounded-xl transition-all shadow-sm"
                                        title="Editar Catálogo"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                ) : null}

                                <div className="flex items-center gap-5 border-b dark:border-gray-700 pb-5 mb-5 pr-10">
                                    <div className="w-16 h-16 shrink-0 bg-brand-primary/10 rounded-[1.2rem] flex items-center justify-center text-3xl">
                                        {product.category?.icon || ''}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-snug truncate" title={product.name}>{product.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{product.category?.name || 'SIN CATEGORÍA'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-gray-400 uppercase">SKU</span>
                                        <span className="font-bold">{product.sku || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-gray-400 uppercase">Stock Físico (Total)</span>
                                        <span className="font-black text-brand-primary text-lg">{parseFloat(product.current_stock)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-gray-400 uppercase">Unidad</span>
                                        <span className="font-bold uppercase">{product.unit}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-gray-400 uppercase">Precio</span>
                                        <span className="font-black text-gray-900 dark:text-gray-100">${parseFloat(product.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    {parseFloat(product.tax_iva) > 0 && (
                                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                                            <span className="text-[11px] font-black text-gray-500 uppercase">IVA</span>
                                            <span className="font-bold text-gray-600 dark:text-gray-300">{parseFloat(product.tax_iva)}%</span>
                                        </div>
                                    )}
                                    {parseFloat(product.tax_ieps) > 0 && (
                                        <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                                            <span className="text-[11px] font-black text-orange-500 uppercase">IEPS</span>
                                            <span className="font-bold text-orange-500">{parseFloat(product.tax_ieps)}%</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-gray-400 uppercase">Stock Mínimo</span>
                                        <span className="font-bold">{parseFloat(product.min_stock)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-gray-400 uppercase">Controlado</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${product.is_controlled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {product.is_controlled ? 'SÍ' : 'NO'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Historial de Movimientos */}
                            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 p-8 shadow-xl">
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Últimos Movimientos</h4>
                                <div className="space-y-6">
                                    {transactions.map(t => (
                                        <div key={t.id} className="flex items-start gap-4 pb-4 border-b dark:border-gray-700 last:border-none">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${t.type === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                {t.type === 'in' ? '↓' : '↑'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <p className="text-sm font-black uppercase text-gray-900 dark:text-gray-100">
                                                        {t.type === 'in' ? 'Entrada' : t.type === 'sale' ? 'Venta' : t.type === 'return' ? 'Devolución' : 'Salida/Ajuste'}
                                                    </p>
                                                    <p className={`font-black ${t.type === 'in' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {t.type === 'in' ? '+' : '-'}{parseFloat(t.quantity)}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-gray-400 italic mb-1">{t.notes}</p>
                                                <p className="text-[9px] font-bold text-gray-300 uppercase">
                                                    {format(new Date(t.created_at), "d MMM, HH:mm", { locale: es })} • {t.user.name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Panel Central: Lotes Activos */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-xl overflow-hidden">
                                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/40">
                                    <h4 className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Lotes en Stock</h4>
                                </div>
                                <div className="divide-y dark:divide-gray-700">
                                    {product.lots.length > 0 ? product.lots.map(lot => {
                                        const isExpired = lot.expiration_date && new Date(lot.expiration_date) < new Date();
                                        return (
                                            <div key={lot.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 text-center border-r dark:border-gray-700 pr-5">
                                                        <p className="text-xl font-black text-brand-primary leading-none">{parseFloat(lot.current_quantity)}</p>
                                                        <p className="text-[8px] font-black text-gray-400 uppercase mt-1">Stock</p>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-tight">Lote #{lot.lot_number}</h5>
                                                        <span className={`text-[9px] font-bold flex items-center gap-1 mt-0.5 ${isExpired ? 'text-red-500' : 'text-gray-400'}`}>
                                                            Vence: {lot.expiration_date ? format(new Date(lot.expiration_date), "dd/MM/yyyy") : 'N/A'}
                                                            {isExpired && <span className="ml-1 text-[8px] bg-red-100 px-1 rounded font-black text-red-600 border border-red-200">EXPIRADO</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 self-end sm:self-auto">
                                                    <button onClick={() => openAdjustModal(lot.id, 'out')} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-[9px] font-black uppercase hover:bg-amber-100 hover:text-amber-700 transition-colors shadow-sm border border-transparent hover:border-amber-200">Salida</button>

                                                    {hasPermission('manage returns') && (
                                                        <button onClick={() => openAdjustModal(lot.id, 'return')} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-100 hover:text-emerald-700 transition-colors shadow-sm border border-transparent hover:border-emerald-200">Devolución</button>
                                                    )}

                                                    <button onClick={() => openAdjustModal(lot.id, 'adjustment')} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-[9px] font-black uppercase hover:bg-blue-100 hover:text-blue-700 transition-colors shadow-sm border border-transparent hover:border-blue-200">Ajuste</button>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-50">
                                            No hay lotes con existencia
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border dark:border-gray-700">
                        <div className="p-8 border-b dark:border-gray-700 flex justify-between items-start bg-gray-50/50 dark:bg-gray-900/40">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-gray-100">Entrada de Mercancía</h3>
                                <p className="text-xs font-black text-brand-primary mt-1 uppercase tracking-widest">{product.name}</p>
                            </div>
                            <button type="button" onClick={() => setShowLotModal(false)} className="text-2xl opacity-30 hover:opacity-100 transition-opacity -mt-1 hover:text-red-500">×</button>
                        </div>
                        <form onSubmit={submitLot} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"># de Lote</label>
                                    <input
                                        type="text"
                                        value={data.lot_number}
                                        onChange={e => setData('lot_number', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold shadow-inner"
                                        placeholder="Ej: AB-123"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha de Caducidad</label>
                                    <input
                                        type="date"
                                        value={data.expiration_date}
                                        onChange={e => setData('expiration_date', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cantidad Que Ingresa</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.quantity}
                                        onChange={e => setData('quantity', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold text-xl shadow-inner"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Costo Unitario <span className="text-gray-400 text-[8px]">(SIN IVA)</span></label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.unit_cost}
                                            onChange={e => setData('unit_cost', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 pl-10 pr-6 focus:ring-2 focus:ring-brand-primary font-bold shadow-inner"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-400 ml-1 font-bold">Ayuda a calcular utilidad futura.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Proveedor / Laboratorio</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">🏢</span>
                                    <input
                                        type="text"
                                        value={data.provider}
                                        onChange={e => setData('provider', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-brand-primary font-bold shadow-inner text-sm"
                                        placeholder="Nombre del proveedor o laboratorio que surte"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Folio de Factura / Notas / Receta</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-medium shadow-inner"
                                    rows="2"
                                    placeholder="Factura, Remisión, Código Autorizante..."
                                ></textarea>
                                {!!product.is_controlled && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 bg-red-50 p-2 rounded-lg">* Requiere justificar datos de receta médica (medicamento controlado).</p>}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-50 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Registrando...' : 'Confirmar Ingreso al Inventario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Devolución / Ajuste / Salida */}
            {showAdjustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border dark:border-gray-700">
                        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/40">
                            <h3 className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                                {adjType === 'return' ? 'Registrar Devolución' : adjType === 'out' ? 'Registrar Salida' : 'Ajustar Inventario'}
                            </h3>
                            <button onClick={() => setShowAdjustModal(false)} className="text-2xl text-gray-400 hover:text-red-500 transition">×</button>
                        </div>
                        <form onSubmit={submitAdjust} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        Selecciona la Operación
                                    </label>
                                    <select
                                        value={adjType}
                                        onChange={(e) => setAdjType(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary font-bold text-gray-700 dark:text-gray-200"
                                    >
                                        <option value="out">Salida Baja/Mermas (- Resta al Stock)</option>
                                        <option value="return">Devolución Cliente (+ Suma al Stock)</option>
                                        <option value="adjustment">Ajuste de Conteo (+ o - al Stock)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cantidad de Artículos</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={adjQty}
                                        onChange={e => setAdjQty(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary font-bold text-xl text-center"
                                        placeholder="0"
                                        required
                                    />
                                    {adjType === 'adjustment' && <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold mt-1">Usa números negativos (-) si el conteo indica faltante.</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        {adjType === 'return' ? 'Motivo Específico de Devolución' : 'Justificación de Movimiento'}
                                    </label>
                                    <textarea
                                        value={adjReason}
                                        onChange={e => setAdjReason(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary font-medium"
                                        rows="3"
                                        placeholder={adjType === 'return' ? "Ej. Producto dañado, cliente se arrepintió, cambio de talla..." : "Razón del movimiento..."}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className={`w-full text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${adjType === 'return' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' :
                                    adjType === 'out' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' :
                                        'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border dark:border-gray-700">
                        <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Editar Artículo</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-2xl opacity-30 hover:opacity-100">×</button>
                        </div>
                        <form onSubmit={submitEdit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
                                    <select
                                        value={editData.product_category_id}
                                        onChange={e => setEditData('product_category_id', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                        required
                                    >
                                        <option value="" disabled>Seleccionar...</option>
                                        {categories && categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {editErrors.product_category_id && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{editErrors.product_category_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Artículo</label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={e => setEditData('name', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                        required
                                    />
                                    {editErrors.name && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{editErrors.name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unidad de Medida</label>
                                    <select
                                        value={editData.unit}
                                        onChange={e => setEditData('unit', e.target.value)}
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
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Público</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editData.price}
                                            onChange={e => setEditData('price', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 pl-10 pr-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SKU / Clave</label>
                                    <input
                                        type="text"
                                        value={editData.sku}
                                        onChange={e => setEditData('sku', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Mínimo (Alerta)</label>
                                    <input
                                        type="number"
                                        value={editData.min_stock}
                                        onChange={e => setEditData('min_stock', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">IVA (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editData.tax_iva}
                                            onChange={e => setEditData('tax_iva', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 pl-6 pr-8 focus:ring-2 focus:ring-brand-primary font-bold text-gray-900 dark:text-gray-100"
                                            required
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                    </div>
                                    {editErrors.tax_iva && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{editErrors.tax_iva}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">IEPS (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editData.tax_ieps}
                                            onChange={e => setEditData('tax_ieps', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 pl-6 pr-8 focus:ring-2 focus:ring-brand-primary font-bold text-gray-900 dark:text-gray-100"
                                            required
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                    </div>
                                    {editErrors.tax_ieps && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{editErrors.tax_ieps}</p>}
                                </div>
                            </div>

                            <div className="pt-4 border-t dark:border-gray-700">
                                <label className="flex items-center gap-4 cursor-pointer p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl transition">
                                    <input
                                        type="checkbox"
                                        checked={editData.is_controlled}
                                        onChange={e => setEditData('is_controlled', e.target.checked)}
                                        className="w-6 h-6 text-red-600 rounded bg-white border-red-300 focus:ring-red-600 focus:ring-2"
                                    />
                                    <div>
                                        <span className="block text-sm font-black text-red-800 uppercase tracking-tight">Es Medicamento Controlado</span>
                                        <span className="block text-xs font-bold text-red-600/70 mt-0.5">La Ley requiere bitácora documentada en cada entrada y salida.</span>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {editProcessing ? 'Guardando Cambios...' : 'Guardar Modificaciones'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
