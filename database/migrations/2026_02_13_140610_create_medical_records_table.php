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
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Veterinarian
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['consultation', 'follow-up', 'emergency', 'specialty']);
            
            // SOAP Structure
            $table->text('subjective')->nullable(); // Anamnesis
            $table->text('objective')->nullable();  // Physical exam
            $table->text('assessment')->nullable(); // Diagnosis
            $table->text('plan')->nullable();       // Treatment
            
            $table->json('vital_signs')->nullable(); // Weight, Temp, HR, RR
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
