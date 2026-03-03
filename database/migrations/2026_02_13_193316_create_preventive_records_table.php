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
        Schema::create('preventive_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['vaccine', 'internal_deworming', 'external_deworming', 'other'])->default('vaccine');
            $table->string('name'); // e.g., "Sextuple", "Rabia", "Bravecto"
            $table->date('application_date');
            $table->date('next_due_date')->nullable();
            $table->string('lot_number')->nullable();
            $table->string('brand')->nullable();
            $table->decimal('weight_at_time', 8, 2)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('veterinarian_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('branch_id')->constrained();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preventive_records');
    }
};
