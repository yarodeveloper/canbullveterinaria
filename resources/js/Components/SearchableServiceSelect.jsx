import React, { useState, useEffect, useRef } from 'react';

const GROOMING_KEYWORDS = [
    'corte', 'baño', 'estética', 'grooming', 'pelo', 'uñas', 
    'cepillado', 'limpieza de oídos', 'drenado', 'spa', 
    'estetica', 'bano', 'unas', 'oidos', 'deslanado', 
    'nudos', 'tinte', 'esquilar', 'lavado', 'acondicionador'
];

const isGrooming = (name) => {
    if (!name) return false;
    const lower = name.toLowerCase();
    return GROOMING_KEYWORDS.some(k => lower.includes(k));
};

export default function SearchableServiceSelect({ services, onSelect, placeholder = "+ Toca para añadir servicio..." }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const filtered = services.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    // Grouping
    const groomingServices = filtered.filter(s => isGrooming(s.name));
    const otherServices = filtered.filter(s => !isGrooming(s.name));

    const handleSelectOption = (s) => {
        onSelect(s);
        setSearch('');
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-brand-primary focus:ring-brand-primary rounded-xl py-2 px-3 font-bold text-slate-700 dark:text-slate-300 text-xs text-left flex justify-between items-center transition-colors"
            >
                <span>{placeholder}</span>
                <span className="text-gray-400">▼</span>
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-[#1B2132] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 max-h-[350px] overflow-hidden flex flex-col">
                    {/* Search Input */}
                    <div className="relative mb-2 shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar servicio..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none font-bold"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Scrollable list */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 max-h-[250px]">
                        {/* Grooming Group */}
                        {groomingServices.length > 0 && (
                            <div>
                                <div className="px-2 py-1 bg-purple-50 dark:bg-purple-950/30 rounded-lg mb-1">
                                    <span className="text-[8px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">💇 Recomendados Estética</span>
                                </div>
                                <div className="space-y-0.5">
                                    {groomingServices.map(s => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => handleSelectOption(s)}
                                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-primary hover:text-white dark:hover:text-white transition text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center group"
                                        >
                                            <span className="truncate">{s.name}</span>
                                            <span className="text-[10px] text-brand-primary group-hover:text-white font-black whitespace-nowrap ml-2">
                                                ${parseFloat(s.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Other Group */}
                        {otherServices.length > 0 && (
                            <div>
                                <div className="px-2 py-1 bg-slate-50 dark:bg-slate-900/60 rounded-lg mb-1">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">💼 Otros Servicios</span>
                                </div>
                                <div className="space-y-0.5">
                                    {otherServices.map(s => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => handleSelectOption(s)}
                                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-primary hover:text-white dark:hover:text-white transition text-xs font-bold text-slate-600 dark:text-slate-400 flex justify-between items-center group"
                                        >
                                            <span className="truncate">{s.name}</span>
                                            <span className="text-[10px] text-brand-primary group-hover:text-white font-black whitespace-nowrap ml-2">
                                                ${parseFloat(s.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {groomingServices.length === 0 && otherServices.length === 0 && (
                            <p className="text-[10px] text-slate-400 italic text-center py-4">No se encontraron servicios</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
