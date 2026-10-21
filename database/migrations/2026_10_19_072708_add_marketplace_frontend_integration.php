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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('buyer')->after('password');
            $table->string('cover_url')->nullable()->after('avatar_url');
            $table->string('business_name')->nullable()->after('bio');
            $table->string('business_category')->nullable()->after('business_name');
            $table->string('business_address')->nullable()->after('business_category');
            $table->string('cac_number')->nullable()->after('business_address');
            $table->string('business_hours')->nullable()->after('cac_number');
            $table->string('website_url')->nullable()->after('business_hours');
            $table->string('instagram_handle')->nullable()->after('website_url');
            $table->string('twitter_handle')->nullable()->after('instagram_handle');
            $table->string('whatsapp_number')->nullable()->after('twitter_handle');
            $table->boolean('email_notifications')->default(true)->after('whatsapp_number');
            $table->boolean('whatsapp_notifications')->default(false)->after('email_notifications');
            $table->boolean('hide_phone_publicly')->default(false)->after('whatsapp_notifications');
            $table->boolean('hide_location_publicly')->default(false)->after('hide_phone_publicly');
            $table->string('restriction_reason')->nullable()->after('status');
            $table->string('appeal_status')->default('none')->after('restriction_reason');
            $table->decimal('total_value_traded', 12, 2)->default(0)->after('balance');
            $table->unsignedInteger('completed_deals')->default(0)->after('total_value_traded');
            $table->json('verified_credentials')->nullable()->after('completed_deals');
            $table->unsignedTinyInteger('trust_score')->default(0)->after('verified_credentials');
            $table->date('credential_expiry_warning_date')->nullable()->after('trust_score');
            $table->json('verification_preferences')->nullable()->after('credential_expiry_warning_date');
            $table->string('referral_code')->nullable()->unique()->after('username');

            $table->index('role');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->string('color')->nullable()->after('icon');
            $table->text('description')->nullable()->after('color');
            $table->string('listing_type')->default('product')->after('description');
            $table->json('spec_fields')->nullable()->after('listing_type');
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->decimal('original_price', 12, 2)->nullable()->after('price');
            $table->string('video_url')->nullable()->after('location');
            $table->json('specifications')->nullable()->after('video_url');
            $table->boolean('featured')->default(false)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn(['original_price', 'video_url', 'specifications', 'featured']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['color', 'description', 'listing_type', 'spec_fields']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropUnique(['referral_code']);
            $table->dropColumn([
                'role', 'cover_url', 'business_name', 'business_category', 'business_address',
                'cac_number', 'business_hours', 'website_url', 'instagram_handle', 'twitter_handle',
                'whatsapp_number', 'email_notifications', 'whatsapp_notifications', 'hide_phone_publicly',
                'hide_location_publicly', 'restriction_reason', 'appeal_status', 'total_value_traded',
                'completed_deals', 'verified_credentials', 'trust_score', 'credential_expiry_warning_date',
                'verification_preferences', 'referral_code',
            ]);
        });
    }
};
