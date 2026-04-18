import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import { IconEdit, IconTrash, IconPlus } from '@/Components/Icons';

export default function Index({ auth, styles }) {
    const [editingStyle, setEditingStyle] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        description: '',
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingStyle(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (style) => {
        setEditingStyle(style);
        setData({
            name: style.name,
            description: style.description,
            is_active: !!style.is_active,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingStyle) {
            put(route('grooming-styles.update', editingStyle.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('grooming-styles.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteStyle = (id) => {
        if (confirm('¿Estás seguro de que deseas eliminar este estilo de corte?')) {
            destroy(route('grooming-styles.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                    <h2 className="font-black text-base sm:text-lg text-gray-800 dark:text-gray-200 uppercase tracking-widest">
                        Catálogo de Estilos
                    </h2>
                    <button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto bg-brand-primary text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                    >
                        <IconPlus className="w-3.5 h-3.5" />
                        Nuevo Estilo
                    </button>
                </div>
            }
        >
            <Head title="Estilos de Corte" />

            <div className="py-4 sm:py-6 bg-slate-50/50 dark:bg-slate-900/20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#1B2132] overflow-hidden shadow-sm rounded-2xl sm:rounded-[2rem] border dark:border-gray-700">
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {styles.map((style) => (
                                    <div 
                                        key={style.id} 
                                        className={`group relative bg-white dark:bg-gray-800/40 border dark:border-gray-700 rounded-[1.2rem] p-4 transition-all hover:shadow-md ${!style.is_active ? 'opacity-60 bg-gray-50 dark:bg-gray-900/20' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="min-w-0 pr-2">
                                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate group-hover:text-brand-primary transition-colors">
                                                    {style.name}
                                                </h3>
                                                <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-widest border ${style.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                    {style.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <button 
                                                    onClick={() => openEditModal(style)}
                                                    className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg text-slate-400 hover:text-brand-primary transition-colors border border-slate-100 dark:border-slate-600"
                                                    title="Editar"
                                                >
                                                    <IconEdit className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => deleteStyle(style.id)}
                                                    className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg text-slate-400 hover:text-red-500 transition-colors border border-slate-100 dark:border-slate-600"
                                                    title="Eliminar"
                                                >
                                                    <IconTrash className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium leading-snug italic border-t dark:border-gray-700/50 pt-2 mt-2 line-clamp-3">
                                            {style.description}
                                        </p>
                                    </div>
                                ))}
                                
                                {styles.length === 0 && (
                                    <div className="col-span-full py-12 text-center">
                                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] italic">
                                            No hay estilos de corte registrados.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={closeModal} maxWidth="md">
                <div className="bg-white dark:bg-[#1B2132] p-6">
                    <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6 border-b dark:border-gray-700 pb-3">
                        {editingStyle ? 'Editar Estilo' : 'Nuevo Estilo'}
                    </h3>
                    
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                                Nombre del Corte
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:ring-brand-primary font-black text-gray-900 dark:text-white uppercase text-xs tracking-tight transition-all"
                                placeholder="PUPPY STYLE"
                            />
                            {errors.name && <p className="text-red-500 text-[9px] mt-1 font-bold uppercase">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                                Especificación Técnica
                            </label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows="3"
                                className="w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:ring-brand-primary font-medium text-gray-700 dark:text-gray-300 text-xs transition-all"
                                placeholder="Detalles técnicos del corte..."
                            ></textarea>
                            {errors.description && <p className="text-red-500 text-[9px] mt-1 font-bold uppercase">{errors.description}</p>}
                        </div>

                        <div className="flex items-center gap-2 px-1">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary transition-all"
                                id="is_active"
                            />
                            <label htmlFor="is_active" className="text-[9px] font-black text-gray-500 uppercase tracking-widest cursor-pointer">
                                Estilo Activo
                            </label>
                        </div>

                        <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 px-4 py-2.5 rounded-xl font-black text-gray-400 uppercase text-[9px] tracking-widest hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-brand-primary text-white px-4 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest hover:opacity-90 shadow-lg shadow-brand-primary/20 transition-all disabled:opacity-50"
                            >
                                {processing ? '...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
