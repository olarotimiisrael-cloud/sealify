<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('balance', 14, 2)->default(0)->after('is_verified_seller');
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['credit', 'debit', 'refund']);
            $table->decimal('amount', 14, 2);
            $table->decimal('balance_after', 14, 2);
            $table->string('description');
            $table->nullableMorphs('source');   // e.g. withdrawal, listing_sale, admin_credit
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_account_id')->constrained()->restrictOnDelete();

            $table->decimal('amount', 14, 2);               // what user asked for
            $table->decimal('fee', 14, 2)->default(0);       // our fee
            $table->decimal('net_amount', 14, 2);            // amount - fee

            $table->enum('status', [
                'pending', 'approved', 'processing', 'completed', 'rejected', 'failed',
            ])->default('pending');

            $table->string('reference')->unique();
            $table->string('provider', 32)->default('paystack');
            $table->string('provider_transfer_code')->nullable();
            $table->string('provider_reference')->nullable();
            $table->json('provider_response')->nullable();

            $table->foreignId('reviewed_by_admin_id')->nullable();
            $table->dateTime('reviewed_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->string('rejection_reason')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });

        // Add is_admin_reviewed flag to admins (from Phase 6a) — nope, already exists
        // Add foreign key on admins table for reviewer
        Schema::table('withdrawals', function (Blueprint $table) {
            // optional FK, will be added in admin phase if desired
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
        Schema::dropIfExists('wallet_transactions');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('balance');
        });
    }
};
