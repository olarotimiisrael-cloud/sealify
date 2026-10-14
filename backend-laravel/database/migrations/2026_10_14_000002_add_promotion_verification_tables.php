<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ad Promotions lifecycle table
        Schema::create('ad_promotions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('ad_id');
            $table->string('promotion_plan_name');
            $table->integer('duration_months')->default(1);
            $table->decimal('amount', 14, 2);
            $table->enum('status', ['pending', 'approved', 'active', 'expired', 'terminated', 'rejected'])->default('pending');
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('terminated_at')->nullable();
            $table->foreign('ad_id')->references('id')->on('ads')->onDelete('cascade');
        });
        
        // Ad Promotion Receipts - payment proof attached to promotions
        Schema::create('ad_promotion_receipts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('promotion_id');
            $table->string('receipt_number');
            $table->string('invoice_number')->nullable();
            $table->string('payment_method')->default('flutterwave');
            $table->decimal('amount_paid', 14, 2);
            $table->string('payment_provider')->default('flutterwave');
            $table->string('flutterwave_transaction_id')->nullable();
            $table->string('receipt_image_url')->nullable();
            $table->string('receipt_pdf_url')->nullable();
            $table->text('payment_details')->nullable();
            $table->boolean('verified')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('verified_at')->nullable();
            $table->foreign('promotion_id')->references('id')->on('ad_promotions')->onDelete('cascade');
        });
        
        // User ID Verifications (NIN, BVN, Voters Card)
        Schema::create('user_verifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('id_type'); // nin, bvn, voters_card, drivers_license, international_passport
            $table->string('id_number'); // The actual ID number
            $table->string('id_document_url')->nullable();
            $table->string('id_document_thumbnail_url')->nullable();
            $table->string('verification_status')->default('pending'); // pending, verified, rejected, expired
            $table->string('verification_result')->nullable();
            $table->string('verification_notes')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // Some IDs expire
            $table->boolean('is_primary')->default(true);
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'id_type']);
        });
        
        // Business Verifications
        Schema::create('business_verifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('business_name')->nullable();
            $table->string('business_registration_number')->nullable();
            $table->string('business_address')->nullable();
            $table->string('registration_certificate_url')->nullable();
            $table->string('tax_identification_number')->nullable();
            $table->string('verification_status')->default('pending'); // pending, verified, rejected, expired
            $table->string('verification_result')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
        
        // User KYC/Acceptance Terms
        Schema::create('user_kyc_acceptances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->boolean('agreed_no_advance_payment')->default(false);
            $table->timestamp('accepted_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_kyc_acceptances');
        Schema::dropIfExists('business_verifications');
        Schema::dropIfExists('user_verifications');
        Schema::dropIfExists('ad_promotion_receipts');
        Schema::dropIfExists('ad_promotions');
    }
};