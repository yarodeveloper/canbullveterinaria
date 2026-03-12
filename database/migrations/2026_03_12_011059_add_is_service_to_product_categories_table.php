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
        if (!Schema::hasColumn('product_categories', 'is_service')) {
            Schema::table('product_categories', function (Blueprint $table) {
                $table->boolean('is_service')->default(false)->after('icon');
            });
        }

        $serviceCategories = [
            ['name' => 'Consultas', 'icon' => '🩺', 'is_service' => true],
            ['name' => 'Vacunas', 'icon' => '💉', 'is_service' => true],
            ['name' => 'Laboratorio', 'icon' => '🔬', 'is_service' => true],
            ['name' => 'Imagen', 'icon' => '📷', 'is_service' => true],
            ['name' => 'Cardiología', 'icon' => '❤️', 'is_service' => true],
            ['name' => 'Test Rápido', 'icon' => '⏱️', 'is_service' => true],
            ['name' => 'Cirugía Repro', 'icon' => '✂️', 'is_service' => true],
            ['name' => 'Cirugía Bucal', 'icon' => '🦷', 'is_service' => true],
            ['name' => 'Oftalmo', 'icon' => '👁️', 'is_service' => true],
            ['name' => 'Hospitalización', 'icon' => '🏥', 'is_service' => true],
            ['name' => 'Eutanasia', 'icon' => '🕊️', 'is_service' => true],
            ['name' => 'Certificados', 'icon' => '📝', 'is_service' => true],
            ['name' => 'Grooming / Spa', 'icon' => '✂️', 'is_service' => true]
        ];

        $now = now();
        foreach ($serviceCategories as $cat) {
            $slug = Str::slug($cat['name']);
            DB::table('product_categories')->updateOrInsert(
                ['slug' => $slug],
                [
                    'name' => $cat['name'],
                    'icon' => $cat['icon'],
                    'is_service' => $cat['is_service'],
                    'created_at' => $now,
                    'updated_at' => $now
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('product_categories', 'is_service')) {
            Schema::table('product_categories', function (Blueprint $table) {
                $table->dropColumn('is_service');
            });
        }
    }
};
