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
            ['key' => 'pos_ticket_paper_feed'],
            [
                'value' => '30',
                'type' => 'number',
                'group' => 'finances',
                'label' => 'Salto de Papel (Paper Feed) en mm',
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
        \DB::table('site_settings')->where('key', 'pos_ticket_paper_feed')->delete();
    }
};
