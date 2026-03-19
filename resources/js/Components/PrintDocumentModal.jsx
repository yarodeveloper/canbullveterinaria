import React from 'react';
import { Link } from '@inertiajs/react';

export default function PrintDocumentModal({ 
    isOpen, 
    onClose, 
    pet, 
    documentTemplates = [],
    // optional custom print route function
    customPrintRoute = null,
    children
}) {
    if (!isOpen) return null;

    const getPrintUrl = (template) => {
        if (customPrintRoute) {
            return customPrintRoute(template);
        }
        return route('document-templates.print', [pet.id, template.id]);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border dark:border-gray-700">
                <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center bg-slate-50 dark:bg-gray-900/50 relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary to-indigo-500"></div>
                    <div>
                        <h3 className="font-black uppercase tracking-tight text-2xl text-gray-900 dark:text-gray-100">Centro de Impresión</h3>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Selecciona la plantilla para {pet.name}</p>
                    </div>
                    <button onClick={onClose} className="bg-white dark:bg-gray-700 text-gray-400 hover:text-red-500 transition rounded-full p-2 shadow-sm border dark:border-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {children}

                    {documentTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['surgery', 'hospitalization', 'euthanasia', 'general', 'witness', 'finance'].map(category => {
                                const categoryTemplates = documentTemplates.filter(t => t.type === category);
                                if (categoryTemplates.length === 0) return null;

                                const getCategoryIcon = (cat) => {
                                    switch(cat) {
                                        case 'surgery': return '✂️';
                                        case 'hospitalization': return '🏥';
                                        case 'euthanasia': return '🕊️';
                                        case 'witness': return '✍️';
                                        case 'finance': return '💰';
                                        default: return '📄';
                                    }
                                };

                                const getCategoryLabel = (cat) => {
                                    switch(cat) {
                                        case 'surgery': return 'Cirugía y Anestesia';
                                        case 'hospitalization': return 'Hospitalización';
                                        case 'euthanasia': return 'Eutanasia';
                                        case 'witness': return 'Actas y Testigos';
                                        case 'finance': return 'Pagos y Créditos';
                                        default: return 'Formatos Generales';
                                    }
                                };

                                return (
                                    <div key={category} className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">{getCategoryLabel(category)}</h4>
                                        <div className="space-y-2">
                                            {categoryTemplates.map(tmpl => (
                                                <a
                                                    key={tmpl.id}
                                                    href={getPrintUrl(tmpl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all group active:scale-[0.98]"
                                                >
                                                    <span className="text-xl group-hover:scale-110 transition-transform">{getCategoryIcon(category)}</span>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-brand-primary">{tmpl.title}</p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Click para imprimir</p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Other templates */}
                            {(() => {
                                const otherTemplates = documentTemplates.filter(t => !['surgery', 'hospitalization', 'euthanasia', 'witness', 'finance', 'general'].includes(t.type));
                                if (otherTemplates.length === 0) return null;
                                return (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Otros Formatos</h4>
                                        <div className="space-y-2">
                                            {otherTemplates.map(tmpl => (
                                                <a
                                                    key={tmpl.id}
                                                    href={getPrintUrl(tmpl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all group"
                                                >
                                                    <span className="text-xl">📄</span>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-brand-primary">{tmpl.title}</p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-gray-700">
                            <span className="text-4xl mb-3 block">⚙️</span>
                            <p className="text-sm font-bold text-slate-500 uppercase">Sin plantillas activas</p>
                            <Link href={route('document-templates.index')} className="text-brand-primary text-xs font-black underline mt-2 block">Ir a configuración para crear una</Link>
                        </div>
                    )}
                </div>
                
                <div className="p-6 bg-slate-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-between items-center px-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Tip: Configura más formatos en el menú de documentos.</p>
                    <button onClick={onClose} className="text-xs font-black uppercase text-slate-500 hover:text-slate-700">Cerrar</button>
                </div>
            </div>
        </div>
    );
}
