import React, { useState, useMemo } from 'react';

/**
 * Reusable component for managing pending charges that will be sent to the POS (Caja).
 */
export default function PendingChargesEditor({ 
    charges = [], 
    products = [], 
    onAddCharge, 
    onRemoveCharge, 
    onUpdateCharge,
    title = "Cargos a Caja (Punto de Venta)",
    cardBase = "bg-white dark:bg-[#1B2132] border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-xl p-6",
    headerTitle = "text-lg font-black tracking-tight flex items-center gap-2 mb-4"
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const normalize = (str) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const safeProducts = Array.isArray(products) ? products : Object.values(products || {});
    const safeQuery = normalize(searchQuery);
    
    const filteredProducts = useMemo(() => {
        if (!safeQuery) return [];
        return safeProducts.filter(p => normalize(p?.name).includes(safeQuery)).slice(0, 10);
    }, [safeQuery, safeProducts]);

    const handleSelectProduct = (product) => {
        onAddCharge({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            notes: ''
        });
        setSearchQuery('');
    };

    return (
        <div className={cardBase + " relative"}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full blur-xl overflow-hidden pointer-events-none"></div>
            <h3 className={headerTitle + " text-emerald-500 relative z-10"}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {title}
            </h3>
            
            <div className="relative z-10 mt-6">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Añadir Cargos o Servicios</p>
                <div className="relative z-50">
                    <input 
                        type="text" 
                        placeholder="Buscar servicio o producto..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#111822] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner text-sm"
                    />
                    {searchQuery && (
                        <div className="absolute z-[200] w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto overflow-x-hidden p-2 ring-1 ring-slate-900/10 backdrop-blur-sm">
                            {filteredProducts.length > 0 ? filteredProducts.map(product => (
                                <button 
                                    key={product.id}
                                    type="button"
                                    onClick={() => handleSelectProduct(product)}
                                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-lg transition-colors group flex justify-between items-center"
                                >
                                    <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-xs">{product.name}</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs">${parseFloat(product.price).toLocaleString()}</span>
                                </button>
                            )) : (
                                <div className="px-4 py-3 text-sm text-slate-500 italic">No se encontraron productos o servicios...</div>
                            )}
                        </div>
                    )}
                </div>

                {charges.length > 0 && (
                    <div className="mt-6 space-y-3">
                        {charges.map((charge, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-900/80">
                                <div className="flex-1">
                                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase leading-none mb-1">{charge.name}</p>
                                    <p className="text-[10px] text-emerald-500 font-black">${parseFloat(charge.price).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="flex items-center bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg shadow-inner">
                                        <button 
                                            type="button"
                                            onClick={() => onUpdateCharge(idx, 'quantity', Math.max(1, (parseFloat(charge.quantity) || 1) - 1))}
                                            className="px-2 py-1 text-slate-400 hover:text-emerald-500 transition-colors"
                                        >-</button>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            step="0.1"
                                            value={charge.quantity}
                                            onChange={(e) => onUpdateCharge(idx, 'quantity', e.target.value)}
                                            className="w-12 bg-transparent border-none text-xs text-center p-0 focus:ring-0 text-slate-700 dark:text-slate-300 font-black" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => onUpdateCharge(idx, 'quantity', (parseFloat(charge.quantity) || 1) + 1)}
                                            className="px-2 py-1 text-slate-400 hover:text-emerald-500 transition-colors"
                                        >+</button>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Notas" 
                                        value={charge.notes || ''}
                                        onChange={(e) => onUpdateCharge(idx, 'notes', e.target.value)}
                                        className="flex-1 min-w-[120px] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg text-[10px] py-1.5 px-3 focus:ring-emerald-500" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => onRemoveCharge(idx)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
