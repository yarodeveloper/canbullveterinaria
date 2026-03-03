import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create({ auth, roles, branches }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        branch_id: '',
        phone: '',
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
        post(route('staff.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-black text-white">Nuevo Miembro de Personal</h2>}
        >
            <Head title="Añadir Personal" />

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
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Contraseña</label>
                                    <input
                                        type="password"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                    />
                                    {errors.password && <div className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.password}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                    />
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
                                    Guardar Miembro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
