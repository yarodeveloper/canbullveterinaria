import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Print({ auth, order, type }) {
    const { settings } = usePage().props;
    const printDocument = () => {
        window.print();
    };

    const isTicket = type === 'ticket';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-4">
                        <button onClick={() => window.close()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-slate-500">
                            <span className="text-xl font-bold">✕</span>
                        </button>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-widest">
                            Vista de Impresión {isTicket ? '(Ticket)' : '(Carta)'}
                        </h2>
                    </div>
                    <button
                        onClick={printDocument}
                        className="bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-primary-50"
                    >
                        🖨️ Imprimir
                    </button>
                </div>
            }
        >
            <Head title={`Orden Estética - ${order.folio}`} />

            <div className={`py-8 ${isTicket ? 'flex justify-center' : ''}`}>
                <div className={isTicket ? "w-full max-w-[300px]" : "max-w-4xl mx-auto sm:px-6 lg:px-8"}>
                    {/* Estilo para impresión */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            @page {
                                size: ${isTicket ? '80mm auto' : 'auto'};
                                margin: ${isTicket ? '0' : '10mm'};
                            }
                            body { background-color: white !important; font-size: ${isTicket ? '12px' : 'inherit'}; }
                            .print\\:hidden { display: none !important; }
                            .print\\:shadow-none { shadow: none !important; }
                            .print\\:border-none { border: none !important; }
                            main { padding: 0 !important; margin: 0 !important; }
                            .print\\:p-0 { padding: 0 !important; }
                            ${isTicket ? '.ticket-container { width: 100% !important; padding: 10px !important; box-shadow: none !important; }' : ''}
                        }
                    `}} />

                    {isTicket ? (
                        /* TICKET FORMAT */
                        <div className="bg-white rounded-[1rem] border dark:border-gray-700 shadow-xl p-6 ticket-container mx-auto font-mono text-gray-900">
                            <div className="text-center mb-4">
                                <h1 className="text-xl font-black uppercase">{settings?.site_name || 'VETERINARIA'}</h1>
                                <p className="text-[10px] uppercase">{order.branch?.name}</p>
                                <p className="text-[10px] mt-2 border-b border-dashed border-gray-300 pb-2">
                                    Ticket de Estética/Spa
                                </p>
                            </div>

                            <div className="text-[11px] mb-4 space-y-1 border-b border-dashed border-gray-300 pb-4">
                                <div className="flex justify-between">
                                    <span className="font-bold">Folio:</span>
                                    <span>{order.folio}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Fecha:</span>
                                    <span>{format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Groomer:</span>
                                    <span>{order.user?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Cliente:</span>
                                    <span>{order.pet?.owner?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Paciente:</span>
                                    <span>{order.pet?.name} ({order.pet?.species})</span>
                                </div>
                            </div>

                            <div className="text-[11px] mb-4 border-b border-dashed border-gray-300 pb-4">
                                <div className="font-bold mb-2 uppercase text-[10px] text-center">Detalle de Servicios</div>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between mb-1">
                                        <span className="truncate max-w-[65%]">{item.quantity}x {item.concept}</span>
                                        <span>${(parseFloat(item.unit_price) * item.quantity).toLocaleString('es-MX', {minimumFractionDigits:2})}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="text-[12px] font-black flex justify-between mb-4 pb-4 border-b border-dashed border-gray-300">
                                <span>TOTAL</span>
                                <span>${order.items.reduce((acc, item) => acc + (parseFloat(item.unit_price) * item.quantity), 0).toLocaleString('es-MX', {minimumFractionDigits:2})}</span>
                            </div>

                            {(order.arrival_condition || order.notes) && (
                                <div className="text-[10px] mb-4 pb-4 border-b border-dashed border-gray-300">
                                    {order.arrival_condition && (
                                        <div className="mb-2">
                                            <span className="font-bold uppercase block mb-0.5">Condición de Ingreso:</span>
                                            <span>{order.arrival_condition}</span>
                                        </div>
                                    )}
                                    {order.notes && (
                                        <div>
                                            <span className="font-bold uppercase block mb-0.5">Observaciones:</span>
                                            <span>{order.notes}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="text-center text-[9px] uppercase space-y-1">
                                <p>Por favor pase a caja para realizar su pago.</p>
                                <p className="font-bold mt-2 pt-2">¡Gracias por su preferencia!</p>
                            </div>
                        </div>
                    ) : (
                        /* STANDARD A4 FORMAT */
                        <div className="bg-white dark:bg-gray-800 rounded-[3rem] border dark:border-gray-700 shadow-2xl p-12 print:shadow-none print:border-none print:p-0">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h1 className="text-4xl font-black text-brand-primary tracking-tighter mb-2 italic uppercase">{settings?.site_name || 'VETERINARIA'}</h1>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Orden de Servicio - Estética</p>
                                    <div className="mt-8 text-sm">
                                        <p className="font-black text-gray-900 dark:text-gray-100 uppercase">{order.branch?.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl px-6 py-3 mb-6">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Folio</span>
                                        <span className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{order.folio}</span>
                                    </span>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest block">
                                        {format(new Date(order.created_at), "d 'de' MMMM, yyyy HH:mm", { locale: es })}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-[2rem] p-6">
                                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4">Datos del Cliente</p>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">{order.pet?.owner?.name}</h3>
                                    <p className="text-sm font-bold text-gray-500 mt-1 uppercase">Tel: {order.pet?.owner?.phone}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-[2rem] p-6">
                                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4">Datos del Paciente</p>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">{order.pet?.name}</h3>
                                    <p className="text-sm font-bold text-gray-500 mt-1 uppercase">{order.pet?.species} • {order.pet?.breed}</p>
                                </div>
                            </div>

                            <div className="mb-12">
                                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4">Detalle de Servicios / Productos</p>
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">
                                            <th className="py-4 text-left px-4">Descripción</th>
                                            <th className="py-4 text-center px-4 w-24">Cant.</th>
                                            <th className="py-4 text-right px-4">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-800">
                                        {order.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="py-6 px-4 font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">{item.concept}</td>
                                                <td className="py-6 px-4 text-center font-bold text-gray-600">{item.quantity}</td>
                                                <td className="py-6 px-4 text-right font-black text-gray-900 dark:text-gray-100">${(parseFloat(item.unit_price) * item.quantity).toLocaleString('es-MX', {minimumFractionDigits:2})}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {(order.arrival_condition || order.notes) && (
                                <div className="grid grid-cols-2 gap-8 mb-12">
                                    {order.arrival_condition && (
                                        <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Condiciones de Ingreso</p>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 italic">{order.arrival_condition}</p>
                                        </div>
                                    )}
                                    {order.notes && (
                                        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl">
                                            <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">Observaciones</p>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 italic">{order.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-16 border-t dark:border-gray-700 pt-10 grid grid-cols-2 gap-8">
                                <div className="text-center pt-8 border-t border-gray-300 dark:border-gray-600 max-w-[250px] mx-auto w-full">
                                    <p className="text-xs font-bold uppercase text-gray-500">Firma del Groomer / Responsable</p>
                                    <p className="text-sm font-black mt-2 text-gray-800 dark:text-gray-200">{order.user?.name}</p>
                                </div>
                                <div className="text-center pt-8 border-t border-gray-300 dark:border-gray-600 max-w-[250px] mx-auto w-full">
                                    <p className="text-xs font-bold uppercase text-gray-500">Firma del Cliente</p>
                                    <p className="text-sm font-black mt-2 text-gray-800 dark:text-gray-200">{order.pet?.owner?.name}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
