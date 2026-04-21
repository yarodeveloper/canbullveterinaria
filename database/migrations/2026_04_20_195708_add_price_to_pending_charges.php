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
        Schema::table('pending_charges', function (Blueprint $table) {
            $table->decimal('price', 12, 2)->nullable()->after('quantity');
            $table->string('description')->nullable()->after('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pending_charges', function (Blueprint $table) {
            $table->dropColumn(['price', 'description']);
        });
    }
};
