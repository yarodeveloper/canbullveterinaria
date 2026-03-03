import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';

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

    const [searchTerm, setSearchTerm] = useState(initialPet ? initialPet.name + ' (' + initialPet.owner.name + ')' : '');
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredPets = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const submit = (e) => {
        e.preventDefault();
        post(route('appointments.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Agendar Nueva Cita</h2>}
        >
            <Head title="Nueva Cita" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-2xl">
                        <form onSubmit={submit} className="p-8 space-y-6">

                            {/* Pet Selection */}
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    1. Selecciona el Paciente
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
                                        className="w-full rounded-xl border-gray-200 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                    />

                                    {showDropdown && searchTerm && (
                                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-auto">
                                            {filteredPets.length > 0 ? filteredPets.map(pet => (
                                                <button
                                                    key={pet.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setData('pet_id', pet.id);
                                                        setSearchTerm(pet.name + ' (' + pet.owner.name + ')');
                                                        setShowDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between border-b dark:border-gray-700 last:border-0 ${data.pet_id === pet.id ? 'bg-brand-primary/10 dark:bg-brand-primary/20 ring-2 ring-inset ring-brand-primary' : ''}`}
                                                >
                                                    <div>
                                                        <span className="font-black text-gray-900 dark:text-gray-100">{pet.name}</span>
                                                        <span className="ml-2 text-xs text-gray-400 font-bold uppercase">{pet.species}</span>
                                                        <p className="text-xs text-gray-500">Dueño: {pet.owner.name}</p>
                                                    </div>
                                                    {data.pet_id === pet.id && <span className="text-brand-primary font-black">✓</span>}
                                                </button>
                                            )) : (
                                                <div className="p-4 text-center text-sm text-gray-500 italic">No se encontraron pacientes.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {errors.pet_id && <p className="text-red-500 text-xs font-bold">{errors.pet_id}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Type */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Cita</label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                    >
                                        <option value="consultation">🩺 Consulta General</option>
                                        <option value="surgery">🔪 Cirugía</option>
                                        <option value="grooming">🛁 Estética / Baño</option>
                                        <option value="follow-up">📋 Seguimiento</option>
                                        <option value="emergency">🚨 Urgencia</option>
                                    </select>
                                </div>

                                {/* Veterinarian */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asignar Profesional</label>
                                    <select
                                        value={data.veterinarian_id}
                                        onChange={e => setData('veterinarian_id', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                    >
                                        <option value="">Seleccione o deje vacío</option>
                                        {veterinarians.map(vet => (
                                            <option key={vet.id} value={vet.id}>{vet.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date & Time */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha y Hora</label>
                                    <input
                                        type="datetime-local"
                                        value={data.start_time}
                                        onChange={e => setData('start_time', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                        required
                                    />
                                    {errors.start_time && <p className="text-red-500 text-xs">{errors.start_time}</p>}
                                </div>

                                {/* Duration */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duración Est. (min)</label>
                                    <select
                                        value={data.duration}
                                        onChange={e => setData('duration', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                    >
                                        <option value="15">15 min</option>
                                        <option value="30">30 min</option>
                                        <option value="45">45 min</option>
                                        <option value="60">1 hora</option>
                                        <option value="120">2 horas</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Motivo / Notas Adicionales</label>
                                <textarea
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    placeholder="Ej: Vacunación anual, cojera en pata delantera..."
                                    className="w-full rounded-xl border-gray-200 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 h-24"
                                ></textarea>
                            </div>

                            <div className="pt-6 flex items-center justify-between border-t dark:border-gray-700">
                                <Link
                                    href={route('appointments.index')}
                                    className="text-gray-500 font-bold hover:text-gray-700 transition"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 bg-brand-primary text-white rounded-xl font-black hover:bg-brand-primary/90 transition shadow-xl shadow-brand-primary/20 dark:shadow-none disabled:opacity-50"
                                >
                                    ¡Agendar Ahora!
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
