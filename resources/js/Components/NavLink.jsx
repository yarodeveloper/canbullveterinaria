import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-4 py-4 text-[11px] font-black tracking-tight transition duration-150 ease-in-out focus:outline-none border-b-2 ' +
                (active
                    ? 'text-brand-primary border-brand-primary'
                    : 'text-slate-500 hover:text-slate-900 border-transparent dark:text-slate-400 dark:hover:text-white') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
