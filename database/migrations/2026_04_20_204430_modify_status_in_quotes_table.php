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
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('status')->default('Borrador')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            // Revertir a enum si es necesario, pero string es más flexible
            $table->enum('status', ['Borrador', 'Enviada', 'Aceptada', 'Rechazada', 'Vencida'])->default('Borrador')->change();
        });
    }
};
