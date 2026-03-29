<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\SiteSetting;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        SiteSetting::updateOrCreate(
            ['key' => 'pos_printer_name'],
            [
                'value' => 'POS-80',
                'type' => 'text',
                'group' => 'finances',
                'label' => 'Nombre de la Impresora de PDV (80mm)'
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        SiteSetting::where('key', 'pos_printer_name')->delete();
    }
};
