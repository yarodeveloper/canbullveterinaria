<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // NEGOCIO
            ['key' => 'site_logo', 'value' => '/img/logo.png', 'type' => 'image', 'group' => 'business_profile', 'label' => 'Logo del Sitio'],
            ['key' => 'site_favicon', 'value' => '/favicon.ico', 'type' => 'image', 'group' => 'business_profile', 'label' => 'Favicon'],

            // HERO
            ['key' => 'hero_title', 'value' => 'Cuidado Médico de Excelencia para tu Mejor Amigo', 'type' => 'text', 'group' => 'hero', 'label' => 'Título Hero'],
            ['key' => 'hero_subtitle', 'value' => 'Especialistas en bienestar animal con hospitalización de vanguardia y estética canina profesional.', 'type' => 'textarea', 'group' => 'hero', 'label' => 'Subtítulo Hero'],
            ['key' => 'hero_image', 'value' => '/img/hero-vet.webp', 'type' => 'image', 'group' => 'hero', 'label' => 'Imagen Hero'],
            
            // CONTACTO
            ['key' => 'contact_phone', 'value' => '+52 123 456 7890', 'type' => 'text', 'group' => 'contact', 'label' => 'Teléfono'],
            ['key' => 'contact_whatsapp', 'value' => '521234567890', 'type' => 'text', 'group' => 'contact', 'label' => 'WhatsApp'],
            ['key' => 'contact_email', 'value' => 'hola@canbull.com', 'type' => 'text', 'group' => 'contact', 'label' => 'Email'],
            ['key' => 'contact_address', 'value' => 'Calle Principal #123, Colonia Centro', 'type' => 'text', 'group' => 'contact', 'label' => 'Dirección'],
            
            // SERVICIOS
            ['key' => 'service_grooming_desc', 'value' => 'Estética profesional con productos dermatológicos y estilistas certificados.', 'type' => 'textarea', 'group' => 'services', 'label' => 'Estética Canina'],
            ['key' => 'service_hosp_desc', 'value' => 'Monitoreo 24/7 con equipamiento de última generación para casos críticos.', 'type' => 'textarea', 'group' => 'services', 'label' => 'Hospitalización'],
            ['key' => 'service_checkup_desc', 'value' => 'Revisiones preventivas integrales para una vida larga y saludable.', 'type' => 'textarea', 'group' => 'services', 'label' => 'Revisión General'],

            // SOBRE NOSOTROS
            ['key' => 'about_title', 'value' => 'Sobre Nosotros', 'type' => 'text', 'group' => 'about', 'label' => 'Título'],
            ['key' => 'about_description', 'value' => 'Canbull te entiende y lo atiende. Tu nuevo aliado confiable que acompaña a tu familia en el cuidado de tus mascotas. Servicios de calidad con personal capacitado.', 'type' => 'textarea', 'group' => 'about', 'label' => 'Descripción Principal'],
            ['key' => 'about_box1_title', 'value' => 'Cariño', 'type' => 'text', 'group' => 'about', 'label' => 'Título Caja 1'],
            ['key' => 'about_box1_desc', 'value' => 'Tratamos a cada mascota con amor.', 'type' => 'text', 'group' => 'about', 'label' => 'Desc. Caja 1'],
            ['key' => 'about_box2_title', 'value' => 'Confianza', 'type' => 'text', 'group' => 'about', 'label' => 'Título Caja 2'],
            ['key' => 'about_box2_desc', 'value' => 'Profesionales certificados.', 'type' => 'text', 'group' => 'about', 'label' => 'Desc. Caja 2'],
            ['key' => 'about_img1', 'value' => 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600', 'type' => 'image', 'group' => 'about', 'label' => 'Imagen 1'],
            ['key' => 'about_img2', 'value' => 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600', 'type' => 'image', 'group' => 'about', 'label' => 'Imagen 2'],

            // VACUNACION
            ['key' => 'vaccine_title', 'value' => 'Protocolo de Vacunación', 'type' => 'text', 'group' => 'vaccines', 'label' => 'Título'],
            ['key' => 'vaccine_description', 'value' => 'Contamos con todas las vacunas necesarias para mantener a tu mascota protegida contra las enfermedades más comunes y peligrosas.', 'type' => 'textarea', 'group' => 'vaccines', 'label' => 'Descripción'],
            ['key' => 'vaccine_list', 'value' => 'Bordetella, Puppy, Antirrábica, Triple Felina, Leucemia, Séxtuple, Quíntuple, Giardiasis', 'type' => 'text', 'group' => 'vaccines', 'label' => 'Lista de Vacunas (Separada por coma)'],
            ['key' => 'vaccine_img', 'value' => 'https://images.unsplash.com/photo-1530281700549-e825232256d5?auto=format&fit=crop&q=80&w=800', 'type' => 'image', 'group' => 'vaccines', 'label' => 'Imagen'],

            // REDES Y MAPAS
            ['key' => 'social_facebook', 'value' => 'https://www.facebook.com/profile.php?id=100057574212916', 'type' => 'text', 'group' => 'social', 'label' => 'Facebook URL'],
            ['key' => 'social_instagram', 'value' => 'https://www.instagram.com/canbullvet', 'type' => 'text', 'group' => 'social', 'label' => 'Instagram URL'],
            ['key' => 'contact_schedule', 'value' => "Lunes a Sábado: 9:00 am - 9:00 pm \nDomingo: 9:00 am - 5:00 pm", 'type' => 'textarea', 'group' => 'contact', 'label' => 'Horario'],
            ['key' => 'contact_maps_url', 'value' => 'https://www.google.com/maps?q=Can+Bull+Cl%C3%ADnica+Veterinaria,+Rosario+Sabinal,+Ter%C3%A1n,+29057+Tuxtla+Guti%C3%A9rrez,+Chis', 'type' => 'text', 'group' => 'contact', 'label' => 'Google Maps Ubicación URL'],
            ['key' => 'contact_maps_iframe', 'value' => 'https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Can%20Bull%20Cl%C3%ADnica%20Veterinaria,%20Tuxtla%20Guti%C3%A9rrez,%20Chiapas,+Mexico&t=&z=16&ie=UTF8&iwloc=B&output=embed', 'type' => 'text', 'group' => 'contact', 'label' => 'Google Maps iFrame Embed URL'],

            // OFERTAS / PROMOS
            ['key' => 'promo_active', 'value' => '1', 'type' => 'text', 'group' => 'promos', 'label' => 'Promoción Activa'],
            ['key' => 'promo_text', 'value' => '¡Descuento de Temporada! 15% en Vacunas este mes.', 'type' => 'text', 'group' => 'promos', 'label' => 'Texto Promoción'],
        ];

        foreach ($settings as $setting) {
            \App\Models\SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
