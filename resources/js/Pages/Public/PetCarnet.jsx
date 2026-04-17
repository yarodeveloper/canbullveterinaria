import React, { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';

export default function PetCarnet({ pet, clinic }) {
    const groupedRecords = pet.preventive_records.reduce((acc, record) => {
        if (!acc[record.type]) acc[record.type] = [];
        acc[record.type].push(record);
        return acc;
    }, {});

    const typeLabels = {
        vaccine: 'Plan de Vacunación',
        internal_deworming: 'Desparasitación Interna',
        external_deworming: 'Control de Parásitos Externos',
        other: 'Otros Tratamientos'
    };

    const typeIcons = {
        vaccine: '💉',
        internal_deworming: '💊',
        external_deworming: '🧼',
        other: '🛡️'
    };

    // Calcular Puntaje de Protección (Health Score)
    const protectionScore = useMemo(() => {
        if (pet.preventive_records.length === 0) return 0;
        const overdue = pet.preventive_records.filter(r =>
            r.next_due_date && new Date(r.next_due_date) < new Date()
        ).length;
        return Math.round(((pet.preventive_records.length - overdue) / pet.preventive_records.length) * 100);
    }, [pet.preventive_records]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans selection:bg-indigo-100 pb-20">
            <Head title={`Carnet Digital - ${pet.name}`} />

            {/* Header / Brand Overlay */}
            <div className="bg-indigo-600 h-64 w-full absolute top-0 left-0 z-0 print:hidden shadow-inner"></div>

            <div className="max-w-3xl mx-auto px-4 pt-12 relative z-10">
                {/* Floating Card: Pet Info */}
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800 mb-8 print:shadow-none print:border-gray-200 print:rounded-none">
                    <div className="p-8 md:p-14">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="relative">
                                <div className="w-44 h-44 bg-indigo-50 dark:bg-indigo-900/30 rounded-[3rem] shadow-inner border-8 border-white dark:border-gray-800 overflow-hidden relative group flex items-center justify-center">
                                    {pet.photo_path ? (
                                        <img src={`/storage/${pet.photo_path}`} alt={pet.name} className="w-full h-full object-cover relative z-10" />
                                    ) : (
                                        <span className="relative z-10 text-7xl">{pet.species === 'Dog' || pet.species === 'Canino' ? '🐶' : '🐱'}</span>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent"></div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-3 rounded-full border-4 border-white dark:border-gray-900 shadow-xl">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                    </span>
                                    Identificación Oficial y Carnet Electrónico
                                </div>
                                <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter italic">
                                    {pet.name}
                                </h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg">🏷️ {pet.breed || 'Mestizo'}</span>
                                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg">🎂 {pet.dob ? new Date().getFullYear() - new Date(pet.dob).getFullYear() + ' años' : 'N/A'}</span>
                                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg">🆔 {pet.microchip || 'S/N'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-3 w-full md:w-auto mt-6 md:mt-0 print:flex print:flex-col print:items-center">
                                <div className="bg-white p-2 border-2 border-gray-100 rounded-2xl shadow-sm">
                                    <QRCodeSVG
                                        value={typeof window !== 'undefined' ? window.location.href : ''}
                                        size={80}
                                        level="M"
                                        includeMargin={false}
                                    />
                                </div>
                                <button
                                    onClick={handlePrint}
                                    className="bg-indigo-50 hover:bg-indigo-100 p-3 rounded-2xl transition-all shadow-sm border border-indigo-100 flex items-center justify-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest print:hidden group"
                                    title="Descargar Plan de Salud"
                                >
                                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Imprimir
                                </button>
                            </div>
                        </div>

                        {/* Health Score Banner */}
                        <div className="mt-10 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Nivel de Protección</p>
                                    <p className="text-4xl font-black text-indigo-600">{protectionScore}%</p>
                                </div>
                                <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${protectionScore}%` }}></div>
                                </div>
                            </div>
                            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Estatus Actual</p>
                                <p className={`text-sm font-black uppercase tracking-widest ${protectionScore >= 90 ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {protectionScore >= 90 ? '🛡️ Inmunidad Estable' : '⚠️ Refuerzos Pendientes'}
                                </p>
                            </div>
                        </div>

                        {/* Clinic Header */}
                        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-wrap justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                {clinic.logo ? (
                                    <img src={clinic.logo} alt={clinic.name} className="w-14 h-14 object-contain rounded-xl" />
                                ) : (
                                    <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 border-white dark:border-gray-800">
                                        {clinic.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Clínica Emisora</p>
                                    <h2 className="font-black text-gray-900 dark:text-gray-100 text-xl leading-none tracking-tighter">
                                        {clinic.name}
                                    </h2>
                                    {clinic.branch && clinic.branch !== clinic.name && (
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">
                                            📍 Sucursal: {clinic.branch}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Certificado No.</p>
                                <p className="font-mono text-xs text-indigo-500 font-bold">{pet.uuid.split('-')[0].toUpperCase()}-{pet.id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Sections */}
                <div className="space-y-12">
                    {Object.entries(typeLabels).map(([type, label]) => (
                        <div key={type} className="print:break-inside-avoid px-2">
                            <h2 className="text-sm font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.4em] mb-6 flex items-center gap-3 italic">
                                <span className="text-xl grayscale opacity-50">{typeIcons[type]}</span> {label}
                            </h2>
                            <div className="grid grid-cols-1 gap-5">
                                {groupedRecords[type]?.length > 0 ? (
                                    groupedRecords[type].map(record => (
                                        <div key={record.id} className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 print:border-gray-200 group relative">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xl">{record.name}</h3>
                                                    {record.brand && <span className="text-[10px] px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg font-black text-gray-400 uppercase border border-gray-100 dark:border-gray-700">{record.brand}</span>}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                    <span>Aplicación: <span className="text-gray-800 dark:text-gray-300">{new Date(record.application_date).toLocaleDateString()}</span></span>
                                                    {record.weight_at_time && <span>Peso: <span className="text-indigo-500">{record.weight_at_time}kg</span></span>}
                                                    {record.veterinarian && (
                                                        <span className="bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded italic lowercase text-[10px]">
                                                            por dr(a). {record.veterinarian.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {record.next_due_date ? (
                                                    <div className="flex flex-col items-center md:items-end">
                                                        <span className="text-[9px] font-black text-indigo-300 dark:text-indigo-400 uppercase tracking-widest mb-1.5 italic">Próximo Refuerzo</span>
                                                        <span className={`px-5 py-2 rounded-2xl text-xs font-black tracking-widest shadow-lg border ${new Date(record.next_due_date) < new Date()
                                                            ? 'bg-red-50 text-red-600 border-red-100 shadow-red-500/10'
                                                            : 'bg-green-50 text-green-600 border-green-100 shadow-green-500/10'
                                                            }`}>
                                                            {new Date(record.next_due_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-gray-300 uppercase italic px-4 py-2 border border-dashed border-gray-200 rounded-xl">Inmunidad Permanente</span>
                                                )}
                                            </div>
                                            {/* Digital Seal Simulation */}
                                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                                                <div className="w-1 h-12 bg-indigo-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white/30 dark:bg-gray-900/10 p-12 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 text-center">
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Sin registros electrónicos</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Verified Footer */}
                <div className="mt-20 text-center print:mt-12 bg-white dark:bg-gray-900 p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-indigo-500/5">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-300 mb-10 italic">Validación Electrónica de Salud</p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                        <div className="relative p-4 bg-white rounded-3xl border-2 border-gray-50 shadow-inner">
                            <QRCodeSVG
                                        value={typeof window !== 'undefined' ? window.location.href : ''}
                                        size={144}
                                        level="Q"
                                        includeMargin={false}
                                    />
                            <div className="absolute inset-0 border-4 border-indigo-600/5 rounded-3xl pointer-events-none"></div>
                        </div>
                        <div className="text-left space-y-4">
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sello Digital</p>
                                <p className="font-mono text-[10px] text-gray-400 break-all max-w-[200px] leading-tight opacity-50">
                                    {btoa(pet.uuid + pet.id).substring(0, 64)}...
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Fecha Certificación</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tighter">
                                    {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="pt-2">
                                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                                    ✅ Firma Digital Activa
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Footer */}
                <div className="mt-12 text-center text-gray-400 opacity-50 print:hidden">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em]">&copy; {new Date().getFullYear()} {clinic.name} - Sistema de Gestión V.2.0</p>
                </div>

                {/* Sello Magnético / Marca de Agua de la Sucursal */}
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center items-center pointer-events-none opacity-5 z-0 print:opacity-10">
                    <div className="border-[12px] border-indigo-600 rounded-full w-[500px] h-[500px] flex items-center justify-center -rotate-12">
                        <div className="text-center">
                            <p className="text-6xl font-black uppercase tracking-[0.2em] text-indigo-600 italic">Oficial</p>
                            <div className="h-2 bg-indigo-600 w-full my-4"></div>
                            <p className="text-4xl font-black uppercase tracking-widest text-indigo-600 leading-none">
                                {clinic.branch || clinic.name}
                            </p>
                            <div className="h-2 bg-indigo-600 w-full my-4"></div>
                            <p className="text-xl font-bold uppercase text-indigo-600 tracking-[0.5em]">{new Date().getFullYear()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Specific Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body { background: white !important; -webkit-print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                    .print\\:rounded-none { border-radius: 0 !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:border-gray-200 { border-color: #f3f4f6 !important; }
                    .max-w-3xl { max-width: 100% !important; margin: 0 !important; }
                    @page { margin: 1cm; }
                }
            `}} />
        </div>
    );
}
