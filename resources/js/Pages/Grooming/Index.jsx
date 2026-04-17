import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/Components/Modal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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

export default function Index({ auth, groomingOrders, clients, pets: allPets, groomers, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [selectedPet, setSelectedPet] = useState(null);
    const [creationData, setCreationData] = useState({
        appointment_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        groomer_id: auth.user.id,
    });

    const permissions = auth.permissions || [];
    const can = (permission) => permissions.includes(permission) || auth.user.role === 'admin';

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                route('grooming-orders.index'),
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
            c.name.toLowerCase().includes(query) || 
            (c.phone && c.phone.includes(query))
        ).slice(0, 5);

        const filteredPets = allPets.filter(p => 
            p.name.toLowerCase().includes(query) ||
            (p.owner?.name && p.owner.name.toLowerCase().includes(query)) ||
            (p.breed && p.breed.toLowerCase().includes(query))
        ).slice(0, 10);

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
            appointment_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            groomer_id: auth.user.id,
        });
    };

    const statusBadge = (status) => {
        const map = {
            'pending': { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 border-amber-200' },
            'working': { label: 'En Proceso', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            'completed': { label: 'Completado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
            'cancelled': { label: 'Cancelado', color: 'bg-rose-100 text-rose-700 border-rose-200' },
        };
        const current = map[status] || map.pending;
        return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest ${current.color}`}>{current.label}</span>;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                        <img src="/icons/scissors-svgrepo-com.svg" className="w-6 h-6 icon-adaptive" alt="" />
                        Estética y Grooming
                    </h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 flex items-center gap-2"
                    >
                        <img src="/icons/scissors-svgrepo-com.svg" className="w-3.5 h-3.5 invert brightness-0" alt="" />
                        <span className="hidden sm:inline">Nueva Orden</span>
                        <span className="sm:hidden">Nuevo</span>
                    </button>
                </div>
            }
        >
            <Head title="Estética y Grooming" />

            <div className="py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#1B2132] overflow-hidden shadow-sm sm:rounded-[2rem] border dark:border-gray-700">
                        {/* Filtros */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="w-full relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-brand-primary transition-colors text-sm">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar paciente, dueño, folio o notas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white dark:bg-[#1B2132] border-slate-200 dark:border-slate-700 hover:border-brand-primary/50 focus:border-brand-primary focus:ring-brand-primary rounded-xl pl-11 pr-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shadow-sm placeholder-slate-400"
                                />
                            </div>
                        </div>

                        {/* Listado */}
                        <div className="p-0">
                            {groomingOrders.data && groomingOrders.data.length > 0 ? (
                                <ul className="divide-y divide-gray-100 dark:divide-gray-700 text-slate-700 dark:text-slate-300">
                                    {groomingOrders.data.map((order) => (
                                        <li key={order.id} className="group hover:bg-brand-primary transition-colors">
                                            <Link href={route('grooming-orders.show', order.id)} className="block px-6 py-2.5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center min-w-0 gap-4 flex-1">
                                                        <div className="flex-shrink-0 w-9 h-9 bg-white/10 dark:bg-gray-800 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform shadow-inner border dark:border-gray-700">
                                                            {order.pet.species === 'Canino' ? '🐕' : '🐈'}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-white truncate uppercase tracking-tight">
                                                                    {order.pet.name}
                                                                </p>
                                                                {statusBadge(order.status)}
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-white/80 font-bold uppercase tracking-widest truncate max-w-2xl">
                                                                <span>FOLIO: {order.folio || `#${order.id}`}</span>
                                                                <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 group-hover:bg-white/30 rounded-full"></span>
                                                                <span className="hidden sm:inline-flex items-center gap-1 truncate font-black text-brand-primary group-hover:text-white">
                                                                    {order.pet.species} • {order.pet.breed || 'Sin Raza'} • {order.pet.owner?.name || 'S/A'}
                                                                </span>
                                                                <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 group-hover:bg-white/30 rounded-full"></span>
                                                                <span className="hidden sm:inline-flex items-center gap-1 truncate font-medium italic">
                                                                    ✂️ Atendió: {order.user?.name || 'No asignado'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6 ml-4">
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5 whitespace-nowrap">Registro</p>
                                                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-white whitespace-nowrap">
                                                                {format(new Date(order.created_at), "d MMM, yyyy", { locale: es })}
                                                            </p>
                                                        </div>
                                                        <div className="hidden md:flex flex-shrink-0">
                                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-[#1B2132] border-2 border-slate-200 dark:border-slate-700/50 group-hover:border-white group-hover:bg-white/20 group-hover:text-white text-gray-300 transition-colors shadow-sm">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-brand-primary group-hover:text-white">
                                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-20 px-6">
                                    <div className="text-6xl mb-6 opacity-20 transform hover:scale-110 transition-transform">✂️</div>
                                    <h3 className="text-xl font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                        {searchTerm ? 'No se encontraron resultados' : 'No hay órdenes de estética'}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                                        {searchTerm ? 'Intenta buscar con otros términos.' : 'Registra la primera orden estética hoy.'}
                                    </p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="inline-block bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20"
                                    >
                                        Iniciar Primera Estética
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Paginación */}
                        {groomingOrders.total > groomingOrders.per_page && (
                            <div className="p-6 border-t border-slate-200 dark:border-slate-700/50 flex justify-center gap-2">
                                {groomingOrders.links.map((link, idx) => (
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
                <div className="bg-white dark:bg-[#1B2132] overflow-hidden rounded-[2.5rem]">
                    <div className="p-8 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">✂️ Nueva Orden de Estética</h3>
                            <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mt-1">Grooming & Lavado Profesional</p>
                        </div>
                        <button onClick={resetModal} className="text-slate-400 hover:text-red-500 transition-colors text-2xl">×</button>
                    </div>
                    
                    <div className="p-8 space-y-6">
                        {!selectedPet ? (
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest italic">1. BUSCAR PACIENTE O DUEÑO</label>
                                <div className="relative group">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors text-xl">🔍</span>
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Escribe el nombre aquí..."
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-slate-900/50 border-transparent focus:bg-white dark:focus:bg-[#1B2132] border-slate-300 dark:border-slate-700 focus:border-brand-primary focus:ring-brand-primary rounded-3xl pl-14 pr-6 py-5 text-lg font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                                    />

                                    {clientSearch && (searchResults.clients.length > 0 || searchResults.pets.length > 0) && (
                                        <div className="relative z-10 w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xl p-2 max-h-64 overflow-y-auto custom-scrollbar">
                                            {searchResults.pets.map(pet => (
                                                <button
                                                    key={`p-${pet.id}`}
                                                    onClick={() => handlePetSelect(pet)}
                                                    className="w-full text-left px-5 py-4 rounded-2xl hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 group transition-all flex justify-between items-center border-b border-gray-50 dark:border-gray-800 last:border-0"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-2xl">{pet.species === 'Canino' ? '🐕' : '🐈'}</span>
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <p className="font-black text-slate-900 dark:text-white uppercase text-sm group-hover:text-brand-primary transition-colors">{pet.name}</p>
                                                                <PetAlertIcons pet={pet} size="sm" />
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider truncate">
                                                                {pet.species} • {pet.breed || 'Sin Raza'} • {pet.owner?.name || 'S/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-widest border shrink-0 ml-3 ${pet.species === 'Canino' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-amber-100 text-amber-600 border-amber-200'}`}>
                                                        {pet.species || 'Mascota'}
                                                    </span>
                                                </button>
                                            ))}
                                            
                                            {searchResults.clients.length > 0 && (
                                                <div className="px-5 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-gray-800/30 my-2 rounded-lg italic">Resultados por Dueño</div>
                                            )}

                                            {searchResults.clients.map(client => {
                                                const clientPets = allPets.filter(p => p.user_id === client.id);
                                                return clientPets.map(pet => (
                                                    <button
                                                        key={`cp-${pet.id}`}
                                                        onClick={() => handlePetSelect(pet)}
                                                        className="w-full text-left px-5 py-4 rounded-2xl hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 group transition-all flex justify-between items-center border-b border-gray-50 dark:border-gray-800 last:border-0"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-2xl">{pet.species === 'Canino' ? '🐕' : '🐈'}</span>
                                                            <div>
                                                                <div className="flex items-center gap-3">
                                                                    <p className="font-black text-slate-900 dark:text-white uppercase text-sm group-hover:text-brand-primary transition-colors">{pet.name}</p>
                                                                    <PetAlertIcons pet={pet} size="sm" />
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider truncate">
                                                                    {pet.species} • {pet.breed || 'Sin Raza'} • {client.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-widest border shrink-0 ml-3 ${pet.species === 'Canino' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-amber-100 text-amber-600 border-amber-200'}`}>
                                                            {pet.species || 'Mascota'}
                                                        </span>
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
                                <div className="flex items-center justify-between bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 dark:border-brand-primary/40 rounded-[2rem] px-8 py-6 shadow-sm">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-md border dark:border-slate-700">
                                            {selectedPet.species === 'Canino' ? '🐕' : '🐈'}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1 italic">Paciente Seleccionado</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight">{selectedPet.name}</p>
                                                <PetAlertIcons pet={selectedPet} size="md" />
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{selectedPet.owner?.name || 'Sin dueño'}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedPet(null)} className="text-[10px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest bg-white dark:bg-slate-800 px-5 py-2.5 rounded-2xl shadow-sm border dark:border-slate-700 transition active:scale-95">Cambiar</button>
                                </div>

                                {/* Formulario */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha y Hora Preferida</label>
                                            <input
                                            type="datetime-local"
                                            value={creationData.appointment_time}
                                            onChange={e => setCreationData({...creationData, appointment_time: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-brand-primary focus:ring-brand-primary rounded-2xl py-3 px-5 font-bold text-slate-700 dark:text-slate-300 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Groomer Asignado</label>
                                        <select
                                            value={creationData.groomer_id}
                                            onChange={e => setCreationData({...creationData, groomer_id: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-brand-primary focus:ring-brand-primary rounded-2xl py-3 px-5 font-bold text-slate-700 dark:text-slate-300 transition-all"
                                        >
                                            {groomers.map(g => (
                                                <option key={g.id} value={g.id}>{g.name} ({roleLabels[g.role] || g.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex flex-wrap justify-end gap-4 rounded-b-[2.5rem]">
                        <button
                            onClick={resetModal}
                            className="px-6 py-3 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition order-last sm:order-first"
                        >
                            Cancelar
                        </button>
                        
                        <div className="flex gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    if (!selectedPet) return;
                                    router.post(route('appointments.store'), {
                                        pet_id: selectedPet.id,
                                        veterinarian_id: creationData.groomer_id,
                                        start_time: creationData.appointment_time,
                                        duration: 60,
                                        type: 'grooming',
                                        reason: 'Cita de Estética Programada'
                                    }, {
                                        onSuccess: () => {
                                            resetModal();
                                            // Trigger a notification or some feedback
                                        },
                                        onFinish: () => setShowCreateModal(false)
                                    });
                                }}
                                disabled={!selectedPet}
                                className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition border-2 ${
                                    selectedPet 
                                    ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20' 
                                    : 'border-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                📅 Agendar Cita
                            </button>

                            <button
                                onClick={() => {
                                    if (!selectedPet) return;
                                    router.get(route('grooming-orders.create'), {
                                        pet_id: selectedPet.id,
                                        groomer_id: creationData.groomer_id,
                                        time: creationData.appointment_time
                                    });
                                }}
                                disabled={!selectedPet}
                                className={`flex-1 sm:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shadow-lg ${
                                    selectedPet 
                                    ? 'bg-brand-primary text-white hover:opacity-90 shadow-brand-primary/20' 
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                ✂️ Iniciar Estética
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
