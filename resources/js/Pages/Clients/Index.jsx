import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { IconEye, IconEdit, IconPlus } from '@/Components/Icons';
import { BehaviorBadge } from '@/Components/BehaviorSelector';
import { useState, useEffect } from 'react';

export default function Index({ auth, clients, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    useEffect(() => {
        const delayBounceFn = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                router.get(
                    route('clients.index'),
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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Clientes / Dueños</h2>}
        >
            <Head title="Clientes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg text-gray-900 dark:text-gray-100">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                <h3 className="text-lg font-medium hidden sm:block">Directorio de Clientes</h3>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                                    <div className="relative w-full sm:w-64">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Buscar cliente, email, teléfono..."
                                            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-full shadow-inner bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary sm:text-sm font-bold transition-all text-gray-900 dark:text-gray-100"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Link
                                        href={route('clients.create')}
                                        className="inline-flex items-center justify-center px-6 py-2 bg-brand-primary text-white rounded-xl font-black text-xs uppercase hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 shadow-lg shadow-brand-primary/20 transition ease-in-out duration-150 w-full sm:w-auto"
                                    >
                                        + Nuevo Cliente
                                    </Link>
                                </div>
                            </div>

                            <div className="p-0">
                                {clients.data.length > 0 ? (
                                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {clients.data.map((client) => (
                                            <li key={client.id} className="group hover:bg-brand-primary transition-all duration-200">
                                                <Link href={route('clients.show', client.id)} className="block px-6 py-5">
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                        {/* Info del Cliente */}
                                                        <div className="flex items-center min-w-0 gap-5 flex-1 relative w-full sm:w-auto">
                                                            <div className="flex-shrink-0 w-12 h-12 bg-brand-secondary/50 group-hover:bg-white/20 rounded-full flex items-center justify-center text-brand-primary group-hover:text-white font-black text-sm uppercase transition-colors group-hover:scale-110">
                                                                {client.name.substring(0, 2)}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-3">
                                                                    <p className="text-base font-black text-gray-900 dark:text-gray-100 group-hover:text-white truncate">
                                                                        {client.name}
                                                                    </p>
                                                                    {client.behavior_profile && (
                                                                        <div className="scale-75 origin-left">
                                                                            <BehaviorBadge behaviorId={client.behavior_profile} showLabel={false} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 group-hover:text-white/80 font-bold uppercase tracking-wide truncate">
                                                                    <span>{client.phone || 'Sin Teléfono'}</span>
                                                                    <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 group-hover:bg-white/30 rounded-full"></span>
                                                                    <span>{client.email || 'Sin Email'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Mascotas e Info extra */}
                                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                            <div className="text-left sm:text-right">
                                                                <p className="text-[10px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5">Pacientes</p>
                                                                <span className="inline-flex items-center px-2 py-0.5 bg-green-100 group-hover:bg-white/20 text-green-700 group-hover:text-white text-xs rounded-full font-bold transition-colors">
                                                                    🐾 {client.pets_count}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="text-right hidden sm:block w-32">
                                                                <p className="text-[10px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5">Dirección / Notas</p>
                                                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-white truncate">
                                                                    {client.address || '-'}
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
                                        <div className="text-6xl mb-6 opacity-20 transform hover:scale-110 transition-transform">👥</div>
                                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest mb-2">
                                            {searchTerm ? 'No se encontraron clientes' : 'Aún no hay clientes'}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-8">
                                            {searchTerm ? 'Intenta usar otros términos de búsqueda.' : 'Registra el primer cliente en el sistema.'}
                                        </p>
                                        {!searchTerm && (
                                            <Link
                                                href={route('clients.create')}
                                                className="inline-block bg-brand-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20"
                                            >
                                                + Registrar Cliente
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
