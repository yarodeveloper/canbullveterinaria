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
        Schema::create('hospitalization_monitorings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hospitalization_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            
            // Constantes vitales
            $table->decimal('temperature', 5, 2)->nullable();
            $table->integer('heart_rate')->nullable();
            $table->integer('respiratory_rate')->nullable();
            $table->string('mucosa_color')->nullable();
            $table->string('capillary_refill_time')->nullable();
            $table->string('blood_pressure')->nullable();
            $table->string('hydration_status')->nullable();
            $table->integer('pain_score')->nullable(); // 0-10
            $table->string('mental_state')->nullable();
            
            $table->text('medication_administered')->nullable();
            $table->string('food_intake')->nullable();
            $table->string('urination')->nullable();
            $table->string('defecation')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hospitalization_monitorings');
    }
};
