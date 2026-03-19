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

                            <div className="p-0">
                                {pets.data.length > 0 ? (
                                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {pets.data.map((pet) => (
                                            <li key={pet.id} className="group hover:bg-brand-primary transition-all duration-200">
                                                <Link href={route('pets.show', pet.id)} className="block px-6 py-5">
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                        {/* Paciente */}
                                                        <div className="flex items-center min-w-0 gap-5 flex-1 relative w-full sm:w-auto">
                                                            <div className="relative flex-shrink-0 group-hover:scale-110 transition-transform">
                                                                <PetAvatar pet={pet} className={`h-12 w-12 border-2 border-transparent group-hover:border-white/50 rounded-full ${pet.status === 'deceased' ? 'grayscale opacity-70' : ''}`} />
                                                                {pet.status === 'deceased' && (
                                                                    <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1 border border-white" title="Fallecido">✞</span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-3">
                                                                    <p className="text-base font-black text-gray-900 dark:text-gray-100 group-hover:text-white truncate">
                                                                        {pet.name}
                                                                    </p>
                                                                    {pet.status === 'deceased' && (
                                                                        <span className="text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-tighter group-hover:bg-white group-hover:text-red-600 border border-red-200">
                                                                            Fallecido
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 group-hover:text-white/80 font-bold uppercase tracking-wide truncate">
                                                                    <span>{pet.species} • {pet.breed || 'Sin raza'}</span>
                                                                    <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 group-hover:bg-white/30 rounded-full"></span>
                                                                    <span>{pet.gender === 'male' ? 'Macho' : pet.gender === 'female' ? 'Hembra' : 'Desc.'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Dueño y Peso */}
                                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                            <div className="text-left sm:text-right">
                                                                <p className="text-[10px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5">🐾 Propietario</p>
                                                                <div className="flex items-center gap-2 justify-start sm:justify-end">
                                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-white truncate max-w-[120px]">
                                                                        {pet.owner.name}
                                                                    </span>
                                                                    {pet.owner.phone && (
                                                                        <div className="flex gap-1">
                                                                            <a
                                                                                href={`tel:${pet.owner.phone}`}
                                                                                onClick={e => e.stopPropagation()}
                                                                                title="Llamar"
                                                                                className="h-5 w-5 inline-flex items-center justify-center bg-blue-100 group-hover:bg-white group-hover:text-brand-primary text-blue-600 rounded-full hover:scale-110 transition"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                                </svg>
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="text-right hidden sm:block w-16">
                                                                <p className="text-[10px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5">Peso</p>
                                                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-white">
                                                                    {pet.weight ? `${pet.weight} kg` : '-'}
                                                                </p>
                                                            </div>

                                                            <div className="hidden md:flex flex-shrink-0">
                                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 group-hover:border-white group-hover:bg-white/20 group-hover:text-white text-gray-300 transition-colors">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-20 px-6">
                                        <div className="text-6xl mb-6 opacity-20 transform hover:scale-110 transition-transform">🐾</div>
                                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest mb-2">
                                            {searchTerm ? 'No se encontraron mascotas' : 'Aún no hay pacientes'}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-8">
                                            {searchTerm ? 'Intenta usar otros términos de búsqueda.' : 'Registra la primera mascota en el sistema.'}
                                        </p>
                                        {!searchTerm && (
                                            <Link
                                                href={route('pets.create')}
                                                className="inline-block bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20"
                                            >
                                                + Registrar Mascota
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
