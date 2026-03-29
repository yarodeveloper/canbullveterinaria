import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Index({ auth, movements, todayTotal }) {
    const [showMovementModal, setShowMovementModal] = useState(false);

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash && flash.print_movement_id) {
            window.open(route('cash.print', flash.print_movement_id), '_blank', 'noopener,noreferrer');
        }
    }, [flash]);

    const { data, setData, post, processing, reset, errors } = useForm({
        amount: '',
        type: 'out',
        method: 'cash',
        description: ''
    });

    const submitMovement = (e) => {
        e.preventDefault();
        post(route('cash.store'), {
            onSuccess: () => {
                setShowMovementModal(false);
                reset();
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight flex items-center gap-2 uppercase tracking-tight">
                        <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span>
                        Egresos y Caja Menor
                    </h2>
                    <button
                        onClick={() => setShowMovementModal(true)}
                        className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 active:scale-95 flex items-center gap-2"
                    >
                        <span>+ Reg. Movimiento</span>
                    </button>
                </div>
            }
        >
            <Head title="Caja Menor" />

            <div className="py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-brand-primary rounded-[1.5rem] px-5 py-3.5 text-white shadow-lg shadow-brand-primary/20 flex flex-row items-center justify-between border-b-2 border-brand-secondary">
                            <div>
                                <p className="text-[8.5px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-80 italic">Balance Turno Acum.</p>
                                <h3 className="text-xl font-black tracking-tighter">${parseFloat(todayTotal).toFixed(2)}</h3>
                            </div>
                            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-base">
                                📊
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1B2132] rounded-[1.5rem] border dark:border-gray-700/50 px-5 py-3.5 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 italic">Entradas Extras Hoy</p>
                                <h3 className="text-lg font-black text-emerald-600 tracking-tighter">+$0.00</h3>
                            </div>
                            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center text-sm">
                                📈
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1B2132] rounded-[1.5rem] border dark:border-gray-700/50 px-5 py-3.5 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 italic">Salidas / Gastos Hoy</p>
                                <h3 className="text-lg font-black text-red-500 tracking-tighter">-$0.00</h3>
                            </div>
                            <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center text-sm">
                                📉
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1B2132] overflow-hidden shadow-sm sm:rounded-[2rem] border dark:border-gray-700/50 mt-8">
                        <div className="p-0">
                            <div className="p-5 border-b dark:border-gray-700/50 bg-slate-50/50 dark:bg-gray-900/30 flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registro Central de Operaciones</h4>
                                <span className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-gray-700">Muestra: {movements.data.length} movs</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-gray-900/20 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b dark:border-gray-700">
                                            <th className="px-6 py-3">Fecha / Hora</th>
                                            <th className="px-6 py-3">Responsable</th>
                                            <th className="px-6 py-3">Concepto / Referencia</th>
                                            <th className="px-6 py-3">Método</th>
                                            <th className="px-6 py-3 text-right">Importe</th>
                                            <th className="px-6 py-3 text-right">PDF</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                                        {movements.data.map((m) => (
                                            <tr key={m.id} className="group hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 transition-colors">
                                                <td className="px-6 py-3">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                                                        {format(new Date(m.created_at), "dd MMM yyyy • HH:mm", { locale: es })}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-3 text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-tight">
                                                    {m.user.name}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-sm ${m.type === 'in' || m.type === 'opening' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-red-100 text-red-600 border border-red-200'
                                                            }`}>
                                                            {m.type === 'in' || m.type === 'opening' ? '↓' : '↑'}
                                                        </span>
                                                        <div>
                                                            <p className="text-[11px] font-black text-slate-800 dark:text-gray-200 uppercase tracking-tight leading-tight">{m.description}</p>
                                                            {m.receipt && <p className="text-[9px] font-black text-brand-primary uppercase mt-0.5">Recibo #{m.receipt.receipt_number}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 uppercase text-[9px] font-black text-slate-400 tracking-widest italic">
                                                    {m.method}
                                                </td>
                                                <td className={`px-6 py-3 text-right text-sm font-black tracking-tighter ${m.type === 'in' || m.type === 'opening' ? 'text-emerald-600' : 'text-red-500'
                                                    }`}>
                                                    {m.type === 'in' || m.type === 'opening' ? '+' : '-'}${parseFloat(m.amount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <Link
                                                        href={route('cash.print', m.id)}
                                                        className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-gray-700 text-slate-400 hover:text-brand-primary transition-all flex items-center justify-center shadow-sm"
                                                        title="Imprimir Comprobante"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Registrar Movimiento */}
            {showMovementModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border dark:border-gray-700">
                        <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Registrar Egreso Extra</h3>
                            <button onClick={() => setShowMovementModal(false)} className="text-2xl opacity-30 hover:opacity-100">×</button>
                        </div>
                        <form onSubmit={submitMovement} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Movimiento</label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                    >
                                        <option value="out">Salida / Gasto (luz, compras)</option>
                                        <option value="in">Entrada / Ingreso Extra</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monto ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Método</label>
                                <select
                                    value={data.method}
                                    onChange={e => setData('method', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                >
                                    <option value="cash">Efectivo</option>
                                    <option value="card">Tarjeta</option>
                                    <option value="transfer">Transferencia</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Motivo / Descripción</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-medium"
                                    rows="2"
                                    placeholder="Ej: Pago de renta, Cambio de caja, Gasto de limpieza..."
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {processing ? 'Registrando...' : 'Confirmar Movimiento'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
