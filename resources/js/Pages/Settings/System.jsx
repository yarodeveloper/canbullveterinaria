import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

export default function System({ auth, settings }) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        settings: settings.map(s => ({
            id: s.id,
            key: s.key,
            value: s.value,
            label: s.label,
            type: s.type,
            group: s.group,
            file: null // Storage for new file uploads
        }))
    });

    const handleValueChange = (index, value) => {
        const newSettings = [...data.settings];
        newSettings[index].value = value;
        setData('settings', newSettings);
    };

    const handleFileChange = (index, file) => {
        const newSettings = [...data.settings];
        newSettings[index].file = file;
        setData('settings', newSettings);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('settings.web.update'), {
            forceFormData: true,
        });
    };

    // Group settings by group
    const rawGroupedSettings = data.settings.reduce((acc, s) => {
        if (!acc[s.group]) acc[s.group] = [];
        acc[s.group].push(s);
        return acc;
    }, {});

    const groupNames = {
        finances: 'Finanzas e Impresión',
        system: 'Configuración del Sistema',
        grooming: 'Gestión de Estética / Spa',
    };

    const orderedGroups = Object.keys(groupNames);
    const groupedSettings = {};
    orderedGroups.forEach(key => {
        if (rawGroupedSettings[key]) groupedSettings[key] = rawGroupedSettings[key];
    });
    Object.keys(rawGroupedSettings).forEach(key => {
        if (!groupedSettings[key]) groupedSettings[key] = rawGroupedSettings[key];
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Configuración Administrativa del Sistema</h2>}
        >
            <Head title="Configuración del Sistema" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-8">
                        {Object.entries(groupedSettings).map(([group, items]) => (
                            <div key={group} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 dark:border-gray-700">
                                <div className="p-6">
                                    <h3 className="text-lg font-bold border-b dark:border-gray-700 pb-2 mb-6 text-brand-primary uppercase tracking-wider flex items-center">
                                        <span className="w-2 h-6 bg-brand-primary mr-3 rounded-full"></span>
                                        {groupNames[group] || group}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {items.map((setting) => {
                                            const globalIndex = data.settings.findIndex(s => s.id === setting.id);
                                            return (
                                                <div key={setting.id} className={setting.type === 'textarea' ? 'md:col-span-2' : ''}>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        {setting.label}
                                                    </label>
                                                    {setting.type === 'textarea' ? (
                                                        <textarea
                                                            value={setting.value || ''}
                                                            onChange={e => handleValueChange(globalIndex, e.target.value)}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                                                            rows="3"
                                                        ></textarea>
                                                    ) : setting.type === 'color' ? (
                                                        <div className="flex items-center space-x-3">
                                                            <input
                                                                type="color"
                                                                value={setting.value || '#000000'}
                                                                onChange={e => handleValueChange(globalIndex, e.target.value)}
                                                                className="h-10 w-20 rounded cursor-pointer border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={setting.value || ''}
                                                                onChange={e => handleValueChange(globalIndex, e.target.value)}
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                                                                placeholder="#000000"
                                                            />
                                                        </div>
                                                    ) : setting.type === 'image' ? (
                                                        <div className="mt-2 space-y-2">
                                                            <div className="flex items-center space-x-4">
                                                                {setting.value && (
                                                                    <img
                                                                        src={setting.value}
                                                                        alt={setting.label}
                                                                        className="h-16 w-16 object-contain border dark:border-gray-700 rounded bg-gray-50"
                                                                    />
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    onChange={e => handleFileChange(globalIndex, e.target.files[0])}
                                                                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-opacity-90"
                                                                />
                                                            </div>
                                                            {setting.file && (
                                                                <p className="text-[10px] text-brand-primary font-bold">Archivo seleccionado: {setting.file.name}</p>
                                                            )}
                                                            <input
                                                                type="text"
                                                                value={setting.value || ''}
                                                                onChange={e => handleValueChange(globalIndex, e.target.value)}
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 text-xs"
                                                            placeholder="O ingresa una URL externa"
                                                            />
                                                        </div>
                                                    ) : setting.key === 'system_theme' ? (
                                                        <select
                                                            value={setting.value || 'light'}
                                                            onChange={e => handleValueChange(globalIndex, e.target.value)}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                                                        >
                                                            <option value="light">Claro (Predeterminado)</option>
                                                            <option value="dark">Oscuro</option>
                                                            <option value="auto">Automático (Sistema)</option>
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={setting.value || ''}
                                                            onChange={e => handleValueChange(globalIndex, e.target.value)}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                                                        />
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-1 italic">Clave: {setting.key}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex items-center justify-end gap-4 sticky bottom-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-4 rounded-xl shadow-xl z-10 border border-gray-200 dark:border-gray-700">
                            {recentlySuccessful && (
                                <p className="text-sm text-green-600 font-medium">Cambios guardados con éxito.</p>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-8 py-3 bg-brand-primary text-white rounded-lg font-bold hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-brand-primary/30 disabled:opacity-50 transition-all transform active:scale-95 shadow-lg shadow-brand-primary/20"
                            >
                                {processing ? 'Guardando...' : 'Guardar Todos los Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
