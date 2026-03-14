import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import Modal from '@/Components/Modal';

export default function Index({ auth, protocols }) {
    const [showModal, setShowModal] = useState(false);
    const [editingProtocol, setEditingProtocol] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        type: 'vaccine',
        species: 'both',
        suggested_product: '',
        days_until_next: '',
        description: '',
    });

    const openModal = (protocol = null) => {
        if (protocol) {
            setEditingProtocol(protocol);
            setData({
                name: protocol.name,
                type: protocol.type,
                species: protocol.species,
                suggested_product: protocol.suggested_product || '',
                days_until_next: protocol.days_until_next || '',
                description: protocol.description || '',
            });
        } else {
            setEditingProtocol(null);
            reset();
        }
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingProtocol) {
            put(route('health-protocols.update', editingProtocol.id), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            post(route('health-protocols.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const deleteProtocol = (id) => {
        if (confirm('¿Estás seguro de eliminar este protocolo?')) {
            router.delete(route('health-protocols.destroy', id));
        }
    };

    const typeLabels = {
        vaccine: 'Vacuna',
        internal_deworming: 'Desparasitación Interna',
        external_deworming: 'Desparasitación Externa',
        other: 'Otro Tratamiento',
    };

    const speciesLabels = {
        Canino: '🐶 Canino',
        Felino: '🐱 Felino',
        both: '🐾 Ambos',
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-black text-xl text-slate-800 dark:text-white uppercase tracking-tighter">Vacunas y Tratamientos</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Configuración de Catálogo Preventivo</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        + Nuevo Tratamiento
                    </button>
                </div>
            }
        >
            <Head title="Vacunas y Tratamientos" />

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-700">
                        <div className="p-8">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b dark:border-gray-700">
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Tratamiento</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Especies</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Refuerzo (Días)</th>
                                            <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {protocols.map((protocol) => (
                                            <tr key={protocol.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                <td className="py-5">
                                                    <p className="font-black text-slate-700 dark:text-white uppercase text-sm">{protocol.name}</p>
                                                    <p className="text-[10px] text-slate-400 italic font-medium">{protocol.suggested_product || 'Sin producto asignado'}</p>
                                                </td>
                                                <td className="py-5">
                                                    <span className="px-3 py-1 bg-slate-100 dark:bg-gray-700 rounded-full text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider font-sans">
                                                        {typeLabels[protocol.type]}
                                                    </span>
                                                </td>
                                                <td className="py-5">
                                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 font-sans">
                                                        {speciesLabels[protocol.species]}
                                                    </span>
                                                </td>
                                                <td className="py-5">
                                                    <span className="text-sm font-black text-slate-600 dark:text-slate-300 font-sans">
                                                        {protocol.days_until_next ? `${protocol.days_until_next} días` : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-5 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openModal(protocol)}
                                                            className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        {protocol.branch_id && (
                                                            <button
                                                                onClick={() => deleteProtocol(protocol.id)}
                                                                className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-8">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center text-xl">💉</div>
                        {editingProtocol ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
                    </h2>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Nombre Comercial / Tratamiento</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-gray-900 shadow-sm focus:ring-brand-primary focus:border-brand-primary text-sm py-3.5 px-4 font-bold"
                                    placeholder="Ej. Quíntuple Canina"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Categoría</label>
                                <select
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    className="w-full rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-gray-900 shadow-sm focus:ring-brand-primary focus:border-brand-primary text-sm py-3.5 px-4 font-bold"
                                >
                                    <option value="vaccine">Vacuna</option>
                                    <option value="internal_deworming">Desparasitación Interna</option>
                                    <option value="external_deworming">Desparasitación Externa</option>
                                    <option value="other">Otro Tratamiento</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Aplica para:</label>
                                <select
                                    value={data.species}
                                    onChange={e => setData('species', e.target.value)}
                                    className="w-full rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-gray-900 shadow-sm focus:ring-brand-primary focus:border-brand-primary text-sm py-3.5 px-4 font-bold"
                                >
                                    <option value="Canino">Caninos</option>
                                    <option value="Felino">Felinos</option>
                                    <option value="both">Ambas Especies</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Refuerzo Sugerido (Días)</label>
                                <input
                                    type="number"
                                    value={data.days_until_next}
                                    onChange={e => setData('days_until_next', e.target.value)}
                                    className="w-full rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-gray-900 shadow-sm focus:ring-brand-primary focus:border-brand-primary text-sm py-3.5 px-4 font-bold"
                                    placeholder="Ej. 365"
                                />
                                <p className="text-[9px] text-slate-400 mt-2 uppercase italic px-1 font-bold">Cálculo automático de próxima fecha</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Producto Sugerido / Marca</label>
                            <input
                                type="text"
                                value={data.suggested_product}
                                onChange={e => setData('suggested_product', e.target.value)}
                                className="w-full rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-gray-900 shadow-sm focus:ring-brand-primary focus:border-brand-primary text-sm py-3.5 px-4 font-bold"
                                placeholder="Ej. Nobivac, Vanguard, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Descripción o Notas</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="w-full rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-gray-900 shadow-sm focus:ring-brand-primary focus:border-brand-primary text-sm py-3.5 px-4 font-medium"
                                rows="3"
                                placeholder="Detalles clínicos relevantes..."
                            ></textarea>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 px-6 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-4 px-6 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20"
                            >
                                {editingProtocol ? 'Guardar Cambios' : 'Confirmar Registro'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
