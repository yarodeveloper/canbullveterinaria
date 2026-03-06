const fs = require('fs');

try {
    const files = ['resources/js/Pages/MedicalRecords/Create.jsx', 'resources/js/Pages/MedicalRecords/Show.jsx'];

    for (const filePath of files) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Backgrounds
        content = content.replace(/bg-slate-50\sdark:bg-\[\#111822\]/g, 'bg-[#111822]');
        content = content.replace(/bg-\[\#111822\]/g, 'bg-slate-50 dark:bg-[#111822]');
        content = content.replace(/bg-\[\#1B2132\]/g, 'bg-white dark:bg-[#1B2132]');
        content = content.replace(/bg-slate-950\/50/g, 'bg-white dark:bg-slate-950/50');
        content = content.replace(/bg-slate-900\/50/g, 'bg-slate-100 dark:bg-slate-900/50');
        content = content.replace(/bg-slate-900\/30/g, 'bg-slate-100 dark:bg-slate-900/30');
        content = content.replace(/bg-slate-800\/80/g, 'bg-white/80 dark:bg-slate-800/80');

        // Pill selector pattern
        content = content.replace(/'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'/g, "'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'");

        // Text colors
        content = content.replace(/text-slate-300/g, 'text-slate-700 dark:text-slate-300');
        content = content.replace(/text-slate-200/g, 'text-slate-800 dark:text-slate-200');
        content = content.replace(/text-slate-100/g, 'text-slate-900 dark:text-slate-100');

        // Headers specifically having text-white
        content = content.replace(/text-white tracking-tight/g, 'text-slate-900 dark:text-white tracking-tight');
        content = content.replace(/text-white leading-tight/g, 'text-slate-900 dark:text-white leading-tight');

        // Additional backgrounds
        content = content.replace(/bg-slate-800\b/g, 'bg-slate-100 dark:bg-slate-800');
        content = content.replace(/bg-slate-900\b/g, 'bg-slate-100 dark:bg-slate-900');

        // Borders
        content = content.replace(/\bborder-slate-800\b/g, 'border-slate-300 dark:border-slate-800');
        content = content.replace(/\bborder-slate-700\b/g, 'border-slate-300 dark:border-slate-700');
        content = content.replace(/border-slate-700\/50/g, 'border-slate-200 dark:border-slate-700/50');

        // Slate 400 and Slate 500
        content = content.replace(/\btext-slate-400\b/g, 'text-slate-500 dark:text-slate-400');

        // Fix print styles that got text-slate-XYZ replacements
        content = content.replace(/\.text-slate-700\sdark:text-slate-300,\s\.text-slate-800\sdark:text-slate-200,\s\.text-slate-500\sdark:text-slate-400/g, '.text-slate-700, .text-slate-300, .text-slate-200, .text-slate-400');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully processed ' + filePath);
    }
} catch (e) { console.error(e); process.exit(1); }
