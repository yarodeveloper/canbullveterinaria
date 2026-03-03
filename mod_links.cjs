const fs = require('fs');

// Patch Pets/Show.jsx
let petsShow = fs.readFileSync('resources/js/Pages/Pets/Show.jsx', 'utf8');
petsShow = petsShow.replace('VIEW FULL SOAP <IconEye className="w-3 h-3" />\n                        </Link>\n                    )}',
    `VIEW FULL SOAP <IconEye className="w-3 h-3" />
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
                    )}`);
fs.writeFileSync('resources/js/Pages/Pets/Show.jsx', petsShow);

// Patch Hospitalizations/Show.jsx to link to surgeries
let hospShow = fs.readFileSync('resources/js/Pages/Hospitalizations/Show.jsx', 'utf8');
let newSidebarHospActions = `                            <div className="bg-brand-primary p-8 rounded-3xl text-white shadow-xl shadow-primary-100">
                                <h4 className="font-black text-lg mb-4">Información Dueño</h4>`;
let hospReplaced = `<div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 mb-8">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Historial Quirúrgico</h3>
                                {hospitalization.pet.surgeries && hospitalization.pet.surgeries.length > 0 ? (
                                    <div className="space-y-3">
                                        {hospitalization.pet.surgeries.map(s => (
                                            <Link key={s.id} href={route('surgeries.show', s.id)} className="block p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                                <p className="font-bold text-xs text-brand-primary">{s.surgery_type}</p>
                                                <p className="text-[10px] text-gray-500">{new Date(s.scheduled_date).toLocaleDateString()}</p>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">No hay cirugías registradas.</p>
                                )}
                            </div>

                            <div className="bg-brand-primary p-8 rounded-3xl text-white shadow-xl shadow-primary-100">
                                <h4 className="font-black text-lg mb-4">Información Dueño</h4>`;
hospShow = hospShow.replace(newSidebarHospActions, hospReplaced);
fs.writeFileSync('resources/js/Pages/Hospitalizations/Show.jsx', hospShow);

// Patch Surgeries/Show.jsx to link to hospitalizations
let surgShow = fs.readFileSync('resources/js/Pages/Surgeries/Show.jsx', 'utf8');
let surgSearchStr = `                                            <Link
                                                href={route('hospitalizations.create', { pet_id: surgery.pet.id })}
                                                className="block w-full text-center py-4 bg-teal-100 text-teal-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-700 hover:text-white transition"
                                            >
                                                Dar de Alta y Pasar a Hospitalización
                                            </Link>`;
let surgReplaceStr = `                                            {surgery.pet.hospitalizations && surgery.pet.hospitalizations.length > 0 && surgery.pet.hospitalizations[0].status === 'active' ? (
                                                <Link
                                                    href={route('hospitalizations.show', surgery.pet.hospitalizations[0].id)}
                                                    className="block w-full text-center py-4 bg-teal-100 text-teal-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-700 hover:text-white transition"
                                                >
                                                    ➡️ Ver Kardex Hosp. Activo
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={route('hospitalizations.create', { pet_id: surgery.pet.id })}
                                                    className="block w-full text-center py-4 bg-teal-100 text-teal-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-700 hover:text-white transition"
                                                >
                                                    Dar de Alta y Pasar a Hospitalización
                                                </Link>
                                            )}`;
surgShow = surgShow.replace(surgSearchStr, surgReplaceStr);
fs.writeFileSync('resources/js/Pages/Surgeries/Show.jsx', surgShow);
