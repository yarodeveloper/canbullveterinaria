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
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('tax_iva', 5, 2)->default(0)->after('price'); // percentage (e.g. 16.00)
            $table->decimal('tax_ieps', 5, 2)->default(0)->after('tax_iva'); // percentage 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['tax_iva', 'tax_ieps']);
        });
    }
};
