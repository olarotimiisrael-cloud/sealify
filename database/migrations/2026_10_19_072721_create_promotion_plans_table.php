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
        Schema::create('promotion_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('months');
            $table->string('label');
            $table->decimal('rate', 12, 2);
            $table->string('badge')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('months');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion_plans');
    }
};
