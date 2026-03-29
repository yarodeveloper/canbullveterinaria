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
        \App\Models\SiteSetting::updateOrCreate(
            ['key' => 'pos_ticket_preview'],
            [
                'value' => '0',
                'type' => 'boolean',
                'group' => 'finances',
                'label' => 'Mostrar vista previa del ticket'
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \App\Models\SiteSetting::where('key', 'pos_ticket_preview')->delete();
    }
};
