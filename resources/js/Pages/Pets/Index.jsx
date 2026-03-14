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
                                                        <div className="relative">
                                                            <PetAvatar pet={pet} className={`h-10 w-10 flex-shrink-0 border-2 border-transparent group-hover:border-white/50 rounded-full ${pet.status === 'deceased' ? 'grayscale opacity-70' : ''}`} />
                                                            {pet.status === 'deceased' && (
                                                                <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1 border border-white" title="Fallecido">✞</span>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold group-hover:text-white transition-colors flex items-center gap-2">
                                                                {pet.name}
                                                                {pet.status === 'deceased' && (
                                                                    <span className="text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-tighter group-hover:bg-white group-hover:text-red-600 border border-red-200">
                                                                        Fallecido
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 group-hover:text-white/80 transition-colors font-medium">{pet.gender === 'male' ? 'Macho' : pet.gender === 'female' ? 'Hembra' : 'Desconocido'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm group-hover:text-white transition-colors">{pet.species}</div>
                                                    <div className="text-xs text-gray-500 group-hover:text-white/80 transition-colors">{pet.breed || 'Sin raza'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold group-hover:text-white transition-colors">{pet.owner.name}</div>
                                                    {pet.owner.phone && (
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <span className="text-[10px] text-gray-500 group-hover:text-white/70 font-medium">{pet.owner.phone}</span>
                                                            <a
                                                                href={`tel:${pet.owner.phone}`}
                                                                onClick={e => e.stopPropagation()}
                                                                title="Llamar"
                                                                className="h-5 w-5 inline-flex items-center justify-center bg-blue-100 group-hover:bg-blue-200 text-blue-600 rounded-full hover:scale-110 transition"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                </svg>
                                                            </a>
                                                            <a
                                                                href={`https://wa.me/${(pet.owner.phone || '').replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={e => e.stopPropagation()}
                                                                title="WhatsApp"
                                                                className="h-5 w-5 inline-flex items-center justify-center bg-[#25D366]/15 text-[#25D366] rounded-full hover:scale-110 transition"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    )}
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
