<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_metadata', function (Blueprint $table) {
            $table->id();
            $table->string('meta_key')->unique();
            $table->json('meta_value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::drop('site_metadata');
    }
};