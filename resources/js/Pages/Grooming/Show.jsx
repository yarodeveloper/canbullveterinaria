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
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700">
                        <div className="p-8">
                            
                            {isCompleted && (
                                <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 grid place-items-center rounded-xl text-emerald-600 dark:text-emerald-400 font-black">✓</div>
                                        <div>
                                            <h4 className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-sm tracking-widest">Servicio Completado</h4>
                                            <p className="text-xs text-emerald-600/70 font-bold">Cargos enviados a Punto de Venta.</p>
                                        </div>
                                    </div>
                                    <Link href={route('receipts.create')} className="text-xs font-black uppercase bg-emerald-600 text-white hover:bg-emerald-500 py-2 px-4 rounded-xl transition">Ir a Cobrar al POS</Link>
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-3xl shadow-inner">
                                    🛁
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Paciente</h3>
                                    <Link href={route('pets.show', order.pet.id)} className="text-2xl font-black text-gray-900 dark:text-white leading-none hover:text-brand-primary transition">{order.pet.name}</Link>
                                    <p className="text-xs font-bold text-gray-500 uppercase mt-2">Atendió: {order.user ? `${order.user.name} (${roleLabels[order.user.role] || order.user.role})` : 'N/A'}</p>
                                </div>
                                {canEdit && (
                                    <button 
                                        type="button" 
                                        onClick={saveChanges}
                                        disabled={isSaving || processing}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 text-xs font-black uppercase px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? 'Guardando...' : 'Guardar Cambios Parciales'}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-xs font-black text-brand-primary dark:text-brand-primary/80 uppercase tracking-widest mb-4">Condición de Llegada</h3>
                                    {canEdit ? (
                                        <textarea
                                            className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-brand-primary font-medium text-gray-700 dark:text-gray-300 transition-colors"
                                            rows="3"
                                            value={data.arrival_condition}
                                            onChange={e => setData('arrival_condition', e.target.value)}
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">{data.arrival_condition || 'No especificada.'}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-black text-brand-primary dark:text-brand-primary/80 uppercase tracking-widest">Servicios a Realizar</h3>
                                    </div>
                                    
                                    {canEdit && (
                                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                            <select
                                                className="flex-1 w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-brand-primary font-bold text-gray-700 dark:text-gray-300 shadow-sm"
                                                value={selectedService}
                                                onChange={e => setSelectedService(e.target.value)}
                                            >
                                                <option value="">Añadir Servicio Extra...</option>
                                                {services?.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} (${parseFloat(s.price).toLocaleString('es-MX', {minimumFractionDigits:2})})</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={addService}
                                                className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-6 font-black uppercase tracking-widest rounded-xl text-xs transition min-h-[48px] shrink-0 shadow-sm"
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {data.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 border border-gray-100 dark:border-gray-700 rounded-xl group transition-all">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white uppercase leading-tight">{item.concept}</p>
                                                    <p className="font-bold text-xs text-gray-500 uppercase mt-1">Cant: {item.quantity}</p>
                                                </div>
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeService(idx)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100"
                                                        title="Eliminar Servicio"
                                                    >×</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-right pr-4">
                                        <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">Total MXN Estimado</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                                            ${total.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {canEdit && (
                                <form onSubmit={markAsComplete} className="pt-6 border-t border-gray-100 dark:border-gray-700 mt-6">
                                    <div className="mb-6">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Observaciones de Salida del Estilista</label>
                                        <textarea
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mt-2 focus:ring-brand-primary font-medium text-gray-700 dark:text-gray-300 transition-colors"
                                            rows="2"
                                            value={data.notes}
                                            onChange={e => setData('notes', e.target.value)}
                                            placeholder="El perrito se portó bien, se detectó una verruga, se le puso pañoleta roja..."
                                        />
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between md:items-center bg-brand-primary/5 dark:bg-brand-primary/10 p-4 rounded-xl border border-brand-primary/20 dark:border-brand-primary/40 gap-4">
                                        <div>
                                            <h4 className="text-brand-primary dark:text-brand-primary/80 font-black uppercase tracking-widest text-xs mb-1">Finalizar Servicio</h4>
                                            <p className="text-[10px] text-brand-primary/80 uppercase font-bold">Esto enviará los cargos directamente al POS para su cobro con el total actual.</p>
                                            <p className="text-[10px] text-red-500/80 uppercase font-bold mt-1">Asegúrate de haber "Guardado Cambios Parciales" si modificaste servicios.</p>
                                        </div>
                                        <button
                                            type="submit"
                                            onClick={(e) => {
                                                if (data.items.length !== order.items.length && !confirm("Has modificado los servicios de la orden pero no guardaste los cambios (botón 'Guardar Cambios Parciales'). ¡El sistema cobrará lo último guardado! ¿Deseas continuar y completar?")) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            disabled={processing}
                                            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-brand-primary/20 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {processing ? '...' : 'Completar y Cobrar'}
                                        </button>
                                    </div>
                                </form>
                            )}
                            
                            {isCompleted && data.notes && (
                                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Observaciones Finales (Nota de Salida)</h3>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{data.notes}</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
