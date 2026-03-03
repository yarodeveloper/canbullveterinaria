import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Create({ auth, pet }) {
    const [previews, setPreviews] = useState([]);
    const { data, setData, post, processing, errors } = useForm({
        type: 'consultation',
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        vital_signs: {
            weight: pet.weight || '',
            temp: '',
            hr: '',
            rr: '',
        },
        attachments: [],
    });

    const submit = (e) => {
        e.preventDefault();
        // Since we are uploading files, we should use a multipart/form-data request
        // Inertia's post handle this automatically if it detects files in the data.
        post(route('medical-records.store', pet.id), {
            forceFormData: true,
        });
    };

    const updateVitalSign = (field, value) => {
        setData('vital_signs', {
            ...data.vital_signs,
            [field]: value
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setData('attachments', files);

        // Generate previews
        const newPreviews = files.map(file => {
            if (file.type.startsWith('image/')) {
                return URL.createObjectURL(file);
            }
            return null;
        });
        setPreviews(newPreviews);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('pets.show', pet.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                    <div>
                        <h2 className="font-black text-2xl text-gray-800 dark:text-gray-200 leading-tight">Nueva Historia Clínica: {pet.name}</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Formato SOAP Digital v2.0</p>
                    </div>
                </div>
            }
        >
            <Head title={`Consulta - ${pet.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                        {/* Columna Izquierda: Configuración y Signos Vitales */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Card: Configuración */}
                            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none p-8 border dark:border-gray-700">
                                <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                                    Parámetros de Visita
                                </h3>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tipo de Atención</label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="w-full rounded-2xl border-gray-100 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="consultation">🏥 Consulta General</option>
                                        <option value="follow-up">🔄 Seguimiento</option>
                                        <option value="emergency">🚨 Urgencia / Triage</option>
                                        <option value="specialty">🎯 Especialidad</option>
                                    </select>
                                </div>
                            </div>

                            {/* Card: Signos Vitales */}
                            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none p-8 border dark:border-gray-700">
                                <h3 className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    Constantes Vitales
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Peso (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.vital_signs.weight}
                                            onChange={e => updateVitalSign('weight', e.target.value)}
                                            className="w-full rounded-xl border-gray-50 dark:border-gray-700 dark:bg-gray-900 bg-gray-50/50 focus:bg-white text-lg font-black text-indigo-600"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temp (°C)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.vital_signs.temp}
                                            onChange={e => updateVitalSign('temp', e.target.value)}
                                            className={`w-full rounded-xl border-gray-50 dark:border-gray-700 dark:bg-gray-900 bg-gray-50/50 focus:bg-white text-lg font-black ${data.vital_signs.temp > 39.5 ? 'text-red-500' : 'text-gray-700'}`}
                                            placeholder="38.5"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">F.C. (bpm)</label>
                                        <input
                                            type="number"
                                            value={data.vital_signs.hr}
                                            onChange={e => updateVitalSign('hr', e.target.value)}
                                            className="w-full rounded-xl border-gray-50 dark:border-gray-700 dark:bg-gray-900 bg-gray-50/50 focus:bg-white text-lg font-black"
                                            placeholder="80"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">F.R. (rpm)</label>
                                        <input
                                            type="number"
                                            value={data.vital_signs.rr}
                                            onChange={e => updateVitalSign('rr', e.target.value)}
                                            className="w-full rounded-xl border-gray-50 dark:border-gray-700 dark:bg-gray-900 bg-gray-50/50 focus:bg-white text-lg font-black"
                                            placeholder="24"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card: Archivos Adjuntos */}
                            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none p-8 border dark:border-gray-700">
                                <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                    Evidencia Médica / Multimedia
                                </h3>
                                <div className="space-y-4">
                                    <div className="relative group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:border-indigo-400 transition-all text-center">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="text-3xl mb-2">📸</div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Subir Imágenes o PDF</p>
                                        <p className="text-[8px] text-gray-300 uppercase mt-1">Rayos X, Ultrasonido, Lab...</p>
                                    </div>

                                    {data.attachments.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {previews.map((preview, idx) => (
                                                preview ? (
                                                    <img key={idx} src={preview} className="w-full h-12 object-cover rounded-lg border dark:border-gray-700" alt="Preview" />
                                                ) : (
                                                    <div key={idx} className="w-full h-12 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center text-[8px] font-bold text-gray-400 uppercase">DOC</div>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Formato SOAP Exclusivo */}
                        <div className="lg:col-span-2 space-y-8">

                            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-10 border dark:border-gray-700">
                                <div className="space-y-10">

                                    {/* S: Subjetivo */}
                                    <div className="relative pl-12">
                                        <div className="absolute left-0 top-0 w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center font-black text-indigo-600">S</div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Subjetivo <span className="text-[10px] font-bold lowercase tracking-normal text-gray-300 italic">(Motivo de consulta / Anamnesis)</span></label>
                                        <textarea
                                            value={data.subjective}
                                            onChange={e => setData('subjective', e.target.value)}
                                            rows="3"
                                            className="w-full rounded-2xl border-gray-100 dark:border-gray-900 dark:bg-gray-900 shadow-inner focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 dark:text-gray-300"
                                            placeholder="Describe lo que reporta el dueño..."
                                            required
                                        ></textarea>
                                    </div>

                                    {/* O: Objetivo */}
                                    <div className="relative pl-12">
                                        <div className="absolute left-0 top-0 w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center font-black text-emerald-600">O</div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Objetivo <span className="text-[10px] font-bold lowercase tracking-normal text-gray-300 italic">(Examen físico / Hallazgos directos)</span></label>
                                        <textarea
                                            value={data.objective}
                                            onChange={e => setData('objective', e.target.value)}
                                            rows="4"
                                            className="w-full rounded-2xl border-gray-100 dark:border-gray-900 dark:bg-gray-900 shadow-inner focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 dark:text-gray-300"
                                            placeholder="Anota tus hallazgos clínicos..."
                                            required
                                        ></textarea>
                                    </div>

                                    {/* A: Análisis */}
                                    <div className="relative pl-12">
                                        <div className="absolute left-0 top-0 w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center font-black text-amber-600">A</div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Análisis <span className="text-[10px] font-bold lowercase tracking-normal text-gray-300 italic">(Diagnóstico presuntivo / Diferenciales)</span></label>
                                        <textarea
                                            value={data.assessment}
                                            onChange={e => setData('assessment', e.target.value)}
                                            rows="2"
                                            className="w-full rounded-2xl border-gray-100 dark:border-gray-900 dark:bg-gray-900 shadow-inner focus:ring-amber-500 focus:border-amber-500 text-gray-700 dark:text-gray-300"
                                            placeholder="Tu interpretación médica..."
                                            required
                                        ></textarea>
                                    </div>

                                    {/* P: Plan */}
                                    <div className="relative pl-12">
                                        <div className="absolute left-0 top-0 w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center font-black text-rose-600">P</div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Plan <span className="text-[10px] font-bold lowercase tracking-normal text-gray-300 italic">(Tratamiento / Receta / Próxima cita)</span></label>
                                        <textarea
                                            value={data.plan}
                                            onChange={e => setData('plan', e.target.value)}
                                            rows="4"
                                            className="w-full rounded-2xl border-gray-100 dark:border-gray-900 dark:bg-gray-900 shadow-inner focus:ring-rose-500 focus:border-rose-500 text-gray-700 dark:text-gray-300"
                                            placeholder="Indica el tratamiento a seguir..."
                                            required
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="mt-12 flex items-center justify-end gap-4 border-t dark:border-gray-700 pt-10">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full lg:w-auto px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50"
                                    >
                                        {processing ? 'Procesando...' : 'Finalizar y Guardar Historia'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
