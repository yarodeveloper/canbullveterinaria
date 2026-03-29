import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';

const roleLabels = {
    admin: 'Adm.',
    veterinarian: 'Vet.',
    surgeon: 'Cirujano',
    specialist: 'Esp.',
    groomer: 'Estilista'
};

export default function Create({ auth, pets, veterinarians, initialPetId }) {
    const initialPet = pets.find(p => p.id == initialPetId);

    const { data, setData, post, processing, errors } = useForm({
        pet_id: initialPetId || '',
        veterinarian_id: '',
        start_time: '',
        duration: 30,
        type: 'consultation',
        reason: '',
    });

    const [searchTerm, setSearchTerm] = useState(initialPet ? initialPet.name + ' (' + (initialPet.owner?.name || '---') + ')' : '');
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredPets = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const submit = (e) => {
        e.preventDefault();
        post(route('appointments.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight tracking-tight uppercase">Nueva Reservación</h2>}
        >
            <Head title="Nueva Cita" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-2xl sm:rounded-[2.5rem] border border-gray-50 dark:border-gray-700">
                        <form onSubmit={submit} className="p-10 space-y-8">

                            <div className="relative">
                                <div className="absolute top-0 left-0 w-16 h-1.5 bg-brand-primary rounded-full"></div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight pt-4">Agendar Compromiso</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Completa los detalles del servicio</p>
                            </div>

                            {/* Pet Selection */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    1. Localizar Paciente
                                </label>

                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="🔍 Buscar mascota o dueño..."
                                        value={searchTerm}
                                        onChange={e => {
                                            setSearchTerm(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                        className="w-full rounded-2xl border-gray-200 py-3.5 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />

                                    {showDropdown && searchTerm && (
                                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] shadow-2xl max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
                                            {filteredPets.length > 0 ? filteredPets.map(pet => (
                                                <button
                                                    key={pet.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setData('pet_id', pet.id);
                                                        setSearchTerm(pet.name + ' (' + (pet.owner?.name || '---') + ')');
                                                        setShowDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-8 py-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between border-b dark:border-gray-700 last:border-0 ${data.pet_id === pet.id ? 'bg-brand-primary/5' : ''}`}
                                                >
                                                    <div>
                                                        <span className="font-black text-gray-100 dark:text-gray-100">{pet.name}</span>
                                                        <span className="ml-3 text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-500 rounded-lg font-black uppercase tracking-widest">{pet.species}</span>
                                                        <p className="text-xs text-gray-400 font-medium mt-1">Responsable: {pet.owner?.name || 'No registrado'}</p>
                                                    </div>
                                                    {data.pet_id === pet.id && <span className="text-brand-primary text-xl font-black">✓</span>}
                                                </button>
                                            )) : (
                                                <div className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Sin resultados encontrados</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {errors.pet_id && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 tracking-wider">{errors.pet_id}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Type */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Motivo del Servicio</label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="w-full rounded-2xl border-gray-200 py-3 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold"
                                    >
                                        <option value="consultation">🩺 Consulta General</option>
                                        <option value="surgery">🔪 Cirugía Programada</option>
                                        <option value="grooming">🛁 Estética / Baño</option>
                                        <option value="follow-up">📋 Seguimiento / RECO</option>
                                        <option value="emergency">🚨 Urgencia Médica</option>
                                    </select>
                                </div>

                                {/* Veterinarian */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">3. Especialista a cargo</label>
                                    <select
                                        value={data.veterinarian_id}
                                        onChange={e => setData('veterinarian_id', e.target.value)}
                                        className="w-full rounded-2xl border-gray-200 py-3 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    >
                                        <option value="">Cualquiera disponible</option>
                                        {veterinarians.map(vet => (
                                            <option key={vet.id} value={vet.id}>{vet.name} ({roleLabels[vet.role] || vet.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Date & Time */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">4. Programación</label>
                                    <input
                                        type="datetime-local"
                                        step="600"
                                        value={data.start_time}
                                        onChange={e => setData('start_time', e.target.value)}
                                        className="w-full rounded-2xl border-gray-200 py-3 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold"
                                        required
                                    />
                                    {errors.start_time && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 tracking-wider">{errors.start_time}</p>}
                                </div>

                                {/* Duration */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">5. Tiempo Estimado</label>
                                    <select
                                        value={data.duration}
                                        onChange={e => setData('duration', e.target.value)}
                                        className="w-full rounded-2xl border-gray-200 py-3 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    >
                                        <option value="15">💡 Rápido (15 min)</option>
                                        <option value="30">⚡ Estándar (30 min)</option>
                                        <option value="45">📊 Intermedio (45 min)</option>
                                        <option value="60">🕙 Sesión (1 hora)</option>
                                        <option value="120">🏢 Extenso (2 horas)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Información Adicional (Siniestros/Síntomas)</label>
                                <textarea
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    placeholder="Describe brevemente el motivo de la cita o cualquier detalle que el médico deba saber antes..."
                                    className="w-full rounded-2xl border-gray-200 py-4 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white h-28 text-sm"
                                ></textarea>
                            </div>

                            <div className="pt-8 flex items-center justify-between border-t border-gray-50 dark:border-gray-700">
                                <Link
                                    href={route('appointments.index')}
                                    className="text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition tracking-[0.2em]"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-12 py-3 bg-brand-primary text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:opacity-90 transition shadow-2xl shadow-brand-primary/20 disabled:opacity-50"
                                >
                                    ¡Confirmar Cita!
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
