import { useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import axios from 'axios';
import BehaviorSelector from '@/Components/BehaviorSelector';

export default function PetRegistrationForm({ initialClients, onSuccess, onCancel, isModal = false, pet = null }) {
    const [similarPets, setSimilarPets] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [selectedSize, setSelectedSize] = useState('');
    const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);

    // Quick Client Modal State
    const [showClientModal, setShowClientModal] = useState(false);
    const [localClients, setLocalClients] = useState(initialClients || []);
    const [isSavingClient, setIsSavingClient] = useState(false);
    const [clientErrors, setClientErrors] = useState({});
    const [clientForm, setClientForm] = useState({
        name: '',
        email: '',
        phone: '',
        behavior_profile: '',
    });

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        _method: pet ? 'PUT' : 'POST',
        photo: null,
        name: pet?.name || '',
        species: pet?.species || '',
        breed: pet?.breed || '',
        gender: pet?.gender || 'unknown',
        dob: pet?.dob || '',
        color: pet?.color || '',
        microchip: pet?.microchip || '',
        weight: pet?.weight || '',
        notes: pet?.notes || '',
        user_id: pet?.user_id || (localClients.find(c => c.name === '<< Sin Asignar >>')?.id || ''),
        is_aggressive: !!pet?.is_aggressive,
        allergies: pet?.allergies || '',
        chronic_conditions: pet?.chronic_conditions || '',
    });

    // Auto-select Sin Asignar if list changes and nothing selected
    useEffect(() => {
        if (!data.user_id && localClients.length > 0) {
            const unassigned = localClients.find(c => c.name === '<< Sin Asignar >>');
            if (unassigned) setData('user_id', unassigned.id);
        }
    }, [localClients]);

    const [photoPreview, setPhotoPreview] = useState(pet?.photo_path ? `/storage/${pet.photo_path}` : null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchBreeds = (q = '', size = '', species = data.species) => {
        if (!species) return;
        setIsLoadingBreeds(true);
        fetch(route('breeds.search', { q, size, species }))
            .then(res => res.json())
            .then(json => {
                setBreeds(json);
                setIsLoadingBreeds(false);
            });
    };

    const handleSpeciesChange = (species) => {
        setData('species', species);
        fetchBreeds('', '', species);
    };

    const handleSizeFilter = (size) => {
        const newSize = selectedSize === size ? '' : size;
        setSelectedSize(newSize);
        fetchBreeds('', newSize);
    };

    const handleBreedSelect = (breedObj) => {
        setData(prev => ({
            ...prev,
            breed: breedObj.name,
            weight: breedObj.adult_weight ? (breedObj.adult_weight.match(/\d+/)?.[0] || prev.weight) : prev.weight,
        }));
        if (breedObj.notes) {
            setData('notes', data.notes ? `${data.notes}\nInfo Raza: ${breedObj.notes}` : `Info Raza: ${breedObj.notes}`);
        }
        setBreeds([]);
    };

    const handleQuickClientSubmit = async (e) => {
        e.preventDefault();
        setIsSavingClient(true);
        setClientErrors({});

        try {
            const response = await axios.post(route('clients.store'), clientForm);
            const newClient = response.data;

            // Add to list and select it
            setLocalClients([newClient, ...localClients]);
            setData('user_id', newClient.id);

            // Reset and close
            setClientForm({ name: '', email: '', phone: '', behavior_profile: '' });
            setShowClientModal(false);
        } catch (error) {
            if (error.response?.status === 422) {
                setClientErrors(error.response.data.errors);
            } else {
                alert('Ocurrió un error al guardar el cliente.');
            }
        } finally {
            setIsSavingClient(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        clearErrors();
        
        if (isModal) {
            // For modal, we use axios to handle JSON response properly
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    // Handle boolean values for FormData
                    if (typeof data[key] === 'boolean') {
                        formData.append(key, data[key] ? '1' : '0');
                    } else {
                        formData.append(key, data[key]);
                    }
                }
            });

            const actionRoute = pet ? route('pets.update', pet.id) : route('pets.store');
            axios.post(actionRoute, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' }
            })
            .then(res => {
                if (onSuccess) onSuccess(res.data.pet);
            })
            .catch(err => {
                if (err.response?.status === 422) {
                    setError(err.response.data.errors);
                } else {
                    alert('Error al guardar la mascota.');
                }
            });
        } else {
            const actionRoute = pet ? route('pets.update', pet.id) : route('pets.store');
            post(actionRoute);
        }
    };

    return (
        <div className={isModal ? "" : "p-6"}>
            <form onSubmit={submit}>
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left Side: Photo Sidebar */}
                    <div className="w-full lg:w-48 shrink-0 flex flex-col items-center">
                        <div className={isModal ? "" : "sticky top-6"}>
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-brand-primary/20 bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-all group-hover:border-brand-primary shadow-inner">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <span className="text-5xl">📸</span>
                                            <p className="text-[10px] uppercase font-black text-gray-400 mt-2 tracking-widest">Subir Foto</p>
                                        </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="photo-upload-modal"
                                    className="absolute -bottom-2 -right-2 bg-brand-primary text-white p-3 rounded-2xl cursor-pointer shadow-xl hover:opacity-90 transition-all hover:scale-110 active:scale-95"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </label>
                                <input
                                    id="photo-upload-modal"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                            </div>
                            {errors.photo && <div className="text-red-500 text-[10px] mt-3 font-black uppercase text-center">{errors.photo}</div>}

                            {!isModal && (
                                <div className="mt-6 p-4 bg-brand-primary/10 dark:bg-brand-primary/10 rounded-2xl border border-indigo-100 dark:border-brand-primary/30">
                                    <p className="text-[10px] font-black text-brand-primary dark:text-brand-primary uppercase tracking-widest mb-1 text-center">Tip Profesional</p>
                                    <p className="text-[9px] text-brand-primary dark:text-brand-primary text-center leading-relaxed">
                                        Una foto clara ayuda a reconocer al paciente al instante en recepción.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Form Content */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Informacion Basica */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] border-b dark:border-gray-700/50 pb-2 mb-4">Información Identidad</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Paciente *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => {
                                            setData('name', e.target.value);
                                            if (e.target.value.length > 2) {
                                                fetch(route('pets.search', { q: e.target.value }))
                                                    .then(res => res.json())
                                                    .then(json => setSimilarPets(json));
                                            } else {
                                                setSimilarPets([]);
                                            }
                                        }}
                                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        required
                                    />
                                    {similarPets.length > 0 && (
                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                            ⚠️ <strong>Posibles Duplicados:</strong>
                                            <ul className="mt-1 list-disc ml-4">
                                                {similarPets.map(p => (
                                                    <li key={p.id}>
                                                        {p.name} ({p.species}) - Dueño: {p.owner?.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                </div>

                                <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Especie y Raza</label>

                                    <div className="flex gap-3">
                                        {['Canino', 'Felino', 'Otros'].map(species => (
                                            <button
                                                key={species}
                                                type="button"
                                                onClick={() => handleSpeciesChange(species)}
                                                className={`flex-1 py-2 px-1 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${data.species === species ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 text-gray-500'}`}
                                            >
                                                <span className="text-xl">{species === 'Canino' ? '🐕' : species === 'Felino' ? '🐈' : '🐢'}</span>
                                                <span className="font-bold text-[10px] uppercase tracking-wider">{species}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {data.species && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                            {data.species !== 'Otros' && (
                                                <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-2 mt-1 mb-2">
                                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Filtrar Tamaño:</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {['Pequeño', 'Mediano', 'Grande'].map(size => (
                                                            <button
                                                                key={size}
                                                                type="button"
                                                                onClick={() => handleSizeFilter(size)}
                                                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all ${selectedSize === size ? 'bg-brand-primary border-brand-primary text-white shadow-md' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50'}`}
                                                            >
                                                                {size}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="relative">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {data.species === 'Otros' ? 'Especie / Raza' : 'Raza'} *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.breed}
                                                    onChange={e => {
                                                        setData('breed', e.target.value);
                                                        fetchBreeds(e.target.value, selectedSize);
                                                    }}
                                                    onFocus={() => fetchBreeds(data.breed, selectedSize)}
                                                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    placeholder={data.species === 'Otros' ? "Ej: Hurón, Conejo, Loro..." : "Buscar raza..."}
                                                    autoComplete="off"
                                                />
                                                {breeds.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto">
                                                        {breeds.map(b => (
                                                            <button
                                                                key={b.id}
                                                                type="button"
                                                                onClick={() => handleBreedSelect(b)}
                                                                className="w-full text-left px-4 py-2 hover:bg-brand-primary/10 dark:hover:bg-brand-primary/30 flex justify-between items-center"
                                                            >
                                                                <div>
                                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{b.name}</span>
                                                                    {b.size && <span className="ml-2 text-xs text-gray-500 uppercase">{b.size}</span>}
                                                                </div>
                                                                <span className="text-xs text-gray-400 italic">{b.adult_weight}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Género</label>
                                    <div className="mt-1 flex gap-2">
                                        {[
                                            {id: 'male', label: 'Macho', color: 'blue'},
                                            {id: 'female', label: 'Hembra', color: 'pink'},
                                            {id: 'unknown', label: 'Desconocido', color: 'gray'}
                                        ].map(g => (
                                            <button
                                                key={g.id}
                                                type="button"
                                                onClick={() => setData('gender', g.id)}
                                                className={`flex-1 py-2 rounded-xl border transition-all text-xs font-bold ${data.gender === g.id ? 
                                                    `bg-${g.id === 'male' ? 'blue' : g.id === 'female' ? 'pink' : 'gray'}-50 border-${g.id === 'male' ? 'blue' : g.id === 'female' ? 'pink' : 'gray'}-500 text-${g.id === 'male' ? 'blue' : g.id === 'female' ? 'pink' : 'gray'}-700 ring-2 ring-${g.id === 'male' ? 'blue' : g.id === 'female' ? 'pink' : 'gray'}-200` 
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                            >
                                                {g.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dueño / Cliente *</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowClientModal(true)}
                                            className="text-[10px] font-black text-brand-primary hover:underline uppercase"
                                        >
                                            + Nuevo Cliente
                                        </button>
                                    </div>
                                    <select
                                        value={data.user_id}
                                        onChange={e => setData('user_id', e.target.value)}
                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        required
                                    >
                                        <option value="">Seleccionar Cliente...</option>
                                        {localClients.map(client => (
                                            <option key={client.id} value={client.id}>{client.name}</option>
                                        ))}
                                    </select>
                                    {errors.user_id && <div className="text-red-500 text-xs mt-1">{errors.user_id}</div>}
                                </div>
                            </div>

                            {/* Detalles Clinicos */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] border-b dark:border-gray-700/50 pb-2 mb-4">Ficha Clínica y Salud</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        value={data.dob}
                                        onChange={e => setData('dob', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Peso (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.weight}
                                            onChange={e => setData('weight', e.target.value)}
                                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Color / Manto</label>
                                        <input
                                            type="text"
                                            value={data.color}
                                            onChange={e => setData('color', e.target.value)}
                                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            placeholder="Ej: Negro/Blanco"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Microchip / ID</label>
                                        <input
                                            type="text"
                                            value={data.microchip}
                                            onChange={e => setData('microchip', e.target.value)}
                                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            placeholder="Opcional"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 italic">Notas Internas</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        rows="2"
                                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                                    ></textarea>
                                </div>

                                <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl space-y-4 border border-red-100 dark:border-red-900/20">
                                    <h4 className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest">Alertas Clínicas</h4>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_aggressive_modal"
                                            checked={data.is_aggressive}
                                            onChange={e => setData('is_aggressive', e.target.checked)}
                                            className="rounded border-gray-300 text-brand-primary shadow-sm focus:ring-brand-primary"
                                        />
                                        <label htmlFor="is_aggressive_modal" className="ml-2 block text-sm font-bold text-gray-700 dark:text-gray-300">¿Es Agresivo?</label>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Alergias Conocidas</label>
                                            <input
                                                type="text"
                                                value={data.allergies}
                                                onChange={e => setData('allergies', e.target.value)}
                                                className="w-full bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl py-2 px-4 focus:ring-brand-primary text-sm font-medium"
                                                placeholder="Ej: Penicilina, Pollo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Condiciones Crónicas</label>
                                            <input
                                                type="text"
                                                value={data.chronic_conditions}
                                                onChange={e => setData('chronic_conditions', e.target.value)}
                                                className="w-full bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl py-2 px-4 focus:ring-brand-primary text-sm font-medium"
                                                placeholder="Ej: Cardiopatía"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-end gap-4 pt-6 border-t dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-10 py-3 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-primary/90 focus:outline-none focus:ring-4 focus:ring-brand-primary/20 disabled:opacity-50 transition shadow-xl shadow-brand-primary/20"
                    >
                        {processing ? 'Guardando...' : (pet ? 'Actualizar Mascota' : 'Registrar Mascota')}
                    </button>
                </div>
            </form>

            {/* Quick Client Modal */}
            <Modal show={showClientModal} onClose={() => setShowClientModal(false)} maxWidth="md">
                <form onSubmit={handleQuickClientSubmit} className="p-10">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter">
                        Registro Rápido de Cliente
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="client_name_modal" value="Nombre Completo *" />
                            <TextInput
                                id="client_name_modal"
                                value={clientForm.name}
                                onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={clientErrors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="client_email_modal" value="Correo Electrónico (Opcional)" />
                            <TextInput
                                id="client_email_modal"
                                type="email"
                                value={clientForm.email}
                                onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                                className="mt-1 block w-full"
                            />
                            <InputError message={clientErrors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="client_phone_modal" value="Teléfono" />
                            <TextInput
                                id="client_phone_modal"
                                value={clientForm.phone}
                                onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                                className="mt-1 block w-full"
                            />
                            <InputError message={clientErrors.phone} className="mt-2" />
                        </div>

                        <div className="mt-4">
                             <BehaviorSelector
                                value={clientForm.behavior_profile}
                                onChange={(val) => setClientForm({ ...clientForm, behavior_profile: val })}
                            />
                        </div>

                        <div className="mt-10 flex justify-end gap-4">
                            <SecondaryButton onClick={() => setShowClientModal(false)} disabled={isSavingClient} type="button">
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton disabled={isSavingClient} className="bg-brand-primary">
                                {isSavingClient ? 'Guardando...' : 'Crear y Seleccionar'}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
