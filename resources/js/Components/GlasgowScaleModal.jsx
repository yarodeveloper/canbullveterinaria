import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/Components/Modal';

export default function GlasgowScaleModal({ isOpen, onClose, species, petName, initialScore, onSave }) {
    const isDog = species?.toLowerCase() === 'canino' || species?.toLowerCase() === 'perro';

    // Cats (CMP-Feline) - Max 20
    const [catState, setCatState] = useState({
        q1: 0, // Vocalización
        q2: 0, // Postura
        q3: 0, // Atención herida
        q4_orejas: 0,
        q4_hocico: 0,
        q5: 0, // Respuesta caricia
        q6: 0, // Qué hace a palpación
        q7: 0, // Impresión general
    });

    // Dogs (CMPS-SF) - Max 24
    const [dogState, setDogState] = useState({
        omitirMovilidad: false,
        q1: 0, // Vocalización
        q2: 0, // Reacción a herida
        q3: 0, // Levantarse/caminar
        q4: 0, // Respuesta tacto/palpación
        q5: 0, // Actitud/Postura
        q6: 0, // Comportamiento
    });

    useEffect(() => {
        if (isOpen) {
            // Reset state on open if needed
        }
    }, [isOpen]);

    const catTotal = useMemo(() => {
        return catState.q1 + catState.q2 + catState.q3 + catState.q4_orejas + catState.q4_hocico + catState.q5 + catState.q6 + catState.q7;
    }, [catState]);

    const dogTotal = useMemo(() => {
        const moveScore = dogState.omitirMovilidad ? 0 : dogState.q3;
        return dogState.q1 + dogState.q2 + moveScore + dogState.q4 + dogState.q5 + dogState.q6;
    }, [dogState]);

    const handleSave = () => {
        const score = isDog ? dogTotal : catTotal;
        onSave(score);
        onClose();
    };

    const dogMax = dogState.omitirMovilidad ? 20 : 24;
    const catNeedsMeds = catTotal > 5;
    const dogNeedsMeds = isDog && ((dogState.omitirMovilidad && dogTotal > 5) || (!dogState.omitirMovilidad && dogTotal > 6));

    const OptionGroup = ({ title, options, value, onChange }) => (
        <div className="mb-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{title}</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {options.map((opt) => (
                    <button
                        key={opt.val}
                        type="button"
                        onClick={() => onChange(opt.val)}
                        className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${value === opt.val
                                ? 'bg-fuchsia-50 border-fuchsia-500 dark:bg-fuchsia-900/30 dark:border-fuchsia-400 text-fuchsia-700 dark:text-fuchsia-300 ring-1 ring-fuchsia-500'
                                : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                    >
                        <span className="text-xs font-bold leading-tight pr-2">{opt.label}</span>
                        <span className={`text-sm font-black ${value === opt.val ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-slate-400'}`}>
                            {opt.val}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="4xl">
            <div className="bg-slate-50 dark:bg-[#111822] text-slate-800 dark:text-slate-200 p-0 overflow-hidden relative font-sans">

                {/* Header */}
                <div className="bg-white dark:bg-[#1B2132] p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
                    <div>
                        <h2 className="text-2xl font-black text-fuchsia-600 dark:text-fuchsia-400 flex items-center gap-2">
                            {isDog ? '🐶' : '🐱'} Escala de Glasgow ({isDog ? 'Perros' : 'Gatos'})
                        </h2>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
                            Evaluación Rápida de Dolor Agudo
                        </p>
                    </div>
                    <div className="flex gap-4 items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="text-right">
                            <p className="text-[9px] uppercase font-black text-slate-400">Puntaje Total</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                                {isDog ? dogTotal : catTotal}
                                <span className="text-sm text-slate-400 font-bold ml-1">/ {isDog ? dogMax : 20}</span>
                            </p>
                        </div>
                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                        <div className="text-left w-32">
                            <p className="text-[9px] uppercase font-black text-slate-400">Intervención Analgésica</p>
                            {(isDog ? dogNeedsMeds : catNeedsMeds) ? (
                                <p className="text-xs font-black text-red-500 mt-1 uppercase">⚠️ Recomendada</p>
                            ) : (
                                <p className="text-xs font-black text-emerald-500 mt-1 uppercase">✅ Estable</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh] bg-slate-50/50 dark:bg-[#111822] space-y-6">
                    {isDog ? (
                        <>
                            {/* DOG SCALE SECTION */}
                            <div className="bg-white dark:bg-[#1B2132] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 flex items-center justify-center text-xs">A</span>
                                    Observación en Jaula
                                </h3>

                                <OptionGroup
                                    title="¿Cómo está el perro?"
                                    value={dogState.q1}
                                    onChange={(v) => setDogState({ ...dogState, q1: v })}
                                    options={[
                                        { val: 0, label: 'Callado' },
                                        { val: 1, label: 'Lloriquea' },
                                        { val: 2, label: 'Gime' },
                                        { val: 3, label: 'Aúlla / Chilla' },
                                    ]}
                                />

                                <OptionGroup
                                    title="Reacción a la herida"
                                    value={dogState.q2}
                                    onChange={(v) => setDogState({ ...dogState, q2: v })}
                                    options={[
                                        { val: 0, label: 'Ignora' },
                                        { val: 1, label: 'Se mira' },
                                        { val: 2, label: 'Se lame' },
                                        { val: 3, label: 'Se frota o rasca' },
                                        { val: 4, label: 'Se muerde' },
                                    ]}
                                />
                            </div>

                            <div className="bg-white dark:bg-[#1B2132] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 flex items-center justify-center text-xs">B</span>
                                        Movilidad
                                    </h3>
                                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                                        <input type="checkbox" checked={dogState.omitirMovilidad} onChange={(e) => setDogState({ ...dogState, omitirMovilidad: e.target.checked })} className="rounded text-fuchsia-500 focus:ring-fuchsia-500 bg-transparent border-slate-300" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Omitir (Fracturas/Parálisis)</span>
                                    </label>
                                </div>

                                {!dogState.omitirMovilidad && (
                                    <OptionGroup
                                        title="Al levantarse o caminar"
                                        value={dogState.q3}
                                        onChange={(v) => setDogState({ ...dogState, q3: v })}
                                        options={[
                                            { val: 0, label: 'Normal' },
                                            { val: 1, label: 'Cojea' },
                                            { val: 2, label: 'Lento / Le cuesta' },
                                            { val: 3, label: 'Rígido' },
                                            { val: 4, label: 'Se niega a moverse' },
                                        ]}
                                    />
                                )}
                            </div>

                            <div className="bg-white dark:bg-[#1B2132] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 flex items-center justify-center text-xs">C</span>
                                    Palpación (Presión leve herida)
                                </h3>

                                <OptionGroup
                                    title="Respuesta al tacto"
                                    value={dogState.q4}
                                    onChange={(v) => setDogState({ ...dogState, q4: v })}
                                    options={[
                                        { val: 0, label: 'No hace nada' },
                                        { val: 1, label: 'Mira la zona' },
                                        { val: 2, label: 'Se encoge' },
                                        { val: 3, label: 'Gruñe/Protege' },
                                        { val: 4, label: 'Dentellada' },
                                        { val: 5, label: 'Llora' },
                                    ]}
                                />
                            </div>

                            <div className="bg-white dark:bg-[#1B2132] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 flex items-center justify-center text-xs">D</span>
                                    Estado General
                                </h3>

                                <OptionGroup
                                    title="Comportamiento / Actitud"
                                    value={dogState.q6}
                                    onChange={(v) => setDogState({ ...dogState, q6: v })}
                                    options={[
                                        { val: 0, label: 'Alegre' },
                                        { val: 1, label: 'Tranquilo' },
                                        { val: 2, label: 'Indiferente' },
                                        { val: 3, label: 'Ansioso' },
                                        { val: 4, label: 'Deprimido / No reacciona' },
                                    ]}
                                />

                                <OptionGroup
                                    title="Postura"
                                    value={dogState.q5}
                                    onChange={(v) => setDogState({ ...dogState, q5: v })}
                                    options={[
                                        { val: 0, label: 'Cómodo' },
                                        { val: 1, label: 'Inquieto' },
                                        { val: 2, label: 'Molesto / Encorvado' },
                                        { val: 3, label: 'Tenso' },
                                        { val: 4, label: 'Rígido' },
                                    ]}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* CAT SCALE SECTION */}
                            <div className="bg-white dark:bg-[#1B2132] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 flex items-center justify-center text-xs">A</span>
                                    Observación en Jaula
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <OptionGroup
                                            title="Comportamiento"
                                            value={catState.q1}
                                            onChange={(v) => setCatState({ ...catState, q1: v })}
                                            options={[
                                                { val: 0, label: 'Tranquilo / Ronronea' },
                                                { val: 1, label: 'Llora / Gruñe' },
                                            ]}
                                        />
                                        <OptionGroup
                                            title="Reacción a la Herida"
                                            value={catState.q3}
                                            onChange={(v) => setCatState({ ...catState, q3: v })}
                                            options={[
                                                { val: 0, label: 'Ignora' },
                                                { val: 1, label: 'Se mira la herida' },
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <OptionGroup
                                            title="Postura Global"
                                            value={catState.q2}
                                            onChange={(v) => setCatState({ ...catState, q2: v })}
                                            options={[
                                                { val: 0, label: 'Relajado' },
                                                { val: 1, label: 'Se relame' },
                                                { val: 2, label: 'Inquieto / Encogido' },
                                                { val: 3, label: 'Tenso / Agazapado' },
                                                { val: 4, label: 'Rígido / Encorvado' },
                                            ]}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
                                    <OptionGroup
                                        title="Expresiones Faciales (Orejas)"
                                        value={catState.q4_orejas}
                                        onChange={(v) => setCatState({ ...catState, q4_orejas: v })}
                                        options={[
                                            { val: 0, label: 'Hacia adelante (Normal)' },
                                            { val: 1, label: 'Ligeramente separadas' },
                                            { val: 2, label: 'Aplanadas / Atrás' },
                                        ]}
                                    />
                                    <OptionGroup
                                        title="Expresiones Faciales (Hocico)"
                                        value={catState.q4_hocico}
                                        onChange={(v) => setCatState({ ...catState, q4_hocico: v })}
                                        options={[
                                            { val: 0, label: 'Relajado / Redondo' },
                                            { val: 1, label: 'Tenso / Algo alargado' },
                                            { val: 2, label: 'Tenso y Aplanado' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-[#1B2132] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 flex items-center justify-center text-xs">B</span>
                                        Interacción / Caricia
                                    </h3>
                                    <OptionGroup
                                        title="¿Responde a la caricia?"
                                        value={catState.q5}
                                        onChange={(v) => setCatState({ ...catState, q5: v })}
                                        options={[
                                            { val: 0, label: 'Sí (Relajado)' },
                                            { val: 1, label: 'No responde' },
                                            { val: 2, label: 'Agresivamente' },
                                        ]}
                                    />
                                </div>

                                <div className="bg-white dark:bg-[#1B2132] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 flex items-center justify-center text-xs">C</span>
                                        Palpación Clínica
                                    </h3>
                                    <OptionGroup
                                        title="¿Qué hace al palpar?"
                                        value={catState.q6}
                                        onChange={(v) => setCatState({ ...catState, q6: v })}
                                        options={[
                                            { val: 0, label: 'No hace nada' },
                                            { val: 1, label: 'Mueve cola / aplana orejas' },
                                            { val: 2, label: 'Llora / Silba' },
                                            { val: 3, label: 'Gruñe' },
                                            { val: 4, label: 'Muerde / Ataca' },
                                        ]}
                                    />
                                    <OptionGroup
                                        title="Impresión General"
                                        value={catState.q7}
                                        onChange={(v) => setCatState({ ...catState, q7: v })}
                                        options={[
                                            { val: 0, label: 'Feliz / Contento' },
                                            { val: 1, label: 'Desinteresado / Tranquilo' },
                                            { val: 2, label: 'Ansioso / Miedo' },
                                            { val: 3, label: 'Aburrido' },
                                            { val: 4, label: 'Deprimido / Gruñón' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="bg-white dark:bg-[#1B2132] p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-8 py-3 bg-fuchsia-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-fuchsia-500 transition shadow-lg shadow-fuchsia-500/30">
                        Guardar Puntuación: {isDog ? dogTotal : catTotal}
                    </button>
                </div>

            </div>
        </Modal>
    );
}
