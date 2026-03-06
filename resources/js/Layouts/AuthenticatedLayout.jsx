import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, Head } from '@inertiajs/react';
import { useState } from 'react';
import DarkModeToggle from '@/Components/DarkModeToggle';
import ThemeProvider from '@/Components/ThemeProvider';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, settings } = usePage().props;
    const user = auth.user;
    const permissions = auth.permissions || [];

    const can = (permission) => permissions.includes(permission) || user.role === 'admin';

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <ThemeProvider>
            <Head>
                {settings?.site_favicon && (
                    <link
                        rel="icon"
                        href={settings.site_favicon.startsWith('/') ? settings.site_favicon : '/' + settings.site_favicon}
                    />
                )}
            </Head>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                <nav className="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <div className="h-1 bg-brand-primary"></div>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/">
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                    </Link>
                                </div>

                                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                    <NavLink
                                        href={route('dashboard')}
                                        active={route().current('dashboard')}
                                    >
                                        Dashboard
                                    </NavLink>
                                    <NavLink
                                        href={route('pets.index')}
                                        active={route().current('pets.*')}
                                    >
                                        Mascotas
                                    </NavLink>
                                    <NavLink
                                        href={route('clients.index')}
                                        active={route().current('clients.*')}
                                    >
                                        Clientes
                                    </NavLink>
                                    <NavLink
                                        href={route('appointments.index')}
                                        active={route().current('appointments.*')}
                                    >
                                        Agenda
                                    </NavLink>
                                    <NavLink
                                        href={route('hospitalizations.index')}
                                        active={route().current('hospitalizations.*')}
                                    >
                                        Hospitalización
                                    </NavLink>
                                    <NavLink
                                        href={route('surgeries.index')}
                                        active={route().current('surgeries.*')}
                                    >
                                        Cirugías
                                    </NavLink>
                                    <NavLink
                                        href={route('inventory.index')}
                                        active={route().current('inventory.*')}
                                    >
                                        Inventario
                                    </NavLink>
                                    {can('manage finances') && (
                                        <>
                                            <NavLink
                                                href={route('cash-register.index')}
                                                active={route().current('cash-register.*')}
                                            >
                                                Turno Caja
                                            </NavLink>
                                            <NavLink
                                                href={route('receipts.create')}
                                                active={route().current('receipts.*')}
                                            >
                                                PDV
                                            </NavLink>
                                            <NavLink
                                                href={route('cash.index')}
                                                active={route().current('cash.*')}
                                            >
                                                Egresos Extras
                                            </NavLink>
                                        </>
                                    )}

                                    {can('manage settings') && (
                                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                            <div className="relative">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <span className="inline-flex rounded-md">
                                                            <button
                                                                type="button"
                                                                className={`inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300 ${route().current('breeds.*') ? 'text-brand-primary dark:text-brand-primary' : ''}`}
                                                            >
                                                                Configuración
                                                                <svg
                                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content width="48" contentClasses="py-1 bg-white dark:bg-gray-800">
                                                        <div className="block px-4 py-2 text-xs text-gray-400 uppercase tracking-widest">
                                                            Catálogos
                                                        </div>
                                                        <Dropdown.Link href={route('breeds.index')}>
                                                            Razas y Especies
                                                        </Dropdown.Link>
                                                        <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                                        <div className="block px-4 py-2 text-xs text-gray-400 uppercase tracking-widest">
                                                            Sistema
                                                        </div>
                                                        <Dropdown.Link href={route('staff.index')}>
                                                            Gestión de Personal
                                                        </Dropdown.Link>
                                                        <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                                        <div className="block px-4 py-2 text-xs text-gray-400 uppercase tracking-widest">
                                                            Página Web
                                                        </div>
                                                        <Dropdown.Link href={route('settings.web.index')}>
                                                            Contenido Landing
                                                        </Dropdown.Link>
                                                        <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                                        <div className="block px-4 py-2 text-xs text-gray-400 uppercase tracking-widest">
                                                            Clínica
                                                        </div>
                                                        <Dropdown.Link href={route('document-templates.index')}>
                                                            Documentos Legales
                                                        </Dropdown.Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center space-x-3">
                                <DarkModeToggle />
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                                >
                                                    <div className="flex flex-col items-end mr-2">
                                                        <span className="font-black text-gray-900 dark:text-gray-100">{user.name}</span>
                                                        {user.branch && (
                                                            <span className="text-[9px] font-black uppercase text-brand-primary tracking-widest leading-none mt-1">
                                                                📍 {user.branch.name}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <svg
                                                        className="-me-0.5 ms-2 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link
                                                href={route('profile.edit')}
                                            >
                                                Profile
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            <div className="-me-2 flex items-center sm:hidden space-x-2">
                                <DarkModeToggle />
                                <button
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState,
                                        )
                                    }
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            className={
                                                !showingNavigationDropdown
                                                    ? 'inline-flex'
                                                    : 'hidden'
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={
                                                showingNavigationDropdown
                                                    ? 'inline-flex'
                                                    : 'hidden'
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className={
                            (showingNavigationDropdown ? 'block' : 'hidden') +
                            ' sm:hidden'
                        }
                    >
                        <div className="space-y-1 pb-3 pt-2">
                            <ResponsiveNavLink
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                            >
                                Dashboard
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('pets.index')}
                                active={route().current('pets.*')}
                            >
                                Mascotas
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('clients.index')}
                                active={route().current('clients.*')}
                            >
                                Clientes
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('appointments.index')}
                                active={route().current('appointments.*')}
                            >
                                Agenda
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('hospitalizations.index')}
                                active={route().current('hospitalizations.*')}
                            >
                                Hospitalización
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('surgeries.index')}
                                active={route().current('surgeries.*')}
                            >
                                Cirugías
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('inventory.index')}
                                active={route().current('inventory.*')}
                            >
                                Inventario
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('cash-register.index')}
                                active={route().current('cash-register.*')}
                            >
                                Turno Caja
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('receipts.create')}
                                active={route().current('receipts.*')}
                            >
                                PDV
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('cash.index')}
                                active={route().current('cash.*')}
                            >
                                Egresos Extras
                            </ResponsiveNavLink>
                        </div>

                        <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                            <div className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Configuración
                            </div>
                            <div className="mt-2 space-y-1">
                                <ResponsiveNavLink
                                    href={route('breeds.index')}
                                    active={route().current('breeds.*')}
                                >
                                    Razas y Especies
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('settings.web.index')}
                                    active={route().current('settings.web.*')}
                                >
                                    Contenido Landing
                                </ResponsiveNavLink>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    {user.email}
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>
                                    Profile
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                >
                                    Log Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                {header && (
                    <header className="bg-white shadow dark:bg-gray-800">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main>{children}</main>
            </div>
        </ThemeProvider>
    );
}
