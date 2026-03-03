const fs = require('fs');
let welcome = fs.readFileSync('resources/js/Pages/Welcome.jsx', 'utf8');

const oldServicesSec = `{/* Services Section */}
                <section id="servicios" className="py-24 bg-white dark:bg-gray-900 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div className="max-w-2xl">
                                <span className="text-brand-primary font-black tracking-widest uppercase text-xs">Especialidades</span>
                                <h2 className="text-4xl lg:text-5xl font-black mt-4 dark:text-white">Soluciones integrales para la salud animal</h2>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm">Equipamiento de vanguardia y especialistas apasionados por el bienestar.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Estetica */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-12 rounded-[2.5rem] border border-transparent hover:border-brand-secondary hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 group">
                                <div className="w-20 h-20 bg-brand-secondary rounded-3xl flex items-center justify-center text-4xl mb-10 shadow-lg shadow-secondary-100 group-hover:rotate-6 transition">🛁</div>
                                <h3 className="text-2xl font-black mb-4 text-brand-primary">Estética Pro</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                                    {getSetting('service_grooming_desc', 'Servicio de grooming profesional con productos de alta gama y corte especializado.')}
                                </p>
                                <div className="flex items-center gap-2 text-brand-primary font-black text-sm uppercase tracking-tighter cursor-pointer">
                                    Ver catálogo <svg className="w-5 h-5 group-hover:translate-x-2 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </div>
                            </div>

                            {/* Hospitalización */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-12 rounded-[2.5rem] border border-transparent hover:border-brand-primary hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 group">
                                <div className="w-20 h-20 bg-brand-primary rounded-3xl flex items-center justify-center text-4xl mb-10 shadow-lg shadow-primary-100 group-hover:rotate-6 transition text-brand-secondary">🏥</div>
                                <h3 className="text-2xl font-black mb-4 text-brand-primary">Hospitalización</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                                    {getSetting('service_hosp_desc', 'Monitoreo constante e intensivo con los más altos estándares médicos de la zona.')}
                                </p>
                                <div className="flex items-center gap-2 text-brand-primary font-black text-sm uppercase tracking-tighter cursor-pointer">
                                    Instalaciones <svg className="w-5 h-5 group-hover:translate-x-2 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </div>
                            </div>

                            {/* Revisión */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-12 rounded-[2.5rem] border border-transparent hover:border-brand-secondary hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 group">
                                <div className="w-20 h-20 bg-brand-secondary rounded-3xl flex items-center justify-center text-4xl mb-10 shadow-lg shadow-secondary-100 group-hover:rotate-6 transition">🩺</div>
                                <h3 className="text-2xl font-black mb-4 text-brand-primary">Medicina Preventiva</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                                    {getSetting('service_checkup_desc', 'Planes de vacunación y chequeos anuales diseñados para alargar la vida de tu mejor amigo.')}
                                </p>
                                <div className="flex items-center gap-2 text-brand-primary font-black text-sm uppercase tracking-tighter cursor-pointer">
                                    Planes de salud <svg className="w-5 h-5 group-hover:translate-x-2 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>`;

const newServicesSec = `{/* Services Section */}
                <section id="servicios" className="py-24 bg-white dark:bg-gray-900 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="text-brand-primary font-black tracking-widest uppercase text-xs">Especialidades</span>
                            <h2 className="text-4xl lg:text-5xl font-black mt-4 dark:text-white mb-6">Nuestros Servicios</h2>
                            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">Equipamiento de vanguardia y especialistas apasionados por el bienestar.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: "🛁",
                                    title: "Estética Canina",
                                    desc: "Baños, cortes profesionales y tratamientos de belleza con productos dermatológicos de calidad premium. Nuestro equipo de estilistas certificados utiliza técnicas modernas para resaltar la belleza natural de tu mascota."
                                },
                                {
                                    icon: "🧴",
                                    title: "Baños Medicados",
                                    desc: "Tratamientos especializados para problemas de piel, alergias y dermatitis con medicamentos veterinarios. Formulados específicamente para cada condición, con supervisión veterinaria en cada sesión."
                                },
                                {
                                    icon: "🩺",
                                    title: "Consulta Veterinaria",
                                    desc: "Revisiones completas, diagnósticos precisos y planes de tratamiento personalizados. Nuestros veterinarios especialistas atienden todas las especies con profesionalismo y dedicación."
                                },
                                {
                                    icon: "🚑",
                                    title: "Urgencias",
                                    desc: "Atención inmediata para emergencias médicas, traumatismos y situaciones críticas. Disponible todos los días del año con equipo de emergencia completamente equipado."
                                },
                                {
                                    icon: "🏥",
                                    title: "Hospitalización",
                                    desc: "Áreas climatizadas con monitoreo continuo para recuperación segura y confortable. Cuidados intensivos con personal especializado disponible las 24 horas."
                                },
                                {
                                    icon: "✂️",
                                    title: "Cirugía Especializada",
                                    desc: "Quirófano equipado con tecnología de punta y anestesia inhalatoria segura. Procedimientos desde esterilizaciones hasta cirugías complejas con máxima seguridad."
                                },
                                {
                                    icon: "🎾",
                                    title: "Guardería Canina",
                                    desc: "Hospedaje de lujo con paseos programados, juegos y supervisión experta. Ambiente seguro y divertido donde tu mascota se siente como en casa."
                                },
                                {
                                    icon: "🔬",
                                    title: "Laboratorio Clínico",
                                    desc: "Análisis rápidos y precisos: hemogramas, bioquímica, cultivos y más. Resultados en tiempo real para diagnósticos inmediatos y tratamientos efectivos."
                                }
                            ].map((service, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-[2rem] border border-transparent hover:border-brand-primary hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 group shadow-sm hover:shadow-xl">
                                    <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                        {service.icon}
                                    </div>
                                    <h3 className="text-xl font-black mb-3 text-brand-primary">{service.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium">
                                        {service.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Por Que Elegir Canbull Section */}
                <section className="py-24 relative overflow-hidden bg-brand-primary dark:bg-gray-900 border-y border-transparent dark:border-gray-800">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=2000')] opacity-5 dark:opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl lg:text-5xl font-black mt-4 text-white mb-6">¿Por Qué Elegir Canbull?</h2>
                            <p className="text-white/80 font-medium max-w-2xl mx-auto">Nos apasiona brindarle a tu mascota y a ti una experiencia con la más alta excelencia médica y humana.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: "👨‍⚕️",
                                    title: "Equipo Especializado",
                                    desc: "Médicos veterinarios con más experiencia en diferentes especialidades."
                                },
                                {
                                    icon: "❤️",
                                    title: "Atención Personalizada",
                                    desc: "Cada mascota recibe un plan de cuidado personalizado adaptado a sus necesidades específicas."
                                },
                                {
                                    icon: "🏥",
                                    title: "Hospitalización/Cirugía",
                                    desc: "Contamos con todo lo necesario para ayudar a tu mascota si requiere cirugía u hospitalización."
                                }
                            ].map((feature, idx) => (
                                <div key={idx} className="bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/20 hover:bg-white/20 transition-all duration-300 text-center group">
                                    <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center text-4xl mb-8 shadow-xl group-hover:-translate-y-2 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-white">{feature.title}</h3>
                                    <p className="text-white/80 leading-relaxed font-medium">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>`;

welcome = welcome.replace(oldServicesSec, newServicesSec);
fs.writeFileSync('resources/js/Pages/Welcome.jsx', welcome);
