import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
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

export default function Create({ auth, pet, services, groomers, groomingStyles = [], ...props }) {
    const { data, setData, post, processing, errors } = useForm({
        appointment_id: props.appointment_id || '',
        pet_id: pet.id,
        client_id: pet.owner ? pet.owner.id : '',
        user_id: props.prefill?.groomer_id || '',
        arrival_condition: '',
        notes: '',
        next_visit_date: props.defaultNextVisitDate || '',
        items: [], // list of {product_id, quantity, concept, price}
        complete_after: false
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

    const applyStyle = (style) => {
        const prefix = data.notes ? data.notes + "\n" : "";
        setData('notes', `${prefix}[${style.name}]: ${style.description}`);
    };

    const removeService = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const submit = (e, completeAfter = false) => {
        if (e) e.preventDefault();
        
        router.post(route('grooming-orders.store'), {
            ...data,
            complete_after: completeAfter
        });
    };

    const total = data.items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-black text-lg text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-widest">Nueva Orden de Estética</h2>}
        >
            <Head title={`Orden de Estética - ${pet.name}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-[2rem] border border-gray-100 dark:border-gray-700">
                        <div className="p-0">
                            
                            {/* Pet Banner */}
                            <div className="bg-brand-primary/5 dark:bg-brand-primary/10 p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-3xl shadow-lg border border-white dark:border-gray-700">
                                        ✂️
                                    </div>
                                    <div>
                                        <h3 className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-0.5">Paciente para Grooming</h3>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{pet.name}</h4>
                                            <PetAlertIcons pet={pet} size="sm" />
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-1">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                                Dueño: {pet.owner?.name || 'N/A'}
                                            </span>
                                            {pet.breed && (
                                                <span className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                                    Raza: {pet.breed}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur px-5 py-3 rounded-2xl border border-white dark:border-gray-700 shadow-sm text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Estimado</p>
                                    <p className="text-xl font-black text-brand-primary">${total.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                                </div>
                            </div>

                            <form className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    
                                    {/* Left Column: Conditions & Notes */}
                                    <div className="lg:col-span-7 space-y-6">
                                        <div>
                                            <h4 className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                                                Diagnóstico de Entrada
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Condición de Llegada</label>
                                                    <textarea
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-2.5 focus:ring-brand-primary font-medium text-gray-700 dark:text-gray-300 transition-all placeholder:text-gray-400 text-xs shadow-inner"
                                                        rows="3"
                                                        value={data.arrival_condition}
                                                        onChange={e => setData('arrival_condition', e.target.value)}
                                                        placeholder="Detalla si tiene nudos, parásitos, afecciones de piel..."
                                                        required
                                                    ></textarea>
                                                </div>

                                                <div className="space-y-2 pt-2">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Estilos Rápidos (Cortes)</label>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {groomingStyles.map(style => (
                                                            <button
                                                                key={style.id}
                                                                type="button"
                                                                onClick={() => applyStyle(style)}
                                                                className="px-3 py-1.5 rounded-xl border border-brand-primary/20 text-[8px] font-black uppercase text-brand-primary bg-brand-primary/5 hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                                                title={style.description}
                                                            >
                                                                {style.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Instrucciones Especiales</label>
                                                    <textarea
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-2.5 focus:ring-brand-primary font-medium text-gray-700 dark:text-gray-300 transition-all placeholder:text-gray-400 text-xs shadow-inner"
                                                        rows="3"
                                                        value={data.notes}
                                                        onChange={e => setData('notes', e.target.value)}
                                                        placeholder="Corte específico, perfume, moño..."
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 pt-2">
                                            <Link
                                                href={route('pets.show', pet.id)}
                                                className="px-6 py-3 text-[9px] font-black text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-all"
                                            >
                                                Cancelar
                                            </Link>
                                            
                                            <div className="flex-1 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => submit(e, true)}
                                                    disabled={processing || data.items.length === 0}
                                                    className="flex-1 bg-white dark:bg-gray-800 text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all shadow-lg disabled:opacity-50"
                                                >
                                                    {processing ? '...' : 'Crear y Finalizar'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(e) => submit(e, false)}
                                                    disabled={processing || data.items.length === 0}
                                                    className="flex-[1.5] bg-brand-primary hover:opacity-90 active:scale-95 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-brand-primary/20 disabled:opacity-50"
                                                >
                                                    {processing ? '...' : 'Crear Orden'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Execution & Services */}
                                    <div className="lg:col-span-5 space-y-6">
                                        
                                        {/* Logistics */}
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-50 dark:border-gray-700 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Atiende</label>
                                                    <select
                                                        className="w-full bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 focus:ring-brand-primary font-bold text-gray-700 dark:text-gray-300 transition-all text-[10px]"
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
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Sugerir Regreso</label>
                                                    <input
                                                        type="date"
                                                        className="w-full bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 focus:ring-brand-primary font-bold text-gray-700 dark:text-gray-300 transition-all text-[10px]"
                                                        value={data.next_visit_date}
                                                        onChange={e => setData('next_visit_date', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Services Selection */}
                                        <div className="space-y-3">
                                            <h4 className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                                                Servicios del Catálogo
                                            </h4>
                                            
                                            <div className="flex gap-1.5 w-full">
                                                <select
                                                    className="flex-1 min-w-0 w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:ring-brand-primary font-bold text-gray-700 dark:text-gray-300 transition-all text-[10px] truncate"
                                                    value={selectedService}
                                                    onChange={e => setSelectedService(e.target.value)}
                                                >
                                                    <option value="">Añadir servicio...</option>
                                                    {services.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name} - ${parseFloat(s.price).toLocaleString('es-MX')}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={addService}
                                                    className="bg-brand-primary hover:bg-brand-primary/90 text-white w-9 h-9 flex items-center justify-center rounded-xl transition shadow-lg shadow-brand-primary/20 shrink-0"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                                </button>
                                            </div>

                                            <div className={`space-y-2 overflow-y-auto pr-1 transition-all ${data.items.length > 0 ? 'max-h-[200px]' : 'h-0'}`}>
                                                {data.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-right-2 duration-300 group">
                                                        <div>
                                                            <p className="font-black text-gray-900 dark:text-white uppercase text-[9px] tracking-wider">{item.concept}</p>
                                                            <p className="text-[9px] text-brand-primary font-black mt-0.5">${parseFloat(item.unit_price).toLocaleString('es-MX', {minimumFractionDigits:2})}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeService(idx)}
                                                            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm md:opacity-0 md:group-hover:opacity-100"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {data.items.length === 0 && (
                                                <div className="py-6 text-center bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border border-dashed border-gray-100 dark:border-gray-800">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sin servicios seleccionados</p>
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
