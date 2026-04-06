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
        Schema::table('receipts', function (Blueprint $table) {
            $table->decimal('tax_iva', 12, 2)->default(0)->after('subtotal');
            $table->decimal('tax_ieps', 12, 2)->default(0)->after('tax_iva');
        });

        Schema::table('receipt_items', function (Blueprint $table) {
            $table->decimal('tax_iva', 12, 2)->default(0)->after('subtotal');
            $table->decimal('tax_ieps', 12, 2)->default(0)->after('tax_iva');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            $table->dropColumn(['tax_iva', 'tax_ieps']);
        });

        Schema::table('receipt_items', function (Blueprint $table) {
            $table->dropColumn(['tax_iva', 'tax_ieps']);
        });
    }
};
