<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 64)->unique();
            $table->string('provider_reference', 128)->nullable();
            $table->string('provider', 32)->default('paystack');

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('NGN');

            $table->enum('purpose', [
                'test_payment',
                'promotion_boost',
                'verification_fee',
                'listing_fee',
                'withdrawal_fee',
            ]);

            $table->enum('status', [
                'pending',
                'success',
                'failed',
                'abandoned',
            ])->default('pending');

            $table->json('metadata')->nullable();
            $table->json('provider_response')->nullable();
            $table->string('error_message')->nullable();

            $table->dateTime('paid_at')->nullable();
            $table->dateTime('failed_at')->nullable();
            $table->dateTime('expires_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'purpose']);
            $table->index('provider_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
