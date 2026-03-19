import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Edit({ auth, role, permissionGroups }) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions || [],
    });

    const isSystemRole = ['admin', 'client'].includes(role.name);
    const isAdmin = role.name === 'admin';

    const permissionTranslations = {
        'manage pets': 'Administrar Mascotas',
        'view pets': 'Ver Mascotas',
        'manage clients': 'Administrar Clientes',
        'manage appointments': 'Administrar Citas',
        'manage medical records': 'Administrar Historial Clínico',
        'view medical records': 'Ver Historial Clínico',
        'manage hospitalizations': 'Administrar Hospitalizaciones',
        'view hospitalizations': 'Ver Hospitalizaciones',
        'manage surgeries': 'Administrar Cirugías',
        'view surgeries': 'Ver Cirugías',
        'manage euthanasias': 'Administrar Eutanasias',
        'view euthanasias': 'Ver Eutanasias',
        'manage inventory': 'Administrar Inventario y Almacenes',
        'manage returns': 'Administrar Devoluciones',
        'manage finances': 'Control Financiero Completo',
        'view reports': 'Ver Reportes Financieros',
        'manage cash register': 'Manejo de Caja (Apertura/Cierre)',
        'manage withdrawals': 'Administrar Retiros (Egresos)',
        'manage settings': 'Configuración del Sistema',
        'view dashboard': 'Ver Dashboard',
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('roles.update', role.id));
    };

    const handleCheckboxChange = (e) => {
        if (isAdmin) return; // Admin always has all permissions
        
        const { value, checked } = e.target;
        if (checked) {
            setData('permissions', [...data.permissions, value]);
        } else {
            setData('permissions', data.permissions.filter((p) => p !== value));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-black text-gray-800 dark:text-gray-200">Editar Rol: <span className="text-brand-primary capitalize">{role.name}</span></h2>}
        >
            <Head title={`Editar Rol - ${role.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-[2rem] p-8 border border-gray-100 dark:border-gray-700">
                        <form onSubmit={submit} className="space-y-8">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Nombre del Rol</label>
                                <input
                                    type="text"
                                    className={`w-full md:w-1/2 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary ${
                                        isSystemRole 
                                        ? 'bg-gray-100 dark:bg-gray-900 text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-800' 
                                        : 'bg-gray-50 dark:bg-gray-900 border-none'
                                    }`}
                                    value={data.name}
                                    onChange={e => !isSystemRole && setData('name', e.target.value)}
                                    disabled={isSystemRole}
                                />
                                {isSystemRole && (
                                    <p className="text-[10px] text-gray-400 mt-2 italic">* El nombre de este rol del sistema no se puede cambiar.</p>
                                )}
                                {errors.name && <div className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.name}</div>}
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-black text-gray-800 dark:text-gray-200 mb-6 font-headings">
                                    Asignación de Permisos
                                    {isAdmin && <span className="ml-3 text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-tighter align-middle">El Administrador tiene todos los accesos</span>}
                                </h3>
                                
                                {errors.permissions && <div className="text-red-500 text-[10px] font-bold mt-1 mb-4 uppercase">{errors.permissions}</div>}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.keys(permissionGroups).map((groupName) => (
                                        <div key={groupName} className={`p-5 rounded-2xl border ${isAdmin ? 'bg-gray-100 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/30 opacity-70' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700/50'}`}>
                                            <h4 className="text-brand-primary font-black uppercase tracking-widest text-xs mb-4">
                                                {groupName}
                                            </h4>
                                            <div className="space-y-3">
                                                {permissionGroups[groupName].map((permission) => (
                                                    <label key={permission} className={`flex items-start gap-3 ${isAdmin ? 'cursor-not-allowed' : 'cursor-pointer group'}`}>
                                                        <input
                                                            type="checkbox"
                                                            value={permission}
                                                            checked={isAdmin || data.permissions.includes(permission)}
                                                            onChange={handleCheckboxChange}
                                                            disabled={isAdmin}
                                                            className={`mt-1 rounded border-gray-300 text-brand-primary focus:ring-brand-primary transition ${isAdmin ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-gray-800 dark:border-gray-600'}`}
                                                        />
                                                        <span className={`text-sm font-medium transition ${isAdmin ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>
                                                            {permissionTranslations[permission] || permission}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <Link
                                    href={route('roles.index')}
                                    className="text-xs font-black uppercase text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                                >
                                    Volver
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 bg-brand-primary text-white rounded-xl text-xs font-black uppercase hover:bg-brand-primary/90 transition shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
