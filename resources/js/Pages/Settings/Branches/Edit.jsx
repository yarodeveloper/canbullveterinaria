import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React from 'react';

export default function Edit({ auth, branch }) {
    const { data, setData, put, processing, errors } = useForm({
        name: branch.name || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        tax_id: branch.tax_id || '',
        is_active: branch.is_active || false,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('branches.update', branch.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Configuración de Sucursal</h2>}
        >
            <Head title={`Editar Sucursal: ${branch.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-2xl sm:rounded-[2rem]">
                        <div className="p-8 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-1">Actualizar Información</h3>
                            <p className="text-xs text-gray-500 font-bold italic">Modifica los datos oficiales de esta unidad de negocio.</p>
                        </div>

                        <form onSubmit={submit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Nombre Comercial de Sucursal</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 font-black dark:text-white focus:ring-1 focus:ring-brand-primary transition"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="EJ. CANBULL CENTRO"
                                            required
                                        />
                                        {errors.name && <div className="text-red-500 text-[10px] font-black uppercase mt-1 px-1">{errors.name}</div>}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">RFC / Tax ID</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 font-black dark:text-white focus:ring-1 focus:ring-brand-primary placeholder:opacity-30"
                                            value={data.tax_id}
                                            onChange={e => setData('tax_id', e.target.value)}
                                            placeholder="TAX123456"
                                        />
                                        {errors.tax_id && <div className="text-red-500 text-[10px] font-black uppercase mt-1 px-1">{errors.tax_id}</div>}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Teléfono de Contacto</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 font-black dark:text-white focus:ring-1 focus:ring-brand-primary transition"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            placeholder="55-1234-5678"
                                        />
                                        {errors.phone && <div className="text-red-500 text-[10px] font-black uppercase mt-1 px-1">{errors.phone}</div>}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Email Comercial</label>
                                        <input
                                            type="email"
                                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 font-black dark:text-white focus:ring-1 focus:ring-brand-primary transition"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="sucursal@canbull.com"
                                        />
                                        {errors.email && <div className="text-red-500 text-[10px] font-black uppercase mt-1 px-1">{errors.email}</div>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Dirección Completa</label>
                                <textarea
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 font-black dark:text-white focus:ring-1 focus:ring-brand-primary transition resize-none h-32"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="CALLE, NÚMERO, COLONIA, CP, CIUDAD..."
                                />
                                {errors.address && <div className="text-red-500 text-[10px] font-black uppercase mt-1 px-1">{errors.address}</div>}
                            </div>

                            <div className="flex items-center justify-between p-6 bg-brand-primary/5 rounded-[1.5rem] border border-brand-primary/10">
                                <div>
                                    <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Estado Operativo</h4>
                                    <p className="text-[9px] text-gray-500 font-bold italic">Define si la sucursal puede realizar ventas e inventario.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${data.is_active ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${data.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="pt-8 flex justify-end gap-4 border-t dark:border-gray-700">
                                <Link
                                    href={route('branches.index')}
                                    className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition active:scale-95"
                                >
                                    Regresar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-brand-primary text-white px-12 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-brand-secondary transition transform active:scale-95 shadow-xl shadow-primary-500/20 disabled:grayscale"
                                >
                                    Actualizar Sucursal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
