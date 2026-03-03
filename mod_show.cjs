const fs = require('fs');

let content = fs.readFileSync('resources/js/Pages/Surgeries/Show.jsx', 'utf8');

// 1. Update component signature and states
content = content.replace(
    /export default function Show\(\{ auth, surgery \}\) \{/,
    `export default function Show({ auth, surgery, templates }) {\n    const [vitalSigns, setVitalSigns] = useState(surgery.vital_signs || { weight: '', hr: '', rr: '', temp: '', crt: '' });`
);

content = content.replace(
    /end_time: new Date\(\)\.toISOString\(\),\n\s*intra_op_notes: notes\.intra,\n\s*post_op_notes: notes\.post/,
    `end_time: new Date().toISOString(),\n                intra_op_notes: notes.intra,\n                post_op_notes: notes.post,\n                vital_signs: vitalSigns`
);

content = content.replace(
    /updateSurgery\(\{ checklist: newChecklist \}\);\n\s*\};/,
    `updateSurgery({ checklist: newChecklist });\n    };\n\n    const saveVitals = () => {\n        updateSurgery({ vital_signs: vitalSigns });\n    };\n\n    const goToHospitalization = () => {\n        router.get(route('hospitalizations.create'), { pet_id: surgery.pet.id, prior_surgery: surgery.id });\n    };`
);


// 2. Pre-op docs section
const preOpContentOriginal = `{activeTab === 'pre_op' && (
                                        <div className="space-y-4">
                                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Notas Pre-operatorias</h4>
                                            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border dark:border-gray-700 italic text-gray-600 dark:text-gray-400">
                                                {surgery.pre_op_notes || "Sin observaciones previas al ingreso."}
                                            </div>
                                        </div>
                                    )}`;

const preOpContentNew = `{activeTab === 'pre_op' && (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Documentos Legales (Consentimientos Quirúrgicos)</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {templates && templates.map(template => (
                                                        <a
                                                            key={template.id}
                                                            href={route('consents.show', template.id)} /* TODO use correct route */
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                router.get(route('pets.show', surgery.pet_id) + '?tab=documents');
                                                                // Redirecting to pet profile for now to generate, or open consent form
                                                            }}
                                                            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border-2 border-brand-primary/20 hover:border-brand-primary rounded-2xl group transition-all"
                                                        >
                                                            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary text-xl">📄</div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{template.title}</p>
                                                                <p className="text-[9px] text-gray-400 font-bold uppercase">Generar para firma</p>
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
                                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Notas Pre-operatorias</h4>
                                                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border dark:border-gray-700 italic text-gray-600 dark:text-gray-400">
                                                    {surgery.pre_op_notes || "Sin observaciones previas al ingreso."}
                                                </div>
                                            </div>
                                        </div>
                                    )}`;
content = content.replace(preOpContentOriginal, preOpContentNew);


// 3. Intra-op vitals section
const intraOpContentRegex = /{activeTab === 'intra_op' && \(\s*<div className="space-y-4">\s*<h4[^>]+>Registro Quirúrgico \(Relato\)<\/h4>[\s\S]*?<\/textarea>\s*<\/div>\s*\)}/m;

const intraOpContentNew = `{activeTab === 'intra_op' && (
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
                                                            <input type="text" value={vitalSigns.weight} onChange={e => setVitalSigns({...vitalSigns, weight: e.target.value})} disabled={surgery.status === 'completed'} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-xl font-black placeholder-gray-300" placeholder="0" />
                                                            <span className="text-gray-400 ml-1 text-sm font-bold">kg</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700 relative group focus-within:ring-2 focus-within:ring-rose-500">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase">Frec. Cardíaca</label>
                                                        <div className="flex items-center text-xl font-black text-gray-900 dark:text-white mt-1">
                                                            <input type="text" value={vitalSigns.hr} onChange={e => setVitalSigns({...vitalSigns, hr: e.target.value})} disabled={surgery.status === 'completed'} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-xl font-black placeholder-gray-300 text-rose-500" placeholder="0" />
                                                            <span className="text-gray-400 ml-1 text-sm font-bold">bpm</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700 relative group focus-within:ring-2 focus-within:ring-blue-500">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase">Frec. Respiratoria</label>
                                                        <div className="flex items-center text-xl font-black text-gray-900 dark:text-white mt-1">
                                                            <input type="text" value={vitalSigns.rr} onChange={e => setVitalSigns({...vitalSigns, rr: e.target.value})} disabled={surgery.status === 'completed'} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-xl font-black placeholder-gray-300" placeholder="0" />
                                                            <span className="text-gray-400 ml-1 text-[10px] font-bold">rpm</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700 relative group focus-within:ring-2 focus-within:ring-amber-500">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase">Temperatura</label>
                                                        <div className="flex items-center text-xl font-black text-gray-900 dark:text-white mt-1">
                                                            <input type="text" value={vitalSigns.temp} onChange={e => setVitalSigns({...vitalSigns, temp: e.target.value})} disabled={surgery.status === 'completed'} className="bg-transparent border-0 p-0 w-full focus:ring-0 text-xl font-black placeholder-gray-300" placeholder="0.0" />
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
                                                    value={notes.intra}
                                                    onChange={e => setNotes({ ...notes, intra: e.target.value })}
                                                    disabled={surgery.status === 'completed'}
                                                    placeholder="Describe el hallazgo, técnica utilizada, complicaciones, etc..."
                                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 rounded-3xl py-6 px-8 focus:ring-brand-primary focus:border-brand-primary font-medium min-h-[250px]"
                                                ></textarea>
                                            </div>
                                        </div>
                                    )}`;

content = content.replace(intraOpContentRegex, intraOpContentNew);

const postOpHospitalizationBtn = `<div className="mt-6 flex justify-end">
                                                <button
                                                    onClick={goToHospitalization}
                                                    className="bg-indigo-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition"
                                                >
                                                    ⛑  Dar de Alta y Pasar a Hospitalización
                                                </button>
                                            </div>`;

content = content.replace(
    /<\/textarea>\s*<\/div>\s*\)}/m,
    `</textarea>\n${postOpHospitalizationBtn}\n                                        </div>\n                                    )}`
);

fs.writeFileSync('resources/js/Pages/Surgeries/Show.jsx', content);
