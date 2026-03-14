import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/* ─── Constantes ─────────────────────────────────────────── */
const DISPOSITION_LABELS = {
    cremacion_individual: '🔥 Cremación Individual',
    cremacion_colectiva:  '🔥 Cremación Colectiva',
    entierro:             '⚰️ Entierro',
    propietario:          '🏠 Propietario',
    clinica:              '🏥 Disposición clínica',
};

const STATUS = {
    scheduled: { label: 'PROGRAMADA', cls: 'text-blue-700 bg-blue-50 border-blue-200' },
    completed: { label: 'COMPLETADA', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    cancelled: { label: 'CANCELADA',  cls: 'text-red-700 bg-red-50 border-red-200' },
};

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

/* ─── InfoRow ─────────────────────────────────────────────── */
function InfoRow({ label, value, mono = false }) {
    return (
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
        </div>
    );
}

/* ─── Botón de edición de sección ────────────────────────── */
function EditSectionBtn({ onClick, active }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={active ? 'Cancelar edición' : 'Editar sección'}
            className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition
                ${active
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700'
                    : 'bg-slate-100 text-slate-500 hover:bg-purple-50 hover:text-purple-700 dark:bg-slate-700/50 dark:text-slate-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-300 border border-transparent hover:border-purple-200 dark:hover:border-purple-700'
                }`}
        >
            {active ? (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    Cancelar
                </>
            ) : (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Editar
                </>
            )}
        </button>
    );
}

/* ─── Componente principal ───────────────────────────────── */
export default function Show({ auth, euthanasia: initialEuthanasia, products = [] }) {
    const [euthanasia, setEuthanasia] = useState(initialEuthanasia);
    const [confirmComplete, setConfirmComplete] = useState(false);

    // Sincronizar estado local con props de Inertia
    React.useEffect(() => {
        setEuthanasia(initialEuthanasia);
    }, [initialEuthanasia]);

    // Estados de edición por sección
    const [editSection, setEditSection] = useState(null); // 'procedimiento' | 'motivo' | 'medicamentos'
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Forma local por sección
    const [formProcedimiento, setFormProcedimiento] = useState({
        performed_at: euthanasia.performed_at ? euthanasia.performed_at.slice(0, 16) : '',
        weight: euthanasia.weight || '',
        folio: euthanasia.folio || '',
        status: euthanasia.status || 'completed',
        veterinarian_id: euthanasia.veterinarian_id || '',
        owner_present: euthanasia.owner_present || false,
        consent_signed: euthanasia.consent_signed || false,
        disposition: euthanasia.disposition || '',
        cremation_provider: euthanasia.cremation_provider || '',
        owner_authorization: euthanasia.owner_authorization || '',
        notes: euthanasia.notes || '',
    });

    const [formMotivo, setFormMotivo] = useState({
        reason: euthanasia.reason || REASONS[0],
        reason_detail: euthanasia.reason_detail || '',
    });

    // Medicamentos — estado local editable
    const [editMeds, setEditMeds] = useState(
        (euthanasia.medications || []).map(m => ({ ...m }))
    );
    const [medSearch, setMedSearch] = useState('');
    const [allowManual, setAllowManual] = useState(false);

    // Filtrar productos localmente
    const filteredProducts = medSearch.length > 1
        ? products.filter(p =>
            p.name.toLowerCase().includes(medSearch.toLowerCase()) &&
            !editMeds.find(m => m.id === p.id)
          )
        : [];

    const medications = euthanasia.medications || [];

    /* ── Marcar completado ─ */
    const complete = () => {
        router.patch(route('euthanasias.update', euthanasia.id), { status: 'completed' }, {
            preserveScroll: true,
            onSuccess: () => { setConfirmComplete(false); }
        });
    };

    /* ── Guardar sección ─ */
    const saveSection = (payload) => {
        setSaving(true);
        setSaveError(null);
        router.patch(route('euthanasias.update', euthanasia.id), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setSaving(false);
                setEditSection(null);
            },
            onError: () => {
                setSaving(false);
                setSaveError('Error al guardar. Verifica los datos e intenta de nuevo.');
            },
        });
    };

    /* ── Búsqueda local de medicamentos del inventario ─ */
    const searchMeds = (q) => {
        setMedSearch(q);
    };

    const addMedFromInventory = (p) => {
        setEditMeds(prev => [...prev, { id: p.id, name: p.name, unit: p.unit, is_controlled: p.is_controlled, is_manual: false, concentration: '', dose_mg_kg: '', total_dose: '', volume_ml: '', route: 'IV', lot_number: '', notes: '' }]);
        setMedSearch('');
    };

    const addManualMed = () => {
        setEditMeds(prev => [...prev, { id: null, name: '', unit: '', is_controlled: true, is_manual: true, concentration: '', dose_mg_kg: '', total_dose: '', volume_ml: '', route: 'IV', lot_number: '', notes: '' }]);
    };

    const updateMed = (idx, field, value) => {
        setEditMeds(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
    };

    const removeMed = (idx) => {
        setEditMeds(prev => prev.filter((_, i) => i !== idx));
    };

    const openSection = (section) => {
        if (editSection === section) { setEditSection(null); return; }
        // Reset formularios al abrir
        if (section === 'procedimiento') {
            setFormProcedimiento({
                performed_at: euthanasia.performed_at ? euthanasia.performed_at.slice(0, 16) : '',
                weight: euthanasia.weight || '',
                folio: euthanasia.folio || '',
                status: euthanasia.status || 'completed',
                veterinarian_id: euthanasia.veterinarian_id || '',
                owner_present: euthanasia.owner_present || false,
                consent_signed: euthanasia.consent_signed || false,
                disposition: euthanasia.disposition || '',
                cremation_provider: euthanasia.cremation_provider || '',
                owner_authorization: euthanasia.owner_authorization || '',
                notes: euthanasia.notes || '',
            });
        }
        if (section === 'motivo') {
            setFormMotivo({ reason: euthanasia.reason || REASONS[0], reason_detail: euthanasia.reason_detail || '' });
        }
        if (section === 'medicamentos') {
            setEditMeds((euthanasia.medications || []).map(m => ({ ...m })));
            setMedSearch('');
        }
        setEditSection(section);
    };

    /* ─── Render ──────────────────────────────────────────── */
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Eutanasia — ${euthanasia.pet?.name}`} />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-4">
                        <Link href={route('euthanasias.index')} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <div>
                            <p className="text-purple-200 text-[10px] font-black uppercase tracking-widest">Protocolo de Eutanasia</p>
                            <h1 className="text-2xl font-black text-white">{euthanasia.pet?.name}</h1>
                            <p className="text-purple-200 text-xs">{euthanasia.pet?.species} • {euthanasia.pet?.breed}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-purple-200 text-sm font-bold">{euthanasia.folio}</span>
                        <span className={`px-3 py-1 rounded-xl border text-[10px] font-black uppercase ${STATUS[euthanasia.status]?.cls}`}>
                            {STATUS[euthanasia.status]?.label}
                        </span>
                        <a
                            href={route('euthanasias.report', euthanasia.id)}
                            target="_blank"
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition"
                        >
                            📄 Imprimir Reporte
                        </a>
                    </div>
                </div>

                {saveError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-3 rounded-xl">
                        ⚠️ {saveError}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Panel izquierdo: Paciente ── */}
                    <div className="space-y-4">

                        {/* Card Paciente con hover */}
                        <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4 transition-all duration-200 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-700 cursor-default">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-purple-500 transition-colors">Paciente</p>
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform duration-200">
                                    {euthanasia.pet?.species === 'Canino' ? '🐕' : '🐈'}
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 dark:text-white text-lg group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">{euthanasia.pet?.name}</p>
                                    <p className="text-xs text-slate-400">{euthanasia.pet?.breed}</p>
                                    <p className="text-xs text-slate-400">{euthanasia.pet?.gender === 'male' ? 'Macho' : 'Hembra'}</p>
                                </div>
                            </div>
                            <hr className="border-slate-100 dark:border-slate-700" />
                            <InfoRow label="Propietario" value={euthanasia.pet?.owner?.name} />
                            <InfoRow label="Teléfono" value={euthanasia.pet?.owner?.phone} />
                            <InfoRow label="Peso (kg)" value={euthanasia.weight ? `${euthanasia.weight} kg` : null} />
                            {euthanasia.pet?.id && (
                                <Link
                                    href={route('pets.show', euthanasia.pet.id)}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-800 underline underline-offset-2"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    Ver kardex del paciente
                                </Link>
                            )}
                        </div>

                        {/* Card Procedimiento – con edición */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Procedimiento</p>
                                <EditSectionBtn onClick={() => openSection('procedimiento')} active={editSection === 'procedimiento'} />
                            </div>

                            {editSection === 'procedimiento' ? (
                                <div className="space-y-3 pt-1">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha y Hora</label>
                                        <input type="datetime-local" value={formProcedimiento.performed_at}
                                            onChange={e => setFormProcedimiento(f => ({ ...f, performed_at: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso (kg)</label>
                                        <input type="number" step="0.01" min="0" value={formProcedimiento.weight}
                                            onChange={e => setFormProcedimiento(f => ({ ...f, weight: e.target.value }))}
                                            placeholder="Ej: 12.5"
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Folio</label>
                                        <input type="text" value={formProcedimiento.folio}
                                            onChange={e => setFormProcedimiento(f => ({ ...f, folio: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</label>
                                        <select value={formProcedimiento.status}
                                            onChange={e => setFormProcedimiento(f => ({ ...f, status: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            <option value="completed">✅ Completada</option>
                                            <option value="scheduled">📅 Programada</option>
                                            <option value="cancelled">❌ Cancelada</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300 font-semibold">
                                            <input type="checkbox" checked={formProcedimiento.owner_present}
                                                onChange={e => setFormProcedimiento(f => ({ ...f, owner_present: e.target.checked }))}
                                                className="w-4 h-4 rounded text-purple-600" />
                                            Propietario presente
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300 font-semibold">
                                            <input type="checkbox" checked={formProcedimiento.consent_signed}
                                                onChange={e => setFormProcedimiento(f => ({ ...f, consent_signed: e.target.checked }))}
                                                className="w-4 h-4 rounded text-purple-600" />
                                            Consentimiento firmado
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Destino del Cuerpo</label>
                                        <select value={formProcedimiento.disposition}
                                            onChange={e => setFormProcedimiento(f => ({ ...f, disposition: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            <option value="">— Seleccionar —</option>
                                            {DISPOSITION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                        {(formProcedimiento.disposition === 'cremacion_individual' || formProcedimiento.disposition === 'cremacion_colectiva') && (
                                            <input type="text" value={formProcedimiento.cremation_provider}
                                                onChange={e => setFormProcedimiento(f => ({ ...f, cremation_provider: e.target.value }))}
                                                placeholder="Proveedor cremación"
                                                className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Autorización del Propietario</label>
                                        <textarea value={formProcedimiento.owner_authorization}
                                            onChange={e => setFormProcedimiento(f => ({ ...f, owner_authorization: e.target.value }))}
                                            rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas</label>
                                        <textarea value={formProcedimiento.notes}
                                            onChange={e => setFormProcedimiento(f => ({ ...f, notes: e.target.value }))}
                                            rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                                    </div>
                                    <button disabled={saving} onClick={() => saveSection(formProcedimiento)}
                                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition">
                                        {saving ? 'Guardando…' : '✓ Guardar cambios'}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <InfoRow label="Fecha y Hora"
                                        value={euthanasia.performed_at
                                            ? format(new Date(euthanasia.performed_at), "dd 'de' MMMM yyyy, HH:mm", { locale: es })
                                            : null} />
                                    <InfoRow label="Veterinario Responsable" value={euthanasia.veterinarian?.name} />
                                    <InfoRow label="Sucursal" value={euthanasia.branch?.name} />
                                </>
                            )}
                        </div>

                        {/* Acción completar si está programada */}
                        {euthanasia.status === 'scheduled' && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 space-y-3">
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Este procedimiento está PROGRAMADO. Una vez realizado, márcalo como completado.</p>
                                {!confirmComplete ? (
                                    <button onClick={() => setConfirmComplete(true)}
                                        className="w-full bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition">
                                        ✓ Marcar como Completado
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-red-600">⚠️ Esta acción marcará al paciente como FALLECIDO. ¿Confirmas?</p>
                                        <div className="flex gap-2">
                                            <button onClick={complete} className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-black hover:bg-red-700 transition">Confirmar</button>
                                            <button onClick={() => setConfirmComplete(false)} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-xs font-bold hover:bg-slate-300 transition">Cancelar</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Panel central y derecho ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ── Motivo Clínico ── */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo Clínico</p>
                                <EditSectionBtn onClick={() => openSection('motivo')} active={editSection === 'motivo'} />
                            </div>

                            {editSection === 'motivo' ? (
                                <div className="space-y-3 pt-1">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Causa Principal *</label>
                                        <select value={formMotivo.reason}
                                            onChange={e => setFormMotivo(f => ({ ...f, reason: e.target.value }))}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripción Clínica Detallada</label>
                                        <textarea value={formMotivo.reason_detail}
                                            onChange={e => setFormMotivo(f => ({ ...f, reason_detail: e.target.value }))}
                                            rows={5}
                                            placeholder="Describe el estado clínico, historial, diagnóstico y justificación..."
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                                    </div>
                                    <button disabled={saving} onClick={() => saveSection(formMotivo)}
                                        className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition">
                                        {saving ? 'Guardando…' : '✓ Guardar Motivo'}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="font-bold text-slate-800 dark:text-white">{euthanasia.reason}</p>
                                    {euthanasia.reason_detail && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl leading-relaxed">{euthanasia.reason_detail}</p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* ── Medicamentos ── */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicamentos / Fármacos Empleados</p>
                                <EditSectionBtn onClick={() => openSection('medicamentos')} active={editSection === 'medicamentos'} />
                            </div>

                            {editSection === 'medicamentos' ? (
                                <div className="space-y-4 pt-1">
                                    {/* Buscador de inventario */}
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={medSearch}
                                                onChange={e => searchMeds(e.target.value)}
                                                placeholder="Buscar medicamento del inventario…"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            {filteredProducts.length > 0 && (
                                                <div className="absolute z-40 w-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-44 overflow-auto">
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
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <div className={`w-9 h-5 rounded-full transition-colors relative ${allowManual ? 'bg-purple-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                                                onClick={() => setAllowManual(!allowManual)}>
                                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${allowManual ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Manual</span>
                                        </label>
                                    </div>

                                    {allowManual && (
                                        <button type="button" onClick={addManualMed}
                                            className="flex items-center gap-2 text-xs font-bold text-purple-600 hover:text-purple-800 transition">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                            Agregar medicamento no registrado en inventario
                                        </button>
                                    )}

                                    {/* Lista editable */}
                                    {editMeds.length === 0 ? (
                                        <div className="text-center py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-xs">
                                            Busca y agrega medicamentos
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {editMeds.map((med, idx) => (
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
                                                            { field: 'concentration', label: 'Concentración', placeholder: 'Ej: 390 mg/mL' },
                                                            { field: 'dose_mg_kg',    label: 'Dosis (mg/kg)', placeholder: 'Ej: 87' },
                                                            { field: 'total_dose',    label: 'Dosis Total',  placeholder: 'Ej: 87 mg' },
                                                            { field: 'volume_ml',     label: 'Volumen (mL)', placeholder: 'Ej: 5.5' },
                                                            { field: 'lot_number',    label: 'N° Lote',      placeholder: 'LOT-001' },
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
                                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Notas</p>
                                                        <input value={med.notes} onChange={e => updateMed(idx, 'notes', e.target.value)}
                                                            placeholder="Observaciones de aplicación…"
                                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button disabled={saving} onClick={() => saveSection({ medications: editMeds })}
                                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition">
                                        {saving ? 'Guardando…' : '✓ Guardar Medicamentos'}
                                    </button>
                                </div>
                            ) : (
                                medications.length === 0 ? (
                                    <p className="text-sm italic text-slate-400">Sin medicamentos registrados.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                                    {['Medicamento', 'Concentración', 'Dosis mg/kg', 'Total', 'Vol. (mL)', 'Vía', 'N° Lote', 'Notas'].map(h => (
                                                        <th key={h} className="pb-2 text-left text-[9px] font-black text-slate-400 uppercase tracking-wider pr-4">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                                {medications.map((m, i) => (
                                                    <tr key={i} className={m.is_controlled ? 'bg-red-50/40 dark:bg-red-900/10' : ''}>
                                                        <td className="py-2 pr-4 font-bold text-slate-800 dark:text-white whitespace-nowrap">
                                                            {m.is_controlled && <span className="text-[8px] text-red-500 font-black mr-1">⚠️</span>}
                                                            {m.name}
                                                        </td>
                                                        <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{m.concentration || '—'}</td>
                                                        <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{m.dose_mg_kg || '—'}</td>
                                                        <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{m.total_dose || '—'}</td>
                                                        <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{m.volume_ml || '—'}</td>
                                                        <td className="py-2 pr-4 font-bold text-slate-700 dark:text-slate-300">{m.route || '—'}</td>
                                                        <td className="py-2 pr-4 font-mono text-slate-500">{m.lot_number || '—'}</td>
                                                        <td className="py-2 text-slate-500 italic">{m.notes || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Contexto familiar */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                Contexto y Disposición
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className={`p-3 rounded-xl border text-center ${euthanasia.owner_present ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-700'}`}>
                                    <p className="text-lg">{euthanasia.owner_present ? '✅' : '❌'}</p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase mt-1">Propietario presente</p>
                                </div>
                                <div className={`p-3 rounded-xl border text-center ${euthanasia.consent_signed ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-700'}`}>
                                    <p className="text-lg">{euthanasia.consent_signed ? '✅' : '❌'}</p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase mt-1">Consentimiento firmado</p>
                                </div>
                                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-center col-span-2">
                                    <p className="text-lg">{euthanasia.disposition ? DISPOSITION_LABELS[euthanasia.disposition] : '—'}</p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase mt-1">Destino del cuerpo</p>
                                    {euthanasia.cremation_provider && <p className="text-xs text-slate-500 mt-0.5">{euthanasia.cremation_provider}</p>}
                                </div>
                            </div>
                            {euthanasia.owner_authorization && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-wider mb-1">Autorización del Propietario</p>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">"{euthanasia.owner_authorization}"</p>
                                </div>
                            )}
                        </div>

                        {/* Notas */}
                        {euthanasia.notes && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notas del Procedimiento</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">{euthanasia.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
