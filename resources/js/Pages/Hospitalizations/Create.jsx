import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ auth, pet }) {
    const { data, setData, post, processing, errors } = useForm({
        pet_id: pet ? pet.id : '',
        reason: '',
        initial_weight: pet ? pet.weight : '',
        admission_date: new Date().toISOString().slice(0, 16), // datetime-local format
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('hospitalizations.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Nueva Hospitalización</h2>}
        >
            <Head title="Nueva Hospitalización" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-[2rem] p-8 border dark:border-gray-700">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl">🏥</div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Iniciar Internamiento</h3>
                                <p className="text-sm text-gray-500 tracking-tight">Registro de ingreso a hospitalización y cuidados clínicos.</p>
                            </div>
                        </div>

                        {pet && (
                            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-2xl">
                                    {pet.species === 'Canino' ? '🐕' : '🐈'}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Paciente Seleccionado</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{pet.name} <span className="text-gray-500 font-medium">({pet.breed})</span></p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="reason" value="Motivo del Internamiento" className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2" />
                                <textarea
                                    id="reason"
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl focus:ring-2 focus:ring-brand-primary text-sm min-h-[100px]"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Ej: Cirugía programada, Monitoreo post-operatorio, Tratamiento IV..."
                                    required
                                ></textarea>
                                <InputError message={errors.reason} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="initial_weight" value="Peso al Ingreso (kg)" className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2" />
                                    <TextInput
                                        id="initial_weight"
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-900 border-0"
                                        value={data.initial_weight}
                                        onChange={(e) => setData('initial_weight', e.target.value)}
                                    />
                                    <InputError message={errors.initial_weight} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="admission_date" value="Fecha y Hora de Ingreso" className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2" />
                                    <TextInput
                                        id="admission_date"
                                        type="datetime-local"
                                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-900 border-0"
                                        value={data.admission_date}
                                        onChange={(e) => setData('admission_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.admission_date} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex items-center justify-end mt-8 gap-4">
                                <Link
                                    href={route('pets.show', pet?.id || '')}
                                    className="text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition"
                                >
                                    Cancelar
                                </Link>
                                <PrimaryButton disabled={processing} className="bg-brand-primary hover:opacity-90 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
                                    Confirmar Ingreso
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
