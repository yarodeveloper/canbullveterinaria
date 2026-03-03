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
        Schema::create('pet_breeds', function (Blueprint $table) {
            $table->id();
            $table->string('species'); // Canino, Felino, etc.
            $table->string('name');    // Raza
            $table->string('size')->nullable(); // Pequeño, Mediano, Grande
            $table->string('adult_weight')->nullable(); // Peso Aproximado Adulto
            $table->text('notes')->nullable(); // Notas Rápidas
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pet_breeds');
    }
};
