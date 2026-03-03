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
        Schema::create('surgeries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('veterinarian_id')->constrained('users')->onDelete('cascade'); // Lead Surgeon
            $table->foreignId('anesthesiologist_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('surgery_type');
            $table->string('status')->default('scheduled'); // scheduled, in-progress, completed, cancelled
            $table->string('asa_classification')->nullable(); // Anesthesia risk
            $table->dateTime('scheduled_at');
            $table->dateTime('start_time')->nullable();
            $table->dateTime('end_time')->nullable();
            $table->text('pre_op_notes')->nullable();
            $table->text('intra_op_notes')->nullable();
            $table->text('post_op_notes')->nullable();
            $table->json('checklist')->nullable(); // Store pre/intra/post-op checklist data
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surgeries');
    }
};
