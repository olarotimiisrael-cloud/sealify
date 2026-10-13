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
        // Market Insights
        if (! Schema::hasTable('market_insights')) {
            Schema::create('market_insights', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description');
                $table->string('category')->nullable();
                $table->string('type')->nullable();
                $table->json('data')->nullable();
                $table->timestamp('published_at')->nullable();
                $table->timestamps();
            });
        }

        // Adsense
        if (! Schema::hasTable('adsense')) {
            Schema::create('adsense', function (Blueprint $table) {
                $table->id();
                $table->string('position');
                $table->string('ad_client');
                $table->string('ad_slot');
                $table->string('format')->default('auto');
                $table->boolean('responsive')->default(true);
                $table->boolean('active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // AI Generations
        if (! Schema::hasTable('ai_generations')) {
            Schema::create('ai_generations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('type');
                $table->text('prompt');
                $table->string('model')->nullable();
                $table->json('parameters')->nullable();
                $table->json('result')->nullable();
                $table->string('status')->default('pending');
                $table->text('error')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();
            });
        }

        // Email Outbox (if not already created)
        if (! Schema::hasTable('email_outbox')) {
            Schema::create('email_outbox', function (Blueprint $table) {
                $table->id();
                $table->string('template');
                $table->string('recipient');
                $table->json('payload')->nullable();
                $table->string('status')->default('pending');
                $table->integer('attempts')->default(0);
                $table->text('last_error')->nullable();
                $table->string('dedupe_key')->nullable();
                $table->timestamp('scheduled_at')->useCurrent();
                $table->timestamp('sent_at')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // Push Subscriptions (if not already created)
        if (! Schema::hasTable('push_subscriptions')) {
            Schema::create('push_subscriptions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->text('endpoint');
                $table->text('p256dh')->nullable();
                $table->text('auth')->nullable();
                $table->timestamps();
                $table->unique(['user_id', 'endpoint'], 'push_subscriptions_unique');
            });
        }

        // Referrals (if not already created)
        if (! Schema::hasTable('referrals')) {
            Schema::create('referrals', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('referrer_id');
                $table->unsignedBigInteger('referee_id')->unique();
                $table->string('referral_code');
                $table->integer('cycle')->default(1);
                $table->string('status')->default('credited');
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // Referral Rewards (if not already created)
        if (! Schema::hasTable('referral_rewards')) {
            Schema::create('referral_rewards', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->integer('cycle');
                $table->integer('referrals_at_reset');
                $table->unsignedBigInteger('granted_by')->nullable();
                $table->text('note')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->unique(['user_id', 'cycle']);
            });
        }

        // Referral Clicks (if not already created)
        if (! Schema::hasTable('referral_clicks')) {
            Schema::create('referral_clicks', function (Blueprint $table) {
                $table->id();
                $table->string('code');
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->string('landing_path')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // Saved Searches (if not already created)
        if (! Schema::hasTable('saved_searches')) {
            Schema::create('saved_searches', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('name');
                $table->text('search_query')->nullable();
                $table->string('category')->nullable();
                $table->string('location')->nullable();
                $table->decimal('min_price', 14, 2)->nullable();
                $table->decimal('max_price', 14, 2)->nullable();
                $table->boolean('is_active')->default(true);
                $table->boolean('email_notifications')->default(true);
                $table->string('frequency')->default('immediate');
                $table->timestamp('last_notified_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('market_insights');
        Schema::dropIfExists('adsense');
        Schema::dropIfExists('ai_generations');
        Schema::dropIfExists('email_outbox');
        Schema::dropIfExists('push_subscriptions');
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('referral_rewards');
        Schema::dropIfExists('referral_clicks');
        Schema::dropIfExists('saved_searches');
    }
};