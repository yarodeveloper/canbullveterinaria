import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    primary: 'var(--color-primary)',
                    secondary: 'var(--color-secondary)',
                    accent: 'var(--color-accent)',
                    purple: '#84329B',
                    yellow: '#C4D600',
                }
            },
            borderColor: {
                // Color por defecto cuando usas 'border' sin especificar color
                // Antes: gray-200 (#e5e7eb) — casi invisible en light mode
                // Ahora: slate-300 (#cbd5e1) — claramente visible pero elegante
                DEFAULT: '#cbd5e1',
            },
        },
    },

    plugins: [forms],
};
