import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { IconEye, IconPlus, IconEdit } from '@/Components/Icons';
import PreventiveControl from './Partials/PreventiveControl';
import PetAvatar from '@/Components/PetAvatar';
import { BehaviorBadge } from '@/Components/BehaviorSelector';

const TimelineItem = ({ event }) => {
    let icon = "🩺";
    let bgIcon = "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50";
    let title = "Consulta Médica General";
    let badgeType = event.type || "CONSULTA";
    let badgeColor = "bg-indigo-50 text-indigo-600 border-indigo-100";
    let doctor = event.veterinarian?.name || event.lead_surgeon?.name || "Desconocido";
    let date = new Date(event.timeline_date);
    let url = "#";
    let urlText = "VER DETALLES";

    if (event.timeline_type === "vaccine") {
        icon = "💉";
        bgIcon = "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50";
        title = event.name || "Vacunación";
        badgeType = event.type || "PREVENTIVO";
        badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
    } else if (event.timeline_type === "surgery") {
        icon = "✂️";
        bgIcon = "bg-purple-100 text-purple-600 dark:bg-purple-900/50";
        title = event.surgery_type || "Cirugía";
        badgeType = "CIRUGÍA";
        badgeColor = "bg-purple-50 text-purple-600 border-purple-100";
    } else if (event.timeline_type === "hospitalization") {
        icon = "🏥";
        bgIcon = "bg-teal-100 text-teal-600 dark:bg-teal-900/50";
        title = "Hospitalización";
        badgeType = "HOSPITALIZACIÓN";
        badgeColor = "bg-teal-50 text-teal-600 border-teal-100";
    }

    return (
        <div className="relative pl-16 group">
            {/* Dot */}
            <div className={"absolute left-4 top-1 w-8 h-8 rounded-full border-4 border-white dark:border-gray-800 z-10 group-hover:scale-110 transition-transform flex items-center justify-center text-sm shadow-sm " + bgIcon}>
                {icon}
            </div>

            <div className="bg-white dark:bg-gray-900/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all hover:shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                {date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} • {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className={"text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border " + badgeColor}>
                                {badgeType}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>

                    {event.timeline_type === "consultation" && (
                        <Link href={route("medical-records.show", event.id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 transition">
                            VER DETALLES <IconEye className="w-3 h-3" />
                        </Link>
                    )}
                    {event.timeline_type === "surgery" && (
                        <Link href={route("surgeries.show", event.id)} className="text-xs font-bold text-purple-600 hover:text-purple-800 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1 transition">
                            VER DETALLES <IconEye className="w-3 h-3" />
                        </Link>
                    )}
                    {event.timeline_type === "hospitalization" && (
                        <Link href={route("hospitalizations.show", event.id)} className="text-xs font-bold text-teal-600 hover:text-teal-800 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1 transition">
                            VER KARDEX <IconEye className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Show({ auth, pet, protocols, clients }) {
    const [timelineFilter, setTimelineFilter] = useState('all');
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    const { data: docData, setData: setDocData, post: postDoc, processing: docProcessing, reset: resetDoc, errors: docErrors } = useForm({
        pet_id: pet.id,
        name: '',
        document: null,
    });

    const submitDocument = (e) => {
        e.preventDefault();
        postDoc(route('pet-documents.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDocumentModal(false);
                resetDoc();
            }
        });
    };

    const deleteDocument = (id) => {
        if (confirm('¿Eliminar este documento permanentemente?')) {
            router.delete(route('pet-documents.destroy', id), { preserveScroll: true });
        }
    };

    const timelineEvents = [
        ...(pet.medical_records || []).map(record => ({
            ...record,
            timeline_type: 'consultation',
            timeline_date: new Date(record.created_at),
        })),
        ...(pet.surgeries || []).map(surgery => ({
            ...surgery,
            timeline_type: 'surgery',
            timeline_date: new Date(surgery.scheduled_at || surgery.created_at),
        })),
        ...(pet.hospitalizations || []).map(hosp => ({
            ...hosp,
            timeline_type: 'hospitalization',
            timeline_date: new Date(hosp.admission_date || hosp.created_at),
        })),
        ...(pet.preventive_records || []).map(prev => ({
            ...prev,
            timeline_type: 'vaccine',
            timeline_date: new Date(prev.application_date || prev.created_at),
        }))
    ].sort((a, b) => b.timeline_date - a.timeline_date);

    const filteredTimeline = timelineEvents.filter(event => {
        if (timelineFilter === 'all') return true;
        if (timelineFilter === 'consultations' && event.timeline_type === 'consultation') return true;
        if (timelineFilter === 'surgery' && (event.timeline_type === 'surgery' || event.timeline_type === 'hospitalization')) return true;
        if (timelineFilter === 'lab' && event.timeline_type === 'vaccine') return true;
        return false;
    });
    const [editingState, setEditingState] = useState(null);

    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({
        name: pet.name,
        species: pet.species,
        gender: pet.gender,
        user_id: pet.owners?.length > 0 ? pet.owners[0].id : '',
        is_aggressive: pet.is_aggressive || false,
        allergies: pet.allergies || '',
        chronic_conditions: pet.chronic_conditions || '',
        notes: pet.notes || '',
        new_owner_user_id: '',
        new_owner_relation_type: 'Familiar',
    });

    const handleEdit = (section) => {
        setEditingState(section);
        clearErrors();
    };

    const handleCancel = () => {
        setEditingState(null);
        reset();
        clearErrors();
    };

    const handleSave = (e) => {
        e.preventDefault();
        patch(route('pets.update', pet.id), {
            preserveScroll: true,
            onSuccess: () => setEditingState(null),
        });
    };

    const handleLinkOwner = (e) => {
        e.preventDefault();
        router.post(route('pets.link-owner', pet.id), {
            user_id: data.new_owner_user_id,
            relation_type: data.new_owner_relation_type
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingState(null);
                setData('new_owner_user_id', '');
                setData('new_owner_relation_type', 'Familiar');
            }
        });
    };

    const EditIcon = ({ onClick }) => (
        <button
            onClick={onClick}
            type="button"
            className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors z-20 block p-1"
            title="Editar Información"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
        </button>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Expediente: {pet.name}
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route('medical-records.create', pet.id)}
                            className="inline-flex items-center px-4 py-2 bg-brand-primary border border-transparent rounded-md font-bold text-xs text-white uppercase tracking-widest hover:opacity-90 transition shadow-lg shrink-0"
                            title="Nueva Consulta"
                        >
                            <IconPlus className="w-4 h-4 mr-1" /> Consulta
                        </Link>
                        <Link
                            href={route('hospitalizations.create', { pet_id: pet.id })}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 dark:bg-purple-500 border border-transparent rounded-md font-bold text-xs text-white uppercase tracking-widest hover:opacity-90 transition shadow-lg shrink-0"
                            title="Hospitalización"
                        >
                            🏥 Hospitalizar
                        </Link>
                        <Link
                            href={route('surgeries.create', { pet_id: pet.id })}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 border border-transparent rounded-md font-bold text-xs text-white uppercase tracking-widest hover:opacity-90 transition shadow-lg shrink-0"
                            title="Programar Cirugía"
                        >
                            ✂️ Cirugía
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Expediente: ${pet.name}`} />

            <div className="py-6">
                <div className="max-w-[98%] mx-auto sm:px-4 lg:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* PANEL IZQUIERDO: Perfil y Entorno (25%) */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 border dark:border-gray-700">
                                <div className="flex flex-col items-center">
                                    <PetAvatar pet={pet} className="h-32 w-32 mb-4" />
                                    <h3 className="text-2xl font-bold">{pet.name}</h3>
                                    <p className="text-gray-500">{pet.species} - {pet.breed || 'Mestizo'}</p>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Género:</span>
                                        <span>{pet.gender === 'male' ? 'Macho' : pet.gender === 'female' ? 'Hembra' : 'Desconocido'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Edad:</span>
                                        <span>{pet.dob ? new Date(pet.dob).toLocaleDateString() : 'Desconocida'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Peso:</span>
                                        <span className="font-bold text-brand-primary">{pet.weight ? `${pet.weight} kg` : '-'}</span>
                                    </div>
                                    <div className={`pt-4 mt-4 border-t dark:border-gray-700 relative group transition-all ${editingState === 'notes' ? 'bg-indigo-50/50 dark:bg-indigo-900/10 -mx-6 px-6 pb-4 rounded-b-lg border-t-indigo-100 dark:border-t-indigo-900' : ''}`}>
                                        {editingState !== 'notes' && <EditIcon onClick={() => handleEdit('notes')} />}
                                        <div className="flex justify-between items-center mb-2 pr-6">
                                            <p className="text-xs text-gray-400 uppercase font-bold">Notas del Paciente</p>
                                            {editingState === 'notes' && <span className="text-xs text-indigo-500 font-bold animate-pulse">Editando...</span>}
                                        </div>

                                        {editingState === 'notes' ? (
                                            <form onSubmit={handleSave} className="space-y-3">
                                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows="3" placeholder="Notas adicionales sobre la mascota..." className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                                                <div className="flex gap-2">
                                                    <button type="submit" disabled={processing} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1.5 rounded transition text-xs">Guardar</button>
                                                    <button type="button" onClick={handleCancel} className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 font-bold py-1.5 rounded transition text-xs">Cancelar</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <p className="text-sm italic text-gray-600 dark:text-gray-400">
                                                {pet.notes || 'Sin notas adicionales.'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 border dark:border-gray-700 relative group">
                                <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-widest">Hub Familiar</h3>
                                <div className="space-y-4">
                                    {pet.owners.map(owner => (
                                        <div key={owner.id} className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                                            <div>
                                                <Link href={route('clients.show', owner.id)} className="text-sm font-bold text-brand-primary hover:underline block">
                                                    {owner.name}
                                                </Link>
                                                <div className="flex gap-1 mt-1 items-center">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                        {owner.pivot.relation_type} {owner.pivot.is_primary ? '★' : ''}
                                                    </p>
                                                    {owner.behavior_profile && <BehaviorBadge behaviorId={owner.behavior_profile} showLabel={false} className="scale-75 origin-left" />}
                                                </div>
                                            </div>
                                            <a href={`tel:${owner.phone}`} className="h-8 w-8 flex items-center justify-center bg-green-50 text-green-600 rounded-full font-bold hover:bg-green-100 transition shadow-sm">
                                                📞
                                            </a>
                                        </div>
                                    ))}
                                </div>

                                {editingState === 'hub' ? (
                                    <form onSubmit={handleLinkOwner} className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                                        <div className="flex justify-between items-center bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm">
                                            <h4 className="text-[10px] font-bold uppercase text-indigo-600">Nuevo Familiar</h4>
                                            <span className="text-[10px] text-indigo-500 font-bold animate-pulse">Vinculando...</span>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Buscar Cliente</label>
                                            <select
                                                value={data.new_owner_user_id}
                                                onChange={e => setData('new_owner_user_id', e.target.value)}
                                                className="w-full text-xs rounded border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                            >
                                                <option value="">-- Seleccionar --</option>
                                                {clients?.map((c) => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                            <div className="mt-1 text-right">
                                                <Link href={route('clients.create')} className="text-[9px] text-indigo-500 hover:text-indigo-600 font-bold underline">
                                                    ¿No está en la lista? Registrar nuevo
                                                </Link>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Parentesco</label>
                                            <select
                                                value={data.new_owner_relation_type}
                                                onChange={e => setData('new_owner_relation_type', e.target.value)}
                                                className="w-full text-xs rounded border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                                            >
                                                <option value="Propietario">Propietario (Dueño(a))</option>
                                                <option value="Familiar">Familiar</option>
                                                <option value="Cuidador">Cuidador / Paseador</option>
                                                <option value="Asistente">Asistente</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" disabled={processing} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1.5 rounded transition text-xs">Vincular</button>
                                            <button type="button" onClick={handleCancel} className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 font-bold py-1.5 rounded transition text-xs">Cancelar</button>
                                        </div>
                                    </form>
                                ) : (
                                    <button onClick={() => handleEdit('hub')} type="button" className="mt-4 w-full text-[10px] border border-dashed border-gray-300 dark:border-gray-700 p-2 rounded text-gray-400 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition uppercase font-bold bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                                        + Vincular Familiar
                                    </button>
                                )}
                            </div>

                            {/* Link Público y QR */}
                            <div className="bg-brand-primary rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest mb-4">Carnet Público</h3>
                                <div className="bg-white p-3 rounded-xl mb-4 inline-block">
                                    <img
                                        src={`https://chart.googleapis.com/chart?chs=100x100&cht=qr&chl=${encodeURIComponent(window.location.origin + '/carnet/' + pet.uuid)}&choe=UTF-8`}
                                        alt="QR Link"
                                        className="w-24 h-24"
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-indigo-100 uppercase mb-4 leading-relaxed">
                                    Escanea para ver en el móvil o comparte el link con el dueño.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.origin + '/carnet/' + pet.uuid);
                                            alert('Link copiado al portapapeles');
                                        }}
                                        className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg text-xs font-black uppercase transition"
                                    >
                                        Copiar Link
                                    </button>
                                    <a
                                        href={route('public.carnet', pet.uuid)}
                                        target="_blank"
                                        className="flex-1 bg-white text-brand-primary hover:bg-indigo-50 py-2 rounded-lg text-xs font-black uppercase text-center transition"
                                    >
                                        Ver Vista
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* PANEL CENTRAL: Línea de Vida Clínica (50%) */}
                        <div className="lg:col-span-5 xl:col-span-6 space-y-6">
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-[2.5rem] border dark:border-gray-700">
                                <div className="p-8 border-b dark:border-gray-700 flex flex-col xl:flex-row justify-between xl:items-center bg-white dark:bg-gray-900/20 gap-6">
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Clinical Life Timeline</h3>
                                        <p className="text-sm text-gray-400 font-medium">Chronological history of all medical events</p>
                                    </div>
                                    <div className="flex bg-gray-50/80 dark:bg-gray-800/80 rounded-full p-1 border border-gray-100 dark:border-gray-700 overflow-x-auto hide-scrollbar sm:max-w-max">
                                        <button onClick={() => setTimelineFilter('all')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-shadow flex-1 sm:flex-none ${timelineFilter === 'all' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Todas</button>
                                        <button onClick={() => setTimelineFilter('consultations')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap flex-1 sm:flex-none ${timelineFilter === 'consultations' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Consultas</button>
                                        <button onClick={() => setTimelineFilter('surgery')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap flex-1 sm:flex-none ${timelineFilter === 'surgery' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Cirugías</button>
                                        <button onClick={() => setTimelineFilter('lab')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap flex-1 sm:flex-none ${timelineFilter === 'lab' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Lab / Vacunas</button>
                                    </div>
                                </div>
                                <div className="p-8">
                                    {filteredTimeline.length > 0 ? (
                                        <div className="space-y-12 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[2.1rem] top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-700"></div>

                                            {filteredTimeline.map(event => (
                                                <TimelineItem key={`${event.timeline_type}-${event.id}`} event={event} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 border-4 border-dashed border-gray-50 dark:border-gray-800 rounded-[2.5rem]">
                                            <span className="text-5xl mb-4 block opacity-20">🩺</span>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Sin registros clínicos aún</p>
                                            <p className="text-gray-400 text-sm mt-1">Inicia la primera consulta para crear su historial.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                        {/* PANEL DERECHO: Prevención, Alertas y Futuro (25%) */}
                        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                            {/* Alertas Clinicas */}
                            <div className="relative group">
                                {editingState === 'alerts' ? (
                                    <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-red-200 dark:border-gray-700 relative z-10 transition-all">
                                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                            <h3 className="text-xs font-bold uppercase text-red-600 flex items-center">
                                                <span className="mr-2">⚠️</span> Editar Alertas Clínicas
                                            </h3>
                                            <span className="text-xs text-indigo-500 font-bold animate-pulse">Editando...</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                                <input type="checkbox" id="is_aggressive" checked={data.is_aggressive} onChange={e => setData('is_aggressive', e.target.checked)} className="rounded border-red-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50" />
                                                <label htmlFor="is_aggressive" className="text-sm font-bold text-red-700 dark:text-red-300">Paciente Agresivo / Cuidado Especial</label>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Alergias</label>
                                                    <input type="text" value={data.allergies} onChange={e => setData('allergies', e.target.value)} placeholder="Ej. Penicilina (Opcional)" className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:border-red-500 focus:ring-red-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Padecimientos Crónicos</label>
                                                    <input type="text" value={data.chronic_conditions} onChange={e => setData('chronic_conditions', e.target.value)} placeholder="Ej. Diabetes (Opcional)" className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:border-red-500 focus:ring-red-500" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                                            <button type="submit" disabled={processing} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded transition text-sm">Guardar</button>
                                            <button type="button" onClick={handleCancel} className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 font-bold py-2 rounded transition text-sm">Cancelar</button>
                                        </div>
                                    </form>
                                ) : (
                                    (pet.is_aggressive || pet.allergies || pet.chronic_conditions) ? (
                                        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between relative overflow-hidden transition-all border border-red-500 group-hover:border-red-400">
                                            <button onClick={() => handleEdit('alerts')} className="absolute top-2 right-2 text-white bg-red-800/40 hover:bg-red-800 p-1.5 rounded-full transition-colors z-20 opacity-80 group-hover:opacity-100" title="Editar Alertas">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </button>
                                            <div className="absolute inset-0 bg-red-700/50 animate-pulse pointer-events-none"></div>
                                            <div className="flex items-center relative z-10 w-full">
                                                <span className="text-2xl mr-4 text-yellow-300">⚠️</span>
                                                <div className="flex-1">
                                                    <p className="font-black uppercase tracking-tighter">Alerta Clínica Crítica</p>
                                                    <div className="text-sm font-medium flex flex-wrap gap-x-4 gap-y-1">
                                                        {pet.is_aggressive && <span className="underline decoration-yellow-400">AGRESIVO</span>}
                                                        {pet.allergies && <span>ALERGIAS: {pet.allergies}</span>}
                                                        {pet.chronic_conditions && <span>CRÓNICO: {pet.chronic_conditions}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEdit('alerts')} type="button" className="w-full bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-lg text-center text-sm font-bold text-gray-500 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center justify-center group-hover:border-red-300 dark:group-hover:border-red-900/50">
                                            <span className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity">⚠️</span> Añadir Alertas Clínicas
                                        </button>
                                    )
                                )}
                            </div>
                            <PreventiveControl pet={pet} auth={auth} protocols={protocols} />

                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="text-lg font-bold">Documentos y Consentimientos</h3>
                                    <div className="flex space-x-2">
                                        <button onClick={() => setShowDocumentModal(true)} type="button" className="text-[10px] flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 p-2 rounded transition font-bold" title="Subir Documento (PDF/Imagen)">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <Link
                                            href={route('consents.create', [pet.id, { type: 'surgery' }])}
                                            className="text-[10px] font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 px-3 py-2 rounded flex items-center uppercase tracking-widest text-gray-700 dark:text-gray-300"
                                        >
                                            + Cx
                                        </Link>
                                        <Link
                                            href={route('consents.create', [pet.id, { type: 'euthanasia' }])}
                                            className="text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded flex items-center uppercase tracking-widest"
                                        >
                                            + Eutanasia
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {pet.consents?.length > 0 ? (
                                        <ul className="divide-y dark:divide-gray-700">
                                            {pet.consents.map(consent => (
                                                <li key={consent.id} className="py-3 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-sm capitalize">{consent.type}</p>
                                                        <p className="text-xs text-gray-500">Firmado el {new Date(consent.signed_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <Link
                                                            href={route('consents.show', consent.id)}
                                                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition"
                                                            title="Ver Detalle"
                                                        >
                                                            <IconEye className="w-5 h-5" />
                                                        </Link>
                                                        <Link
                                                            href="#"
                                                            className="p-1 text-gray-400 hover:bg-gray-50 rounded transition"
                                                            title="Imprimir"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.89l-2.1 2.1c-.245.245-.245.642 0 .887l.062.062a.627.627 0 00.887 0l2.1-2.1M6.72 13.89l3.52 3.52c.245.245.642.245.887 0l.062-.062a.627.627 0 000-.887l-3.52-3.52m3.52-3.52l2.1-2.1c.245-.245.245-.642 0-.887l-.062-.062a.627.627 0 00-.887 0l-2.1 2.1M10.24 10.37l-3.52 3.52" />
                                                            </svg>
                                                        </Link>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4 text-sm italic">No hay documentos adjuntos ni firmados aún.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/10">
                                    <h3 className="text-lg font-bold">Próximas Citas</h3>
                                    <div className="flex items-center gap-3">
                                        <Link href={route('appointments.index')} className="text-indigo-600 text-[10px] uppercase font-bold hover:underline tracking-widest hidden sm:block">Ver Calendario</Link>
                                        <Link href={route('appointments.create', { pet_id: pet.id })} className="bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold px-4 py-2 rounded-lg uppercase tracking-widest transition shadow-sm">
                                            + Nueva Cita
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {pet.appointments?.length > 0 ? (
                                        <div className="space-y-3">
                                            {pet.appointments.map(app => (
                                                <div key={app.id} className="flex justify-between items-center p-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 font-black text-xs text-center min-w-[50px]">
                                                            {new Date(app.start_time).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                                                {new Date(app.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 uppercase font-black">{app.type}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${app.status === 'scheduled' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                        app.status === 'confirmed' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                                                            'bg-gray-50 text-gray-500 border-gray-200'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-gray-500 text-sm italic mb-4">No hay citas programadas.</p>
                                            <Link
                                                href={route('appointments.create', { pet_id: pet.id })}
                                                className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-lg"
                                            >
                                                + Agendar Cita
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                        {showDocumentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <div>
                                    <h3 className="font-black uppercase tracking-tight text-lg text-gray-900 dark:text-gray-100">Bandeja Flotante</h3>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Adjuntar documento a {pet.name}</p>
                                </div>
                                <button onClick={() => setShowDocumentModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            <form onSubmit={submitDocument} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 tracking-widest mb-1 shadow-sm">Nombre / Título del Archivo</label>
                                    <input
                                        type="text"
                                        value={docData.name}
                                        onChange={e => setDocData('name', e.target.value)}
                                        placeholder="Ej. Resultados Hemograma, Placa Torax..."
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm"
                                        required
                                    />
                                    {docErrors.name && <p className="text-red-500 text-xs mt-1">{docErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 tracking-widest mb-1">Archivo (PDF / Imágenes)</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-900/30">
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                    <span>{!docData.document ? 'Selecciona un archivo' : docData.document.name}</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setDocData('document', e.target.files[0])} required />
                                                </label>
                                            </div>
                                            {!docData.document && <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">PNG, JPG, PDF hasta 10MB</p>}
                                        </div>
                                    </div>
                                    {docErrors.document && <p className="text-red-500 text-xs mt-1">{docErrors.document}</p>}
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowDocumentModal(false)}
                                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={docProcessing || !docData.document}
                                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {docProcessing ? 'Subiendo...' : 'Subir y Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
</AuthenticatedLayout>
    );
}

