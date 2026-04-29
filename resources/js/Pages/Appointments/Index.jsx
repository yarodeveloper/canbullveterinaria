import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { getWhatsAppLink } from '@/Utils/formatters';
import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import PetAlertIcons from '@/Components/PetAlertIcons';
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
    emergency: 'Urgencia',
    euthanasia: 'Eutanasia'
};

const typeIcons = {
    consultation: '🩺',
    surgery: '🔪',
    grooming: '🛁',
    hospitalization: '🏥',
    'follow-up': '📋',
    emergency: '🚨',
    euthanasia: '🌈',
};

const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    confirmed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    'no-show': 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function Index({ auth, appointments, tasks = [], selectedDate, startDate, endDate, selectedVet, monthlyCounts = {}, veterinarians = [], pets = [], preventiveReminders = [], groomingReminders = [] }) {
    const [view, setView] = useState('calendar'); // 'list', 'grid', 'calendar'
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [activeMonitor, setActiveMonitor] = useState('health'); // 'health' or 'grooming'

    const permissions = auth.permissions || [];
    const can = (permission) => permissions.includes(permission) || auth.user.role === 'admin';

    // Auto-switch tab if only one is allowed
    useState(() => {
        if (!can('view preventive reminders') && can('view grooming reminders')) {
            setActiveMonitor('grooming');
        }
    }, []);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const taskTypes = {
        training: { label: 'Capacitación', icon: '🎓', color: 'text-purple-600 bg-purple-50' },
        call: { label: 'Llamada', icon: '📞', color: 'text-orange-600 bg-orange-50' },
        course: { label: 'Curso / Diplomado', icon: '📚', color: 'text-pink-600 bg-pink-50' },
        personal: { label: 'Personal', icon: '👤', color: 'text-blue-600 bg-blue-50' },
        administrative: { label: 'Administrativo', icon: '📁', color: 'text-cyan-600 bg-cyan-50' },
        other: { label: 'Otro / General', icon: '⚙️', color: 'text-gray-600 bg-gray-50' },
    };

    const taskStatusLabels = {
        pending: 'Pendiente',
        completed: 'Hecho',
        cancelled: 'Cancelado'
    };

    // Form logic for Clinical Appointments
    const { data: createData, setData: setCreateData, post: postApt, processing: createProcessing, reset: resetCreate, errors: createErrors } = useForm({
        pet_id: '',
        veterinarian_id: '',
        start_time: '',
        duration: '30',
        type: 'consultation',
        reason: '',
    });

    // Form logic for Task creation
    const { data: taskData, setData: setTaskData, post: postTask, processing: taskProcessing, reset: resetTask, errors: taskErrors } = useForm({
        title: '',
        description: '',
        type: 'administrative',
        start_time: '',
        end_time: '',
        priority: 'medium',
        user_id: auth.user.id,
        is_recurring: false,
        recurrence_weeks: 1,
    });

    const normalizeString = (str) => {
        return (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const filteredPets = pets.filter(pet => {
        const normalizedSearch = normalizeString(searchTerm);
        return normalizeString(pet.name).includes(normalizedSearch) ||
               normalizeString(pet.owner?.name).includes(normalizedSearch);
    }).slice(0, 10); // Aumentado a 10 para mejor visibilidad

    // Leer prefill params de la URL (ej: ?prefill_pet_id=2&prefill_type=grooming)
    // Se usa para abrir el modal de cita desde el monitor de estética.
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const prefillPetId = urlParams.get('prefill_pet_id');
        const prefillType = urlParams.get('prefill_type');
        if (prefillPetId) {
            const pet = pets.find(p => String(p.id) === String(prefillPetId));
            const defaultTime = `${selectedDate}T09:00`;
            // Inertia useForm: setData acepta objeto completo para actualizar múltiples campos
            setCreateData({
                pet_id: prefillPetId,
                type: prefillType || 'grooming',
                start_time: defaultTime,
                duration: '30',
                veterinarian_id: '',
                reason: '',
            });
            if (pet) {
                setSearchTerm(`${pet.name} (${pet.owner?.name || '---'})`);
            }
            setIsCreateModalOpen(true);
            // Limpiar los params de la URL sin recargar la página
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

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

    // Edit Task logic
    const [editingTask, setEditingTask] = useState(null);
    const { data: editTaskData, setData: setEditTaskData, put: putTask, delete: deleteTask, processing: editTaskProcessing, reset: resetEditTask } = useForm({
        title: '',
        description: '',
        type: 'administrative',
        start_time: '',
        end_time: '',
        status: 'pending',
        priority: 'medium',
    });

    const openEditTaskModal = (task) => {
        setEditTaskData({
            title: task.title,
            description: task.description || '',
            type: task.type,
            start_time: task.start_time.substring(0, 16),
            end_time: task.end_time.substring(0, 16),
            status: task.status,
            priority: task.priority,
        });
        setEditingTask(task);
    };

    const closeEditTaskModal = () => {
        setEditingTask(null);
        resetEditTask();
    };

    const submitEditTask = (e) => {
        e.preventDefault();
        putTask(route('tasks.update', editingTask.id), {
            onSuccess: () => closeEditTaskModal()
        });
    };

    const handleDeleteTask = () => {
        if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
            deleteTask(route('tasks.destroy', editingTask.id), {
                onSuccess: () => closeEditTaskModal()
            });
        }
    };

    const submitTask = (e) => {
        e.preventDefault();
        postTask(route('tasks.store'), {
            onSuccess: () => {
                setIsTaskModalOpen(false);
                resetTask();
            }
        });
    };

    const allEvents = [
        ...appointments.map(a => ({ ...a, eventType: 'appointment' })),
        ...tasks.map(t => ({ ...t, eventType: 'task' }))
    ].filter(event => {
        if (view === 'week') {
            // Filter events in the current week range (startDate to endDate)
            return event.start_time >= startDate && event.start_time <= endDate;
        }
        // Filter by selectedDate for daily/calendar view
        const eventDate = new Date(event.start_time).toISOString().split('T')[0];
        return eventDate === selectedDate;
    }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    // For Weekly View we group by day (Monday to Sunday)
    const weeklyEvents = {};
    if (view === 'week') {
        const base = new Date(selectedDate + 'T00:00:00');
        const day = base.getDay();
        // Adjust to Monday: (day 0 is Sunday, 1 is Monday... 6 is Saturday)
        // If Sunday (0), go back 6 days. If Monday (1), go back 0. If Saturday (6), go back 5.
        const diff = base.getDate() - (day === 0 ? 6 : day - 1);
        const monday = new Date(base.setDate(diff));
        
        for (let i = 0; i < 7; i++) {
            const current = new Date(monday);
            current.setDate(monday.getDate() + i);
            const dateStr = current.toISOString().split('T')[0];
            weeklyEvents[dateStr] = [
                ...appointments.map(a => ({ ...a, eventType: 'appointment' })),
                ...tasks.map(t => ({ ...t, eventType: 'task' }))
            ].filter(e => {
                const eDate = new Date(e.start_time).toISOString().split('T')[0];
                return eDate === dateStr;
            }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        }
    }

    const pendingAppointments = allEvents.filter(e => e.eventType === 'appointment' && ['scheduled', 'confirmed', 'in-progress'].includes(e.status));
    const pendingTasks = allEvents.filter(e => e.eventType === 'task' && e.status === 'pending');
    const completedEvents = allEvents.filter(e => e.status === 'completed' || e.status === 'cancelled' || e.status === 'no-show');

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

        const weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

        const prevMonth = new Date(year, month - 1, 1);
        const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}-01`;

        const nextMonth = new Date(year, month + 1, 1);
        const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <button onClick={() => handleFilterChange(prevMonthStr, selectedVet)} className="p-1 text-gray-400 hover:text-brand-primary transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h3 className="text-xs font-black text-slate-800 dark:text-gray-100 capitalize">
                        {new Date(year, month).toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => handleFilterChange(nextMonthStr, selectedVet)} className="p-1 text-gray-400 hover:text-brand-primary transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {weekdays.map((d, i) => (
                        <div key={`${d}-${i}`} className="text-center font-black text-[8px] text-gray-400 py-1 uppercase tracking-tighter">{d}</div>
                    ))}
                    {days.map((d, index) => {
                        if (!d) return <div key={`empty-${index}`} className="p-1" />;

                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const count = monthlyCounts[dateStr] || 0;
                        const isSelected = dateStr === selectedDate;

                        return (
                            <button
                                key={d}
                                onClick={() => handleFilterChange(dateStr, selectedVet)}
                                onDoubleClick={() => openCreateModal(dateStr)}
                                className={`flex flex-col items-center justify-center p-1 rounded-lg transition cursor-pointer min-h-[40px] ${isSelected
                                    ? 'bg-brand-primary text-white shadow-lg'
                                    : 'hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 bg-gray-50/50 dark:bg-gray-800/50 border border-transparent'
                                    }`}
                            >
                                <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{d}</span>
                                {count > 0 && !isSelected && (
                                    <span className="w-1 h-1 rounded-full bg-brand-primary mt-1"></span>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight tracking-tight">Agenda de Citas</h2>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => {
                                setTaskData('start_time', `${selectedDate}T09:00`);
                                setTaskData('end_time', `${selectedDate}T10:00`);
                                setIsTaskModalOpen(true);
                            }}
                            className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            <span>📝</span> + Tarea
                        </button>
                        <button
                            onClick={() => openCreateModal(selectedDate)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-brand-primary text-white rounded-xl font-black text-[10px] sm:text-xs uppercase hover:opacity-90 transition shadow-lg shadow-brand-primary/40 flex items-center justify-center gap-2"
                        >
                            <span>📅</span> + Cita
                        </button>
                    </div>
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
                                {['calendar', 'week', 'list', 'grid'].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v)}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === v ? 'bg-white dark:bg-gray-800 shadow-sm text-brand-primary border border-gray-100 dark:border-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {v === 'calendar' ? 'Hoy' : v === 'week' ? 'Semana' : v === 'list' ? 'Lista' : 'Cuadrícula'}
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
                        <div className="lg:col-span-3 pb-20">
                            {view === 'week' ? (
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Planeación Semanal</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {Object.entries(weeklyEvents).map(([date, dayEvents]) => {
                                            const isSelectedDay = date === selectedDate;
                                            return (
                                                <div key={date} className={`bg-white dark:bg-gray-800 rounded-2xl border ${isSelectedDay ? 'border-brand-primary shadow-lg ring-1 ring-brand-primary/20' : 'border-gray-100 dark:border-gray-700 shadow-sm'} transition-all`}>
                                                    <div className={`p-4 flex items-center justify-between border-b dark:border-gray-700 ${isSelectedDay ? 'bg-brand-primary/5' : ''}`}>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${isSelectedDay ? 'bg-brand-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                                                {new Date(date + 'T00:00:00').getDate()}
                                                            </span>
                                                            <span className="font-extrabold text-sm uppercase text-gray-800 dark:text-gray-200">
                                                                {new Date(date + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long' })}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 dark:bg-gray-900 border px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                                            {dayEvents.length} Actividades
                                                        </span>
                                                    </div>
                                                    <div className="p-3">
                                                        {dayEvents.length === 0 ? (
                                                            <p className="text-[10px] text-gray-300 font-bold uppercase py-2 px-1 italic">Sin actividades programadas</p>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-2">
                                                                {dayEvents.map(e => (
                                                                    <div key={`${e.eventType}-${e.id}`} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold ${e.eventType === 'task' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-brand-primary text-white border-transparent shadow-sm'}`}>
                                                                        <span className="opacity-70">{new Date(e.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                                                        <span className="truncate max-w-[120px]">{e.eventType === 'task' ? e.title : e.pet.name}</span>
                                                                        {e.status === 'completed' && <span>✓</span>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <>
                                <div className="flex items-center justify-between mb-4 mt-2">
                                <h3 className="font-black text-gray-900 dark:text-gray-100 text-base flex items-center gap-2">
                                    <span className="w-2 h-2 bg-brand-primary rounded-full"></span>
                                    {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h3>
                            </div>

                            {allEvents.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl text-center border-2 border-dashed border-gray-100 dark:border-gray-700 shadow-sm">
                                    <span className="text-4xl mb-4 block">📅</span>
                                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Sin compromisos para esta fecha</p>
                                    <div className="flex justify-center gap-4 mt-4">
                                        <button onClick={() => openCreateModal(selectedDate)} className="text-brand-primary font-black text-xs uppercase hover:underline">+ Cita</button>
                                        <button onClick={() => setIsTaskModalOpen(true)} className="text-indigo-600 font-black text-xs uppercase hover:underline">+ Tarea</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* SECCIÓN 1: CITAS CLÍNICAS */}
                                    {pendingAppointments.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">💊 Citas Clínicas Hoy</span>
                                                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700"></div>
                                            </div>
                                            <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
                                                {pendingAppointments.map(apt => (
                                                    <div key={`apt-${apt.id}`} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition group ${view === 'grid' ? 'p-4 flex flex-col' : 'p-4 flex flex-col sm:flex-row sm:items-center gap-4'}`}>
                                                        <div className={`flex sm:flex-col items-center justify-between sm:justify-center min-w-[70px] border-b sm:border-b-0 sm:border-r dark:border-gray-700 pb-3 sm:pb-0 sm:pr-4 ${view === 'grid' ? 'mb-4 border-r-0 border-b pb-4 !items-start !pr-0' : ''}`}>
                                                            <div className="flex flex-col">
                                                                <span className="text-lg sm:text-base font-black text-brand-primary">
                                                                    {new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Inicio</span>
                                                            </div>
                                                            <div className="sm:hidden">
                                                                {/* Quick Status Toggle for mobile header */}
                                                                <div className="relative group/status-mob">
                                                                    <button className={`px-2 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest transition-all ${statusColors[apt.status]}`}>
                                                                        {apt.status === 'scheduled' ? 'Programada' :
                                                                        apt.status === 'confirmed' ? 'Confirmada' :
                                                                        apt.status === 'in-progress' ? 'En Proceso' :
                                                                        apt.status === 'completed' ? 'Completado' :
                                                                        apt.status === 'cancelled' ? 'Cancelado' : 'No Asistió'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-base font-black text-gray-900 dark:text-gray-100 group-hover:text-brand-primary transition flex items-center gap-2">
                                                                    {apt.pet.name}
                                                                    <PetAlertIcons pet={apt.pet} size="sm" />
                                                                </span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 uppercase font-black tracking-widest">
                                                                    {apt.pet.species}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-gray-500">
                                                                <span className="flex items-center gap-1 truncate max-w-[150px]">👤 {apt.client?.name || '---'}</span>
                                                                <span className="flex items-center gap-1 truncate max-w-[180px]">👨‍⚕️ {apt.veterinarian?.name || 'Pendiente'}</span>
                                                            </div>
                                                        </div>

                                                        <div className={`flex items-center justify-between sm:justify-start gap-3 ${view === 'grid' ? 'mt-auto pt-4 border-t dark:border-gray-700' : 'pt-4 sm:pt-0 border-t sm:border-t-0 dark:border-gray-700'}`}>
                                                            <div className="flex flex-col items-start sm:items-end gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-lg flex items-center gap-1.5">
                                                                        {typeIcons[apt.type]} <span className="text-[9px] uppercase tracking-wider">{typeLabels[apt.type]}</span>
                                                                    </span>
                                                                    
                                                                    {/* Quick Status Toggle (Hidden on very small mobile if already in header) */}
                                                                    <div className="relative group/status hidden sm:block">
                                                                        <button className={`px-2 py-0.5 rounded-lg text-[9px] font-black border uppercase tracking-widest transition-all hover:scale-105 ${statusColors[apt.status]}`}>
                                                                            {apt.status === 'scheduled' ? 'Programada' :
                                                                             apt.status === 'confirmed' ? 'Confirmada' :
                                                                             apt.status === 'in-progress' ? 'En Proceso' :
                                                                             apt.status === 'completed' ? 'Completado' :
                                                                             apt.status === 'cancelled' ? 'Cancelado' : 'No Asistió'}
                                                                        </button>
                                                                        <div className="absolute right-0 top-full mt-1 hidden group-hover/status:flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-[100] min-w-[120px] p-1 overflow-hidden transition-all">
                                                                            <button onClick={() => updateStatus(apt.id, 'confirmed')} className="text-left px-3 py-1.5 text-[9px] font-black uppercase text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">✓ Confirmar</button>
                                                                            <button onClick={() => updateStatus(apt.id, 'completed')} className="text-left px-3 py-1.5 text-[9px] font-black uppercase text-green-600 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">✅ Concluir</button>
                                                                            <button onClick={() => updateStatus(apt.id, 'cancelled')} className="text-left px-3 py-1.5 text-[9px] font-black uppercase text-red-600 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">✕ Cancelar</button>
                                                                            <button onClick={() => updateStatus(apt.id, 'no-show')} className="text-left px-3 py-1.5 text-[9px] font-black uppercase text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">🚫 No Asistió</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <button onClick={() => openEditModal(apt)} className="p-2 sm:p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-brand-primary hover:bg-white dark:hover:bg-gray-600 rounded-xl sm:rounded-lg transition border border-gray-100 dark:border-gray-600" title="Editar">
                                                                    <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                </button>
                                                                {apt.status === 'scheduled' && (
                                                                    <button onClick={() => updateStatus(apt.id, 'confirmed')} className="p-2 sm:p-1.5 bg-brand-primary/10 text-brand-primary rounded-xl sm:rounded-lg hover:bg-brand-primary hover:text-white transition shadow-sm" title="Confirmar">
                                                                        <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                                    </button>
                                                                )}
                                                                {(apt.status === 'confirmed' || apt.status === 'scheduled') && (
                                                                    <button onClick={() => handleStartService(apt)} className="p-2 sm:p-1.5 bg-yellow-400 text-white rounded-xl sm:rounded-lg hover:bg-yellow-500 transition shadow-sm flex items-center gap-2" title="Iniciar Servicio / Atender Ahora">
                                                                         <IconPlay className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                                                         <span className="sm:hidden text-[10px] font-black uppercase">Atender</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* SECCIÓN 2: TAREAS ADMINISTRATIVAS */}
                                    {pendingTasks.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">📝 Tareas Pendientes</span>
                                                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700"></div>
                                            </div>
                                            <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
                                                {pendingTasks.map(task => {
                                                    const tConfig = taskTypes[task.type] || taskTypes.administrative;
                                                    return (
                                                        <div key={`task-${task.id}`} className={`bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/30 overflow-hidden hover:shadow-md transition group ${view === 'grid' ? 'p-4 flex flex-col' : 'p-3 flex items-center gap-4'}`}>
                                                            <div className={`flex flex-col items-center justify-center min-w-[70px] border-r border-indigo-100 dark:border-indigo-900/30 pr-4 ${view === 'grid' ? 'mb-4 border-r-0 border-b pb-4 !items-start !pr-0' : ''}`}>
                                                                <span className="text-base font-black text-indigo-600">
                                                                    {new Date(task.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <span className="text-[9px] text-indigo-400 uppercase font-black tracking-widest">Tarea</span>
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className="text-sm font-black text-slate-800 dark:text-gray-100 group-hover:text-indigo-600 transition">
                                                                        {task.title}
                                                                    </span>
                                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest ${tConfig.color}`}>
                                                                        {tConfig.icon} {tConfig.label}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-bold text-gray-500 mt-1">
                                                                    <span className="flex items-center gap-1.5">👤 {task.user?.name || '---'}</span>
                                                                    <span className="flex items-center gap-1.5 text-indigo-500">⏰ {new Date(task.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(task.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-1.5">
                                                                <button onClick={() => openEditTaskModal(task)} className="p-1.5 bg-white dark:bg-gray-700 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition border border-indigo-100 dark:border-indigo-600 shadow-sm" title="Editar Tarea">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                </button>
                                                                {task.status === 'pending' && (
                                                                    <button onClick={() => putTask(route('tasks.update', task.id), { status: 'completed' })} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-sm" title="Marcar como Completada">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* SECCIÓN 3: CONCLUIDOS / FINALIZADOS */}
                                    {completedEvents.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">✅ Finalizados Hoy</span>
                                                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700"></div>
                                            </div>
                                            <div className="space-y-2 opacity-70 hover:opacity-100 transition">
                                                {completedEvents.map(event => {
                                                     const isTask = event.eventType === 'task';
                                                     return (
                                                        <div key={`${event.eventType}-${event.id}`} className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-[10px] font-black text-gray-400 min-w-[50px]">
                                                                    {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <div>
                                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                                        {isTask ? event.title : event.pet.name}
                                                                    </span>
                                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                                                        {isTask ? 'Administrativo' : typeLabels[event.type]} 
                                                                        <span className="mx-1">•</span> 
                                                                        {event.status === 'completed' ? 'Realizado' : 
                                                                         event.status === 'cancelled' ? 'Cancelado' : 'No Asistió'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={() => isTask ? openEditTaskModal(event) : openEditModal(event)}
                                                                className="text-gray-300 hover:text-brand-primary"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            </button>
                                                        </div>
                                                     );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            </>
                        )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {view === 'calendar' && renderCalendar()}
                            <div className="bg-brand-primary rounded-2xl p-4 text-white shadow-lg overflow-hidden relative">
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <h3 className="text-sm font-black mb-4 flex items-center gap-2 uppercase tracking-widest relative z-10">
                                    <span>📊</span> Resumen Diario
                                </h3>
                                <div className="space-y-2 relative z-10">
                                    <div className="flex justify-between items-center bg-white/15 p-2.5 rounded-xl backdrop-blur-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-black text-white/60 tracking-widest">Actividad Total</span>
                                            <span className="text-sm font-black">Hoy</span>
                                        </div>
                                        <span className="text-2xl font-black">{allEvents.length}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white/10 p-2 rounded-xl border border-white/5">
                                            <span className="text-[8px] uppercase font-black text-white/50 block mb-1">Citas</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-black">{appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length}</span>
                                                <span className="text-[9px] text-white/40"> pendientes</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 p-2 rounded-xl border border-white/5">
                                            <span className="text-[8px] uppercase font-black text-white/50 block mb-1">Tareas</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-black">{tasks.filter(t => t.status === 'pending').length}</span>
                                                <span className="text-[9px] text-white/40"> activas</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-400/20 p-2.5 rounded-xl border border-green-400/20 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                            <span className="text-[10px] uppercase font-black tracking-wider">Concluidos</span>
                                        </div>
                                        <span className="text-sm font-black">
                                            {appointments.filter(a => a.status === 'completed').length + tasks.filter(t => t.status === 'completed').length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-brand-primary/10 rounded-2xl p-4 border border-brand-primary/20">
                                <h3 className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Tip de Planeación</h3>
                                <p className="text-[10px] text-brand-primary/70 font-bold leading-relaxed">
                                    Usa la vista de **Semana** para equilibrar la carga de trabajo entre el equipo médico.
                                </p>
                            </div>

                            {/* Monitor de Salud Preventiva */}
                            {can('view preventive reminders') && (
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Monitor de Salud</h3>
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase">{preventiveReminders.length} Alertas</span>
                                    </div>
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                                        {preventiveReminders.length === 0 ? (
                                            <p className="text-[10px] text-gray-400 italic text-center py-4">Sin vacunas próximas</p>
                                        ) : (
                                            preventiveReminders.map(record => {
                                                const isOverdue = new Date(record.next_due_date) < new Date();
                                                return (
                                                    <div key={record.id} className={`p-3 rounded-2xl border transition hover:shadow-md ${isOverdue ? 'bg-red-50/50 border-red-100' : 'bg-amber-50/30 border-amber-100/50'}`}>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <Link href={route('pets.show', record.pet?.id)} className="text-[11px] font-black text-gray-900 dark:text-gray-100 truncate max-w-[120px] hover:text-indigo-600 transition">
                                                                {record.pet?.name}
                                                            </Link>
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                {isOverdue ? 'Vencido' : 'Próximo'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{record.name}</span>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className={`text-[9px] font-black uppercase ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                                                                    📅 {new Date(record.next_due_date?.split(' ')[0]?.split('T')[0] + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).toUpperCase()}
                                                                </span>
                                                                <div className="flex gap-1">
                                                                    <a 
                                                                        href={getWhatsAppLink(record.pet?.owner?.phone, `Hola ${record.pet?.owner?.name}, te recordamos que la vacuna ${record.name} de ${record.pet?.name} vence el ${record.next_due_date ? record.next_due_date.split('T')[0] : ''}. ¿Deseas agendar una cita?`)} 
                                                                        target="_blank"
                                                                        className="p-1 px-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-sm"
                                                                        title="Recordatorio WhatsApp"
                                                                    >
                                                                        <span className="text-[10px] font-black">WA</span>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Monitor de Estética / Spa */}
                            {can('view grooming reminders') && (
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Monitor de Estética</h3>
                                        <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-lg text-[9px] font-black uppercase">{groomingReminders.length} Próximos</span>
                                    </div>
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                                        {groomingReminders.length === 0 ? (
                                            <p className="text-[10px] text-gray-400 italic text-center py-4">Sin servicios próximos</p>
                                        ) : (
                                            groomingReminders.map(order => {
                                                const isOverdue = new Date(order.next_visit_date) < new Date();
                                                return (
                                                    <div key={order.id} className={`p-3 rounded-2xl border transition hover:shadow-md ${isOverdue ? 'bg-red-50/50 border-red-100' : 'bg-brand-primary/5 border-brand-primary/10'}`}>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <Link href={route('pets.show', order.pet?.id)} className="text-[11px] font-black text-gray-900 dark:text-gray-100 truncate max-w-[120px] hover:text-brand-primary transition">
                                                                {order.pet?.name}
                                                            </Link>
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-brand-primary/20 text-brand-primary'}`}>
                                                                {isOverdue ? 'Vencido' : 'Sugerido'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase truncate">Último: {order.folio}</span>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className={`text-[9px] font-black uppercase ${isOverdue ? 'text-red-600' : 'text-brand-primary'}`}>
                                                                    📅 {new Date(order.next_visit_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).toUpperCase()}
                                                                </span>
                                                                <div className="flex gap-1">
                                                                    <a 
                                                                        href={getWhatsAppLink(order.pet?.owner?.phone, `Hola ${order.pet?.owner?.name}, te recordamos que ya le toca su servicio de Estética/Spa a ${order.pet?.name}. Su última visita fue el ${order.created_at ? order.created_at.split('T')[0] : ''}. ¿Deseas agendar su próxima cita?`)} 
                                                                        target="_blank"
                                                                        className="p-1 px-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-sm"
                                                                        title="Recordatorio WhatsApp"
                                                                    >
                                                                        <span className="text-[10px] font-black text-white">WA</span>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
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
                                        className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition"
                                    >
                                        Eliminar
                                    </button>
                                    <div className="flex flex-wrap justify-end gap-2">
                                        {(editingAppointment?.status === 'confirmed' || editingAppointment?.status === 'scheduled') && (
                                            <button
                                                type="button"
                                                onClick={() => handleStartService(editingAppointment)}
                                                className="px-4 py-2.5 bg-yellow-400 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition shadow-lg flex items-center gap-2"
                                            >
                                                <IconPlay className="w-3.5 h-3.5" />
                                                Atender Ahora
                                            </button>
                                        )}
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
                                                    <div className="flex-1 min-w-0">
                                                        <span className="font-black text-gray-900 dark:text-gray-100 uppercase text-xs truncate block">{pet.name}</span>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5 truncate">
                                                            {pet.species} • {pet.breed || 'Sin Raza'} • {pet.owner?.name || 'No registrado'}
                                                        </p>
                                                    </div>
                                                    <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-widest border shrink-0 ml-3 ${pet.species === 'Canino' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-amber-100 text-amber-600 border-amber-200'}`}>
                                                        {pet.species || 'Mascota'}
                                                    </span>
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
                                        <option value="euthanasia">🌈 Eutanasia</option>
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
                                        <option value="180">⏳ Mas de 2 hrs (3h)</option>
                                        <option value="300">🏢 Jornada (5h)</option>
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
            {/* Task Creation Modal */}
            <Modal show={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} maxWidth="lg">
                <div className="relative">
                    <div className="h-1.5 bg-indigo-600 absolute top-0 left-0 w-full font-black tracking-tight"></div>
                    <form onSubmit={submitTask} className="p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-black text-slate-800 dark:text-gray-100 uppercase tracking-tight">Nueva Tarea Administrativa</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Gestión de tiempos y recordatorios</p>
                            </div>
                            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="bg-slate-50 dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-lg font-black transition">×</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Título de la Tarea</label>
                                <input
                                    type="text"
                                    value={taskData.title}
                                    onChange={e => setTaskData('title', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 p-2.5 focus:border-indigo-600 focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold text-sm"
                                    placeholder="Ej. Capacitación, Llamar a proveedor..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Categoría</label>
                                    <select
                                        value={taskData.type}
                                        onChange={e => setTaskData('type', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 p-2.5 focus:border-indigo-600 focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold text-xs"
                                    >
                                        <option value="administrative">📁 Administrativo</option>
                                        <option value="training">🎓 Capacitación</option>
                                        <option value="call">📞 Llamada / Seguimiento</option>
                                        <option value="course">📚 Curso / Diplomado</option>
                                        <option value="personal">👤 Personal / Ausencia</option>
                                        <option value="other">⚙️ Otros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Responsable</label>
                                    <select
                                        value={taskData.user_id}
                                        onChange={e => setTaskData('user_id', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 p-2.5 focus:border-indigo-600 focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white text-xs"
                                    >
                                        {veterinarians.map(v => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Desde</label>
                                    <input
                                        type="datetime-local"
                                        value={taskData.start_time}
                                        onChange={e => setTaskData('start_time', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 p-2.5 focus:border-indigo-600 focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Hasta</label>
                                    <input
                                        type="datetime-local"
                                        value={taskData.end_time}
                                        onChange={e => setTaskData('end_time', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 p-2.5 focus:border-indigo-600 focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold text-xs"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={taskData.is_recurring}
                                        onChange={e => setTaskData('is_recurring', e.target.checked)}
                                        className="w-4 h-4 rounded border-indigo-200 text-indigo-600 focus:ring-indigo-500 shadow-sm"
                                    />
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">¿Repetir semanalmente?</span>
                                    </div>
                                </label>
                                {taskData.is_recurring && (
                                    <div className="mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Repetir por:</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={taskData.recurrence_weeks}
                                                onChange={e => setTaskData('recurrence_weeks', e.target.value)}
                                                className="w-16 rounded-lg border-indigo-100 p-1.5 text-center font-black text-xs dark:bg-gray-900"
                                                min="1" max="12"
                                            />
                                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Semanas</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Notas / Instrucciones</label>
                                <textarea
                                    value={taskData.description}
                                    onChange={e => setTaskData('description', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 p-2.5 focus:border-indigo-600 focus:ring-0 dark:bg-gray-900 dark:border-gray-700 dark:text-white text-xs"
                                    rows="2"
                                    placeholder="Detalles adicionales..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="flex-1 py-3 text-slate-400 font-extrabold text-xs uppercase tracking-widest hover:text-slate-600 transition">Cancelar</button>
                            <button type="submit" disabled={taskProcessing} className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                                {taskProcessing ? 'Guardando...' : 'Agendar Tarea'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Task Edit Modal */}
            <Modal show={editingTask !== null} onClose={closeEditTaskModal} maxWidth="lg">
                {editingTask && (
                    <div className="relative">
                        <div className="h-1.5 bg-indigo-600 absolute top-0 left-0 w-full"></div>
                        <form onSubmit={submitEditTask} className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-lg font-black text-slate-800 dark:text-gray-100 uppercase tracking-tight">Detalles de Tarea</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Gestión administrativa</p>
                                </div>
                                <button type="button" onClick={closeEditTaskModal} className="bg-slate-50 dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-lg font-black">×</button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Título</label>
                                    <input type="text" value={editTaskData.title} onChange={e => setEditTaskData('title', e.target.value)} className="w-full rounded-xl border-gray-200 p-2.5 focus:border-indigo-600 focus:ring-0 dark:bg-gray-900 border-gray-700 dark:text-white font-bold text-sm" required />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Estatus</label>
                                        <select value={editTaskData.status} onChange={e => setEditTaskData('status', e.target.value)} className="w-full rounded-xl border-gray-200 p-2.5 focus:border-indigo-600 dark:bg-gray-900 text-xs">
                                            <option value="pending">Pendiente</option>
                                            <option value="completed">Completada</option>
                                            <option value="cancelled">Cancelada</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Prioridad</label>
                                        <select value={editTaskData.priority} onChange={e => setEditTaskData('priority', e.target.value)} className="w-full rounded-xl border-gray-200 p-2.5 focus:border-indigo-600 dark:bg-gray-900 text-xs">
                                            <option value="low">Baja</option>
                                            <option value="medium">Media</option>
                                            <option value="high">Alta</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Desde</label>
                                        <input type="datetime-local" value={editTaskData.start_time} onChange={e => setEditTaskData('start_time', e.target.value)} className="w-full rounded-xl border-gray-200 p-2.5 focus:border-indigo-600 dark:bg-gray-900 text-xs" required />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Hasta</label>
                                        <input type="datetime-local" value={editTaskData.end_time} onChange={e => setEditTaskData('end_time', e.target.value)} className="w-full rounded-xl border-gray-200 p-2.5 focus:border-indigo-600 dark:bg-gray-900 text-xs" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Notas</label>
                                    <textarea value={editTaskData.description} onChange={e => setEditTaskData('description', e.target.value)} className="w-full rounded-xl border-gray-200 p-2.5 focus:border-indigo-600 dark:bg-gray-900 text-xs" rows="2"></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between gap-3 pt-6 border-t dark:border-gray-700">
                                <button type="button" onClick={handleDeleteTask} className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition">Eliminar</button>
                                <div className="flex gap-3 flex-1 justify-end">
                                    <button type="button" onClick={closeEditTaskModal} className="px-5 py-2.5 text-slate-400 font-black text-xs uppercase tracking-widest">Cerrar</button>
                                    <button type="submit" disabled={editTaskProcessing} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition">Actualizar</button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
