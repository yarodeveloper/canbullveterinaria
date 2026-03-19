import { Head, Link } from '@inertiajs/react';
import ThemeProvider from '@/Components/ThemeProvider';

export default function Error({ status }) {
    const title = {
        503: 'Servicio no Disponible',
        500: 'Error del Servidor',
        404: 'Página no Encontrada',
        403: 'Acceso Denegado',
    }[status] || 'Ha ocurrido un error';

    const description = {
        503: 'Lo sentimos, estamos realizando mantenimiento al sistema. Por favor intenta más tarde.',
        500: 'Ups, algo salió mal en nuestros servidores. Ya estamos trabajando en ello.',
        404: 'Lo sentimos, la página que estás buscando no existe o fue movida.',
        403: 'No tienes los permisos necesarios para acceder a esta sección.',
    }[status] || 'Ha ocurrido un error inesperado.';

    const iconPath = {
        503: '/icons/wrench-svgrepo-com.svg',
        500: '/icons/rocket-svgrepo-com.svg',
        404: '/icons/magnifying-glass-svgrepo-com.svg',
        403: '/icons/delete-svgrepo-com.svg',
    }[status] || '/icons/bell-svgrepo-com.svg';

    return (
        <ThemeProvider>
            <Head title={title} />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full text-center space-y-8 p-10 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl shadow-brand-primary/10 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-center mb-2">
                        <div className="w-28 h-28 bg-brand-primary/5 rounded-full flex items-center justify-center shadow-inner border border-brand-primary/10 overflow-hidden p-6">
                            <img src={iconPath} alt="Error Icon" className="w-full h-full object-contain icon-adaptive opacity-80" />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-brand-primary font-headings uppercase tracking-tighter">
                            {title}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {description}
                        </p>
                    </div>

                    <div className="pt-6">
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center justify-center w-full px-6 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-primary/90 transition shadow-lg shadow-brand-primary/30"
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Volver al Inicio
                        </Link>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
