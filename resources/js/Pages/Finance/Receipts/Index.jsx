import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Index({ auth, receipts }) {
    const getStatusStyle = (status) => {
        const styles = {
            paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Ventas y Recibos</h2>
                    <Link
                        href={route('receipts.create')}
                        className="bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-primary-50"
                    >
                        🛍️ Punto de Venta
                    </Link>
                </div>
            }
        >
            <Head title="Recibos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-[2rem] border dark:border-gray-700">
                        <div className="p-8">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-y-4">
                                    <thead>
                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <th className="px-6 py-2">Folio</th>
                                            <th className="px-6 py-2">Cliente</th>
                                            <th className="px-6 py-2">Fecha</th>
                                            <th className="px-6 py-2">Total</th>
                                            <th className="px-6 py-2">Método</th>
                                            <th className="px-6 py-2">Estado</th>
                                            <th className="px-6 py-2 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receipts.data.map((receipt) => (
                                            <tr key={receipt.id} className="group bg-white dark:bg-gray-900/40 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300">
                                                <td className="px-6 py-5 rounded-l-3xl">
                                                    <span className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">#{receipt.receipt_number}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="font-bold text-gray-700 dark:text-gray-300">{receipt.client.name}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-medium text-gray-500">
                                                        {format(new Date(receipt.date), "dd/MM/yyyy HH:mm", { locale: es })}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-lg font-black text-brand-primary">${parseFloat(receipt.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{receipt.payment_method}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusStyle(receipt.status)}`}>
                                                        {receipt.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right rounded-r-3xl">
                                                    <Link
                                                        href={route('receipts.show', receipt.id)}
                                                        className="inline-flex items-center gap-2 text-xs font-black text-brand-primary hover:underline uppercase tracking-widest"
                                                    >
                                                        Ver / Imprimir
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación (Simple) */}
                            <div className="mt-8 flex justify-center gap-2">
                                {receipts.links.map((link, i) => (
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-4 py-2 rounded-xl text-xs font-black ${link.active
                                                ? 'bg-brand-primary text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="px-4 py-2 rounded-xl text-xs font-black bg-gray-50 dark:bg-gray-800 text-gray-300 cursor-not-allowed"
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
