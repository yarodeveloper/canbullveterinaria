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
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Egresos y Entradas Extraordinarias</h2>
                    <button
                        onClick={() => setShowMovementModal(true)}
                        className="bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-primary-50"
                    >
                        + Registrar Egreso / Ingreso
                    </button>
                </div>
            }
        >
            <Head title="Caja" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-brand-primary rounded-[2.5rem] p-10 text-white shadow-2xl shadow-primary-100">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Balance Egresos/Extras del Turno</p>
                            <h3 className="text-4xl font-black tracking-tighter">${parseFloat(todayTotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3>
                            <div className="mt-6 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${todayTotal !== 0 ? 'bg-white' : 'bg-gray-300'}`}></span>
                                <span className="text-[9px] font-bold uppercase tracking-widest">Turno Activo</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 p-10 shadow-xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Entradas Hoy</p>
                            <h3 className="text-3xl font-black text-emerald-500 tracking-tighter">+$0.00</h3>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 p-10 shadow-xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Salidas Hoy</p>
                            <h3 className="text-3xl font-black text-red-500 tracking-tighter">-$0.00</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-[2.5rem] border dark:border-gray-700">
                        <div className="p-8">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Historial de Operaciones</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-y-4">
                                    <thead>
                                        <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            <th className="px-6 py-2">Fecha y Hora</th>
                                            <th className="px-6 py-2">Operador</th>
                                            <th className="px-6 py-2">Descripción</th>
                                            <th className="px-6 py-2">Método</th>
                                            <th className="px-6 py-2 text-right">Monto</th>
                                            <th className="px-6 py-2 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {movements.data.map((m) => (
                                            <tr key={m.id} className="group bg-white dark:bg-gray-900/40 rounded-3xl border border-gray-100 dark:border-gray-800">
                                                <td className="px-6 py-5 rounded-l-3xl">
                                                    <p className="text-xs font-bold text-gray-500">
                                                        {format(new Date(m.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-5 text-sm font-black uppercase text-gray-700 dark:text-gray-300">
                                                    {m.user.name}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${m.type === 'in' || m.type === 'opening' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                                            }`}>
                                                            {m.type === 'in' || m.type === 'opening' ? '↓' : '↑'}
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{m.description}</p>
                                                            {m.receipt && <p className="text-[9px] font-black text-brand-primary uppercase">Recibo #{m.receipt.receipt_number}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 uppercase text-[10px] font-black text-gray-400 tracking-widest">
                                                    {m.method}
                                                </td>
                                                <td className={`px-6 py-5 text-right text-lg font-black ${m.type === 'in' || m.type === 'opening' ? 'text-emerald-500' : 'text-red-500'
                                                    }`}>
                                                    {m.type === 'in' || m.type === 'opening' ? '+' : '-'}${parseFloat(m.amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-5 text-right rounded-r-3xl">
                                                    <Link
                                                        href={route('cash.print', m.id)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline hover:text-brand-secondary inline-flex items-center gap-1"
                                                    >
                                                        🖨️
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
