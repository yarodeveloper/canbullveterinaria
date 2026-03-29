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
                    <div className="bg-brand-primary text-white py-2 px-4 text-center text-sm font-medium">
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
                                    <div className="flex items-center gap-2 group">
                                        <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                                            <img src="/icons/pet-svgrepo-com.svg" className="w-8 h-8 invert brightness-0" alt="Pet Icon" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black tracking-tight text-brand-primary leading-none">
                                                {getSetting('hero_title', 'CANBULL').split(' ')[0].toUpperCase()}
                                            </span>
                                            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase">
                                                Centro Veterinario
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="hidden md:flex items-center space-x-10">
                                <a href="#servicios" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-brand-primary transition">Servicios</a>
                                <a href="#contacto" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-brand-primary transition">Contacto</a>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-brand-primary transition"
                                    >
                                        Ir al Panel
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-brand-primary transition"
                                    >
                                        Acceso
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
                                    <span className="mr-2 flex items-center"><img src="/icons/pet-dog-svgrepo-com.svg" className="w-4 h-4 ml-1 opacity-80" alt="" /></span> {getSetting('hero_badge', 'Medicina Veterinaria de Vanguardia')}
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
                                                    <p className="text-sm font-black text-gray-900 dark:text-white">+1000 Mascotas Felices</p>
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
                            <h2 className="text-4xl lg:text-5xl font-black mt-4 dark:text-white mb-6">{getSetting('services_title', 'Nuestros Servicios')}</h2>
                            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">{getSetting('services_subtitle', 'Equipamiento de vanguardia y especialistas apasionados por el bienestar.')}</p>
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
                    <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-5 dark:opacity-10" style={{ backgroundImage: `url('${getSetting('why_us_bg_image', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=2000')}')` }}></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl lg:text-5xl font-black mt-4 text-white mb-6">{getSetting('why_us_title', '¿Por Qué Elegir Canbull?')}</h2>
                            <p className="text-white/80 font-medium max-w-2xl mx-auto">{getSetting('why_us_desc', 'Nos apasiona brindarle a tu mascota y a ti una experiencia con la más alta excelencia médica y humana.')}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <img src="/icons/quality-certification-svgrepo-com.svg" className="w-10 h-10 object-contain drop-shadow-md opacity-60 grayscale brightness-0" alt="Calidad" />,
                                    title: "Equipo Especializado",
                                    desc: "Médicos veterinarios con más experiencia en diferentes especialidades."
                                },
                                {
                                    icon: <img src="/icons/heart-svgrepo-com.svg" className="w-10 h-10 object-contain drop-shadow-md opacity-60 grayscale brightness-0" alt="Atención" />,
                                    title: "Atención Personalizada",
                                    desc: "Cada mascota recibe un plan de cuidado personalizado adaptado a sus necesidades específicas."
                                },
                                {
                                    icon: <img src="/icons/med-kit-svgrepo-com.svg" className="w-10 h-10 object-contain drop-shadow-md opacity-60 grayscale brightness-0" alt="Hospital" />,
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

                {/* Sobre Nosotros Section */}
                <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                            <div className="mb-12 lg:mb-0">
                                <h2 className="text-4xl lg:text-5xl font-black text-brand-primary mb-6 dark:text-brand-secondary">{getSetting('about_title', 'Sobre Nosotros')}</h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed font-medium">
                                    {getSetting('about_description', 'Canbull te entiende y lo atiende. Tu nuevo aliado confiable que acompaña a tu familia en el cuidado de tus mascotas. Servicios de calidad con personal capacitado.')}
                                </p>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-[2rem] shadow-sm flex items-start gap-4">
                                        <div className="bg-brand-primary/10 dark:bg-brand-secondary/20 p-3 rounded-2xl flex-shrink-0">
                                            <img src="/icons/heart-svgrepo-com.svg" className="w-6 h-6 opacity-50 dark:invert" alt="" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-white mb-1">{getSetting('about_box1_title', 'Cariño')}</h4>
                                            <p className="text-xs text-gray-500 font-medium">{getSetting('about_box1_desc', 'Tratamos a cada mascota con amor.')}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-[2rem] shadow-sm flex items-start gap-4">
                                        <div className="bg-brand-primary/10 dark:bg-brand-secondary/20 p-3 rounded-2xl flex-shrink-0">
                                            <img src="/icons/quality-certification-svgrepo-com.svg" className="w-6 h-6 opacity-50 dark:invert" alt="" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-white mb-1">{getSetting('about_box2_title', 'Confianza')}</h4>
                                            <p className="text-xs text-gray-500 font-medium">{getSetting('about_box2_desc', 'Profesionales certificados.')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="rounded-[3rem] overflow-hidden bg-[#cae5df] dark:bg-gray-800 h-[300px] sm:h-[400px]">
                                    <img src={getSetting('about_img1', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600')} alt="Veterinaria trabajando" className="w-full h-full object-cover mix-blend-multiply opacity-90 dark:mix-blend-normal" />
                                </div>
                                <div className="rounded-[3rem] overflow-hidden bg-[#f4ebd9] dark:bg-gray-800 h-[300px] sm:h-[400px] mt-10">
                                    <img src={getSetting('about_img2', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600')} alt="Perro feliz" className="w-full h-full object-cover mix-blend-multiply opacity-90 dark:mix-blend-normal" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Protocolo de Vacunación */ }
                <section className="py-24 bg-[#FCFBFC] dark:bg-gray-900/50 pt-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-24 items-center">
                            <div className="mb-12 lg:mb-0">
                                <h2 className="text-4xl lg:text-5xl font-black text-[#151c36] dark:text-white mb-6">{getSetting('vaccine_title', 'Protocolo de Vacunación')}</h2>
                                <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed font-medium">
                                    {getSetting('vaccine_description', 'Contamos con todas las vacunas necesarias para mantener a tu mascota protegida contra las enfermedades más comunes y peligrosas.')}
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {(getSetting('vaccine_list', 'Bordetella,Puppy,Antirrábica,Triple Felina,Leucemia,Séxtuple,Quíntuple,Giardiasis').split(',')).map((vacuna, idx) => (
                                        <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 font-bold text-[#2a3045] dark:text-gray-200 text-sm">
                                            <div className="w-5 h-5 bg-brand-primary text-[#fff] rounded-full flex items-center justify-center text-[10px] font-black leading-none pt-[2px]">✓</div>
                                            {vacuna.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative border-[16px] border-white dark:border-gray-800 rounded-[3rem] shadow-xl rotate-3 bg-white">
                                <img src={getSetting('vaccine_img', 'https://images.unsplash.com/photo-1530281700549-e825232256d5?auto=format&fit=crop&q=80&w=800')} alt="Vacunación" className="w-full h-[600px] object-cover rounded-[2rem] filter brightness-105" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contacto" className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                            <div className="lg:col-span-5 mb-16 lg:mb-0">
                                <h2 className="text-4xl lg:text-5xl font-black text-[#151c36] dark:text-white mb-6">Contáctanos</h2>
                                <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 font-medium leading-relaxed">
                                    Estamos listos para atenderte. Agenda una cita o visítanos directamente en nuestra sucursal.
                                </p>

                                <div className="space-y-8 mb-12">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-brand-primary/10 dark:bg-brand-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <img src="/icons/map-svgrepo-com.svg" className="w-5 h-5 opacity-50 dark:invert text-brand-primary" alt="" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#151c36] dark:text-white text-base">Dirección</h4>
                                            <p className="text-gray-500 font-medium text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: getSetting('contact_address', 'Calzada Rosario Sabinal #54 Col. La Gloria').replace(/\n/g, '<br/>') }}></p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-brand-primary/10 dark:bg-brand-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <img src="/icons/envelope-svgrepo-com.svg" className="w-5 h-5 opacity-50 dark:invert text-brand-primary" alt="" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#151c36] dark:text-white text-base">Email</h4>
                                            <p className="text-gray-500 font-medium text-sm"><a href={`mailto:${getSetting('contact_email', 'canbull_c.v@hotmail.com')}`}>{getSetting('contact_email', 'canbull_c.v@hotmail.com')}</a></p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-brand-primary/10 dark:bg-brand-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <img src="/icons/cell-phone-svgrepo-com.svg" className="w-5 h-5 opacity-50 dark:invert text-brand-primary" alt="" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#151c36] dark:text-white text-base">Teléfono</h4>
                                            <p className="text-gray-500 font-medium text-sm">{getSetting('contact_phone', '961 701 9517')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-brand-primary/10 dark:bg-brand-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <img src="/icons/clock-svgrepo-com.svg" className="w-5 h-5 opacity-50 dark:invert text-brand-primary" alt="" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#151c36] dark:text-white text-base">Horario</h4>
                                            <p className="text-gray-500 font-medium text-sm" dangerouslySetInnerHTML={{ __html: getSetting('contact_schedule', 'Lunes a Sábado: 9:00 am - 9:00 pm\nDomingo: 9:00 am - 5:00 pm').replace(/\n/g, '<br/>') }}></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    {getSetting('social_facebook') && (
                                        <a href={getSetting('social_facebook')} target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#f4f7f9] dark:bg-gray-700 text-[#151c36] dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-brand-primary hover:text-white transition shadow-sm">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                                        </a>
                                    )}
                                    {getSetting('social_instagram') && (
                                        <a href={getSetting('social_instagram')} target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#f4f7f9] dark:bg-gray-700 text-[#151c36] dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-brand-primary hover:text-white transition shadow-sm">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                                        </a>
                                    )}
                                    {getSetting('social_tiktok') && (
                                        <a href={getSetting('social_tiktok')} target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#f4f7f9] dark:bg-gray-700 text-[#151c36] dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-brand-primary hover:text-white transition shadow-sm">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.13 4.41-2.9 5.84-1.74 1.43-4.08 2.05-6.28 1.69-2.22-.35-4.24-1.68-5.38-3.6-1.15-1.92-1.31-4.32-.43-6.38.89-2.06 2.65-3.66 4.79-4.35 1.53-.49 3.22-.5 4.78.02.04.14.07.28.1.42.06 1.34.12 2.68.21 4.02-1.01-.22-2.09-.11-3.05.32-.97.43-1.77 1.25-2.12 2.25-.36.99-.21 2.15.39 3.02.59.87 1.63 1.45 2.68 1.5.15 0 .29.01.44.02 1.05-.04 2.06-.51 2.76-1.3.71-.8 1-1.89 1-2.95.03-5.22.02-10.45.02-15.67z"/></svg>
                                        </a>
                                    )}
                                    {getSetting('social_twitter') && (
                                        <a href={getSetting('social_twitter')} target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#f4f7f9] dark:bg-gray-700 text-[#151c36] dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-brand-primary hover:text-white transition shadow-sm">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                        </a>
                                    )}
                                    {getSetting('social_youtube') && (
                                        <a href={getSetting('social_youtube')} target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#f4f7f9] dark:bg-gray-700 text-[#151c36] dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-brand-primary hover:text-white transition shadow-sm">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="lg:col-span-7 relative h-[600px] bg-[#dbeae7] dark:bg-gray-700 rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white dark:border-gray-800">
                                <a 
                                    href={getSetting('contact_maps_url', 'https://www.google.com/maps?q=Can+Bull+Cl%C3%ADnica+Veterinaria,+Rosario+Sabinal,+Ter%C3%A1n,+29057+Tuxtla+Guti%C3%A9rrez,+Chis')}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-brand-primary text-white px-6 py-4 rounded-2xl shadow-xl font-bold flex flex-col items-center gap-2 hover:scale-105 transition"
                                >
                                    <div className="bg-white rounded-full p-2 mb-1 shadow-md">
                                        <svg className="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                                    </div>
                                    Canbull Veterinaria
                                </a>
                                <iframe 
                                    src={getSetting('contact_maps_iframe', 'https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Can%20Bull%20Cl%C3%ADnica%20Veterinaria,%20Tuxtla%20Guti%C3%A9rrez,%20Chiapas,+Mexico&t=&z=16&ie=UTF8&iwloc=B&output=embed')}
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0, opacity: 0.8 }} 
                                    allowFullScreen="" 
                                    loading="lazy" 
                                    title="Mapa Cánbull"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-20 bg-brand-primary text-center border-t border-brand-primary/20">
                    <div className="flex flex-col items-center gap-6 mb-12">
                        <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center shadow-xl group hover:scale-110 transition-transform">
                             <img src="/icons/pet-svgrepo-com.svg" className="w-10 h-10" alt="Pet Icon" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black tracking-tighter text-white">CANBULL</span>
                            <span className="text-xs font-bold tracking-[0.4em] text-white/50 uppercase">Centro Veterinario Integral</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mb-12">
                        {getSetting('social_facebook') && (
                            <a href={getSetting('social_facebook')} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                            </a>
                        )}
                        {getSetting('social_instagram') && (
                            <a href={getSetting('social_instagram')} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                            </a>
                        )}
                        {getSetting('social_tiktok') && (
                            <a href={getSetting('social_tiktok')} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.13 4.41-2.9 5.84-1.74 1.43-4.08 2.05-6.28 1.69-2.22-.35-4.24-1.68-5.38-3.6-1.15-1.92-1.31-4.32-.43-6.38.89-2.06 2.65-3.66 4.79-4.35 1.53-.49 3.22-.5 4.78.02.04.14.07.28.1.42.06 1.34.12 2.68.21 4.02-1.01-.22-2.09-.11-3.05.32-.97.43-1.77 1.25-2.12 2.25-.36.99-.21 2.15.39 3.02.59.87 1.63 1.45 2.68 1.5.15 0 .29.01.44.02 1.05-.04 2.06-.51 2.76-1.3.71-.8 1-1.89 1-2.95.03-5.22.02-10.45.02-15.67z"/></svg>
                            </a>
                        )}
                        {getSetting('social_youtube') && (
                            <a href={getSetting('social_youtube')} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            </a>
                        )}
                        {getSetting('social_twitter') && (
                            <a href={getSetting('social_twitter')} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition">
                                <svg className="w-7 h-7 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                        )}
                        {getSetting('contact_whatsapp') && (
                            <a href={`https://wa.me/${getSetting('contact_whatsapp')}`} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.894-5.335 11.897-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                            </a>
                        )}
                    </div>
                    <p className="text-sm font-bold text-white/40">&copy; {new Date().getFullYear()} Centro Veterinario Canbull. Un espacio dedicado a la vida.</p>
                </footer>
            </div>
        </ThemeProvider>
    );
}
