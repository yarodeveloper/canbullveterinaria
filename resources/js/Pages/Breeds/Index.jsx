import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconEdit, IconTrash, IconPlus } from '@/Components/Icons';

export default function Index({ auth, breeds }) {
    const { delete: destroy } = useForm();

    const deleteBreed = (id) => {
        if (confirm('¿Estás seguro de eliminar esta raza del catálogo?')) {
            destroy(route('breeds.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight uppercase tracking-tight">Catálogo de Razas</h2>
                    <Link
                        href={route('breeds.create')}
                        className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20 flex items-center gap-2"
                    >
                        <IconPlus className="w-3.5 h-3.5" />
                        Agregar Raza
                    </Link>
                </div>
            }
        >
            <Head title="Catálogo de Razas" />

            <div className="py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#1B2132] overflow-hidden shadow-sm sm:rounded-[2rem] border dark:border-gray-700">
                        <div className="p-4 sm:p-6 text-gray-900 dark:text-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-y-1">
                                    <thead>
                                        <tr className="uppercase text-[10px] text-slate-400 font-black tracking-[0.2em] bg-slate-50/50 dark:bg-gray-900/50">
                                            <th className="px-5 py-3 rounded-l-xl">Especie</th>
                                            <th className="px-5 py-3">Raza</th>
                                            <th className="px-5 py-3 text-center">Tamaño</th>
                                            <th className="px-5 py-3 text-center">Peso Adulto</th>
                                            <th className="px-5 py-3 text-right rounded-r-xl">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="">
                                        {breeds.data.map((breed) => (
                                            <tr key={breed.id} className="group hover:bg-brand-primary transition-all duration-150 shadow-sm hover:shadow-md">
                                                <td className="px-5 py-2.5 rounded-l-xl">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border tracking-tighter ${breed.species === 'Canino' ? 'bg-blue-50 text-blue-600 border-blue-200 group-hover:bg-white group-hover:text-blue-600' : 'bg-pink-50 text-pink-600 border-pink-200 group-hover:bg-white group-hover:text-pink-600'}`}>
                                                        {breed.species}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-2.5 font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-white uppercase tracking-tight">{breed.name}</td>
                                                <td className="px-5 py-2.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-white/80">{breed.size}</td>
                                                <td className="px-5 py-2.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-white/80">{breed.adult_weight}</td>
                                                <td className="px-5 py-2.5 text-right rounded-r-xl">
                                                    <div className="flex justify-end gap-1">
                                                        <Link
                                                            href={route('breeds.edit', breed.id)}
                                                            className="p-1.5 text-brand-primary dark:text-brand-primary/80 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-100 dark:border-gray-700 hover:scale-110 transition group-hover:bg-white group-hover:text-brand-primary"
                                                            title="Editar"
                                                        >
                                                            <IconEdit className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteBreed(breed.id)}
                                                            className="p-1.5 text-red-500 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-100 dark:border-gray-700 hover:scale-110 transition group-hover:bg-white group-hover:text-red-600 font-bold"
                                                            title="Eliminar"
                                                        >
                                                            <IconTrash className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-8 flex justify-center gap-2">
                                {breeds.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 min-w-[32px] text-center text-[10px] font-black uppercase rounded-lg border transition-all ${!link.url ? 'opacity-30 cursor-not-allowed' : ''} ${link.active 
                                            ? 'bg-brand-primary border-brand-primary text-white shadow-lg' 
                                            : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
