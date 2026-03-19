import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ auth, pet, services, groomers }) {
    const { data, setData, post, processing, errors } = useForm({
        pet_id: pet.id,
        client_id: pet.owner ? pet.owner.id : '',
        user_id: '',
        arrival_condition: '',
        notes: '',
        items: [] // list of {product_id, quantity, concept, price}
    });

    const [selectedService, setSelectedService] = useState('');

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

    const submit = (e) => {
        e.preventDefault();
        post(route('grooming-orders.store'));
    };

    const total = data.items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-black text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-widest">Nueva Orden de Estética</h2>}
        >
            <Head title={`Orden de Estética - ${pet.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700">
                        <div className="p-8">
                            
                            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                                <div className="w-16 h-16 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center text-3xl shadow-inner">
                                    ✂️
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-widest mb-1">Paciente para Estética</h3>
                                    <h4 className="text-2xl font-black text-gray-900 dark:text-white leading-none">{pet.name}</h4>
                                    <p className="text-xs font-bold text-gray-500 uppercase mt-2">Dueño: {pet.owner ? pet.owner.name : 'N/A'}</p>
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Atiende (Groomer / Estilista)</label>
                                        <select
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-fuchsia-500 font-bold text-gray-700 dark:text-gray-300 transition-colors"
                                            value={data.user_id}
                                            onChange={e => setData('user_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Seleccionar --</option>
                                            {groomers.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-4 md:col-span-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Servicios a Realizar</label>
                                        
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <select
                                                className="flex-1 w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-fuchsia-500 font-bold text-gray-700 dark:text-gray-300 transition-colors"
                                                value={selectedService}
                                                onChange={e => setSelectedService(e.target.value)}
                                            >
                                                <option value="">-- Seleccionar Servicio del Catálogo --</option>
                                                {services.map(s => (
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

                                        {errors.items && <p className="text-red-500 text-xs font-bold mt-1">{errors.items}</p>}

                                        {data.items.length > 0 && (
                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-2 mt-4">
                                                {data.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                                        <div>
                                                            <p className="font-bold text-gray-900 dark:text-white uppercase text-sm">{item.concept}</p>
                                                            <p className="text-xs text-gray-500 font-bold mt-0.5">${parseFloat(item.unit_price).toLocaleString('es-MX', {minimumFractionDigits:2})}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeService(idx)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition"
                                                        >×</button>
                                                    </div>
                                                ))}
                                                <div className="pt-2 text-right">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Estimado</p>
                                                    <p className="text-xl font-black text-fuchsia-600 dark:text-fuchsia-400">${total.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Condición de Llegada</label>
                                        <textarea
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-fuchsia-500 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                                            rows="3"
                                            value={data.arrival_condition}
                                            onChange={e => setData('arrival_condition', e.target.value)}
                                            placeholder="Detalla si tiene nudos, parásitos (pulgas/garrapatas), afecciones de piel, estado de ánimo..."
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Notas Adicionales (Opcional)</label>
                                        <textarea
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-fuchsia-500 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                                            rows="2"
                                            value={data.notes}
                                            onChange={e => setData('notes', e.target.value)}
                                            placeholder="Corte específico requerido por el dueño, perfume, moño..."
                                        ></textarea>
                                    </div>

                                </div>

                                <div className="flex items-center justify-end pt-6 border-t border-gray-100 dark:border-gray-700 gap-4 mt-8">
                                    <Link
                                        href={route('pets.show', pet.id)}
                                        className="text-xs font-black text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing || data.items.length === 0}
                                        className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-fuchsia-500/30 disabled:opacity-50"
                                    >
                                        {processing ? 'Guardando...' : 'Registrar Orden'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
