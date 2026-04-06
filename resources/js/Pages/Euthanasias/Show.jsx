import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import MedicationsEditor from '@/Components/MedicationsEditor';
import PrintDocumentModal from '@/Components/PrintDocumentModal';
import PendingChargesEditor from '@/Components/PendingChargesEditor';

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
export default function Show({ auth, euthanasia: initialEuthanasia, products = [], documentTemplates = [] }) {
    const permissions = auth.permissions || [];
    const can = (permission) => permissions.includes(permission) || auth.user.role === 'admin';
    const canManage = can('manage euthanasias');

    const [euthanasia, setEuthanasia] = useState(initialEuthanasia);
    const [confirmComplete, setConfirmComplete] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [pendingCharges, setPendingCharges] = useState([]);

    // Sincronizar estado local con props de Inertia
    React.useEffect(() => {
        setEuthanasia(initialEuthanasia);
    }, [initialEuthanasia]);

    // Estados de edición por sección
    const [editSection, setEditSection] = useState(null); // 'procedimiento' | 'motivo' | 'medicamentos' | 'contexto'
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Forma local por sección
    const [formProcedimiento, setFormProcedimiento] = useState({
        performed_at: euthanasia.performed_at ? euthanasia.performed_at.slice(0, 16) : '',
        weight: euthanasia.weight || '',
        folio: euthanasia.folio || '',
        status: euthanasia.status || 'completed',
        veterinarian_id: euthanasia.veterinarian_id || '',
    });

    const [formNotas, setFormNotas] = useState({
        notes: euthanasia.notes || '',
    });

    const [formContexto, setFormContexto] = useState({
        owner_present: euthanasia.owner_present || false,
        consent_signed: euthanasia.consent_signed || false,
        owner_name_override: euthanasia.owner_name_override || '',
        disposition: euthanasia.disposition || '',
        cremation_provider: euthanasia.cremation_provider || '',
        owner_authorization: euthanasia.owner_authorization || '',
    });

    const [formMotivo, setFormMotivo] = useState({
        reason: euthanasia.reason || REASONS[0],
        reason_detail: euthanasia.reason_detail || '',
    });

    const medications = euthanasia.medications || [];

    const handleSaveMeds = (meds) => {
        saveSection({ medications: meds });
    };

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
                if (payload.pending_charges) setPendingCharges([]);
            },
            onError: () => {
                setSaving(false);
                setSaveError('Error al guardar. Verifica los datos e intenta de nuevo.');
            },
        });
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
            });
        }
        if (section === 'notas') {
            setFormNotas({
                notes: euthanasia.notes || '',
            });
        }
        if (section === 'contexto') {
            setFormContexto({
                owner_present: euthanasia.owner_present || false,
                consent_signed: euthanasia.consent_signed || false,
                owner_name_override: euthanasia.owner_name_override || '',
                disposition: euthanasia.disposition || '',
                cremation_provider: euthanasia.cremation_provider || '',
                owner_authorization: euthanasia.owner_authorization || '',
            });
        }
        if (section === 'motivo') {
            setFormMotivo({ reason: euthanasia.reason || REASONS[0], reason_detail: euthanasia.reason_detail || '' });
        }
        if (section === 'medicamentos') {
            // No longer needed as MedicationsEditor handles its own local state or we can just pass onSave
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
                        
                        {canManage && (
                            <button 
                                onClick={() => setShowPrintModal(true)}
                                className="flex items-center gap-2 bg-white text-purple-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition hover:bg-purple-100 shadow-lg"
                            >
                                🖨️ Imprimir Documentos
                            </button>
                        )}
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
                                {canManage && <EditSectionBtn onClick={() => openSection('procedimiento')} active={editSection === 'procedimiento'} />}
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
                                    <InfoRow label="Peso (kg)" value={euthanasia.weight ? `${euthanasia.weight} kg` : null} />
                                </>
                            )}
                        </div>

                        {/* Acción completar si está programada */}
                        {(canManage && euthanasia.status === 'scheduled') && (
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
                                {canManage && <EditSectionBtn onClick={() => openSection('motivo')} active={editSection === 'motivo'} />}
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
                        <MedicationsEditor 
                            title="Tratamiento Base O Fármacos Programados"
                            medications={euthanasia.medications}
                            products={products.filter(p => !p.is_service)}
                            canManage={canManage}
                            onSave={handleSaveMeds}
                        />

                        {/* Cargos a Caja */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargos a Caja (Punto de Venta)</p>
                            </div>
                            <PendingChargesEditor 
                                charges={pendingCharges}
                                onAddCharge={(charge) => setPendingCharges([...pendingCharges, charge])}
                                onRemoveCharge={(index) => setPendingCharges(pendingCharges.filter((_, i) => i !== index))}
                                onUpdateCharge={(index, data) => {
                                    const newCharges = [...pendingCharges];
                                    newCharges[index] = { ...newCharges[index], ...data };
                                    setPendingCharges(newCharges);
                                }}
                                products={products}
                                allowSave={true}
                                onSave={() => saveSection({ pending_charges: pendingCharges })}
                            />
                        </div>

                        {/* Contexto familiar */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contexto y Disposición</p>
                                {canManage && <EditSectionBtn onClick={() => openSection('contexto')} active={editSection === 'contexto'} />}
                            </div>

                            {editSection === 'contexto' ? (
                                <div className="space-y-4 pt-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <input type="checkbox" checked={formContexto.owner_present}
                                                onChange={e => setFormContexto(f => ({ ...f, owner_present: e.target.checked }))}
                                                className="w-4 h-4 rounded text-purple-600" />
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Dueño presente</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <input type="checkbox" checked={formContexto.consent_signed}
                                                onChange={e => setFormContexto(f => ({ ...f, consent_signed: e.target.checked }))}
                                                className="w-4 h-4 rounded text-purple-600" />
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Firma registrada</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre de quien Firma/Autoriza</label>
                                        <input type="text" value={formContexto.owner_name_override}
                                            onChange={e => setFormContexto(f => ({ ...f, owner_name_override: e.target.value }))}
                                            placeholder={euthanasia.pet?.owner?.name || 'Nombre responsable'}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Destino del Cuerpo</label>
                                        <select value={formContexto.disposition}
                                            onChange={e => setFormContexto(f => ({ ...f, disposition: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            <option value="">— Seleccionar —</option>
                                            {DISPOSITION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                        {(formContexto.disposition === 'cremacion_individual' || formContexto.disposition === 'cremacion_colectiva') && (
                                            <input type="text" value={formContexto.cremation_provider}
                                                onChange={e => setFormContexto(f => ({ ...f, cremation_provider: e.target.value }))}
                                                placeholder="Proveedor cremación"
                                                className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Autorización del Propietario (Texto)</label>
                                        <textarea value={formContexto.owner_authorization}
                                            onChange={e => setFormContexto(f => ({ ...f, owner_authorization: e.target.value }))}
                                            rows={4} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                                    </div>
                                    <button disabled={saving} onClick={() => saveSection(formContexto)}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg">
                                        {saving ? 'Guardando…' : '✓ Guardar Contexto'}
                                    </button>
                                </div>
                            ) : (
                                <>
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
                                    {(euthanasia.owner_name_override || euthanasia.pet?.owner?.name) && (
                                        <div className="pt-2">
                                            <InfoRow label="Firmante / Responsable en registro" value={euthanasia.owner_name_override || euthanasia.pet?.owner?.name} />
                                        </div>
                                    )}
                                    {euthanasia.owner_authorization && (
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-wider mb-1">Autorización del Propietario</p>
                                            <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">"{euthanasia.owner_authorization}"</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Notas */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas del Procedimiento</p>
                                {canManage && <EditSectionBtn onClick={() => openSection('notas')} active={editSection === 'notas'} />}
                            </div>
                            
                            {editSection === 'notas' ? (
                                <div className="space-y-3 pt-1">
                                    <textarea value={formNotas.notes}
                                        onChange={e => setFormNotas({ notes: e.target.value })}
                                        rows={4} 
                                        placeholder="Cualquier observación adicional sobre la aplicación, comportamiento del paciente, tiempo de acción, etc."
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                                    <button disabled={saving} onClick={() => saveSection(formNotas)}
                                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition">
                                        {saving ? 'Guardando…' : '✓ Guardar Notas'}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">{euthanasia.notes || 'Sin notas registradas.'}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <PrintDocumentModal 
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
                pet={euthanasia.pet}
                documentTemplates={documentTemplates}
                customPrintRoute={(template) => route('euthanasias.consent.print', { euthanasia: euthanasia.id, template: template.id })}
            >
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reportes Especiales</p>
                    <a
                        href={route('euthanasias.report', euthanasia.id)}
                        target="_blank"
                        className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-2xl hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all group"
                    >
                        <span className="text-xl">📋</span>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-bold text-sm text-purple-700 dark:text-purple-300 truncate">Reporte Técnico de Eutanasia</p>
                            <p className="text-[9px] font-black text-purple-400 uppercase tracking-tighter">Documento clínico completo</p>
                        </div>
                    </a>
                </div>
            </PrintDocumentModal>
        </AuthenticatedLayout>
    );
}
