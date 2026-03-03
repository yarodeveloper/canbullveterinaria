import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Edit({ auth, breed }) {
    const { data, setData, put, processing, errors } = useForm({
        species: breed.species,
        name: breed.name,
        size: breed.size,
        adult_weight: breed.adult_weight,
        notes: breed.notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('breeds.update', breed.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Editar Raza</h2>}
        >
            <Head title="Editar Raza" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Especie *</label>
                                    <select
                                        value={data.species}
                                        onChange={e => setData('species', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                        required
                                    >
                                        <option value="Canino">Canino</option>
                                        <option value="Felino">Felino</option>
                                        <option value="Ave">Ave</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                    {errors.species && <div className="text-red-500 text-xs mt-1">{errors.species}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Raza *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                        required
                                    />
                                    {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tamaño</label>
                                    <select
                                        value={data.size}
                                        onChange={e => setData('size', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                    >
                                        <option value="Pequeño">Pequeño</option>
                                        <option value="Mediano">Mediano</option>
                                        <option value="Grande">Grande</option>
                                        <option value="Gigante">Gigante</option>
                                    </select>
                                    {errors.size && <div className="text-red-500 text-xs mt-1">{errors.size}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso Adulto Aprox.</label>
                                    <input
                                        type="text"
                                        value={data.adult_weight}
                                        onChange={e => setData('adult_weight', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                    />
                                    {errors.adult_weight && <div className="text-red-500 text-xs mt-1">{errors.adult_weight}</div>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notas Rápidas (Personalidad/Cuidados)</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                ></textarea>
                                {errors.notes && <div className="text-red-500 text-xs mt-1">{errors.notes}</div>}
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('breeds.index')}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 underline"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
