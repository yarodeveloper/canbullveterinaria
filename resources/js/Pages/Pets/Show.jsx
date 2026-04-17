import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { QRCodeSVG } from 'qrcode.react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { IconEye, IconPlus, IconEdit, IconPlay } from '@/Components/Icons';
import PreventiveControl from './Partials/PreventiveControl';
import PetAvatar from '@/Components/PetAvatar';
import { getWhatsAppLink } from '@/Utils/formatters';
import { BehaviorBadge } from '@/Components/BehaviorSelector';
import PrintDocumentModal from '@/Components/PrintDocumentModal';

const roleLabels = {
    admin: 'Adm.',
    vet: 'Vet.',
    veterinarian: 'Vet.',
    surgeon: 'Cirujano',
    specialist: 'Esp.',
    groomer: 'Estilista',
    staff: 'Staff'
};

const TimelineItem = ({ event }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    let dotColor = "bg-indigo-500";
    let title = "Consulta Médica General";
    let badgeType = event.type || "CONSULTA";
    let badgeColor = "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50";
    let date = new Date(event.timeline_date);

    if (event.timeline_type === "vaccine") {
        badgeColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
        badgeType = "🌿 Prevención";
        dotColor = "bg-emerald-500";
        title = event.category === "vaccine" ? `Vacuna Aplicada: ${event.product?.name || "N/A"}` : `Desparasitación: ${event.product?.name || "N/A"}`;
    } else if (event.timeline_type === "surgery") {
        badgeColor = "text-blue-500 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
        badgeType = "✂️ Cirugía";
        dotColor = "bg-blue-500";
        title = `Protocolo Quirúrgico`;
    } else if (event.timeline_type === "hospitalization") {
        badgeColor = "text-teal-500 bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800";
        badgeType = "🏥 Hospitalización";
        dotColor = "bg-teal-500";
        title = `Ingreso a Hospitalización`;
    } else if (event.timeline_type === "grooming") {
        badgeColor = "text-brand-primary bg-brand-primary/10 border-brand-primary/20 dark:bg-brand-primary/90 dark:text-white dark:border-brand-primary/50";
        badgeType = "Estética";
        dotColor = "bg-brand-primary";
        title = `Servicio de Estética / Grooming`;
    } else if (event.timeline_type === "lab") {
        dotColor = "bg-orange-500";
        title = "Laboratorio";
        badgeType = "LABS";
        badgeColor = "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50";
    }

    const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase().replace('.', '');
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toUpperCase();

    return (
        <div className="relative group flex flex-col border-b border-gray-100 dark:border-gray-800/60 transition-colors -mx-4 sm:-mx-8 pr-4 sm:pr-8 pl-[60px] sm:pl-[100px] last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
            {/* Dot */}
            <div className={`absolute left-[34px] sm:left-[66px] top-7 w-3 h-3 rounded-full z-10 shadow-[0_0_0_4px_white] dark:shadow-[0_0_0_4px_#1f2937] ${dotColor}`}></div>

            <div className="flex flex-col xl:flex-row xl:items-center justify-between py-5">

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 flex-1 overflow-hidden">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0 uppercase tracking-wider">
                        {dateStr} - {timeStr}
                    </span>

                    <div className="flex items-center gap-3 overflow-hidden">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border shrink-0 ${badgeColor}`}>
                            {badgeType}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{title}</h4>
                    </div>
                </div>

                <div className="shrink-0 mt-3 sm:mt-0 flex items-center">
                    {event.timeline_type === "consultation" && (
                        <Link href={route("medical-records.show", event.id)} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 transition hover:opacity-70">
                            VER SOAP
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    )}
                    {event.timeline_type === "surgery" && (
                        <Link href={route("surgeries.show", event.id)} className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1 transition hover:opacity-70">
                            VER DETALLES
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    )}
                    {event.timeline_type === "hospitalization" && (
                        <Link href={route("hospitalizations.show", event.id)} className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1 transition hover:opacity-70">
                            VER KARDEX
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    )}
                    {event.timeline_type === "grooming" && (
                        <Link href={route("grooming-orders.show", event.id)} className="text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1 transition hover:opacity-70">
                            VER ORDEN
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    )}
                    {event.timeline_type === "vaccine" && (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1 transition hover:opacity-70">
                            VER CARNET
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 opacity-50 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Expansible Content for Vaccines / Preventatives */}
            {isExpanded && event.timeline_type === "vaccine" && (
                <div className="pb-5 pt-1 text-sm animate-fade-in">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5 tracking-wider">Marca / Lote</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{event.brand || "N/A"}{event.lot_number ? ` (Lote: ${event.lot_number})` : ''}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5 tracking-wider">Próxima Dosis</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{event.next_due_date ? new Date(event.next_due_date).toLocaleDateString() : 'No requerida'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5 tracking-wider">Peso</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{event.weight_at_time ? `${event.weight_at_time} kg` : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5 tracking-wider">Aplicador</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{event.veterinarian ? `${event.veterinarian.name} (${roleLabels[event.veterinarian.role] || event.veterinarian.role})` : "Desconocido"}</p>
                            </div>
                        </div>
                        {event.notes && (
                            <div className="pt-3 mt-1 border-t border-emerald-200/50 dark:border-emerald-800/30">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Notas</p>
                                <p className="text-[11px] text-gray-600 dark:text-gray-400 italic">{event.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function Show({ auth, pet, protocols, clients, documentTemplates = [] }) {
    const [timelineFilter, setTimelineFilter] = useState('all');
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);

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

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            router.post(route('pets.update-photo', pet.id), {
                photo: file
            }, {
                preserveScroll: true,
                forceFormData: true
            });
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
        })),
        ...(pet.grooming_orders || []).map(order => ({
            ...order,
            timeline_type: 'grooming',
            timeline_date: new Date(order.created_at),
        }))
    ].sort((a, b) => b.timeline_date - a.timeline_date);

    const filteredTimeline = timelineEvents.filter(event => {
        if (timelineFilter === 'all') return true;
        if (timelineFilter === 'consultations' && event.timeline_type === 'consultation') return true;
        if (timelineFilter === 'surgery' && event.timeline_type === 'surgery') return true;
        if (timelineFilter === 'hospitalization' && event.timeline_type === 'hospitalization') return true;
        if (timelineFilter === 'lab' && event.timeline_type === 'vaccine') return true; // (maybe refine filter name later)
        if (timelineFilter === 'grooming' && event.timeline_type === 'grooming') return true;
        return false;
    });
    const [editingState, setEditingState] = useState(null);

    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({
        name: pet.name,
        species: pet.species,
        gender: pet.gender,
        user_id: pet.owners?.length > 0 ? pet.owners[0].id : '',
        is_aggressive: pet.is_aggressive || false,
        is_sterilized: pet.is_sterilized || false,
        allergies: pet.allergies || '',
        chronic_conditions: pet.chronic_conditions || '',
        notes: pet.notes || '',
        color: pet.color || '',
        microchip: pet.microchip || '',
        dob: pet.dob || '',
        weight: pet.weight || '',
        new_owner_user_id: '',
        new_owner_relation_type: 'Familiar',
        status: pet.status || 'active',
        death_date: pet.death_date || '',
        death_reason: pet.death_reason || '',
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

    const handleStartService = (apt) => {
        router.patch(route('appointments.update', apt.id), { status: 'in-progress' }, {
            onSuccess: () => {
                let targetRoute = '';
                let params = { pet_id: pet.id, appointment_id: apt.id };

                switch (apt.type) {
                    case 'consultation':
                    case 'follow-up':
                    case 'emergency':
                        targetRoute = route('medical-records.create', pet.id);
                        break;
                    case 'surgery':
                        targetRoute = route('surgeries.create', params);
                        break;
                    case 'grooming':
                        targetRoute = route('grooming-orders.create', params);
                        break;
                    case 'hospitalization':
                        targetRoute = route('hospitalizations.create', params);
                        break;
                    default:
                        targetRoute = route('medical-records.create', pet.id);
                }

                if (targetRoute) {
                    window.location.href = targetRoute;
                }
            }
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

    const EditIcon = ({ onClick, className = "absolute top-4 right-4" }) => (
        <button
            onClick={onClick}
            type="button"
            className={`${className} text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors z-20 block p-1`}
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
                    <div className="flex space-x-1.5 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
                        <Link
                            href={route('medical-records.create', pet.id)}
                            className={`inline-flex items-center px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-sm ${pet.status === 'deceased' ? 'bg-white dark:bg-gray-900 text-red-600 hover:bg-red-500 hover:text-white border-2 border-red-100 group' : 'bg-white dark:bg-gray-900 text-brand-primary hover:bg-brand-primary hover:text-white border-2 border-brand-primary/10 group'}`}
                            title={pet.status === 'deceased' ? 'Consulta Post-mortem' : 'Nueva Consulta'}
                        >
                            <img src={pet.status === 'deceased' ? "/icons/leaf-svgrepo-com.svg" : "/icons/vet-with-cat-svgrepo-com.svg"} className="w-4 h-4 mr-1.5 brightness-0 opacity-70 dark:invert dark:opacity-80 group-hover:invert group-hover:opacity-100 transition-all" alt="" />
                            {pet.status === 'deceased' ? 'Post-mortem' : 'Consulta'}
                        </Link>
                        <Link
                            href={route('hospitalizations.create', { pet_id: pet.id })}
                            className={`hidden md:inline-flex items-center px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-sm ${pet.status === 'deceased' ? 'opacity-50 grayscale cursor-not-allowed bg-gray-50' : 'bg-white dark:bg-gray-900 text-purple-600 hover:bg-purple-600 hover:text-white border-2 border-purple-100 group'}`}
                            title="Hospitalización"
                            onClick={pet.status === 'deceased' ? (e) => e.preventDefault() : undefined}
                        >
                            <img src="/icons/med-kit-svgrepo-com.svg" className="w-4 h-4 mr-1.5 brightness-0 opacity-70 dark:invert dark:opacity-80 group-hover:invert group-hover:opacity-100 transition-all" alt="" /> Hosp.
                        </Link>
                        <Link
                            href={route('surgeries.create', { pet_id: pet.id })}
                            className={`hidden md:inline-flex items-center px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-sm ${pet.status === 'deceased' ? 'opacity-50 grayscale cursor-not-allowed bg-gray-50' : 'bg-white dark:bg-gray-900 text-blue-600 hover:bg-blue-600 hover:text-white border-2 border-blue-100 group'}`}
                            title="Programar Cirugía"
                            onClick={pet.status === 'deceased' ? (e) => e.preventDefault() : undefined}
                        >
                            <img src="/icons/band-aid-svgrepo-com.svg" className="w-4 h-4 mr-1.5 brightness-0 opacity-70 dark:invert dark:opacity-80 group-hover:invert group-hover:opacity-100 transition-all" alt="" /> Cirugía
                        </Link>
                        {pet.status !== 'deceased' && (
                            <>
                                <Link
                                    href={route('grooming-orders.create', { pet_id: pet.id })}
                                    className="hidden md:inline-flex items-center px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-sm bg-white dark:bg-gray-900 text-brand-primary hover:bg-brand-primary hover:text-white border-2 border-brand-primary/10 dark:border-brand-primary/40 group"
                                    title="Servicio de Estética / Grooming"
                                >
                                    <img src="/icons/scissors-svgrepo-com.svg" className="w-4 h-4 mr-1.5 brightness-0 opacity-70 dark:invert dark:opacity-80 group-hover:invert group-hover:opacity-100 transition-all" alt="" /> Estética
                                </Link>
                                <Link
                                    href={route('euthanasias.create', { pet_id: pet.id })}
                                    className="hidden md:inline-flex items-center px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-sm bg-white dark:bg-gray-900 text-slate-500 hover:bg-slate-800 hover:text-white border-2 border-slate-200 dark:border-slate-700 group"
                                    title="Registrar Eutanasia"
                                >
                                    <img src="/icons/leaf-svgrepo-com.svg" className="w-4 h-4 mr-1.5 brightness-0 opacity-70 dark:invert dark:opacity-80 group-hover:invert group-hover:opacity-100 transition-all" alt="" /> Eutanasia
                                </Link>
                            </>
                        )}
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
                                <div className="flex flex-col items-center relative">
                                    <div className="relative group cursor-pointer inline-block">
                                        <PetAvatar pet={pet} className={`h-32 w-32 mb-4 ${pet.status === 'deceased' ? 'grayscale opacity-60' : ''}`} />
                                        {/* Overlay for Photo Upload */}
                                        <label className="absolute inset-0 max-h-32 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer mb-4">
                                            <IconEdit className="w-8 h-8 mb-1" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Cambiar</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                        </label>
                                        
                                        {pet.status === 'deceased' && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none max-h-32">
                                                <div className="bg-black/70 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-white/20 shadow-xl blur-[0.3px] rotate-[-12deg]">
                                                    ✞ Fallecido
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    </div>
                                    <div className="relative w-full text-center mt-2 group">
                                        {editingState === 'basic' ? (
                                            <form onSubmit={handleSave} className="space-y-4 animate-in fade-in slide-in-from-top-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <div>
                                                    <label className="block text-[9px] font-black text-gray-400 uppercase text-left mb-1">Nombre</label>
                                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full text-sm font-bold rounded-xl border-gray-200 dark:bg-gray-800 dark:border-gray-700" required />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[9px] font-black text-gray-400 uppercase text-left mb-1">Especie</label>
                                                        <select value={data.species} onChange={e => setData('species', e.target.value)} className="w-full text-xs rounded-xl border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                                            <option value="Canino">Canino</option>
                                                            <option value="Felino">Felino</option>
                                                            <option value="Otros">Otros</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-black text-gray-400 uppercase text-left mb-1">Género</label>
                                                        <select value={data.gender} onChange={e => setData('gender', e.target.value)} className="w-full text-xs rounded-xl border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                                            <option value="male">Macho</option>
                                                            <option value="female">Hembra</option>
                                                            <option value="unknown">Desconocido</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-black text-gray-400 uppercase text-left mb-1">Raza</label>
                                                    <input type="text" value={data.breed} onChange={e => setData('breed', e.target.value)} className="w-full text-xs rounded-xl border-gray-200 dark:bg-gray-800 dark:border-gray-700" placeholder="Mestizo, Lab..." />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[9px] font-black text-gray-400 uppercase text-left mb-1">Nacimiento</label>
                                                        <input type="date" value={data.dob} onChange={e => setData('dob', e.target.value)} className="w-full text-xs rounded-xl border-gray-200 dark:bg-gray-800 dark:border-gray-700" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-black text-gray-400 uppercase text-left mb-1">Peso (kg)</label>
                                                        <input type="number" step="0.01" value={data.weight} onChange={e => setData('weight', e.target.value)} className="w-full text-xs font-bold rounded-xl border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-brand-primary" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button type="submit" disabled={processing} className="flex-1 bg-brand-primary text-white font-bold py-2 rounded-xl text-[10px] uppercase">Guardar</button>
                                                    <button type="button" onClick={handleCancel} className="flex-1 bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-500 font-bold py-2 rounded-xl text-[10px] uppercase">X</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                {pet.status !== 'deceased' && <EditIcon onClick={() => handleEdit('basic')} className="absolute top-0 right-0" />}
                                                <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
                                                    {pet.name}
                                                    {pet.status === 'deceased' && <span className="text-red-500 text-xs" title="Paciente Fallecido">💔</span>}
                                                </h3>
                                                <p className="text-gray-500 font-medium">{pet.species} - {pet.breed || 'Mestizo'}</p>
                                                {pet.status === 'deceased' && pet.death_date && (
                                                    <div className="mt-2 flex flex-col items-center">
                                                        <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Defunción: {new Date(pet.death_date).toLocaleDateString()}</p>
                                                        {pet.death_reason && <p className="text-[9px] text-gray-400 font-bold max-w-[200px] text-center italic mt-1 line-clamp-2" title={pet.death_reason}>"{pet.death_reason}"</p>}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
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

                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 border dark:border-gray-700 relative group">
                                <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-widest flex justify-between items-center">
                                    Hub Familiar
                                    <EditIcon onClick={() => handleEdit('hub')} className="static" />
                                </h3>
                                <div className="space-y-4">
                                    {pet.owners.map(owner => (
                                        <div key={owner.id} className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                                            <div className="flex-1 overflow-hidden mr-2">
                                                <Link href={route('clients.show', owner.id)} className="text-sm font-bold text-brand-primary hover:underline block truncate">
                                                    {owner.name}
                                                </Link>
                                                <div className="flex gap-1 mt-1 items-center">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                        {owner.pivot.relation_type} {owner.pivot.is_primary ? '★' : ''}
                                                    </p>
                                                    {owner.behavior_profile && <BehaviorBadge behaviorId={owner.behavior_profile} showLabel={false} className="scale-75 origin-left" />}
                                                </div>
                                                {owner.phone && <p className="text-[10px] text-gray-500 font-bold mt-1">{owner.phone}</p>}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                <a
                                                    href={`tel:${owner.phone}`}
                                                    title={`Llamar a ${owner.name}`}
                                                    className="h-8 w-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition shadow-sm"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </a>
                                                <a
                                                    href={getWhatsAppLink(owner.phone)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={`WhatsApp a ${owner.name}`}
                                                    className="h-8 w-8 flex items-center justify-center bg-[#25D366]/10 text-[#25D366] rounded-full hover:bg-[#25D366]/20 transition shadow-sm"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                    </svg>
                                                </a>
                                            </div>
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
                                {pet.uuid ? (
                                    <>
                                        <div className="bg-white p-3 rounded-xl mb-4 inline-block">
                                            <QRCodeSVG 
                                                value={typeof window !== 'undefined' ? window.location.origin + '/carnet/' + pet.uuid : ''}
                                                size={96}
                                                level="H"
                                                includeMargin={false}
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
                                    </>
                                ) : (
                                    <p className="text-[10px] font-bold text-indigo-100 uppercase mb-4 leading-relaxed">
                                        Generando enlace público...
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* PANEL CENTRAL: Línea de Vida Clínica (50%) */}
                        <div className="lg:col-span-5 xl:col-span-6 space-y-6">
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-[2.5rem] border dark:border-gray-700">
                                <div className="p-8 border-b dark:border-gray-700 flex flex-col xl:flex-row justify-between xl:items-center bg-white dark:bg-gray-900/20 gap-4">
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">Clinical Life Timeline</h3>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide">Chronological history of all medical events</p>
                                    </div>
                                    <div className="flex bg-gray-50/80 dark:bg-gray-800/80 rounded-full p-1 border border-gray-100 dark:border-gray-700 overflow-x-auto hide-scrollbar shrink-0">
                                        <button onClick={() => setTimelineFilter('all')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap transition-shadow flex-1 sm:flex-none ${timelineFilter === 'all' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Todas</button>
                                        <button onClick={() => setTimelineFilter('consultations')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap flex-1 sm:flex-none ${timelineFilter === 'consultations' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Consultas</button>
                                        <button onClick={() => setTimelineFilter('surgery')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap flex-1 sm:flex-none ${timelineFilter === 'surgery' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Cirugías</button>
                                        <button onClick={() => setTimelineFilter('hospitalization')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap flex-1 sm:flex-none ${timelineFilter === 'hospitalization' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Hospitalización</button>
                                        <button onClick={() => setTimelineFilter('grooming')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap flex-1 sm:flex-none ${timelineFilter === 'grooming' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Estética</button>
                                        <button onClick={() => setTimelineFilter('lab')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap flex-1 sm:flex-none ${timelineFilter === 'lab' ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Lab/Vacunas</button>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-8">
                                    {filteredTimeline.length > 0 ? (
                                        <div className="space-y-0 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[23px] sm:left-[39px] top-6 bottom-6 w-[2px] bg-gray-100 dark:bg-gray-800/80"></div>

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
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Estado Clínico</label>
                                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700">
                                                        <option value="active">Activo</option>
                                                        <option value="deceased">Fallecido (Defunción)</option>
                                                        <option value="inactive">Inactivo</option>
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                                        <input type="checkbox" id="is_aggressive" checked={data.is_aggressive} onChange={e => setData('is_aggressive', e.target.checked)} className="rounded border-red-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50" />
                                                        <label htmlFor="is_aggressive" className="text-xs font-bold text-red-700 dark:text-red-300 uppercase cursor-pointer">⚠️ Agresivo</label>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/10 p-3 rounded-lg border border-teal-100 dark:border-teal-900/30">
                                                        <input type="checkbox" id="is_sterilized" checked={data.is_sterilized} onChange={e => setData('is_sterilized', e.target.checked)} className="rounded border-teal-300 text-teal-600 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50" />
                                                        <label htmlFor="is_sterilized" className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase cursor-pointer">✂️ Esterilizado</label>
                                                    </div>
                                                </div>
                                            </div>

                                            {data.status === 'deceased' && (
                                                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-800 space-y-4 animate-in fade-in slide-in-from-top-2">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase text-red-600 mb-1">Fecha de Fallecimiento</label>
                                                            <input type="date" value={data.death_date} onChange={e => setData('death_date', e.target.value)} className="w-full text-sm rounded border-red-200 dark:bg-gray-900" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase text-red-600 mb-1">Causa / Razón</label>
                                                            <input type="text" value={data.death_reason} onChange={e => setData('death_reason', e.target.value)} placeholder="Ej. Insuficiencia Renal" className="w-full text-sm rounded border-red-200 dark:bg-gray-900" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Alergias</label>
                                                    <input type="text" value={data.allergies} onChange={e => setData('allergies', e.target.value)} placeholder="Ej. Penicilina" className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Padecimientos Crónicos</label>
                                                    <input type="text" value={data.chronic_conditions} onChange={e => setData('chronic_conditions', e.target.value)} placeholder="Ej. Diabetes" className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                                            <button type="submit" disabled={processing} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded transition text-sm">Guardar</button>
                                            <button type="button" onClick={handleCancel} className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 font-bold py-2 rounded transition text-sm">Cancelar</button>
                                        </div>
                                    </form>
                                ) : (
                                    (pet.is_aggressive || pet.allergies || pet.chronic_conditions || pet.is_sterilized) ? (
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
                                                    <div className="text-sm font-medium flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                                                        {pet.is_aggressive && <span className="underline decoration-yellow-400">AGRESIVO</span>}
                                                        {pet.is_sterilized && <span className="bg-teal-500/30 text-teal-100 rounded px-1.5 py-0.5 text-[10px] font-black tracking-widest border border-teal-400/40">✂️ ESTERILIZADO</span>}
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
                                <div className="p-4 sm:p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/10">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Próximas Citas</h3>
                                    <div className="flex items-center gap-3">
                                        <Link href={route('appointments.index')} className="text-indigo-600 text-[10px] uppercase font-bold hover:underline tracking-widest hidden sm:block">Ver Calendario</Link>
                                        <Link href={route('appointments.create', { pet_id: pet.id })} className="bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold px-4 py-2 rounded-lg uppercase tracking-widest transition shadow-sm">
                                            + Nueva Cita
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-5">
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
                                                     <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${app.status === 'scheduled' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                            app.status === 'confirmed' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                                                                'bg-gray-50 text-gray-500 border-gray-200'
                                                            }`}>
                                                            {app.status}
                                                        </span>
                                                        {(app.status === 'scheduled' || app.status === 'confirmed') && (
                                                            <button
                                                                onClick={() => handleStartService(app)}
                                                                className="p-1 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition"
                                                                title="Iniciar Atención"
                                                            >
                                                                <IconPlay className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                     </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500 text-xs italic mb-4">No hay citas programadas.</p>
                                            <Link
                                                href={route('appointments.create', { pet_id: pet.id })}
                                                className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition"
                                            >
                                                + Agendar Cita
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-4 sm:p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/10">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Documentos y Consentimientos</h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setShowPrintModal(true)}
                                            type="button"
                                            className="text-[10px] flex items-center justify-center bg-brand-primary text-white px-3 py-1.5 rounded transition font-bold uppercase tracking-widest shadow-lg hover:opacity-90"
                                            title="Imprimir Documentos Legales"
                                        >
                                            🖨️ Imprimir
                                        </button>
                                        <button onClick={() => setShowDocumentModal(true)} type="button" className="text-[10px] flex items-center justify-center bg-white dark:bg-gray-800 border dark:border-gray-600 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 px-3 py-1.5 rounded transition font-bold uppercase tracking-widest shadow-sm" title="Subir Documento (PDF/Imagen)">
                                            + Subir
                                        </button>
                                        <Link
                                            href={route('consents.create', [pet.id, { type: 'euthanasia' }])}
                                            className="text-[10px] font-bold bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded flex items-center uppercase tracking-widest shadow-sm transition"
                                        >
                                            + Eutanasia
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-4 sm:px-5">
                                    {(pet.consents?.length > 0 || pet.documents?.length > 0) ? (
                                        <ul className="divide-y dark:divide-gray-700">
                                            {pet.documents?.map(doc => (
                                                <li key={`doc-${doc.id}`} className="py-3 flex justify-between items-center group">
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{doc.name}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                                            Subido: {new Date(doc.created_at).toLocaleDateString()}
                                                            {doc.uploader && ` por ${doc.uploader.name}`}
                                                        </p>
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <a
                                                            href={route('pet-documents.download', doc.id)}
                                                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded transition"
                                                            title="Descargar"
                                                            download
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteDocument(doc.id)}
                                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition opacity-0 group-hover:opacity-100"
                                                            title="Eliminar"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                            {pet.consents?.map(consent => (
                                                <li key={`consent-${consent.id}`} className="py-3 flex justify-between items-center group">
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900 dark:text-gray-100 capitalize">Consentimiento {consent.type}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Firmado: {new Date(consent.signed_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <Link
                                                            href={route('consents.show', consent.id)}
                                                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded transition"
                                                            title="Ver Detalle"
                                                        >
                                                            <IconEye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href="#"
                                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition"
                                                            title="Imprimir"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.89l-2.1 2.1c-.245.245-.245.642 0 .887l.062.062a.627.627 0 00.887 0l2.1-2.1M6.72 13.89l3.52 3.52c.245.245.642.245.887 0l.062-.062a.627.627 0 000-.887l-3.52-3.52m3.52-3.52l2.1-2.1c.245-.245.245-.642 0-.887l-.062-.062a.627.627 0 00-.887 0l-2.1 2.1M10.24 10.37l-3.52 3.52" />
                                                            </svg>
                                                        </Link>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">Caja Vacia</p>
                                            <p className="text-gray-500 text-sm italic">No hay documentos adjuntos ni firmados aún.</p>
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
            <PrintDocumentModal 
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
                pet={pet}
                documentTemplates={documentTemplates}
            />
        </AuthenticatedLayout>
    );
}

