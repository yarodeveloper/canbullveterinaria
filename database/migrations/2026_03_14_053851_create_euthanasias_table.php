<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('euthanasias', function (Blueprint $table) {
            $table->id();
            $table->string('folio')->unique()->nullable(); // Folio interno abierto
            $table->foreignId('pet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('veterinarian_id')->constrained('users');
            $table->foreignId('branch_id')->constrained('branches');
            $table->dateTime('performed_at'); // Fecha/hora del procedimiento
            $table->enum('status', ['scheduled', 'completed', 'cancelled'])->default('scheduled');

            // Datos clínicos
            $table->decimal('weight', 8, 2)->nullable(); // Peso en kg
            $table->string('reason'); // Motivo principal (selector)
            $table->text('reason_detail')->nullable(); // Descripción clínica libre

            // Medicamentos empleados (JSON — desde inventario o manual)
            $table->json('medications')->nullable();

            // Contexto familiar/social
            $table->boolean('owner_present')->default(false);
            $table->text('owner_authorization')->nullable(); // Texto de autorización
            $table->boolean('consent_signed')->default(false);

            // Destino del cuerpo
            $table->string('disposition')->nullable(); // cremacion_individual, cremacion_colectiva, entierro, propietario
            $table->string('cremation_provider')->nullable();

            // Notas finales
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('euthanasias');
    }
};
