import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import MedicationsEditor from '@/Components/MedicationsEditor';
import PendingChargesEditor from '@/Components/PendingChargesEditor';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import PetAvatar from '@/Components/PetAvatar';
import PetRegistrationForm from '@/Components/PetRegistrationForm';
import PetAlertIcons from '@/Components/PetAlertIcons';

const roleLabels = {
    admin: 'Adm.',
    veterinarian: 'Vet.',
    surgeon: 'Cirujano',
    specialist: 'Esp.',
    groomer: 'Estilista'
};

export default function Create({ auth, pet: initialPet, veterinarians, clients: initialClients, selectedPetId, appointment_id, products = [] }) {
    const [selectedPet, setSelectedPet] = useState(initialPet);
    const [petSearch, setPetSearch] = useState('');
    const [petResults, setPetResults] = useState([]);
    const [showQuickPetModal, setShowQuickPetModal] = useState(false);
    const [localClients, setLocalClients] = useState(initialClients);

    const { data, setData, post, processing, errors } = useForm({
        appointment_id: appointment_id || '',
        pet_id: selectedPetId || initialPet?.id || '',
        veterinarian_id: '',
        anesthesiologist_id: '',
        surgery_type: '',
        scheduled_at: '',
        asa_classification: 'I',
        pre_op_notes: '',
        pre_operative_medications: [],
        intra_operative_medications: [],
        post_operative_medications: [],
        pending_charges: []
    });

    useEffect(() => {
        if (petSearch.length > 2) {
            const timeoutId = setTimeout(() => {
                axios.get(route('pets.search', { q: petSearch }))
                    .then(res => setPetResults(res.data));
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setPetResults([]);
        }
    }, [petSearch]);

    const handlePetSelect = (item) => {
        const pet = item.pet || item;
        setSelectedPet(pet);
        setData('pet_id', pet.id);
        setPetSearch('');
        setPetResults([]);
    };

    const handlePetCreated = (pet) => {
        handlePetSelect(pet);
        setShowQuickPetModal(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('surgeries.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Programar Cirugía" />

            <div className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-[#111822] flex items-center justify-center py-8 px-4 transition-colors">
                <div className="w-full max-w-5xl bg-white dark:bg-[#1B2132] rounded-[1.5rem] shadow-2xl border border-slate-200 dark:border-slate-700/50 font-sans">
                    
                    {/* Compact Header */}
                    <div className="px-8 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-primary/10 text-brand-primary text-xl">
                                ✂️
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Nueva Intervención Quirúrgica</span>
                        </div>
                        <Link href={route('surgeries.index')} className="text-slate-400 hover:text-red-500 transition group focus:outline-none">
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </Link>
                    </div>

                    {selectedPet?.status === 'deceased' && (
                        <div className="bg-red-600 text-white px-8 py-3 flex items-center justify-between border-b border-red-700">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Aviso Clínico</p>
                                    <h4 className="text-xs font-black uppercase tracking-tighter mt-1">Procedimiento Post-mortem para {selectedPet.name}</h4>
                                </div>
                            </div>
                            <span className="text-[9px] font-black bg-white text-red-600 px-2 py-1 rounded uppercase tracking-widest">Alerta Status</span>
                        </div>
                    )}
                    <form onSubmit={submit} className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                            
                            {/* Columna Izquierda: El flujo solicitado */}
                            <div className="space-y-6">
                                {/* 1. Paciente */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Paciente</label>
                                    {!selectedPet ? (
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="🔍 Buscar mascota o dueño..."
                                                    value={petSearch}
                                                    onChange={(e) => setPetSearch(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 rounded-xl py-2.5 px-5 focus:ring-brand-primary focus:border-brand-primary transition-all font-bold text-sm text-slate-900 dark:text-white"
                                                />
                                                {petResults.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-auto">
                                                        {petResults.map(p => (
                                                            <button
                                                                key={p.id}
                                                                type="button"
                                                                onClick={() => handlePetSelect(p)}
                                                                className="w-full px-5 py-3 flex items-center gap-3 hover:bg-brand-primary/10 dark:hover:bg-slate-700 transition-colors text-left border-b dark:border-gray-700 last:border-0"
                                                            >
                                                                <PetAvatar pet={p} className="w-9 h-9 rounded-full" />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-bold text-sm text-slate-900 dark:text-white leading-none">{p.name}</p>
                                                                        <PetAlertIcons pet={p.pet || p} size="sm" />
                                                                    </div>
                                                                    <p className="text-[10px] text-slate-500 mt-1 uppercase">{p.breed} • {p.owner?.name}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">3+ letras para buscar</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowQuickPetModal(true)}
                                                    className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                                                >
                                                    + Nueva Mascota
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <PetAvatar pet={selectedPet} className="w-12 h-12 rounded-xl border border-brand-primary/20" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-base font-black text-brand-primary truncate leading-none">{selectedPet.name}</h4>
                                                        <PetAlertIcons pet={selectedPet} size="sm" />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                                        {selectedPet.species} • {selectedPet.owner?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPet(null)}
                                                className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                                            >
                                                Cambiar
                                            </button>
                                        </div>
                                    )}
                                    {errors.pet_id && <div className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.pet_id}</div>}
                                </div>

                                {/* 2. Fecha y 3. Riesgo */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Fecha Programada</label>
                                        <input
                                            type="datetime-local"
                                            value={data.scheduled_at}
                                            onChange={e => setData('scheduled_at', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 rounded-xl py-3 px-5 focus:ring-brand-primary focus:border-brand-primary transition-all font-bold text-xs text-slate-900 dark:text-white"
                                            required
                                        />
                                        {errors.scheduled_at && <div className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.scheduled_at}</div>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Riesgo (ASA)</label>
                                        <select
                                            value={data.asa_classification}
                                            onChange={e => setData('asa_classification', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 rounded-xl py-3 px-5 focus:ring-brand-primary focus:border-brand-primary transition-all font-bold text-xs text-slate-900 dark:text-white"
                                        >
                                            <option value="I">ASA I - Saludable</option>
                                            <option value="II">ASA II - Leve</option>
                                            <option value="III">ASA III - Severo</option>
                                            <option value="IV">ASA IV - Amenaza</option>
                                            <option value="V">ASA V - Moribundo</option>
                                            <option value="E">Emergencia</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 4. Tipo de Procedimiento */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Tipo de Procedimiento</label>
                                    <input
                                        type="text"
                                        value={data.surgery_type}
                                        onChange={e => setData('surgery_type', e.target.value)}
                                        placeholder="Ej: Ovariohisterectomía, Limpieza Dental"
                                        className="w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 rounded-xl py-3 px-5 focus:ring-brand-primary focus:border-brand-primary transition-all font-bold text-sm text-slate-900 dark:text-white"
                                        required
                                    />
                                    {errors.surgery_type && <div className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.surgery_type}</div>}
                                </div>
                            </div>

                            {/* Columna Derecha: El resto */}
                            <div className="space-y-6">
                                {/* 5. Cirujano y 6. Anestesiólogo */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Cirujano</label>
                                        <select
                                            value={data.veterinarian_id}
                                            onChange={e => setData('veterinarian_id', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 rounded-xl py-3 px-5 focus:ring-brand-primary focus:border-brand-primary transition-all font-bold text-xs text-slate-900 dark:text-white"
                                            required
                                        >
                                            <option value="">Seleccionar...</option>
                                            {veterinarians.map(vet => (
                                                <option key={vet.id} value={vet.id}>{vet.name} ({roleLabels[vet.role] || vet.role})</option>
                                            ))}
                                        </select>
                                        {errors.veterinarian_id && <div className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.veterinarian_id}</div>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Anestesiólogo</label>
                                        <select
                                            value={data.anesthesiologist_id}
                                            onChange={e => setData('anesthesiologist_id', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 rounded-xl py-3 px-5 focus:ring-brand-primary focus:border-brand-primary transition-all font-bold text-xs text-slate-900 dark:text-white"
                                        >
                                            <option value="">No asignado</option>
                                            {veterinarians.map(vet => (
                                                <option key={vet.id} value={vet.id}>{vet.name} ({roleLabels[vet.role] || vet.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Observaciones</label>
                                    <textarea
                                        value={data.pre_op_notes}
                                        onChange={e => setData('pre_op_notes', e.target.value)}
                                        rows="5"
                                        placeholder="Ayuno, Alergias, Estudios previos..."
                                        className="w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 rounded-2xl py-3 px-5 focus:ring-brand-primary focus:border-brand-primary transition-all font-medium text-sm text-slate-900 dark:text-white resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Medications Section (Full Width) - Added for standardization */}
                        <div className="mt-8 space-y-6">
                            <div className="bg-slate-50/50 dark:bg-slate-900/20 p-6 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                                    Planificación Farmacológica (Programación Clínica)
                                </h4>
                                
                                <MedicationsEditor 
                                    title="Tratamiento Base O Fármacos Programados (Pre-Op)"
                                    medications={data.pre_operative_medications}
                                    products={products.filter(p => !p.is_service)}
                                    canManage={true}
                                    isAlwaysEditing={true}
                                    onChange={(meds) => setData('pre_operative_medications', meds)}
                                />
                            </div>

                            {/* Enviar a Caja */}
                            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-dashed border-emerald-300 dark:border-emerald-700/50">
                                <PendingChargesEditor 
                                    charges={data.pending_charges}
                                    products={products}
                                    onAddCharge={(p) => setData('pending_charges', [...data.pending_charges, p])}
                                    onRemoveCharge={(idx) => setData('pending_charges', data.pending_charges.filter((_, i) => i !== idx))}
                                    onUpdateCharge={(idx, field, value) => {
                                        const newCharges = [...data.pending_charges];
                                        newCharges[idx][field] = value;
                                        setData('pending_charges', newCharges);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Standard, Non-floating footer */}
                        <div className="flex items-center justify-end gap-5 mt-10 pt-6 border-t dark:border-gray-700">
                            <Link
                                href={route('surgeries.index')}
                                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || !data.pet_id}
                                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-50 focus:ring-4 focus:ring-brand-primary/30 shadow-xl shadow-brand-primary/20"
                            >
                                {processing ? 'Procesando...' : 'Confirmar Programación'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal for new pet */}
            <Modal show={showQuickPetModal} onClose={() => setShowQuickPetModal(false)} maxWidth="5xl">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8 border-b dark:border-gray-700 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-2xl">🐾</div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                    Registro de Mascota
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Nuevo Paciente Completo</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setShowQuickPetModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <PetRegistrationForm 
                        initialClients={localClients}
                        onSuccess={handlePetCreated}
                        onCancel={() => setShowQuickPetModal(false)}
                        isModal={true}
                    />
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
