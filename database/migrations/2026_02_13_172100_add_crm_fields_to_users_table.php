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
        Schema::table('users', function (Blueprint $col) {
            $col->string('address')->nullable();
            $col->string('emergency_contact_name')->nullable();
            $col->string('emergency_contact_phone')->nullable();
            $col->string('tax_id')->nullable(); // RFC in Mexico
            $col->text('crm_notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['address', 'emergency_contact_name', 'emergency_contact_phone', 'tax_id', 'crm_notes']);
        });
    }
};
