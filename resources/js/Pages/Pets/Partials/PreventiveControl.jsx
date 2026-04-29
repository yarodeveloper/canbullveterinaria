import React, { useState, useMemo, useEffect } from 'react';
import { router, useForm, Link } from '@inertiajs/react';
import axios from 'axios';

export default function PreventiveControl({ pet, auth, protocols = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [showQuickModal, setShowQuickModal] = useState(false);
    const [localProtocols, setLocalProtocols] = useState(protocols);
    const [stagedRecords, setStagedRecords] = useState([]);

    // Formulario para creación rápida de TIPOS de vacuna (Catálogo)
    const { data: quickData, setData: setQuickData, post: postQuick, processing: processingQuick, reset: resetQuick, errors: quickErrors } = useForm({
        name: '',
        type: 'vaccine',
        species: pet.species?.toLowerCase() === 'canino' || pet.species?.toLowerCase() === 'perro' ? 'Canino' : (pet.species?.toLowerCase() === 'felino' || pet.species?.toLowerCase() === 'gato' ? 'Felino' : 'both'),
        suggested_product: '',
        days_until_next: '',
        description: '',
    });

    // Formulario para el registro de la aplicación actual
    const { data, setData, post, processing, reset, errors, transform } = useForm({
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
        return Math.round(((totalChecked - overdue) / totalChecked) * 100);
    }, [pet.preventive_records]);

    const handleProtocolChange = (protocolId, forceProtocol = null) => {
        const protocol = forceProtocol || localProtocols.find(p => p.id === parseInt(protocolId));
        if (protocol) {
            const nextDate = new Date();
            if (protocol.days_until_next) {
                nextDate.setDate(nextDate.getDate() + parseInt(protocol.days_until_next));
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

    const handleQuickSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(route('health-protocols.store'), quickData);
            const newProtocol = response.data;
            setLocalProtocols(prev => [...prev, newProtocol]);
            
            // Seleccionar automáticamente el nuevo protocolo pasando el objeto directo
            handleProtocolChange(newProtocol.id, newProtocol);
            
            setShowQuickModal(false);
            resetQuick();
        } catch (error) {
            alert('Error al guardar el tipo de tratamiento. Verifique los datos.');
        }
    };

    const addRecordToList = () => {
        if (!data.name) return alert('El nombre del tratamiento es obligatorio.');
        
        setStagedRecords(prev => [...prev, { ...data, id: Date.now() }]);
        // Reset name/protocol for next one, but keep date and weight
        setData(prev => ({
            ...prev,
            name: '',
            next_due_date: '',
            lot_number: '',
            notes: ''
        }));
    };

    const removeStagedRecord = (tempId) => {
        setStagedRecords(prev => prev.filter(r => r.id !== tempId));
    };

    const submitAll = (e) => {
        e.preventDefault();
        
        const allToSave = [...stagedRecords];
        if (data.name) {
            allToSave.push(data);
        }

        if (allToSave.length === 0) return alert('No hay tratamientos para guardar.');

        // Batch upload
        router.post(route('preventive-records.store'), { records: allToSave }, {
            onSuccess: () => {
                setShowModal(false);
                setStagedRecords([]);
                reset();
            }
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

    // Ordenar cada grupo por fecha de aplicación descendente (más reciente primero)
    Object.keys(groupedRecords).forEach(type => {
        groupedRecords[type].sort((a, b) => {
            const dateA = a.application_date ? new Date(a.application_date.split('T')[0]) : new Date(0);
            const dateB = b.application_date ? new Date(b.application_date.split('T')[0]) : new Date(0);
            return dateB - dateA;
        });
    });

    const typeLabels = {
        vaccine: 'Vacuna',
        internal_deworming: 'Desparasitación Interna',
        external_deworming: 'Desparasitación Externa',
        other: 'Otro Tratamiento'
    };

    const [editingRecord, setEditingRecord] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Estado y form para modal de Refuerzo
    const [boosterRecord, setBoosterRecord] = useState(null);
    const [showBoosterModal, setShowBoosterModal] = useState(false);

    const { data: editData, setData: setEditData, put: putUpdate, processing: processingUpdate, reset: resetEdit, errors: editErrors } = useForm({
        type: 'vaccine',
        name: '',
        application_date: '',
        next_due_date: '',
        lot_number: '',
        brand: '',
        weight_at_time: '',
        notes: '',
        veterinarian_id: '',
    });

    const { data: boosterData, setData: setBoosterData, post: postBooster, processing: processingBooster, reset: resetBooster, errors: boosterErrors } = useForm({
        application_date: new Date().toISOString().split('T')[0],
        next_due_date: '',
        lot_number: '',
        brand: '',
        weight_at_time: pet.weight || '',
        notes: '',
        veterinarian_id: auth.user.id,
    });

    const openEditModal = (record) => {
        setEditingRecord(record);
        setEditData({
            type: record.type,
            name: record.name,
            application_date: record.application_date ? record.application_date.split(' ')[0].split('T')[0] : '',
            next_due_date: record.next_due_date ? record.next_due_date.split(' ')[0].split('T')[0] : '',
            lot_number: record.lot_number || '',
            brand: record.brand || '',
            weight_at_time: record.weight_at_time || '',
            notes: record.notes || '',
            veterinarian_id: record.veterinarian_id || auth.user.id,
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        putUpdate(route('preventive-records.update', editingRecord.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setEditingRecord(null);
                resetEdit();
            }
        });
    };

    const openBoosterModal = (record) => {
        setBoosterRecord(record);
        // Pre-calcular próximo refuerzo basado en el intervalo original
        let nextDate = '';
        if (record.next_due_date) {
            // Si ya hay una fecha de refuerzo, calculamos el intervalo que tuvo el registro anterior
            const applied = new Date(record.application_date?.split('T')[0] + 'T12:00:00');
            const due = new Date(record.next_due_date?.split('T')[0] + 'T12:00:00');
            const diffDays = Math.round((due - applied) / (1000 * 60 * 60 * 24));
            const newNext = new Date();
            newNext.setDate(newNext.getDate() + diffDays);
            nextDate = newNext.toISOString().split('T')[0];
        }
        setBoosterData({
            application_date: new Date().toISOString().split('T')[0],
            next_due_date: nextDate,
            lot_number: '',
            brand: record.brand || '',
            weight_at_time: pet.weight || record.weight_at_time || '',
            notes: '',
            veterinarian_id: auth.user.id,
        });
        setShowBoosterModal(true);
    };

    const handleBoosterSubmit = (e) => {
        e.preventDefault();
        postBooster(route('preventive-records.booster', boosterRecord.id), {
            onSuccess: () => {
                setShowBoosterModal(false);
                setBoosterRecord(null);
                resetBooster();
            }
        });
    };

    const typeIcons = { vaccine: '💉', internal_deworming: '💊', external_deworming: '🧴', other: '🛡️' };
    const typeColors = {
        vaccine: 'text-brand-primary dark:text-brand-primary',
        internal_deworming: 'text-brand-primary/80 dark:text-brand-primary/80',
        external_deworming: 'text-orange-500 dark:text-orange-400',
        other: 'text-teal-500 dark:text-teal-400'
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-teal-500';
        if (score >= 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border dark:border-gray-700">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="text-brand-primary">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <h3 className="text-sm sm:text-base font-black uppercase text-gray-900 dark:text-white tracking-tight">Vacunas y Tratamientos</h3>
                    </div>
                    {pet.status !== 'deceased' ? (
                        <button onClick={() => setShowModal(true)} className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-brand-primary/20 flex items-center gap-1.5">+ Registrar</button>
                    ) : (
                        <button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-red-900/20 flex items-center gap-1.5">
                            <span className="group-hover:animate-pulse">✞</span> Registro Post-mortem
                        </button>
                    )}
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estatus de Salud</span>
                        <span className={`text-xs font-black ${getScoreColor(healthScore)}`}>{healthScore}% Protección</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${healthScore >= 90 ? 'bg-teal-500' : healthScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${healthScore}%` }}></div>
                    </div>
                </div>

                {pet.preventive_records.length === 0 ? (
                    <div className="text-center py-10 opacity-50 border-t border-gray-100 dark:border-gray-700 pt-8">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Aún no hay registros preventivos</p>
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
                                        {records.map(record => {
                                            const appDateStr = record.application_date ? record.application_date.split('T')[0] : null;
                                            const dueDateStr = record.next_due_date ? record.next_due_date.split('T')[0] : null;
                                            const isOverdue = dueDateStr && new Date(dueDateStr + 'T12:00:00') < new Date();
                                            return (
                                                <div key={record.id} className="group flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-extrabold text-sm text-gray-900 dark:text-gray-100">{record.name}</p>
                                                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all">
                                                                <button onClick={() => openEditModal(record)} className="text-gray-300 hover:text-indigo-500 transition-all" title="Editar">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </button>
                                                                <button onClick={() => deleteRecord(record.id)} className="text-gray-300 hover:text-red-500 transition-all" title="Eliminar">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">Última: <span className="text-gray-500 dark:text-gray-300">{appDateStr ? new Date(appDateStr + 'T12:00:00').toLocaleDateString('es-ES') : 'N/A'}</span></p>
                                                    </div>
                                                    {dueDateStr && (
                                                        <div className="text-right ml-2 shrink-0 flex flex-col items-end gap-1.5">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${isOverdue ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'bg-gray-800 text-yellow-400 dark:bg-gray-900'}`}>
                                                                {isOverdue ? '❗Vencida' : 'Próx'}: {new Date(dueDateStr + 'T12:00:00').toLocaleDateString('es-ES')}
                                                            </span>
                                                            {pet.status !== 'deceased' && (
                                                                <button
                                                                    onClick={() => openBoosterModal(record)}
                                                                    className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${isOverdue ? 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/30' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/30'}`}
                                                                    title="Registrar refuerzo / nueva dosis"
                                                                >
                                                                    ↻ Aplicar Refuerzo
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Principal de Registro - Rediseñado para 2 columnas en PC */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-5xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                        {/* Header Unificado */}
                        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-brand-primary text-white shrink-0">
                            <div>
                                <h3 className="font-black uppercase tracking-widest text-sm">Registro de Vacunas y Tratamientos</h3>
                                <p className="text-[10px] text-white/70 uppercase font-black tracking-tighter">Panel de Aplicación Clínica</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-xl font-black transition">×</button>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden flex-1">
                            {/* Columna Izquierda: Formulario de Entrada */}
                            <div className="flex-1 p-4 sm:p-8 overflow-y-visible lg:overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r dark:border-gray-700 shrink-0">
                                <div className="space-y-6">
                                    <div className="bg-brand-primary/5 dark:bg-brand-primary/10 p-5 rounded-2xl border border-brand-primary/10 dark:border-brand-primary/20">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="block text-[10px] font-black uppercase text-brand-primary tracking-widest px-1">Seleccionar desde el Catálogo</label>
                                            <button type="button" onClick={() => setShowQuickModal(true)} className="text-[9px] font-black text-brand-primary uppercase tracking-widest hover:underline flex items-center gap-1"><span>+</span> Nuevo Tipo</button>
                                        </div>
                                        <select onChange={e => handleProtocolChange(e.target.value)} className="w-full rounded-xl border-brand-primary/20 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm focus:ring-brand-primary focus:border-brand-primary font-bold">
                                            <option value="">-- Buscar en el catálogo --</option>
                                            {localProtocols.filter(p => {
                                                if (!p.species || p.species === 'both') return true;
                                                const petSpecies = pet.species?.toLowerCase();
                                                const protocolSpecies = p.species.toLowerCase();
                                                if (protocolSpecies === 'canino' && (petSpecies === 'canino' || petSpecies === 'perro')) return true;
                                                if (protocolSpecies === 'felino' && (petSpecies === 'felino' || petSpecies === 'gato')) return true;
                                                return protocolSpecies === petSpecies;
                                            }).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-widest mb-1 px-1">Nombre Comercial</label>
                                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm font-bold" placeholder="Nombre" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-widest mb-1 px-1">Categoría</label>
                                            <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs font-bold">
                                                <option value="vaccine">Vacuna</option>
                                                <option value="internal_deworming">Desparasitación Interna</option>
                                                <option value="external_deworming">Desparasitación Externa</option>
                                                <option value="other">Otro Tratamiento</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-widest mb-1 px-1">Fecha Aplicación</label>
                                            <input type="date" value={data.application_date} onChange={e => setData('application_date', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-widest mb-1 px-1">Próximo Refuerzo</label>
                                            <input type="date" value={data.next_due_date} onChange={e => setData('next_due_date', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm font-bold" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-widest mb-1 px-1">Lote</label>
                                            <input type="text" value={data.lot_number} onChange={e => setData('lot_number', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs" />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-widest mb-1 px-1">Marca</label>
                                            <input type="text" value={data.brand} onChange={e => setData('brand', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs" />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-widest mb-1 px-1">Peso (kg)</label>
                                            <input type="number" step="0.01" value={data.weight_at_time} onChange={e => setData('weight_at_time', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs" />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-widest mb-1 px-1">Observaciones / Notas Clínicas</label>
                                        <textarea
                                            value={data.notes}
                                            onChange={e => setData('notes', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm"
                                            rows="3"
                                            placeholder="Detalles sobre virus, reacciones, recomendaciones..."
                                        />
                                    </div>
                                    
                                    <button type="button" onClick={addRecordToList} className="w-full py-4 border-2 border-dashed border-brand-primary text-brand-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-primary/5 transition group">
                                        <span className="group-hover:scale-110 inline-block transition">+ Añadir tratamiento a la lista</span>
                                    </button>
                                </div>
                            </div>

                            {/* Columna Derecha: Lista de Staging (Solo PC/Tablet) */}
                            <div className="w-full lg:w-[380px] bg-slate-50 dark:bg-gray-900/40 p-4 sm:p-8 overflow-y-visible lg:overflow-y-auto custom-scrollbar shrink-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-700">
                                <label className="block text-[10px] font-black uppercase text-brand-primary tracking-widest px-1 mb-6 flex items-center justify-between">
                                    <span>Tratamientos en Espera</span>
                                    <span className="bg-brand-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px]">{stagedRecords.length}</span>
                                </label>
                                
                                {stagedRecords.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                                        <span className="text-4xl mb-4">📝</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Lista vacía</p>
                                        <p className="text-[9px] mt-1 font-bold">Agrega aplicaciones desde el panel izquierdo</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pb-20 lg:pb-0">
                                        {stagedRecords.map((r) => (
                                            <div key={r.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-brand-primary/10 relative group animate-in slide-in-from-right-4 duration-200">
                                                <button onClick={() => removeStagedRecord(r.id)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition duration-200">×</button>
                                                <div className="flex gap-3">
                                                    <span className="text-xl">💉</span>
                                                    <div>
                                                        <p className="font-black text-xs text-slate-800 dark:text-white uppercase leading-tight">{r.name}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{r.brand || 'Marca n/a'}</p>
                                                        {r.next_due_date && (
                                                            <div className="mt-2 flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                                                                <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase">Refuerzo: {r.next_due_date}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer de Acción */}
                        <div className="p-4 sm:p-8 border-t dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 flex flex-col sm:flex-row gap-4">
                            <button onClick={() => setShowModal(false)} className="px-8 py-4 border border-slate-200 dark:border-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition w-full sm:w-auto">Cerrar</button>
                            <button onClick={submitAll} className="flex-1 py-4 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-primary/90 transition shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 w-full sm:w-auto">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                Finalizar y Guardar Aplicaciones ({stagedRecords.length + (data.name ? 1 : 0)})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Nuevo de Tipo (Catálogo Completo) */}
            {showQuickModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center bg-brand-primary text-white">
                            <div>
                                <h3 className="font-black uppercase tracking-widest text-sm">Nuevo Tratamiento en Catálogo</h3>
                                <p className="text-[10px] text-white/70 uppercase font-black tracking-tighter">Define las reglas para registros futuros</p>
                            </div>
                            <button onClick={() => setShowQuickModal(false)} className="text-2xl font-black transition hover:scale-110">×</button>
                        </div>
                        <form onSubmit={handleQuickSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 px-1">Nombre Comercial</label>
                                    <input type="text" value={quickData.name} onChange={e => setQuickData('name', e.target.value)} className="w-full rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm font-bold p-4" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 px-1">Aplica para:</label>
                                    <select value={quickData.species} onChange={e => setQuickData('species', e.target.value)} className="w-full rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm font-bold p-4">
                                        <option value="Canino">Caninos</option>
                                        <option value="Felino">Felinos</option>
                                        <option value="both">Ambas Especies</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 px-1">Categoría</label>
                                    <select value={quickData.type} onChange={e => setQuickData('type', e.target.value)} className="w-full rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm font-bold p-4">
                                        <option value="vaccine">Vacuna</option>
                                        <option value="internal_deworming">Desparasitación Interna</option>
                                        <option value="external_deworming">Desparasitación Externa</option>
                                        <option value="other">Otro Tratamiento</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 px-1">Refuerzo (Días)</label>
                                    <input type="number" value={quickData.days_until_next} onChange={e => setQuickData('days_until_next', e.target.value)} placeholder="Ej. 365" className="w-full rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm font-bold p-4" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 px-1">Producto Sugerido</label>
                                <input type="text" value={quickData.suggested_product} onChange={e => setQuickData('suggested_product', e.target.value)} className="w-full rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm font-bold p-4" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 px-1">Descripción</label>
                                <textarea value={quickData.description} onChange={e => setQuickData('description', e.target.value)} rows="3" className="w-full rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm p-4"></textarea>
                            </div>
                            <button type="submit" disabled={processingQuick} className="w-full py-4 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20">Añadir al Catálogo y Seleccionar</button>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal de Edición de Registro Individual */}
            {showEditModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-brand-primary text-white">
                            <div>
                                <h3 className="font-black uppercase tracking-widest text-xs">Editar Aplicación</h3>
                                <p className="text-[9px] text-white/70 uppercase font-black tracking-tighter">Mascota: {pet.name}</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-xl font-black transition hover:scale-110">×</button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Nombre Comercial</label>
                                    <input type="text" value={editData.name} onChange={e => setEditData('name', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs font-bold p-3" required />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Categoría</label>
                                    <select value={editData.type} onChange={e => setEditData('type', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs font-bold p-3">
                                        <option value="vaccine">Vacuna</option>
                                        <option value="internal_deworming">Desparasitación Interna</option>
                                        <option value="external_deworming">Desparasitación Externa</option>
                                        <option value="other">Otro Tratamiento</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Fecha Aplicación</label>
                                    <input type="date" value={editData.application_date} onChange={e => setEditData('application_date', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs font-bold p-3" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Próximo Refuerzo</label>
                                    <input type="date" value={editData.next_due_date} onChange={e => setEditData('next_due_date', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs font-bold p-3" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Lote</label>
                                    <input type="text" value={editData.lot_number} onChange={e => setEditData('lot_number', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-[10px] p-3" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Marca</label>
                                    <input type="text" value={editData.brand} onChange={e => setEditData('brand', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-[10px] p-3" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Peso (kg)</label>
                                    <input type="number" step="0.01" value={editData.weight_at_time} onChange={e => setEditData('weight_at_time', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-[10px] p-3" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Observaciones / Notas Clínicas</label>
                                <textarea value={editData.notes} onChange={e => setEditData('notes', e.target.value)} rows="2" className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs p-3"></textarea>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 border border-slate-200 dark:border-gray-700 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition">Cancelar</button>
                                <button type="submit" disabled={processingUpdate} className="flex-[2] py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20">
                                    {processingUpdate ? 'Guardando...' : 'Actualizar Aplicación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Aplicar Refuerzo */}
            {showBoosterModal && boosterRecord && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-brand-primary text-white">
                            <div>
                                <h3 className="font-black uppercase tracking-widest text-xs">↻ Aplicar Refuerzo / Nueva Dosis</h3>
                                <p className="text-[9px] text-white/70 uppercase font-black tracking-tighter mt-0.5">{boosterRecord.name} — {pet.name}</p>
                            </div>
                            <button onClick={() => setShowBoosterModal(false)} className="text-xl font-black transition hover:scale-110">×</button>
                        </div>

                        {/* Info del registro original */}
                        <div className="px-6 pt-4">
                            <div className="bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/10 dark:border-brand-primary/20 rounded-xl p-3 text-xs flex gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-brand-primary uppercase tracking-wider">Registro anterior</p>
                                    <p className="font-bold text-gray-700 dark:text-gray-300">{boosterRecord.name}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-brand-primary uppercase tracking-wider">Aplicado el</p>
                                    <p className="font-bold text-gray-700 dark:text-gray-300">
                                        {boosterRecord.application_date ? new Date(boosterRecord.application_date.split('T')[0] + 'T12:00:00').toLocaleDateString('es-ES') : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-red-500 uppercase tracking-wider">Vencía</p>
                                    <p className="font-bold text-red-600">
                                        {boosterRecord.next_due_date ? new Date(boosterRecord.next_due_date.split('T')[0] + 'T12:00:00').toLocaleDateString('es-ES') : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleBoosterSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Fecha de Aplicación (Hoy)</label>
                                    <input type="date" value={boosterData.application_date} onChange={e => setBoosterData('application_date', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs font-bold p-3" required />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Próximo Refuerzo</label>
                                    <input type="date" value={boosterData.next_due_date} onChange={e => setBoosterData('next_due_date', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs font-bold p-3" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Lote</label>
                                    <input type="text" value={boosterData.lot_number} onChange={e => setBoosterData('lot_number', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-[10px] p-3" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Marca</label>
                                    <input type="text" value={boosterData.brand} onChange={e => setBoosterData('brand', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-[10px] p-3" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Peso (kg)</label>
                                    <input type="number" step="0.01" value={boosterData.weight_at_time} onChange={e => setBoosterData('weight_at_time', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-[10px] p-3" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 px-1">Observaciones / Notas Clínicas</label>
                                <textarea value={boosterData.notes} onChange={e => setBoosterData('notes', e.target.value)} rows="2" placeholder="Reacciones, lote de vacuna, peso del paciente..." className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-xs p-3"></textarea>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowBoosterModal(false)} className="flex-1 py-3 border border-slate-200 dark:border-gray-700 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition">Cancelar</button>
                                <button type="submit" disabled={processingBooster} className="flex-[2] py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2">
                                    {processingBooster ? 'Guardando...' : '✓ Confirmar Aplicación del Refuerzo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
