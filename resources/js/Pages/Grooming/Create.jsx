import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PetAlertIcons from '@/Components/PetAlertIcons';

const roleLabels = {
    admin: 'Adm.',
    vet: 'Vet.',
    veterinarian: 'Vet.',
    surgeon: 'Cirujano',
    specialist: 'Esp.',
    groomer: 'Estilista',
    staff: 'Staff'
};

export default function Create({ auth, pet, services, groomers, ...props }) {
    const { data, setData, post, processing, errors } = useForm({
        appointment_id: props.appointment_id || '',
        pet_id: pet.id,
        client_id: pet.owner ? pet.owner.id : '',
        user_id: props.prefill?.groomer_id || '',
        arrival_condition: '',
        notes: '',
        next_visit_date: props.defaultNextVisitDate || '',
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
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-2xl sm:rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
                        <div className="p-0">
                            
                            {/* Pet Banner */}
                            <div className="bg-brand-primary/5 dark:bg-brand-primary/10 p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-white dark:bg-gray-800 flex items-center justify-center text-4xl shadow-xl border border-white dark:border-gray-700">
                                        ✂️
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-1">Paciente para Grooming</h3>
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{pet.name}</h4>
                                            <PetAlertIcons pet={pet} size="lg" />
                                        </div>
                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                                Dueño: {pet.owner?.name || 'N/A'}
                                            </span>
                                            {pet.breed && (
                                                <span className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                                    Raza: {pet.breed?.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur px-6 py-4 rounded-3xl border border-white dark:border-gray-700 shadow-sm text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Estimado</p>
                                    <p className="text-3xl font-black text-brand-primary">${total.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                                </div>
                            </div>

                            <form onSubmit={submit} className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    
                                    {/* Left Column: Conditions & Notes */}
                                    <div className="lg:col-span-7 space-y-8">
                                        <div>
                                            <h4 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-brand-primary rounded-full"></span>
                                                Diagnóstico de Entrada
                                            </h4>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Condición de Llegada</label>
                                                    <textarea
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 rounded-[2rem] px-6 py-4 focus:ring-brand-primary font-medium text-gray-700 dark:text-gray-300 transition-all placeholder:text-gray-400 text-sm shadow-inner"
                                                        rows="4"
                                                        value={data.arrival_condition}
                                                        onChange={e => setData('arrival_condition', e.target.value)}
                                                        placeholder="Detalla si tiene nudos, parásitos, afecciones de piel, estado de ánimo..."
                                                        required
                                                    ></textarea>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Instrucciones Especiales</label>
                                                    <textarea
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 rounded-[2rem] px-6 py-4 focus:ring-brand-primary font-medium text-gray-700 dark:text-gray-300 transition-all placeholder:text-gray-400 text-sm shadow-inner"
                                                        rows="3"
                                                        value={data.notes}
                                                        onChange={e => setData('notes', e.target.value)}
                                                        placeholder="Corte específico, perfume, moño, precauciones..."
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 pt-4">
                                            <Link
                                                href={route('pets.show', pet.id)}
                                                className="px-8 py-4 text-xs font-black text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-all"
                                            >
                                                Cancelar
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={processing || data.items.length === 0}
                                                className="flex-1 bg-brand-primary hover:scale-[1.02] active:scale-95 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-brand-primary/40 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                                            >
                                                {processing ? 'Generando...' : 'Crear Orden de Servicio'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Column: Execution & Services */}
                                    <div className="lg:col-span-5 space-y-8">
                                        
                                        {/* Logistics */}
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2.5rem] border border-gray-50 dark:border-gray-700 space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Atiende</label>
                                                    <select
                                                        className="w-full bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 focus:ring-brand-primary font-bold text-gray-700 dark:text-gray-300 transition-all text-xs"
                                                        value={data.user_id}
                                                        onChange={e => setData('user_id', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">-- Estilista --</option>
                                                        {groomers.map(g => (
                                                            <option key={g.id} value={g.id}>{g.name} ({roleLabels[g.role] || g.role})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sugerir Regreso</label>
                                                    <input
                                                        type="date"
                                                        className="w-full bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 focus:ring-brand-primary font-bold text-gray-700 dark:text-gray-300 transition-all text-xs"
                                                        value={data.next_visit_date}
                                                        onChange={e => setData('next_visit_date', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Services Selection */}
                                        <div className="space-y-4">
                                            <h4 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-brand-primary rounded-full"></span>
                                                Servicios del Catálogo
                                            </h4>
                                            
                                            <div className="flex gap-2 w-full">
                                                <select
                                                    className="flex-1 min-w-0 w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 focus:ring-brand-primary font-bold text-gray-700 dark:text-gray-300 transition-all text-xs sm:text-sm truncate pr-8"
                                                    value={selectedService}
                                                    onChange={e => setSelectedService(e.target.value)}
                                                >
                                                    <option value="">Seleccionar servicio...</option>
                                                    {services.map(s => (
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

                                            {errors.items && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-2">{errors.items}</p>}

                                            <div className={`space-y-3 overflow-y-auto pr-1 transition-all ${data.items.length > 0 ? 'max-h-[300px]' : 'h-0'}`}>
                                                {data.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-right-4 duration-300 group">
                                                        <div>
                                                            <p className="font-black text-gray-900 dark:text-white uppercase text-[10px] tracking-wider">{item.concept}</p>
                                                            <p className="text-[10px] text-brand-primary font-black mt-0.5">${parseFloat(item.unit_price).toLocaleString('es-MX', {minimumFractionDigits:2})}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeService(idx)}
                                                            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm md:opacity-0 md:group-hover:opacity-100"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {data.items.length === 0 && (
                                                <div className="py-12 text-center bg-gray-50/50 dark:bg-gray-900/20 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No hay servicios seleccionados</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
