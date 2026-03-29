import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <div className="px-2 py-0.5">
            <Link
                {...props}
                className={`flex w-full items-center p-3 rounded-xl transition duration-150 ease-in-out focus:outline-none ${active
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[0.98]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    } text-[10px] font-black uppercase tracking-[0.2em] ${className}`}
            >
                {children}
            </Link>
        </div>
    );
}
