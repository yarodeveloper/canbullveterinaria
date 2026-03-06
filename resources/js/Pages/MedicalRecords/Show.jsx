import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

const formatDate = (dateString) => {
    if (!dateString) return "Desconocida";
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

const calculateAge = (dobString) => {
    if (!dobString) return "Desconocida";
    const dob = new Date(dobString);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < dob.getDate())) {
        years--;
        months += 12;
    }
    if (years === 0) return `${months} meses`;
    if (months === 0) return `${years} años`;
    return `${years} años ${months} meses`;
};

const sexMap = {
    "Male": "Macho",
    "Female": "Hembra",
    "Spayed": "Hembra Esterilizada",
    "Neutered": "Macho Castrado",
    "Unknown": "Desconocido"
};

export default function Show({ auth, record }) {
    const { pet, veterinarian, attachments = [] } = record;
    const vitalSigns = record.vital_signs || {};
    const anamnesis = record.anamnesis || {};

    const cardBase = "bg-white dark:bg-[#1B2132] border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-xl p-6 relative overflow-hidden";
    const headerTitle = "text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4 relative z-10";

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={false}
        >
            <Head title={`Consulta - ${pet.name}`} />

            <div className="min-h-screen bg-slate-50 dark:bg-[#111822] text-slate-700 dark:text-slate-300 py-8 font-sans transition-colors duration-200">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <Link href={route('pets.show', pet.id)} className="p-3 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-700 rounded-xl transition text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </Link>
                            <div>
                                <h2 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    Historial de Consulta #{record.id}
                                </h2>
                                <p className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-widest mt-1">Realizada el {new Date(record.created_at).toLocaleString('es-ES')}</p>
                            </div>
                        </div>

                        <button onClick={() => window.print()} className="px-6 py-3 bg-white hover:bg-slate-200 text-slate-900 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-white/10 transition-all active:scale-95 items-center justify-center gap-2 border border-slate-400 flex print:hidden">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            Imprimir
                        </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* LEFT COLUMN */}
                        <div className="xl:col-span-3 space-y-6">

                            {/* Resumen del Paciente */}
                            <div className={cardBase}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full blur-2xl"></div>
                                <h3 className={`${headerTitle} text-slate-500 dark:text-slate-400`}>
                                    <span className="text-indigo-500">🐾</span> Paciente
                                </h3>
                                <div className="flex items-center gap-4 mt-4 mb-6 relative z-10">
                                    <div className="w-14 h-14 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-500 border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/20 flex-shrink-0 overflow-hidden">
                                        {pet.photo_path ? (
                                            <img src={`/storage/${pet.photo_path}`} alt={pet.name} className="w-full h-full object-cover" />
                                        ) : pet.species?.toLowerCase() === 'felino' || pet.species?.toLowerCase() === 'gato' ? (
                                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4L16 6.5L13 4L12 8L11 4L8 6.5L5 4V13C5 17.4183 8.58172 21 13 21C17.4183 21 21 17.4183 21 13V4H19Z" /></svg>
                                        ) : (
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{pet.name}</h4>
                                        <p className="text-[11px] text-indigo-300 font-semibold">{pet.species} • {pet.breed?.name || pet.breed || 'Mestizo'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-700/50 pt-4 relative z-10">
                                    <div className="col-span-2">
                                        <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Fecha de Nacimiento</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            {formatDate(pet.dob)}
                                        </p>
                                        {pet.dob && <p className="text-[10px] text-indigo-400 font-bold mt-0.5">{calculateAge(pet.dob)}</p>}
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Sexo</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{sexMap[pet.gender] || pet.gender}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Medico */}
                            <div className={cardBase}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full blur-2xl"></div>
                                <h3 className={`${headerTitle} text-slate-500 dark:text-slate-400`}>
                                    <span className="text-amber-500">👨‍⚕️</span> Médico Responsable
                                </h3>
                                <div className="mt-4 relative z-10">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Dr. {veterinarian?.name || ''}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-bold">Ced: {veterinarian?.professional_id || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Constantes Vitales */}
                            <div className={cardBase}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full blur-2xl"></div>
                                <h3 className={`${headerTitle} text-red-400`}>
                                    <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                                    Constantes Vitales
                                </h3>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-4 relative z-10 mt-6">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Peso / Temp</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">{vitalSigns.weight ? `${vitalSigns.weight} kg` : '--'} / {vitalSigns.temp ? `${vitalSigns.temp} °C` : '--'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">F.C. / F.R.</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">{vitalSigns.hr ? `${vitalSigns.hr} bpm` : '--'} / {vitalSigns.rr ? `${vitalSigns.rr} rpm` : '--'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mucosas</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">{vitalSigns.mucous || '--'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">CC / TLLC</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">{vitalSigns.bcs || '--'} / {vitalSigns.tllc ? `${vitalSigns.tllc}s` : '--'}</p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700/50 mt-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ganglios</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${vitalSigns.lymph_nodes === 'Alterado' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                    {vitalSigns.lymph_nodes || 'Normal'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Palpación Abd.</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${vitalSigns.abdominal_palpation === 'Alterado' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                    {vitalSigns.abdominal_palpation || 'Normal'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estado Físico */}
                            {record.physical_state && (
                                <div className={cardBase}>
                                    <h3 className={`${headerTitle} text-emerald-400 mb-0`}>
                                        ⚖ Estado Físico (BCS)
                                    </h3>
                                    <div className="mt-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg p-3 text-center text-sm font-bold uppercase tracking-widest">
                                        {record.physical_state}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="xl:col-span-9 space-y-6">

                            {/* Anamnesis / Información Histórica */}
                            <div className={`${cardBase} grid grid-cols-1 lg:grid-cols-2 gap-6`}>
                                <div>
                                    <label className="block text-xs font-black text-fuchsia-400 uppercase tracking-widest mb-3">
                                        Motivo de la Consulta
                                    </label>
                                    <p className="text-slate-800 dark:text-slate-200 text-sm bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 p-4 rounded-xl leading-relaxed">
                                        {anamnesis.reason || 'No especificado.'}
                                    </p>

                                    <div className="mt-6 space-y-4">
                                        <p className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Historial Médico</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-100 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-300 dark:border-slate-800">
                                                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Vacunas</p>
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{anamnesis.vaccine_history || '--'}</p>
                                                {anamnesis.vaccine_date && <p className="text-[9px] text-fuchsia-400 mt-1">{formatDate(anamnesis.vaccine_date)}</p>}
                                            </div>
                                            <div className="bg-slate-100 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-300 dark:border-slate-800">
                                                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Desparasitación</p>
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{anamnesis.deworming_history || '--'}</p>
                                                {anamnesis.deworming_date && <p className="text-[9px] text-fuchsia-400 mt-1">{formatDate(anamnesis.deworming_date)}</p>}
                                            </div>
                                            <div className="col-span-2 bg-slate-100 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-300 dark:border-slate-800">
                                                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Dieta Actual</p>
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">{anamnesis.diet || '--'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-fuchsia-400 uppercase tracking-widest mb-2">
                                        Anamnesis Rápida
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Estado de Ánimo', value: anamnesis.mood },
                                            { label: 'Apetito', value: anamnesis.appetite },
                                            { label: 'Vómito', value: anamnesis.vomiting },
                                            { label: 'Deposiciones', value: anamnesis.stool },
                                            { label: 'Diarrea', value: anamnesis.diarrhea },
                                            { label: 'Micción', value: anamnesis.urination },
                                            { label: 'Color Orina', value: anamnesis.urine_color },
                                            { label: 'Reflejo Tusígeno', value: anamnesis.cough_reflex },
                                            { label: 'Reflejo Deglutorio', value: anamnesis.swallowing_reflex }
                                        ].map((item, i) => (
                                            <div key={i} className="bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{item.label}</span>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${item.value === 'Normal' || item.value === 'Ausente' || item.value === 'Alerta' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30'}`}>
                                                    {item.value || '--'}
                                                </span>
                                            </div>
                                        ))}

                                        {/* Discharges Notes */}
                                        {['nasal', 'auricular', 'vulvar'].map(type => {
                                            const val = anamnesis[`${type}_discharge`];
                                            const notes = anamnesis[`${type}_discharge_notes`];
                                            if (val !== 'Presente') return null;
                                            return (
                                                <div key={type} className="col-span-2 bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg">
                                                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block mb-1">Descarga {type} Presente</span>
                                                    <p className="text-xs text-slate-700 dark:text-slate-300">{notes || 'Sin observaciones detalladas'}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Evaluaciones Clínicas (SOAP) */}
                            <div className={`${cardBase} space-y-6`}>
                                {[
                                    { id: 'S', title: 'Subjetivo', key: 'subjective', color: 'indigo' },
                                    { id: 'O', title: 'Objetivo', key: 'objective', color: 'emerald' },
                                    { id: 'A', title: 'Análisis (Evaluación)', key: 'assessment', color: 'amber' },
                                    { id: 'P', title: 'Plan (Receta)', key: 'plan', color: 'rose' },
                                ].map(section => (
                                    <div key={section.id} className={`p-6 rounded-xl border border-${section.color}-500/20 bg-slate-100 dark:bg-slate-900/30 relative overflow-hidden`}>
                                        <div className={`absolute top-0 right-0 p-6 text-[100px] font-black opacity-[0.03] text-${section.color}-500 leading-none pointer-events-none drop-shadow-lg`}>
                                            {section.id}
                                        </div>
                                        <h3 className={`text-xs font-black uppercase tracking-[0.3em] mb-4 text-${section.color}-400 relative z-10 flex items-center gap-3`}>
                                            <span className={`w-6 h-6 rounded bg-${section.color}-500/20 flex flex-col items-center justify-center text-${section.color}-500 ring-1 ring-${section.color}-500/50`}>{section.id}</span>
                                            {section.title}
                                            <span className="h-px bg-slate-700/50 flex-1 ml-4"></span>
                                        </h3>
                                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap text-[15px] relative z-10 pl-9 border-l-2 border-slate-200 dark:border-slate-700/50 ml-3 min-h-[60px]">
                                            {record[section.key] || <span className="text-slate-500 italic">Sin observaciones documentadas.</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Evidencias Adjuntas */}
                            {attachments.length > 0 && (
                                <div className={cardBase}>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-6">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                        Evidencia y Resultados
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {attachments.map(att => (
                                            <div key={att.id} className="group relative rounded-xl border-2 border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 hover:border-indigo-500 transition-colors cursor-pointer block">
                                                {att.file_type.startsWith('image/') ? (
                                                    <a href={att.url} target="_blank" rel="noreferrer" className="block w-full h-full">
                                                        <img src={att.url} alt={att.file_name} className="w-full aspect-square object-cover" />
                                                    </a>
                                                ) : (
                                                    <a href={att.url} target="_blank" rel="noreferrer" className="w-full aspect-square flex flex-col items-center justify-center p-3 text-center">
                                                        <span className="text-2xl mb-1 text-slate-500 dark:text-slate-400">📄</span>
                                                        <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase break-all line-clamp-2">{att.file_name}</p>
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .print\\:hidden { display: none !important; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .max-w-\\[1400px\\] { max-width: 100% !important; margin: 0 !important; }
                    .min-h-screen { background: white !important; }
                    .bg-\\[\\#111822\\] { background: white !important; color: black !important; }
                    .bg-\\[\\#1B2132\\] { background: white !important; border-color: #e5e7eb !important; box-shadow: none !important; color: black !important; }
                    .text-white, .text-slate-700, .text-slate-300, .text-slate-200, .text-slate-400 { color: black !important; }
                    .bg-slate-100 dark:bg-slate-900\\/50 { background: #f9fafb !important; border-color: #f3f4f6 !important; }
                    * { border-color: #e5e7eb !important; }
                    @page { margin: 1cm; }
                }
            `}} />
        </AuthenticatedLayout>
    );
}

