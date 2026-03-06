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
        Schema::table('hospitalization_monitorings', function (Blueprint $table) {
            $table->string('lymph_nodes')->nullable();
            $table->string('abdominal_palpation')->nullable();
            $table->string('bcs')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hospitalization_monitorings', function (Blueprint $table) {
            $table->dropColumn(['lymph_nodes', 'abdominal_palpation', 'bcs']);
        });
    }
};
