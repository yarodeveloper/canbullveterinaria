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
        Schema::table('surgeries', function (Blueprint $table) {
            $table->json('pre_operative_medications')->nullable();
            $table->json('intra_operative_medications')->nullable();
            $table->json('post_operative_medications')->nullable();
        });

        Schema::table('hospitalizations', function (Blueprint $table) {
            $table->json('medications')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surgeries', function (Blueprint $table) {
            $table->dropColumn(['pre_operative_medications', 'intra_operative_medications', 'post_operative_medications']);
        });

        Schema::table('hospitalizations', function (Blueprint $table) {
            $table->dropColumn('medications');
        });
    }
};
