import React, { useState } from 'react';

function EditSectionBtn({ onClick, active }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={active ? 'Cerrar Edición' : 'Editar sección'}
            className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition
                ${active
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700'
                    : 'bg-slate-100 text-slate-500 hover:bg-brand-primary/10 hover:text-brand-primary dark:bg-slate-700/50 dark:text-slate-400 dark:hover:bg-brand-primary/30 dark:hover:text-brand-primary border border-transparent hover:border-brand-primary/20 dark:hover:border-brand-primary/50'
                }`}
        >
            {active ? (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    Cerrar Edición
                </>
            ) : (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Editar
                </>
            )}
        </button>
    );
}

export default function MedicationsEditor({ 
    medications = [], 
    onSave, 
    onChange,
    products = [], 
    canManage = false, 
    title = "Tratamiento Base O Fármacos Programados", 
    iconColor = "bg-amber-500",
    isAlwaysEditing = false,
    petWeight = 0
}) {
    const [isEditing, setIsEditing] = useState(isAlwaysEditing);
    const [saving, setSaving] = useState(false);
    const [editMeds, setEditMeds] = useState((medications || []).map(m => ({ ...m })));
    const [medSearch, setMedSearch] = useState('');
    const [allowManual, setAllowManual] = useState(false);

    // Synchronize local editMeds with incoming medications if not editing
    React.useEffect(() => {
        if (!isEditing && !isAlwaysEditing) {
            setEditMeds((medications || []).map(m => ({ ...m })));
        }
    }, [medications]);

    // Update parent if onChange is provided
    const triggerChange = (updated) => {
        if (onChange) {
            onChange(updated);
        }
    };

    const normalize = (str) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const filteredProducts = medSearch.length > 0
        ? products.filter(p => {
            const normalizedName = normalize(p?.name);
            const normalizedQuery = normalize(medSearch);
            return normalizedName.includes(normalizedQuery) && !editMeds.find(m => m.id === p.id);
          }).slice(0, 10)
        : [];

    const addMedFromInventory = (p) => {
        const updated = [...editMeds, { id: p.id, name: p.name, unit: p.unit, is_controlled: p.is_controlled, is_manual: false, concentration: '', dose_mg_kg: '', total_dose: '', volume_ml: '', route: 'IV', lot_number: '', notes: '' }];
        setEditMeds(updated);
        setMedSearch('');
        triggerChange(updated);
    };

    const addManualMed = () => {
        const updated = [...editMeds, { id: null, name: '', unit: '', is_controlled: false, is_manual: true, concentration: '', dose_mg_kg: '', total_dose: '', volume_ml: '', route: 'IV', lot_number: '', notes: '' }];
        setEditMeds(updated);
        triggerChange(updated);
    };

    const calculateTotalDose = (med) => {
        const conc = parseFloat(med.concentration);
        const dose = parseFloat(med.dose_mg_kg);
        const weight = parseFloat(petWeight);

        if (!isNaN(conc) && !isNaN(dose) && !isNaN(weight) && conc > 0) {
            const result = (dose * weight) / conc;
            return result.toFixed(2);
        }
        return med.total_dose;
    };

    const updateMed = (idx, field, value) => {
        const updated = editMeds.map((m, i) => {
            if (i === idx) {
                const updatedMed = { ...m, [field]: value };
                // If weight, dose or concentration changed, recalculate total_dose
                if (field === 'concentration' || field === 'dose_mg_kg') {
                    updatedMed.total_dose = calculateTotalDose(updatedMed);
                }
                return updatedMed;
            }
            return m;
        });
        setEditMeds(updated);
        triggerChange(updated);
    };

    const removeMed = (idx) => {
        const updated = editMeds.filter((_, i) => i !== idx);
        setEditMeds(updated);
        triggerChange(updated);
    };

    const handleSave = async () => {
        if (typeof onSave === 'function') {
            setSaving(true);
            try {
                await onSave(editMeds);
            } catch (error) {
                console.error("Error saving medications:", error);
            } finally {
                setSaving(false);
            }
        }
        setIsEditing(false);
    };

    const handleToggleEdit = () => {
        if (!isEditing) {
            setEditMeds(medications.map(m => ({ ...m })));
            setMedSearch('');
        }
        setIsEditing(!isEditing);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${iconColor}`}></span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                {canManage && <EditSectionBtn onClick={handleToggleEdit} active={isEditing} />}
            </div>

            {isEditing ? (
                <div className="space-y-4 pt-1">
                    {/* Buscador de inventario */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={medSearch}
                                onChange={e => setMedSearch(e.target.value)}
                                placeholder="Buscar medicamento del inventario…"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                            {filteredProducts.length > 0 && (
                                <div className="absolute z-40 w-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-80 overflow-auto">
                                    {filteredProducts.map(p => (
                                        <button key={p.id} type="button" onClick={() => addMedFromInventory(p)}
                                            className="w-full text-left px-4 py-2.5 hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 transition flex items-center gap-3 text-sm">
                                            {p.is_controlled && <span className="text-[9px] bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-black uppercase">Controlado</span>}
                                            <span className="font-semibold text-slate-800 dark:text-white">{p.name}</span>
                                            <span className="text-slate-400 text-xs">{p.unit}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <div className={`w-9 h-5 rounded-full transition-colors relative ${allowManual ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-600'}`}
                                onClick={() => setAllowManual(!allowManual)}>
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${allowManual ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Manual</span>
                        </label>
                    </div>

                    {allowManual && (
                        <button type="button" onClick={addManualMed}
                            className="flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                            Agregar medicamento no registrado en inventario
                        </button>
                    )}

                    {/* Lista editable */}
                    {editMeds.length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-xs">
                            Busca y agrega medicamentos
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {editMeds.map((med, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border-2 ${med.is_controlled ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {med.is_controlled && <span className="text-[9px] bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-black uppercase">⚠️ Controlado</span>}
                                            {med.is_manual ? (
                                                <input value={med.name} onChange={e => updateMed(idx, 'name', e.target.value)}
                                                    placeholder="Nombre del medicamento"
                                                    className="font-bold text-sm bg-transparent border-b border-slate-300 focus:outline-none focus:border-brand-primary text-slate-800 dark:text-white px-1" />
                                            ) : (
                                                <span className="font-bold text-sm text-slate-800 dark:text-white">{med.name}</span>
                                            )}
                                        </div>
                                        <button type="button" onClick={() => removeMed(idx)} className="text-slate-400 hover:text-red-500 transition">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
                                        {[
                                            { field: 'concentration', label: 'Concentración (Mg/Ml)', placeholder: 'Ej: 390' },
                                            { field: 'dose_mg_kg',    label: 'Dosis (mg/kg)', placeholder: 'Ej: 87' },
                                            { field: 'total_dose',    label: 'Total (mL)',  placeholder: 'Auto-calculado' },
                                            { field: 'lot_number',    label: 'N° Lote',      placeholder: 'LOT-001' },
                                        ].map(f => (
                                            <div key={f.field}>
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{f.label}</p>
                                                <input value={med[f.field]} onChange={e => updateMed(idx, f.field, e.target.value)}
                                                    placeholder={f.placeholder}
                                                    className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary ${f.field === 'total_dose' ? 'font-bold text-brand-primary' : ''}`} />
                                            </div>
                                        ))}
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Vía</p>
                                            <select value={med.route} onChange={e => updateMed(idx, 'route', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary">
                                                {['IV', 'IM', 'SC', 'PO', 'Intracardíaca', 'Otra'].map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Notas</p>
                                        <input value={med.notes} onChange={e => updateMed(idx, 'notes', e.target.value)}
                                            placeholder="Observaciones de aplicación…"
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {typeof onSave === 'function' && (
                        <button type="button" disabled={saving} onClick={handleSave}
                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition">
                            {saving ? 'Guardando…' : '✓ Guardar Medicamentos'}
                        </button>
                    )}
                </div>
            ) : (
                medications.length === 0 ? (
                    <p className="text-sm italic text-slate-400">Sin medicamentos registrados.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    {['Medicamento', 'Conc. (Mg/Ml)', 'Dosis mg/kg', 'Total (mL)', 'Vía', 'N° Lote', 'Notas'].map(h => (
                                        <th key={h} className="pb-2 text-left text-[9px] font-black text-slate-400 uppercase tracking-wider pr-4">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {medications.map((m, i) => (
                                    <tr key={i} className={m.is_controlled ? 'bg-red-50/40 dark:bg-red-900/10' : ''}>
                                        <td className="py-2 pr-4 font-bold text-slate-800 dark:text-white whitespace-nowrap">
                                            {m.is_controlled && <span className="text-[8px] text-red-500 font-black mr-1">⚠️</span>}
                                            {m.name}
                                        </td>
                                        <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{m.concentration || '—'}</td>
                                        <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{m.dose_mg_kg || '—'}</td>
                                        <td className="py-2 pr-4 font-bold text-brand-primary">{m.total_dose || '—'}</td>
                                        <td className="py-2 pr-4 font-bold text-slate-700 dark:text-slate-300">{m.route || '—'}</td>
                                        <td className="py-2 pr-4 font-mono text-slate-500">{m.lot_number || '—'}</td>
                                        <td className="py-2 text-slate-500 italic">{m.notes || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
}
