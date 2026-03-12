import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link, usePage } from '@inertiajs/react';

export default function CashRegisterIndex({ auth, activeRegister, currentStats, history }) {
    const { data: openData, setData: setOpenData, post: postOpen, processing: processingOpen, errors: openErrors, reset: resetOpen } = useForm({
        opening_amount: '',
        notes: ''
    });

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash && flash.print_movement_id) {
            window.open(route('cash.print', flash.print_movement_id), '_blank', 'noopener,noreferrer');
        }
    }, [flash]);

    const { data: closeData, setData: setCloseData, post: postClose, processing: processingClose, errors: closeErrors, reset: resetClose } = useForm({
        closing_amount: '',
        notes: ''
    });

    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, errors: withdrawalErrors, reset: resetWithdrawal } = useForm({
        amount: '',
        description: '',
        type: 'out',
        method: 'cash'
    });

    const handleOpenSubmit = (e) => {
        e.preventDefault();
        postOpen(route('cash-register.open'), {
            onSuccess: () => resetOpen(),
        });
    };

    const handleCloseSubmit = (e) => {
        e.preventDefault();
        if (activeRegister) {
            postClose(route('cash-register.close', activeRegister.id), {
                onSuccess: () => resetClose(),
            });
        }
    };

    const handleWithdrawalSubmit = (e) => {
        e.preventDefault();
        postWithdrawal(route('cash.store'), {
            onSuccess: () => {
                setShowWithdrawalModal(false);
                resetWithdrawal();
                router.reload({ only: ['currentStats'] }); // Refresh the stats
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-widest">Apertura y Cierre de Caja</h2>}
        >
            <Head title="Turno de Caja" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Tarjeta Principal */}
                    {!activeRegister ? (
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-xl p-8 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-5xl">
                                🔒
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Caja Cerrada</h3>
                                <p className="text-sm font-bold text-gray-400 mb-6">Inicia tu turno registrando el fondo de cambio en caja.</p>

                                <form onSubmit={handleOpenSubmit} className="flex gap-4 items-start">
                                    <div className="flex-1 max-w-sm">
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={openData.opening_amount}
                                                onChange={e => setOpenData('opening_amount', e.target.value)}
                                                placeholder="Fondo inicial ej. 500"
                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-brand-primary font-black text-lg"
                                            />
                                        </div>
                                        {openErrors.opening_amount && <span className="text-red-500 text-xs font-bold mt-1 block px-2">{openErrors.opening_amount}</span>}
                                        {openErrors.error && <span className="text-red-500 text-xs font-bold mt-1 block px-2">{openErrors.error}</span>}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processingOpen}
                                        className="bg-brand-primary text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
                                    >
                                        Abrir Turno
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800 shadow-xl p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                                            🔓
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-tight">Turno Activo</h3>
                                            <p className="text-xs font-black text-emerald-600/60 uppercase tracking-widest">Abierto por: {activeRegister.opened_by.name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fondo Inicial</p>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">${parseFloat(activeRegister.opening_amount).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Debería haber</p>
                                            <p className="text-2xl font-black text-brand-primary">${currentStats ? parseFloat(currentStats.expected_amount).toLocaleString() : '0'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 text-xs font-bold text-gray-500 mb-6">
                                        <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex-1">
                                            <p className="text-[9px] uppercase tracking-widest mb-1 text-gray-400">Total Entradas <span className="text-emerald-500">+${currentStats ? parseFloat(currentStats.incomes + currentStats.receipts_total).toLocaleString() : '0'}</span></p>
                                            <p>📦 Prods: <span className="text-emerald-600">${currentStats?.product_sales ? parseFloat(currentStats.product_sales).toLocaleString() : '0'}</span></p>
                                            <p>✨ Servs: <span className="text-emerald-600">${currentStats?.service_sales ? parseFloat(currentStats.service_sales).toLocaleString() : '0'}</span></p>
                                            {currentStats?.incomes > 0 && <p>💵 Extras: <span className="text-emerald-600">${parseFloat(currentStats.incomes).toLocaleString()}</span></p>}
                                        </div>
                                        <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex-1">
                                            <p className="text-[9px] uppercase tracking-widest mb-1 text-gray-400">Total Salidas / Retiros</p>
                                            <p className="text-lg text-red-500">-${currentStats ? parseFloat(currentStats.expenses).toLocaleString() : '0'}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowWithdrawalModal(true)}
                                        className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shadow-sm border border-amber-200"
                                    >
                                        💸 Realizar Retiro Justificado
                                    </button>
                                </div>

                                <div className="w-full md:w-96 bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm">
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Corte de Caja (Cierre)</h4>
                                    <form onSubmit={handleCloseSubmit}>
                                        <div className="mb-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mx-2 mb-1">¿Cuánto contaste en efectivo?</p>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={closeData.closing_amount}
                                                    onChange={e => setCloseData('closing_amount', e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-brand-primary font-black"
                                                />
                                            </div>
                                            {closeErrors.closing_amount && <span className="text-red-500 text-[10px] font-bold mt-1 block px-2">{closeErrors.closing_amount}</span>}
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mx-2 mb-1">Notas (opcional)</p>
                                            <textarea
                                                value={closeData.notes}
                                                onChange={e => setCloseData('notes', e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-brand-primary font-bold text-xs"
                                                rows="2"
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={processingClose}
                                            className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition"
                                        >
                                            Realizar Cierre Z
                                        </button>
                                        {closeErrors.error && <span className="text-red-500 text-[10px] font-bold mt-2 text-center block">{closeErrors.error}</span>}
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Historial */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-xl overflow-hidden mt-8">
                        <div className="p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40">
                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Historial de Turnos</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/40 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">
                                        <th className="px-6 py-3">Apertura</th>
                                        <th className="px-6 py-3">Cierre</th>
                                        <th className="px-6 py-3">Usuario Apertura</th>
                                        <th className="px-6 py-3">Fondo Ini.</th>
                                        <th className="px-6 py-3">Debería Haber</th>
                                        <th className="px-6 py-3">Físico Contado</th>
                                        <th className="px-6 py-3">Descuadre</th>
                                        <th className="px-6 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {history.data.length > 0 ? history.data.map(reg => {
                                        const expected = parseFloat(reg.expected_amount);
                                        const physical = parseFloat(reg.closing_amount);
                                        const diff = physical - expected;
                                        return (
                                            <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                                <td className="px-6 py-3 text-xs font-bold text-gray-500">
                                                    {new Date(reg.opened_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                                <td className="px-6 py-3 text-xs font-bold text-gray-500">
                                                    {new Date(reg.closed_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                                <td className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">
                                                    {reg.opened_by.name}
                                                </td>
                                                <td className="px-6 py-3 text-sm font-black text-gray-900 dark:text-white">
                                                    ${parseFloat(reg.opening_amount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-3 text-sm font-black text-gray-900 dark:text-white">
                                                    ${expected.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-3 text-sm font-black text-brand-primary">
                                                    ${physical.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-3">
                                                    {diff === 0 ? (
                                                        <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                                                            Exacto
                                                        </span>
                                                    ) : (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${diff > 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                                            {diff > 0 ? '+' : '-'}${Math.abs(diff).toFixed(2)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <Link
                                                        href={route('cash-register.print', reg.id)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline hover:text-brand-secondary inline-flex items-center gap-1"
                                                    >
                                                        🖨️ Imprimir
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                                                <p className="text-[10px] font-black uppercase tracking-widest">No hay historial</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Retiro Justificado */}
            {showWithdrawalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border dark:border-gray-700">
                        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/40">
                            <h3 className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                                Retiro de Efectivo
                            </h3>
                            <button onClick={() => setShowWithdrawalModal(false)} className="text-2xl text-gray-400 hover:text-red-500 transition">×</button>
                        </div>
                        <form onSubmit={handleWithdrawalSubmit} className="p-6 space-y-6">
                            <p className="text-xs font-bold text-gray-400">Todo retiro queda asociado a tu usuario con fecha y hora exacta. El monto se descontará inmediatamente del efectivo esperado en caja.</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monto a Retirar ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={withdrawalData.amount}
                                        onChange={e => setWithdrawalData('amount', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-amber-500 font-black text-xl text-center text-amber-600"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Motivo / Justificación Obligatoria</label>
                                    <textarea
                                        value={withdrawalData.description}
                                        onChange={e => setWithdrawalData('description', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-amber-500 font-medium"
                                        rows="3"
                                        placeholder="Ej. Pago a proveedor de agua, Retiro de utilidades enviado a banco..."
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={processingWithdrawal}
                                className="w-full text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 bg-amber-500 hover:bg-amber-600 shadow-amber-500/30 disabled:opacity-50"
                            >
                                {processingWithdrawal ? 'Registrando...' : 'Confirmar Retiro'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
