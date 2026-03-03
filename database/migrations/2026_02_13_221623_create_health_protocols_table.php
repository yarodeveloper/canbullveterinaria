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
        Schema::create('health_protocols', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['vaccine', 'internal_deworming', 'external_deworming', 'other'])->default('vaccine');
            $table->string('species')->default('both'); // dog, cat, both
            $table->string('suggested_product')->nullable();
            $table->integer('days_until_next')->nullable(); // Sugerencia de días para el refuerzo
            $table->text('description')->nullable();
            $table->foreignId('branch_id')->nullable()->constrained(); // Null means global
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('health_protocols');
    }
};
