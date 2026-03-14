import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PetRegistrationForm from '@/Components/PetRegistrationForm';
import { router } from '@inertiajs/react';

export default function Edit({ auth, pet, clients }) {
    const handleCancel = () => {
        router.visit(route('pets.show', pet.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-xl shadow-inner">
                        🐕
                    </div>
                    <div>
                        <h2 className="font-black text-xl text-slate-800 dark:text-white uppercase tracking-tighter">
                            Editar Mascota
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                            Actualizando la información de {pet.name}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Editar ${pet.name}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#1B2132] overflow-hidden shadow-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                        <PetRegistrationForm 
                            pet={pet}
                            initialClients={clients}
                            onCancel={handleCancel}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
