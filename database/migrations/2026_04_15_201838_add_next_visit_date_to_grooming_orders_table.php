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
        Schema::table('grooming_orders', function (Blueprint $table) {
            $table->date('next_visit_date')->nullable()->after('notes');
        });

        // Add setting for default next visit days
        \App\Models\SiteSetting::updateOrCreate(
            ['key' => 'grooming_next_visit_days'],
            [
                'value' => '30',
                'type' => 'number',
                'group' => 'grooming',
                'label' => 'Días para próxima visita de Estética/Spa'
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grooming_orders', function (Blueprint $table) {
            $table->dropColumn('next_visit_date');
        });

        \App\Models\SiteSetting::where('key', 'grooming_next_visit_days')->delete();
    }
};
