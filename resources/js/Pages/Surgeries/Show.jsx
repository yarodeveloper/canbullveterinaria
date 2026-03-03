import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Show({ auth, surgery, templates }) {
    const [vitalSigns, setVitalSigns] = useState(surgery.vital_signs || { weight: '', hr: '', rr: '', temp: '', crt: '' });
    const [activeTab, setActiveTab] = useState('pre_op');
    const [checklist, setChecklist] = useState(surgery.checklist || { pre_op: [], intra_op: [], post_op: [] });
    const [notes, setNotes] = useState({
        pre: surgery.pre_op_notes || '',
        intra: surgery.intra_op_notes || '',
        post: surgery.post_op_notes || ''
    });
    const [isEditingPreOp, setIsEditingPreOp] = useState(false);

    const toggleCheckItem = (group, index) => {
        const newChecklist = { ...checklist };
        newChecklist[group][index].checked = !newChecklist[group][index].checked;
        setChecklist(newChecklist);
        updateSurgery({ checklist: newChecklist });
    };

    const updateSurgery = (data) => {
        router.patch(route('surgeries.update', surgery.id), data, {
            preserveScroll: true,
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
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">Equipo Médico</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center text-sm">🔪</div>
                                                    <div>
                                                        <p className="text-[9px] font-bold text-gray-500 uppercase leading-none">Cirujano</p>
                                                        <p className="text-sm font-black text-gray-800 dark:text-gray-200">{surgery.lead_surgeon.name}</p>
                                                    </div>
                                                </div>
                                                {surgery.anesthesiologist && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center text-sm">💉</div>
                                                        <div>
                                                            <p className="text-[9px] font-bold text-gray-500 uppercase leading-none">Anestesiólogo</p>
                                                            <p className="text-sm font-black text-gray-800 dark:text-gray-200">{surgery.anesthesiologist.name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700">
                                                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Riesgo ASA</p>
                                                <p className="text-xl font-black text-brand-primary text-center">ASA {surgery.asa_classification || '-'}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700">
                                                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Sucursal</p>
                                                <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 text-center leading-tight">{surgery.branch.name}</p>
                                            </div>
                                        </div>

                                        {surgery.status === 'scheduled' && (
                                            <button
                                                onClick={startSurgery}
                                                className="w-full bg-brand-primary text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-50 transition-all active:scale-95"
                                            >
                                                Iniciar Cirugía
                                            </button>
                                        )}
                                        {surgery.status === 'in-progress' && (
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
                                                    onClick={() => surgery.status !== 'completed' && toggleCheckItem(activeTab, idx)}
                                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${item.checked
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
                                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Documentos Legales (Consentimientos Quirúrgicos)</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {templates && templates.map(template => (
                                                        <a
                                                            key={template.id}
                                                            href={route('surgeries.consent.print', { surgery: surgery.id, template: template.id })}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border-2 border-brand-primary/20 hover:border-brand-primary rounded-2xl group transition-all"
                                                        >
                                                            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary text-xl">📄</div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{template.title}</p>
                                                                <p className="text-[9px] text-gray-400 font-bold uppercase">Imprimir / Generar PDF</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                    {(!templates || templates.length === 0) && (
                                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl text-xs font-bold border border-amber-200 dark:border-amber-800 col-span-2">
                                                            No hay plantillas de cirugía configuradas. <Link href={route('document-templates.index')} className="underline">Configurar ahora</Link>.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Notas Pre-operatorias</h4>
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
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700 relative group focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-transparent">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase">Peso Actual</label>
                                                        <div className="flex items-center text-xl font-black text-gray-900 dark:text-white mt-1">
                                                            <input type="text" value={vitalSigns.weight || ''} onChange={e => setVitalSigns({ ...vitalSigns, weight: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-xl font-black placeholder-gray-300" placeholder="0" />
                                                            <span className="text-gray-400 ml-1 text-sm font-bold">kg</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700 relative group focus-within:ring-2 focus-within:ring-rose-500">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase">Frec. Cardíaca</label>
                                                        <div className="flex items-center text-xl font-black text-gray-900 dark:text-white mt-1">
                                                            <input type="text" value={vitalSigns.hr || ''} onChange={e => setVitalSigns({ ...vitalSigns, hr: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-xl font-black placeholder-gray-300 text-rose-500" placeholder="0" />
                                                            <span className="text-gray-400 ml-1 text-sm font-bold">bpm</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700 relative group focus-within:ring-2 focus-within:ring-blue-500">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase">Frec. Respiratoria</label>
                                                        <div className="flex items-center text-xl font-black text-gray-900 dark:text-white mt-1">
                                                            <input type="text" value={vitalSigns.rr || ''} onChange={e => setVitalSigns({ ...vitalSigns, rr: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-xl font-black placeholder-gray-300" placeholder="0" />
                                                            <span className="text-gray-400 ml-1 text-[10px] font-bold">rpm</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700 relative group focus-within:ring-2 focus-within:ring-amber-500">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase">Temperatura</label>
                                                        <div className="flex items-center text-xl font-black text-gray-900 dark:text-white mt-1">
                                                            <input type="text" value={vitalSigns.temp || ''} onChange={e => setVitalSigns({ ...vitalSigns, temp: e.target.value })} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-xl font-black placeholder-gray-300" placeholder="0.0" />
                                                            <span className="text-gray-400 ml-1 text-sm font-bold">°C</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Registro Quirúrgico (Relato)</h4>
                                                    {surgery.status !== 'completed' && (
                                                        <button onClick={endSurgery} className="text-[10px] bg-brand-primary text-white font-black px-4 py-1.5 rounded-lg shadow hover:opacity-90 transition">
                                                            GUARDAR HOJA
                                                        </button>
                                                    )}
                                                </div>
                                                <textarea
                                                    value={notes.intra || ''}
                                                    onChange={e => setNotes({ ...notes, intra: e.target.value })}
                                                    placeholder="Describe el hallazgo, técnica utilizada, complicaciones, etc..."
                                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 rounded-3xl py-6 px-8 focus:ring-brand-primary focus:border-brand-primary font-medium min-h-[250px]"
                                                ></textarea>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'post_op' && (
                                        <div className="space-y-4">
                                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Cuidado Post-Hospitalización</h4>
                                            <textarea
                                                value={notes.post || ''}
                                                onChange={e => setNotes({ ...notes, post: e.target.value })}
                                                placeholder="Instrucciones de recuperación, medicación post-op, retiro de puntos..."
                                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 rounded-3xl py-6 px-8 focus:ring-brand-primary focus:border-brand-primary font-medium min-h-[300px]"
                                            ></textarea>
                                            <div className="mt-6 flex justify-end">
                                                <button
                                                    onClick={goToHospitalization}
                                                    className="bg-indigo-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition"
                                                >
                                                    ⛑  Dar de Alta y Pasar a Hospitalización
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 rounded-b-[2.5rem] flex justify-end gap-3 text-[10px] font-black text-gray-400">
                                    <span className="uppercase tracking-[0.2em]">Protocolo CanBull • V. 2026.02</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
