import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Index({ auth, templates }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        title: '',
        type: 'general',
        content: '',
        is_active: true,
    });

    const handleCreateNew = () => {
        setIsEditing(false);
        setCurrentTemplate(null);
        reset();
    };

    const handleEdit = (template) => {
        setIsEditing(true);
        setCurrentTemplate(template);
        setData({
            title: template.title,
            type: template.type,
            content: template.content,
            is_active: template.is_active,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('document-templates.update', currentTemplate.id), {
                onSuccess: () => {
                    handleCreateNew();
                }
            });
        } else {
            post(route('document-templates.store'), {
                onSuccess: () => {
                    handleCreateNew();
                }
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar esta plantilla de documento permanentemente?')) {
            destroy(route('document-templates.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Configuración de Documentos Legales</h2>}
        >
            <Head title="Documentos Legales" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Lista de Documentos */}
                    <div className="lg:col-span-1 space-y-4">
                        <button
                            onClick={handleCreateNew}
                            className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition mb-4"
                        >
                            + Nueva Plantilla
                        </button>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-4">
                            <div className="p-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">Tus Documentos</h3>
                            </div>
                            <ul className="divide-y dark:divide-gray-700">
                                {templates.map(tmpl => (
                                    <li key={tmpl.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer" onClick={() => handleEdit(tmpl)}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-black text-gray-900 dark:text-gray-100">{tmpl.title}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{tmpl.type} {tmpl.branch_id === null && '• PREDEFINIDO'}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                {!tmpl.is_active && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[9px] font-bold">INACTIVA</span>}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {templates.length === 0 && (
                                    <li className="p-8 text-center text-gray-500 italic text-sm">No has configurado plantillas aún.</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Editor de Documento */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {isEditing ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}
                                </h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Configura el texto de tus consentimientos, responsivas médicas, etc.</p>
                            </div>

                            <form onSubmit={submit} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título del Documento</label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            placeholder="Ej: Consentimiento Quirúrgico Estándar"
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:border-brand-primary focus:ring-brand-primary"
                                            required
                                        />
                                        {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
                                        <select
                                            value={data.type}
                                            onChange={e => setData('type', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:border-brand-primary focus:ring-brand-primary font-bold"
                                        >
                                            <option value="surgery">Cirugía / Anestesia</option>
                                            <option value="hospitalization">Hospitalización</option>
                                            <option value="euthanasia">Eutanasia</option>
                                            <option value="general">Responsiva General</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contenido (Draft)</label>
                                        <div className="text-[9px] text-indigo-500 font-bold">
                                            Variables soportadas: {'{pet_name}, {client_name}, {date}, {veterinarian_name}'}
                                        </div>
                                    </div>
                                    <textarea
                                        value={data.content}
                                        onChange={e => setData('content', e.target.value)}
                                        rows="12"
                                        placeholder="Yo, {client_name}, autorizo el procedimiento médico para mi mascota {pet_name}..."
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:border-brand-primary focus:ring-brand-primary font-medium text-sm leading-relaxed"
                                        required
                                    ></textarea>
                                    {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-bold text-gray-700 dark:text-gray-300">Plantilla Activa</label>
                                </div>

                                <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                                    {isEditing && currentTemplate?.branch_id !== null ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(currentTemplate.id)}
                                            className="px-4 py-2 text-red-500 font-bold uppercase text-[10px] hover:bg-red-50 rounded-lg transition"
                                        >
                                            Eliminar Plantilla
                                        </button>
                                    ) : <div></div>}

                                    <div className="flex gap-3">
                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={handleCreateNew}
                                                className="px-6 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-black uppercase text-gray-500 hover:bg-gray-50 transition"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={processing || (isEditing && currentTemplate?.branch_id === null)}
                                            className="px-8 py-3 bg-brand-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-primary/30 hover:opacity-90 transition disabled:opacity-50"
                                        >
                                            {isEditing ? 'Guardar Cambios' : 'Crear Plantilla'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
