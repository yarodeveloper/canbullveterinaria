import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links, className = "" }) {
    if (links.length <= 3) return null;

    return (
        <div className={`flex flex-wrap justify-center gap-1.5 ${className}`}>
            {links.map((link, key) => {
                const isActive = link.active;
                const isDisabled = !link.url;

                return (
                    <Link
                        key={key}
                        href={link.url || '#'}
                        className={`
                            inline-flex items-center justify-center px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl border
                            ${isActive 
                                ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20 scale-105 z-10' 
                                : isDisabled 
                                    ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800 cursor-not-allowed' 
                                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-primary hover:text-brand-primary active:scale-95'
                            }
                        `}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        onClick={(e) => {
                            if (isDisabled || isActive) {
                                e.preventDefault();
                            }
                        }}
                    />
                );
            })}
        </div>
    );
}
