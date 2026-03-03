import { Head, Link } from '@inertiajs/react';
import React from 'react';
import ThemeProvider from '@/Components/ThemeProvider';

export default function Welcome({ auth, settings }) {
    const s = settings || {};

    // Helper for safe access
    const getSetting = (key, fallback) => s[key] || fallback;

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-brand-primary selection:text-white">
                <Head>
                    <title>{getSetting('hero_title', 'Veterinaria Canbull')}</title>
                    <meta name="description" content={getSetting('hero_subtitle', 'Cuidado experto para tus mascotas')} />
                    {getSetting('site_favicon') && <link rel="icon" href={getSetting('site_favicon')} />}
                </Head>

                {/* Top Promo Banner */}
                {getSetting('promo_active', '0') === '1' && (
                    <div className="bg-brand-purple text-white py-2 px-4 text-center text-sm font-medium">
                        <span className="inline-flex items-center gap-2">
                            {getSetting('promo_text', '¡Aprovecha nuestras ofertas del mes!') ?? 'Bienvenidos a Canbull'}
                        </span>
                    </div>
                )}

                {/* Navigation */}
                <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-20 justify-between items-center">
                            <div className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer">
                                {getSetting('site_logo') ? (
                                    <img src={getSetting('site_logo')} alt="Logo" className="h-14 w-auto object-contain" />
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-brand-secondary text-2xl font-black shadow-lg shadow-primary-50">
                                            C
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black tracking-tight text-brand-primary leading-none">
                                                CANBULL
                                            </span>
                                            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase">
                                                Centro Veterinario
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="hidden md:flex items-center space-x-10">
                                <a href="#servicios" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-brand-primary transition">Servicios</a>
                                <a href="#contacto" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-brand-primary transition">Contacto</a>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="px-6 py-3 bg-brand-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary-50"
                                    >
                                        Ir al Panel Control
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="px-6 py-3 bg-brand-secondary text-brand-primary rounded-xl text-sm font-black hover:opacity-90 transition shadow-lg shadow-secondary-50"
                                    >
                                        Acceso Personal
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-40 overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-brand-secondary/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-3xl"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                            <div className="mb-16 lg:mb-0 text-center lg:text-left">
                                <div className="inline-flex items-center px-4 py-2 mb-8 text-xs font-black tracking-widest text-brand-primary uppercase bg-brand-secondary/20 rounded-lg">
                                    <span className="mr-2">🐾</span> {getSetting('hero_badge', 'Medicina Veterinaria de Vanguardia')}
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] mb-8 text-gray-900 dark:text-white">
                                    {getSetting('hero_title', 'Cuidamos lo que más quieres')}
                                </h1>
                                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                    {getSetting('hero_subtitle', 'En Canbull combinamos pasión y tecnología para ofrecer el mejor servicio médico y estético para tus mascotas en un ambiente profesional.')}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                                    <a
                                        href={`https://wa.me/${getSetting('contact_whatsapp', '')}`}
                                        className="px-10 py-5 bg-brand-primary text-white rounded-2xl text-lg font-black hover:opacity-90 transition shadow-2xl shadow-primary-100 flex items-center justify-center gap-3"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.894-5.335 11.897-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                        Agendar Cita
                                    </a>
                                    <a
                                        href="#servicios"
                                        className="px-10 py-5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-lg font-black text-brand-primary hover:border-brand-primary transition text-center"
                                    >
                                        Nuestros Servicios
                                    </a>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-brand-primary rounded-[32px] blur-2xl opacity-10 group-hover:opacity-20 transition duration-500"></div>
                                <div className="relative rounded-[32px] overflow-hidden shadow-2xl skew-y-1">
                                    <img
                                        src={getSetting('hero_image', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=1200')}
                                        alt="Veterinary Care"
                                        className="w-full h-[550px] object-cover scale-105 group-hover:scale-100 transition duration-1000"
                                    />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="bg-white/90 backdrop-blur-md dark:bg-gray-800/90 p-6 rounded-2xl shadow-xl border border-white/20">
                                            <div className="flex items-center gap-4">
                                                <div className="flex -space-x-3">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className={`w-10 h-10 border-2 border-white dark:border-gray-700 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden`}>
                                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="client" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white">+500 Mascotas Felices</p>
                                                    <p className="text-xs font-bold text-brand-primary">Atención Profesional Garantizada</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
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
                                    icon: <svg className="w-10 h-10 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
                                    title: "Equipo Especializado",
                                    desc: "Médicos veterinarios con más experiencia en diferentes especialidades."
                                },
                                {
                                    icon: <svg className="w-10 h-10 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
                                    title: "Atención Personalizada",
                                    desc: "Cada mascota recibe un plan de cuidado personalizado adaptado a sus necesidades específicas."
                                },
                                {
                                    icon: <svg className="w-10 h-10 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
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
                </section>

                {/* CTA Section */}
                <section id="contacto" className="py-24 bg-gray-50 dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-brand-primary rounded-[4rem] p-12 lg:p-24 text-center relative overflow-hidden shadow-3xl">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative z-10">
                                <h2 className="text-4xl lg:text-7xl font-black text-white mb-10 leading-none">
                                    Ven a conocernos hoy mismo
                                </h2>
                                <p className="text-white/80 text-xl font-medium mb-16 max-w-2xl mx-auto">
                                    Estamos ubicados en una zona accesible con estacionamiento y el mejor equipo médico listo para recibirte.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
                                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] text-white border border-white/10 group hover:bg-white/20 transition">
                                        <span className="text-3xl block mb-4">📞</span>
                                        <p className="text-xs font-black uppercase tracking-widest text-brand-secondary mb-2">Llamadas Directas</p>
                                        <p className="text-2xl font-black">{getSetting('contact_phone', '999 123 4567')}</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] text-white border border-white/10 group hover:bg-white/20 transition">
                                        <span className="text-3xl block mb-4">📍</span>
                                        <p className="text-xs font-black uppercase tracking-widest text-brand-secondary mb-2">Ubicación</p>
                                        <p className="text-lg font-black">{getSetting('contact_address', 'Av. Principal #123, Ciudad')}</p>
                                    </div>
                                </div>

                                <a
                                    href={`https://wa.me/${getSetting('contact_whatsapp', '')}`}
                                    className="inline-flex items-center gap-4 px-12 py-6 bg-brand-secondary text-brand-primary rounded-[2rem] text-2xl font-black hover:scale-105 transition shadow-2xl shadow-secondary-100"
                                >
                                    Inicia conversación por WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-20 bg-brand-primary text-center border-t border-brand-primary/20">
                    <div className="flex flex-col items-center gap-6 mb-12">
                        <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-brand-primary text-3xl font-black shadow-xl">C</div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black tracking-tighter text-white">CANBULL</span>
                            <span className="text-xs font-bold tracking-[0.4em] text-white/50 uppercase">Centro Veterinario Integral</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-8 mb-12">
                        <a href="#" className="font-bold text-white/60 hover:text-white transition">Facebook</a>
                        <a href="#" className="font-bold text-white/60 hover:text-white transition">Instagram</a>
                        <a href="#" className="font-bold text-white/60 hover:text-white transition">TikTok</a>
                    </div>
                    <p className="text-sm font-bold text-white/40">&copy; {new Date().getFullYear()} Centro Veterinario Canbull. Un espacio dedicado a la vida.</p>
                </footer>
            </div>
        </ThemeProvider>
    );
}
