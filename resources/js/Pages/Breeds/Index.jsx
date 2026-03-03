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
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Catálogo de Razas</h2>
                    <Link
                        href={route('breeds.create')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition"
                    >
                        <IconPlus className="w-4 h-4" />
                        Agregar Raza
                    </Link>
                </div>
            }
        >
            <Head title="Catálogo de Razas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b dark:border-gray-700 uppercase text-xs text-gray-500 tracking-wider">
                                            <th className="px-4 py-3">Especie</th>
                                            <th className="px-4 py-3">Raza</th>
                                            <th className="px-4 py-3">Tamaño</th>
                                            <th className="px-4 py-3">Peso Adulto</th>
                                            <th className="px-4 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {breeds.data.map((breed) => (
                                            <tr key={breed.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${breed.species === 'Canino' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                                        {breed.species}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 font-medium">{breed.name}</td>
                                                <td className="px-4 py-4">{breed.size}</td>
                                                <td className="px-4 py-4">{breed.adult_weight}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route('breeds.edit', breed.id)}
                                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                                            title="Editar"
                                                        >
                                                            <IconEdit className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteBreed(breed.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Eliminar"
                                                        >
                                                            <IconTrash className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-6 flex justify-center">
                                {breeds.links.map((link, i) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={i}
                                                className="px-3 py-1 mx-1 rounded border opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 mx-1 rounded border ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
