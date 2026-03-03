import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, consent }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center print:hidden">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Consentimiento: {consent.type.toUpperCase()}
                    </h2>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md font-bold text-xs uppercase hover:bg-indigo-700 transition"
                    >
                        Imprimir Formato
                    </button>
                </div>
            }
        >
            <Head title={`Consentimiento - ${consent.pet.name}`} />

            <div className="py-12 print:py-0">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-8 border dark:border-gray-700 print:shadow-none print:border-none">

                        {/* Membrete para impresion */}
                        <div className="hidden print:block mb-8 text-center border-b pb-4">
                            <h1 className="text-2xl font-bold uppercase">CanBull Veterinary System</h1>
                            <p className="text-sm">Sucursal: {consent.pet.branch_id} - Fecha: {new Date(consent.signed_at).toLocaleDateString()}</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-4 uppercase border-b pb-2">Documento de Consentimiento</h3>
                            <p className="text-sm dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {consent.content}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 items-start mt-12">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-gray-500">Datos del Paciente</h4>
                                <p className="text-sm font-bold">{consent.pet.name}</p>
                                <p className="text-xs text-gray-500">{consent.pet.species} - {consent.pet.breed}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-gray-500">Datos del Dueño</h4>
                                <p className="text-sm font-bold">{consent.signed_by_name}</p>
                                <p className="text-xs text-gray-500">ID: {consent.signed_by_id_number || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="mt-16 flex flex-col items-center">
                            <div className="border-b-2 border-gray-900 dark:border-gray-100 w-64 h-32 flex items-center justify-center mb-2">
                                <img
                                    src={consent.digital_signature}
                                    alt="Firma Digital"
                                    className="max-h-full max-w-full"
                                />
                            </div>
                            <p className="text-xs font-bold uppercase">Firma del Responsable</p>
                            <p className="text-[10px] text-gray-400 mt-2">Firmado digitalmente el {new Date(consent.signed_at).toLocaleString()}</p>
                        </div>

                        <div className="mt-12 hidden print:block text-[10px] text-gray-400 text-center">
                            Este documento es una copia fiel del original firmado digitalmente en el sistema CanBull.
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
