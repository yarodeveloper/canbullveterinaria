import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

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

    const addReasonTag = (tag) => {
        const separator = data.reason && !data.reason.endsWith(' ') ? ', ' : '';
        setData('reason', data.reason + separator + tag);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Iniciar Internamiento" />

            <div className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-[#111822] flex items-center justify-center py-12 px-4 transition-colors">
                <div className="w-full max-w-2xl bg-white dark:bg-[#1B2132] rounded-[1.5rem] shadow-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden font-sans">

                    {/* Header */}
                    <div className="px-8 py-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded flex items-center justify-center bg-fuchsia-900/40 text-fuchsia-500 font-bold leading-none select-none text-lg">
                                +
                            </div>
                            <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">
                                Iniciar Internamiento
                            </h2>
                            {pet && (
                                <span className="text-slate-400 font-semibold text-sm md:text-base hidden sm:inline ml-2">
                                    <span className="text-slate-300 dark:text-slate-500">{pet.name}</span> <span className="text-slate-400 dark:text-slate-600">({pet.breed})</span>
                                </span>
                            )}
                        </div>
                        <Link href={route('pets.show', pet?.id || '')} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition group focus:outline-none">
                            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </Link>
                    </div>

                    <form onSubmit={submit} className="p-8 space-y-7">

                        {/* Row 1: Peso & Fecha */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                    Peso (KG)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-slate-50 dark:bg-[#111822] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white px-5 py-3.5 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all font-semibold"
                                        placeholder="00.00"
                                        value={data.initial_weight}
                                        onChange={(e) => setData('initial_weight', e.target.value)}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                        kg
                                    </span>
                                </div>
                                {errors.initial_weight && <p className="text-red-500 dark:text-red-400 text-xs font-bold mt-2">{errors.initial_weight}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                    Fecha y Hora
                                </label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-slate-50 dark:bg-[#111822] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white px-5 py-3.5 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all font-semibold [color-scheme:light] dark:[color-scheme:dark] block"
                                    value={data.admission_date}
                                    onChange={(e) => setData('admission_date', e.target.value)}
                                    required
                                />
                                {errors.admission_date && <p className="text-red-500 dark:text-red-400 text-xs font-bold mt-2">{errors.admission_date}</p>}
                            </div>
                        </div>

                        {/* Row 2: Motivo & Tags */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                Motivo del Internamiento
                            </label>
                            <textarea
                                className="w-full bg-slate-50 dark:bg-[#111822] border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white px-5 py-4 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all text-sm min-h-[110px] mb-4 font-medium resize-y"
                                placeholder="Describa el motivo..."
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                required
                            ></textarea>
                            {errors.reason && <p className="text-red-500 dark:text-red-400 text-xs font-bold mt-1 mb-4">{errors.reason}</p>}

                            <div className="flex flex-wrap gap-2.5">
                                {['Cirugía', 'Monitoreo', 'Tratamiento IV', 'Observación'].map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => addReasonTag(tag)}
                                        className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white transition-colors font-bold text-xs"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-end mt-10 gap-6 pt-4">
                            <Link
                                href={route('pets.show', pet?.id || '')}
                                className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#9c339c] hover:bg-[#832683] text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-50 focus:ring-4 focus:ring-[#9c339c]/30"
                            >
                                Confirmar Ingreso
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
