import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Index({ auth, templates, products }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        description: '',
        animal_type: 'Todos',
        is_active: true,
        items: []
    });

    const categories = ['Insumos', 'Materiales', 'Medicamentos', 'Equipos', 'Renta de Equipos', 'Apoyo Médico', 'Servicios', 'Otros'];

    const handleCreateNew = () => {
        setIsEditing(false);
        setCurrentTemplate(null);
        reset();
        setData('items', [{
            product_id: '',
            category: 'Insumos',
            description: '',
            is_dosable: false,
            base_dose: '',
            unit_weight: '1',
            suggested_quantity: '1',
            suggested_price: '0'
        }]);
    };

    const handleEdit = (template) => {
        setIsEditing(true);
        setCurrentTemplate(template);
        setData({
            name: template.name,
            description: template.description || '',
            animal_type: template.animal_type,
            is_active: template.is_active,
            items: template.items.map(item => ({
                product_id: item.product_id || '',
                category: item.category,
                description: item.description,
                is_dosable: item.is_dosable,
                base_dose: item.base_dose || '',
                unit_weight: item.unit_weight || '1',
                suggested_quantity: item.suggested_quantity,
                suggested_price: item.suggested_price
            }))
        });
    };

    const addItem = () => {
        setData('items', [...data.items, {
            product_id: '',
            category: 'Insumos',
            description: '',
            is_dosable: false,
            base_dose: '',
            unit_weight: '1',
            suggested_quantity: '1',
            suggested_price: '0'
        }]);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        
        // Auto-fill description and price if product is selected
        if (field === 'product_id' && value) {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                newItems[index].description = product.name;
                newItems[index].suggested_price = product.price;
            }
        }
        
        setData('items', newItems);
    };

    const removeItem = (index) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('service-templates.update', currentTemplate.id), {
                onSuccess: () => handleCreateNew()
            });
        } else {
            post(route('service-templates.store'), {
                onSuccess: () => handleCreateNew()
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
            destroy(route('service-templates.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Catálogo de Servicios y Cotizaciones</h2>}
        >
            <Head title="Plantillas de Servicio" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Lista de Plantillas */}
                    <div className="lg:col-span-1 space-y-4">
                        <button
                            onClick={handleCreateNew}
                            className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition mb-4"
                        >
                            + Nueva Plantilla
                        </button>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 border-b dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">Plantillas Configuradas</h3>
                            </div>
                            <ul className="divide-y dark:divide-slate-700">
                                {templates.map(tmpl => (
                                    <li key={tmpl.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer group" onClick={() => handleEdit(tmpl)}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-black text-slate-900 dark:text-slate-100">{tmpl.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tmpl.animal_type} • {tmpl.items.length} Ítems</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-brand-primary font-bold text-sm">${Number(tmpl.total_estimated).toFixed(2)}</span>
                                                {!tmpl.is_active && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[9px] font-bold">INACTIVA</span>}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {templates.length === 0 && (
                                    <li className="p-8 text-center text-slate-500 italic text-sm">No hay plantillas configuradas.</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Editor de Plantilla */}
                    <div className="lg:col-span-2">
                        {data.items.length > 0 || isEditing ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
                                    {isEditing ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}
                                </h3>

                                <form onSubmit={submit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Nombre de la Plantilla</label>
                                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-brand-primary focus:ring-brand-primary" placeholder="Ej: Paquete Esterilización" />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Tipo de Animal</label>
                                            <select value={data.animal_type} onChange={e => setData('animal_type', e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-brand-primary focus:ring-brand-primary">
                                                <option value="Todos">Todos</option>
                                                <option value="Canino">Canino</option>
                                                <option value="Felino">Felino</option>
                                                <option value="Otros">Otros</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Descripción / Notas</label>
                                            <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="2" className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-brand-primary focus:ring-brand-primary"></textarea>
                                        </div>
                                    </div>

                                    <div className="mt-8 border-t dark:border-slate-700 pt-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-slate-700 dark:text-slate-300">Composición del Servicio</h4>
                                            <button type="button" onClick={addItem} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-brand-primary hover:text-white transition font-bold">
                                                + Añadir Ítem
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {data.items.map((item, idx) => (
                                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl relative group">
                                                    <button type="button" onClick={() => removeItem(idx)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full w-6 h-6 flex items-center justify-center transition opacity-0 group-hover:opacity-100">×</button>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                        <div>
                                                            <label className="block text-[9px] font-black text-slate-400 uppercase">Categoría</label>
                                                            <select value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)} className="w-full text-xs rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-[9px] font-black text-slate-400 uppercase">Producto/Servicio (Opcional)</label>
                                                            <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} className="w-full text-xs rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                                                                <option value="">-- Concepto Libre --</option>
                                                                {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="md:col-span-4">
                                                            <label className="block text-[9px] font-black text-slate-400 uppercase">Descripción de Cotización</label>
                                                            <input type="text" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} required className="w-full text-xs rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800" placeholder="Ej: Honorarios Cirujano Principal" />
                                                        </div>

                                                        {/* Configuración de Dosis / Cantidad */}
                                                        <div className="md:col-span-4 bg-white dark:bg-slate-800 p-3 rounded-lg border border-brand-primary/20 flex flex-wrap gap-4 items-center">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input type="checkbox" checked={item.is_dosable} onChange={e => updateItem(idx, 'is_dosable', e.target.checked)} className="rounded text-brand-primary focus:ring-brand-primary" />
                                                                <span className="text-xs font-bold text-brand-primary">¿Cálculo Automático por Peso?</span>
                                                            </label>

                                                            {item.is_dosable ? (
                                                                <div className="flex flex-wrap gap-3 items-center flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Dosis:</span>
                                                                        <input type="number" step="0.0001" value={item.base_dose} onChange={e => updateItem(idx, 'base_dose', e.target.value)} className="w-20 text-xs rounded border-slate-200 dark:border-slate-700 dark:bg-slate-900" placeholder="0.5" />
                                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">por cada</span>
                                                                        <input type="number" step="0.1" value={item.unit_weight} onChange={e => updateItem(idx, 'unit_weight', e.target.value)} className="w-16 text-xs rounded border-slate-200 dark:border-slate-700 dark:bg-slate-900" placeholder="1" />
                                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">kg.</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Cant. Fija:</span>
                                                                    <input type="number" step="0.01" value={item.suggested_quantity} onChange={e => updateItem(idx, 'suggested_quantity', e.target.value)} className="w-20 text-xs rounded border-slate-200 dark:border-slate-700 dark:bg-slate-900" />
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex items-center gap-2 ml-auto">
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase">Precio/Und: $</span>
                                                                <input type="number" step="0.01" value={item.suggested_price} onChange={e => updateItem(idx, 'suggested_price', e.target.value)} className="w-24 text-xs rounded border-slate-200 dark:border-slate-700 dark:bg-slate-900 font-bold text-brand-primary" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {errors.items && <p className="text-red-500 text-xs">{errors.items}</p>}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-6 border-t dark:border-slate-700">
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
                                            <label htmlFor="is_active" className="text-sm font-bold text-slate-700 dark:text-slate-300">Plantilla Activa</label>
                                        </div>
                                        <div className="flex gap-3">
                                            {isEditing && (
                                                <button type="button" onClick={() => handleDelete(currentTemplate.id)} className="px-4 py-2 text-red-500 font-bold uppercase text-[10px] hover:bg-red-50 rounded-lg transition">
                                                    Eliminar
                                                </button>
                                            )}
                                            <button type="submit" disabled={processing} className="px-8 py-3 bg-brand-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-primary/30 hover:opacity-90 transition disabled:opacity-50">
                                                {isEditing ? 'Guardar Cambios' : 'Crear Plantilla'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center h-64 text-slate-500">
                                <p className="font-bold mb-2">Selecciona o crea una plantilla</p>
                                <p className="text-xs">Usa el botón de la izquierda para comenzar.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
