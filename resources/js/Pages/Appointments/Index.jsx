import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import { IconPlay } from '@/Components/Icons';

const roleLabels = {
    admin: 'Administrador',
    veterinarian: 'Veterinario',
    surgeon: 'Cirujano',
    specialist: 'Especialista',
    groomer: 'Estilista'
};

const typeLabels = {
    consultation: 'Consulta Médica',
    surgery: 'Cirugía',
    grooming: 'Estética / Baño',
    hospitalization: 'Hospitalización',
    'follow-up': 'Seguimiento',
    emergency: 'Urgencia'
};

const typeIcons = {
    consultation: '🩺',
    surgery: '🔪',
    grooming: '🛁',
    hospitalization: '🏥',
    'follow-up': '📋',
    emergency: '🚨',
};

const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    confirmed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    'no-show': 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function Index({ auth, appointments, selectedDate, startDate, endDate, selectedVet, monthlyCounts = {}, veterinarians = [], pets = [] }) {
    const [view, setView] = useState('calendar'); // 'list', 'grid', 'calendar'
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Form logic for Create modal
    const { data: createData, setData: setCreateData, post: postApt, processing: createProcessing, reset: resetCreate, errors: createErrors } = useForm({
        pet_id: '',
        veterinarian_id: '',
        start_time: '',
        duration: 30,
        type: 'consultation',
        reason: '',
    });

    const filteredPets = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const openCreateModal = (dateStr) => {
        const defaultTime = `${dateStr}T09:00`;
        setCreateData('start_time', defaultTime);
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        resetCreate();
        setSearchTerm('');
    };

    const submitCreate = (e) => {
        e.preventDefault();
        postApt(route('appointments.store'), {
            onSuccess: () => closeCreateModal()
        });
    };

    // Form logic for Edit modal
    const [editingAppointment, setEditingAppointment] = useState(null);
    const { data: editData, setData: setEditData, patch: patchApt, delete: deleteApt, processing: editProcessing, reset: resetEdit } = useForm({
        start_time: '',
        veterinarian_id: '',
        reason: '',
        status: ''
    });

    const openEditModal = (apt) => {
        setEditData({
            start_time: apt.start_time.substring(0, 16),
            veterinarian_id: apt.veterinarian_id || '',
            reason: apt.reason || '',
            status: apt.status || 'scheduled'
        });
        setEditingAppointment(apt);
    };

    const closeEditModal = () => {
        setEditingAppointment(null);
        resetEdit();
    };

    const submitEdit = (e) => {
        e.preventDefault();
        patchApt(route('appointments.update', editingAppointment.id), {
            onSuccess: () => closeEditModal()
        });
    };

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
            deleteApt(route('appointments.destroy', editingAppointment.id), {
                onSuccess: () => closeEditModal()
            });
        }
    };

    const handleFilterChange = (date, vetId, start = startDate, end = endDate) => {
        router.get(route('appointments.index'), { 
            date, 
            vet_id: vetId,
            start_date: start,
            end_date: end
        }, { preserveState: true });
    };

    const renderCalendar = () => {
        const [yearStr, monthStr] = selectedDate.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        const prevMonth = new Date(year, month - 1, 1);
        const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}-01`;

        const nextMonth = new Date(year, month + 1, 1);
        const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => handleFilterChange(prevMonthStr, selectedVet)} className="p-1.5 text-gray-500 hover:text-brand-primary transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 capitalize">
                        {new Date(year, month).toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => handleFilterChange(nextMonthStr, selectedVet)} className="p-1.5 text-gray-500 hover:text-brand-primary transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {weekdays.map(d => (
                        <div key={d} className="text-center font-bold text-[9px] text-gray-400 py-1 uppercase tracking-wider">{d}</div>
                    ))}
                    {days.map((d, index) => {
                        if (!d) return <div key={`empty-${index}`} className="p-2" />;

                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const count = monthlyCounts[dateStr] || 0;
                        const isSelected = dateStr === selectedDate;

                        return (
                            <button
                                key={d}
                                onClick={() => handleFilterChange(dateStr, selectedVet)}
                                onDoubleClick={() => openCreateModal(dateStr)}
                                className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition cursor-pointer min-h-[50px] ${isSelected
                                    ? 'bg-brand-primary text-white shadow-md'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-50 dark:border-gray-700'
                                    }`}
                            >
                                <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{d}</span>
                                {count > 0 && (
                                    <span className={`text-[8px] px-1 py-0.5 rounded-full font-bold mt-1 ${isSelected ? 'bg-white/20 text-white' : 'bg-brand-primary/10 text-brand-primary'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const updateStatus = (id, status) => {
        router.patch(route('appointments.update', id), { status });
    };

    const handleStartService = (apt) => {
        // Update status to in-progress first
        router.patch(route('appointments.update', apt.id), { 
            status: 'in-progress' 
        }, {
            onSuccess: () => {
                // Determine route based on type
                let targetRoute = '';
                let params = { pet_id: apt.pet_id, appointment_id: apt.id };

                switch (apt.type) {
                    case 'consultation':
                    case 'follow-up':
                    case 'emergency':
                        targetRoute = route('medical-records.create', apt.pet_id);
                        break;
                    case 'surgery':
                        targetRoute = route('surgeries.create', params);
                        break;
                    case 'grooming':
                        targetRoute = route('grooming-orders.create', params);
                        break;
                    default:
                        targetRoute = route('medical-records.create', apt.pet_id);
                }

                if (targetRoute) {
                    window.location.href = targetRoute;
                }
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight tracking-tight">Agenda de Citas</h2>
                    <button
                        onClick={() => openCreateModal(selectedDate)}
                        className="px-5 py-2 bg-brand-primary text-white rounded-xl font-black text-xs uppercase hover:opacity-90 transition shadow-lg shadow-brand-primary/20 flex items-center gap-2"
                    >
                        <span>+</span> Reservar Cita
                    </button>
                </div>
            }
        >
            <Head title="Agenda" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Toolbar / Filters */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4 border border-gray-50 dark:border-gray-700">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Periodo:</label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => handleFilterChange(selectedDate, selectedVet, e.target.value, endDate)}
                                        className="text-xs rounded-lg border-gray-200 py-1 shadow-sm focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => handleFilterChange(selectedDate, selectedVet, startDate, e.target.value)}
                                        className="text-xs rounded-lg border-gray-200 py-1 shadow-sm focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            
                            <div className="h-6 w-px bg-gray-100 dark:bg-gray-700"></div>

                            <div className="flex items-center gap-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Especialista:</label>
                                <select
                                    value={selectedVet || ''}
                                    onChange={(e) => handleFilterChange(selectedDate, e.target.value)}
                                    className="text-xs rounded-lg border-gray-200 py-1 shadow-sm focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white min-w-[150px]"
                                >
                                    <option value="">Todos los médicos</option>
                                    {veterinarians.map(vet => (
                                        <option key={vet.id} value={vet.id}>{vet.name} ({roleLabels[vet.role] || vet.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="h-6 w-px bg-gray-100 dark:bg-gray-700"></div>

                            <div className="flex bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
                                {['calendar', 'list', 'grid'].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v)}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === v ? 'bg-white dark:bg-gray-800 shadow-sm text-brand-primary border border-gray-100 dark:border-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {v === 'calendar' ? 'Calendario' : v === 'list' ? 'Lista' : 'Mosaico'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => router.get(route('appointments.index'), { date: new Date().toISOString().split('T')[0] })}
                            className="px-4 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-black text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition uppercase tracking-widest"
                        >
                            Día Actual
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3">
                            {view === 'calendar' && renderCalendar()}

                            <div className="flex items-center justify-between mb-4 mt-2">
                                <h3 className="font-black text-gray-900 dark:text-gray-100 text-base flex items-center gap-2">
                                    <span className="w-2 h-2 bg-brand-primary rounded-full"></span>
                                    {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h3>
                            </div>

                            {appointments.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl text-center border-2 border-dashed border-gray-100 dark:border-gray-700 shadow-sm">
                                    <span className="text-4xl mb-4 block">📅</span>
                                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Sin compromisos para esta fecha</p>
                                    <button onClick={() => openCreateModal(selectedDate)} className="text-brand-primary font-black text-xs uppercase mt-4 hover:underline">Agendar Ahora</button>
                                </div>
                            ) : (
                                <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
                                    {appointments.map((apt) => (
                                        <div 
                                            key={apt.id} 
                                            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition group ${view === 'grid' ? 'p-4 flex flex-col' : 'p-3 flex items-center gap-4'}`}
                                        >
                                            <div className={`flex flex-col items-center justify-center min-w-[70px] border-r dark:border-gray-700 pr-4 ${view === 'grid' ? 'mb-4 border-r-0 border-b pb-4 !items-start !pr-0' : ''}`}>
                                                <span className="text-base font-black text-brand-primary">
                                                    {new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Inicio</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-sm font-black text-gray-900 dark:text-gray-100 group-hover:text-brand-primary transition">
                                                        {apt.pet.name}
                                                    </span>
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 uppercase font-black tracking-widest">
                                                        {apt.pet.species}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-bold text-gray-500">
                                                    <span className="flex items-center gap-1 truncate max-w-[120px]">👤 {apt.client?.name || '---'}</span>
                                                    <span className="flex items-center gap-1 truncate max-w-[150px]">👨‍⚕️ {apt.veterinarian?.name || 'Pendiente'}</span>
                                                </div>
                                            </div>

                                            <div className={`flex items-center gap-3 ${view === 'grid' ? 'mt-auto pt-4 border-t dark:border-gray-700 justify-between' : ''}`}>
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-lg flex items-center gap-1.5">
                                                            {typeIcons[apt.type]} <span className="text-[9px] uppercase tracking-wider">{typeLabels[apt.type]}</span>
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border uppercase tracking-widest ${statusColors[apt.status]}`}>
                                                            {apt.status === 'scheduled' ? 'Programada' :
                                                             apt.status === 'confirmed' ? 'Confirmada' :
                                                             apt.status === 'in-progress' ? 'En Proceso' :
                                                             apt.status === 'completed' ? 'Completado' :
                                                             apt.status === 'cancelled' ? 'Cancelado' : 'No Asistió'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(apt)}
                                                        className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-brand-primary hover:bg-white dark:hover:bg-gray-600 rounded-lg transition border border-gray-100 dark:border-gray-600"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    {apt.status === 'scheduled' && (
                                                        <button onClick={() => updateStatus(apt.id, 'confirmed')} className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition shadow-sm" title="Confirmar">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                        </button>
                                                    )}
                                                    {(apt.status === 'confirmed' || apt.status === 'scheduled') && (
                                                        <button onClick={() => handleStartService(apt)} className="p-1.5 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition shadow-sm" title="Iniciar Servicio / Atender Ahora">
                                                             <IconPlay className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            <div className="bg-brand-primary rounded-2xl p-4 text-white shadow-lg overflow-hidden relative">
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <h3 className="text-sm font-black mb-4 flex items-center gap-2 uppercase tracking-widest relative z-10">
                                    <span>📊</span> Resumen Diario
                                </h3>
                                <div className="space-y-3 relative z-10">
                                    <div className="flex justify-between items-center bg-white/10 p-2 rounded-xl">
                                        <span className="text-[10px] uppercase font-black text-white/70 tracking-widest">Total</span>
                                        <span className="text-xl font-black">{appointments.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/10 p-2 rounded-xl">
                                        <span className="text-[10px] uppercase font-black text-white/70 tracking-widest">Espera</span>
                                        <span className="text-xl font-black">
                                            {appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-green-400/20 p-2 rounded-xl">
                                        <span className="text-[10px] uppercase font-black text-white/70 tracking-widest">Hecho</span>
                                        <span className="text-xl font-black">
                                            {appointments.filter(a => a.status === 'completed').length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Simbología Servicios</h3>
                                <ul className="space-y-2 text-[11px] font-bold text-gray-600 dark:text-gray-400">
                                    <li className="flex items-center gap-3 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition truncate whitespace-nowrap"><span>🩺</span> {typeLabels.consultation}</li>
                                    <li className="flex items-center gap-3 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition truncate whitespace-nowrap"><span>🛁</span> {typeLabels.grooming}</li>
                                    <li className="flex items-center gap-3 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition truncate whitespace-nowrap"><span>🔪</span> {typeLabels.surgery}</li>
                                    <li className="flex items-center gap-3 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition truncate whitespace-nowrap"><span>🚨</span> {typeLabels.emergency}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit / Reschedule Modal */}
            <Modal show={editingAppointment !== null} onClose={closeEditModal} maxWidth="lg">
                {editingAppointment && (
                    <div className="relative">
                         <div className="h-1 bg-brand-primary absolute top-0 left-0 w-full"></div>
                        <form onSubmit={submitEdit} className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Editar Compromiso</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Paciente: <span className="text-brand-primary">{editingAppointment.pet.name}</span></p>
                                </div>
                                <button type="button" onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 transition">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Fecha y Hora</label>
                                        <input
                                            type="datetime-local"
                                            step="600"
                                            value={editData.start_time}
                                            onChange={e => setEditData('start_time', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 py-2.5 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Especialista</label>
                                        <select
                                            value={editData.veterinarian_id}
                                            onChange={e => setEditData('veterinarian_id', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 py-2.5 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        >
                                            <option value="">Pendiente de asignar</option>
                                            {veterinarians.map(vet => (
                                                <option key={vet.id} value={vet.id}>{vet.name} ({roleLabels[vet.role] || vet.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Situación / Estado</label>
                                    <select
                                        value={editData.status}
                                        onChange={e => setEditData('status', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 py-2.5 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold"
                                    >
                                        <option value="scheduled">Programada</option>
                                        <option value="confirmed">Confirmada</option>
                                        <option value="in-progress">En proceso</option>
                                        <option value="completed">Completada</option>
                                        <option value="cancelled">Cancelada</option>
                                        <option value="no-show">No Asistió</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Motivo / Anotaciones</label>
                                    <textarea
                                        value={editData.reason || ''}
                                        onChange={e => setEditData('reason', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 py-2.5 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                                        rows="3"
                                        placeholder="Escribe aquí los motivos o detalles adicionales..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between gap-3 pt-6 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition"
                                >
                                    Eliminar
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="px-5 py-2.5 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editProcessing}
                                        className="px-8 py-2.5 bg-brand-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>

            {/* Create Appointment Modal */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="xl">
                <div className="relative">
                    <div className="h-1 bg-brand-primary absolute top-0 left-0 w-full font-black tracking-tight"></div>
                    <form onSubmit={submitCreate} className="p-6">
                        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-6 uppercase tracking-tight">Registro de Cita Rápida</h2>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">1. Localizar Paciente</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="🔍 Escribe nombre de mascota o dueño..."
                                        value={searchTerm}
                                        onChange={e => {
                                            setSearchTerm(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                        className="w-full rounded-xl border-gray-200 py-3 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />

                                    {showDropdown && searchTerm && (
                                        <div className="absolute z-[110] w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
                                            {filteredPets.length > 0 ? filteredPets.map(pet => (
                                                <button
                                                    key={pet.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setCreateData('pet_id', pet.id);
                                                        setSearchTerm(`${pet.name} (${pet.owner?.name || '---'})`);
                                                        setShowDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between border-b dark:border-gray-700 last:border-0 ${createData.pet_id === pet.id ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''}`}
                                                >
                                                    <div>
                                                        <span className="font-black text-gray-900 dark:text-gray-100">{pet.name}</span>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Responsable: {pet.owner?.name || 'No registrado'}</p>
                                                    </div>
                                                    <span className="text-[9px] px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-500 rounded-lg font-black uppercase tracking-widest">{pet.species}</span>
                                                </button>
                                            )) : (
                                                <div className="p-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Sin coincidencias</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {createErrors.pet_id && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{createErrors.pet_id}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Motivo</label>
                                    <select
                                        value={createData.type}
                                        onChange={e => setCreateData('type', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 py-2.5 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold"
                                    >
                                        <option value="consultation">🩺 Consulta Médica</option>
                                        <option value="surgery">🔪 Cirugía / Quirófano</option>
                                        <option value="grooming">🛁 Estética / Baño</option>
                                        <option value="hospitalization">🏥 Hospitalización</option>
                                        <option value="follow-up">📋 Seguimiento / RECO</option>
                                        <option value="emergency">🚨 Urgencia Inmediata</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">3. Colaborador</label>
                                    <select
                                        value={createData.veterinarian_id}
                                        onChange={e => setCreateData('veterinarian_id', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 py-2.5 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    >
                                        <option value="">Cualquiera disponible</option>
                                        {veterinarians.map(vet => (
                                            <option key={vet.id} value={vet.id}>{vet.name} ({roleLabels[vet.role] || vet.role})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">4. Programación</label>
                                    <input
                                        type="datetime-local"
                                        step="600"
                                        value={createData.start_time}
                                        onChange={e => setCreateData('start_time', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 py-2.5 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold"
                                        required
                                    />
                                    {createErrors.start_time && <p className="text-red-500 text-[10px] font-bold uppercase">{createErrors.start_time}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">5. Duración Estimada</label>
                                    <select
                                        value={createData.duration}
                                        onChange={e => setCreateData('duration', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 py-2.5 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    >
                                        <option value="15">💡 Express (15 min)</option>
                                        <option value="30">⚡ Estándar (30 min)</option>
                                        <option value="45">📊 Intermedio (45 min)</option>
                                        <option value="60">🕙 Extendido (1 hora)</option>
                                        <option value="120">🏢 Complejo (2 horas)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Notas de Recepción</label>
                                <textarea
                                    value={createData.reason}
                                    onChange={e => setCreateData('reason', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 py-2.5 focus:border-brand-primary focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                                    placeholder="Detalles sobre el motivo de la visita o indicaciones especiales..."
                                    rows="2"
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                            <button
                                type="button"
                                onClick={closeCreateModal}
                                className="px-5 py-2.5 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={createProcessing}
                                className="px-10 py-2.5 bg-brand-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                            >
                                Agendar Compromiso
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
