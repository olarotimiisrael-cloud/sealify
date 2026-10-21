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
        Schema::create('safe_spots', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('zone');
            $table->string('category');
            $table->string('address');
            $table->string('distance')->nullable();
            $table->string('hours')->nullable();
            $table->boolean('cctv_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'zone']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('safe_spots');
    }
};
