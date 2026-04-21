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
            $table->foreignId('source_quote_id')->nullable()->constrained('quotes')->onDelete('cascade')->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pending_charges', function (Blueprint $table) {
            $table->dropForeign(['source_quote_id']);
            $table->dropColumn('source_quote_id');
        });
    }
};
