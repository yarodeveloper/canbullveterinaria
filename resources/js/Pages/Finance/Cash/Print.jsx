import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Print({ auth, movement }) {
    const printReport = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('cash.index')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <span className="text-xl">←</span>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-widest">
                            Recibo de Movimiento Extra
                        </h2>
                    </div>
                    <button
                        onClick={printReport}
                        className="bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-primary-50"
                    >
                        🖨️ Imprimir Recibo
                    </button>
                </div>
            }
        >
            <Head title={`Recibo Cash - ${format(new Date(movement.created_at), 'dd-MM-yyyy')}`} />

            <div className="py-12">
                <div className="max-w-xl mx-auto sm:px-6 lg:px-8">
                    {/* Estilo para impresión */}
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

                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] border dark:border-gray-700 shadow-2xl p-12 print:shadow-none print:border-none print:p-0 text-center">
                        <h1 className="text-3xl font-black text-brand-primary tracking-tighter mb-1 italic uppercase">
                            {movement.branch?.name || 'CANBULL'}
                        </h1>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2 italic">
                            {movement.branch?.address} | TEL: {movement.branch?.phone}
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Comprobante de Caja</p>

                        <div className="border-t-2 border-b-2 border-dashed border-gray-300 dark:border-gray-600 py-6 mb-8 text-left">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tipo</p>
                                    <p className={`text-sm font-black uppercase tracking-widest ${movement.type === 'in' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {movement.type === 'in' ? 'Entrada Extra' : 'Salida / Egreso'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Fecha</p>
                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{format(new Date(movement.created_at), "dd/MM/yyyy HH:mm")}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Monto de la Operación</p>
                                <p className={`text-4xl font-black ${movement.type === 'in' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    ${parseFloat(movement.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Concepto / Razón</p>
                                <p className="text-base font-bold text-gray-800 dark:text-gray-200">{movement.description}</p>
                            </div>

                            <div className="flex justify-between text-xs font-bold text-gray-500">
                                <span>Método: <strong className="uppercase">{movement.method}</strong></span>
                                <span>Operador: <strong>{movement.user.name}</strong></span>
                            </div>
                        </div>

                        <div className="mt-16 pt-8 border-t border-gray-300 dark:border-gray-600 w-2/3 mx-auto">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Firma de Autorización / Recibido</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
