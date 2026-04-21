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
        Schema::create('service_template_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_template_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('category', ['Insumos', 'Materiales', 'Medicamentos', 'Equipos', 'Renta de Equipos', 'Apoyo Médico', 'Servicios']);
            $table->string('description');
            $table->boolean('is_dosable')->default(false);
            $table->decimal('base_dose', 8, 4)->nullable()->comment('Dose per unit_weight');
            $table->decimal('unit_weight', 8, 2)->nullable()->comment('Usually 1 kg');
            $table->decimal('suggested_quantity', 10, 2)->default(1);
            $table->decimal('suggested_price', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_template_items');
    }
};
