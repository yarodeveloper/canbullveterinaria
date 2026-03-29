import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

export default function QuickGuide({ auth }) {
    const variables = [
        { 
            tag: '{pet_name}', 
            description: 'Nombre de la mascota', 
            example: 'Luna',
            icon: '🐾'
        },
        { 
            tag: '{pet_sex}', 
            description: 'Sexo de la mascota', 
            example: 'Hembra',
            icon: '⚥'
        },
        { 
            tag: '{pet_age}', 
            description: 'Edad calculada (Años y meses)', 
            example: '3 años y 2 meses',
            icon: '🎂'
        },
        { 
            tag: '{client_name}', 
            description: 'Nombre completo del propietario', 
            example: 'Juan Pérez',
            icon: '👤'
        },
        { 
            tag: '{veterinarian_name}', 
            description: 'Nombre del médico veterinario a cargo', 
            example: 'Dra. Sandra Torres',
            icon: '👨‍⚕️'
        },
        { 
            tag: '{veterinarian_cedula}', 
            description: 'Cédula profesional del médico', 
            example: '1234567',
            icon: '🎓'
        },
        { 
            tag: '{date}', 
            description: 'Fecha actual del sistema', 
            example: '15 de Marzo, 2026',
            icon: '📅'
        },
        { 
            tag: '{time}', 
            description: 'Hora actual del sistema', 
            example: '14:30 Hrs',
            icon: '🕒'
        },
        { 
            tag: '{folio}', 
            description: 'Número de folio único del registro', 
            example: 'HOSP-2026-001',
            icon: '🔢'
        },
        { 
            tag: '{witness_name}', 
            description: 'Espacio para el nombre del testigo', 
            example: 'Roberto Gómez',
            icon: '✍️'
        },
        { 
            tag: '{branch_name}', 
            description: 'Nombre de la sucursal actual', 
            example: 'CanBull Central',
            icon: '🏥'
        },
        { 
            tag: '{branch_phone}', 
            description: 'Teléfono de contacto de la sucursal', 
            example: '555-0123',
            icon: '📞'
        },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Guía de Variables Dinámicas</h2>}
        >
            <Head title="Guía de Plantillas - CanBull" />

            <div className="py-12 bg-slate-50 dark:bg-[#111827]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Link
                        href={route('document-templates.index')}
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-primary transition-colors mb-6 group"
                    >
                        <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                        Volver a Configuración
                    </Link>

                    {/* Header Section */}
                    <div className="bg-white dark:bg-[#1B2132] rounded-[2.5rem] p-8 mb-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700/50 relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary via-brand-primary to-indigo-500"></div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                            Automatiza tus Documentos Legales
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                            Las variables permiten que el sistema rellene los datos por ti. 
                            Solo inserta el código entre llaves y CanBull hará el resto al imprimir.
                        </p>
                    </div>

                    {/* Quick Start Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-brand-primary rounded-[2rem] p-8 text-white shadow-xl shadow-blue-500/20">
                            <h3 className="text-xl font-black mb-4 flex items-center gap-3">
                                <span className="text-3xl">💡</span>  ¿Cómo funciona?
                            </h3>
                            <div className="space-y-4 text-white/90 font-medium leading-relaxed">
                                <p>1. Crea o edita una plantilla de documento.</p>
                                <p>2. Escribe tu texto y donde necesites un dato variable, inserta el código correspondiente (Ej: <span className="bg-white/20 px-2 py-0.5 rounded font-mono">{"{pet_name}"}</span>).</p>
                                <p>3. Al generar el documento desde un expediente, el código se sustituirá por el valor real.</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-700/50">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-3xl">📝</span> Ejemplo real
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-sm italic py-6">
                                <p className="mb-2">"Yo, <span className="text-brand-primary font-bold">{"{client_name}"}</span>, autorizo el procedimiento para mi mascota <span className="text-brand-primary font-bold">{"{pet_name}"}</span>..."</p>
                                <div className="h-px bg-slate-300 dark:bg-slate-700 my-4"></div>
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Resultado al imprimir:</p>
                                <p>"Yo, <span className="text-emerald-500 font-bold">Juan Pérez</span>, autorizo el procedimiento para mi mascota <span className="text-emerald-500 font-bold">Luna</span>..."</p>
                            </div>
                        </div>
                    </div>

                    {/* Variables Table */}
                    <div className="bg-white dark:bg-[#1B2132] rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                        <div className="p-8 border-b border-slate-200 dark:border-slate-700/50">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Diccionario de Variables</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Todas las variables disponibles en el sistema</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Variable</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ejemplo de Salida</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {variables.map((v) => (
                                        <tr key={v.tag} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl opacity-60 group-hover:opacity-100 transition-opacity">{v.icon}</span>
                                                    <span className="font-mono text-sm font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-lg">
                                                        {v.tag}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{v.description}</p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-emerald-500/20">
                                                    {v.example}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">© CanBull 2026 • Sistema de Gestión Veterinaria</p>
                            <Link 
                                href={route('document-templates.index')}
                                className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-primary-100 dark:hover:shadow-none hover:-translate-y-0.5 transition-all active:translate-y-0 border border-slate-200 dark:border-slate-700"
                            >
                                ← Volver a Plantillas
                            </Link>
                        </div>
                    </div>

                    {/* Pro Tip */}
                    <div className="mt-8 flex items-center gap-4 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl">
                        <div className="w-12 h-12 shrink-0 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-amber-500/20">
                            🚩
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Importante</h4>
                            <p className="text-xs text-amber-900/70 dark:text-amber-300/80 font-medium">
                                Si una mascota no tiene asignado un dato (ej. dueño), el sistema insertará una línea punteada <span className="font-bold">_______</span> para que puedas completarlo a mano una vez impreso.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
