<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Medicamentos', 'slug' => 'medicamentos', 'description' => 'Fármacos en general', 'icon' => '💊'],
            ['name' => 'Medicamentos Controlados', 'slug' => 'medicamentos-controlados', 'description' => 'Medicamentos de uso exclusivo y controlado', 'icon' => '⚠️'],
            ['name' => 'Material de Curación', 'slug' => 'material-curacion', 'description' => 'Insumos médicos genéricos (gasas, jeringas, etc)', 'icon' => '🩹'],
            ['name' => 'Alimentos', 'slug' => 'alimentos', 'description' => 'Dietas prescritas y de mantenimiento', 'icon' => '🦴'],
            ['name' => 'Accesorios', 'slug' => 'accesorios', 'description' => 'Correas, collares, juguetes, cepillos', 'icon' => '🎾'],
            ['name' => 'Vacunas', 'slug' => 'vacunas', 'description' => 'Biológicos y protocolos de inmunización', 'icon' => '💉'],
            ['name' => 'Estética y Limpieza', 'slug' => 'estetica', 'description' => 'Shampoos y suministros de grooming', 'icon' => '✂️'],
        ];

        foreach ($categories as $cat) {
            $category = \App\Models\ProductCategory::updateOrCreate(
                ['slug' => $cat['slug']],
                ['name' => $cat['name'], 'description' => $cat['description'], 'icon' => $cat['icon']]
            );

            if ($cat['slug'] === 'vacunas') {
                \App\Models\Product::updateOrCreate(
                    ['sku' => 'VAC-QUI-001'],
                    [
                        'product_category_id' => $category->id,
                        'name' => 'Vacuna Quíntuple',
                        'unit' => 'frasco',
                        'min_stock' => 5,
                        'price' => 450.00,
                    ]
                );
            }

            if ($cat['slug'] === 'medicamentos') {
                \App\Models\Product::updateOrCreate(
                    ['sku' => 'MED-MEL-002'],
                    [
                        'product_category_id' => $category->id,
                        'name' => 'Meloxicam 0.5mg',
                        'unit' => 'frasco',
                        'min_stock' => 10,
                        'price' => 320.00,
                    ]
                );
            }
        }
    }
}
