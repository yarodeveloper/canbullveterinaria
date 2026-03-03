import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

export default function Show({ auth, record }) {
    const { pet, veterinarian, attachments = [] } = record;
    const vitalSigns = record.vital_signs || {};

    const getVitalStatus = (type, value) => {
        if (!value) return null;
        const val = parseFloat(value);
        if (type === 'temp') {
            if (val > 39.5) return { label: '🔥 Fiebre Alta', color: 'text-red-500 bg-red-50' };
            if (val > 38.9) return { label: '🌡️ Febrícula', color: 'text-amber-500 bg-amber-50' };
            if (val < 37.5) return { label: '❄️ Hipotermia', color: 'text-blue-500 bg-blue-50' };
            return { label: '✅ Normal', color: 'text-emerald-500 bg-emerald-50' };
        }
        return null;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-4">
                        <Link href={route('pets.show', pet.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <h2 className="font-black text-2xl text-gray-800 dark:text-gray-200 leading-tight">Consulta Clínica #{record.id}</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {new Date(record.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition print:hidden">
                            🖨️ Imprimir
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Consulta - ${pet.name}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* Header: Paciente y Médico */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl p-10 border dark:border-gray-700 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z" /></svg>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                                    {pet.species === 'Dog' || pet.species === 'Canino' ? '🐶' : '🐱'}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Paciente</p>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{pet.name}</h3>
                                    <p className="text-sm font-bold text-indigo-500 uppercase tracking-tight mt-1">{pet.breed || 'Mestizo'}</p>
                                </div>
                            </div>
                            <div className="md:text-right flex flex-col md:items-end justify-center">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Médico Veterinario</p>
                                <h4 className="text-xl font-black text-gray-800 dark:text-gray-200">Dr. {veterinarian.name}</h4>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Ced. Prof: {veterinarian.professional_id || 'PENDIENTE'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Fila: Signos Vitales y Tipo */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {['Peso', 'Temp', 'F.C.', 'F.R.'].map((label, idx) => {
                            const key = ['weight', 'temp', 'hr', 'rr'][idx];
                            const unit = ['kg', '°C', 'bpm', 'rpm'][idx];
                            const value = vitalSigns[key];
                            const status = getVitalStatus(key, value);

                            return (
                                <div key={key} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-lg border dark:border-gray-700 flex flex-col items-center justify-center text-center">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">{label}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-gray-900 dark:text-white">{value || '--'}</span>
                                        <span className="text-xs font-bold text-gray-400">{unit}</span>
                                    </div>
                                    {status && (
                                        <span className={`mt-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${status.color}`}>
                                            {status.label}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Cuerpo: Formato SOAP */}
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl p-12 border dark:border-gray-700 space-y-12">

                        {/* Secciones SOAP */}
                        {[
                            { id: 'S', title: 'Subjetivo', key: 'subjective', color: 'indigo', desc: 'Anamnesis y evolución reportada' },
                            { id: 'O', title: 'Objetivo', key: 'objective', color: 'emerald', desc: 'Examen clínico y hallazgos' },
                            { id: 'A', title: 'Análisis', key: 'assessment', color: 'amber', desc: 'Diagnósticos e interpretaciones' },
                            { id: 'P', title: 'Plan', key: 'plan', color: 'rose', desc: 'Recetario y pasos a seguir' },
                        ].map(section => (
                            <div key={section.id} className="relative pl-16 group">
                                <div className={`absolute left-0 top-0 w-12 h-12 bg-${section.color}-50 dark:bg-${section.color}-900/20 rounded-2xl flex items-center justify-center font-black text-2xl text-${section.color}-600 border border-${section.color}-100 dark:border-${section.color}-800 shadow-sm group-hover:scale-110 transition-transform`}>
                                    {section.id}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                                        {section.title}
                                        <span className="h-px bg-gray-100 dark:bg-gray-700 flex-1"></span>
                                    </h3>
                                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-1 mb-4 italic">{section.desc}</p>
                                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg font-medium">
                                        {record[section.key]}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Adjuntos */}
                        {attachments.length > 0 && (
                            <div className="pt-12 border-t dark:border-gray-700">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Adjuntos y Evidencia</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {attachments.map(att => (
                                        <div key={att.id} className="group relative rounded-3xl overflow-hidden border-4 border-gray-50 dark:border-gray-900 shadow-lg hover:border-indigo-500 transition-all">
                                            {att.file_type.startsWith('image/') ? (
                                                <a href={att.url} target="_blank">
                                                    <img src={att.url} alt={att.file_name} className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </a>
                                            ) : (
                                                <div className="w-full h-40 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
                                                    <span className="text-3xl mb-2">📄</span>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase truncate w-full">{att.file_name}</p>
                                                    <a href={att.url} target="_blank" className="mt-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Descargar</a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Firma y Sello Final */}
                    <div className="flex flex-col items-center justify-center space-y-4 pt-10">
                        <div className="w-64 h-px bg-gray-200 dark:bg-gray-700"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Firma del Médico Responsable</p>
                        <div className="w-32 h-32 opacity-10 grayscale">
                            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .print\\:hidden { display: none !important; }
                    body { background: white !important; }
                    .max-w-5xl { max-width: 100% !important; margin: 0 !important; }
                    .shadow-2xl, .shadow-xl, .shadow-lg { box-shadow: none !important; }
                    .border { border-color: #f3f4f6 !important; }
                    @page { margin: 1.5cm; }
                }
            `}} />
        </AuthenticatedLayout>
    );
}
