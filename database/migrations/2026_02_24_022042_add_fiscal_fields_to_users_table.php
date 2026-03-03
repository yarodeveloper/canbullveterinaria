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
        Schema::table('users', function (Blueprint $table) {
            $table->string('rfc', 13)->nullable()->after('behavior_profile');
            $table->string('tax_name')->nullable()->after('rfc'); // Business name (Razón Social)
            $table->string('tax_regime')->nullable()->after('tax_name'); // SAT Tax Regime code
            $table->string('tax_zip_code', 5)->nullable()->after('tax_regime');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
