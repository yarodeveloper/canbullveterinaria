<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HealthProtocolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $protocols = [
            // Caninos
            [
                'name' => 'Cachorro - Esquema Inicial (Puppy)',
                'type' => 'vaccine',
                'species' => 'Canino',
                'suggested_product' => 'Quíntuple + Guardián',
                'days_until_next' => 21,
                'description' => 'Refuerzo cada 21 días hasta completar el esquema.'
            ],
            [
                'name' => 'Canino - Refuerzo Anual',
                'type' => 'vaccine',
                'species' => 'Canino',
                'suggested_product' => 'Sextuple + Rabia',
                'days_until_next' => 365,
                'description' => 'Mantenimiento anual de inmunidad.'
            ],
            // Felinos
            [
                'name' => 'Gatito - Esquema Inicial',
                'type' => 'vaccine',
                'species' => 'Felino',
                'suggested_product' => 'Triple Felina',
                'days_until_next' => 21,
                'description' => 'Refuerzo cada 21 días.'
            ],
            [
                'name' => 'Felino - Refuerzo Anual',
                'type' => 'vaccine',
                'species' => 'Felino',
                'suggested_product' => 'Triple Felina + Leucemia',
                'days_until_next' => 365,
                'description' => 'Control anual felino.'
            ],
            // Desparasitaciones
            [
                'name' => 'Control Interno Trimestral',
                'type' => 'internal_deworming',
                'species' => 'both',
                'suggested_product' => 'Endogard / Drontal',
                'days_until_next' => 90,
                'description' => 'Desparasitación interna recomendada cada 3 meses.'
            ],
            [
                'name' => 'Control Pulgas/Garrapatas (Mensual)',
                'type' => 'external_deworming',
                'species' => 'both',
                'suggested_product' => 'Nexgard / Simparica',
                'days_until_next' => 30,
                'description' => 'Protección externa mensual.'
            ],
            [
                'name' => 'Bravecto (Trimestral)',
                'type' => 'external_deworming',
                'species' => 'both',
                'suggested_product' => 'Bravecto Tablet / Spot on',
                'days_until_next' => 90,
                'description' => 'Protección externa de larga duración.'
            ],
        ];

        foreach ($protocols as $protocol) {
            \App\Models\HealthProtocol::create($protocol);
        }
    }
}
