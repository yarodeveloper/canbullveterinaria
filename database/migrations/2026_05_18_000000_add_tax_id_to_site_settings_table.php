<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \DB::table('site_settings')->updateOrInsert(
            ['key' => 'tax_id'],
            [
                'value' => 'CANB123456XYZ',
                'type' => 'text',
                'group' => 'business_profile',
                'label' => 'RFC / Tax ID del Negocio (Global)',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \DB::table('site_settings')->where('key', 'tax_id')->delete();
    }
};
