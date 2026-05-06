import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MedicalRecordAttachmentManager = ({ 
    existingAttachments = [], 
    onAttachmentsChange, 
    onExistingAttachmentUpdate,
    onExistingAttachmentDelete 
}) => {
    const [newAttachments, setNewAttachments] = useState([]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const updatedNewAttachments = [
            ...newAttachments,
            ...selectedFiles.map(file => ({
                file,
                description: '',
                previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                isNew: true,
                id: Math.random().toString(36).substr(2, 9)
            }))
        ];
        setNewAttachments(updatedNewAttachments);
        notifyChanges(updatedNewAttachments);
    };

    const removeNewAttachment = (id) => {
        const updated = newAttachments.filter(item => item.id !== id);
        setNewAttachments(updated);
        notifyChanges(updated);
    };

    const updateNewDescription = (id, description) => {
        const updated = newAttachments.map(item => 
            item.id === id ? { ...item, description } : item
        );
        setNewAttachments(updated);
        notifyChanges(updated);
    };

    const notifyChanges = (attachments) => {
        onAttachmentsChange(
            attachments.map(a => a.file),
            attachments.map(a => a.description)
        );
    };

    const cardStyle = "bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative";

    return (
        <div className="space-y-6">
            {/* Upload Zone */}
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-primary dark:hover:border-brand-primary rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 transition-all bg-slate-50/50 dark:bg-slate-900/20 group text-center cursor-pointer">
                <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Añadir Archivos</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1 px-4">Imágenes, PDF o Laboratorios (Máx 10MB)</p>
                    </div>
                </div>
            </div>

            {/* Attachments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Existing Attachments */}
                {existingAttachments.map((att) => (
                    <div key={`existing-${att.id}`} className={cardStyle}>
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                            {att.file_type?.startsWith('image/') ? (
                                <img src={att.url} className="w-full h-full object-cover" alt={att.description || att.file_name} />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase mt-2">{att.file_type?.split('/')[1] || 'DOC'}</span>
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button 
                                    type="button" 
                                    onClick={() => onExistingAttachmentDelete(att.id)}
                                    className="p-2 bg-red-500 text-white rounded-xl opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                    title="Eliminar permanentemente"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded">Archivo Guardado</span>
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">
                                    {att.created_at ? format(new Date(att.created_at), 'dd MMM yyyy', { locale: es }) : 'N/A'}
                                </span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Título de referencia..." 
                                value={att.description || ''} 
                                onChange={(e) => onExistingAttachmentUpdate(att.id, e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold py-2 focus:ring-brand-primary transition-all"
                            />
                        </div>
                    </div>
                ))}

                {/* New Attachments */}
                {newAttachments.map((item) => (
                    <div key={item.id} className={`${cardStyle} ring-2 ring-brand-primary ring-offset-2 dark:ring-offset-slate-900 border-brand-primary/30`}>
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                            {item.previewUrl ? (
                                <img src={item.previewUrl} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase mt-2">PREVISUALIZACIÓN</span>
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                <button 
                                    type="button" 
                                    onClick={() => removeNewAttachment(item.id)}
                                    className="p-2 bg-slate-900/90 text-white rounded-xl hover:bg-red-500 transition-colors shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">Nuevo Archivo</span>
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight italic">Pendiente de guardar</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Título (ej: Rayos X Cadera)..." 
                                value={item.description} 
                                onChange={(e) => updateNewDescription(item.id, e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border-brand-primary/20 rounded-xl text-[11px] font-black py-2 focus:ring-brand-primary transition-all placeholder:font-normal"
                                autoFocus
                            />
                        </div>
                    </div>
                ))}
            </div>
            
            {existingAttachments.length === 0 && newAttachments.length === 0 && (
                <div className="py-16 text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sin archivos adjuntos en esta consulta</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">Usa la zona superior para añadir documentos</p>
                </div>
            )}
        </div>
    );
};

export default MedicalRecordAttachmentManager;
