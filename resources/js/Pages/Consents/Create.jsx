import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function Create({ auth, pet, type, defaultContent }) {
    const sigPad = useRef({});
    const [isSigned, setIsSigned] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        type: type,
        content: defaultContent,
        digital_signature: '',
        signed_by_name: pet.owner.name,
        signed_by_id_number: '',
    });

    const clear = () => {
        sigPad.current.clear();
        setIsSigned(false);
        setData('digital_signature', '');
    };

    const save = () => {
        if (sigPad.current.isEmpty()) return;

        const sigData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
        setData('digital_signature', sigData);
        setIsSigned(true);
    };

    const submit = (e) => {
        e.preventDefault();

        if (sigPad.current.isEmpty()) {
            alert('Por favor, capture la firma del cliente.');
            return;
        }

        // Auto-save signature if not explicitly saved
        const sigData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
        data.digital_signature = sigData;

        post(route('consents.store', pet.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Consentimiento Legal: {pet.name}</h2>}
        >
            <Head title="Firmar Consentimiento" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">

                            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-6">
                                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                    <strong>Atención:</strong> Este es un documento legal. Asegúrese de que el cliente lea el contenido antes de firmar.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Contenido del Consentimiento ({type})</label>
                                <textarea
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    rows="8"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 text-sm"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Firmante (Dueño)</label>
                                    <input
                                        type="text"
                                        value={data.signed_by_name}
                                        onChange={e => setData('signed_by_name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Identificación (INE/Pasaporte)</label>
                                    <input
                                        type="text"
                                        value={data.signed_by_id_number}
                                        onChange={e => setData('signed_by_id_number', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase text-center md:text-left">Firma del Cliente (Capture en el recuadro)</label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-hidden">
                                    <SignatureCanvas
                                        ref={sigPad}
                                        penColor='black'
                                        canvasProps={{
                                            className: 'signature-canvas w-full h-48 cursor-crosshair',
                                            style: { width: '100%', height: '200px' }
                                        }}
                                        onEnd={() => setIsSigned(true)}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 italic">
                                        {isSigned ? '✓ Firma capturada' : 'Esperando firma...'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={clear}
                                        className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 px-3 py-1 rounded transition"
                                    >
                                        Limpiar Firma
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end space-x-4 border-t dark:border-gray-700 pt-6">
                                <Link
                                    href={route('pets.show', pet.id)}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 underline"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition shadow-lg"
                                >
                                    Guardar y Finalizar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
