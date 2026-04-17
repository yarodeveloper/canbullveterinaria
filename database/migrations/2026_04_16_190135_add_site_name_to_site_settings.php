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
        \App\Models\SiteSetting::firstOrCreate(
            ['key' => 'site_name'],
            ['value' => 'Canbull', 'type' => 'text', 'group' => 'business_profile', 'label' => 'Nombre del Sitio (Global)']
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \App\Models\SiteSetting::where('key', 'site_name')->delete();
    }
};
