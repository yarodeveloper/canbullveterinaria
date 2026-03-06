const fs = require('fs');

try {
    const files = ['resources/js/Pages/MedicalRecords/Create.jsx', 'resources/js/Pages/MedicalRecords/Show.jsx'];

    for (const filePath of files) {
        let content = fs.readFileSync(filePath, 'utf8');

        content = content.replace(/bg-white dark:bg-white/g, 'bg-white');
        content = content.replace(/bg-slate-100 dark:bg-slate-100/g, 'bg-slate-100');
        content = content.replace(/dark:bg-slate-100 dark:bg-slate-900/g, 'dark:bg-slate-900');
        content = content.replace(/dark:bg-slate-100 dark:bg-slate-800/g, 'dark:bg-slate-800');
        content = content.replace(/text-slate-700 dark:text-slate-700 dark:text-slate-300/g, 'text-slate-700 dark:text-slate-300');
        content = content.replace(/border-slate-300 dark:border-slate-200/g, 'border-slate-200');
        content = content.replace(/border-slate-300 dark:border-slate-300 dark:border-slate-700/g, 'border-slate-300 dark:border-slate-700');
        content = content.replace(/border-slate-300 dark:border-slate-300 dark:border-slate-800/g, 'border-slate-300 dark:border-slate-800');
        content = content.replace(/text-slate-500 dark:text-slate-500 dark:text-slate-400/g, 'text-slate-500 dark:text-slate-400');
        content = content.replace(/text-slate-800 dark:text-slate-800 dark:text-slate-200/g, 'text-slate-800 dark:text-slate-200');
        content = content.replace(/text-slate-900 dark:text-slate-900 dark:text-white/g, 'text-slate-900 dark:text-white');
        content = content.replace(/text-slate-900 dark:text-slate-900 dark:text-slate-100/g, 'text-slate-900 dark:text-slate-100');
        content = content.replace(/dark:border-slate-500 dark:border-slate-700/g, 'dark:border-slate-700');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully cleaned ' + filePath);
    }
} catch (e) { console.error(e); process.exit(1); }
