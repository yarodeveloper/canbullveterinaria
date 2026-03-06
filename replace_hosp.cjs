const fs = require('fs');

try {
    const files = [
        'resources/js/Pages/Hospitalizations/Show.jsx',
        'resources/js/Pages/Hospitalizations/Create.jsx',
        'resources/js/Pages/Hospitalizations/Index.jsx'
    ];

    for (const filePath of files) {
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, 'utf8');

        // Premium backgrounds
        content = content.replace(/bg-gray-50 dark:bg-gray-900/g, 'bg-slate-50 dark:bg-[#111822]');
        content = content.replace(/bg-gray-50 dark:bg-gray-800/g, 'bg-slate-50 dark:bg-[#1B2132]');
        content = content.replace(/bg-white dark:bg-gray-800/g, 'bg-white dark:bg-[#1B2132]');
        content = content.replace(/bg-white dark:bg-gray-900\/20/g, 'bg-slate-50 dark:bg-slate-900/20');
        content = content.replace(/bg-gray-50 dark:bg-gray-900\/50/g, 'bg-slate-100 dark:bg-slate-900/50');
        content = content.replace(/bg-gray-50 dark:bg-gray-900\/30/g, 'bg-slate-100 dark:bg-slate-900/30');

        // Texts
        content = content.replace(/text-gray-900 dark:text-white/g, 'text-slate-900 dark:text-white');
        content = content.replace(/text-gray-800 dark:text-gray-200/g, 'text-slate-800 dark:text-slate-200');
        content = content.replace(/text-gray-700 dark:text-gray-300/g, 'text-slate-700 dark:text-slate-300');
        content = content.replace(/text-gray-600 dark:text-gray-400/g, 'text-slate-600 dark:text-slate-400');
        content = content.replace(/text-gray-400/g, 'text-slate-500 dark:text-slate-400');

        // Borders
        content = content.replace(/border-gray-200 dark:border-gray-700/g, 'border-slate-300 dark:border-slate-700');
        content = content.replace(/border-gray-100 dark:border-gray-700/g, 'border-slate-200 dark:border-slate-700/50');
        content = content.replace(/border-gray-50 dark:border-gray-700/g, 'border-slate-200 dark:border-slate-700/50');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully processed ' + filePath);
    }
} catch (e) { console.error(e); process.exit(1); }
