import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

export default function Create({ auth, pets, veterinarians, selectedPetId }) {
    const initialPet = pets.find(p => p.id == selectedPetId);

    const { data, setData, post, processing, errors } = useForm({
        pet_id: selectedPetId || '',
        veterinarian_id: '',
        anesthesiologist_id: '',
        surgery_type: '',
        scheduled_at: '',
        asa_classification: 'I',
        pre_op_notes: '',
    });

    const [searchTerm, setSearchTerm] = useState(initialPet ? initialPet.name + ' (' + initialPet.species + ')' : '');
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredPets = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.species.toLowerCase().includes(searchTerm.toLowerCase()) // assuming species is text
    ).slice(0, 5);

    const submit = (e) => {
        e.preventDefault();
        post(route('surgeries.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight tracking-tight uppercase">Programar Intervención Quirúrgica</h2>}
        >
            <Head title="Programar Cirugía" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-2xl sm:rounded-[2.5rem] border dark:border-gray-700">
                            <div className="p-10">
                                <div className="flex items-center gap-4 mb-10 border-b dark:border-gray-700 pb-6">
                                    <div className="w-16 h-16 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center text-3xl">🩺</div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Nueva Cirugía</h3>
                                        <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Protocolo de ingreso e intervención</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Paciente */}
                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Paciente</label>
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
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-6 focus:ring-brand-primary focus:border-brand-primary transition-all font-bold"
                                        />

                                        {showDropdown && searchTerm && (
                                            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-auto">
                                                {filteredPets.length > 0 ? filteredPets.map(pet => (
                                                    <button
                                                        key={pet.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setData('pet_id', pet.id);
                                                            setSearchTerm(pet.name + ' (' + pet.species + ')');
                                                            setShowDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between border-b dark:border-gray-700 last:border-0 ${data.pet_id === pet.id ? 'bg-brand-primary/10 dark:bg-brand-primary/20 ring-2 ring-inset ring-brand-primary' : ''}`}
                                                    >
                                                        <div>
                                                            <span className="font-black text-gray-900 dark:text-gray-100">{pet.name}</span>
                                                            <span className="ml-2 text-xs text-gray-400 font-bold uppercase">{pet.species}</span>
                                                        </div>
                                                        {data.pet_id === pet.id && <span className="text-brand-primary font-black">✓</span>}
                                                    </button>
                                                )) : (
                                                    <div className="p-4 text-center text-sm text-gray-500 italic">No se encontraron pacientes.</div>
                                                )}
                                            </div>
                                        )}
                                        {errors.pet_id && <div className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1">{errors.pet_id}</div>}
                                    </div>

                                    {/* Tipo de Cirugía */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Procedimiento</label>
                                        <input
                                            type="text"
                                            value={data.surgery_type}
                                            onChange={e => setData('surgery_type', e.target.value)}
                                            placeholder="Ej: Ovariohisterectomía, Limpieza Dental"
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-6 focus:ring-brand-primary focus:border-brand-primary transition-all font-bold"
                                        />
                                        {errors.surgery_type && <div className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1">{errors.surgery_type}</div>}
                                    </div>

                                    {/* Cirujano */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cirujano Líder</label>
                                        <select
                                            value={data.veterinarian_id}
                                            onChange={e => setData('veterinarian_id', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-6 focus:ring-brand-primary focus:border-brand-primary transition-all font-bold"
                                        >
                                            <option value="">Selecciona al cirujano</option>
                                            {veterinarians.map(vet => (
                                                <option key={vet.id} value={vet.id}>{vet.name}</option>
                                            ))}
                                        </select>
                                        {errors.veterinarian_id && <div className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1">{errors.veterinarian_id}</div>}
                                    </div>

                                    {/* Fecha y Hora */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha y Hora Programada</label>
                                        <input
                                            type="datetime-local"
                                            value={data.scheduled_at}
                                            onChange={e => setData('scheduled_at', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-6 focus:ring-brand-primary focus:border-brand-primary transition-all font-bold text-sm"
                                        />
                                        {errors.scheduled_at && <div className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1">{errors.scheduled_at}</div>}
                                    </div>

                                    {/* Clasificación ASA */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Clasificación de Riesgo (ASA)</label>
                                        <select
                                            value={data.asa_classification}
                                            onChange={e => setData('asa_classification', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-6 focus:ring-brand-primary focus:border-brand-primary transition-all font-bold"
                                        >
                                            <option value="I">ASA I - Saludable</option>
                                            <option value="II">ASA II - Enfermedad sistémica leve</option>
                                            <option value="III">ASA III - Enfermedad sistémica severa</option>
                                            <option value="IV">ASA IV - Enfermedad constante amenaza vida</option>
                                            <option value="V">ASA V - Moribundo</option>
                                            <option value="E">Emergencia</option>
                                        </select>
                                    </div>

                                    {/* Anestesiólogo */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Anestesiólogo (Opcional)</label>
                                        <select
                                            value={data.anesthesiologist_id}
                                            onChange={e => setData('anesthesiologist_id', e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-6 focus:ring-brand-primary focus:border-brand-primary transition-all font-bold text-sm"
                                        >
                                            <option value="">No asignado</option>
                                            {veterinarians.map(vet => (
                                                <option key={vet.id} value={vet.id}>{vet.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observaciones Pre-operatorias</label>
                                    <textarea
                                        value={data.pre_op_notes}
                                        onChange={e => setData('pre_op_notes', e.target.value)}
                                        rows="3"
                                        placeholder="Ej: Ayuno confirmado, Alergias, Estudios previos..."
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 rounded-3xl py-4 px-6 focus:ring-brand-primary focus:border-brand-primary transition-all font-medium"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-5 sticky bottom-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-[2rem] border dark:border-gray-700 shadow-2xl z-20">
                            <Link
                                href={route('surgeries.index')}
                                className="px-8 py-3 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-12 py-4 bg-brand-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-100 hover:opacity-95 transition-all disabled:opacity-50"
                            >
                                {processing ? 'Procesando...' : 'Confirmar Cirugía'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
