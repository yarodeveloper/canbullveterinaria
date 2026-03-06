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

    const typeColors = {
        vaccine: 'text-purple-600 dark:text-purple-400',
        internal_deworming: 'text-indigo-500 dark:text-indigo-400',
        external_deworming: 'text-orange-500 dark:text-orange-400',
        other: 'text-teal-500 dark:text-teal-400'
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-teal-500';
        if (score >= 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    const isExpired = (dateString) => {
        return dateString && new Date(dateString) < new Date();
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border dark:border-gray-700">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="text-purple-600 dark:text-purple-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <h3 className="text-sm sm:text-base font-black uppercase text-gray-900 dark:text-white tracking-tight">Carnet de Control</h3>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1.5"
                    >
                        <span>+</span> Registrar
                    </button>
                </div>

                {/* Health Status */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estatus de Salud</span>
                        <span className={`text-xs font-black ${getScoreColor(healthScore)}`}>{healthScore}% Protección</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${healthScore >= 90 ? 'bg-teal-500' : healthScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${healthScore}%` }}
                        ></div>
                    </div>
                </div>

                {pet.preventive_records.length === 0 ? (
                    <div className="text-center py-10 opacity-50 border-t border-gray-100 dark:border-gray-700 pt-8">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Aún no hay registros preventivos</p>
                        <p className="text-gray-400 text-xs mt-1">El esquema de salud de {pet.name} comienza aquí.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(typeLabels).map(([type, label]) => {
                            const records = groupedRecords[type] || [];
                            if (records.length === 0) return null;

                            return (
                                <div key={type} className="border-t border-gray-100 dark:border-gray-700/50 pt-6 first:border-0 first:pt-0">
                                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-4 ${typeColors[type] || 'text-gray-500'}`}>
                                        <span>{typeIcons[type]}</span> {label}
                                    </h4>

                                    <div className="space-y-4">
                                        {records.map(record => (
                                            <div key={record.id} className="group flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-extrabold text-sm text-gray-900 dark:text-gray-100">{record.name}</p>
                                                        <button
                                                            onClick={() => deleteRecord(record.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all focus:outline-none"
                                                            title="Eliminar"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                                        Última: <span className="text-gray-500 dark:text-gray-300">{new Date(record.application_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    </p>
                                                </div>

                                                {record.next_due_date && (
                                                    <div className="text-right">
                                                        {isExpired(record.next_due_date) ? (
                                                            <span className="text-[10px] font-bold text-red-500">
                                                                Vencida: {new Date(record.next_due_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-yellow-400 dark:bg-gray-900 dark:text-yellow-400 shadow-sm">
                                                                Próx: {new Date(record.next_due_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
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
    );
}
