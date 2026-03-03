import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import BehaviorSelector from '@/Components/BehaviorSelector';

export default function Edit({ auth, client }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        emergency_contact_name: client.emergency_contact_name || '',
        emergency_contact_phone: client.emergency_contact_phone || '',
        tax_id: client.tax_id || '',
        crm_notes: client.crm_notes || '',
        behavior_profile: client.behavior_profile || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('clients.update', client.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Editar Cliente: {client.name}</h2>}
        >
            <Head title={`Editar Cliente - ${client.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Datos Personales */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-gray-400 border-b pb-2">Información de Contacto</h3>
                                    <div>
                                        <label className="block text-sm font-medium dark:text-gray-300">Nombre Completo *</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            required
                                        />
                                        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium dark:text-gray-300">Correo Electrónico *</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            required
                                        />
                                        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium dark:text-gray-300">Teléfono Celular</label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                        {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium dark:text-gray-300">Dirección</label>
                                        <textarea
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            rows="2"
                                            className="mt-1 block w-full rounded-md border-gray-300 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        ></textarea>
                                        {errors.address && <div className="text-red-500 text-xs mt-1">{errors.address}</div>}
                                    </div>
                                </div>

                                {/* Seguridad y CRM */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-gray-400 border-b pb-2">Urgencias y CRM</h3>
                                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-red-700 dark:text-red-400">Contacto de Emergencia</label>
                                            <input
                                                type="text"
                                                value={data.emergency_contact_name}
                                                onChange={e => setData('emergency_contact_name', e.target.value)}
                                                placeholder="Nombre"
                                                className="mt-1 block w-full rounded-md border-gray-200 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-800 dark:border-gray-700 text-sm dark:text-white"
                                            />
                                            {errors.emergency_contact_name && <div className="text-red-500 text-xs mt-1">{errors.emergency_contact_name}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-red-700 dark:text-red-400">Teléfono Emergencia</label>
                                            <input
                                                type="text"
                                                value={data.emergency_contact_phone}
                                                onChange={e => setData('emergency_contact_phone', e.target.value)}
                                                placeholder="Teléfono"
                                                className="mt-1 block w-full rounded-md border-gray-200 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-800 dark:border-gray-700 text-sm dark:text-white"
                                            />
                                            {errors.emergency_contact_phone && <div className="text-red-500 text-xs mt-1">{errors.emergency_contact_phone}</div>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium dark:text-gray-300">RFC / Tax ID</label>
                                        <input
                                            type="text"
                                            value={data.tax_id}
                                            onChange={e => setData('tax_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 uppercase dark:text-white"
                                        />
                                        {errors.tax_id && <div className="text-red-500 text-xs mt-1">{errors.tax_id}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 italic">Notas Internas (CRM)</label>
                                        <textarea
                                            value={data.crm_notes}
                                            onChange={e => setData('crm_notes', e.target.value)}
                                            rows="3"
                                            className="mt-1 block w-full rounded-md border-gray-300 focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 text-sm dark:text-white"
                                        ></textarea>
                                        {errors.crm_notes && <div className="text-red-500 text-xs mt-1">{errors.crm_notes}</div>}
                                    </div>
                                    <div className="mt-4">
                                        <BehaviorSelector
                                            value={data.behavior_profile}
                                            onChange={(val) => setData('behavior_profile', val)}
                                        />
                                        {errors.behavior_profile && <div className="text-red-500 text-xs mt-1">{errors.behavior_profile}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end space-x-4 border-t pt-6 text-gray-900 dark:text-gray-100 dark:border-gray-700">
                                <Link
                                    href={route('clients.show', client.id)}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-2 bg-brand-primary text-white rounded-xl font-black hover:bg-brand-primary/90 transition shadow-xl shadow-brand-primary/20"
                                >
                                    Actualizar Cliente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
