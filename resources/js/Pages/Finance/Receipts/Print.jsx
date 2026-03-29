import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';

export default function Print({ receipt, posPrinterName, posTicketPreview }) {
    const { settings } = usePage().props;

    useEffect(() => {
        // Solo imprimir automático si NO está activada la vista previa
        if (!posTicketPreview) {
            console.log(`Imprimiendo en: ${posPrinterName}`);
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [posPrinterName, posTicketPreview]);

    const handlePrint = () => {
        window.print();
    };

    const handleClose = () => {
        window.close();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Priorizar datos de la sucursal para tickets personalizados
    const branchName = receipt.branch?.name || settings?.site_name || 'CANBULL';
    const contactAddress = receipt.branch?.address || settings?.contact_address || 'Dirección de la Sucursal';
    const contactPhone = receipt.branch?.phone || settings?.contact_phone || '000-000-0000';
    const contactEmail = receipt.branch?.email || settings?.contact_email || '';
    const taxId = receipt.branch?.tax_id || settings?.tax_id || null;

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white py-8 print:py-0">
            <Head title={`Ticket ${receipt.receipt_number}`} />

            {/* Preview Toolbar */}
            {posTicketPreview && (
                <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-center gap-4 no-print z-50 shadow-sm">
                    <button onClick={handleClose} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-black uppercase text-[10px] transition-all">
                        Cerrar
                    </button>
                    <button onClick={handlePrint} className="px-8 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-purple-500/20 transition-all">
                        🖨️ Imprimir Ticket
                    </button>
                </div>
            )}

            <div className={`ticket-container bg-white text-black font-mono text-[10px] leading-snug p-4 mx-auto ${posTicketPreview ? 'mt-12' : ''}`} style={{ width: '80mm', maxWidth: '80mm', boxSizing: 'border-box' }}>
                {/* Header */}
                <div className="text-center mb-4 overflow-hidden">
                    <h1 className="text-sm font-black uppercase mb-1 break-words">{branchName}</h1>
                    <p className="whitespace-pre-wrap break-words px-2 lowercase italic">{contactEmail}</p>
                    <p className="whitespace-pre-wrap break-words px-2">{contactAddress}</p>
                    <p className="font-bold mt-1">Tel: {contactPhone}</p>
                    {taxId && <p className="text-[9px] font-black uppercase mt-1 tracking-tighter">RFC: {taxId}</p>}
                    <div className="border-b border-dashed border-black my-2"></div>
                    <p className="font-bold uppercase tracking-widest">Recibo: {receipt.receipt_number}</p>
                    <p>{formatDate(receipt.date)}</p>
                </div>

                {/* Client Info */}
                <div className="mb-3">
                    <p><span className="font-bold uppercase">Cliente:</span> {receipt.client?.name || 'Público en General'}</p>
                    <div className="border-b border-dashed border-black my-2"></div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-3">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="text-left py-1">CONCEPTO</th>
                            <th className="text-center py-1">CANT</th>
                            <th className="text-right py-1">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-black/20">
                        {receipt.items?.map((item, idx) => (
                            <tr key={idx} className="align-top">
                                <td className="py-1 pr-2 uppercase font-bold text-[10px]">
                                    {item.concept}
                                    {item.assigned_user && (
                                        <div className="text-[8px] font-normal lowercase italic text-gray-700">
                                            atendió: {item.assigned_user.name}
                                        </div>
                                    )}
                                </td>
                                <td className="py-1 text-center">{item.quantity}</td>
                                <td className="py-1 text-right">${parseFloat(item.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex flex-col items-end gap-1 mb-4">
                    <div className="flex justify-between w-full max-w-[150px]">
                        <span>SUBTOTAL:</span>
                        <span className="font-bold">${parseFloat(receipt.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between w-full max-w-[150px]">
                        <span>IMPUESTOS:</span>
                        <span className="font-bold">${parseFloat(receipt.tax).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between w-full max-w-[150px] text-sm border-t border-black pt-1">
                        <span className="font-black">TOTAL:</span>
                        <span className="font-black">${parseFloat(receipt.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="text-center mb-6">
                    <div className="border-t border-black border-dashed pt-2">
                        <p className="font-bold uppercase mb-1">
                            PAGO: {
                                receipt.payment_method === 'cash' ? 'EFECTIVO' : 
                                (receipt.payment_method === 'card' ? 'TARJETA' : 
                                (receipt.payment_method === 'transfer' ? 'TRANSFERENCIA' : 
                                (receipt.payment_method === 'mixed' ? 'MIXTO' : receipt.payment_method)))
                            }
                        </p>
                        
                        {receipt.payment_method === 'mixed' && receipt.movements?.length > 0 && (
                            <div className="px-4">
                                {receipt.movements.map((m, idx) => (
                                    <div key={idx} className="flex justify-between text-[8px] italic">
                                        <span className="uppercase">{m.method === 'cash' ? 'En Efectivo:' : 'Con Tarjeta:'}</span>
                                        <span>${parseFloat(m.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 border-t border-dashed border-black pt-4">
                        <p className="font-bold italic">¡Gracias por su preferencia!</p>
                        <p className="text-[9px] mt-1 text-gray-600 uppercase">Salud y bienestar para tu mejor amigo</p>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        @page {
                            margin: 0;
                            size: 80mm auto;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            width: 80mm;
                            background: white !important;
                        }
                        .no-print { display: none !important; }
                        .ticket-container {
                            margin-top: 0 !important;
                            box-shadow: none !important;
                            padding: 2mm !important;
                        }
                    }
                    .ticket-container {
                        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
                    }
                `}} />
            </div>
        </div>
    );
}
