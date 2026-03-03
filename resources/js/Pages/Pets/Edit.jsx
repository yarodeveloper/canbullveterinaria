import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ auth, pet, clients }) {
    const [breeds, setBreeds] = useState([]);
    const [selectedSize, setSelectedSize] = useState('');
    const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // Required for multipart/form-data with Files in PUT requests
        photo: null,
        name: pet.name || '',
        species: pet.species || '',
        breed: pet.breed || '',
        gender: pet.gender || 'unknown',
        dob: pet.dob || '',
        color: pet.color || '',
        microchip: pet.microchip || '',
        weight: pet.weight || '',
        notes: pet.notes || '',
        user_id: pet.user_id || '',
        is_aggressive: !!pet.is_aggressive,
        allergies: pet.allergies || '',
        chronic_conditions: pet.chronic_conditions || '',
    });

    const [photoPreview, setPhotoPreview] = useState(pet.photo_path ? `/storage/${pet.photo_path}` : null);

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
            weight: breedObj.adult_weight ? (prev.weight || breedObj.adult_weight.match(/\d+/)?.[0]) : prev.weight,
        }));
        if (breedObj.notes && !data.notes.includes(breedObj.notes)) {
            setData('notes', data.notes ? `${data.notes}\nInfo Raza: ${breedObj.notes}` : `Info Raza: ${breedObj.notes}`);
        }
        setBreeds([]);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('pets.update', pet.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Editar Mascota: {pet.name}</h2>}
        >
            <Head title={`Editar ${pet.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div className="flex flex-col lg:flex-row gap-10">
                                {/* Left Side: Photo Sidebar */}
                                <div className="w-full lg:w-48 shrink-0 flex flex-col items-center">
                                    <div className="sticky top-6">
                                        <div className="relative group">
                                            <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-brand-primary/20 bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-all group-hover:border-brand-purple shadow-inner">
                                                {photoPreview ? (
                                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <span className="text-5xl">📸</span>
                                                        <p className="text-[10px] uppercase font-black text-gray-400 mt-2 tracking-widest">Cambiar Foto</p>
                                                    </div>
                                                )}
                                            </div>
                                            <label
                                                htmlFor="photo-upload"
                                                className="absolute -bottom-2 -right-2 bg-brand-purple text-white p-3 rounded-2xl cursor-pointer shadow-xl hover:bg-brand-purple-light transition-all hover:scale-110 active:scale-95"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            </label>
                                            <input
                                                id="photo-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                            />
                                        </div>
                                        {errors.photo && <div className="text-red-500 text-[10px] mt-3 font-black uppercase text-center">{errors.photo}</div>}
                                    </div>
                                </div>

                                {/* Right Side: Form Content */}
                                <div className="flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        {/* Informacion Basica */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium border-b dark:border-gray-700 pb-2">Información Básica</h3>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Paciente *</label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    required
                                                />
                                                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                            </div>

                                            <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Especie y Raza</label>

                                                <div className="flex gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSpeciesChange('Canino')}
                                                        className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${data.species === 'Canino' ? 'border-brand-primary bg-indigo-50 dark:bg-brand-primary/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-500'}`}
                                                    >
                                                        <span className="text-2xl">🐕</span>
                                                        <span className="font-semibold text-xs uppercase tracking-wider">Canino</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSpeciesChange('Felino')}
                                                        className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${data.species === 'Felino' ? 'border-brand-primary bg-indigo-50 dark:bg-brand-primary/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-500'}`}
                                                    >
                                                        <span className="text-2xl">🐈</span>
                                                        <span className="font-semibold text-xs uppercase tracking-wider">Felino</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSpeciesChange('Otros')}
                                                        className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${data.species === 'Otros' ? 'border-brand-primary bg-indigo-50 dark:bg-brand-primary/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-500'}`}
                                                    >
                                                        <span className="text-2xl">🐢</span>
                                                        <span className="font-semibold text-xs uppercase tracking-wider">Otros</span>
                                                    </button>
                                                </div>

                                                {data.species && (
                                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                        {data.species !== 'Otros' && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-medium text-gray-500">Filtrar por tamaño:</span>
                                                                <div className="flex gap-2">
                                                                    {['Pequeño', 'Mediano', 'Grande'].map(size => (
                                                                        <button
                                                                            key={size}
                                                                            type="button"
                                                                            onClick={() => handleSizeFilter(size)}
                                                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedSize === size ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50'}`}
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
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                                placeholder={data.species === 'Otros' ? "Ej: Hurón, Conejo..." : "Buscar raza..."}
                                                                autoComplete="off"
                                                            />
                                                            {breeds.length > 0 && (
                                                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                                                                    {breeds.map(b => (
                                                                        <button
                                                                            key={b.id}
                                                                            type="button"
                                                                            onClick={() => handleBreedSelect(b)}
                                                                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-brand-primary/30 flex justify-between items-center"
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
                                                <div className="mt-1 flex gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('gender', 'male')}
                                                        className={`flex-1 py-2 rounded-md border transition-all ${data.gender === 'male' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-200' : 'border-gray-300 dark:border-gray-700 text-gray-500'}`}
                                                    >
                                                        Macho
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('gender', 'female')}
                                                        className={`flex-1 py-2 rounded-md border transition-all ${data.gender === 'female' ? 'bg-pink-50 border-pink-500 text-pink-700 ring-2 ring- pink-200' : 'border-gray-300 dark:border-gray-700 text-gray-500'}`}
                                                    >
                                                        Hembra
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('gender', 'unknown')}
                                                        className={`flex-1 py-2 rounded-md border transition-all ${data.gender === 'unknown' ? 'bg-gray-100 border-gray-500 text-gray-700' : 'border-gray-300 dark:border-gray-700 text-gray-500'}`}
                                                    >
                                                        Desconocido
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dueño / Cliente *</label>
                                                <select
                                                    value={data.user_id}
                                                    onChange={e => setData('user_id', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    required
                                                >
                                                    {clients.map(client => (
                                                        <option key={client.id} value={client.id}>{client.name}</option>
                                                    ))}
                                                </select>
                                                {errors.user_id && <div className="text-red-500 text-xs mt-1">{errors.user_id}</div>}
                                            </div>
                                        </div>

                                        {/* Detalles Clinicos */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium border-b dark:border-gray-700 pb-2">Detalles Clínicos</h3>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso (kg)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={data.weight}
                                                        onChange={e => setData('weight', e.target.value)}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                                                    <input
                                                        type="text"
                                                        value={data.color}
                                                        onChange={e => setData('color', e.target.value)}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 italic">Notas Internas</label>
                                                <textarea
                                                    value={data.notes}
                                                    onChange={e => setData('notes', e.target.value)}
                                                    rows="2"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                                                ></textarea>
                                            </div>

                                            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg space-y-3">
                                                <h4 className="text-xs font-bold text-red-700 uppercase">Alertas Clínicas</h4>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="is_aggressive"
                                                        checked={data.is_aggressive}
                                                        onChange={e => setData('is_aggressive', e.target.checked)}
                                                        className="rounded border-gray-300 text-brand-primary shadow-sm focus:ring-brand-primary"
                                                    />
                                                    <label htmlFor="is_aggressive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">¿Es Agresivo?</label>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">Alergias Conocidas</label>
                                                    <input
                                                        type="text"
                                                        value={data.allergies}
                                                        onChange={e => setData('allergies', e.target.value)}
                                                        className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">Condiciones Crónicas</label>
                                                    <input
                                                        type="text"
                                                        value={data.chronic_conditions}
                                                        onChange={e => setData('chronic_conditions', e.target.value)}
                                                        className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-end space-x-4">
                                    <Link
                                        href={route('pets.show', pet.id)}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 underline"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-brand-primary text-white rounded-md font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 transition"
                                    >
                                        Actualizar Mascota
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
