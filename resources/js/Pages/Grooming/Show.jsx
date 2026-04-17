import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const roleLabels = {
    admin: 'Adm.',
    vet: 'Vet.',
    veterinarian: 'Vet.',
    surgeon: 'Cirujano',
    specialist: 'Esp.',
    groomer: 'Estilista',
    staff: 'Staff'
};

export default function Show({ auth, order, services }) {
    const { data, setData, put, post, processing } = useForm({
        arrival_condition: order.arrival_condition || '',
        notes: order.notes || '',
        next_visit_date: order.next_visit_date || '',
        items: order.items || []
    });

    const [selectedService, setSelectedService] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const isCompleted = order.status === 'completed';
    const isCancelled = order.status === 'cancelled';
    const canEdit = !isCompleted && !isCancelled;

    const addService = () => {
        if (!selectedService) return;
        const service = services.find(s => s.id == selectedService);
        if (service) {
            setData('items', [
                ...data.items,
                { product_id: service.id, concept: service.name, unit_price: service.price, quantity: 1 }
            ]);
            setSelectedService('');
        }
    };

    const removeService = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const saveChanges = (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        put(route('grooming-orders.update', order.id), {
            preserveScroll: true,
            onFinish: () => setIsSaving(false)
        });
    };

    const markAsComplete = (e) => {
        e.preventDefault();
        // Since we allow modifying notes before completing, we do saving first is better 
        // But we can also rely on the complete method saving the notes. 
        // To be safe, if we changed items, we'll force the user to save changes first OR we just chain requests.
        // Actually, let's just use POST to complete, and it accepts notes. We will tell user to 'Guardar' items first if they modified them.
        post(route('grooming-orders.complete', order.id));
    };

    const total = data.items.reduce((acc, item) => acc + (parseFloat(item.unit_price) * item.quantity), 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-black text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-widest flex items-center gap-3">
                Orden de Estética <span className="text-gray-400 bg-white/50 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 tracking-tighter text-sm">#{order.folio}</span> 
            </h2>}
        >
            <Head title={`Estética - ${order.folio}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-2xl sm:rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
                        <div className="p-0">
                            
                            {/* Status Banner */}
                            {isCompleted && (
                                <div className="p-6 bg-emerald-500 text-white flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur grid place-items-center rounded-2xl text-2xl">✓</div>
                                        <div>
                                            <h4 className="font-black uppercase text-sm tracking-widest">Servicio Completado</h4>
                                            <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">Los cargos ya están en el Punto de Venta.</p>
                                        </div>
                                    </div>
                                    <Link href={route('receipts.create')} className="text-[10px] font-black uppercase bg-white text-emerald-600 hover:bg-emerald-50 py-3 px-6 rounded-2xl transition shadow-lg shrink-0">Ir a Cobrar al POS</Link>
                                </div>
                            )}

                            {/* Pet Banner */}
                            <div className="bg-brand-primary/5 dark:bg-brand-primary/10 p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-white dark:bg-gray-800 flex items-center justify-center text-4xl shadow-xl border border-white dark:border-gray-700">
                                        🛁
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-1">Detalles del Paciente</h3>
                                        <Link href={route('pets.show', order.pet.id)} className="text-3xl font-black text-gray-900 dark:text-white leading-none hover:text-brand-primary transition tracking-tight">{order.pet.name}</Link>
                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                                Atendió: {order.user ? order.user.name : 'N/A'}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                                Folio: #{order.folio}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur px-8 py-4 rounded-3xl border border-white dark:border-gray-700 shadow-sm text-center min-w-[180px]">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total MXN</p>
                                        <p className="text-3xl font-black text-brand-primary">${total.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                                    </div>
                                    {canEdit && (
                                        <button 
                                            type="button" 
                                            onClick={saveChanges}
                                            disabled={isSaving || processing}
                                            className="text-[9px] font-black text-brand-primary hover:text-white hover:bg-brand-primary uppercase tracking-widest px-4 py-2 rounded-xl transition-all disabled:opacity-50 border border-brand-primary/20"
                                        >
                                            {isSaving ? 'Guardando...' : 'Guardar borrador de cambios'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    
                                    {/* Left Column: Log */}
                                    <div className="lg:col-span-7 space-y-8">
                                        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-8">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                                                        Condición de Entrada
                                                    </h3>
                                                    {canEdit ? (
                                                        <textarea
                                                            className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 focus:ring-brand-primary font-medium text-gray-700 dark:text-gray-300 transition-colors text-sm"
                                                            rows="3"
                                                            value={data.arrival_condition}
                                                            onChange={e => setData('arrival_condition', e.target.value)}
                                                        />
                                                    ) : (
                                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                            {data.arrival_condition || 'No especificada.'}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                                                        Regreso Sugerido
                                                    </h3>
                                                    {canEdit ? (
                                                        <input
                                                            type="date"
                                                            className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 focus:ring-brand-primary font-bold text-gray-700 dark:text-gray-300 transition-colors text-sm"
                                                            value={data.next_visit_date}
                                                            onChange={e => setData('next_visit_date', e.target.value)}
                                                        />
                                                    ) : (
                                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                            {data.next_visit_date ? new Date(data.next_visit_date).toLocaleDateString('es-MX', {day: '2-digit', month: 'long', year: 'numeric'}) : 'No programada.'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {(!isCompleted || data.notes) && (
                                                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                                                    <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                                                        {isCompleted ? 'Observaciones de Salida' : 'Nota de Salida / Instrucciones Finales'}
                                                    </h3>
                                                    {canEdit ? (
                                                        <textarea
                                                            className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 focus:ring-brand-primary font-medium text-gray-700 dark:text-gray-300 transition-colors text-sm"
                                                            rows="3"
                                                            value={data.notes}
                                                            onChange={e => setData('notes', e.target.value)}
                                                            placeholder="Instrucciones para la entrega del perrito..."
                                                        />
                                                    ) : (
                                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                            {data.notes || 'Sin observaciones finales.'}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {canEdit && (
                                            <form onSubmit={markAsComplete} className="bg-brand-primary p-8 rounded-[2.5rem] shadow-2xl shadow-brand-primary/40 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                                                <div>
                                                    <h4 className="font-black uppercase tracking-[0.2em] text-sm mb-1">Finalizar Servicio</h4>
                                                    <p className="text-[11px] font-bold opacity-80 uppercase tracking-tighter leading-tight">Registra el cierre del servicio y envía los cargos al POS.</p>
                                                </div>
                                                <button
                                                    type="submit"
                                                    onClick={(e) => {
                                                        if (data.items.length !== order.items.length && !confirm("Has modificado servicios pero no los has 'Guardado'. ¿Finalizar con lo último guardado?")) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    disabled={processing}
                                                    className="bg-white text-brand-primary px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl whitespace-nowrap"
                                                >
                                                    {processing ? '...' : 'Completar y Cobrar'}
                                                </button>
                                            </form>
                                        )}
                                    </div>

                                    {/* Right Column: Services */}
                                    <div className="lg:col-span-5 space-y-6">
                                        <h4 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                            <span className="w-2 h-2 bg-brand-primary rounded-full"></span>
                                            Servicios Agendados
                                        </h4>
                                        
                                        {canEdit && (
                                            <div className="flex gap-2 w-full">
                                                <select
                                                    className="flex-1 min-w-0 w-full bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 text-xs sm:text-sm truncate pr-8 focus:ring-brand-primary font-bold text-gray-700 dark:text-gray-300 shadow-inner"
                                                    value={selectedService}
                                                    onChange={e => setSelectedService(e.target.value)}
                                                >
                                                    <option value="">Añadir extra...</option>
                                                    {services?.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name} - ${parseFloat(s.price).toLocaleString('es-MX')}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={addService}
                                                    className="bg-brand-primary hover:bg-brand-primary/90 text-white w-12 h-12 flex items-center justify-center rounded-2xl transition shadow-lg shadow-brand-primary/20 shrink-0"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                                </button>
                                            </div>
                                        )}

                                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                            {data.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/40 p-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-700 group transition-all">
                                                    <div>
                                                        <p className="font-black text-[11px] text-gray-900 dark:text-white uppercase leading-tight tracking-wider">{item.concept}</p>
                                                        <p className="font-black text-[10px] text-brand-primary mt-1">${parseFloat(item.unit_price).toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                                                    </div>
                                                    {canEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeService(idx)}
                                                            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm md:opacity-0 md:group-hover:opacity-100"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {data.items.length === 0 && (
                                                <div className="py-12 text-center bg-gray-50/50 dark:bg-gray-900/20 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sin servicios registrados</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
