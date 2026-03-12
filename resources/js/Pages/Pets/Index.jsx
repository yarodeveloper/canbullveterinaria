import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { IconEye, IconEdit, IconPlus } from '@/Components/Icons';
import PetAvatar from '@/Components/PetAvatar';
import { useState, useEffect } from 'react';

export default function Index({ auth, pets, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    useEffect(() => {
        const delayBounceFn = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                router.get(
                    route('pets.index'),
                    { search: searchTerm },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(delayBounceFn);
    }, [searchTerm]);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Mascotas</h2>}
        >
            <Head title="Mascotas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                <h3 className="text-lg font-medium hidden sm:block">Listado de Pacientes</h3>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                                    <div className="relative w-full sm:w-64">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Buscar mascota o dueño..."
                                            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-full shadow-inner bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary sm:text-sm font-bold transition-all text-gray-900 dark:text-gray-100"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Link
                                        href={route('pets.create')}
                                        className="inline-flex items-center justify-center px-6 py-2 bg-brand-primary border border-transparent rounded-xl font-black text-xs text-white uppercase tracking-widest hover:bg-brand-primary/90 focus:bg-brand-primary/90 active:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition ease-in-out duration-150 shadow-lg shadow-brand-primary/20 w-full sm:w-auto"
                                    >
                                        + Registrar Mascota
                                    </Link>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especie / Raza</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dueño</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {pets.data.map((pet) => (
                                            <tr key={pet.id} className="group hover:bg-brand-primary transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <PetAvatar pet={pet} className="h-10 w-10 flex-shrink-0 border-2 border-transparent group-hover:border-white/50 rounded-full" />
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium group-hover:text-white transition-colors">{pet.name}</div>
                                                            <div className="text-xs text-gray-500 group-hover:text-white/80 transition-colors">{pet.gender === 'male' ? 'Macho' : pet.gender === 'female' ? 'Hembra' : 'Desconocido'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm group-hover:text-white transition-colors">{pet.species}</div>
                                                    <div className="text-xs text-gray-500 group-hover:text-white/80 transition-colors">{pet.breed || 'Sin raza'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm group-hover:text-white transition-colors">{pet.owner.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group-hover:text-white/80 transition-colors">
                                                    {pet.weight ? `${pet.weight} kg` : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                                    <Link
                                                        href={route('pets.show', pet.id)}
                                                        className="inline-flex items-center p-2 bg-brand-secondary text-brand-primary rounded-lg hover:bg-brand-secondary/80 transition shadow-sm border border-brand-primary/10"
                                                        title="Ver Expediente"
                                                    >
                                                        <IconEye className="w-5 h-5" />
                                                    </Link>
                                                    <Link
                                                        href={route('pets.edit', pet.id)}
                                                        className="inline-flex items-center p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition shadow-sm border border-amber-100"
                                                        title="Editar Mascota"
                                                    >
                                                        <IconEdit className="w-5 h-5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {pets.data.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                                                    No hay mascotas registradas aún.
                                                </td>
                                            </tr>
                                        )}
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
