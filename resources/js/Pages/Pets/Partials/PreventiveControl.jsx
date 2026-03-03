import React, { useState, useMemo } from 'react';
import { router, useForm } from '@inertiajs/react';

export default function PreventiveControl({ pet, auth, protocols = [] }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        pet_id: pet.id,
        type: 'vaccine',
        name: '',
        application_date: new Date().toISOString().split('T')[0],
        next_due_date: '',
        lot_number: '',
        brand: '',
        weight_at_time: pet.weight || '',
        notes: '',
        veterinarian_id: auth.user.id,
    });

    // Calcular Puntaje de Salud (Health Score)
    const healthScore = useMemo(() => {
        if (pet.preventive_records.length === 0) return 0;

        const totalChecked = pet.preventive_records.length;
        const overdue = pet.preventive_records.filter(r =>
            r.next_due_date && new Date(r.next_due_date) < new Date()
        ).length;

        const score = Math.round(((totalChecked - overdue) / totalChecked) * 100);
        return score;
    }, [pet.preventive_records]);

    const handleProtocolChange = (protocolId) => {
        const protocol = protocols.find(p => p.id === parseInt(protocolId));
        if (protocol) {
            const nextDate = new Date();
            if (protocol.days_until_next) {
                nextDate.setDate(nextDate.getDate() + protocol.days_until_next);
            }

            setData(prev => ({
                ...prev,
                type: protocol.type,
                name: protocol.name,
                brand: protocol.suggested_product || '',
                next_due_date: protocol.days_until_next ? nextDate.toISOString().split('T')[0] : '',
                notes: protocol.description || ''
            }));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('preventive-records.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const deleteRecord = (id) => {
        if (confirm('¿Estás seguro de eliminar este registro?')) {
            router.delete(route('preventive-records.destroy', id));
        }
    };

    const groupedRecords = pet.preventive_records.reduce((acc, record) => {
        if (!acc[record.type]) acc[record.type] = [];
        acc[record.type].push(record);
        return acc;
    }, {});

    const typeLabels = {
        vaccine: 'Vacunas',
        internal_deworming: 'Desparasitación Interna',
        external_deworming: 'Desparasitación Externa',
        other: 'Otros Preventivos'
    };

    const typeIcons = {
        vaccine: '💉',
        internal_deworming: '💊',
        external_deworming: '🧴',
        other: '🛡️'
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-500';
        if (score >= 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-6">
            {/* Indicador de Salud (Health Score Card) */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border dark:border-gray-700 flex items-center justify-between overflow-hidden relative">
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Estatus de Salud Preventiva</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-black ${getScoreColor(healthScore)}`}>{healthScore}%</span>
                        <span className="text-gray-400 font-bold text-sm">Protección</span>
                    </div>
                </div>
                <div className="w-1/2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                    <div
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ${healthScore >= 90 ? 'bg-green-500' : healthScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${healthScore}%` }}
                    ></div>
                </div>
                {/* Background Decoration */}
                <div className="absolute -right-8 -bottom-8 text-9xl opacity-5 pointer-events-none">🛡️</div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-[2rem] border dark:border-gray-700">
                <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl text-2xl">📋</div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Carnet de Control</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Historial completo y plan futuro</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                    >
                        <span>+</span> Registrar Aplicación
                    </button>
                </div>

                <div className="p-8">
                    {pet.preventive_records.length === 0 ? (
                        <div className="text-center py-16 border-4 border-dashed border-gray-50 dark:border-gray-800 rounded-[2.5rem]">
                            <span className="text-5xl mb-4 block opacity-20">💉</span>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aún no hay registros preventivos</p>
                            <p className="text-gray-400 text-sm mt-1">El esquema de salud de {pet.name} comienza aquí.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {Object.entries(typeLabels).map(([type, label]) => (
                                <div key={type} className="space-y-5">
                                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-[0.3em] flex items-center gap-3 px-2">
                                        <span className="text-lg grayscale group-hover:grayscale-0">{typeIcons[type]}</span> {label}
                                    </h4>
                                    <div className="space-y-4">
                                        {(groupedRecords[type] || []).map(record => (
                                            <div key={record.id} className="group relative bg-white dark:bg-gray-900/50 p-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all hover:shadow-xl hover:shadow-indigo-500/5">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-black text-gray-900 dark:text-gray-100 text-lg tracking-tight">{record.name}</p>
                                                            {record.brand && <span className="text-[9px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-bold text-gray-500 uppercase">{record.brand}</span>}
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                            Aplicado el {new Date(record.application_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteRecord(record.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        title="Eliminar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>

                                                {record.next_due_date && (
                                                    <div className="mt-4 flex items-center gap-3">
                                                        <div className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm border ${new Date(record.next_due_date) < new Date()
                                                            ? 'bg-red-50 text-red-600 border-red-100'
                                                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                            }`}>
                                                            {new Date(record.next_due_date) < new Date() ? '🚨 VENCIDO' : '🕒 SIGUIENTE'}: {new Date(record.next_due_date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {(!groupedRecords[type] || groupedRecords[type].length === 0) && (
                                            <div className="p-8 rounded-[1.5rem] border-2 border-dotted border-gray-50 dark:border-gray-800 text-center">
                                                <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] italic">Sin historial de {label.toLowerCase()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal para Nuevo Registro */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center bg-indigo-600 text-white">
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-sm">Registro Inteligente</h3>
                                    <p className="text-[10px] text-indigo-200 uppercase font-black tracking-tighter">Plan preventivo de Canbull</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-xl font-black transition">×</button>
                            </div>
                            <form onSubmit={submit} className="p-8 space-y-6">
                                {/* Protocol Suggester */}
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                    <label className="block text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-2">Protocolo Inteligente</label>
                                    <select
                                        onChange={e => handleProtocolChange(e.target.value)}
                                        className="w-full rounded-xl border-indigo-200 dark:border-indigo-800 dark:bg-gray-900 shadow-sm text-sm focus:ring-indigo-500"
                                    >
                                        <option value="">-- Seleccionar un Protocolo Sugerido --</option>
                                        {protocols.filter(p => !p.species || p.species === 'both' || String(p.species).toLowerCase() === String(pet.species).toLowerCase() || String(p.species).toLowerCase().includes(String(pet.species).toLowerCase().substring(0, 3))).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Tipo de Registro</label>
                                        <select
                                            value={data.type}
                                            onChange={e => setData('type', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm"
                                        >
                                            <option value="vaccine">Vacuna</option>
                                            <option value="internal_deworming">Desparasitación Interna</option>
                                            <option value="external_deworming">Desparasitación Externa</option>
                                            <option value="other">Otro Tratamiento</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Nombre Comercial / Biológico</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Ej. Quíntuple"
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Fecha de Aplicación</label>
                                        <input
                                            type="date"
                                            value={data.application_date}
                                            onChange={e => setData('application_date', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Próximo Refuerzo</label>
                                        <input
                                            type="date"
                                            value={data.next_due_date}
                                            onChange={e => setData('next_due_date', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Lote</label>
                                        <input
                                            type="text"
                                            value={data.lot_number}
                                            onChange={e => setData('lot_number', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Marca/Lab</label>
                                        <input
                                            type="text"
                                            value={data.brand}
                                            onChange={e => setData('brand', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Peso (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.weight_at_time}
                                            onChange={e => setData('weight_at_time', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Observaciones del Veterinario</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm"
                                        rows="2"
                                        placeholder="Escribe aquí detalles sobre la reacción o recomendaciones..."
                                    />
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-100"
                                    >
                                        Guardar Registro
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
