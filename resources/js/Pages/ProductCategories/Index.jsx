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
                    <h2 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                        <img src="/icons/box-svgrepo-com.svg" className="w-6 h-6 icon-adaptive shadow-sm" alt="" />
                        Categorías y Clasificación
                    </h2>
                    {auth.user?.role === 'admin' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-brand-primary/20 hover:opacity-90 active:scale-95 flex items-center gap-2"
                        >
                            <span>+ Nueva Categoría</span>
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Categorías" />

            <div className="py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] shadow-xl overflow-hidden border dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-1">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-gray-900/40 uppercase text-[10px] font-black tracking-[0.2em] text-slate-400">
                                        <th className="px-6 py-3 rounded-l-xl text-center">Ico</th>
                                        <th className="px-6 py-3">Nombre</th>
                                        <th className="px-6 py-3 text-center">Atributo / Uso</th>
                                        <th className="px-6 py-3 text-center">Vinculados</th>
                                        <th className="px-6 py-3 text-right rounded-r-xl pr-10">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {categories.map(cat => (
                                        <tr key={cat.id} className="group hover:bg-brand-primary transition-all duration-150">
                                            <td className="px-6 py-2 text-center rounded-l-xl">
                                                <div className="w-8 h-8 mx-auto bg-slate-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-lg shadow-inner group-hover:bg-white/20 group-hover:scale-110 transition-all border dark:border-gray-600">
                                                    {cat.icon || '📦'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-white uppercase tracking-tight">{cat.name}</span>
                                            </td>
                                            <td className="px-6 py-2 text-center">
                                                {cat.is_service ? (
                                                    <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800 group-hover:bg-white group-hover:text-indigo-600 group-hover:border-white transition-colors">
                                                        ✂️ Servicio
                                                    </span>
                                                ) : (
                                                    <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-800 group-hover:bg-white group-hover:text-emerald-600 group-hover:border-white transition-colors">
                                                        📦 Inventario
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-2 text-center">
                                                <span className="text-slate-500 dark:text-slate-400 group-hover:text-white/80 text-[10px] font-black uppercase tracking-tighter">
                                                    {cat.products_count} Items
                                                </span>
                                            </td>
                                            <td className="px-6 py-2 text-right rounded-r-xl pr-10">
                                                {auth.user?.role === 'admin' && (
                                                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => openEdit(cat)} 
                                                            className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 text-brand-primary hover:scale-110 transition-transform flex items-center justify-center text-[10px] shadow-sm font-bold"
                                                            title="Editar"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteCategory(cat)} 
                                                            className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 text-red-500 hover:scale-110 transition-transform flex items-center justify-center text-[10px] shadow-sm font-bold"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1B2132] rounded-[1.5rem] shadow-2xl w-full max-w-sm overflow-hidden border dark:border-gray-700">
                        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/40">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Nueva Categoría</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-xl opacity-30 hover:opacity-100 transition-opacity">×</button>
                        </div>
                        <form onSubmit={submitCreate} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre Descriptivo</label>
                                <input
                                    type="text"
                                    value={createData.name}
                                    onChange={e => setCreateData('name', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-primary font-bold text-sm shadow-inner"
                                    placeholder="Ej. Vacunas, Juguetes..."
                                    required
                                />
                                {createErrors.name && <p className="text-red-500 text-[9px] mt-1 font-bold italic">{createErrors.name}</p>}
                            </div>

                            <div className="space-y-1.5 text-center">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Icono Representativo</label>
                                <input
                                    type="text"
                                    value={createData.icon}
                                    onChange={e => setCreateData('icon', e.target.value)}
                                    className="w-16 h-16 mx-auto bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-brand-primary font-bold text-3xl text-center shadow-inner"
                                    placeholder="📦"
                                />
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border-2 border-indigo-100 dark:border-indigo-800/50 rounded-xl transition">
                                    <input
                                        type="checkbox"
                                        checked={createData.is_service}
                                        onChange={e => setCreateData('is_service', e.target.checked)}
                                        className="w-5 h-5 text-brand-primary rounded bg-white border-indigo-300 focus:ring-brand-primary"
                                    />
                                    <div>
                                        <span className="block text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-tight">Es un Servicio</span>
                                        <span className="block text-[8px] font-bold text-indigo-600/60 dark:text-indigo-500/60 leading-tight">Clasifica como consulta, cirugía o estética (sin stock).</span>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={createProcessing} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                    {createProcessing ? 'Guardando...' : 'Guardar Categoría'}
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
