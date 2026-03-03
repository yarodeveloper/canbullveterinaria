import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { IconEye, IconEdit, IconPlus } from '@/Components/Icons';
import { BehaviorBadge } from '@/Components/BehaviorSelector';

export default function Index({ auth, clients }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Clientes / Dueños</h2>}
        >
            <Head title="Clientes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg text-gray-900 dark:text-gray-100">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium">Directorio de Clientes</h3>
                                <Link
                                    href={route('clients.create')}
                                    className="inline-flex items-center px-6 py-2 bg-brand-primary text-white rounded-xl font-black text-xs uppercase hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 shadow-lg shadow-brand-primary/20 transition ease-in-out duration-150"
                                >
                                    + Nuevo Cliente
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mascotas</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Actividad</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {clients.data.map((client) => (
                                            <tr key={client.id} className="group hover:bg-brand-primary transition-colors cursor-pointer">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 bg-brand-secondary group-hover:bg-white/20 rounded-full flex items-center justify-center text-brand-primary group-hover:text-white font-black text-xs uppercase border border-brand-primary/10 group-hover:border-white/50 transition-colors">
                                                            {client.name.substring(0, 2)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold flex items-center gap-2 group-hover:text-white transition-colors text-gray-900 dark:text-gray-100">
                                                                {client.name}
                                                                {client.behavior_profile && <BehaviorBadge behaviorId={client.behavior_profile} showLabel={false} className="scale-75" />}
                                                            </div>
                                                            <div className="text-xs text-gray-500 group-hover:text-white/80 transition-colors">{client.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm group-hover:text-white transition-colors">
                                                    <p>{client.phone || 'No phone'}</p>
                                                    <p className="text-xs text-gray-500 group-hover:text-white/80 transition-colors truncate w-32">{client.address || 'No address'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-green-100 group-hover:bg-white/20 text-green-700 group-hover:text-white text-xs rounded-full font-bold transition-colors">
                                                        {client.pets_count} Pacientes
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500 group-hover:text-white/80 transition-colors">
                                                    {client.updated_at ? new Date(client.updated_at).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                                    <Link
                                                        href={route('clients.show', client.id)}
                                                        className="inline-flex items-center p-2 bg-brand-secondary text-brand-primary rounded-lg hover:bg-brand-secondary/80 transition shadow-sm border border-brand-primary/10"
                                                        title="Vista 360 (Perfil)"
                                                    >
                                                        <IconEye className="w-5 h-5" />
                                                    </Link>
                                                    <Link
                                                        href={route('clients.edit', client.id)}
                                                        className="inline-flex items-center p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition shadow-sm border border-amber-100"
                                                        title="Editar Cliente"
                                                    >
                                                        <IconEdit className="w-5 h-5" />
                                                    </Link>
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
        </AuthenticatedLayout>
    );
}
