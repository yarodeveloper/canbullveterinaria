const fs = require('fs');
let welcome = fs.readFileSync('resources/js/Pages/Welcome.jsx', 'utf8');

// The chunk we are targeting
let searchRegex = /\{\[\s*\{\s*icon: "🛁",\s*title: "Estética Canina",[\s\S]*?icon: "🔬",\s*title: "Laboratorio Clínico",\s*desc: "Análisis rápidos y precisos: hemogramas, bioquímica, cultivos y más. Resultados en tiempo real para diagnósticos inmediatos y tratamientos efectivos."\s*\}\s*\]\.map/m;

// Define the updated services array
const newArrayText = `{[
                                {
                                    icon: <img src="/icons/pet-bath-product-svgrepo-com.svg" className="w-10 h-10 object-contain drop-shadow-sm opacity-80" alt="Estética" />,
                                    title: "Estética Canina",
                                    desc: "Baños, cortes profesionales y tratamientos de belleza con productos dermatológicos de calidad premium. Nuestro equipo de estilistas certificados utiliza técnicas modernas para resaltar la belleza natural de tu mascota."
                                },
                                {
                                    icon: <img src="/icons/pet-bath-product-svgrepo-com.svg" className="w-10 h-10 object-contain drop-shadow-sm opacity-80 mix-blend-multiply" alt="Baños" />,
                                    title: "Baños Medicados",
                                    desc: "Tratamientos especializados para problemas de piel, alergias y dermatitis con medicamentos veterinarios. Formulados específicamente para cada condición, con supervisión veterinaria en cada sesión."
                                },
                                {
                                    icon: <img src="/icons/pet-svgrepo-com.svg" className="w-10 h-10 object-contain drop-shadow-sm opacity-80 mix-blend-multiply" alt="Consulta" />,
                                    title: "Consulta Veterinaria",
                                    desc: "Revisiones completas, diagnósticos precisos y planes de tratamiento personalizados. Nuestros veterinarios especialistas atienden todas las especies con profesionalismo y dedicación."
                                },
                                {
                                    icon: <img src="/icons/pet-dog-svgrepo-com.svg" className="w-10 h-10 object-contain drop-shadow-sm opacity-80 mix-blend-multiply" alt="Urgencias" />,
                                    title: "Urgencias",
                                    desc: "Atención inmediata para emergencias médicas, traumatismos y situaciones críticas. Disponible todos los días del año con equipo de emergencia completamente equipado."
                                },
                                {
                                    icon: <img src="/icons/dog-bed-svgrepo-com.svg" className="w-10 h-10 object-contain drop-shadow-sm opacity-80 mix-blend-multiply" alt="Hospitalización" />,
                                    title: "Hospitalización",
                                    desc: "Áreas climatizadas con monitoreo continuo para recuperación segura y confortable. Cuidados intensivos con personal especializado disponible las 24 horas."
                                },
                                {
                                    icon: <img src="/icons/pet-round-svgrepo-com.svg" className="w-10 h-10 object-contain drop-shadow-sm opacity-80 mix-blend-multiply" alt="Cirugía" />,
                                    title: "Cirugía Especializada",
                                    desc: "Quirófano equipado con tecnología de punta y anestesia inhalatoria segura. Procedimientos desde esterilizaciones hasta cirugías complejas con máxima seguridad."
                                },
                                {
                                    icon: <img src="/icons/pet-hotel-sign-of-a-bone-in-a-dog-house-svgrepo-com.svg" className="w-10 h-10 object-contain drop-shadow-sm opacity-80 mix-blend-multiply" alt="Guardería" />,
                                    title: "Guardería Canina",
                                    desc: "Hospedaje de lujo con paseos programados, juegos y supervisión experta. Ambiente seguro y divertido donde tu mascota se siente como en casa."
                                },
                                {
                                    icon: <img src="/icons/cat-collar-svgrepo-com.svg" className="w-10 h-10 object-contain drop-shadow-sm opacity-80 mix-blend-multiply" alt="Laboratorio" />,
                                    title: "Laboratorio Clínico",
                                    desc: "Análisis rápidos y precisos: hemogramas, bioquímica, cultivos y más. Resultados en tiempo real para diagnósticos inmediatos y tratamientos efectivos."
                                }
                            ].map`;

welcome = welcome.replace(searchRegex, newArrayText);
fs.writeFileSync('resources/js/Pages/Welcome.jsx', welcome);
