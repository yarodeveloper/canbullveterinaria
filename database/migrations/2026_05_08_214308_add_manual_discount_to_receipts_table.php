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
            $table->decimal('manual_discount_total', 12, 2)->default(0)->after('total');
            $table->unsignedBigInteger('discount_authorized_by')->nullable()->after('manual_discount_total');
            $table->string('discount_reason')->nullable()->after('discount_authorized_by');
            
            $table->foreign('discount_authorized_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('receipt_items', function (Blueprint $table) {
            $table->decimal('manual_discount_percent', 5, 2)->default(0)->after('discount_amount');
            $table->decimal('manual_discount_amount', 12, 2)->default(0)->after('manual_discount_percent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            $table->dropForeign(['discount_authorized_by']);
            $table->dropColumn(['manual_discount_total', 'discount_authorized_by', 'discount_reason']);
        });

        Schema::table('receipt_items', function (Blueprint $table) {
            $table->dropColumn(['manual_discount_percent', 'manual_discount_amount']);
        });
    }
};
