import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/Components/Modal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const roleLabels = {
    admin: 'Adm.',
    veterinarian: 'Vet.',
    surgeon: 'Cirujano',
    specialist: 'Esp.',
    groomer: 'Estilista'
};

export default function Index({ auth, medicalRecords, clients, pets: allPets, veterinarians, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [selectedPet, setSelectedPet] = useState(null);
    const [creationData, setCreationData] = useState({
        start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        veterinarian_id: auth.user.id,
        type: 'consultation',
        duration: 30
    });

    const permissions = auth.permissions || [];
    const can = (permission) => permissions.includes(permission) || auth.user.role === 'admin';

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                route('medical-records.index'),
                { search: searchTerm },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const searchResults = useMemo(() => {
        if (!clientSearch) return { clients: [], pets: [] };
        const query = clientSearch.toLowerCase();
        
        const filteredClients = clients.filter(c => 
            c.name.toUpperCase() !== 'SIN ASIGNAR' && (
                c.name.toLowerCase().includes(query) || 
                (c.phone && c.phone.includes(query))
            )
        ).slice(0, 5);

        const filteredPets = allPets.filter(p => 
            p.name.toLowerCase().includes(query) ||
            (p.owner?.name && p.owner.name.toLowerCase().includes(query))
        ).slice(0, 5);

        return { clients: filteredClients, pets: filteredPets };
    }, [clientSearch, clients, allPets]);

    const handlePetSelect = (pet) => {
        setSelectedPet(pet);
        setClientSearch('');
    };

    const resetModal = () => {
        setShowCreateModal(false);
        setSelectedPet(null);
        setClientSearch('');
        setCreationData({
            start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            veterinarian_id: auth.user.id,
            type: 'consultation',
            duration: 30
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight flex items-center gap-2 uppercase tracking-tight">
                        <img src="/icons/vet-with-cat-svgrepo-com.svg" className="w-6 h-6 icon-adaptive shadow-sm" alt="" />
                        Bitácora Clínica y Consultas
                    </h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 flex items-center gap-2 active:scale-95"
                    >
                        🩺 <span className="hidden sm:inline">Nueva Consulta</span>
                        <span className="sm:hidden">Nuevo</span>
                    </button>
                </div>
            }
        >
            <Head title="Consultas Médicas" />

            <div className="py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#1B2132] overflow-hidden shadow-sm sm:rounded-[2rem] border dark:border-gray-700/50">
                        {/* Filtros */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-gray-900/40 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="w-full relative group max-w-2xl">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 group-focus-within:text-brand-primary transition-colors">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar por paciente, diagnóstico o veterinario..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white dark:bg-[#1B2132] border-slate-200 dark:border-gray-700 hover:border-brand-primary/50 focus:border-brand-primary focus:ring-brand-primary rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all shadow-inner"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-gray-700">Total: {medicalRecords.total}</span>
                            </div>
                        </div>

                        {/* Listado */}
                        <div className="p-0">
                            {medicalRecords.data && medicalRecords.data.length > 0 ? (
                                <ul className="divide-y divide-gray-100 dark:divide-gray-800 text-slate-700 dark:text-slate-300">
                                    {medicalRecords.data.map((record) => (
                                        <li key={record.id} className="group hover:bg-brand-primary transition-all duration-150">
                                            <Link href={route('medical-records.show', record.id)} className="block px-5 py-2.5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center min-w-0 gap-4 flex-1">
                                                        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20 rounded-xl flex items-center justify-center text-xl shadow-inner border dark:border-gray-700 transition-all group-hover:scale-110">
                                                            {record.pet.species === 'Canino' ? '🐕' : '🐈'}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-white truncate uppercase tracking-tight">
                                                                    {record.pet.name}
                                                                </p>
                                                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black border border-slate-200 bg-white text-slate-500 uppercase tracking-[0.15em] group-hover:bg-white group-hover:text-brand-primary group-hover:border-white transition-colors shadow-sm">
                                                                    {record.type === 'consultation' ? 'CONSULTA' : record.type.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-white/80 font-bold uppercase tracking-wide truncate max-w-xl italic">
                                                                <span className="truncate">{record.assessment || 'Sin diagnóstico registrado...'}</span>
                                                                <span className="hidden sm:inline-block w-1 h-1 bg-slate-300 group-hover:bg-white/30 rounded-full"></span>
                                                                <span className="hidden sm:inline-flex items-center gap-1 truncate font-black tracking-widest text-[9px] opacity-70">
                                                                    👨‍⚕️ {record.veterinarian?.name || 'S/V'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-5 ml-4">
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-[9px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-[0.2em] mb-0.5">Atención</p>
                                                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 group-hover:text-white whitespace-nowrap">
                                                                {format(new Date(record.created_at), "d 'de' MMM, yyyy", { locale: es }).toUpperCase()}
                                                            </p>
                                                        </div>
                                                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white border border-white shadow-sm ring-1 ring-white/50">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-20 px-6">
                                    <div className="text-6xl mb-6 opacity-20 transform hover:scale-110 transition-transform">📋</div>
                                    <h3 className="text-xl font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                        {searchTerm ? 'No se encontraron resultados' : 'No hay consultas registradas'}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                                        {searchTerm ? 'Intenta buscar con otros términos.' : 'Registra la primera consulta médica hoy.'}
                                    </p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="inline-block bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20"
                                    >
                                        Iniciar Primera Consulta
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Paginación */}
                        {medicalRecords.total > medicalRecords.per_page && (
                            <div className="p-6 border-t border-slate-200 dark:border-slate-700/50 flex justify-center gap-2">
                                {medicalRecords.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-4 py-2 text-xs font-black rounded-xl border transition-all ${link.active 
                                            ? 'bg-brand-primary border-brand-primary text-white shadow-lg' 
                                            : 'bg-white dark:bg-[#111822] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={showCreateModal} onClose={resetModal} maxWidth="2xl">
                <div className="bg-white dark:bg-[#1B2132] overflow-hidden">
                    <div className="p-8 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">🩺 Nueva Consulta Clínica</h3>
                            <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mt-1">Registra o agenda una atención médica</p>
                        </div>
                        <button onClick={resetModal} className="text-slate-400 hover:text-red-500 transition-colors text-2xl">×</button>
                    </div>
                    
                    <div className="p-8 space-y-6">
                        {!selectedPet ? (
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">1. BUSCAR PACIENTE O DUEÑO</label>
                                <div className="relative group">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">🔍</span>
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Escribe el nombre aquí..."
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-slate-900/50 border-transparent focus:bg-white dark:focus:bg-[#1B2132] border-slate-300 dark:border-slate-700 focus:border-brand-primary focus:ring-brand-primary rounded-2xl pl-14 pr-6 py-4 text-base font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                                    />

                                    {clientSearch && (searchResults.clients.length > 0 || searchResults.pets.length > 0) && (
                                        <div className="relative z-10 w-full mt-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm p-2 max-h-64 overflow-y-auto custom-scrollbar">
                                            {/* Mascotas Primero */}
                                            {searchResults.pets.map(pet => (
                                                <button
                                                    key={`p-${pet.id}`}
                                                    onClick={() => handlePetSelect(pet)}
                                                    className="w-full text-left px-5 py-3 rounded-2xl hover:bg-brand-primary/10 group transition-all flex justify-between items-center border-b border-gray-50 dark:border-gray-800 last:border-0"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{pet.species === 'Canino' ? '🐕' : '🐈'}</span>
                                                        <div>
                                                            <p className="font-black text-slate-900 dark:text-white uppercase text-sm group-hover:text-brand-primary transition-colors">{pet.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Dueño: {pet.owner?.name || 'S/A'}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-lg group-hover:translate-x-1 transition-transform">➡️</span>
                                                </button>
                                            ))}
                                            
                                            {searchResults.clients.length > 0 && (
                                                <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/30 my-1">Busqueda por Dueño</div>
                                            )}

                                            {searchResults.clients.map(client => {
                                                const clientPets = allPets.filter(p => p.user_id === client.id);
                                                return clientPets.map(pet => (
                                                    <button
                                                        key={`cp-${pet.id}`}
                                                        onClick={() => handlePetSelect(pet)}
                                                        className="w-full text-left px-5 py-3 rounded-2xl hover:bg-brand-primary/10 group transition-all flex justify-between items-center border-b border-gray-50 dark:border-gray-800 last:border-0"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl">{pet.species === 'Canino' ? '🐕' : '🐈'}</span>
                                                            <div>
                                                                <p className="font-black text-slate-900 dark:text-white uppercase text-sm group-hover:text-brand-primary transition-colors">{pet.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Dueño: {client.name}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-lg group-hover:translate-x-1 transition-transform">➡️</span>
                                                    </button>
                                                ));
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                                {/* Paciente Seleccionado */}
                                <div className="flex items-center justify-between bg-brand-primary/10 border border-brand-primary/20 rounded-3xl px-8 py-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-sm border dark:border-slate-700">
                                            {selectedPet.species === 'Canino' ? '🐕' : '🐈'}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">Paciente Seleccionado</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight">{selectedPet.name}</p>
                                            <p className="text-xs text-slate-500 font-bold uppercase">{selectedPet.owner?.name || 'Sin dueño'}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedPet(null)} className="text-[10px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border dark:border-slate-700 transition">Cambiar</button>
                                </div>

                                {/* Formulario */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha y Hora</label>
                                        <input
                                            type="datetime-local"
                                            value={creationData.start_time}
                                            onChange={e => setCreationData({...creationData, start_time: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-brand-primary focus:ring-brand-primary rounded-2xl py-3 px-4 font-bold text-slate-700 dark:text-slate-300"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Atención</label>
                                        <select
                                            value={creationData.type}
                                            onChange={e => setCreationData({...creationData, type: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-brand-primary focus:ring-brand-primary rounded-2xl py-3 px-4 font-bold text-slate-700 dark:text-slate-300"
                                        >
                                            <option value="consultation">🩺 Consulta General</option>
                                            <option value="follow-up">📋 Seguimiento</option>
                                            <option value="emergency">🚨 Urgencia</option>
                                            <option value="specialty">🏥 Especialidad</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Atendido por</label>
                                        <select
                                            value={creationData.veterinarian_id}
                                            onChange={e => setCreationData({...creationData, veterinarian_id: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-brand-primary focus:ring-brand-primary rounded-2xl py-3 px-4 font-bold text-slate-700 dark:text-slate-300"
                                        >
                                            {veterinarians.map(vet => (
                                                <option key={vet.id} value={vet.id}>{vet.name} ({roleLabels[vet.role] || vet.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex flex-wrap justify-end gap-4">
                        <button
                            onClick={resetModal}
                            className="px-6 py-3 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition order-last sm:order-first"
                        >
                            Cancelar
                        </button>
                        
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    if (!selectedPet) return;
                                    router.post(route('appointments.store'), {
                                        pet_id: selectedPet.id,
                                        veterinarian_id: creationData.veterinarian_id,
                                        start_time: creationData.start_time,
                                        type: creationData.type,
                                        duration: creationData.duration,
                                        reason: 'Cita programada desde módulo de historial'
                                    }, {
                                        onSuccess: () => resetModal()
                                    });
                                }}
                                disabled={!selectedPet}
                                className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition border-2 ${
                                    selectedPet 
                                    ? 'border-brand-primary text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10' 
                                    : 'border-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                📅 Programar Cita
                            </button>

                            <button
                                onClick={() => {
                                    if (!selectedPet) return;
                                    router.get(route('medical-records.create', selectedPet.id), {
                                        date: creationData.start_time,
                                        vet_id: creationData.veterinarian_id,
                                        type: creationData.type
                                    });
                                }}
                                disabled={!selectedPet}
                                className={`flex-1 sm:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shadow-lg ${
                                    selectedPet 
                                    ? 'bg-brand-primary text-white hover:opacity-90 shadow-brand-primary/20' 
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                🩺 Iniciar Consulta Ahora
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
