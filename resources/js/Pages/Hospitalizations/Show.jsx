import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

export default function Show({ auth, hospitalization, templates }) {
    const [showMonitoringForm, setShowMonitoringForm] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        temperature: '',
        heart_rate: '',
        respiratory_rate: '',
        mucosa_color: '',
        capillary_refill_time: '',
        blood_pressure: '',
        hydration_status: '',
        pain_score: 0,
        mental_state: '',
        medication_administered: '',
        food_intake: '',
        urination: '',
        defecation: '',
        notes: '',
    });

    const submitMonitoring = (e) => {
        e.preventDefault();
        post(route('hospitalizations.monitoring.store', hospitalization.id), {
            onSuccess: () => {
                reset();
                setShowMonitoringForm(false);
            },
        });
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            discharged: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            euthanized: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        };
        const labels = {
            active: 'HOSPITALIZADO',
            discharged: 'ALTA MÉDICA',
            expired: 'DEFUNCIÓN',
            euthanized: 'EUTHANASIA',
        };
        return <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${colors[status]}`}>{labels[status]}</span>;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Expediente de Hospitalización: {hospitalization.pet.name}</h2>}
        >
            <Head title={`Hospitalización - ${hospitalization.pet.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100 dark:border-gray-700">
                        <div className="p-8 lg:p-12 flex flex-col lg:flex-row gap-10 items-center lg:items-start text-center lg:text-left">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-brand-primary/10 flex items-center justify-center text-6xl shadow-inner">
                                {hospitalization.pet.species === 'Canino' ? '🐕' : '🐈'}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-4 mb-4 justify-center lg:justify-start">
                                    <Link href={route('pets.show', hospitalization.pet.id)} className="hover:text-brand-primary transition-colors cursor-pointer"><h1 className="text-4xl font-black text-gray-900 dark:text-white hover:text-brand-primary transition-colors">{hospitalization.pet.name}</h1></Link>
                                    {getStatusBadge(hospitalization.status)}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Motivo de Ingreso</p>
                                        <p className="font-bold text-gray-700 dark:text-gray-300">{hospitalization.reason}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha de Ingreso</p>
                                        <p className="font-bold text-gray-700 dark:text-gray-300">
                                            {format(new Date(hospitalization.admission_date), "d 'de' MMMM, HH:mm", { locale: es })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Veterinario Responsable</p>
                                        <p className="font-bold text-gray-700 dark:text-gray-300">{hospitalization.veterinarian?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Peso Inicial</p>
                                        <p className="font-bold text-brand-primary">{hospitalization.initial_weight} kg</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Monitoring List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">Kardex de Monitoreo</h3>
                                <button
                                    onClick={() => setShowMonitoringForm(!showMonitoringForm)}
                                    className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-black uppercase hover:opacity-90 transition shadow-lg shadow-primary-100"
                                >
                                    {showMonitoringForm ? 'Cancelar' : '+ Registrar Signos'}
                                </button>
                            </div>

                            {showMonitoringForm && (
                                <form onSubmit={submitMonitoring} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border-2 border-brand-primary/20 animate-in fade-in slide-in-from-top-4">
                                    <h4 className="text-lg font-black text-gray-900 dark:text-white mb-6">Nuevo Registro de Constantes</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Temperatura (°C)</label>
                                            <input type="number" step="0.1" value={data.temperature} onChange={e => setData('temperature', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl focus:ring-2 focus:ring-brand-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">FC (lpm)</label>
                                            <input type="number" value={data.heart_rate} onChange={e => setData('heart_rate', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl focus:ring-2 focus:ring-brand-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">FR (rpm)</label>
                                            <input type="number" value={data.respiratory_rate} onChange={e => setData('respiratory_rate', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl focus:ring-2 focus:ring-brand-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Color Mucosas</label>
                                            <input type="text" value={data.mucosa_color} onChange={e => setData('mucosa_color', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl focus:ring-2 focus:ring-brand-primary" placeholder="Ej: Rosadas" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">TLLC (seg)</label>
                                            <input type="text" value={data.capillary_refill_time} onChange={e => setData('capillary_refill_time', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl focus:ring-2 focus:ring-brand-primary" placeholder="Ej: < 2s" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Escala Dolor (0-10)</label>
                                            <input type="range" min="0" max="10" value={data.pain_score} onChange={e => setData('pain_score', e.target.value)} className="w-full accent-brand-primary" />
                                            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1"><span>Leve</span><span>Severo ({data.pain_score})</span></div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Medicamentos Administrados</label>
                                            <textarea rows="2" value={data.medication_administered} onChange={e => setData('medication_administered', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl focus:ring-2 focus:ring-brand-primary text-sm"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Notas y Observaciones</label>
                                            <textarea rows="2" value={data.notes} onChange={e => setData('notes', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl focus:ring-2 focus:ring-brand-primary text-sm"></textarea>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button type="submit" disabled={processing} className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition disabled:opacity-50">Guardar Registro en Kardex</button>
                                    </div>
                                </form>
                            )}

                            {hospitalization.monitorings.map((m) => (
                                <div key={m.id} className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-50 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-10 bg-brand-primary rounded-full"></div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900 dark:text-white">{format(new Date(m.created_at), "HH:mm 'Hrs'", { locale: es })}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(m.created_at), "d 'de' MMMM", { locale: es })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-400 uppercase">Registrado por</p>
                                            <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{m.recorder?.name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Temperatura</p>
                                            <p className="text-lg font-black text-brand-primary">{m.temperature}°C</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">FC / FR</p>
                                            <p className="text-lg font-black text-gray-700 dark:text-gray-200">{m.heart_rate} / {m.respiratory_rate}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Mucosas / LLC</p>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{m.mucosa_color} • {m.capillary_refill_time}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Escala Dolor</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-500" style={{ width: `${m.pain_score * 10}%` }}></div>
                                                </div>
                                                <span className="text-sm font-black text-gray-600 dark:text-gray-400">{m.pain_score}/10</span>
                                            </div>
                                        </div>
                                    </div>

                                    {(m.medication_administered || m.notes) && (
                                        <div className="space-y-4">
                                            {m.medication_administered && (
                                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-sm">
                                                    <span className="font-black text-blue-800 dark:text-blue-300 mr-2">💊 TRATAMIENTO:</span>
                                                    <span className="text-blue-700 dark:text-blue-400">{m.medication_administered}</span>
                                                </div>
                                            )}
                                            {m.notes && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                                                    " {m.notes} "
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {hospitalization.monitorings.length === 0 && !showMonitoringForm && (
                                <div className="p-12 text-center bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2.5rem]">
                                    <p className="text-gray-400 italic">No hay registros de monitoreo aún. Inicie el primer registro de signos vitales.</p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar: Discharge/Actions */}
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Acciones de Alta</h3>

                                {hospitalization.status === 'active' ? (
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => {
                                                if (confirm('¿Confirmar Alta Médica del paciente?')) {
                                                    router.patch(route('hospitalizations.update', hospitalization.id), {
                                                        status: 'discharged',
                                                        discharge_notes: 'Alta médica por mejoría.'
                                                    });
                                                }
                                            }}
                                            className="w-full py-4 bg-green-100 text-green-700 rounded-2xl text-xs font-black uppercase hover:bg-green-700 hover:text-white transition"
                                        >
                                            ✅ Alta Médica
                                        </button>
                                        <Link
                                            href={route('consents.create', [hospitalization.pet.id, { type: 'euthanasia' }])}
                                            className="block w-full text-center py-4 bg-purple-100 text-purple-700 rounded-2xl text-xs font-black uppercase hover:bg-purple-700 hover:text-white transition"
                                        >
                                            ⚖️ Protocolo Eutanasia
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('¿Reportar defunción del paciente?')) {
                                                    router.patch(route('hospitalizations.update', hospitalization.id), {
                                                        status: 'expired',
                                                        discharge_notes: 'Defunción registrada en internamiento.'
                                                    });
                                                }
                                            }}
                                            className="w-full py-4 bg-red-100 text-red-700 rounded-2xl text-xs font-black uppercase hover:bg-red-700 hover:text-white transition"
                                        >
                                            ⚠️ Reportar Defunción
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 dark:bg-gray-900 text-center p-6 rounded-2xl">
                                        <p className="text-xs font-medium text-gray-500 italic pb-2">Paciente dado de alta el:</p>
                                        <p className="font-black text-gray-900 dark:text-white pb-2">
                                            {format(new Date(hospitalization.discharge_date || hospitalization.updated_at), "d 'de' MMMM", { locale: es })}
                                        </p>
                                        <div className="text-[10px] font-bold text-brand-primary uppercase bg-white dark:bg-gray-800 p-2 rounded-lg border border-brand-primary/20">
                                            {hospitalization.discharge_notes || 'Sin notas adicionales'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Documentos Legales</h4>
                                <div className="space-y-4">
                                    {templates && templates.map(template => (
                                        <a
                                            key={template.id}
                                            href={route('hospitalizations.consent.print', { hospitalization: hospitalization.id, template: template.id })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent hover:border-brand-primary rounded-2xl group transition-all"
                                        >
                                            <div className="w-8 h-8 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">📄</div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">{template.title}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">Imprimir / Generar PDF</p>
                                            </div>
                                        </a>
                                    ))}
                                    {(!templates || templates.length === 0) && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                                            No hay plantillas de hospitalización configuradas. <Link href={route('document-templates.index')} className="underline">Configurar</Link>.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-brand-primary p-8 rounded-3xl text-white shadow-xl shadow-primary-100">
                                <h4 className="font-black text-lg mb-4">Información Dueño</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Nombre</p>
                                        <p className="font-bold">{hospitalization.pet.owner?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Contacto</p>
                                        <p className="font-bold">{hospitalization.pet.owner?.phone}</p>
                                    </div>
                                    <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition">
                                        Llamar al Dueño
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
