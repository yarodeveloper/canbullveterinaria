import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import MedicationsEditor from '@/Components/MedicationsEditor';
import PendingChargesEditor from '@/Components/PendingChargesEditor';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import PetAvatar from '@/Components/PetAvatar';
import PetRegistrationForm from '@/Components/PetRegistrationForm';
import PetAlertIcons from '@/Components/PetAlertIcons';

export default function Create({ auth, pet: initialPet, clients: initialClients, appointment_id, products = [] }) {
    const [selectedPet, setSelectedPet] = useState(initialPet);
    const [petSearch, setPetSearch] = useState('');
    const [petResults, setPetResults] = useState([]);
    const [showQuickPetModal, setShowQuickPetModal] = useState(false);
    const [localClients, setLocalClients] = useState(initialClients);

    const { data, setData, post, processing, errors } = useForm({
        appointment_id: appointment_id || '',
        pet_id: initialPet ? initialPet.id : '',
        reason: '',
        initial_weight: initialPet ? initialPet.weight : '',
        admission_date: new Date().toISOString().slice(0, 16),
        medications: [],
        pending_charges: [],
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
        setData(prev => ({
            ...prev,
            pet_id: pet.id,
            initial_weight: pet.weight || '',
        }));
        setPetSearch('');
        setPetResults([]);
    };

    const handlePetCreated = (pet) => {
        handlePetSelect(pet);
        setShowQuickPetModal(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('hospitalizations.store'));
    };

    const addReasonTag = (tag) => {
        const separator = data.reason && !data.reason.endsWith(' ') ? ', ' : '';
        setData('reason', data.reason + separator + tag);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Iniciar Internamiento" />

            <div className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-[#111822] flex items-center justify-center py-8 px-4 transition-colors">
                <div className="w-full max-w-5xl bg-white dark:bg-[#1B2132] rounded-[1.5rem] shadow-2xl border border-slate-200 dark:border-slate-700/50 font-sans">

                    {/* Compact Header */}
                    <div className="px-8 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-primary/10 text-brand-primary text-xl">
                                🏥
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Nueva Hospitalización</span>
                        </div>
                        <Link href={route('hospitalizations.index')} className="text-slate-400 hover:text-red-500 transition group focus:outline-none">
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </Link>
                    </div>

                    {selectedPet?.status === 'deceased' && (
                        <div className="bg-red-600 text-white px-8 py-4 flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Atención: Paciente Fallecido</p>
                                    <p className="text-sm font-black uppercase tracking-tighter shrink-0">Iniciando Internamiento Post-mortem para {selectedPet.name}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black border border-white px-3 py-1 rounded-full uppercase tracking-widest">Modo Histórico</span>
                        </div>
                    )}
                    <form onSubmit={submit} className="p-8 pt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                            {/* Columna Izquierda: Paciente y Datos Básicos */}
                            <div className="space-y-6">
                                <div>
                                    {!selectedPet ? (
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                                                Seleccionar Paciente
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-50 dark:bg-[#111822] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white px-5 py-2.5 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all font-semibold"
                                                    placeholder="Buscar mascota..."
                                                    value={petSearch}
                                                    onChange={(e) => setPetSearch(e.target.value)}
                                                />
                                                {petResults.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-[#1B2132] border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-2xl overflow-hidden">
                                                        {petResults.map(p => (
                                                            <button
                                                                key={p.id}
                                                                type="button"
                                                                onClick={() => handlePetSelect(p)}
                                                                className="w-full px-5 py-3 flex items-center gap-4 hover:bg-brand-primary/10 dark:hover:bg-slate-800 transition-colors text-left"
                                                            >
                                                                <PetAvatar pet={p} className="w-9 h-9 rounded-full border border-slate-200" />
                                                                 <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-bold text-sm text-slate-900 dark:text-white leading-none">{p.pet?.name || p.name}</p>
                                                                        <PetAlertIcons pet={p.pet || p} size="sm" />
                                                                    </div>
                                                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight mt-1 truncate">
                                                                        {(p.pet?.species || p.species)} • {(p.pet?.breed || p.breed) || 'Sin Raza'} • {p.owner_name || p.owner?.name}
                                                                    </p>
                                                                </div>
                                                                <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-widest border shrink-0 ml-3 ${(p.pet?.species || p.species) === 'Canino' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-amber-100 text-amber-600 border-amber-200'}`}>
                                                                    {(p.pet?.species || p.species) || 'Mascota'}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-slate-400 uppercase">3+ letras para buscar</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowQuickPetModal(true)}
                                                    className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                                                >
                                                    + Nueva Mascota
                                                </button>
                                            </div>
                                            {errors.pet_id && <p className="text-red-500 text-[10px] font-bold mt-1 text-center uppercase">{errors.pet_id}</p>}
                                        </div>
                                    ) : (
                                        <div className="bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <PetAvatar pet={selectedPet} className="w-12 h-12 rounded-xl border-2 border-brand-primary/30" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-base font-black text-brand-primary truncate">{selectedPet.name}</h3>
                                                        <PetAlertIcons pet={selectedPet} size="sm" />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">
                                                        {selectedPet.species} • {selectedPet.breed || 'Mestizo'}
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
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                            Peso (KG)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-slate-50 dark:bg-[#111822] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white px-5 py-2.5 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all font-semibold"
                                                placeholder="00.00"
                                                value={data.initial_weight}
                                                onChange={(e) => setData('initial_weight', e.target.value)}
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">
                                                kg
                                            </span>
                                        </div>
                                        {errors.initial_weight && <p className="text-red-500 dark:text-red-400 text-[10px] font-bold mt-2 uppercase">{errors.initial_weight}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                            Fecha y Hora
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className="w-full bg-slate-50 dark:bg-[#111822] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white px-5 py-2.5 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all font-semibold [color-scheme:light] dark:[color-scheme:dark] block text-xs"
                                            value={data.admission_date}
                                            onChange={(e) => setData('admission_date', e.target.value)}
                                            required
                                        />
                                        {errors.admission_date && <p className="text-red-500 dark:text-red-400 text-[10px] font-bold mt-2 uppercase">{errors.admission_date}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Columna Derecha: Motivo y Tags */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                        Motivo del Internamiento
                                    </label>
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-[#111822] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white px-5 py-3 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all text-sm min-h-[120px] mb-3 font-medium resize-y"
                                        placeholder="Describa el motivo..."
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        required
                                    ></textarea>
                                    {errors.reason && <p className="text-red-500 dark:text-red-400 text-[10px] font-bold uppercase">{errors.reason}</p>}

                                    <div className="flex flex-wrap gap-2">
                                        {['Cirugía', 'Monitoreo', 'Tratamiento IV', 'Observación'].map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => addReasonTag(tag)}
                                                className="px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-600 bg-transparent text-slate-500 dark:text-slate-400 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white border-transparent transition-all font-bold text-[10px] uppercase tracking-wider"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Medications Section (Full Width) */}
                            <div className="lg:col-span-2 mt-4">
                                <MedicationsEditor 
                                    title="Tratamiento Base O Fármacos Programados"
                                    medications={data.medications}
                                    products={products.filter(p => !p.is_service)}
                                    canManage={true}
                                    isAlwaysEditing={true}
                                    onChange={(meds) => setData('medications', meds)}
                                    petWeight={data.initial_weight || initialPet?.weight || selectedPet?.weight}
                                />
                            </div>

                            {/* Enviar a Caja */}
                            <div className="lg:col-span-2">
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

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-end mt-8 gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                            <Link
                                href={route('hospitalizations.index')}
                                className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || !selectedPet}
                                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-50 focus:ring-4 focus:ring-brand-primary/30 shadow-lg shadow-brand-primary/20"
                            >
                                Confirmar Ingreso
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Full Pet Modal */}
            <Modal show={showQuickPetModal} onClose={() => setShowQuickPetModal(false)} maxWidth="5xl">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">
                            Registro Completo de Mascota
                        </h2>
                        <button type="button" onClick={() => setShowQuickPetModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
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
