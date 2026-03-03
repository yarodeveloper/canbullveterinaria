const fs = require('fs');

let content = fs.readFileSync('resources/js/Pages/Pets/Show.jsx', 'utf8');

// Replace badge labels
content = content.replace(/let title = "General Health Checkup \(SOAP\)";/, 'let title = "Consulta Médica General";');
content = content.replace(/let badgeType = event\.type \|\| "CONSULTATION";/, 'let badgeType = event.type || "CONSULTA";');
content = content.replace(/let doctor = event\.veterinarian\?\.name \|\| event\.lead_surgeon\?\.name \|\| "Unknown";/, 'let doctor = event.veterinarian?.name || event.lead_surgeon?.name || "Desconocido";');

content = content.replace(/title = event\.name \|\| "Vaccine";/, 'title = event.name || "Vacunación";');
content = content.replace(/badgeType = event\.type \|\| "VACCINATION";/, 'badgeType = event.type || "PREVENTIVO";');

content = content.replace(/title = event\.surgery_type \|\| "Surgery";/, 'title = event.surgery_type || "Cirugía";');
content = content.replace(/badgeType = "SURGERY";/, 'badgeType = "CIRUGÍA";');

content = content.replace(/badgeType = "HOSPITALIZATION";/, 'badgeType = "HOSPITALIZACIÓN";');

// Replace the links block using regex to avoid CRLF issues
const oldLinkRegex = /\{event\.timeline_type === "consultation" && \([\s\S]*?VIEW FULL SOAP <IconEye className="w-3 h-3" \/>\s*<\/Link>\s*\)\}/m;

const newLinks = `{event.timeline_type === "consultation" && (
                        <Link href={route("medical-records.show", event.id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 transition">
                            VER DETALLES <IconEye className="w-3 h-3" />
                        </Link>
                    )}
                    {event.timeline_type === "surgery" && (
                        <Link href={route("surgeries.show", event.id)} className="text-xs font-bold text-purple-600 hover:text-purple-800 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1 transition">
                            VER DETALLES <IconEye className="w-3 h-3" />
                        </Link>
                    )}
                    {event.timeline_type === "hospitalization" && (
                        <Link href={route("hospitalizations.show", event.id)} className="text-xs font-bold text-teal-600 hover:text-teal-800 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1 transition">
                            VER KARDEX <IconEye className="w-3 h-3" />
                        </Link>
                    )}`;

content = content.replace(oldLinkRegex, newLinks);

fs.writeFileSync('resources/js/Pages/Pets/Show.jsx', content);

// Hospitalization link back to pet
let hospContent = fs.readFileSync('resources/js/Pages/Hospitalizations/Show.jsx', 'utf8');
hospContent = hospContent.replace(
    /<h1 className="text-4xl font-black text-gray-900 dark:text-white">\{hospitalization\.pet\.name\}<\/h1>/,
    `<Link href={route('pets.show', hospitalization.pet.id)} className="hover:text-brand-primary transition-colors cursor-pointer"><h1 className="text-4xl font-black text-gray-900 dark:text-white hover:text-brand-primary transition-colors">{hospitalization.pet.name}</h1></Link>`
);
fs.writeFileSync('resources/js/Pages/Hospitalizations/Show.jsx', hospContent);

// Surgery link back to pet
let surgContent = fs.readFileSync('resources/js/Pages/Surgeries/Show.jsx', 'utf8');
surgContent = surgContent.replace(
    /<h1 className="text-4xl font-black text-gray-900 dark:text-white">\{surgery\.pet\.name\}<\/h1>/,
    `<Link href={route('pets.show', surgery.pet.id)} className="hover:text-brand-primary transition-colors cursor-pointer"><h1 className="text-4xl font-black text-gray-900 dark:text-white hover:text-brand-primary transition-colors">{surgery.pet.name}</h1></Link>`
);
fs.writeFileSync('resources/js/Pages/Surgeries/Show.jsx', surgContent);
