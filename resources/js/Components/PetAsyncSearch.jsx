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
        <div className="relative group" ref={dropdownRef}>
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">🔍</span>
            <input
                type="text"
                autoFocus={autoFocus}
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900/50 border-transparent focus:bg-white dark:focus:bg-[#1B2132] border-slate-300 dark:border-slate-700 focus:border-brand-primary focus:ring-brand-primary rounded-2xl pl-14 pr-10 py-4 text-base font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                autoComplete="off"
            />
            {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {results.length > 0 && query.length > 2 && (
                <div className="absolute z-[100] w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xl p-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {results.map(pet => (
                        <button
                            key={pet.id}
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setResults([]);
                                onSelect(pet);
                            }}
                            className="w-full text-left px-5 py-3 rounded-2xl hover:bg-brand-primary/10 group transition-all flex justify-between items-center border-b border-gray-50 dark:border-gray-800 last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <PetAvatar pet={pet} className="h-10 w-10 border border-slate-100 dark:border-gray-700 shadow-sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-900 dark:text-white uppercase text-sm group-hover:text-brand-primary transition-colors truncate">
                                        {pet.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider truncate">
                                        {pet.species || 'Mascota'} • {pet.breed || 'Sin Raza'} • 👤 {pet.owner?.name || 'Sin dueño'}
                                    </p>
                                </div>
                            </div>
                            <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border shrink-0 ml-3 shadow-sm ${
                                pet.species === 'Canino' ? 'bg-blue-100 text-blue-600 border-blue-200' : 
                                pet.species === 'Felino' ? 'bg-amber-100 text-amber-600 border-amber-200' : 
                                'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                                Seleccionar
                            </span>
                        </button>
                    ))}
                </div>
            )}
            
            {query.length > 2 && results.length === 0 && !isSearching && (
                 <div className="absolute z-10 w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-lg p-6 text-center">
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase">No se encontraron resultados</p>
                    <p className="text-[10px] text-slate-400 mt-1">Intenta buscar por otro nombre o verifica la ortografía.</p>
                 </div>
            )}
        </div>
    );
}
