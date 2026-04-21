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
            $table->dropForeign(['client_id']);
            $table->dropForeign(['pet_id']);
            
            $table->unsignedBigInteger('client_id')->nullable()->change();
            $table->unsignedBigInteger('pet_id')->nullable()->change();
            
            $table->foreign('client_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('pet_id')->references('id')->on('pets')->nullOnDelete();
            
            $table->string('guest_client_name')->nullable()->after('client_id');
            $table->string('guest_pet_name')->nullable()->after('pet_id');
            $table->string('guest_species')->nullable()->after('guest_pet_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn(['guest_client_name', 'guest_pet_name', 'guest_species']);
            $table->dropForeign(['client_id']);
            $table->dropForeign(['pet_id']);
            
            $table->unsignedBigInteger('client_id')->nullable(false)->change();
            $table->unsignedBigInteger('pet_id')->nullable(false)->change();
            
            $table->foreign('client_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('pet_id')->references('id')->on('pets')->cascadeOnDelete();
        });
    }
};
