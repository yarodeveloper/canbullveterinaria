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
        Schema::table('service_template_items', function (Blueprint $table) {
            $table->string('category')->change();
        });

        Schema::table('quote_items', function (Blueprint $table) {
            $table->string('category')->change();
        });

        Schema::table('service_templates', function (Blueprint $table) {
            $table->string('animal_type')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Not easily reversible
    }
};
