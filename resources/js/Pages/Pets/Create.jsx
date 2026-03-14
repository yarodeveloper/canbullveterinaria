import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import PetRegistrationForm from '@/Components/PetRegistrationForm';

export default function Create({ auth, clients }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Registrar Nueva Mascota</h2>}
        >
            <Head title="Registrar Mascota" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-2xl sm:rounded-[2.5rem]">
                        <PetRegistrationForm 
                            initialClients={clients} 
                            onCancel={() => router.visit(route('pets.index'))}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
