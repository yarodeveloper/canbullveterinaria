import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PrintDocumentModal from '@/Components/PrintDocumentModal';
import MedicationsEditor from '@/Components/MedicationsEditor';
import PendingChargesEditor from '@/Components/PendingChargesEditor';

const VITAL_RANGES = {
    Canino: {
        Cachorro: { hr: [100, 120], rr: [15, 20], temp: [38.5, 39.5], crt: [0.5, 1.5] },
        Adulto: { hr: [80, 100], rr: [10, 30], temp: [38, 39], crt: [1, 2] },
        Seniles: { hr: [70, 90], rr: [14, 18], temp: [37.5, 38.5], crt: [1.5, 2.5] }
    },
    Felino: {
        Cachorro: { hr: [130, 150], rr: [15, 35], temp: [38, 38.5], crt: [0.5, 1] },
        Adulto: { hr: [120, 140], rr: [20, 40], temp: [38, 39], crt: [1, 2] },
        Seniles: { hr: [100, 120], rr: [15, 30], temp: [36.7, 38.9], crt: [1.5, 2] }
    }
};

const getAgeGroup = (dobString) => {
    if (!dobString) return 'Adulto';
    const dob = new Date(dobString);
    const now = new Date();
    let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (months < 12) return 'Cachorro';
    if (months > 84) return 'Seniles';
    return 'Adulto';
};

const checkRange = (species, dobString, type, value) => {
    if (!value || isNaN(parseFloat(value)) || value === '') return null;
    const lowerSpecies = species?.toLowerCase();
    const sp = (lowerSpecies === 'canino' || lowerSpecies === 'perro') ? 'Canino' : 'Felino';

    const ageGroup = getAgeGroup(dobString);
    const range = VITAL_RANGES[sp]?.[ageGroup]?.[type];
    if (!range) return null;

    const val = parseFloat(value);
    if (val < range[0]) return 'low';
    if (val > range[1]) return 'high';
    return 'normal';
};

const WarningIcon = ({ status, range }) => {
    if (status === 'low') return <span title={`Anormal (Bajo). Rango normal: ${range[0]} - ${range[1]}`} className="text-[9px] text-blue-500 font-black animate-pulse bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded ml-1 whitespace-nowrap border border-blue-200 dark:border-blue-800">▼ BAJO ({range[0]}-{range[1]})</span>;
    if (status === 'high') return <span title={`Anormal (Alto). Rango normal: ${range[0]} - ${range[1]}`} className="text-[9px] text-red-500 font-black animate-pulse bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded ml-1 whitespace-nowrap border border-red-200 dark:border-red-800">▲ ALTO ({range[0]}-{range[1]})</span>;
    return null;
};

export default function Show({ auth, surgery, templates, veterinarians, branches, products = [], settings = {} }) {
    const permissions = auth.permissions || [];
    const can = (permission) => permissions.includes(permission) || auth.user.role === 'admin';
    const canManage = can('manage surgeries');

    const [vitalSigns, setVitalSigns] = useState(surgery.vital_signs || { weight: '', hr: '', rr: '', temp: '', crt: '', bcs: '' });
    const [postVitalSigns, setPostVitalSigns] = useState(surgery.post_vital_signs || { weight: '', hr: '', rr: '', temp: '', crt: '', bcs: '' });
    const [activeTab, setActiveTab] = useState('pre_op');
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [checklist, setChecklist] = useState(surgery.checklist || { pre_op: [], intra_op: [], post_op: [] });
    const [notes, setNotes] = useState({
        pre: surgery.pre_op_notes || '',
        intra: surgery.intra_op_notes || '',
        post: surgery.post_op_notes || ''
    });
    const [isEditingPreOp, setIsEditingPreOp] = useState(false);
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [teamData, setTeamData] = useState({
        veterinarian_id: surgery.veterinarian_id || '',
        anesthesiologist_id: surgery.anesthesiologist_id || '',
        asa_classification: surgery.asa_classification || '',
        branch_id: surgery.branch_id || ''
    });
    const [pendingCharges, setPendingCharges] = useState([]);

    const EditIcon = ({ onClick }) => (
        <button
            onClick={onClick}
            type="button"
            className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-brand-primary transition-colors z-20 block p-1"
            title="Editar Información"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
        </button>
    );

    const saveTeam = () => {
        updateSurgery(teamData);
        setIsEditingTeam(false);
    };

    const toggleCheckItem = (group, index) => {
        const newChecklist = { ...checklist };
        newChecklist[group][index].checked = !newChecklist[group][index].checked;
        setChecklist(newChecklist);
        updateSurgery({ checklist: newChecklist });
    };

    const updateSurgery = (data) => {
        router.patch(route('surgeries.update', surgery.id), data, {
            preserveScroll: true,
            onSuccess: () => {
                if (data.pending_charges) setPendingCharges([]);
            }
        });
    };

    const startSurgery = () => {
        if (confirm('¿Deseas iniciar el procedimiento quirúrgico ahora?')) {
            router.patch(route('surgeries.update', surgery.id), {
                status: 'in-progress',
                start_time: new Date().toISOString()
            });
        }
    };

    const endSurgery = () => {
        if (confirm('¿Confirmas que el procedimiento ha terminado?')) {
            router.patch(route('surgeries.update', surgery.id), {
                status: 'completed',
                end_time: new Date().toISOString(),
                intra_op_notes: notes.intra,
                post_op_notes: notes.post,
                vital_signs: vitalSigns
            });
        }
    };

    const saveVitals = () => {
        updateSurgery({ vital_signs: vitalSigns, intra_op_notes: notes.intra });
    };

    const savePostVitals = () => {
        updateSurgery({ post_vital_signs: postVitalSigns, post_op_notes: notes.post });
    };

    const goToHospitalization = () => {
        router.get(route('hospitalizations.create', { pet_id: surgery.pet.id, prior_surgery: surgery.id }));
    };

    const statusMap = {
        scheduled: { label: 'PROGRAMADA', color: 'bg-blue-500' },
        'in-progress': { label: 'EN QUIRÓFANO', color: 'bg-amber-500 animate-pulse' },
        completed: { label: 'FINALIZADA', color: 'bg-emerald-500' },
        cancelled: { label: 'CANCELADA', color: 'bg-red-500' },
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href={route('surgeries.index')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <span className="text-xl">←</span>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-tighter">
                            Protocolo Quirúrgico: <span className="text-brand-primary">{surgery.surgery_type}</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {canManage && (
                            <button
                                onClick={() => setShowPrintModal(true)}
                                className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-brand-primary text-brand-primary rounded-full text-[10px] font-black uppercase hover:bg-brand-primary hover:text-white transition shadow-sm"
                            >
                                🖨️ Imprimir
                            </button>
                        )}
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-lg ${statusMap[surgery.status]?.color}`}>
                            {statusMap[surgery.status]?.label}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title={`Cirugía - ${surgery.pet.name}`} />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        {/* Panel Izquierdo: Información Paciente y Equipo */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 overflow-hidden shadow-xl">
                                <div className="p-8">
                                    <div className="text-center mb-8">
                                        <div className="w-24 h-24 bg-brand-primary/10 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-4 border-2 border-brand-primary/20">
                                            {surgery.pet.species === 'Canino' ? '🐕' : '🐈'}
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{surgery.pet.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{surgery.pet.breed} • {surgery.pet.gender === 'male' ? 'MACHO' : 'HEMBRA'}</p>
                                    </div>

                                    <div className="space-y-6 border-t dark:border-gray-700 pt-6">
                                        <div className="relative group bg-white dark:bg-gray-800 rounded-2xl">
                                            {isEditingTeam ? (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Editar Equipo Médico</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Cirujano</label>
                                                        <select value={teamData.veterinarian_id} onChange={e => setTeamData({ ...teamData, veterinarian_id: e.target.value })} className="w-full text-sm rounded-xl py-2 px-3 border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-brand-primary focus:border-brand-primary">
                                                            <option value="">Selecciona cirujano...</option>
                                                            {veterinarians?.map(v => (
                                                                <option key={v.id} value={v.id}>
                                                                    {v.name} {v.role ? `(${v.role === 'admin' ? 'Administrador' : (v.role === 'vet' ? 'Médico Veterinario' : (v.role === 'groomer' ? 'Estilista' : v.role))})` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Anestesiólogo</label>
                                                        <select value={teamData.anesthesiologist_id} onChange={e => setTeamData({ ...teamData, anesthesiologist_id: e.target.value })} className="w-full text-sm rounded-xl py-2 px-3 border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-brand-primary focus:border-brand-primary">
                                                            <option value="">Selecciona anestesiólogo...</option>
                                                            {veterinarians?.map(v => (
                                                                <option key={v.id} value={v.id}>
                                                                    {v.name} {v.role ? `(${v.role === 'admin' ? 'Administrador' : (v.role === 'vet' ? 'Médico Veterinario' : (v.role === 'groomer' ? 'Estilista' : v.role))})` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Riesgo ASA</label>
                                                            <select value={teamData.asa_classification} onChange={e => setTeamData({ ...teamData, asa_classification: e.target.value })} className="w-full text-sm rounded-xl py-2 px-3 border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-brand-primary focus:border-brand-primary">
                                                                <option value="">N/A</option>
                                                                <option value="I">ASA I</option>
                                                                <option value="II">ASA II</option>
                                                                <option value="III">ASA III</option>
                                                                <option value="IV">ASA IV</option>
                                                                <option value="V">ASA V</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Sucursal</label>
                                                            <select value={teamData.branch_id} onChange={e => setTeamData({ ...teamData, branch_id: e.target.value })} className="w-full text-sm rounded-xl py-2 px-3 border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-brand-primary focus:border-brand-primary">
                                                                <option value="">Selecciona...</option>
                                                                {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 pt-2">
                                                        <button onClick={saveTeam} className="flex-1 bg-brand-primary text-white font-bold py-2 rounded-xl text-xs">Guardar</button>
                                                        <button onClick={() => setIsEditingTeam(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-2 rounded-xl text-xs">Cancelar</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {(canManage && !isEditingTeam) && <EditIcon onClick={() => setIsEditingTeam(true)} />}
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 leading-none">Equipo Médico</p>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center text-sm">🔪</div>
                                                                <div>
                                                                    <p className="text-[9px] font-bold text-gray-500 uppercase leading-none">Cirujano</p>
                                                                    <p className="text-sm font-black text-gray-800 dark:text-gray-200">{surgery.lead_surgeon?.name || 'No asignado'}</p>
                                                                </div>
                                                            </div>
                                                            {surgery.anesthesiologist && (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center text-sm">💉</div>
                                                                    <div>
                                                                        <p className="text-[9px] font-bold text-gray-500 uppercase leading-none">Anestesiólogo</p>
                                                                        <p className="text-sm font-black text-gray-800 dark:text-gray-200">{surgery.anesthesiologist?.name || 'No asignado'}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Riesgo ASA</p>
                                                            <p className="text-[15px] font-black text-brand-primary text-center">ASA {surgery.asa_classification || '-'}</p>
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Sucursal</p>
                                                            <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 text-center leading-tight flex items-center justify-center h-full pb-1">{surgery.branch?.name}</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {(canManage && surgery.status === 'scheduled') && (
                                            <button
                                                onClick={startSurgery}
                                                className="w-full bg-brand-primary text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-50 transition-all active:scale-95"
                                            >
                                                Iniciar Cirugía
                                            </button>
                                        )}
                                        {(canManage && surgery.status === 'in-progress') && (
                                            <button
                                                onClick={endSurgery}
                                                className="w-full bg-emerald-500 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all active:scale-95"
                                            >
                                                Finalizar Procedimiento
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel Central/Derecho: Procedimiento y Checklists */}
                        <div className="mt-8 lg:mt-0 lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-xl min-h-[600px] flex flex-col">
                                {/* Navegación de Protocolos */}
                                <div className="flex p-2 bg-gray-50 dark:bg-gray-900/50 rounded-t-[2.5rem] border-b dark:border-gray-700">
                                    {[
                                        { id: 'pre_op', label: 'PRE-OPERATORIO', icon: '📝' },
                                        { id: 'intra_op', label: 'INTRA-OPERATORIO', icon: '🩺' },
                                        { id: 'post_op', label: 'POST-OPERATORIO', icon: '🏠' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all ${activeTab === tab.id
                                                ? 'bg-white dark:bg-gray-800 text-brand-primary shadow-sm border dark:border-gray-700'
                                                : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            <span className="text-xl">{tab.icon}</span> {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-8 flex-1">
                                    {/* Contenido Checklists */}
                                    <div className="mb-10">
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                                            Checklist de Seguridad Cirugía
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {checklist[activeTab].map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => canManage && surgery.status !== 'completed' && toggleCheckItem(activeTab, idx)}
                                                    className={`p-4 rounded-2xl border transition-all ${canManage ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'} flex items-center justify-between ${item.checked
                                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/30'
                                                        : 'bg-white dark:bg-gray-900/40 border-gray-100 dark:border-gray-700'
                                                        }`}
                                                >
                                                    <span className={`font-bold ${item.checked ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {item.label}
                                                    </span>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.checked
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : 'border-gray-200 dark:border-gray-600'
                                                        }`}>
                                                        {item.checked && '✓'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notas Clínicas del Segmento */}
                                    {activeTab === 'pre_op' && (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Documentos Legales (Consentimientos y Actas)</h4>
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    {canManage && (
                                                        <button
                                                            onClick={() => setShowPrintModal(true)}
                                                            className="flex-1 flex items-center justify-center gap-3 py-3 bg-brand-primary/10 text-brand-primary rounded-2xl text-[10px] font-black uppercase tracking-widest border border-brand-primary/20 hover:bg-brand-primary/20 transition active:scale-95"
                                                        >
                                                            📄 Imprimir Docs. Legales
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <MedicationsEditor 
                                                medications={surgery.pre_operative_medications || []}
                                                onSave={(meds) => {
                                                    updateSurgery({ pre_operative_medications: meds });
                                                }}
                                                products={products.filter(p => !p.is_service)}
                                                canManage={canManage && surgery.status !== 'completed'}
                                                title="Fármacos Pre-Operatorios"
                                                iconColor="bg-blue-500"
                                            />

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Notas Pre-operatorias</h4>
                                                    {canManage && (
                                                        <button
                                                            onClick={() => {
                                                                if (isEditingPreOp) {
                                                                    updateSurgery({ pre_op_notes: notes.pre });
                                                                }
                                                                setIsEditingPreOp(!isEditingPreOp);
                                                            }}
                                                            className="text-[10px] bg-white dark:bg-gray-800 text-brand-primary border border-gray-200 dark:border-gray-700 font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 transition"
                                                        >
                                                            {isEditingPreOp ? (
                                                                <>
                                                                    <span>💾</span> Guardar
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>✏️</span> Editar
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>

                                                {isEditingPreOp ? (
                                                    <textarea
                                                        value={notes.pre}
                                                        onChange={e => setNotes({ ...notes, pre: e.target.value })}
                                                        autoFocus
                                                        placeholder="Ingresa las notas y observaciones pre-quirúrgicas..."
                                                        className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-3xl py-6 px-8 focus:ring-brand-primary focus:border-brand-primary font-medium min-h-[150px] shadow-inner"
                                                    ></textarea>
                                                ) : (
                                                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border dark:border-gray-700 italic text-gray-600 dark:text-gray-400 min-h-[100px]">
                                                        {surgery.pre_op_notes || "Sin observaciones previas al ingreso. Haz clic en Editar para agregar notas."}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'intra_op' && (
                                        <div className="space-y-8">
                                            {/* Signos Vitales Pre-Qx */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                                                        Constantes Anestésicas / Signos Vitales
                                                    </h4>
                                                    {surgery.status !== 'completed' && (
                                                        <button onClick={saveVitals} className="text-[9px] bg-gray-100 dark:bg-gray-700 font-bold px-3 py-1 rounded-lg hover:bg-gray-200 transition">
                                                            GUARDAR CONSTANTES
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                                                    {/* Weight */}
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-brand-primary">
                                                        <label className="text-[8px] font-black text-gray-400 uppercase block">Peso</label>
                                                        <div className="flex items-baseline">
                                                            <input type="text" value={vitalSigns.weight || ''} onChange={e => setVitalSigns({ ...vitalSigns, weight: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-base font-black text-gray-900 dark:text-white placeholder-gray-300" placeholder="0" />
                                                            <span className="text-gray-400 text-[9px] font-bold ml-0.5">kg</span>
                                                        </div>
                                                    </div>
                                                    {/* Temp */}
                                                    <div className={`px-3 py-2 rounded-xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-amber-500 ${checkRange(surgery.pet.species, surgery.pet.dob, 'temp', vitalSigns.temp) === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-red-400' : checkRange(surgery.pet.species, surgery.pet.dob, 'temp', vitalSigns.temp) === 'low' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-400' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                                                        <div className="flex items-center gap-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">Temp</label>
                                                            <WarningIcon status={checkRange(surgery.pet.species, surgery.pet.dob, 'temp', vitalSigns.temp)} range={VITAL_RANGES[(surgery.pet.species?.toLowerCase() === 'canino' || surgery.pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(surgery.pet.dob)]?.['temp']} />
                                                        </div>
                                                        <div className="flex items-baseline">
                                                            <input type="text" value={vitalSigns.temp || ''} onChange={e => setVitalSigns({ ...vitalSigns, temp: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-base font-black text-gray-900 dark:text-white placeholder-gray-300" placeholder="0.0" />
                                                            <span className="text-gray-400 text-[9px] font-bold ml-0.5">°C</span>
                                                        </div>
                                                    </div>
                                                    {/* HR */}
                                                    <div className={`px-3 py-2 rounded-xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-rose-500 ${checkRange(surgery.pet.species, surgery.pet.dob, 'hr', vitalSigns.hr) === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-red-400' : checkRange(surgery.pet.species, surgery.pet.dob, 'hr', vitalSigns.hr) === 'low' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-400' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                                                        <div className="flex items-center gap-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">F.C.</label>
                                                            <WarningIcon status={checkRange(surgery.pet.species, surgery.pet.dob, 'hr', vitalSigns.hr)} range={VITAL_RANGES[(surgery.pet.species?.toLowerCase() === 'canino' || surgery.pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(surgery.pet.dob)]?.['hr']} />
                                                        </div>
                                                        <div className="flex items-baseline">
                                                            <input type="text" value={vitalSigns.hr || ''} onChange={e => setVitalSigns({ ...vitalSigns, hr: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-base font-black text-rose-500 placeholder-gray-300" placeholder="0" />
                                                            <span className="text-gray-400 text-[9px] font-bold ml-0.5">bpm</span>
                                                        </div>
                                                    </div>
                                                    {/* RR */}
                                                    <div className={`px-3 py-2 rounded-xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 ${checkRange(surgery.pet.species, surgery.pet.dob, 'rr', vitalSigns.rr) === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-red-400' : checkRange(surgery.pet.species, surgery.pet.dob, 'rr', vitalSigns.rr) === 'low' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-400' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                                                        <div className="flex items-center gap-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">F.R.</label>
                                                            <WarningIcon status={checkRange(surgery.pet.species, surgery.pet.dob, 'rr', vitalSigns.rr)} range={VITAL_RANGES[(surgery.pet.species?.toLowerCase() === 'canino' || surgery.pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(surgery.pet.dob)]?.['rr']} />
                                                        </div>
                                                        <div className="flex items-baseline">
                                                            <input type="text" value={vitalSigns.rr || ''} onChange={e => setVitalSigns({ ...vitalSigns, rr: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-base font-black text-gray-900 dark:text-white placeholder-gray-300" placeholder="0" />
                                                            <span className="text-gray-400 text-[9px] font-bold ml-0.5">rpm</span>
                                                        </div>
                                                    </div>
                                                    {/* BCS */}
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-emerald-500">
                                                        <label className="text-[8px] font-black text-gray-400 uppercase block">CC</label>
                                                        <input type="text" value={vitalSigns.bcs || ''} onChange={e => setVitalSigns({ ...vitalSigns, bcs: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-base font-black text-gray-900 dark:text-white placeholder-gray-300" placeholder="Ej: 5" />
                                                    </div>
                                                    {/* CRT */}
                                                    <div className={`px-3 py-2 rounded-xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 ${checkRange(surgery.pet.species, surgery.pet.dob, 'crt', vitalSigns.crt) === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-red-400' : checkRange(surgery.pet.species, surgery.pet.dob, 'crt', vitalSigns.crt) === 'low' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-400' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                                                        <div className="flex items-center gap-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">TLLC</label>
                                                            <WarningIcon status={checkRange(surgery.pet.species, surgery.pet.dob, 'crt', vitalSigns.crt)} range={VITAL_RANGES[(surgery.pet.species?.toLowerCase() === 'canino' || surgery.pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(surgery.pet.dob)]?.['crt']} />
                                                        </div>
                                                        <div className="flex items-baseline">
                                                            <input type="text" value={vitalSigns.crt || ''} onChange={e => setVitalSigns({ ...vitalSigns, crt: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-base font-black text-gray-900 dark:text-white placeholder-gray-300" placeholder="0" />
                                                            <span className="text-gray-400 text-[9px] font-bold ml-0.5">s</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Registro Quirúrgico (Relato)</h4>
                                                    {(canManage && surgery.status !== 'completed') && (
                                                        <button onClick={endSurgery} className="text-[10px] bg-brand-primary text-white font-black px-4 py-1.5 rounded-lg shadow hover:opacity-90 transition">
                                                            GUARDAR HOJA
                                                        </button>
                                                    )}
                                                </div>
                                                <textarea
                                                    readOnly={!canManage}
                                                    value={notes.intra || ''}
                                                    onChange={e => setNotes({ ...notes, intra: e.target.value })}
                                                    placeholder="Describe el hallazgo, técnica utilizada, complicaciones, etc..."
                                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 rounded-3xl py-6 px-8 focus:ring-brand-primary focus:border-brand-primary font-medium min-h-[250px]"
                                                ></textarea>
                                            </div>

                                            <MedicationsEditor 
                                                medications={surgery.intra_operative_medications || []}
                                                onSave={(meds) => {
                                                    updateSurgery({ intra_operative_medications: meds });
                                                }}
                                                products={products.filter(p => !p.is_service)}
                                                canManage={canManage && surgery.status !== 'completed'}
                                                title="Fármacos Intra-Operatorios (Anestesia / Fluidos...)"
                                                iconColor="bg-amber-500"
                                            />

                                            <div className="pt-6 border-t dark:border-gray-700">
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
                                                    onSave={() => updateSurgery({ pending_charges: pendingCharges })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'post_op' && (
                                        <div className="space-y-6">
                                            {/* Post-op Vitals */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                                        Constantes Post-Operatorias
                                                    </h4>
                                                    {surgery.status !== 'completed' && (
                                                        <button onClick={savePostVitals} className="text-[9px] bg-gray-100 dark:bg-gray-700 font-bold px-3 py-1 rounded-lg hover:bg-gray-200 transition">
                                                            GUARDAR CONSTANTES
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-brand-primary">
                                                        <label className="text-[8px] font-black text-gray-400 uppercase block">Peso</label>
                                                        <div className="flex items-baseline">
                                                            <input type="text" value={postVitalSigns.weight || ''} onChange={e => setPostVitalSigns({ ...postVitalSigns, weight: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-base font-black text-gray-900 dark:text-white placeholder-gray-300" placeholder="0" />
                                                            <span className="text-gray-400 text-[9px] font-bold ml-0.5">kg</span>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-2 rounded-xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-amber-500 ${checkRange(surgery.pet.species, surgery.pet.dob, 'temp', postVitalSigns.temp) === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-red-400' : checkRange(surgery.pet.species, surgery.pet.dob, 'temp', postVitalSigns.temp) === 'low' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-400' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                                                        <div className="flex items-center gap-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">Temp</label>
                                                            <WarningIcon status={checkRange(surgery.pet.species, surgery.pet.dob, 'temp', postVitalSigns.temp)} range={VITAL_RANGES[(surgery.pet.species?.toLowerCase() === 'canino' || surgery.pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(surgery.pet.dob)]?.['temp']} />
                                                        </div>
                                                        <div className="flex items-baseline">
                                                            <input type="text" value={postVitalSigns.temp || ''} onChange={e => setPostVitalSigns({ ...postVitalSigns, temp: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-base font-black text-gray-900 dark:text-white placeholder-gray-300" placeholder="0.0" />
                                                            <span className="text-gray-400 text-[9px] font-bold ml-0.5">°C</span>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-2 rounded-xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-rose-500 ${checkRange(surgery.pet.species, surgery.pet.dob, 'hr', postVitalSigns.hr) === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-red-400' : checkRange(surgery.pet.species, surgery.pet.dob, 'hr', postVitalSigns.hr) === 'low' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-400' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                                                        <div className="flex items-center gap-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">F.C.</label>
                                                            <WarningIcon status={checkRange(surgery.pet.species, surgery.pet.dob, 'hr', postVitalSigns.hr)} range={VITAL_RANGES[(surgery.pet.species?.toLowerCase() === 'canino' || surgery.pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(surgery.pet.dob)]?.['hr']} />
                                                        </div>
                                                        <div className="flex items-baseline">
                                                            <input type="text" value={postVitalSigns.hr || ''} onChange={e => setPostVitalSigns({ ...postVitalSigns, hr: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-base font-black text-rose-500 placeholder-gray-300" placeholder="0" />
                                                            <span className="text-gray-400 text-[9px] font-bold ml-0.5">bpm</span>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-2 rounded-xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 ${checkRange(surgery.pet.species, surgery.pet.dob, 'rr', postVitalSigns.rr) === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-red-400' : checkRange(surgery.pet.species, surgery.pet.dob, 'rr', postVitalSigns.rr) === 'low' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-400' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                                                        <div className="flex items-center gap-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">F.R.</label>
                                                            <WarningIcon status={checkRange(surgery.pet.species, surgery.pet.dob, 'rr', postVitalSigns.rr)} range={VITAL_RANGES[(surgery.pet.species?.toLowerCase() === 'canino' || surgery.pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(surgery.pet.dob)]?.['rr']} />
                                                        </div>
                                                        <div className="flex items-baseline">
                                                            <input type="text" value={postVitalSigns.rr || ''} onChange={e => setPostVitalSigns({ ...postVitalSigns, rr: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-base font-black text-gray-900 dark:text-white placeholder-gray-300" placeholder="0" />
                                                            <span className="text-gray-400 text-[9px] font-bold ml-0.5">rpm</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-emerald-500">
                                                        <label className="text-[8px] font-black text-gray-400 uppercase block">CC</label>
                                                        <input type="text" value={postVitalSigns.bcs || ''} onChange={e => setPostVitalSigns({ ...postVitalSigns, bcs: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-base font-black text-gray-900 dark:text-white placeholder-gray-300" placeholder="Ej: 5" />
                                                    </div>
                                                    <div className={`px-3 py-2 rounded-xl border dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 ${checkRange(surgery.pet.species, surgery.pet.dob, 'crt', postVitalSigns.crt) === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-red-400' : checkRange(surgery.pet.species, surgery.pet.dob, 'crt', postVitalSigns.crt) === 'low' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-400' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                                                        <div className="flex items-center gap-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase">TLLC</label>
                                                            <WarningIcon status={checkRange(surgery.pet.species, surgery.pet.dob, 'crt', postVitalSigns.crt)} range={VITAL_RANGES[(surgery.pet.species?.toLowerCase() === 'canino' || surgery.pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(surgery.pet.dob)]?.['crt']} />
                                                        </div>
                                                        <div className="flex items-baseline">
                                                            <input type="text" value={postVitalSigns.crt || ''} onChange={e => setPostVitalSigns({ ...postVitalSigns, crt: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-base font-black text-gray-900 dark:text-white placeholder-gray-300" placeholder="0" />
                                                            <span className="text-gray-400 text-[9px] font-bold ml-0.5">s</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Post-op Notes */}
                                            <div className="space-y-2">
                                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Cuidado Post-Hospitalización</h4>
                                                <textarea
                                                    readOnly={!canManage}
                                                    value={notes.post || ''}
                                                    onChange={e => setNotes({ ...notes, post: e.target.value })}
                                                    placeholder="Instrucciones de recuperación, medicación post-op, retiro de puntos..."
                                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 rounded-3xl py-6 px-8 focus:ring-brand-primary focus:border-brand-primary font-medium min-h-[200px]"
                                                ></textarea>
                                            </div>

                                            <MedicationsEditor 
                                                medications={surgery.post_operative_medications || []}
                                                onSave={(meds) => {
                                                    updateSurgery({ post_operative_medications: meds });
                                                }}
                                                products={products.filter(p => !p.is_service)}
                                                canManage={canManage && surgery.status !== 'completed'}
                                                title="Fármacos Post-Operatorios / Receta"
                                                iconColor="bg-emerald-500"
                                            />

                                            <div className="flex justify-between items-center">
                                                {canManage && (
                                                    <button
                                                        onClick={savePostVitals}
                                                        className="text-[10px] bg-brand-primary text-white font-black px-5 py-2.5 rounded-xl shadow-md shadow-primary-100 hover:opacity-90 transition flex items-center gap-2"
                                                    >
                                                        💾 Guardar Post-op
                                                    </button>
                                                )}
                                                {can('manage hospitalizations') && (
                                                    <button
                                                        onClick={goToHospitalization}
                                                        className="bg-indigo-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition"
                                                    >
                                                        ⛑  Dar de Alta y Pasar a Hospitalización
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 rounded-b-[2.5rem] flex justify-end gap-3 text-[10px] font-black text-gray-400">
                                    <span className="uppercase tracking-[0.2em]">Protocolo {settings?.site_name || 'Sistema'} • V. 2026.02</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PrintDocumentModal 
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
                pet={surgery.pet}
                documentTemplates={templates}
                customPrintRoute={(template) => route('surgeries.consent.print', { surgery: surgery.id, template: template.id })}
            >
                <div className="mb-6 pb-6 border-b dark:border-gray-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reportes Especiales</p>
                    <a
                        href={route('surgeries.report', surgery.id)}
                        target="_blank"
                        className="flex items-center gap-3 p-4 bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 dark:border-brand-primary/30 rounded-2xl hover:bg-brand-primary/10 transition-all group"
                    >
                        <span className="text-xl">📋</span>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-bold text-sm text-brand-primary truncate">Protocolo Quirúrgico Completo</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Reporte técnico con Valles y Medicación por Fases</p>
                        </div>
                    </a>
                </div>
            </PrintDocumentModal>
        </AuthenticatedLayout>
    );
}
