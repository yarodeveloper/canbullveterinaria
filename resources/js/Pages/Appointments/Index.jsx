import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import Modal from '@/Components/Modal';

export default function Index({ auth, appointments, selectedDate, selectedVet, monthlyCounts = {}, veterinarians = [], pets = [] }) {
    const [view, setView] = useState('list'); // 'list', 'grid', 'calendar'

    // Form logic for Create modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
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
        pet.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const openCreateModal = (dateStr) => {
        // Pre-fill the date with current time or 09:00
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
    const { data: editData, setData: setEditData, patch: patchApt, processing: editProcessing, reset: resetEdit } = useForm({
        start_time: '',
        veterinarian_id: '',
        reason: '',
        status: ''
    });

    const openEditModal = (apt) => {
        setEditData({
            start_time: apt.start_time.substring(0, 16), // datetime-local format ignores seconds
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
            onSuccess: () => {
                closeEditModal();
            }
        });
    };

    const handleFilterChange = (date, vetId) => {
        router.get(route('appointments.index'), { date, vet_id: vetId }, { preserveState: true });
    };

    const renderCalendar = () => {
        // Prepare calendar grid for the current month of `selectedDate`
        const [yearStr, monthStr] = selectedDate.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1; // JS months are 0-indexed

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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => handleFilterChange(prevMonthStr, selectedVet)} className="p-2 text-gray-500 hover:text-brand-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 capitalize">
                        {new Date(year, month).toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => handleFilterChange(nextMonthStr, selectedVet)} className="p-2 text-gray-500 hover:text-brand-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {weekdays.map(d => (
                        <div key={d} className="text-center font-bold text-[10px] text-gray-400 py-1 uppercase tracking-wider">{d}</div>
                    ))}
                    {days.map((d, index) => {
                        if (!d) return <div key={`empty-${index}`} className="p-4" />;

                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const count = monthlyCounts[dateStr] || 0;
                        const isSelected = dateStr === selectedDate;

                        return (
                            <button
                                key={d}
                                onClick={() => handleFilterChange(dateStr, selectedVet)}
                                onDoubleClick={() => openCreateModal(dateStr)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer min-h-[60px] ${isSelected
                                    ? 'bg-brand-primary text-white shadow-lg scale-105'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700'
                                    }`}
                            >
                                <span className={`text-md font-black ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{d}</span>
                                {count > 0 ? (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold mt-1 max-w-[90%] truncate ${isSelected ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                        }`}>
                                        {count} citas
                                    </span>
                                ) : (
                                    <span className="text-[9px] text-transparent mt-1 opacity-0">0 citas</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const statusColors = {
        scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
        confirmed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse',
        completed: 'bg-green-100 text-green-700 border-green-200',
        cancelled: 'bg-red-100 text-red-700 border-red-200',
        'no-show': 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const typeIcons = {
        consultation: '🩺',
        surgery: '🔪',
        grooming: '🛁',
        'follow-up': '📋',
        emergency: '🚨',
    };

    const updateStatus = (id, status) => {
        router.patch(route('appointments.update', id), { status });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Agenda Médica</h2>
                    <Link
                        href={route('appointments.create')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
                    >
                        <span>+</span> Nueva Cita
                    </Link>
                </div>
            }
        >
            <Head title="Agenda" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <div className="flex justify-between items-center mb-4">
                        <Link
                            href={route('appointments.create')}
                            className="text-brand-primary font-bold hover:underline text-sm"
                        >
                            Ir a la vista completa de agendamiento
                        </Link>
                    </div>
                    {/* Toolbar / Date Picker & View Toggler */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-500">Fecha:</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => handleFilterChange(e.target.value, selectedVet)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-500 whitespace-nowrap">Médico:</label>
                                <select
                                    value={selectedVet || ''}
                                    onChange={(e) => handleFilterChange(selectedDate, e.target.value)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                >
                                    <option value="">Todos los médicos</option>
                                    {veterinarians.map(vet => (
                                        <option key={vet.id} value={vet.id}>{vet.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="h-8 w-px bg-gray-200 dark:border-gray-700 hidden sm:block"></div>
                            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                                <button
                                    onClick={() => setView('list')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Lista
                                </button>
                                <button
                                    onClick={() => setView('grid')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Cuadrícula
                                </button>
                                <button
                                    onClick={() => setView('calendar')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'calendar' ? 'bg-white dark:bg-gray-800 shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Calendario
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.get(route('appointments.index'), { date: new Date().toISOString().split('T')[0] })}
                                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                Hoy
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3">
                            {view === 'calendar' && renderCalendar()}

                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">
                                    Citas para el {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h3>
                            </div>

                            {appointments.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 p-12 rounded-xl text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <span className="text-4xl mb-4 block">📅</span>
                                    <p className="text-gray-500">No hay citas agendadas para este día o médico seleccionado.</p>
                                    <Link href={route('appointments.create')} className="text-brand-primary font-bold mt-2 inline-block">Agendar cita</Link>
                                </div>
                            ) : view === 'list' || view === 'calendar' ? (
                                <div className="space-y-4">
                                    {appointments.map((apt) => (
                                        <div key={apt.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 border-indigo-500 overflow-hidden hover:shadow-md transition">
                                            <div className="p-5 flex flex-wrap md:flex-nowrap gap-6 items-center">
                                                {/* Time Column */}
                                                <div className="flex flex-col items-center justify-center min-w-[80px] border-r dark:border-gray-700 pr-6">
                                                    <span className="text-lg font-black text-indigo-600">
                                                        {new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-xs text-gray-400 uppercase font-bold">Inicia</span>
                                                </div>

                                                {/* Pet & Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-lg font-bold truncate text-gray-900 dark:text-gray-100">
                                                            {apt.pet.name}
                                                        </span>
                                                        <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 uppercase font-medium">
                                                            {apt.pet.species}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">👤 {apt.client.name}</span>
                                                        <span className="flex items-center gap-1">👨‍⚕️ {apt.veterinarian?.name || 'Por asignar'}</span>
                                                    </div>
                                                </div>

                                                {/* Type & Status */}
                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl" title={apt.type}>{typeIcons[apt.type]}</span>
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[apt.status]}`}>
                                                            {apt.status.toUpperCase()}
                                                        </span>
                                                    </div>

                                                    {/* Quick Actions */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openEditModal(apt)}
                                                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                                        >
                                                            Editar
                                                        </button>
                                                        {apt.status === 'scheduled' && (
                                                            <button
                                                                onClick={() => updateStatus(apt.id, 'confirmed')}
                                                                className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 transition"
                                                            >
                                                                Confirmar
                                                            </button>
                                                        )}
                                                        {apt.status === 'confirmed' && (
                                                            <button
                                                                onClick={() => updateStatus(apt.id, 'in-progress')}
                                                                className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded hover:bg-yellow-100 transition"
                                                            >
                                                                Atender
                                                            </button>
                                                        )}
                                                        {apt.status === 'in-progress' && (
                                                            <button
                                                                onClick={() => updateStatus(apt.id, 'completed')}
                                                                className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition"
                                                            >
                                                                Finalizar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {appointments.map((apt) => (
                                        <div key={apt.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-2xl">
                                                        {typeIcons[apt.type]}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 dark:text-gray-100">{apt.pet.name}</p>
                                                        <p className="text-xs text-gray-400 font-bold uppercase">{apt.pet.species}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${statusColors[apt.status]}`}>
                                                    {apt.status.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="space-y-2 mb-6">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="text-xs">⏰</span>
                                                    <span className="font-bold">{new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>👤</span>
                                                    <span className="truncate">Dueño: {apt.client.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>👨‍⚕️</span>
                                                    <span className="truncate">Vet: {apt.veterinarian?.name || 'Por asignar'}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 border-t dark:border-gray-700 pt-4">
                                                <button onClick={() => openEditModal(apt)} className="flex-1 py-2 text-[10px] font-black bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 uppercase tracking-wider">
                                                    Editar
                                                </button>
                                                {apt.status === 'scheduled' && (
                                                    <button onClick={() => updateStatus(apt.id, 'confirmed')} className="flex-1 py-2 text-[10px] font-black bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 uppercase tracking-wider">Confirmar</button>
                                                )}
                                                {apt.status === 'confirmed' && (
                                                    <button onClick={() => updateStatus(apt.id, 'in-progress')} className="flex-1 py-2 text-[10px] font-black bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 uppercase tracking-wider">Atender</button>
                                                )}
                                                {apt.status === 'in-progress' && (
                                                    <button onClick={() => updateStatus(apt.id, 'completed')} className="flex-1 py-2 text-[10px] font-black bg-green-50 text-green-600 rounded-lg hover:bg-green-100 uppercase tracking-wider">Finalizar</button>
                                                )}
                                                <Link href={route('pets.show', apt.pet.id)} className="p-2 text-gray-400 hover:text-indigo-600">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Summary / Stats for the day */}
                        <div className="space-y-6">
                            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span>📊</span> Resumen del Día
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                        <span className="text-indigo-100">Total Citas</span>
                                        <span className="text-2xl font-black">{appointments.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                        <span className="text-indigo-100">Pendientes</span>
                                        <span className="text-2xl font-black">
                                            {appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-indigo-100">Completadas</span>
                                        <span className="text-2xl font-black">
                                            {appointments.filter(a => a.status === 'completed').length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Ayuda Rápida</h3>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-center gap-2">🩺 Consulta Médica</li>
                                    <li className="flex items-center gap-2">🛁 Estética / Baño</li>
                                    <li className="flex items-center gap-2">🔪 Cirugía Programada</li>
                                    <li className="flex items-center gap-2">🚨 Urgencia</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Edit / Reschedule Modal */}
            <Modal show={editingAppointment !== null} onClose={closeEditModal} maxWidth="xl">
                {editingAppointment && (
                    <form onSubmit={submitEdit} className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                                Reagendar / Editar Cita
                            </h2>
                            <p className="text-sm text-brand-primary font-bold">{editingAppointment.pet.name}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva Fecha y Hora</label>
                                <input
                                    type="datetime-local"
                                    value={editData.start_time}
                                    onChange={e => setEditData('start_time', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reasignar a Colaborador</label>
                                <select
                                    value={editData.veterinarian_id}
                                    onChange={e => setEditData('veterinarian_id', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                >
                                    <option value="">(Sin asignar)</option>
                                    {veterinarians.map(vet => (
                                        <option key={vet.id} value={vet.id}>{vet.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado de la Cita</label>
                                <select
                                    value={editData.status}
                                    onChange={e => setEditData('status', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo / Notas de la Cita</label>
                                <textarea
                                    value={editData.reason || ''}
                                    onChange={e => setEditData('reason', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                    rows="2"
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="px-4 py-2 text-gray-500 font-bold hover:text-gray-700 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={editProcessing}
                                className="px-6 py-2 bg-brand-primary text-white rounded-lg font-black tracking-wider uppercase hover:bg-brand-primary/90 transition shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Create Appointment Modal */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="2xl">
                <form onSubmit={submitCreate} className="p-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-6">Agendar Nueva Cita Rápida</h2>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">1. Selecciona el Paciente</label>
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
                                                    setCreateData('pet_id', pet.id);
                                                    setSearchTerm(pet.name + ' (' + pet.owner.name + ')');
                                                    setShowDropdown(false);
                                                }}
                                                className={`w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between border-b dark:border-gray-700 last:border-0 ${createData.pet_id === pet.id ? 'bg-brand-primary/10 dark:bg-brand-primary/20 ring-1 ring-inset ring-brand-primary' : ''}`}
                                            >
                                                <div>
                                                    <span className="font-black text-gray-900 dark:text-gray-100">{pet.name}</span>
                                                    <span className="ml-2 text-xs text-gray-400 font-bold uppercase">{pet.species}</span>
                                                    <p className="text-xs text-gray-500">Dueño: {pet.owner.name}</p>
                                                </div>
                                            </button>
                                        )) : (
                                            <div className="p-4 text-center text-sm text-gray-500">No se encontraron pacientes.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {createErrors.pet_id && <p className="text-red-500 text-xs font-bold">{createErrors.pet_id}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo</label>
                                <select
                                    value={createData.type}
                                    onChange={e => setCreateData('type', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 py-2 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                >
                                    <option value="consultation">🩺 Consulta General</option>
                                    <option value="surgery">🔪 Cirugía</option>
                                    <option value="grooming">🛁 Estética / Baño</option>
                                    <option value="follow-up">📋 Seguimiento</option>
                                    <option value="emergency">🚨 Urgencia</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Médico</label>
                                <select
                                    value={createData.veterinarian_id}
                                    onChange={e => setCreateData('veterinarian_id', e.target.value)}
                                    className="w-full rounded-xl py-2 border-gray-200 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                >
                                    <option value="">Cualquiera</option>
                                    {veterinarians.map(vet => (
                                        <option key={vet.id} value={vet.id}>{vet.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha y Hora</label>
                                <input
                                    type="datetime-local"
                                    value={createData.start_time}
                                    onChange={e => setCreateData('start_time', e.target.value)}
                                    className="w-full rounded-xl py-2 border-gray-200 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                    required
                                />
                                {createErrors.start_time && <p className="text-red-500 text-xs">{createErrors.start_time}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Duración (min)</label>
                                <select
                                    value={createData.duration}
                                    onChange={e => setCreateData('duration', e.target.value)}
                                    className="w-full rounded-xl py-2 border-gray-200 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                >
                                    <option value="15">15 min</option>
                                    <option value="30">30 min</option>
                                    <option value="45">45 min</option>
                                    <option value="60">1 hora</option>
                                    <option value="120">2 horas</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Notas</label>
                            <textarea
                                value={createData.reason}
                                onChange={e => setCreateData('reason', e.target.value)}
                                className="w-full rounded-xl py-2 border-gray-200 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700"
                                rows="2"
                            ></textarea>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="px-4 py-2 text-gray-500 font-bold hover:text-gray-700 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={createProcessing}
                            className="px-6 py-2 bg-brand-primary text-white rounded-lg font-black tracking-wider uppercase hover:bg-brand-primary/90 transition shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                        >
                            Agendar Cita
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
