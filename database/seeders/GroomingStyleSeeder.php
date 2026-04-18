<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GroomingStyleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $styles = [
            ['name' => 'PUPPY STYLE', 'description' => 'Longitud uniforme en cuerpo y extremidades (tijera o cuchilla larga). Acabado redondeado, aspecto juvenil sin ángulos marcados.'],
            ['name' => 'TEDDY BEAR', 'description' => 'Cuerpo medio-corto. Acabado facial circular con volumen en mejillas y hocico. Especial para mantos rizados o con densidad.'],
            ['name' => 'KENNEL CUT', 'description' => 'Rasurado uniforme con cuchilla corta (mantenimiento cero). Despeje total de nudos. Ideal para higiene extrema o clima cálido.'],
            ['name' => 'LAMB CUT', 'description' => 'Torso y pecho al ras (cuchilla). Extremidades con volumen cilíndrico trabajado a tijera. Transición suave en hombros y cadera.'],
            ['name' => 'LION LOOK', 'description' => 'Rasurado de lomo y extremidades hasta el tarso/carpo. Melena frontal completa en cuello y cabeza. Pompón terminal en cola.'],
            ['name' => 'ASIAN FUSION', 'description' => 'Rostro ultra-redondeado "tipo muñeca". Orejas cortas/minimalistas. Patas acampanadas o con volumen excesivo en la base.'],
            ['name' => 'WESTY SPEC', 'description' => 'Dorso corto (técnica stripping o cuchilla). Falda lateral definida. Cabeza en forma de "crisantemo" con barba y cejas marcadas.'],
            ['name' => 'MODERN CUT', 'description' => 'Longitud media a tijera. Marcación de angulaciones naturales del ejemplar. Equilibrio entre estética de exposición y confort.'],
            ['name' => 'CONTINENTAL', 'description' => 'Rasurado de hocico, patas y zona posterior. Pompones definidos en articulaciones y punta de cola. Top-knot voluminoso.'],
            ['name' => 'SANITARY PLUS', 'description' => 'Despeje de almohadillas, zona perianal, inguinal y abdomen bajo. Recorte de lagrimales. (Servicio base de higiene).'],
        ];

        foreach ($styles as $style) {
            \App\Models\GroomingStyle::updateOrCreate(['name' => $style['name']], $style);
        }
    }
}
