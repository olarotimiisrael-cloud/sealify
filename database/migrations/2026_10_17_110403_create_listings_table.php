<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();

            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 12, 2);
            $table->boolean('price_negotiable')->default(false);
            $table->enum('condition', ['new', 'like_new', 'good', 'fair', 'needs_repair'])
                ->default('good');
            $table->string('location');
            $table->enum('status', ['draft', 'active', 'sold', 'archived'])
                ->default('active');
            $table->unsignedInteger('views_count')->default(0);
            $table->dateTime('expires_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
            $table->index(['category_id', 'status']);
            $table->index('user_id');
            $table->index('location');
            $table->index('price');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
