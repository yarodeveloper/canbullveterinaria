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
        Schema::create('consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Owner/Client
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->string('type'); // surgery, euthanasia, hospitalization, etc.
            $table->string('status')->default('pending'); // pending, signed, cancelled
            $table->text('content'); // The legal text at the time of signing
            $table->longText('digital_signature')->nullable(); // Base64 image of the signature
            $table->timestamp('signed_at')->nullable();
            $table->string('signed_by_name')->nullable();
            $table->string('signed_by_id_number')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consents');
    }
};
