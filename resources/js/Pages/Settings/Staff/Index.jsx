import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ auth, staff }) {
    const { delete: destroy } = useForm();

    const roleTranslations = {
        admin: 'Administrador General',
        veterinarian: 'Médico Veterinario',
        receptionist: 'Recepcionista',
        groomer: 'Estilista / Groomer',
        pharmacist: 'Farmacéutico',
        assistant: 'Asistente Médico',
        specialist: 'Especialista Médico',
        surgeon: 'Cirujano Veterinario',
        client: 'Cliente',
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar a este miembro?')) {
            destroy(route('staff.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white">Gestión de Personal</h2>
                    <Link
                        href={route('staff.create')}
                        className="px-6 py-2 bg-brand-secondary text-brand-primary rounded-xl text-xs font-black uppercase hover:bg-brand-secondary/90 transition shadow-lg shadow-brand-secondary/20"
                    >
                        Añadir Miembro
                    </Link>
                </div>
            }
        >
            <Head title="Personal" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-[2rem] border border-gray-100 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                                        <th className="p-6 text-xs font-black uppercase text-gray-400 tracking-widest">Nombre</th>
                                        <th className="p-6 text-xs font-black uppercase text-gray-400 tracking-widest">Rol</th>
                                        <th className="p-6 text-xs font-black uppercase text-gray-400 tracking-widest">Sucursal</th>
                                        <th className="p-6 text-xs font-black uppercase text-gray-400 tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {staff.data.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-xs">
                                                        {member.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white">{member.name}</div>
                                                        <div className="text-xs text-gray-500">{member.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    ['veterinarian', 'surgeon', 'specialist'].includes(member.role) ? 'bg-blue-100 text-blue-700' :
                                                        member.role === 'assistant' ? 'bg-teal-100 text-teal-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {roleTranslations[member.role] || member.role}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {member.branch?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route('staff.edit', member.id)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                    </Link>
                                                    {member.id !== auth.user.id && (
                                                        <button
                                                            onClick={() => handleDelete(member.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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
        </AuthenticatedLayout>
    );
}
