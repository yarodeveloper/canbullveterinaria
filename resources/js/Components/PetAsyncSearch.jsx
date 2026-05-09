import React, { useState, useEffect, useRef } from 'react';
import PetAvatar from '@/Components/PetAvatar';

export default function PetAsyncSearch({ onSelect, placeholder = "Buscar paciente o dueño...", autoFocus = false }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length > 2) {
                setIsSearching(true);
                fetch(route('pets.search', { q: query }))
                    .then(res => res.json())
                    .then(data => {
                        // Extraemos el objeto `pet` completo que viene en cada resultado
                        setResults(data.map(item => item.pet));
                        setIsSearching(false);
                    })
                    .catch(err => {
                        console.error("Error searching pets:", err);
                        setIsSearching(false);
                    });
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Close dropdown on click outside (optional, but good UX)
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // Not clearing results to allow returning, but could hide it
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">🔍</span>
                <input
                    type="text"
                    autoFocus={autoFocus}
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/50 border-2 border-transparent focus:bg-white dark:focus:bg-[#1B2132] focus:border-brand-primary focus:ring-0 rounded-2xl pl-14 pr-10 py-4 text-base font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                    autoComplete="off"
                />
                {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {results.length > 0 && query.length > 2 && (
                <div className="absolute z-[999] w-full mt-2 bg-white dark:bg-[#1B2132] border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-3 max-h-[400px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resultados Encontrados ({results.length})</p>
                    </div>
                    <div className="space-y-1">
                        {results.map(pet => (
                            <button
                                key={pet.id}
                                type="button"
                                onClick={() => {
                                    setQuery('');
                                    setResults([]);
                                    onSelect(pet);
                                }}
                                className="w-full text-left px-4 py-3 rounded-2xl hover:bg-brand-primary group transition-all flex justify-between items-center"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <PetAvatar pet={pet} className="h-11 w-11 border-2 border-white dark:border-slate-700 shadow-sm group-hover:border-white/50 transition-colors" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-slate-900 dark:text-white uppercase text-sm group-hover:text-white transition-colors truncate">
                                            {pet.name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5 tracking-wider truncate group-hover:text-white/80 transition-colors flex items-center gap-2">
                                            <span>{pet.species || 'Mascota'} • {pet.breed || 'Sin Raza'}</span>
                                            <span className="opacity-30">•</span>
                                            <span className="flex items-center gap-1">👤 {pet.owner?.name || 'Sin dueño'}</span>
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border ${
                                                pet.branch ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                                            } group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent`}>
                                                📍 {pet.branch?.name || 'Sucursal Global'}
                                            </span>
                                            {pet.status === 'deceased' && (
                                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter bg-red-100 text-red-600 border border-red-200 group-hover:bg-white group-hover:text-red-600 group-hover:border-transparent">
                                                    🌈 Fallecido
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-4 shrink-0 flex items-center gap-2">
                                    <span className="text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest bg-white dark:bg-slate-800 text-brand-primary border border-slate-100 dark:border-slate-700 group-hover:bg-white group-hover:text-brand-primary group-hover:border-white transition-all shadow-sm">
                                        Seleccionar
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {query.length > 2 && results.length === 0 && !isSearching && (
                 <div className="absolute z-[999] w-full mt-2 bg-white dark:bg-[#1B2132] border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-tight">No se encontraron resultados</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest leading-relaxed">
                        Intenta buscar por nombre de mascota, dueño, teléfono o microchip.
                    </p>
                 </div>
            )}
        </div>
    );
}
