import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PetAlertIcons from '@/Components/PetAlertIcons';

const roleLabels = {
    admin: 'Adm.',
    vet: 'Vet.',
    veterinarian: 'Vet.',
    surgeon: 'Cirujano',
    specialist: 'Esp.',
    groomer: 'Estilista',
    staff: 'Staff'
};

export default function Show({ auth, order, services, groomingStyles = [], defaultNextVisitDate = '' }) {
    const { data, setData, put, post, processing } = useForm({
        arrival_condition: order.arrival_condition || '',
        notes: order.notes || '',
        next_visit_date: order.next_visit_date ? String(order.next_visit_date).split('T')[0] : defaultNextVisitDate,
        items: order.items || []
    });

    const [selectedService, setSelectedService] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showPrintMenu, setShowPrintMenu] = useState(false);
    const printMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (printMenuRef.current && !printMenuRef.current.contains(e.target)) {
                setShowPrintMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isCompleted = order.status === 'completed';
    const isCancelled = order.status === 'cancelled';
    const canEdit = !isCompleted && !isCancelled;

    const addService = () => {
        if (!selectedService) return;
        const service = services.find(s => s.id == selectedService);
        if (service) {
            setData('items', [
                ...data.items,
                { product_id: service.id, concept: service.name, unit_price: service.price, quantity: 1 }
            ]);
            setSelectedService('');
        }
    };

    const applyStyle = (style) => {
        const prefix = data.notes ? data.notes + "\n" : "";
        setData('notes', `${prefix}[${style.name}]: ${style.description}`);
    };

    const removeService = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const saveChanges = (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        put(route('grooming-orders.update', order.id), {
            preserveScroll: true,
            onFinish: () => setIsSaving(false)
        });
    };

    const markAsComplete = (e) => {
        e.preventDefault();
        // Since we allow modifying notes before completing, we do saving first is better 
        // But we can also rely on the complete method saving the notes. 
        // To be safe, if we changed items, we'll force the user to save changes first OR we just chain requests.
        // Actually, let's just use POST to complete, and it accepts notes. We will tell user to 'Guardar' items first if they modified them.
        post(route('grooming-orders.complete', order.id));
    };
    const total = data.items.reduce((acc, item) => acc + (parseFloat(item.unit_price) * item.quantity), 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-black text-xl text-gray-800 dark:text-gray-200 leading-tight uppercase tracking-widest flex items-center gap-3">
                Orden de Estética <span className="text-gray-400 bg-white/50 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 tracking-tighter text-sm">#{order.folio}</span> 
            </h2>}
        >
            <Head title={`Estética - ${order.folio}`} />

            <div className="py-6 bg-slate-50/50 dark:bg-slate-900/20 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#1B2132] overflow-hidden shadow-2xl sm:rounded-[2rem] border border-gray-100 dark:border-gray-700">
                        <div className="p-0">
                            
                            {/* Status Banner */}
                            {isCompleted && (
                                <div className="p-4 bg-emerald-500 text-white flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 backdrop-blur grid place-items-center rounded-xl text-xl">✓</div>
                                        <div>
                                            <h4 className="font-black uppercase text-xs tracking-widest leading-none">Servicio Completado</h4>
                                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Cargos enviados al POS.</p>
                                        </div>
                                    </div>
                                    <Link href={route('receipts.create')} className="text-[9px] font-black uppercase bg-white text-emerald-600 hover:bg-emerald-50 py-2.5 px-5 rounded-xl transition shadow-lg shrink-0">Ir a Cobrar</Link>
                                </div>
                            )}

                            {!isCompleted && !isCancelled && (
                                <div className="p-3 bg-brand-primary/10 border-b border-brand-primary/20 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                                        </span>
                                        <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest">Orden Activa</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Print dropdown */}
                                        <div className="relative" ref={printMenuRef}>
                                            <button
                                                onClick={() => setShowPrintMenu(v => !v)}
                                                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-1">
                                                🖨️ Imprimir ▾
                                            </button>
                                            {showPrintMenu && (
                                                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden min-w-[150px]">
                                                    <button onClick={() => { window.open(route('grooming-orders.ticket', order.id) + '?type=ticket', '_blank'); setShowPrintMenu(false); }}
                                                        className="w-full text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-brand-primary hover:text-white transition-colors flex items-center gap-2">
                                                        🧧 Ticket (80mm)
                                                    </button>
                                                    <button onClick={() => { window.open(route('grooming-orders.ticket', order.id) + '?type=a4', '_blank'); setShowPrintMenu(false); }}
                                                        className="w-full text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-brand-primary hover:text-white transition-colors flex items-center gap-2 border-t border-slate-100 dark:border-slate-700">
                                                        📄 Formato A4
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={markAsComplete} disabled={processing}
                                            className="bg-brand-primary text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-brand-primary/20">
                                            ✓ Finalizar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Pet Banner - Compact */}
                            <div className="bg-brand-primary/5 dark:bg-brand-primary/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-3xl shadow-md border dark:border-gray-700 shrink-0">
                                        {order.pet?.species === 'Canino' ? '🐕' : '🐈'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase truncate">{order.pet.name}</h3>
                                            <PetAlertIcons pet={order.pet} size="sm" />
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                                            {order.pet.breed || 'Sin Raza'} • {order.pet.owner?.name || 'S/D'} • {order.pet.owner?.phone || 'S/T'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-700">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total</p>
                                        <p className="text-xl font-black text-brand-primary leading-none">${total.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                                    </div>
                                    {canEdit && (
                                        <button onClick={saveChanges} disabled={isSaving || processing}
                                            className="text-[9px] font-black text-slate-500 hover:text-brand-primary uppercase bg-white dark:bg-slate-800 px-3 py-3 rounded-xl border dark:border-gray-700 transition shadow-sm">
                                            {isSaving ? '...' : '💾 Guardar'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    
                                    {/* Left Column: Form */}
                                    <div className="lg:col-span-7 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Condición de Entrada</label>
                                                <textarea 
                                                    className="w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-brand-primary font-medium text-slate-700 dark:text-slate-300 text-xs transition-all"
                                                    rows="2"
                                                    value={data.arrival_condition}
                                                    onChange={e => setData('arrival_condition', e.target.value)}
                                                    disabled={!canEdit}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Regreso Sugerido</label>
                                                <input 
                                                    type="date"
                                                    className="w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-brand-primary font-bold text-slate-700 dark:text-slate-300 text-xs transition-all"
                                                    value={data.next_visit_date}
                                                    onChange={e => setData('next_visit_date', e.target.value)}
                                                    disabled={!canEdit}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nota de Salida / Estilo</label>
                                                {canEdit && groomingStyles.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {groomingStyles.map(style => (
                                                            <button key={style.id} type="button" onClick={() => applyStyle(style)}
                                                                title={style.description}
                                                                className="px-2.5 py-1 rounded-lg border border-brand-primary/30 text-[8px] font-black uppercase text-brand-primary bg-brand-primary/5 hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                                                                {style.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <textarea 
                                                className="w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-brand-primary font-medium text-slate-700 dark:text-slate-300 text-xs transition-all"
                                                rows="3"
                                                value={data.notes}
                                                onChange={e => setData('notes', e.target.value)}
                                                disabled={!canEdit}
                                                placeholder="Instrucciones finales..."
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column: Services & Finalize */}
                                    <div className="lg:col-span-5 flex flex-col gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[9px] font-black text-brand-primary uppercase tracking-widest">Servicios Agendados</h4>
                                            </div>
                                            {canEdit && (
                                                <select
                                                    className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 text-[10px] font-bold focus:ring-brand-primary transition-all block"
                                                    value=""
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        if (!val) return;
                                                        const s = services.find(x => x.id == val);
                                                        if (s) {
                                                            setData('items', [...data.items, { product_id: s.id, concept: s.name, unit_price: s.price, quantity: 1 }]);
                                                            setSelectedService('');
                                                        }
                                                    }}
                                                >
                                                    <option value="">+ Añadir servicio extra...</option>
                                                    {services.map(s => <option key={s.id} value={s.id}>{s.name} — ${parseFloat(s.price).toLocaleString('es-MX')}</option>)}
                                                </select>
                                            )}
                                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                                                {data.items.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm group">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase truncate">{item.concept}</p>
                                                            <p className="text-[9px] font-bold text-brand-primary">${parseFloat(item.unit_price).toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                                                        </div>
                                                        {canEdit && (
                                                            <button onClick={() => removeService(index)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-lg ml-2">×</button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {canEdit && (
                                            <form onSubmit={markAsComplete} className="bg-brand-primary p-5 rounded-2xl shadow-xl shadow-brand-primary/30 text-white mt-auto">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <h4 className="font-black uppercase tracking-widest text-[10px]">Cerrar Servicio</h4>
                                                        <p className="text-[8px] font-bold opacity-80 uppercase leading-none">Enviar cargos al Punto de Venta.</p>
                                                    </div>
                                                    <button type="submit" disabled={processing}
                                                        className="bg-white text-brand-primary px-5 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:scale-105 transition-all shadow-lg whitespace-nowrap">
                                                        Completar y Cobrar
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
