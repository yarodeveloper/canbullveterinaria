import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import React, { useState } from 'react';

const STATUS_CONFIG = {
    Borrador:  { color: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300', dot: 'bg-slate-400' },
    Enviada:   { color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', dot: 'bg-blue-500' },
    Aceptada:  { color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
    Rechazada: { color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300', dot: 'bg-red-500' },
    Vencida:   { color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', dot: 'bg-amber-500' },
    Cobrada:   { color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300', dot: 'bg-indigo-500' },
};

export default function Index({ auth, quotes, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (key, value) => {
        router.get(route('quotes.index'), { ...filters, [key]: value }, {
            preserveState: true,
            replace: true
        });
    };

    const changeStatus = (e, quoteId, status) => {
        e.stopPropagation();
        router.patch(route('quotes.update', quoteId), { status }, { preserveScroll: true });
    };

    const getStatusBadge = (status) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Borrador;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                {status}
            </span>
        );
    };


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight tracking-tight">
                        Cotizaciones de Servicios
                    </h2>
                    <Link
                        href={route('quotes.create')}
                        className="px-5 py-2 bg-brand-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-brand-primary/20 hover:opacity-90 transition"
                    >
                        + Nueva Cotización
                    </Link>
                </div>
            }
        >
            <Head title="Cotizaciones" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Buscar por folio o cliente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleFilter('search', search)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        {search && (
                            <button
                                onClick={() => { setSearch(''); handleFilter('search', ''); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filters.status || ''}
                            onChange={(e) => handleFilter('status', e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm px-4 py-2.5 focus:ring-2 focus:ring-brand-primary transition-all outline-none min-w-[150px]"
                        >
                            <option value="">Todos los estados</option>
                            {Object.keys(STATUS_CONFIG).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {quotes.data.map((quote) => (
                                    <li
                                        key={quote.id}
                                        onClick={() => router.visit(route('quotes.show', quote.id))}
                                        className="group hover:bg-brand-primary transition-all duration-150 cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between px-5 py-2.5">
                                            {/* Folio + Fecha */}
                                            <div className="w-36 flex-shrink-0">
                                                <p className="font-black text-brand-primary group-hover:text-white text-sm transition-colors">{quote.folio}</p>
                                                <p className="text-[10px] text-slate-400 group-hover:text-white/70 uppercase font-bold mt-0.5 transition-colors">
                                                    {format(new Date(quote.created_at), "d MMM, yy", { locale: es })}
                                                </p>
                                            </div>

                                            {/* Paciente */}
                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 group-hover:bg-white/20 flex items-center justify-center text-sm flex-shrink-0 transition-colors">
                                                    {quote.pet ? (quote.pet.species === 'Canino' ? '🐕' : '🐈') : (quote.guest_species === 'Canino' ? '🐕' : '🐾')}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-900 dark:text-white group-hover:text-white text-sm leading-tight truncate uppercase tracking-tight transition-colors">
                                                        {quote.pet?.name || quote.guest_pet_name || '—'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 group-hover:text-white/70 uppercase font-bold truncate transition-colors">
                                                        👤 {quote.pet?.owner?.name || quote.guest_client_name || '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Estado */}
                                            <div className="w-28 flex-shrink-0 flex justify-center">
                                                {getStatusBadge(quote.status)}
                                            </div>

                                            {/* Total */}
                                            <div className="w-28 flex-shrink-0 text-right">
                                                <p className="font-black text-slate-900 dark:text-white group-hover:text-white text-sm transition-colors">
                                                    ${Number(quote.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>

                                            {/* Acciones rápidas */}
                                            <div className="w-52 flex-shrink-0 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {[
                                                    { status: 'Enviada',   icon: '/icons/envelope-svgrepo-com.svg' },
                                                    { status: 'Aceptada',  icon: '/icons/thumb-up-svgrepo-com.svg' },
                                                    { status: 'Rechazada', icon: '/icons/delete-svgrepo-com.svg' },
                                                ].filter(a => a.status !== quote.status && quote.status !== 'Cobrada').map(({ status, icon }) => (
                                                    <button
                                                        key={status}
                                                        onClick={(e) => changeStatus(e, quote.id, status)}
                                                        title={`Marcar como ${status}`}
                                                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white flex items-center justify-center text-white hover:text-brand-primary transition border border-white/30 hover:border-white"
                                                    >
                                                        <img src={icon} className="w-3.5 h-3.5 brightness-0 invert group-hover:brightness-100 group-hover:invert-0" alt={status} />
                                                    </button>
                                                ))}

                                                {/* WhatsApp Quick Action */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const phone = quote.pet?.owner?.phone || '';
                                                        const siteName = auth.user?.branch?.name || 'Clínica Veterinaria';
                                                        const petName = quote.pet?.name || quote.guest_pet_name || '—';
                                                        const text = encodeURIComponent(`Hola, le envío la cotización *${quote.folio}* de *${siteName}* para la mascota *${petName}*.\nPuede ver los detalles aquí: ${window.location.origin}/quotes/${quote.id}`);
                                                        const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
                                                        window.open(url, '_blank');
                                                    }}
                                                    title="Enviar por WhatsApp"
                                                    className="w-7 h-7 rounded-lg bg-white/20 hover:bg-emerald-500 flex items-center justify-center text-white transition border border-white/30 hover:border-white"
                                                >
                                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                    </svg>
                                                </button>
                                                <div className="flex-shrink-0 ml-1">
                                                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white border border-white/30">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {quotes.data.length === 0 && (
                                    <li className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                        No hay cotizaciones generadas aún.
                                    </li>
                                )}
                            </ul>

                    </div>
                    {quotes.links && quotes.links.length > 3 && (
                        <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-center gap-1">
                            {quotes.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url || link.active}
                                    className={`px-4 py-2 text-[10px] font-black rounded-xl transition ${link.active ? 'bg-brand-primary text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-opacity-10 border dark:border-gray-700'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
