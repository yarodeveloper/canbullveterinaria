const fs = require('fs');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Backgrounds
    content = content.replace(/bg-\[\#111822\]/g, 'bg-slate-50 dark:bg-[#111822]');
    content = content.replace(/bg-\[\#1B2132\]/g, 'bg-white dark:bg-[#1B2132]');
    content = content.replace(/bg-slate-950\/50/g, 'bg-white dark:bg-slate-950/50');
    content = content.replace(/bg-slate-900\/50/g, 'bg-slate-100 dark:bg-slate-900/50');
    content = content.replace(/bg-slate-900\/30/g, 'bg-slate-100 dark:bg-slate-900/30');
    content = content.replace(/bg-slate-800\/80/g, 'bg-white/80 dark:bg-slate-800/80');

    // Pill selector fix in Create.jsx
    content = content.replace(/'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'/g, "'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'");

    // Text colors
    content = content.replace(/text-slate-300/g, 'text-slate-700 dark:text-slate-300');
    content = content.replace(/text-slate-200/g, 'text-slate-800 dark:text-slate-200');
    content = content.replace(/text-slate-100/g, 'text-slate-900 dark:text-slate-100');

    // Instead of replacing all text-white, let's target specific instances: "text-white tracking-tight" (headers)
    content = content.replace(/text-white tracking-tight/g, 'text-slate-900 dark:text-white tracking-tight');
    content = content.replace(/text-white leading-tight/g, 'text-slate-900 dark:text-white leading-tight');

    // Borders
    content = content.replace(/\bborder-slate-800\b/g, 'border-slate-300 dark:border-slate-800');
    content = content.replace(/\bborder-slate-700\b/g, 'border-slate-300 dark:border-slate-700');
    content = content.replace(/border-slate-700\/50/g, 'border-slate-200 dark:border-slate-700/50');

    // Slates 400
    content = content.replace(/\btext-slate-400\b/g, 'text-slate-500 dark:text-slate-400');

    fs.writeFileSync(filePath, content, 'utf8');
}

processFile('resources/js/Pages/MedicalRecords/Create.jsx');
processFile('resources/js/Pages/MedicalRecords/Show.jsx');

console.log('Done replacement.');
