<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internal_analytics', function (Blueprint $便利) {
            $便利->id();
            $便利->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $便利->string('page_url');
            $便利->string('page_name')->nullable();
            $便利->string('ip_address')->nullable();
            $便利->string('user_agent')->nullable();
            $便利->timestamp('viewed_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_analytics');
    }
};
