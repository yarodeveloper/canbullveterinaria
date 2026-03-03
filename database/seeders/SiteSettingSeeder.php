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
