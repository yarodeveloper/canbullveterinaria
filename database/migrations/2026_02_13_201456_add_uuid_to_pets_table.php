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
        Schema::table('pets', function (Blueprint $table) {
            $table->uuid('uuid')->unique()->after('id')->nullable();
        });

        // Initialize UUIDs for existing pets
        \App\Models\Pet::all()->each(function ($pet) {
            $pet->uuid = (string) \Illuminate\Support\Str::uuid();
            $pet->save();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pets', function (Blueprint $table) {
            //
        });
    }
};
