import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import BehaviorSelector, { BehaviorBadge } from '@/Components/BehaviorSelector';

export default function Show({ auth, client }) {
    const [editingState, setEditingState] = useState(null); // 'contact', 'emergency', 'crm', null

    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        emergency_contact_name: client.emergency_contact_name || '',
        emergency_contact_phone: client.emergency_contact_phone || '',
        tax_id: client.tax_id || '',
        crm_notes: client.crm_notes || '',
        behavior_profile: client.behavior_profile || '',
    });

    const handleEdit = (section) => {
        setEditingState(section);
        reset();
        clearErrors();
    };

    const handleBehaviorChange = (val) => {
        setData('behavior_profile', val);
        router.patch(route('clients.update', client.id), {
            ...data,
            behavior_profile: val,
        }, {
            preserveScroll: true,
            onSuccess: () => setEditingState(null),
        });
    };

    const handleCancel = () => {
        setEditingState(null);
        reset();
        clearErrors();
    };

    const handleSave = (e) => {
        e.preventDefault();
        patch(route('clients.update', client.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingState(null);
            },
        });
    };

    const EditIcon = ({ onClick }) => (
        <button
            onClick={onClick}
            type="button"
            className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors z-20 block p-1"
            title="Editar Información"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
        </button>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4 group">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight flex items-center gap-2">
                        Perfil de Cliente: <span className={editingState === 'name' ? 'hidden' : 'inline'}>{client.name}</span>
                        {editingState === 'name' ? (
                            <form className="inline-flex gap-2" onSubmit={handleSave}>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="text-lg py-0 px-2 rounded border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                                    autoFocus
                                />
                                <button type="submit" disabled={processing} className="text-sm bg-indigo-600 text-white px-2 py-1 rounded">Guardar</button>
                                <button type="button" onClick={handleCancel} className="text-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">X</button>
                            </form>
                        ) : null}

                        {editingState !== 'name' && (
                            <button onClick={() => handleEdit('name')} className="text-gray-300 dark:text-gray-600 hover:text-indigo-600 px-1 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        )}
                    </h2>

                    <div className="relative">
                        {editingState === 'behavior' ? (
                            <>
                                <div className="fixed inset-0 z-40" onClick={handleCancel}></div>
                                <div className="absolute top-0 left-0 mt-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 w-[300px] sm:w-[600px] max-w-[90vw]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-700 dark:text-gray-300">Perfil de Atención</h3>
                                        <button type="button" onClick={handleCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                    <BehaviorSelector
                                        value={data.behavior_profile}
                                        onChange={handleBehaviorChange}
                                        label=""
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => handleEdit('behavior')}>
                                {client.behavior_profile ? (
                                    <BehaviorBadge behaviorId={client.behavior_profile} />
                                ) : (
                                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 px-2 py-1 rounded-full border border-dashed border-gray-300 dark:border-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition">
                                        + Perfil
                                    </span>
                                )}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Cliente - ${client.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Columna Izquierda: Información editable */}
                        <div className="md:col-span-1 space-y-6">

                            {/* CAJA 1: INFORMACIÓN DE CONTACTO */}
                            <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border ${editingState === 'contact' ? 'border-indigo-400 ring-1 ring-indigo-400' : 'dark:border-gray-700'} relative group transition-all`}>
                                {editingState !== 'contact' && <EditIcon onClick={() => handleEdit('contact')} />}

                                <div className="flex justify-between items-center mb-4 pr-6">
                                    <h3 className="text-xs font-bold uppercase text-gray-400 tracking-widest">Información de Contacto</h3>
                                    {editingState === 'contact' && <span className="text-xs text-indigo-500 font-bold animate-pulse">Editando...</span>}
                                </div>

                                {editingState === 'contact' ? (
                                    <form onSubmit={handleSave} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Teléfono Principal</label>
                                            <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500" />
                                            {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Correo Electrónico</label>
                                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500" />
                                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Dirección Física</label>
                                            <textarea value={data.address} onChange={e => setData('address', e.target.value)} rows="2" className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">RFC / TAX ID</label>
                                            <input type="text" value={data.tax_id} onChange={e => setData('tax_id', e.target.value)} className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 uppercase" />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" disabled={processing} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 rounded transition text-sm">Guardar</button>
                                            <button type="button" onClick={handleCancel} className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 font-bold py-2 rounded transition text-sm">Cancelar</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Teléfono Principal</p>
                                            <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{client.phone || 'No registrado'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Correo Electrónico</p>
                                            <p className="font-medium text-indigo-500">{client.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Dirección Física</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{client.address || 'Sin dirección registrada'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CAJA 2: EMERGENCIA */}
                            <div className={`bg-red-50 dark:bg-red-900/10 p-6 rounded-xl shadow-sm border ${editingState === 'emergency' ? 'border-red-400 ring-1 ring-red-400' : 'border-red-100 dark:border-red-900/30'} relative group transition-all`}>
                                {editingState !== 'emergency' && (
                                    <button onClick={() => handleEdit('emergency')} type="button" className="absolute top-4 right-4 text-red-200 dark:text-red-900/50 hover:text-red-500 transition-colors z-20 block p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                )}
                                <h3 className="text-xs font-bold uppercase text-red-600 dark:text-red-500 tracking-widest flex items-center mb-4">
                                    <span className="mr-2">⚠️</span> Contacto de Emergencia
                                </h3>

                                {editingState === 'emergency' ? (
                                    <form onSubmit={handleSave} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Nombre del Contacto</label>
                                            <input type="text" value={data.emergency_contact_name} onChange={e => setData('emergency_contact_name', e.target.value)} placeholder="Ej: Maria Perez" className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:border-red-500 focus:ring-red-500" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Teléfono de Emergencia</label>
                                            <input type="text" value={data.emergency_contact_phone} onChange={e => setData('emergency_contact_phone', e.target.value)} placeholder="Ej: 555-0199" className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:border-red-500 focus:ring-red-500" />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" disabled={processing} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 rounded transition text-sm">Guardar</button>
                                            <button type="button" onClick={handleCancel} className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 font-bold py-2 rounded transition text-sm">Cancelar</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{client.emergency_contact_name || 'No definido'}</p>
                                        <p className="text-sm font-medium text-gray-500">{client.emergency_contact_phone || '---'}</p>
                                    </div>
                                )}
                            </div>

                            {/* CAJA 3: OBSERVACIONES CRM */}
                            <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border ${editingState === 'crm' ? 'border-indigo-400 ring-1 ring-indigo-400' : 'dark:border-gray-700'} relative group transition-all`}>
                                {editingState !== 'crm' && <EditIcon onClick={() => handleEdit('crm')} />}
                                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-4">Observaciones CRM</h3>

                                {editingState === 'crm' ? (
                                    <form onSubmit={handleSave} className="space-y-4">
                                        <div>
                                            <textarea value={data.crm_notes} onChange={e => setData('crm_notes', e.target.value)} rows="4" placeholder="Notas internas..." className="w-full text-sm rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" disabled={processing} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 rounded transition text-sm">Guardar</button>
                                            <button type="button" onClick={handleCancel} className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 font-bold py-2 rounded transition text-sm">Cancelar</button>
                                        </div>
                                    </form>
                                ) : (
                                    <p className="text-sm italic text-gray-400">
                                        {client.crm_notes || 'Sin notas internas.'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Listado de Mascotas (Pacientes) */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border dark:border-gray-700">
                                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">Mascotas Vinculadas</h3>
                                    <Link
                                        href={route('pets.create', { user_id: client.id })}
                                        className="text-xs bg-indigo-400 hover:bg-indigo-500 text-white px-4 py-2 rounded font-bold uppercase tracking-wider transition-colors shadow-sm"
                                    >
                                        + Agregar Mascota
                                    </Link>
                                </div>
                                <div className="p-6 grid grid-cols-1 gap-4">
                                    {client.pets.map(pet => (
                                        <Link
                                            key={pet.id}
                                            href={route('pets.show', pet.id)}
                                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 dark:border-gray-700/60 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:shadow-sm bg-white dark:bg-gray-800"
                                        >
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-500 font-black italic shadow-inner">
                                                    {pet.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 transition">{pet.name}</p>
                                                        {pet.is_aggressive && (
                                                            <span className="text-[9px] bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded uppercase font-bold animate-pulse">Aggressive</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5">{pet.species} • {pet.breed || 'Mestizo'}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 sm:mt-0 flex space-x-4 pl-16 sm:pl-0 text-[10px] uppercase font-bold text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-300">📄</span>
                                                    <span className="text-gray-500">{pet.medical_records_count} Consultas</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-300">📅</span>
                                                    <span className="text-gray-500">{pet.appointments_count} Citas</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {client.pets.length === 0 && (
                                        <div className="text-center py-10 text-gray-400 text-sm">
                                            Este cliente aún no tiene mascotas registradas.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Facturacion Rapida (Placeholder para futuro) */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-50 to-transparent dark:from-yellow-900/10 rounded-bl-full opacity-50 pointer-events-none"></div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-bold uppercase text-gray-400 tracking-widest relative z-10">Resumen Financiero</h3>
                                    <span className="text-[10px] bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-700/30 px-2 py-1 rounded font-bold uppercase tracking-wider relative z-10">Próximamente</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x dark:divide-gray-700/50">
                                    <div className="pt-4 sm:pt-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Saldo Pendiente</p>
                                        <p className="text-2xl font-black text-red-500">$0.00</p>
                                    </div>
                                    <div className="pt-4 sm:pt-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Último Pago</p>
                                        <p className="text-gray-400 text-lg font-medium">-</p>
                                    </div>
                                    <div className="pt-4 sm:pt-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Histórico</p>
                                        <p className="text-gray-400 text-lg font-medium">$0.00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
