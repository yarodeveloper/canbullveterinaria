import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, Head, router } from '@inertiajs/react';
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
    const [showSwitchToast, setShowSwitchToast] = useState(false);

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
                <nav className="border-b border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800 print:hidden">
                    <div className="h-1 bg-brand-primary"></div>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/">
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                    </Link>
                                </div>

                                <div className="hidden sm:-my-px sm:ms-6 sm:flex items-center gap-1.5">
                                    <NavLink
                                        href={route('dashboard')}
                                        active={route().current('dashboard')}
                                    >
                                        <img src="/icons/imac-svgrepo-com.svg" className="w-4 h-4 mr-2.5 icon-adaptive" alt="" />
                                        Dashboard
                                    </NavLink>
                                    <NavLink
                                        href={route('pets.index')}
                                        active={route().current('pets.*')}
                                    >
                                        <img src="/icons/pet-svgrepo-com.svg" className="w-4 h-4 mr-2.5 icon-adaptive" alt="" />
                                        Mascotas
                                    </NavLink>
                                    <NavLink
                                        href={route('clients.index')}
                                        active={route().current('clients.*')}
                                    >
                                        <img src="/icons/woman-svgrepo-com.svg" className="w-4 h-4 mr-2.5 icon-adaptive" alt="" />
                                        Clientes
                                    </NavLink>
                                    <NavLink
                                        href={route('receipts.create')}
                                        active={route().current('receipts.*')}
                                    >
                                        <img src="/icons/shop-svgrepo-com.svg" className="w-4 h-4 mr-2.5 icon-adaptive" alt="" />
                                        PDV
                                    </NavLink>

                                    {/* Submenu Procedimientos */}
                                    <div className="hidden sm:ms-0 sm:flex sm:items-center">
                                        <div className="relative">
                                            <Dropdown trigger="hover">
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className={`inline-flex items-center px-4 py-4 text-[11px] font-black tracking-tight transition duration-150 ease-in-out focus:outline-none border-b-2 ${
                                                                route().current('medical-records.*') || 
                                                                route().current('hospitalizations.*') || 
                                                                route().current('surgeries.*') || 
                                                                route().current('euthanasias.*') ||
                                                                route().current('grooming-orders.*')
                                                                ? 'text-brand-primary border-brand-primary' 
                                                                : 'text-slate-500 hover:text-slate-900 border-transparent dark:text-slate-400 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            <img src="/icons/vet-with-cat-svgrepo-com.svg" className="w-4 h-4 mr-2.5 icon-adaptive" alt="" />
                                                            Procedimientos
                                                            <svg className="-me-1 ms-1.5 h-3.5 w-3.5 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content width="56" contentClasses="py-1 bg-white dark:bg-gray-800">
                                                    <Dropdown.Link href={route('medical-records.index')}>
                                                        <div className="flex items-center">
                                                            <img src="/icons/vet-with-cat-svgrepo-com.svg" className="w-4 h-4 mr-3 icon-adaptive opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                                            <span className="font-bold">Consultas Médicas</span>
                                                        </div>
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('grooming-orders.index')}>
                                                        <div className="flex items-center">
                                                            <img src="/icons/scissors-svgrepo-com.svg" className="w-4 h-4 mr-3 icon-adaptive opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                                            <span className="font-bold">Estética y Grooming</span>
                                                        </div>
                                                    </Dropdown.Link>
                                                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                                    {can('view hospitalizations') && (
                                                        <Dropdown.Link href={route('hospitalizations.index')}>
                                                            <div className="flex items-center">
                                                                <img src="/icons/med-kit-svgrepo-com.svg" className="w-4 h-4 mr-3 icon-adaptive opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                                                <span className="font-bold">Hospitalización</span>
                                                            </div>
                                                        </Dropdown.Link>
                                                    )}
                                                    {can('view surgeries') && (
                                                        <Dropdown.Link href={route('surgeries.index')}>
                                                            <div className="flex items-center">
                                                                <img src="/icons/band-aid-svgrepo-com.svg" className="w-4 h-4 mr-3 icon-adaptive opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                                                <span className="font-bold">Cirugías</span>
                                                            </div>
                                                        </Dropdown.Link>
                                                    )}
                                                    {can('view euthanasias') && (
                                                        <Dropdown.Link href={route('euthanasias.index')}>
                                                            <div className="flex items-center">
                                                                <img src="/icons/leaf-svgrepo-com.svg" className="w-4 h-4 mr-3 icon-adaptive opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                                                <span className="font-bold">Eutanasia</span>
                                                            </div>
                                                        </Dropdown.Link>
                                                    )}
                                                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                                    <Dropdown.Link href={route('preventive-records.index')}>
                                                        <div className="flex items-center">
                                                            <img src="/icons/medicine-bottle-drug-svgrepo-com.svg" className="w-4 h-4 mr-3 icon-adaptive opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                                            <span className="font-bold text-brand-primary">Salud Preventiva</span>
                                                        </div>
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    </div>

                                    <NavLink
                                        href={route('appointments.index')}
                                        active={route().current('appointments.*')}
                                    >
                                        <img src="/icons/calendar-svgrepo-com.svg" className="w-4 h-4 mr-2.5 icon-adaptive" alt="" />
                                        Agenda
                                    </NavLink>

                                    <div className="hidden sm:ms-0 sm:flex sm:items-center">
                                        <div className="relative">
                                            <Dropdown trigger="hover">
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className={`inline-flex items-center px-4 py-4 text-[11px] font-black tracking-tight transition duration-150 ease-in-out focus:outline-none border-b-2 ${
                                                                route().current('inventory.*') 
                                                                ? 'text-brand-primary border-brand-primary' 
                                                                : 'text-slate-500 hover:text-slate-900 border-transparent dark:text-slate-400 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            <img src="/icons/box-svgrepo-com.svg" className="w-4 h-4 mr-2.5 icon-adaptive shadow-sm" alt="" />
                                                            Inventario
                                                            <svg className="-me-1 ms-1.5 h-3.5 w-3.5 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content width="56" contentClasses="py-1 bg-white dark:bg-gray-800">
                                                    <Dropdown.Link href={route('inventory.index')}>
                                                        <div className="flex items-center">
                                                            <img src="/icons/box-svgrepo-com.svg" className="w-4 h-4 mr-3 icon-adaptive opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                                            <span className="font-bold">Inventario y Farmacia</span>
                                                        </div>
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('inventory.audit')}>
                                                        <div className="flex items-center">
                                                            <img src="/icons/eye-svgrepo-com.svg" className="w-4 h-4 mr-3 icon-adaptive opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                                            <span className="font-bold">Auditoría / Conteo</span>
                                                        </div>
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('inventory.movements')}>
                                                        <div className="flex items-center">
                                                            <img src="/icons/pill-svgrepo-com.svg" className="w-4 h-4 mr-3 icon-adaptive opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                                            <span className="font-bold">Movimientos</span>
                                                        </div>
                                                    </Dropdown.Link>
                                                    {user.role === 'admin' && (
                                                        <>
                                                            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                                            <Dropdown.Link href={route('reports.stock-by-branch')}>
                                                                <div className="flex items-center">
                                                                    <img src="/icons/address-svgrepo-com.svg" className="w-4 h-4 mr-3 icon-adaptive opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                                                    <span className="font-bold text-amber-600 dark:text-amber-400">Stock por Sucursal</span>
                                                                </div>
                                                            </Dropdown.Link>
                                                        </>
                                                    )}
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    </div>
                                    
                                    {can('manage finances') && (
                                        <div className="hidden sm:ms-0 sm:flex sm:items-center">
                                            <div className="relative">
                                                <Dropdown trigger="hover">
                                                    <Dropdown.Trigger>
                                                        <span className="inline-flex rounded-md">
                                                            <button
                                                                type="button"
                                                                className={`inline-flex items-center px-4 py-4 text-[11px] font-black tracking-tight transition duration-150 ease-in-out focus:outline-none border-b-2 ${
                                                                    route().current('cash-register.*') || route().current('cash.*') 
                                                                    ? 'text-brand-primary border-brand-primary' 
                                                                    : 'text-slate-500 hover:text-slate-900 border-transparent dark:text-slate-400 dark:hover:text-white'
                                                                }`}
                                                            >
                                                                <img src="/icons/bank-svgrepo-com.svg" className="w-4 h-4 mr-2.5 icon-adaptive shadow-sm" alt="" />
                                                                Finanzas
                                                                <svg className="-me-1 ms-1.5 h-3.5 w-3.5 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content width="48" contentClasses="py-1 bg-white dark:bg-gray-800">
                                                        <Dropdown.Link href={route('cash-register.index')}>
                                                            <div className="flex items-center">
                                                                <img src="/icons/bank-svgrepo-com.svg" className="w-4 h-4 mr-3 icon-adaptive opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                                                <span className="font-bold">Cierres de Caja</span>
                                                            </div>
                                                        </Dropdown.Link>
                                                        <Dropdown.Link href={route('cash.index')}>
                                                            <div className="flex items-center">
                                                                <img src="/icons/price-tag-svgrepo-com.svg" className="w-4 h-4 mr-3 icon-adaptive opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                                                <span className="font-bold">Egresos Extras</span>
                                                            </div>
                                                        </Dropdown.Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </div>
                                        </div>
                                    )}



                                    {can('manage settings') && (
                                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                            <div className="relative">
                                                <Dropdown trigger="hover">
                                                    <Dropdown.Trigger>
                                                        <span className="inline-flex rounded-md">
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center rounded-xl px-2 py-2.5 text-slate-500 transition duration-150 ease-in-out hover:bg-slate-100/80 hover:text-slate-900 focus:outline-none dark:bg-gray-800 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
                                                            >
                                                                <img src="/icons/set-up-svgrepo-com.svg" className="w-4 h-4 icon-adaptive opacity-60 group-hover:opacity-100 transition-opacity" alt="Configuración" />
                                                                <svg className="ms-1 h-3 w-3 opacity-30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content width="56" contentClasses="py-1 bg-white dark:bg-gray-800">
                                                        <div className="block px-4 py-2 text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                                            Catálogos
                                                        </div>
                                                        <Dropdown.Link href={route('breeds.index')}>
                                                            Razas y Especies
                                                        </Dropdown.Link>
                                                        <Dropdown.Link href={route('health-protocols.index')}>
                                                            Vacunas y Tratamientos
                                                        </Dropdown.Link>
                                                        {user.role === 'admin' && (
                                                            <Dropdown.Link href={route('product-categories.index')}>
                                                                Categorías
                                                            </Dropdown.Link>
                                                        )}
                                                        <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                                        <div className="block px-4 py-2 text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                                            Sistema
                                                        </div>
                                                        <Dropdown.Link href={route('staff.index')}>
                                                            Gestión de Personal
                                                        </Dropdown.Link>
                                                        <Dropdown.Link href={route('roles.index')}>
                                                            Roles y Permisos
                                                        </Dropdown.Link>
                                                        {user.role === 'admin' && (
                                                            <Dropdown.Link href={route('branches.index')}>
                                                                Gestión de Sucursales
                                                            </Dropdown.Link>
                                                        )}
                                                        <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                                        <div className="block px-4 py-2 text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                                            Página Web
                                                        </div>
                                                        <Dropdown.Link href={route('settings.web.index')}>
                                                            Contenido Landing
                                                        </Dropdown.Link>
                                                        <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                                        <div className="block px-4 py-2 text-[10px] font-black text-brand-primary uppercase tracking-widest">
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
                                {user.role === 'admin' && usePage().props.branches?.length > 1 && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border dark:border-slate-700 transition-all shadow-inner">
                                        <img src="/icons/address-svgrepo-com.svg" className="w-3.5 h-3.5 icon-adaptive flex-shrink-0 opacity-50" alt="Sucursal" />
                                        <select 
                                            className="bg-transparent border-none text-[9px] font-black uppercase tracking-tight text-slate-500 dark:text-slate-400 focus:ring-0 p-0 cursor-pointer min-w-[70px] max-w-[100px] truncate"
                                            value={user.branch_id || ''}
                                            onChange={(e) => {
                                                const val = e.target.value || null;
                                                router.post(route('settings.branch-switcher.update'), { 
                                                    branch_id: val 
                                                }, {
                                                    onSuccess: () => {
                                                        setShowSwitchToast(true);
                                                        setTimeout(() => setShowSwitchToast(false), 3000);
                                                    }
                                                });
                                            }}
                                        >
                                            <option value="">{user.branch_id ? '🌍 Vista Global' : '🌍 Todas'}</option>
                                            {usePage().props.branches.map(b => (
                                                <option key={b.id} value={b.id}>📍 {b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Switch Toast */}
                                {showSwitchToast && (
                                    <div className="fixed top-20 right-4 z-50 animate-bounce-short">
                                        <div className="bg-brand-primary text-white px-4 py-2 rounded-full shadow-lg text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                            <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
                                            Entorno Actualizado
                                        </div>
                                    </div>
                                )}
                                <DarkModeToggle />
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-slate-600 transition duration-150 ease-in-out hover:text-slate-900 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                                >
                                                    <div className="flex flex-col items-end mr-1">
                                                        <div className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center overflow-hidden shadow-sm">
                                                                <img src="/icons/pet-round-svgrepo-com.svg" className="w-6 h-6 icon-adaptive" alt="Perfil Admin" />
                                                        </div>
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
                                                Mi Perfil
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                            >
                                                Cerrar Sesión
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
                                        className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 transition duration-150 ease-in-out hover:bg-slate-50 hover:text-slate-700 focus:bg-slate-50 focus:text-slate-700 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
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
                                href={route('receipts.create')}
                                active={route().current('receipts.*')}
                            >
                                PDV
                            </ResponsiveNavLink>

                            <div className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest border-t border-gray-100 dark:border-gray-700 mt-2">
                                Procedimientos
                            </div>
                            <ResponsiveNavLink
                                href={route('medical-records.index')}
                                active={route().current('medical-records.*')}
                            >
                                <img src="/icons/vet-with-cat-svgrepo-com.svg" className="w-4 h-4 mr-2 inline-block icon-adaptive opacity-70" alt="" />
                                Consultas
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('grooming-orders.index')}
                                active={route().current('grooming-orders.*')}
                            >
                                <img src="/icons/scissors-svgrepo-com.svg" className="w-4 h-4 mr-2 inline-block icon-adaptive opacity-70" alt="" />
                                Estética
                            </ResponsiveNavLink>
                            {can('view hospitalizations') && (
                                <ResponsiveNavLink
                                    href={route('hospitalizations.index')}
                                    active={route().current('hospitalizations.*')}
                                >
                                    Hospitalización
                                </ResponsiveNavLink>
                            )}
                            {can('view surgeries') && (
                                <ResponsiveNavLink
                                    href={route('surgeries.index')}
                                    active={route().current('surgeries.*')}
                                >
                                    Cirugías
                                </ResponsiveNavLink>
                            )}
                            {can('view euthanasias') && (
                                <ResponsiveNavLink
                                    href={route('euthanasias.index')}
                                    active={route().current('euthanasias.*')}
                                >
                                    Eutanasia
                                </ResponsiveNavLink>
                            )}

                            <div className="border-t border-gray-100 dark:border-gray-700 mt-2 py-1"></div>
                            <ResponsiveNavLink
                                href={route('appointments.index')}
                                active={route().current('appointments.*')}
                            >
                                Agenda
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
                                href={route('cash.index')}
                                active={route().current('cash.*')}
                            >
                                Egresos Extras
                            </ResponsiveNavLink>

                            {user.role === 'admin' && (
                                <ResponsiveNavLink
                                    href={route('reports.stock-by-branch')}
                                    active={route().current('reports.stock-by-branch')}
                                >
                                    <img src="/icons/address-svgrepo-com.svg" className="w-4 h-4 mr-2.5 inline-block icon-adaptive opacity-70 text-amber-500" alt="" />
                                    Stock por Sucursal
                                </ResponsiveNavLink>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                            <div className="px-4 text-[10px] font-black uppercase tracking-wider text-brand-primary bg-brand-primary/5 py-1">
                                Configuración
                            </div>
                            <div className="mt-2 space-y-1">
                                <ResponsiveNavLink
                                    href={route('breeds.index')}
                                    active={route().current('breeds.*')}
                                >
                                    Razas y Especies
                                </ResponsiveNavLink>
                                {user.role === 'admin' && (
                                    <ResponsiveNavLink
                                        href={route('product-categories.index')}
                                        active={route().current('product-categories.index')}
                                    >
                                        Categorías
                                    </ResponsiveNavLink>
                                )}
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
                                    Mi Perfil
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                >
                                    Cerrar Sesión
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                {header && (
                    <header className="bg-white shadow dark:bg-gray-800 print:hidden">
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
