<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $csvData = [
            ['name' => 'Consulta General', 'category' => 'Consultas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Consulta especialidad', 'category' => 'Consultas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Consulta preventiva salud oral', 'category' => 'Consultas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Incluye apertura de ficha'],
            ['name' => 'Consulta urgencia Diurna', 'category' => 'Consultas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Laborables'],
            ['name' => 'Consulta urgencia Nocturna', 'category' => 'Consultas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Festivos'],
            ['name' => 'Consulta urgencia telefónica', 'category' => 'Consultas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Revisión', 'category' => 'Consultas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Revisión de Especialidad', 'category' => 'Consultas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Videoconsulta', 'category' => 'Consultas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Especial Cachorros (Moquillo + Parvo)', 'category' => 'Vacunas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Cachorros'],
            ['name' => 'Leptospirosis', 'category' => 'Vacunas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Canino'],
            ['name' => 'Leucemia felina', 'category' => 'Vacunas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Felino'],
            ['name' => 'Parvovirosis', 'category' => 'Vacunas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Canino'],
            ['name' => 'Pentavalente canina', 'category' => 'Vacunas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Canino'],
            ['name' => 'Pentavalente felina', 'category' => 'Vacunas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Felino'],
            ['name' => 'Rabia (canina/felina)', 'category' => 'Vacunas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'General'],
            ['name' => 'Tetravalente canina', 'category' => 'Vacunas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Canino'],
            ['name' => 'Tetravalente felina', 'category' => 'Vacunas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Felino'],
            ['name' => 'Trivalente canina', 'category' => 'Vacunas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Canino'],
            ['name' => 'Trivalente felina', 'category' => 'Vacunas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Felino'],
            ['name' => 'Vacuna de la tos del parque (K.C.)', 'category' => 'Vacunas', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Canino'],
            ['name' => 'Análisis de orina', 'category' => 'Laboratorio', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Tira y sedimento'],
            ['name' => 'Citología', 'category' => 'Laboratorio', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Nasal, ótica o bulto'],
            ['name' => 'Ecografía abdominal/ocular/etc.', 'category' => 'Imagen', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'No doppler'],
            ['name' => 'Ecografía simple (FAST)', 'category' => 'Imagen', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Electrocardiograma (ECG)', 'category' => 'Cardiología', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Estudio coprológico', 'category' => 'Laboratorio', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Directo y flotación'],
            ['name' => 'Estudio radiográfico (hasta 3 rads)', 'category' => 'Imagen', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Misma zona'],
            ['name' => 'Hemograma', 'category' => 'Laboratorio', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Radiografía simple', 'category' => 'Imagen', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Test rápido Giardia', 'category' => 'Test Rápido', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Test Schrimer / Fluoresceína', 'category' => 'Test Rápido', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Oftalmología'],
            ['name' => 'Castración felina hembra', 'category' => 'Cirugía Repro', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Felino'],
            ['name' => 'Castración felina macho', 'category' => 'Cirugía Repro', 'price' => 215.51, 'tax_iva' => 16, 'notes' => 'Felino'],
            ['name' => 'Limpieza de boca', 'category' => 'Cirugía Bucal', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Enucleación globo ocular', 'category' => 'Oftalmo', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Hospitalización Diurna', 'category' => 'Hospitalización', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Hospitalización Nocturna', 'category' => 'Hospitalización', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Eutanasia (sin recogida)', 'category' => 'Eutanasia', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Cambio de propietario/CCAA', 'category' => 'Certificados', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
            ['name' => 'Pasaporte intracomunitario', 'category' => 'Certificados', 'price' => 215.51, 'tax_iva' => 16, 'notes' => ''],
        ];

        $now = now();
        $iconMap = [
            'Consultas' => '🩺',
            'Vacunas' => '💉',
            'Laboratorio' => '🔬',
            'Imagen' => '📸',
            'Cardiología' => '❤️',
            'Test Rápido' => '🧪',
            'Cirugía Repro' => '✂️',
            'Cirugía Bucal' => '🦷',
            'Oftalmo' => '👁️',
            'Hospitalización' => '🏥',
            'Eutanasia' => '🕊️',
            'Certificados' => '📄',
        ];

        foreach ($csvData as $item) {
            // Check or create category
            $category = DB::table('product_categories')->where('name', $item['category'])->first();
            $categoryId = 0;
            if (!$category) {
                $categoryId = DB::table('product_categories')->insertGetId([
                    'name' => $item['category'],
                    'slug' => Str::slug($item['category']),
                    'icon' => $iconMap[$item['category']] ?? '✂️',
                    'is_service' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            } else {
                $categoryId = $category->id;
                // Force to be a service just in case
                DB::table('product_categories')->where('id', $categoryId)->update(['is_service' => true]);
            }

            // Create service
            DB::table('products')->updateOrInsert(
                ['name' => $item['name']],
                [
                    'product_category_id' => $categoryId,
                    'description' => $item['notes'],
                    'price' => $item['price'],
                    'tax_iva' => $item['tax_iva'],
                    'unit' => 'servicio',
                    'is_service' => true,
                    'min_stock' => 0,
                    'is_controlled' => false,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Not necessary for this automated data entry
    }
};
