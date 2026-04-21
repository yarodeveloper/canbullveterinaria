import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

const DEFAULT_NOTES = `Los precios indicados son una estimación basada en una evaluación preliminar del caso y están sujetos a cambios. En caso de requerir insumos, medicamentos o procedimientos adicionales como consecuencia de hallazgos médicos imprevistos durante el servicio, el responsable de la mascota será notificado oportunamente antes de proceder.

La cotización no incluye servicios no descritos en este documento. Los costos de hospitalización, apoyo especializado externo o complicaciones post-procedimiento se cotizarán por separado si aplica.

Vigencia de esta cotización: 15 días naturales a partir de la fecha de emisión.

Al autorizar este presupuesto, el cliente acepta las condiciones generales de la Clínica.`;

export default function Create({ auth, pet, templates, products, clients, petsList }) {
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [petWeight, setPetWeight] = useState(pet?.weight || 0);
    const [isGuest, setIsGuest] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        is_guest: false,
        pet_id: pet?.id || '',
        client_id: pet?.owner?.id || '',
        guest_client_name: '',
        guest_pet_name: '',
        guest_species: 'Canino',
        status: 'Borrador',
        valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: DEFAULT_NOTES,
        items: []
    });

    const categories = ['Insumos', 'Materiales', 'Medicamentos', 'Equipos', 'Renta de Equipos', 'Apoyo Médico', 'Servicios', 'Otros'];

    // Calculadora dinámica de subtotales
    useEffect(() => {
        const newItems = data.items.map(item => {
            const qty   = parseFloat(item.quantity)    || 0;
            const price = parseFloat(item.unit_price)  || 0;
            return { ...item, subtotal: qty * price };
        });
        const isDifferent = newItems.some((n, i) => n.subtotal !== data.items[i].subtotal);
        if (isDifferent) setData('items', newItems);
    }, [data.items]);

    const toggleGuest = (val) => {
        setIsGuest(val);
        setData('is_guest', val);
    };

    const loadTemplate = (templateId) => {
        setSelectedTemplate(templateId);
        if (!templateId) return;
        const template = templates.find(t => t.id === parseInt(templateId));
        if (!template) return;

        const mappedItems = template.items.map(tItem => {
            let qty = parseFloat(tItem.suggested_quantity);
            if (tItem.is_dosable && petWeight > 0) {
                const base       = parseFloat(tItem.base_dose)    || 0;
                const unitWeight = parseFloat(tItem.unit_weight)  || 1;
                qty = (base * petWeight) / unitWeight;
            }
            return {
                product_id: tItem.product_id || '',
                category: tItem.category,
                description: tItem.description,
                quantity: qty > 0 ? qty : 1,
                unit_price: tItem.suggested_price || 0,
                subtotal: (qty > 0 ? qty : 1) * (tItem.suggested_price || 0)
            };
        });
        setData(prev => ({ ...prev, items: [...prev.items, ...mappedItems] }));
    };

    const addItem = () => {
        setData('items', [...data.items, {
            product_id: '', category: 'Insumos', description: '', quantity: 1, unit_price: 0, subtotal: 0
        }]);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        if (field === 'product_id' && value) {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                newItems[index].description = product.name;
                newItems[index].unit_price  = product.price;
            }
        }
        setData('items', newItems);
    };

    const removeItem = (index) => setData('items', data.items.filter((_, i) => i !== index));

    const submit = (e) => {
        e.preventDefault();
        post(route('quotes.store'));
    };

    const total = data.items.reduce((s, i) => s + (parseFloat(i.subtotal) || 0), 0);
    const fmtMoney = (n) => Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 });

    const inputCls = "w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-brand-primary text-sm";

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('quotes.index')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <span className="text-lg">←</span>
                    </Link>
                    <h2 className="font-black text-xl text-slate-800 dark:text-slate-200 leading-tight tracking-tighter">
                        Nueva Cotización
                    </h2>
                </div>
            }
        >
            <Head title="Nueva Cotización" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                <form onSubmit={submit}>

                    {/* ====== SECCIÓN ENCABEZADO ====== */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-6">
                        <div className="flex justify-between items-start mb-6 pb-6 border-b dark:border-slate-700">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Datos del Servicio</h3>
                                <p className="text-xs text-slate-400 font-bold mt-1">Presupuesto detallado para servicios veterinarios.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Estimado</p>
                                <p className="text-4xl font-black text-brand-primary">${fmtMoney(total)}</p>
                            </div>
                        </div>

                        {/* Toggle Cliente Registrado / Público General */}
                        <div className="mb-6">
                            <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => toggleGuest(false)}
                                    className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition ${!isGuest ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50'}`}
                                >
                                    👤 Cliente Registrado
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleGuest(true)}
                                    className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition ${isGuest ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50'}`}
                                >
                                    🚶 Público General
                                </button>
                            </div>
                            {isGuest && (
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-2 ml-1">
                                    ⚠️ Este cliente/paciente no está registrado en el sistema. La cotización se guardará con nombre libre.
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* ---- MODO CLIENTE REGISTRADO ---- */}
                            {!pet && !isGuest && (
                                <>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Paciente (Mascota) *</label>
                                        <select
                                            value={data.pet_id}
                                            onChange={e => {
                                                const pId = e.target.value;
                                                const selected = petsList?.find(p => p.id === parseInt(pId));
                                                if (selected) {
                                                    setData(prev => ({ ...prev, pet_id: pId, client_id: selected.user_id || selected.owner?.id }));
                                                    setPetWeight(selected.weight || 0);
                                                } else {
                                                    setData('pet_id', pId);
                                                }
                                            }}
                                            required={!isGuest}
                                            className={inputCls}
                                        >
                                            <option value="">Seleccione un paciente...</option>
                                            {petsList?.map(p => <option key={p.id} value={p.id}>{p.name} ({p.owner?.name})</option>)}
                                        </select>
                                        {errors.pet_id && <p className="text-red-500 text-xs mt-1">{errors.pet_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Peso Estimado (kg) — Para Dosis</label>
                                        <input type="number" step="0.1" value={petWeight} onChange={e => setPetWeight(e.target.value)} className={inputCls} />
                                    </div>
                                </>
                            )}

                            {/* ---- MODO PÚBLICO GENERAL ---- */}
                            {isGuest && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Nombre del Cliente *</label>
                                        <input type="text" value={data.guest_client_name} onChange={e => setData('guest_client_name', e.target.value)} required={isGuest} placeholder="Ej: Juan Pérez" className={inputCls} />
                                        {errors.guest_client_name && <p className="text-red-500 text-xs mt-1">{errors.guest_client_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Nombre del Paciente *</label>
                                        <input type="text" value={data.guest_pet_name} onChange={e => setData('guest_pet_name', e.target.value)} required={isGuest} placeholder="Ej: Fido" className={inputCls} />
                                        {errors.guest_pet_name && <p className="text-red-500 text-xs mt-1">{errors.guest_pet_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Especie / Tipo</label>
                                        <select value={data.guest_species} onChange={e => setData('guest_species', e.target.value)} className={inputCls}>
                                            <option value="Canino">Canino</option>
                                            <option value="Felino">Felino</option>
                                            <option value="Otros">Otros</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Peso Estimado (kg) — Para Dosis</label>
                                        <input type="number" step="0.1" value={petWeight} onChange={e => setPetWeight(e.target.value)} className={inputCls} />
                                    </div>
                                </>
                            )}

                            {/* ---- PACIENTE FIJO (viene de URL) ---- */}
                            {pet && (
                                <div className="md:col-span-3 flex items-center justify-between bg-brand-primary/5 dark:bg-brand-primary/10 p-4 rounded-xl border border-brand-primary/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center text-xl">
                                            {pet.species === 'Canino' ? '🐕' : '🐈'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg">{pet.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Dueño: {pet.owner?.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Peso Registrado</p>
                                        <p className="font-black text-brand-primary">{pet.weight} kg</p>
                                    </div>
                                </div>
                            )}

                            {/* Plantilla + Vigencia */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Cargar Plantilla de Servicio</label>
                                <select value={selectedTemplate} onChange={e => loadTemplate(e.target.value)} className={`${inputCls} border-brand-primary/30 dark:border-brand-primary/30`}>
                                    <option value="">-- Seleccionar Plantilla --</option>
                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name} (${Number(t.total_estimated).toFixed(2)})</option>)}
                                </select>
                                <p className="text-[9px] text-slate-400 mt-1 ml-1">Cargará los ítems automáticamente.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Válido Hasta</label>
                                <input type="date" value={data.valid_until} onChange={e => setData('valid_until', e.target.value)} required className={inputCls} />
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Notas y Condiciones Especiales</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows="5"
                                    className={inputCls}
                                />
                                <p className="text-[9px] text-slate-400 mt-1 ml-1">Este texto aparecerá en el reporte impreso como condiciones generales de la cotización.</p>
                            </div>
                        </div>
                    </div>

                    {/* ====== DETALLE DE COSTOS ====== */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-black text-lg text-slate-900 dark:text-white">Detalle de Costos</h4>
                            <button
                                type="button"
                                onClick={addItem}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase hover:bg-brand-primary hover:text-white transition"
                            >
                                + Agregar Ítem Manual
                            </button>
                        </div>

                        {errors.items && <p className="text-red-500 text-xs mb-4 text-center">{errors.items}</p>}

                        {data.items.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                                <p className="text-slate-400 italic text-sm">No hay ítems. Carga una plantilla o agrega ítems manualmente.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.items.map((item, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-end p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl relative group">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx)}
                                            className="absolute -top-2.5 -right-2.5 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full w-6 h-6 flex items-center justify-center transition opacity-0 group-hover:opacity-100 shadow-sm z-10 text-base leading-none"
                                        >×</button>

                                        <div className="w-full md:w-[14%]">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Categoría</label>
                                            <select value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)} className="w-full text-xs rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-full md:w-[22%]">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Catálogo (Opcional)</label>
                                            <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} className="w-full text-xs rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                                                <option value="">- Libre -</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-full md:flex-1">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Descripción</label>
                                            <input type="text" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} required placeholder="Ej: Jeringas desechables" className="w-full text-xs rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
                                        </div>
                                        <div className="w-full md:w-20">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Cant.</label>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                value={item.quantity}
                                                onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                                onBlur={e => {
                                                    // Allow typing decimals freely, just validate on blur
                                                    const val = parseFloat(e.target.value);
                                                    if (!isNaN(val)) updateItem(idx, 'quantity', val);
                                                }}
                                                required
                                                className="w-full text-xs rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-center"
                                            />
                                        </div>
                                        <div className="w-full md:w-32">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Precio Unit.</label>
                                            <input type="number" step="0.01" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)} required className="w-full text-xs rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-right font-bold text-brand-primary" />
                                        </div>
                                        <div className="w-full md:w-32 text-right">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Subtotal</label>
                                            <div className="w-full py-2 px-3 text-xs rounded-lg bg-slate-200 dark:bg-slate-700 font-black text-slate-800 dark:text-slate-200">
                                                ${fmtMoney(item.subtotal || 0)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.items.length > 0 && (
                            <div className="flex justify-end mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Estimado</p>
                                    <p className="text-3xl font-black text-brand-primary mt-1">${fmtMoney(total)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href={route('quotes.index')} className="px-8 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl font-black uppercase text-xs hover:bg-slate-50 transition">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || data.items.length === 0}
                            className="px-12 py-3.5 bg-brand-primary text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-brand-primary/30 hover:opacity-90 transition disabled:opacity-50"
                        >
                            {processing ? 'Guardando...' : 'Guardar Cotización'}
                        </button>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
