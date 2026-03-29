import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MedicationsEditor from '@/Components/MedicationsEditor';
import PendingChargesEditor from '@/Components/PendingChargesEditor';

const REASONS = [
    'Enfermedad terminal / sin pronóstico favorable',
    'Sufrimiento severo / Dolor irreversible',
    'Accidente grave / Trauma irreversible',
    'Calidad de vida deteriorada irreversiblemente',
    'Decisión del propietario (enfermedad crónica)',
    'Enfermedad infectocontagiosa (riesgo biosanitario)',
    'Otro — especificar en descripción',
];

const DISPOSITION_OPTIONS = [
    { value: 'cremacion_individual', label: '🔥 Cremación Individual' },
    { value: 'cremacion_colectiva',  label: '🔥 Cremación Colectiva' },
    { value: 'entierro',             label: '⚰️ Entierro' },
    { value: 'propietario',          label: '🏠 Propietario se lleva el cuerpo' },
    { value: 'clinica',              label: '🏥 Disposición clínica' },
];

export default function Create({ auth, pet: initialPet, veterinarians, products, selectedPetId }) {
    const [selectedPet, setSelectedPet] = useState(initialPet || null);
    const [petSearch, setPetSearch]     = useState('');
    const [petResults, setPetResults]   = useState([]);
    const [showPetDropdown, setShowPetDropdown] = useState(false);
    const petSearchRef = useRef(null);

    // Medicamentos
    const [medications, setMedications] = useState([]);
    const [medSearch, setMedSearch]     = useState('');
    const [allowManual, setAllowManual] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        pet_id:              selectedPetId || initialPet?.id || '',
        veterinarian_id:     veterinarians[0]?.id || '',
        performed_at:        new Date().toISOString().slice(0, 16),
        status:              'completed',
        weight:              initialPet?.weight || '',
        reason:              REASONS[0],
        reason_detail:       '',
        medications:         [],
        owner_present:       false,
        owner_authorization: '',
        consent_signed:      false,
        owner_name_override: '',
        disposition:         '',
        cremation_provider:  '',
        notes:               '',
        folio:               '',
        pending_charges:     [],
    });

    const defaultAuthText = (petName, ownerName) => `Yo, en mi calidad de propietario/responsable de la mascota ${petName || '[PACIENTE]'}, autorizo de manera libre, voluntaria y consciente la realización del procedimiento de eutanasia humanitaria. He sido informado por el equipo médico sobre el estado clínico irreversible de mi mascota y entiendo que este acto tiene como fin evitar el sufrimiento innecesario. Acepto los términos y doy mi consentimiento para la disposición final del cuerpo según lo acordado.`;

    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Búsqueda de paciente
    useEffect(() => {
        if (petSearch.length > 2) {
            const t = setTimeout(() => {
                axios.get(route('pets.search', { q: petSearch }))
                    .then(r => { setPetResults(r.data); setShowPetDropdown(true); });
            }, 300);
            return () => clearTimeout(t);
        } else {
            setPetResults([]);
            setShowPetDropdown(false);
        }
    }, [petSearch]);

    const selectPet = (pet) => {
        setSelectedPet(pet);
        setData(d => ({ 
            ...d, 
            pet_id: pet.id, 
            weight: pet.weight || d.weight,
            owner_authorization: d.owner_authorization || defaultAuthText(pet.name, pet.owner?.name)
        }));
        setPetSearch('');
        setShowPetDropdown(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('euthanasias.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nuevo Registro de Eutanasia" />

            <div className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-[#111822] py-8 px-4 transition-colors">
                <div className="max-w-5xl mx-auto">
                    <form onSubmit={submit} className="space-y-6">

                        {/* Header */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="px-8 py-4 bg-gradient-to-r from-purple-900 to-purple-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-2xl">🕊️</div>
                                    <div>
                                        <h1 className="text-lg font-black text-white tracking-tight">Registro de Eutanasia</h1>
                                        <p className="text-purple-200 text-[10px] font-bold uppercase tracking-widest">Procedimiento clínico controlado</p>
                                    </div>
                                </div>
                                <Link href={route('euthanasias.index')} className="text-white/60 hover:text-white transition">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </Link>
                            </div>

                            {/* Alerta si el paciente ya está fallecido */}
                            {selectedPet?.status === 'deceased' && (
                                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                    <span className="text-xl">⚠️</span>
                                    <p className="text-red-700 text-xs font-bold">Este paciente ya tiene estatus FALLECIDO en el sistema. Este registro está siendo creado en modo retroactivo.</p>
                                </div>
                            )}

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Paciente *</label>
                                    {selectedPet ? (
                                        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center text-xl font-black text-purple-600">
                                                    {selectedPet.species === 'Canino' ? '🐕' : '🐈'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-800 dark:text-white truncate">{selectedPet.name}</p>
                                                    <p className="text-[10px] text-slate-500 truncate">{selectedPet.species} • {selectedPet.breed}</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => { setSelectedPet(null); setData('pet_id', ''); }} className="text-slate-400 hover:text-red-500 transition">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative" ref={petSearchRef}>
                                            <input
                                                type="text"
                                                value={petSearch}
                                                onChange={e => setPetSearch(e.target.value)}
                                                placeholder="Buscar paciente por nombre..."
                                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            {showPetDropdown && petResults.length > 0 && (
                                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-auto">
                                                    {petResults.map(p => (
                                                        <button key={p.id} type="button" onClick={() => selectPet(p)}
                                                            className="w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition flex items-center gap-3 text-sm">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${p.owner?.name === '<< Sin Asignar >>' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                                                {p.name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-slate-800 dark:text-white">
                                                                    {p.name} 
                                                                    {p.owner?.name === '<< Sin Asignar >>' ? (
                                                                        <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded ml-2 font-black uppercase tracking-tighter">SIN DUEÑO</span>
                                                                    ) : (
                                                                        <span className="text-[9px] text-slate-400 font-normal ml-2">{p.owner?.name}</span>
                                                                    )}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400">{p.species} • {p.breed}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="mt-2 text-xs text-slate-400">
                                                ¿No está registrado?{' '}
                                                <Link
                                                    href={route('pets.create')}
                                                    className="text-purple-600 hover:text-purple-800 font-bold underline underline-offset-2"
                                                    target="_blank"
                                                >
                                                    + Agregar nuevo paciente
                                                </Link>
                                            </p>
                                        </div>
                                    )}
                                    {errors.pet_id && <p className="text-red-500 text-xs mt-1">{errors.pet_id}</p>}
                                </div>

                                {/* Propietario / Firmante */}
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nombre del Propietario / Firmante</label>
                                    <input type="text" value={data.owner_name_override} onChange={e => setData('owner_name_override', e.target.value)}
                                        placeholder={selectedPet?.owner?.name || 'Nombre responsable'}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    <p className="mt-2 text-[9px] text-slate-400 italic">
                                        {selectedPet?.owner?.name ? (
                                            <>Registrado: <span className="font-bold">{selectedPet.owner.name}</span>. Déjalo vacío si firma la misma persona.</>
                                        ) : (
                                            "Escribe el nombre de la persona presente que autoriza el procedimiento."
                                        )}
                                    </p>
                                </div>

                                {/* Veterinario */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Veterinario Responsable *</label>
                                    <select value={data.veterinarian_id} onChange={e => setData('veterinarian_id', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                        {veterinarians.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                    {errors.veterinarian_id && <p className="text-red-500 text-xs mt-1">{errors.veterinarian_id}</p>}
                                </div>

                                {/* Fecha/hora */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Fecha y Hora del Procedimiento *</label>
                                    <input type="datetime-local" value={data.performed_at} onChange={e => setData('performed_at', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    {errors.performed_at && <p className="text-red-500 text-xs mt-1">{errors.performed_at}</p>}
                                </div>

                                {/* Peso + Folio + Estado en misma línea (3 columnas en PC) */}
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Peso */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Peso del Paciente (kg)</label>
                                        <input type="number" step="0.01" min="0" value={data.weight} onChange={e => setData('weight', e.target.value)}
                                            placeholder="Ej: 12.5"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>

                                    {/* Folio */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Folio Interno <span className="text-slate-400 normal-case font-normal">(auto si vacío)</span></label>
                                        <input type="text" value={data.folio} onChange={e => setData('folio', e.target.value)}
                                            placeholder="Ej: EUT-2026-0001"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono" />
                                    </div>

                                    {/* Estado */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Estado del Registro *</label>
                                        <select value={data.status} onChange={e => setData('status', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            <option value="completed">✅ Completada</option>
                                            <option value="scheduled">📅 Programada (fecha futura)</option>
                                            <option value="cancelled">❌ Cancelada</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Motivo Clínico */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 space-y-4">
                            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                Motivo Clínico
                            </h2>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Causa Principal *</label>
                                <select value={data.reason} onChange={e => setData('reason', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Descripción Clínica Detallada</label>
                                <textarea value={data.reason_detail} onChange={e => setData('reason_detail', e.target.value)}
                                    rows={4} placeholder="Describe el estado clínico del paciente, historial reciente, diagnóstico y justificación del procedimiento..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                            </div>
                        </div>

                        <MedicationsEditor 
                            title="Tratamiento Base O Fármacos Programados"
                            medications={data.medications}
                            onChange={(meds) => setData('medications', meds)}
                            products={products}
                            canManage={true}
                            isAlwaysEditing={true}
                        />

                        {/* Contexto familiar y destino del cuerpo */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 space-y-5">
                            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                Contexto Familiar y Disposición
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Checkboxes */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                        <input type="checkbox" checked={data.owner_present} onChange={e => setData('owner_present', e.target.checked)}
                                            className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500" />
                                        <div>
                                            <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Propietario presente</p>
                                            <p className="text-[10px] text-slate-400">El dueño estuvo durante el procedimiento</p>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                        <input type="checkbox" checked={data.consent_signed} onChange={e => setData('consent_signed', e.target.checked)}
                                            className="w-4 h-4 mt-0.5 rounded text-purple-600 border-slate-300 focus:ring-purple-500" />
                                        <div>
                                            <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Consentimiento firmado</p>
                                            <p className="text-[10px] text-slate-400">El propietario firmó la autorización escrita</p>
                                            {selectedPet && (
                                                <Link
                                                    href={route('consents.create', [selectedPet.id, { type: 'euthanasia' }])}
                                                    className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-purple-600 hover:text-purple-800 underline underline-offset-2"
                                                    target="_blank"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    Generar / Ver consentimiento informado
                                                </Link>
                                            )}
                                        </div>
                                    </label>
                                </div>

                                {/* Destino del cuerpo */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Destino del Cuerpo</label>
                                    <select value={data.disposition} onChange={e => setData('disposition', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                        <option value="">— Seleccionar —</option>
                                        {DISPOSITION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    {(data.disposition === 'cremacion_individual' || data.disposition === 'cremacion_colectiva') && (
                                        <input type="text" value={data.cremation_provider} onChange={e => setData('cremation_provider', e.target.value)}
                                            placeholder="Nombre del servicio de cremación"
                                            className="w-full mt-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] text-slate-400 mb-2 italic">Asegúrate de que el nombre del firmante sea correcto para los documentos legales.</p>
                            </div>

                            {/* Autorización del propietario */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Texto de Autorización / Declaración del Propietario</label>
                                <textarea value={data.owner_authorization} onChange={e => {
                                    setData('owner_authorization', e.target.value);
                                }}
                                    rows={3} placeholder="Yo, [nombre], en pleno uso de mis facultades, autorizo el procedimiento de eutanasia de mi mascota [nombre]..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                            </div>
                        </div>

                        {/* Notas adicionales */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Notas Finales / Observaciones del Procedimiento</label>
                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                                rows={3} placeholder="Cualquier observación adicional sobre la aplicación, comportamiento del paciente, tiempo de acción, etc."
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                        </div>

                        {/* Enviar a Caja */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
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
                                cardBase="bg-transparent p-0 border-none shadow-none"
                                headerTitle="text-lg font-black tracking-tight flex items-center gap-2 mb-4 text-purple-600"
                            />
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center justify-between pb-6">
                            <Link href={route('euthanasias.index')} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition font-semibold">
                                ← Cancelar
                            </Link>

                            <div className="flex items-center gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowPreviewModal(true)}
                                    disabled={!data.pet_id}
                                    className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-black text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition disabled:opacity-50"
                                >
                                    👁️ Vista Previa
                                </button>
                                
                                <button type="submit" disabled={processing || !data.pet_id}
                                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-purple-200 dark:shadow-none hover:opacity-90 transition disabled:opacity-50">
                                    {processing ? (
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                    ) : '🕊️'}
                                    Registrar Procedimiento
                                </button>
                            </div>
                        </div>

                        {/* Modal de Vista Previa */}
                        {showPreviewModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                                <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                                    <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                        <div>
                                            <h3 className="font-black uppercase tracking-tight text-lg text-slate-900 dark:text-slate-100">Vista Previa del Registro</h3>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Verifica los datos antes de guardar</p>
                                        </div>
                                        <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-700">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                    <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6 text-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Paciente</p>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedPet?.name}</p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Folio (Provisional)</p>
                                                <p className="font-mono font-bold text-purple-600">{data.folio || '[AUTO-GENERADO]'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Autoriza / Firma</p>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{data.owner_name_override || selectedPet?.owner?.name || '—'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Motivo</p>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{data.reason}</p>
                                            </div>
                                            {data.reason_detail && (
                                                <div className="col-span-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Descripción Clínica</p>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-3">{data.reason_detail}</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Autorización del Propietario</p>
                                            <p className="italic text-slate-600 dark:text-slate-400 leading-relaxed">"{data.owner_authorization}"</p>
                                        </div>

                                        {data.medications.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Medicamentos (Hoja Técnica)</p>
                                                <div className="space-y-1">
                                                    {data.medications.map((m, i) => (
                                                        <div key={i} className="flex justify-between py-1 border-b dark:border-slate-700 last:border-0 text-xs text-slate-600 dark:text-slate-400">
                                                            <span>• {m.name}</span>
                                                            <span className="font-mono">{m.total_dose} {m.unit} ({m.route})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Destino del Cuerpo</p>
                                                <p className="font-bold text-slate-700 dark:text-slate-300">
                                                    {DISPOSITION_OPTIONS.find(o => o.value === data.disposition)?.label || '—'}
                                                    {data.cremation_provider && <span className="block text-[10px] text-slate-400 font-normal">Prov: {data.cremation_provider}</span>}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Estatus Presencia/Firma</p>
                                                <div className="flex gap-2">
                                                    {data.owner_present && <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">PRESENTE</span>}
                                                    {data.consent_signed && <span className="text-[9px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 uppercase">FIRMADO</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {data.notes && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Notas Finales</p>
                                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 p-3 rounded-xl">
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{data.notes}"</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-4 pt-4 border-t dark:border-slate-700">
                                            <div className="flex-1 text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Hoja 1</p>
                                                <p className="font-bold text-slate-500 uppercase text-[9px]">Técnica / Clínica</p>
                                            </div>
                                            <div className="flex-1 text-center border-l dark:border-slate-700">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Hoja 2</p>
                                                <p className="font-bold text-emerald-500 uppercase text-[9px]">Propietario / Sin Meds</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
                                        <button onClick={() => setShowPreviewModal(false)} className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition text-slate-600 dark:text-slate-300">
                                            Cerrar
                                        </button>
                                        <button 
                                            onClick={(e) => { setShowPreviewModal(false); submit(e); }}
                                            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition shadow-lg shadow-purple-200 dark:shadow-none"
                                        >
                                            Confirmar y Guardar 🕊️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
