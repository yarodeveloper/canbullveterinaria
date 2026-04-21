import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import React, { useState } from 'react';

const STATUS_CONFIG = {
    Borrador:  { color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400', ring: 'ring-slate-300' },
    Enviada:   { color: 'bg-blue-50 text-blue-700',    dot: 'bg-blue-500',   ring: 'ring-blue-300' },
    Aceptada:  { color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-300' },
    Rechazada: { color: 'bg-red-50 text-red-700',      dot: 'bg-red-500',    ring: 'ring-red-300' },
    Vencida:   { color: 'bg-amber-50 text-amber-700',  dot: 'bg-amber-500',  ring: 'ring-amber-300' },
    Cobrada:   { color: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-500', ring: 'ring-indigo-300' },
};

export default function Show({ auth, quote, settings }) {
    const [printMode, setPrintMode] = useState('full');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const categories = ['Insumos', 'Materiales', 'Medicamentos', 'Equipos', 'Renta de Equipos', 'Apoyo Médico', 'Servicios', 'Otros'];

    const clientName  = quote.pet?.owner?.name || quote.guest_client_name || 'Público General';
    const petName     = quote.pet?.name        || quote.guest_pet_name    || '—';
    const species     = quote.pet?.species     || quote.guest_species     || '—';
    const creatorName = quote.creator?.name    || 'Sistema';

    const groupedItems = categories.map(cat => ({
        category: cat,
        items: (quote.items || []).filter(i => i.category === cat),
    })).filter(g => g.items.length > 0);

    const fmtMoney = (n) => Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const changeStatus = (newStatus) => {
        if (updatingStatus) return;
        setUpdatingStatus(true);
        router.patch(route('quotes.update', quote.id), { status: newStatus }, {
            preserveScroll: true,
            onFinish: () => setUpdatingStatus(false),
        });
    };

    const [editDate, setEditDate] = useState(false);
    const [newDate, setNewDate] = useState(quote.valid_until ? quote.valid_until.split('T')[0] : '');

    const updateDate = () => {
        router.patch(route('quotes.update', quote.id), { valid_until: newDate }, {
            preserveScroll: true,
            onSuccess: () => setEditDate(false)
        });
    };

    const sendWhatsApp = () => {
        const phone = quote.pet?.owner?.phone || '';
        const text = encodeURIComponent(`Hola, le envío la cotización *${quote.folio}* de *${siteName}* para la mascota *${petName}*.\nPuede ver los detalles aquí: ${window.location.href}`);
        const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
        window.open(url, '_blank');
    };

    const triggerPrint = (mode) => {
        setPrintMode(mode);
        setTimeout(() => window.print(), 150);
    };

    const downloadPdf = async (mode) => {
        setPrintMode(mode);
        await new Promise(r => setTimeout(r, 300));
        const html2pdf = (await import('html2pdf.js')).default;
        const el = document.getElementById('pdf-download-wrapper');

        const originalStyle = el.style.cssText;
        el.style.position = 'static';
        el.style.top = '0';
        el.style.left = '0';
        el.style.visibility = 'visible';

        const opts = {
            margin:       [6, 8, 6, 8],
            filename:     `Cotizacion-${quote.folio}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' },
        };

        try {
            await html2pdf().set(opts).from(el).save();
        } finally {
            el.style.cssText = originalStyle;
        }
    };

    const siteName = auth.user?.branch?.name || settings?.site_name || 'Clínica Veterinaria';
    const logoSrc  = settings?.site_logo
        ? (settings.site_logo.startsWith('http') || settings.site_logo.startsWith('/') ? settings.site_logo : `/storage/${settings.site_logo}`)
        : null;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center flex-wrap gap-3">
                    <style>{`
                        @media print {
                            body { background: white !important; }
                            nav, header, footer, .print-hidden, button, .no-print { display: none !important; }
                            #pdf-download-wrapper {
                                position: static !important;
                                visibility: visible !important;
                                display: block !important;
                                width: 100% !important;
                                padding: 0 !important;
                                margin: 0 !important;
                                box-shadow: none !important;
                            }
                            .AuthenticatedLayout_nav { display: none !important; }
                        }
                    `}</style>
                    <div className="flex items-center gap-3">
                        <Link href={route('quotes.index')} className="text-slate-400 hover:text-brand-primary transition text-sm">←</Link>
                        <div>
                            <h2 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-brand-primary rounded-full"></span>
                                {quote.folio}
                            </h2>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
                                Emitida {format(new Date(quote.created_at), "d MMM yyyy", { locale: es })} · Por {creatorName}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ring-1 ${STATUS_CONFIG[quote.status]?.color} ${STATUS_CONFIG[quote.status]?.ring}`}>
                            {quote.status}
                        </span>

                        {[
                            { status: 'Enviada',   icon: '/icons/envelope-svgrepo-com.svg' },
                            { status: 'Aceptada',  icon: '/icons/thumb-up-svgrepo-com.svg' },
                            { status: 'Rechazada', icon: '/icons/delete-svgrepo-com.svg' },
                            { status: 'Vencida',   icon: '/icons/clock-svgrepo-com.svg' },
                        ].filter(s => s.status !== quote.status && quote.status !== 'Cobrada').map(({ status, icon }) => {
                            const cfg = STATUS_CONFIG[status];
                            return (
                                <button
                                    key={status}
                                    onClick={() => changeStatus(status)}
                                    disabled={updatingStatus}
                                    title={`Marcar como ${status}`}
                                    className={`w-8 h-8 inline-flex items-center justify-center rounded-xl border ring-1 ${cfg.color} ${cfg.ring} hover:opacity-80 transition disabled:opacity-50`}
                                >
                                    <img src={icon} className="w-4 h-4 icon-adaptive" alt={status} />
                                </button>
                            );
                        })}

                        <button
                            onClick={sendWhatsApp}
                            title="Enviar por WhatsApp"
                            className="w-8 h-8 inline-flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white transition shadow-sm"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                        </button>

                        <button
                            onClick={() => triggerPrint('full')}
                            title="Imprimir"
                            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-brand-primary text-brand-primary rounded-full text-[10px] font-black uppercase hover:bg-brand-primary hover:text-white transition shadow-sm flex items-center gap-1.5"
                        >
                            <img src="/icons/printer-svgrepo-com.svg" className="w-3.5 h-3.5 icon-adaptive" alt="" />
                            Imprimir
                        </button>

                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => downloadPdf('full')}
                                title="Descargar PDF detallado"
                                className="px-3 py-1.5 bg-red-50 border border-red-300 text-red-600 rounded-l-full text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition shadow-sm"
                            >
                                PDF Detallado
                            </button>
                            <button
                                onClick={() => downloadPdf('summary')}
                                title="Descargar PDF resumido"
                                className="px-3 py-1.5 bg-red-50 border border-red-300 text-red-600 rounded-r-full text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition shadow-sm"
                            >
                                PDF Resumido
                            </button>
                        </div>

                        {quote.status === 'Aceptada' && (
                            <div className="flex items-center gap-2">
                                {quote.pending_charges?.some(pc => pc.status === 'invoiced') ? (
                                    <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border border-emerald-200">
                                        <span className="text-sm">✅</span>
                                        Cobrado en PDV
                                    </div>
                                ) : quote.pending_charges?.some(pc => pc.status === 'pending') ? (
                                    <button
                                        onClick={() => {
                                            if(confirm('¿Deseas revertir el envío a PDV? Se eliminarán los cargos pendientes aún no cobrados.')) {
                                                router.post(route('quotes.revert-conversion', quote.id));
                                            }
                                        }}
                                        className="px-4 py-2 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase hover:opacity-90 transition shadow-lg shadow-amber-500/20 flex items-center gap-2 border border-amber-600/20"
                                    >
                                        <span className="text-sm">↩️</span>
                                        Revertir Envío
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if(confirm('¿Deseas enviar los ítems de esta cotización al Punto de Venta?')) {
                                                router.post(route('quotes.convert-to-charge', quote.id));
                                            }
                                        }}
                                        className="px-4 py-2 bg-brand-primary text-white rounded-full text-[10px] font-black uppercase hover:opacity-90 transition shadow-lg shadow-brand-primary/20 flex items-center gap-2 border border-brand-primary/20"
                                    >
                                        <span className="text-sm">🛒</span>
                                        Enviar a PDV
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Cotización ${quote.folio}`} />

            <div
                id="pdf-download-wrapper"
                style={{
                    position: 'fixed', top: '-9999px', left: '-9999px',
                    width: '780px', background: 'white', color: '#1e293b',
                    padding: '20px 30px', fontSize: '9px', lineHeight: '1.3',
                    visibility: 'hidden'
                }}
            >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '6px', borderBottom: '1.5px solid #7c3aed'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        {logoSrc && <img src={logoSrc} alt="" style={{height: '38px', width: 'auto', objectFit: 'contain'}} />}
                        <div>
                            <p style={{fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', margin: 0}}>{siteName}</p>
                            <p style={{fontSize: '8px', color: '#64748b', margin: 0}}>
                                {settings?.address}{settings?.phone && ` | TEL: ${settings.phone}`}{settings?.email && ` | ${settings.email}`}
                            </p>
                        </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                        <p style={{fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', margin: 0}}>Cotización de Servicios</p>
                        <p style={{fontSize: '12px', fontWeight: '900', color: '#7c3aed', margin: '0'}}>{quote.folio}</p>
                        <p style={{fontSize: '7.5px', color: '#64748b', margin: '0'}}>
                            {format(new Date(quote.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                            {quote.valid_until && ` | Vigencia: ${format(new Date(quote.valid_until), "d 'de' MMMM, yyyy", { locale: es })}`}
                        </p>
                    </div>
                </div>
                <div style={{height: '2px', background: 'linear-gradient(to right, #7c3aed, #a855f7, #ec4899)', margin: '4px 0 8px'}}></div>

                {/* Datos en una línea — Limpio sin bordes */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', padding: '0 5px 8px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px'}}>
                    <div>
                        <p style={{fontSize: '7px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '900', margin: '0 0 1px'}}>Cliente</p>
                        <p style={{margin: 0, fontWeight: '700'}}>{clientName}</p>
                    </div>
                    <div>
                        <p style={{fontSize: '7px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '900', margin: '0 0 1px'}}>Paciente</p>
                        <p style={{margin: 0, fontWeight: '700'}}>{petName} ({species})</p>
                    </div>
                    <div>
                        <p style={{fontSize: '7px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '900', margin: '0 0 1px'}}>Elaboró</p>
                        <p style={{margin: 0}}>{creatorName}</p>
                    </div>
                    <div>
                        <p style={{fontSize: '7px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '900', margin: '0 0 1px'}}>Estado</p>
                        <p style={{margin: 0, fontWeight: '700', color: '#7c3aed'}}>{quote.status}</p>
                    </div>
                </div>

                {printMode === 'full' ? (
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{borderBottom: '1.5px solid #cbd5e1', fontSize: '8px', textTransform: 'uppercase', color: '#94a3b8', background: '#f8fafc'}}>
                                <th style={{textAlign: 'left', padding: '3px 6px', fontWeight: '700'}}>Descripción</th>
                                <th style={{textAlign: 'right', padding: '3px 6px', width: '40px', fontWeight: '700'}}>Cant.</th>
                                <th style={{textAlign: 'right', padding: '3px 6px', width: '70px', fontWeight: '700'}}>P. Unit.</th>
                                <th style={{textAlign: 'right', padding: '3px 6px', width: '70px', fontWeight: '700'}}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedItems.map(group => (
                                <React.Fragment key={group.category}>
                                    <tr>
                                        <td colSpan={4} style={{padding: '4px 6px 2px', fontSize: '7.5px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', background: '#f1f5f9', borderTop: '1px solid #e2e8f0'}}>
                                            {group.category}
                                        </td>
                                    </tr>
                                    {group.items.map(item => (
                                        <tr key={item.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                                            <td style={{padding: '3px 6px', color: '#334155'}}>{item.description}</td>
                                            <td style={{padding: '3px 6px', textAlign: 'right', color: '#64748b'}}>{item.quantity}</td>
                                            <td style={{padding: '3px 6px', textAlign: 'right', color: '#64748b'}}>${fmtMoney(item.unit_price)}</td>
                                            <td style={{padding: '3px 6px', textAlign: 'right', fontWeight: '700'}}>${fmtMoney(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{borderBottom: '1px solid #cbd5e1', fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8'}}>
                                <th style={{textAlign: 'left', padding: '4px 6px', fontWeight: '700'}}>Categoría</th>
                                <th style={{textAlign: 'right', padding: '4px 6px', fontWeight: '700'}}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedItems.map(group => (
                                <tr key={group.category} style={{borderBottom: '1px solid #f1f5f9'}}>
                                    <td style={{padding: '4px 6px'}}>{group.category}</td>
                                    <td style={{padding: '4px 6px', textAlign: 'right', fontWeight: '700'}}>${fmtMoney(group.items.reduce((s, i) => s + Number(i.subtotal), 0))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '6px', borderTop: '1.5px solid #e2e8f0', paddingTop: '4px'}}>
                    <table style={{fontSize: '9px'}}><tbody>
                        <tr><td style={{paddingRight: '20px', color: '#64748b'}}>Subtotal</td><td style={{textAlign: 'right', fontWeight: '700'}}>${fmtMoney(quote.subtotal)}</td></tr>
                        {Number(quote.tax) > 0 && <tr><td style={{paddingRight: '20px', color: '#64748b'}}>IVA</td><td style={{textAlign: 'right', fontWeight: '700'}}>${fmtMoney(quote.tax)}</td></tr>}
                        <tr style={{borderTop: '1px solid #cbd5e1'}}>
                            <td style={{paddingRight: '20px', fontWeight: '900', fontSize: '10px', paddingTop: '3px', textTransform: 'uppercase'}}>Total Estimado</td>
                            <td style={{textAlign: 'right', fontWeight: '900', fontSize: '13px', color: '#7c3aed', paddingTop: '3px'}}>${fmtMoney(quote.total)}</td>
                        </tr>
                    </tbody></table>
                </div>

                {quote.notes && (
                    <div style={{marginTop: '8px', padding: '6px 10px', border: '1px solid #fde68a', background: '#fffbeb', borderRadius: '4px', fontSize: '8px'}}>
                        <p style={{fontWeight: '900', color: '#92400e', textTransform: 'uppercase', marginBottom: '2px'}}>Notas y Condiciones Especiales</p>
                        <p style={{color: '#78350f', lineHeight: '1.4', whiteSpace: 'pre-line'}}>{quote.notes}</p>
                    </div>
                )}

                <div style={{marginTop: '12px', paddingTop: '6px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '7.5px', color: '#94a3b8'}}>
                    <p>Documento generado por {siteName} · {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })} · Folio {quote.folio}</p>
                    <p>Los precios son estimados y sujetos a cambios por hallazgos médicos al momento del procedimiento.</p>
                </div>
            </div>

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto print-hidden">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Cliente',  value: clientName,                                                                    icon: '👤' },
                        { label: 'Paciente', value: `${petName} (${species})`,                                                     icon: '🐾' },
                        {
                            label: 'Vigencia',
                            value: (
                                <div className="flex items-center gap-2 group/date">
                                    {editDate ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="date"
                                                value={newDate}
                                                onChange={(e) => setNewDate(e.target.value)}
                                                className="text-[11px] py-0.5 px-1 bg-slate-100 dark:bg-slate-700 border-none rounded focus:ring-1 focus:ring-brand-primary"
                                            />
                                            <button onClick={updateDate} className="text-emerald-500 hover:scale-110 transition">✓</button>
                                            <button onClick={() => setEditDate(false)} className="text-red-400 hover:scale-110 transition">✕</button>
                                        </div>
                                    ) : (
                                        <>
                                            {quote.valid_until ? format(new Date(quote.valid_until), "d MMM, yyyy", { locale: es }) : '—'}
                                            <button onClick={() => setEditDate(true)} className="opacity-0 group-hover/date:opacity-100 text-brand-primary text-[10px] hover:underline transition">Prorroga</button>
                                        </>
                                    )}
                                </div>
                            ),
                            icon: '📅'
                        },
                        { label: 'Elaboró',  value: creatorName,                                                                   icon: '🔬' },
                    ].map(card => (
                        <div key={card.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm relative">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                            <div className="font-bold text-slate-800 dark:text-white text-sm leading-tight flex items-center">
                                <span className="mr-1.5">{card.icon}</span>
                                {card.value}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest text-[11px]">Detalle de Costos</h3>
                        <div className="flex gap-2 text-[10px]">
                            <button onClick={() => setPrintMode('full')} className={`px-3 py-1 rounded-full font-black uppercase tracking-widest transition ${printMode === 'full' ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>Detallado</button>
                            <button onClick={() => setPrintMode('summary')} className={`px-3 py-1 rounded-full font-black uppercase tracking-widest transition ${printMode === 'summary' ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>Resumido</button>
                        </div>
                    </div>

                    <div className={printMode === 'full' ? 'block' : 'hidden'}>
                        <table className="w-full">
                            <thead>
                                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                    <th className="px-6 py-2 text-left">Descripción</th>
                                    <th className="px-4 py-2 text-right w-20">Cant.</th>
                                    <th className="px-4 py-2 text-right w-28">P. Unitario</th>
                                    <th className="px-4 py-2 text-right w-28">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedItems.map(group => (
                                    <React.Fragment key={group.category}>
                                        <tr>
                                            <td colSpan={4} className="px-6 py-1.5 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-700">
                                                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{group.category}</p>
                                            </td>
                                        </tr>
                                        {group.items.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition border-b border-slate-50 dark:border-slate-700/30">
                                                <td className="px-6 py-2.5">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.description}</p>
                                                    {item.product && <p className="text-[10px] text-slate-400 uppercase font-bold">{item.product.unit}</p>}
                                                </td>
                                                <td className="px-4 py-2.5 text-right text-sm font-bold text-slate-600 dark:text-slate-300">{item.quantity}</td>
                                                <td className="px-4 py-2.5 text-right text-sm font-bold text-slate-600 dark:text-slate-300">${fmtMoney(item.unit_price)}</td>
                                                <td className="px-4 py-2.5 text-right text-sm font-black text-slate-900 dark:text-white">${fmtMoney(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={printMode === 'summary' ? 'block' : 'hidden'}>
                        <table className="w-full">
                            <thead>
                                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                    <th className="px-6 py-2.5 text-left">Categoría</th>
                                    <th className="px-6 py-2.5 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {groupedItems.map(group => (
                                    <tr key={group.category} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition">
                                        <td className="px-6 py-3 font-bold text-slate-800 dark:text-slate-200">{group.category}</td>
                                        <td className="px-6 py-3 text-right font-black text-slate-900 dark:text-white">
                                            ${fmtMoney(group.items.reduce((s, i) => s + Number(i.subtotal), 0))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                        <div className="w-72 space-y-2">
                            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 font-bold">
                                <span>Subtotal</span>
                                <span>${fmtMoney(quote.subtotal)}</span>
                            </div>
                            {Number(quote.tax) > 0 && (
                                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 font-bold">
                                    <span>IVA</span>
                                    <span>${fmtMoney(quote.tax)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-600 pt-2">
                                <span>TOTAL ESTIMADO</span>
                                <span className="text-brand-primary">${fmtMoney(quote.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {quote.notes && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-5 mb-6">
                        <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">⚠️ Notas y Condiciones Especiales</p>
                        <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-line">{quote.notes}</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
