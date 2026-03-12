import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Index({ auth, categories }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, reset: createReset, errors: createErrors } = useForm({
        name: '',
        icon: '📦',
        is_service: false,
    });

    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, reset: editReset, errors: editErrors } = useForm({
        name: '',
        icon: '',
        is_service: false,
    });

    const submitCreate = (e) => {
        e.preventDefault();
        createPost(route('product-categories.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createReset();
            }
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editPut(route('product-categories.update', editingCategory.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setEditingCategory(null);
                editReset();
            }
        });
    };

    const openEdit = (category) => {
        setEditingCategory(category);
        setEditData({
            name: category.name,
            icon: category.icon || '',
            is_service: !!category.is_service,
        });
        setShowEditModal(true);
    };

    const deleteCategory = (category) => {
        if (confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
            router.delete(route('product-categories.destroy', category.id), {
                preserveScroll: true
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Catalogo de Categorías</h2>
                    {auth.user?.role === 'admin' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            + Nueva Categoría
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Categorías" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl overflow-hidden border dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-gray-900/40 border-b dark:border-gray-700">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 w-16 text-center">Icono</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Nombre de Categoría</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center w-40">Clasificación</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center w-48">Artículos Vinculados</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center w-32">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {categories.map(cat => (
                                        <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 text-center">
                                                <div className="w-10 h-10 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl shadow-sm">
                                                    {cat.icon || '📦'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">{cat.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {cat.is_service ? (
                                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-200 block">
                                                        ✂️ Servicio
                                                    </span>
                                                ) : (
                                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-200 block">
                                                        📦 Físico
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block">
                                                    {cat.products_count} {cat.products_count === 1 ? 'Artículo' : 'Artículos'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {auth.user?.role === 'admin' && (
                                                    <div className="flex justify-center gap-2">
                                                        <button 
                                                            onClick={() => openEdit(cat)} 
                                                            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-brand-primary hover:text-white transition-colors flex items-center justify-center text-sm"
                                                            title="Editar"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteCategory(cat)} 
                                                            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center text-sm"
                                                            title="Eliminar"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                                <div className="text-3xl mb-2 opacity-50">📂</div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">No hay categorías registradas</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border dark:border-gray-700">
                        <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Nueva Categoría</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-2xl opacity-30 hover:opacity-100">×</button>
                        </div>
                        <form onSubmit={submitCreate} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
                                <input
                                    type="text"
                                    value={createData.name}
                                    onChange={e => setCreateData('name', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                    placeholder="Ej. Vacunas, Juguetes..."
                                    required
                                />
                                {createErrors.name && <p className="text-red-500 text-xs mt-1 font-bold">{createErrors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Icono (Emoji)</label>
                                <input
                                    type="text"
                                    value={createData.icon}
                                    onChange={e => setCreateData('icon', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold text-center text-2xl"
                                    placeholder="📦"
                                />
                                {createErrors.icon && <p className="text-red-500 text-xs mt-1 font-bold">{createErrors.icon}</p>}
                            </div>

                            <div className="pt-4 border-t dark:border-gray-700">
                                <label className="flex items-center gap-4 cursor-pointer p-4 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl transition">
                                    <input
                                        type="checkbox"
                                        checked={createData.is_service}
                                        onChange={e => setCreateData('is_service', e.target.checked)}
                                        className="w-6 h-6 text-indigo-600 rounded bg-white border-indigo-300 focus:ring-indigo-600 focus:ring-2"
                                    />
                                    <div>
                                        <span className="block text-sm font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-tight">Clasificar como Servicios</span>
                                        <span className="block text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 mt-0.5">Activa esto si los elementos aquí dentro son consultas, cirugías o estética (no stock).</span>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={createProcessing} className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 disabled:opacity-50">
                                    Guardar Categoría
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border dark:border-gray-700">
                        <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Editar Categoría</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-2xl opacity-30 hover:opacity-100">×</button>
                        </div>
                        <form onSubmit={submitEdit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={e => setEditData('name', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold"
                                    required
                                />
                                {editErrors.name && <p className="text-red-500 text-xs mt-1 font-bold">{editErrors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Icono (Emoji)</label>
                                <input
                                    type="text"
                                    value={editData.icon}
                                    onChange={e => setEditData('icon', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary font-bold text-center text-2xl"
                                />
                                {editErrors.icon && <p className="text-red-500 text-xs mt-1 font-bold">{editErrors.icon}</p>}
                            </div>

                            <div className="pt-4 border-t dark:border-gray-700">
                                <label className="flex items-center gap-4 cursor-pointer p-4 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl transition">
                                    <input
                                        type="checkbox"
                                        checked={editData.is_service}
                                        onChange={e => setEditData('is_service', e.target.checked)}
                                        className="w-6 h-6 text-indigo-600 rounded bg-white border-indigo-300 focus:ring-indigo-600 focus:ring-2"
                                    />
                                    <div>
                                        <span className="block text-sm font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-tight">Clasificar como Servicios</span>
                                        <span className="block text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 mt-0.5">Activa esto si los elementos aquí dentro son consultas, cirugías o estética (no stock).</span>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={editProcessing} className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 disabled:opacity-50">
                                    Actualizar Categoría
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
