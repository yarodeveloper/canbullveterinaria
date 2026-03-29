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
            <div className="py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-[2rem] border dark:border-gray-700">
                        <div className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest hidden sm:block">Directorio de Clientes</h3>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                                    <div className="relative w-full sm:w-72 group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Buscar cliente, email, teléfono..."
                                            className="block w-full pl-11 pr-4 py-2 border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-brand-primary sm:text-xs font-bold transition-all text-gray-900 dark:text-gray-100 placeholder-slate-400 shadow-sm"
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
                                    <ul className="divide-y divide-slate-100 dark:divide-gray-700/50">
                                        {clients.data.map((client) => (
                                            <li key={client.id} className="group hover:bg-brand-primary transition-all duration-200">
                                                <Link href={route('clients.show', client.id)} className="block px-6 py-2.5 text-gray-900 dark:text-gray-100">
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                        {/* Info del Cliente */}
                                                        <div className="flex items-center min-w-0 gap-4 flex-1 relative w-full sm:w-auto">
                                                            <div className="flex-shrink-0 w-10 h-10 bg-brand-secondary/50 group-hover:bg-white/20 rounded-full flex items-center justify-center text-brand-primary group-hover:text-white font-black text-xs uppercase transition-colors group-hover:scale-110 shadow-inner">
                                                                {client.name.substring(0, 2)}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-black text-gray-900 dark:text-gray-100 group-hover:text-white truncate uppercase tracking-tight">
                                                                        {client.name}
                                                                    </p>
                                                                    {client.behavior_profile && (
                                                                        <div className="scale-[0.6] origin-left">
                                                                            <BehaviorBadge behaviorId={client.behavior_profile} showLabel={false} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 group-hover:text-white/80 font-bold uppercase tracking-widest truncate">
                                                                    <span>{client.phone || 'Sin Teléfono'}</span>
                                                                    <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 group-hover:bg-white/30 rounded-full"></span>
                                                                    <span>{client.email || 'Sin Email'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Mascotas e Info extra */}
                                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                            <div className="text-left sm:text-right">
                                                                <p className="text-[9px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5">Pacientes</p>
                                                                <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 group-hover:bg-white/20 text-green-700 group-hover:text-white text-[10px] rounded-md font-black transition-colors">
                                                                    🐾 {client.pets_count}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="text-right hidden sm:block w-32">
                                                                <p className="text-[9px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-widest mb-0.5">Dirección / Notas</p>
                                                                <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-white truncate">
                                                                    {client.address || '-'}
                                                                </p>
                                                            </div>

                                                            <div className="hidden md:flex flex-shrink-0">
                                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 border-slate-100 dark:border-gray-700 group-hover:border-white group-hover:bg-white/20 group-hover:text-white text-gray-300 transition-colors">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
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
