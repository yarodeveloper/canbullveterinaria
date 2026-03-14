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
            $table->string('status')->default('active')->after('notes'); // active, deceased, inactive
            $table->date('death_date')->nullable()->after('status');
            $table->text('death_reason')->nullable()->after('death_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pets', function (Blueprint $table) {
            $table->dropColumn(['status', 'death_date', 'death_reason']);
        });
    }
};
