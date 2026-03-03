import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Show({ auth, receipt }) {
    const printReceipt = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('receipts.index')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <span className="text-xl">←</span>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-widest">
                            Vista de Recibo
                        </h2>
                    </div>
                    <button
                        onClick={printReceipt}
                        className="bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-primary-50"
                    >
                        🖨️ Imprimir Recibo
                    </button>
                </div>
            }
        >
            <Head title={`Recibo - ${receipt.receipt_number}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Estilo para impresión */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            body { background-color: white !important; }
                            .print\\:hidden { display: none !important; }
                            .print\\:shadow-none { shadow: none !important; }
                            .print\\:border-none { border: none !important; }
                            main { padding: 0 !important; margin: 0 !important; }
                            .print\\:p-0 { padding: 0 !important; }
                        }
                    `}} />

                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] border dark:border-gray-700 shadow-2xl p-12 print:shadow-none print:border-none print:p-0">
                        {/* Cabecera del Recibo */}
                        <div className="flex justify-between items-start mb-16">
                            <div>
                                <h1 className="text-4xl font-black text-brand-primary tracking-tighter mb-2 italic">CANBULL</h1>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Sistema Veterinario</p>
                                <div className="mt-8 text-sm">
                                    <p className="font-black text-gray-900 dark:text-gray-100 uppercase">{receipt.branch.name}</p>
                                    <p className="text-gray-500 font-medium">Sucursal Oficial</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl px-6 py-3 mb-6">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Folio del Recibo</span>
                                    <span className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{receipt.receipt_number}</span>
                                </span>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    {format(new Date(receipt.date), "d 'de' MMMM, yyyy", { locale: es })}
                                </p>
                            </div>
                        </div>

                        {/* Datos del Cliente */}
                        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-[2rem] p-8 mb-12 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">Recibimos de:</p>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{receipt.client.name}</h3>
                                {receipt.client.rfc && <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">RFC: {receipt.client.rfc}</p>}
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Método de Pago</p>
                                <p className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase">{receipt.payment_method}</p>
                            </div>
                        </div>

                        {/* Detalle de Conceptos */}
                        <div className="mb-16">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">
                                        <th className="py-4 text-left px-4">Descripción del Servicio / Producto</th>
                                        <th className="py-4 text-center px-4 w-24">Cant.</th>
                                        <th className="py-4 text-right px-4">Precio U.</th>
                                        <th className="py-4 text-right px-4">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-800">
                                    {receipt.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-6 px-4">
                                                <p className="font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">{item.concept}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.type === 'service' ? 'Servicio Clínico' : 'Insumo/Farmacia'}</p>
                                            </td>
                                            <td className="py-6 px-4 text-center font-bold text-gray-600 dark:text-gray-400">{parseFloat(item.quantity)}</td>
                                            <td className="py-6 px-4 text-right font-bold text-gray-600 dark:text-gray-400">${parseFloat(item.unit_price).toLocaleString()}</td>
                                            <td className="py-6 px-4 text-right font-black text-gray-900 dark:text-gray-100">${parseFloat(item.subtotal).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totales */}
                        <div className="flex justify-end pt-8 border-t dark:border-gray-700">
                            <div className="w-full max-w-xs space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                                    <span className="font-black text-gray-700 dark:text-gray-300">${parseFloat(receipt.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Impuestos (16% IVA)</span>
                                    <span className="font-black text-gray-700 dark:text-gray-300">${parseFloat(receipt.tax).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center py-6 px-6 bg-brand-primary text-white rounded-[1.5rem] shadow-xl shadow-primary-50">
                                    <span className="text-xs font-black uppercase tracking-widest">Total Pagado</span>
                                    <span className="text-2xl font-black">${parseFloat(receipt.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer del Recibo */}
                        <div className="mt-20 border-t dark:border-gray-700 pt-10 text-center">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Gracias por confiar en el cuidado médico de CanBull</p>
                            <p className="mt-8 italic text-xs text-gray-300">Este documento es un comprobante interno de pago simplificado.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
