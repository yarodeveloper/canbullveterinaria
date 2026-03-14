import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
        disposition:         '',
        cremation_provider:  '',
        notes:               '',
        folio:               '',
    });

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
        setData(d => ({ ...d, pet_id: pet.id, weight: pet.weight || d.weight }));
        setPetSearch('');
        setShowPetDropdown(false);
    };

    // Medicamentos
    const addMedFromInventory = (product) => {
        const newMed = {
            id:            product.id,
            name:          product.name,
            unit:          product.unit,
            is_controlled: product.is_controlled,
            is_manual:     false,
            concentration: '',
            dose_mg_kg:    '',
            total_dose:    '',
            volume_ml:     '',
            route:         'IV',
            lot_number:    '',
            notes:         '',
        };
        const updated = [...medications, newMed];
        setMedications(updated);
        setData('medications', updated);
        setMedSearch('');
    };

    const addManualMed = () => {
        const newMed = {
            id:            null,
            name:          '',
            unit:          '',
            is_controlled: true,
            is_manual:     true,
            concentration: '',
            dose_mg_kg:    '',
            total_dose:    '',
            volume_ml:     '',
            route:         'IV',
            lot_number:    '',
            notes:         '',
        };
        const updated = [...medications, newMed];
        setMedications(updated);
        setData('medications', updated);
    };

    const updateMed = (idx, field, value) => {
        const updated = medications.map((m, i) => i === idx ? { ...m, [field]: value } : m);
        setMedications(updated);
        setData('medications', updated);
    };

    const removeMed = (idx) => {
        const updated = medications.filter((_, i) => i !== idx);
        setMedications(updated);
        setData('medications', updated);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(medSearch.toLowerCase()) &&
        !medications.find(m => m.id === p.id)
    );

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
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
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
                                {/* Selección de Paciente */}
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Paciente *</label>
                                    {selectedPet ? (
                                        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center text-xl font-black text-purple-600">
                                                    {selectedPet.species === 'Canino' ? '🐕' : '🐈'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 dark:text-white">{selectedPet.name}</p>
                                                    <p className="text-xs text-slate-500">{selectedPet.species} • {selectedPet.breed} • {selectedPet.owner?.name}</p>
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
                                                            className="w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-500 text-sm">{p.name?.charAt(0)}</div>
                                                            <div>
                                                                <p className="font-bold text-sm text-slate-800 dark:text-white">{p.name}</p>
                                                                <p className="text-[10px] text-slate-400">{p.species} • {p.owner?.name}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="mt-2 text-xs text-slate-400">
                                                ¿El paciente no está registrado?{' '}
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

                        {/* Medicamentos */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    Medicamentos / Fármacos Empleados
                                </h2>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-10 h-5 rounded-full transition-colors ${allowManual ? 'bg-purple-500' : 'bg-slate-200 dark:bg-slate-600'} relative`}
                                        onClick={() => setAllowManual(!allowManual)}>
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${allowManual ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">Permitir entrada manual</span>
                                </label>
                            </div>

                            {/* Buscador de inventario */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={medSearch}
                                    onChange={e => setMedSearch(e.target.value)}
                                    placeholder="Buscar medicamento del inventario..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {medSearch.length > 0 && filteredProducts.length > 0 && (
                                    <div className="absolute z-40 w-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-auto">
                                        {filteredProducts.map(p => (
                                            <button key={p.id} type="button" onClick={() => addMedFromInventory(p)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition flex items-center gap-3 text-sm">
                                                {p.is_controlled && <span className="text-[9px] bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-black uppercase">Controlado</span>}
                                                <span className="font-semibold text-slate-800 dark:text-white">{p.name}</span>
                                                <span className="text-slate-400 text-xs">{p.unit}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {allowManual && (
                                <button type="button" onClick={addManualMed}
                                    className="flex items-center gap-2 text-xs font-bold text-purple-600 hover:text-purple-800 transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                    Agregar medicamento no registrado en inventario
                                </button>
                            )}

                            {/* Tabla de medicamentos */}
                            {medications.length > 0 && (
                                <div className="space-y-3">
                                    {medications.map((med, idx) => (
                                        <div key={idx} className={`p-4 rounded-xl border-2 ${med.is_controlled ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20'}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    {med.is_controlled && <span className="text-[9px] bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-black uppercase">⚠️ Controlado</span>}
                                                    {med.is_manual ? (
                                                        <input value={med.name} onChange={e => updateMed(idx, 'name', e.target.value)}
                                                            placeholder="Nombre del medicamento"
                                                            className="font-bold text-sm bg-transparent border-b border-slate-300 focus:outline-none focus:border-purple-500 text-slate-800 dark:text-white px-1" />
                                                    ) : (
                                                        <span className="font-bold text-sm text-slate-800 dark:text-white">{med.name}</span>
                                                    )}
                                                </div>
                                                <button type="button" onClick={() => removeMed(idx)} className="text-slate-400 hover:text-red-500 transition">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                                                {[
                                                    { field: 'concentration', label: 'Concentración',  placeholder: 'Ej: 390 mg/mL' },
                                                    { field: 'dose_mg_kg',    label: 'Dosis (mg/kg)',  placeholder: 'Ej: 87' },
                                                    { field: 'total_dose',    label: 'Dosis Total',   placeholder: 'Ej: 87 mg' },
                                                    { field: 'volume_ml',     label: 'Volumen (mL)',  placeholder: 'Ej: 5.5' },
                                                    { field: 'lot_number',    label: 'N° Lote',       placeholder: 'LOT-2024-001' },
                                                ].map(f => (
                                                    <div key={f.field}>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{f.label}</p>
                                                        <input value={med[f.field]} onChange={e => updateMed(idx, f.field, e.target.value)}
                                                            placeholder={f.placeholder}
                                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500" />
                                                    </div>
                                                ))}
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Vía</p>
                                                    <select value={med.route} onChange={e => updateMed(idx, 'route', e.target.value)}
                                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500">
                                                        {['IV', 'IM', 'SC', 'PO', 'Intracardíaca', 'Otra'].map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Notas / Observaciones</p>
                                                <input value={med.notes} onChange={e => updateMed(idx, 'notes', e.target.value)}
                                                    placeholder="Previa sedación, secuencia de aplicación, etc."
                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {medications.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-xs">
                                    Busca y agrega los medicamentos utilizados en el procedimiento
                                </div>
                            )}
                        </div>

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

                            {/* Autorización del propietario */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Texto de Autorización / Declaración del Propietario</label>
                                <textarea value={data.owner_authorization} onChange={e => setData('owner_authorization', e.target.value)}
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

                        {/* Botones de acción */}
                        <div className="flex items-center justify-between pb-6">
                            <Link href={route('euthanasias.index')} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition font-semibold">
                                ← Cancelar
                            </Link>
                            <button type="submit" disabled={processing || !data.pet_id}
                                className="inline-flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-purple-200 dark:shadow-none hover:opacity-90 transition disabled:opacity-50">
                                {processing ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                ) : '🕊️'}
                                Registrar Procedimiento
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
