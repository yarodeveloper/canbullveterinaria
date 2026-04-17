import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { getWhatsAppLink } from '@/Utils/formatters';

export default function Index({ auth, records, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');
    const activeMonitor = filters.monitor_type || 'health';

    const permissions = auth.permissions || [];
    const can = (permission) => permissions.includes(permission) || auth.user.role === 'admin';

    const handleFilter = (e) => {
        router.get(route('preventive-records.index'), { search, type, monitor_type: activeMonitor }, { preserveState: true });
    };

    const switchMonitor = (mode) => {
        router.get(route('preventive-records.index'), { monitor_type: mode }, { preserveState: true });
    };

    const getStatusColor = (dueDate) => {
        if (!dueDate) return 'text-gray-400';
        const cleanDate = dueDate.split(' ')[0].split('T')[0];
        const diff = new Date(cleanDate + 'T12:00:00') - new Date();
        if (diff < 0) return 'text-red-600 bg-red-50 border-red-100';
        if (diff < 7 * 24 * 60 * 60 * 1000) return 'text-amber-600 bg-amber-50 border-amber-100';
        return activeMonitor === 'health' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-brand-primary bg-brand-primary/10 border-brand-primary/20';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'SIN FECHA';
        try {
            const cleanDate = dateStr.split(' ')[0].split('T')[0];
            const dateObj = new Date(cleanDate + 'T12:00:00');
            if (isNaN(dateObj.getTime())) return 'FECHA INVÁLIDA';
            return dateObj.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
        } catch (e) {
            return 'ERROR';
        }
    };

    const isOverdueCheck = (dueDate) => {
        if (!dueDate) return false;
        const cleanDate = dueDate.split(' ')[0].split('T')[0];
        return new Date(cleanDate + 'T12:00:00') < new Date();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight flex items-center gap-2 uppercase tracking-tight">
                        <span className={`w-1.5 h-6 ${activeMonitor === 'health' ? 'bg-indigo-600' : 'bg-brand-primary'} rounded-full`}></span>
                        Monitor Actividades
                    </h2>
                    
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border dark:border-gray-700">
                        {can('view preventive reminders') && (
                            <button
                                onClick={() => switchMonitor('health')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMonitor === 'health' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                🩺 Salud
                            </button>
                        )}
                        {can('view grooming reminders') && (
                            <button
                                onClick={() => switchMonitor('grooming')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMonitor === 'grooming' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                🛁 Estética
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Monitor ${activeMonitor === 'health' ? 'Salud' : 'Estética'}`} />

            <div className="py-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
                        {/* Filters */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Buscar Mascota o Dueño</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Nombre de mascota o propietario..."
                                    className="w-full bg-slate-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            
                            {activeMonitor === 'health' && (
                                <div className="w-full md:w-64">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tipo de Tratamiento</label>
                                    <select
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition"
                                    >
                                        <option value="">Todos los tipos</option>
                                        <option value="vaccine">Vacunas</option>
                                        <option value="internal_deworming">Desp. Interna</option>
                                        <option value="external_deworming">Desp. Externa</option>
                                        <option value="other">Otros</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleFilter}
                                    className={`text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition active:scale-95 ${activeMonitor === 'health' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-brand-primary shadow-brand-primary/20'}`}
                                >
                                    Filtrar
                                </button>
                                {activeMonitor === 'health' && (
                                    <a
                                        href={route('preventive-records.index', { ...filters, export: 1 })}
                                        target="_blank"
                                        className="bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition active:scale-95 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Exportar CSV
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-gray-900/40 text-left">
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Paciente / Dueño</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeMonitor === 'health' ? 'Tratamiento' : 'Último Servicio'}</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeMonitor === 'health' ? 'Última Aplicación' : 'Fecha Última Visita'}</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Próxima Visita / Refuerzo</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {records.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">No se encontraron registros en este monitor</td>
                                        </tr>
                                    ) : (
                                        records.data.map(item => {
                                            const dueDate = activeMonitor === 'health' ? item.next_due_date : item.next_visit_date;
                                            const isOverdue = new Date(dueDate) < new Date();
                                            return (
                                                <tr 
                                                    key={item.id} 
                                                    className={`hover:bg-opacity-10 group transition-all duration-150 cursor-pointer ${activeMonitor === 'health' ? 'hover:bg-indigo-600' : 'hover:bg-brand-primary'}`}
                                                    onClick={() => router.visit(route('pets.show', item.pet.id))}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-9 h-9 bg-slate-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-lg group-hover:bg-white transition-all group-hover:scale-110">
                                                                {item.pet.species === 'Canino' ? '🐕' : '🐈'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-gray-900 dark:text-white transition">
                                                                    {item.pet.name}
                                                                </p>
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase transition">{item.pet.owner?.name || 'S/D'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight transition">{activeMonitor === 'health' ? item.name : item.folio}</span>
                                                        <p className={`text-[9px] font-black uppercase transition ${activeMonitor === 'health' ? 'text-indigo-400' : 'text-brand-primary'}`}>{activeMonitor === 'health' ? item.type : 'ESTETICA / SPA'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 font-bold uppercase transition">
                                                        {formatDate(activeMonitor === 'health' ? item.application_date : item.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border tracking-widest shadow-sm group-hover:bg-white group-hover:text-gray-900 group-hover:border-white transition-all ${getStatusColor(dueDate)}`}>
                                                            {formatDate(dueDate)}
                                                            {isOverdue && <span className="ml-2">❗</span>}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-center gap-2">
                                                            <a 
                                                                href={activeMonitor === 'health' 
                                                                    ? getWhatsAppLink(item.pet?.owner?.phone, `Hola ${item.pet?.owner?.name}, te recordamos que la vacuna ${item.name} de ${item.pet?.name} vence el ${item.next_due_date ? item.next_due_date.split('T')[0] : ''}. ¿Deseas agendar una cita?`)
                                                                    : getWhatsAppLink(item.pet?.owner?.phone, `Hola ${item.pet?.owner?.name}, te recordamos que ya toca servicio de Estética para ${item.pet?.name}. Su última visita fue el ${item.created_at ? item.created_at.split('T')[0] : ''}. ¿Deseas agendar su próxima cita?`)
                                                                } 
                                                                target="_blank"
                                                                className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition shadow-lg"
                                                                title="WhatsApp Recordatorio"
                                                            >
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.89 9.884 0 2.225.659 3.891 1.746 5.634l-.999 3.648 3.744-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {records.links.length > 3 && (
                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-slate-50/30 dark:bg-gray-900/40 flex justify-center gap-1">
                                {records.links.map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url || link.active}
                                        className={`px-4 py-2 text-[10px] font-black rounded-xl transition ${link.active ? (activeMonitor === 'health' ? 'bg-indigo-600' : 'bg-brand-primary') + ' text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-opacity-10 border'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Small Legend at bottom */}
                    <div className="mt-8 flex flex-wrap justify-center gap-6 pb-12">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Alerta de Seguimiento (Vencidos)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Oportunidad de Venta (Próximos)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${activeMonitor === 'health' ? 'bg-emerald-500' : 'bg-brand-primary'}`}></div>
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{activeMonitor === 'health' ? 'Estatus al día' : 'Sugerencia Estética'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
