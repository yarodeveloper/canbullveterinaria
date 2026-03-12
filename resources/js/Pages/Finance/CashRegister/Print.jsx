import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Print({ auth, cashRegister, receipts, movements }) {
    const printReport = () => {
        window.print();
    };

    const diff = parseFloat(cashRegister.closing_amount) - parseFloat(cashRegister.expected_amount);

    const totalProductSales = receipts.reduce((sum, r) => 
        sum + r.items.filter(i => i.type !== 'service').reduce((s, i) => s + parseFloat(i.total), 0), 0
    );
    const totalServiceSales = receipts.reduce((sum, r) => 
        sum + r.items.filter(i => i.type === 'service').reduce((s, i) => s + parseFloat(i.total), 0), 0
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('cash-register.index')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <span className="text-xl">←</span>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-widest">
                            Corte Z de Caja
                        </h2>
                    </div>
                    <button
                        onClick={printReport}
                        className="bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-primary-50"
                    >
                        🖨️ Imprimir Corte
                    </button>
                </div>
            }
        >
            <Head title={`Corte Caja - ${format(new Date(cashRegister.opened_at), 'dd-MM-yyyy')}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    {/* Estilo para impresión tipo ticket / carta comprimida */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            body { background-color: white !important; color: black !important; }
                            .print\\:hidden { display: none !important; }
                            .print\\:shadow-none { shadow: none !important; box-shadow: none !important; }
                            .print\\:border-none { border: none !important; }
                            main { padding: 0 !important; margin: 0 !important; }
                            .print\\:p-0 { padding: 0 !important; }
                        }
                    `}} />

                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] border dark:border-gray-700 shadow-2xl p-12 print:shadow-none print:border-none print:p-0">

                        <div className="text-center mb-8 border-b-2 border-dashed border-gray-300 dark:border-gray-600 pb-8">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-1 italic">CANBULL</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Corte de Caja Diario</p>
                            <p className="text-sm font-bold mt-4 uppercase text-gray-600">{cashRegister.branch.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Apertura</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{format(new Date(cashRegister.opened_at), "dd/MM/yyyy HH:mm")}</p>
                                <p className="text-xs text-gray-500">{cashRegister.opened_by.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cierre</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{cashRegister.closed_at ? format(new Date(cashRegister.closed_at), "dd/MM/yyyy HH:mm") : 'Aún Abierto'}</p>
                                <p className="text-xs text-gray-500">{cashRegister.closed_by ? cashRegister.closed_by.name : '-'}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Fondo Inicial</span>
                                <span className="font-black text-gray-900 dark:text-white">${parseFloat(cashRegister.opening_amount).toFixed(2)}</span>
                            </div>

                            <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Desglose de Operaciones</h4>

                                <div className="flex justify-between items-center mb-1 text-sm bg-gray-50 dark:bg-gray-800 p-1 rounded">
                                    <span className="font-bold text-gray-600 dark:text-gray-300 ml-2">↳ Productos (Farmacia)</span>
                                    <span className="font-black text-emerald-600">+${totalProductSales.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2 text-sm bg-gray-50 dark:bg-gray-800 p-1 rounded">
                                    <span className="font-bold text-gray-600 dark:text-gray-300 ml-2">↳ Servicios Clínicos</span>
                                    <span className="font-black text-emerald-600">+${totalServiceSales.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <span className="font-bold text-gray-600 dark:text-gray-300">Entradas Extra(Ingresos)</span>
                                    <span className="font-black text-emerald-600">+${movements.filter(m => m.type === 'in').reduce((sum, m) => sum + parseFloat(m.amount), 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-gray-600 dark:text-gray-300">Salidas (Gastos)</span>
                                    <span className="font-black text-red-600">-${movements.filter(m => m.type === 'out').reduce((sum, m) => sum + parseFloat(m.amount), 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {cashRegister.status === 'closed' && (
                            <div className="mb-8 border-t-2 border-b-2 border-dashed border-gray-300 dark:border-gray-600 py-6">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Teórico (Debería Haber)</span>
                                    <span className="text-xl font-black text-gray-900 dark:text-white">${parseFloat(cashRegister.expected_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Físico (Contado)</span>
                                    <span className="text-xl font-black text-brand-primary">${parseFloat(cashRegister.closing_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Diferencia</span>
                                    {diff === 0 ? (
                                        <span className="text-sm font-black text-emerald-600 uppercase tracking-widest border border-emerald-200 bg-emerald-50 px-3 py-1 rounded-lg">Exacto</span>
                                    ) : (
                                        <span className={`text-sm font-black uppercase tracking-widest border px-3 py-1 rounded-lg ${diff > 0 ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-red-600 border-red-200 bg-red-50'}`}>
                                            {diff > 0 ? 'Sobra ' : 'Falta '}${Math.abs(diff).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {(cashRegister.notes) && (
                            <div className="mb-8 text-xs font-bold text-gray-500 pl-4 border-l-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4 rounded-r-xl">
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-gray-400">Notas de Caja</p>
                                <p className="whitespace-pre-line">{cashRegister.notes}</p>
                            </div>
                        )}

                        <div className="flex justify-around items-end pt-12 pb-4 text-center">
                            <div className="w-1/2 px-4">
                                <div className="border-t border-gray-400 dark:border-gray-600 pt-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cajero / Operador</p>
                                </div>
                            </div>
                            <div className="w-1/2 px-4">
                                <div className="border-t border-gray-400 dark:border-gray-600 pt-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Autorización / Gerente</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
