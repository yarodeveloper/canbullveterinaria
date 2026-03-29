import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Edit({ auth, member, roles, branches }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, patch, processing, errors } = useForm({
        name: member.name || '',
        email: member.email || '',
        password: '',
        password_confirmation: '',
        role: member.role || '',
        branch_id: member.branch_id || '',
        phone: member.phone || '',
        professional_license: member.professional_license || '',
    });

    const roleTranslations = {
        admin: 'Administrador General',
        cashier: 'Encargado Caja',
        veterinarian: 'Médico Veterinario',
        receptionist: 'Recepcionista',
        groomer: 'Estilista / Groomer',
        pharmacist: 'Farmacéutico',
        assistant: 'Asistente Médico',
        specialist: 'Especialista Médico',
        surgeon: 'Cirujano Veterinario',
        client: 'Cliente',
    };

    const rolePermissionsInfo = {
        admin: '🌟 ACCESO TOTAL: Configuración del sistema, Dashboard Financiero, Gestión de Personal, y todos los módulos sin restricciones.',
        cashier: '💵 CAJA Y VENTAS: Puede abrir/cerrar turnos de caja, realizar cobros en POS, registrar retiros/egresos justificados, procesar devoluciones de almacén y gestionar clientes.',
        veterinarian: '🩺 ÁREA MÉDICA: Consultas y Expedientes Médicos, Citas, y visualización de mascotas. (NO maneja finanzas).',
        receptionist: '🛎️ MOSTRADOR: Crea Clientes/Citas, Ventas Básicas POS y apertura simple de caja. (NO puede registrar salidas de efectivo ni devoluciones).',
        pharmacist: '💊 ALMACÉN: Gestión absoluta de Catálogo, Registro de Lotes, y Ajustes Rápidos de Inventario.',
        groomer: '✂️ ESTILISTA: Solo acceso a la agenda de Citas y visualización de mascotas.',
        assistant: '🥼 AUXILIAR: Visualización de mascotas, agendas e historiales médicos. Perfil de apoyo general.',
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('staff.update', member.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-black text-white">Editar Miembro: {member.name}</h2>}
        >
            <Head title={`Editar ${member.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-[2rem] p-8 border border-gray-100 dark:border-gray-700">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    {errors.name && <div className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.name}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                    {errors.email && <div className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.email}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Rol en el Sistema</label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                                        value={data.role}
                                        onChange={e => setData('role', e.target.value)}
                                    >
                                        <option value="">Selecciona un rol</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.name}>{roleTranslations[role.name] || role.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                    {data.role && rolePermissionsInfo[data.role] && (
                                        <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl">
                                            <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 leading-relaxed uppercase tracking-wide">
                                                {rolePermissionsInfo[data.role]}
                                            </p>
                                        </div>
                                    )}
                                    {errors.role && <div className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.role}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Sucursal</label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                                        value={data.branch_id}
                                        onChange={e => setData('branch_id', e.target.value)}
                                    >
                                        <option value="">Selecciona sucursal</option>
                                        {branches.map(branch => (
                                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                                        ))}
                                    </select>
                                    {errors.branch_id && <div className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.branch_id}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Teléfono (Opcional)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary uppercase"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="Ej. 5512345678"
                                    />
                                    {errors.phone && <div className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.phone}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Cédula Profesional (Médicos)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary uppercase"
                                        value={data.professional_license}
                                        onChange={e => setData('professional_license', e.target.value)}
                                        placeholder="Ej. 1234567"
                                    />
                                    {errors.professional_license && <div className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.professional_license}</div>}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 mt-8">
                                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Seguridad (Opcional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Nueva Contraseña</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Dejar en blanco para mantener actual"
                                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary placeholder:text-gray-300 placeholder:text-[10px] pr-10"
                                                value={data.password}
                                                onChange={e => setData('password', e.target.value)}
                                                autoComplete="new-password"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
                                            >
                                                {showPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && <div className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.password}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Confirmar Contraseña</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                                                value={data.password_confirmation}
                                                onChange={e => setData('password_confirmation', e.target.value)}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 mt-8">
                                <Link
                                    href={route('staff.index')}
                                    className="text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 bg-brand-primary text-white rounded-xl text-xs font-black uppercase hover:bg-brand-primary/90 transition shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                                >
                                    Actualizar Miembro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
