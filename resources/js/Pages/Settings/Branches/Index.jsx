import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React from 'react';

export default function Index({ auth, branches }) {
    const deleteBranch = (id) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta sucursal?')) {
            router.delete(route('branches.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Gestión de Sucursales</h2>}
        >
            <Head title="Sucursales" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100 uppercase font-black text-xs tracking-widest border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <span>Lista de Sucursales</span>
                            <Link
                                href={route('branches.create')}
                                className="bg-brand-primary text-white px-4 py-2 rounded-xl hover:bg-brand-secondary transition transform active:scale-95 shadow-lg shadow-primary-500/20"
                            >
                                + Nueva Sucursal
                            </Link>
                        </div>

                        <div className="p-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b dark:border-gray-700">
                                        <th className="py-4 px-2 text-[10px] font-black tracking-widest uppercase text-gray-400">Nombre</th>
                                        <th className="py-4 px-2 text-[10px] font-black tracking-widest uppercase text-gray-400">Contacto</th>
                                        <th className="py-4 px-2 text-[10px] font-black tracking-widest uppercase text-gray-400">Tax ID / RFC</th>
                                        <th className="py-4 px-2 text-[10px] font-black tracking-widest uppercase text-gray-400 text-center">Estado</th>
                                        <th className="py-4 px-2 text-[10px] font-black tracking-widest uppercase text-gray-400 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {branches.data.map((branch) => (
                                        <tr key={branch.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors group">
                                            <td className="py-4 px-2">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-gray-900 dark:text-gray-100 uppercase text-sm tracking-tight">{branch.name}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{branch.address || 'Sin dirección'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <div className="flex flex-col text-xs font-bold text-gray-600 dark:text-gray-400 italic">
                                                    <span>{branch.phone || 'S/T'}</span>
                                                    <span>{branch.email || 'S/E'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className="text-[11px] font-black text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded uppercase">
                                                    {branch.tax_id || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    branch.is_active 
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {branch.is_active ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={route('branches.edit', branch.id)}
                                                        className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition"
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteBranch(branch.id)}
                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition"
                                                        title="Eliminar"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {branches.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-gray-500 dark:text-gray-400 font-bold uppercase text-xs">
                                                No hay sucursales registradas
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
