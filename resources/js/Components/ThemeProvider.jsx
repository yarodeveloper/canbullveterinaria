import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function ThemeProvider({ children }) {
    let settings = {};
    try {
        const page = usePage();
        settings = page?.props?.settings || {};
    } catch (e) {
        // Fallback if usePage is called outside Inertia context
        console.warn('ThemeProvider used outside of Inertia context');
    }

    useEffect(() => {
        const root = document.documentElement;

        // Apply custom colors if they exist in settings
        if (settings?.primary_color) {
            root.style.setProperty('--color-primary', settings.primary_color);
        }
        if (settings?.secondary_color) {
            root.style.setProperty('--color-secondary', settings.secondary_color);
        }
        if (settings?.accent_color) {
            root.style.setProperty('--color-accent', settings.accent_color);
        }

        // Determine if we should allow dark mode (only for authenticated/admin routes)
        // If the path is '/' (landing), we force light mode.
        const isLandingPage = window.location.pathname === '/' || window.location.pathname.startsWith('/carnet/');
        const currentTheme = localStorage.getItem('theme') || settings?.system_theme || 'light';

        if (currentTheme === 'dark' && !isLandingPage) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [settings]);

    return children;
}
