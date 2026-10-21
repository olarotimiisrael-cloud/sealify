<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kyc_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->enum('type', ['nin', 'bvn', 'cac', 'drivers_license', 'voters_card']);
            $table->string('id_number_last4', 4);         // masked — never store full
            $table->string('id_number_hash', 64);          // sha256 for duplicate detection

            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->date('date_of_birth')->nullable();

            $table->enum('status', ['pending', 'verified', 'rejected', 'failed'])->default('pending');

            $table->string('provider', 32)->default('bytid');
            $table->string('provider_reference')->nullable();
            $table->json('provider_response')->nullable();
            $table->string('rejection_reason')->nullable();

            $table->dateTime('verified_at')->nullable();
            $table->dateTime('rejected_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('type');
            $table->index('provider_reference');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dateTime('kyc_verified_at')->nullable()->after('is_verified_seller');
            $table->enum('kyc_type', ['nin', 'bvn', 'cac', 'drivers_license', 'voters_card'])->nullable()->after('kyc_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['kyc_verified_at', 'kyc_type']);
        });
        Schema::dropIfExists('kyc_verifications');
    }
};
