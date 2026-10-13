<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $profileColumns = [
                'full_name', 'phone_number', 'avatar_url', 'cover_url', 'store_banner_url', 'business_name',
                'business_category', 'business_address', 'cac_number', 'business_hours', 'bank_name',
                'account_number', 'account_name', 'website_url', 'instagram_handle', 'twitter_handle',
                'whatsapp_number', 'bio', 'location', 'restriction_reason', 'referral_code',
            ];

            foreach ($profileColumns as $column) {
                if (! Schema::hasColumn('users', $column)) {
                    $table->string($column)->nullable();
                }
            }

            foreach (['email_confirmed_at', 'phone_verified_at', 'last_login_at', 'credential_expiry_warning_date'] as $column) {
                if (! Schema::hasColumn('users', $column)) {
                    $table->timestamp($column)->nullable();
                }
            }

            $enumColumns = [
                'role' => 'buyer',
                'verification_type' => 'none',
                'status' => 'active',
                'appeal_status' => 'none',
            ];

            foreach ($enumColumns as $column => $default) {
                if (! Schema::hasColumn('users', $column)) {
                    $table->string($column)->default($default);
                }
            }

            $booleanColumns = [
                'verified', 'email_notifications', 'whatsapp_notifications', 'hide_phone_publicly',
                'hide_location_publicly',
            ];

            foreach ($booleanColumns as $column) {
                if (! Schema::hasColumn('users', $column)) {
                    $table->boolean($column)->default(false);
                }
            }

            foreach (['referral_count', 'referral_cycle', 'completed_deals', 'trust_score'] as $column) {
                if (! Schema::hasColumn('users', $column)) {
                    $table->integer($column)->default(0);
                }
            }

            foreach (['total_value_traded'] as $column) {
                if (! Schema::hasColumn('users', $column)) {
                    $table->decimal($column, 14, 2)->default(0);
                }
            }

            foreach (['verified_credentials', 'verification_preferences'] as $column) {
                if (! Schema::hasColumn('users', $column)) {
                    $table->json($column)->nullable();
                }
            }

            foreach (['last_login_ip'] as $column) {
                if (! Schema::hasColumn('users', $column)) {
                    $table->string($column)->nullable();
                }
            }
        });

        $tables = [
            'categories' => function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->string('icon_name')->nullable();
                $table->string('color')->nullable();
                $table->text('description')->nullable();
                $table->unsignedBigInteger('parent_id')->nullable();
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            },
            'subcategories' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('category_id');
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('icon_name')->nullable();
                $table->string('listing_type')->default('product');
                $table->json('spec_fields')->nullable();
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            },
            'ads' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('seller_id');
                $table->string('title');
                $table->text('description');
                $table->decimal('price', 14, 2);
                $table->decimal('original_price', 14, 2)->nullable();
                $table->unsignedBigInteger('category_id')->nullable();
                $table->unsignedBigInteger('subcategory_id')->nullable();
                $table->string('condition');
                $table->string('location')->default('Ogbomoso, Oyo State');
                $table->string('status')->default('active');
                $table->integer('views_count')->default(0);
                $table->boolean('featured')->default(false);
                $table->string('promotion_plan_name')->nullable();
                $table->integer('promotion_duration_months')->nullable();
                $table->timestamp('promotion_start_date')->nullable();
                $table->timestamp('promotion_end_date')->nullable();
                $table->string('payment_status')->default('pending');
                $table->string('payment_proof_url')->nullable();
                $table->decimal('amount_paid', 14, 2)->nullable();
                $table->json('images')->nullable();
                $table->string('video_url')->nullable();
                $table->json('specifications')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent();
                $table->index(['status', 'created_at']);
            },
            'ad_images' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('ad_id');
                $table->string('image_url');
                $table->string('storage_path')->nullable();
                $table->integer('sort_order')->default(0);
                $table->boolean('is_primary')->default(false);
                $table->timestamp('created_at')->useCurrent();
            },
            'announcements' => function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('message');
                $table->string('type')->default('info');
                $table->boolean('active')->default(true);
                $table->json('target_roles')->nullable();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->timestamps();
            },
            'reviews' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('seller_id');
                $table->unsignedBigInteger('buyer_id');
                $table->string('buyer_name')->nullable();
                $table->string('buyer_avatar')->nullable();
                $table->unsignedTinyInteger('rating');
                $table->text('comment');
                $table->string('status')->default('approved');
                $table->timestamps();
            },
            'buyer_requests' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('user_name')->nullable();
                $table->string('user_avatar')->nullable();
                $table->string('title');
                $table->unsignedBigInteger('category_id')->nullable();
                $table->decimal('max_budget', 14, 2);
                $table->string('location');
                $table->text('description');
                $table->integer('responses_count')->default(0);
                $table->string('status')->default('open');
                $table->timestamps();
            },
            'buyer_request_responses' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('request_id');
                $table->unsignedBigInteger('seller_id');
                $table->string('seller_name')->nullable();
                $table->string('seller_avatar')->nullable();
                $table->decimal('proposed_price', 14, 2);
                $table->text('message')->nullable();
                $table->string('status')->default('pending');
                $table->timestamp('created_at')->useCurrent();
            },
            'favorites' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('ad_id');
                $table->timestamp('created_at')->useCurrent();
                $table->unique(['user_id', 'ad_id']);
            },
            'search_alerts' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->text('query')->nullable();
                $table->unsignedBigInteger('category_id')->nullable();
                $table->decimal('max_price', 14, 2)->nullable();
                $table->string('location')->nullable();
                $table->integer('match_count')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            },
            'saved_searches' => function (Blueprint $table) {
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
            },
            'user_settings' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->boolean('email_notifications')->default(true);
                $table->boolean('whatsapp_notifications')->default(true);
                $table->boolean('push_notifications')->default(true);
                $table->boolean('price_drop_alerts')->default(true);
                $table->boolean('new_message_alerts')->default(true);
                $table->boolean('weekly_digest')->default(true);
                $table->boolean('promotion_expiry_reminders')->default(true);
                $table->string('language')->default('en');
                $table->string('theme')->default('dark');
                $table->timestamps();
            },
            'push_subscriptions' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->text('endpoint');
                $table->text('p256dh')->nullable();
                $table->text('auth')->nullable();
                $table->timestamps();
                $table->unique(['user_id', 'endpoint'], 'push_subscriptions_unique');
            },
            'verification_requests' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('user_name')->nullable();
                $table->string('user_email')->nullable();
                $table->string('type');
                $table->string('doc_type')->nullable();
                $table->string('doc_number')->nullable();
                $table->string('doc_url')->nullable();
                $table->string('id_document_url')->nullable();
                $table->string('status')->default('pending');
                $table->text('admin_notes')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamps();
            },
            'password_requests' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('user_email')->nullable();
                $table->string('user_name')->nullable();
                $table->string('nin');
                $table->string('id_document_url');
                $table->text('new_password_hash')->nullable();
                $table->text('reason');
                $table->string('status')->default('pending');
                $table->text('admin_notes')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamps();
            },
            'conversations' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('ad_id');
                $table->unsignedBigInteger('participant_1');
                $table->unsignedBigInteger('participant_2');
                $table->text('last_message')->nullable();
                $table->timestamp('last_message_time')->nullable();
                $table->timestamps();
                $table->unique(['ad_id', 'participant_1', 'participant_2']);
            },
            'messages' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('conversation_id');
                $table->unsignedBigInteger('sender_id');
                $table->unsignedBigInteger('receiver_id');
                $table->unsignedBigInteger('ad_id');
                $table->text('content');
                $table->string('status')->default('sent');
                $table->boolean('read')->default(false);
                $table->timestamp('created_at')->useCurrent();
            },
            'notifications' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('type');
                $table->string('title');
                $table->text('description');
                $table->boolean('read')->default(false);
                $table->string('link_url')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'reports' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('ad_id')->nullable();
                $table->string('ad_title')->nullable();
                $table->unsignedBigInteger('reporter_id');
                $table->string('reporter_name')->nullable();
                $table->string('reason');
                $table->text('details')->nullable();
                $table->string('status')->default('pending');
                $table->text('admin_notes')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'audit_logs' => function (Blueprint $table) {
                $table->id();
                $table->string('action');
                $table->text('details');
                $table->string('type');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'intrusion_logs' => function (Blueprint $table) {
                $table->id();
                $table->string('attempted_email');
                $table->json('device_info')->nullable();
                $table->boolean('media_captured')->default(false);
                $table->string('media_status')->nullable();
                $table->string('status')->default('flagged');
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'system_configs' => function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->json('value');
                $table->text('description')->nullable();
                $table->timestamp('updated_at')->useCurrent();
            },
            'site_settings' => function (Blueprint $table) {
                $table->id();
                $table->string('logo_url')->nullable();
                $table->string('site_name')->nullable();
                $table->text('site_description')->nullable();
                $table->string('og_image')->nullable();
                $table->string('contact_email')->nullable();
                $table->string('contact_phone')->nullable();
                $table->string('favicon_url')->nullable();
                $table->string('apple_touch_icon_url')->nullable();
                $table->string('og_title')->nullable();
                $table->text('og_description')->nullable();
                $table->string('og_type')->default('website');
                $table->string('og_image_alt')->nullable();
                $table->string('og_locale')->default('en_NG');
                $table->string('og_site_url')->nullable();
                $table->string('twitter_card')->default('summary_large_image');
                $table->string('twitter_site_handle')->nullable();
                $table->string('twitter_creator_handle')->nullable();
                $table->string('twitter_title')->nullable();
                $table->text('twitter_description')->nullable();
                $table->string('twitter_image')->nullable();
                $table->string('heading_home_title')->nullable();
                $table->text('heading_home_subtitle')->nullable();
                $table->string('heading_home_cta')->nullable();
                $table->string('heading_home_cta_url')->nullable();
                $table->string('heading_home_badge')->nullable();
                $table->string('page_title_home')->nullable();
                $table->text('meta_description_home')->nullable();
                $table->string('canonical_url')->nullable();
                $table->string('theme_color')->default('#10b981');
                $table->string('manifest_name')->nullable();
                $table->string('manifest_short_name')->nullable();
                $table->boolean('robots_indexing')->default(true);
                $table->json('page_metadata')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamp('updated_at')->useCurrent();
            },
            'promotion_plans' => function (Blueprint $table) {
                $table->id();
                $table->integer('months');
                $table->string('label');
                $table->decimal('rate', 14, 2);
                $table->string('badge')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            },
            'safe_spots' => function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('zone');
                $table->string('category');
                $table->string('address');
                $table->string('distance');
                $table->string('hours');
                $table->boolean('cctv_verified')->default(false);
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamp('created_at')->useCurrent();
            },
            'recent_deals' => function (Blueprint $table) {
                $table->id();
                $table->string('item_title');
                $table->decimal('price', 14, 2);
                $table->string('location');
                $table->string('time');
                $table->timestamp('created_at')->useCurrent();
            },
            'wallets' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->decimal('balance', 14, 2)->default(0);
                $table->decimal('pending_balance', 14, 2)->default(0);
                $table->decimal('total_withdrawn', 14, 2)->default(0);
                $table->string('currency')->default('NGN');
                $table->timestamp('updated_at')->useCurrent();
            },
            'transactions' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('wallet_id');
                $table->string('type');
                $table->decimal('amount', 14, 2);
                $table->string('status')->default('pending');
                $table->text('description');
                $table->string('reference')->nullable();
                $table->unsignedBigInteger('related_ad_id')->nullable();
                $table->unsignedBigInteger('related_user_id')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'promotion_payments' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('ad_id');
                $table->decimal('amount', 14, 2);
                $table->string('payment_method')->nullable();
                $table->string('payment_proof_url')->nullable();
                $table->string('status')->default('pending');
                $table->string('plan_name');
                $table->integer('duration_months');
                $table->text('admin_notes')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamps();
            },
            'disputes' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('user_email');
                $table->string('receipt_ref')->nullable();
                $table->string('item_title');
                $table->string('counterparty');
                $table->string('category');
                $table->string('reason');
                $table->text('details');
                $table->string('evidence_url')->nullable();
                $table->string('status')->default('pending');
                $table->text('admin_notes')->nullable();
                $table->timestamp('resolved_at')->nullable();
                $table->timestamps();
            },
            'escrow_orders' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('ad_id');
                $table->unsignedBigInteger('buyer_id');
                $table->unsignedBigInteger('seller_id');
                $table->decimal('amount', 14, 2);
                $table->string('status')->default('created');
                $table->string('handover_code')->unique();
                $table->string('qr_code_url')->nullable();
                $table->string('inspection_location')->nullable();
                $table->timestamp('inspection_completed_at')->nullable();
                $table->timestamp('released_at')->nullable();
                $table->timestamp('disputed_at')->nullable();
                $table->timestamp('refunded_at')->nullable();
                $table->timestamps();
            },
            'analytics_events' => function (Blueprint $table) {
                $table->id();
                $table->string('session_id');
                $table->string('event_name');
                $table->json('properties')->nullable();
                $table->text('url')->nullable();
                $table->text('referrer')->nullable();
                $table->text('user_agent')->nullable();
                $table->string('viewport')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'performance_metrics' => function (Blueprint $table) {
                $table->id();
                $table->string('session_id');
                $table->string('metric_name');
                $table->decimal('value', 10, 2);
                $table->string('rating');
                $table->timestamp('timestamp')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'email_otps' => function (Blueprint $table) {
                $table->id();
                $table->string('email');
                $table->string('otp_hash');
                $table->timestamp('expires_at')->nullable();
                $table->timestamp('used_at')->nullable();
                $table->integer('attempts')->default(0);
                $table->string('delivered_via')->default('email');
                $table->string('sent_to_email')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'phone_otps' => function (Blueprint $table) {
                $table->id();
                $table->string('phone_number');
                $table->string('otp_hash');
                $table->timestamp('expires_at')->nullable();
                $table->timestamp('used_at')->nullable();
                $table->integer('attempts')->default(0);
                $table->string('delivered_via')->default('in_app');
                $table->timestamp('created_at')->useCurrent();
            },
            'admin_messages' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('sender_id');
                $table->unsignedBigInteger('receiver_id');
                $table->string('title');
                $table->text('content');
                $table->string('content_type')->default('text');
                $table->string('status')->default('sent');
                $table->string('channel')->default('in_app');
                $table->timestamp('delivered_at')->nullable();
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            },
            'admin_broadcasts' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('sender_id');
                $table->string('target');
                $table->string('title');
                $table->text('content');
                $table->string('content_type')->default('text');
                $table->string('channel')->default('in_app');
                $table->json('user_ids')->nullable();
                $table->json('audience')->nullable();
                $table->integer('sent_count')->default(0);
                $table->integer('delivered_count')->default(0);
                $table->integer('read_count')->default(0);
                $table->integer('failed_count')->default(0);
                $table->timestamp('sent_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'admin_signup_alerts' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('email');
                $table->string('full_name')->nullable();
                $table->string('phone_number')->nullable();
                $table->string('location')->nullable();
                $table->string('role')->default('buyer');
                $table->string('signup_channel')->default('email');
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->string('follow_up_status')->default('pending');
                $table->text('follow_up_note')->nullable();
                $table->timestamp('follow_up_at')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'admin_login_sessions' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('admin_id');
                $table->string('email');
                $table->timestamp('login_at')->useCurrent();
                $table->timestamp('logout_at')->nullable();
                $table->string('ip_address')->nullable();
                $table->string('country')->nullable();
                $table->string('region')->nullable();
                $table->string('city')->nullable();
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->string('browser_name')->nullable();
                $table->string('browser_version')->nullable();
                $table->string('os_name')->nullable();
                $table->string('os_version')->nullable();
                $table->string('device_type')->nullable();
                $table->string('device_brand')->nullable();
                $table->string('device_model')->nullable();
                $table->string('access_method')->default('password');
                $table->string('session_token_id')->nullable();
                $table->text('user_agent')->nullable();
                $table->integer('session_duration_seconds')->nullable();
                $table->string('status')->default('logged_in');
                $table->timestamp('last_activity_at')->nullable();
                $table->timestamps();
            },
            'referrals' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('referrer_id');
                $table->unsignedBigInteger('referee_id')->unique();
                $table->string('referral_code');
                $table->integer('cycle')->default(1);
                $table->string('status')->default('credited');
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'referral_rewards' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->integer('cycle');
                $table->integer('referrals_at_reset');
                $table->unsignedBigInteger('granted_by')->nullable();
                $table->text('note')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->unique(['user_id', 'cycle']);
            },
            'referral_clicks' => function (Blueprint $table) {
                $table->id();
                $table->string('code');
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->string('landing_path')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'email_outbox' => function (Blueprint $table) {
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
            },
            'shareable_links' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('content_type');
                $table->string('content_id');
                $table->string('platform');
                $table->text('url');
                $table->string('utm_source')->default('sealify');
                $table->string('utm_medium')->default('social');
                $table->string('utm_campaign')->default('organic_share');
                $table->string('utm_content')->nullable();
                $table->string('referrer_code')->nullable();
                $table->integer('clicks')->default(0);
                $table->integer('shares')->default(0);
                $table->integer('conversions')->default(0);
                $table->timestamp('expires_at')->nullable();
                $table->timestamp('last_used_at')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'ad_card_assets' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->unsignedBigInteger('ad_id')->nullable();
                $table->string('asset_type');
                $table->string('aspect_ratio');
                $table->integer('width');
                $table->integer('height');
                $table->string('file_url');
                $table->string('thumbnail_url')->nullable();
                $table->integer('file_size_bytes')->nullable();
                $table->string('file_type');
                $table->string('title_overlay')->nullable();
                $table->string('description_overlay')->nullable();
                $table->string('price_overlay')->nullable();
                $table->string('background_color')->default('#ffffff');
                $table->string('font_family')->default('sans-serif');
                $table->boolean('is_template')->default(false);
                $table->string('template_name')->nullable();
                $table->integer('usage_count')->default(0);
                $table->timestamps();
            },
            'qr_codes' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->unsignedBigInteger('ad_id')->nullable();
                $table->string('content_type');
                $table->string('content_id');
                $table->text('qr_data');
                $table->string('image_url');
                $table->integer('size_pixels')->default(300);
                $table->string('error_correction_level')->default('M');
                $table->string('format')->default('png');
                $table->boolean('is_dynamic')->default(false);
                $table->integer('scan_count')->default(0);
                $table->timestamp('last_scanned_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
            'status_templates' => function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description');
                $table->string('category');
                $table->string('aspect_ratio')->default('9:16');
                $table->integer('width')->default(1080);
                $table->integer('height')->default(1920);
                $table->json('template_data')->nullable();
                $table->boolean('is_active')->default(true);
                $table->boolean('is_featured')->default(false);
                $table->integer('usage_count')->default(0);
                $table->timestamps();
            },
            'social_share_events' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->unsignedBigInteger('shareable_link_id')->nullable();
                $table->string('platform');
                $table->text('shared_by_user_agent')->nullable();
                $table->string('shared_from_ip')->nullable();
                $table->text('referrer')->nullable();
                $table->string('shared_to')->nullable();
                $table->string('event_type')->default('share');
                $table->timestamp('shared_at')->useCurrent();
            },
            'verification_badges' => function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description');
                $table->string('type');
                $table->string('issuing_authority');
                $table->text('verification_method');
                $table->integer('validity_period_months')->nullable();
                $table->json('is_required_for')->nullable();
                $table->boolean('is_public')->default(true);
                $table->boolean('requires_manual_review')->default(true);
                $table->string('badge_url')->nullable();
                $table->text('criteria')->nullable();
                $table->timestamps();
            },
            'credential_verifications' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('badge_id')->nullable();
                $table->string('credential_id')->nullable();
                $table->string('issuer')->nullable();
                $table->timestamp('verification_date')->useCurrent();
                $table->timestamp('expiry_date')->nullable();
                $table->string('verification_status')->default('pending');
                $table->timestamp('verification_issued_at')->nullable();
                $table->unsignedBigInteger('verification_approver_id')->nullable();
                $table->text('verification_notes')->nullable();
                $table->string('credential_file_url')->nullable();
                $table->timestamps();
            },
            'message_attachments' => function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('message_id');
                $table->unsignedBigInteger('uploaded_by');
                $table->string('filename');
                $table->string('mime_type')->nullable();
                $table->bigInteger('size')->nullable();
                $table->string('storage_bucket');
                $table->string('storage_path');
                $table->string('public_url')->nullable();
                $table->timestamp('created_at')->useCurrent();
            },
        ];

        foreach ($tables as $tableName => $callback) {
            if (! Schema::hasTable($tableName)) {
                Schema::create($tableName, $callback);
            }
        }
    }

    public function down(): void
    {
        $tableNames = [
            'message_attachments', 'credential_verifications', 'verification_badges', 'social_share_events',
            'status_templates', 'qr_codes', 'ad_card_assets', 'shareable_links', 'email_outbox', 'referral_clicks',
            'referral_rewards', 'referrals', 'admin_login_sessions', 'admin_signup_alerts', 'admin_broadcasts',
            'admin_messages', 'phone_otps', 'email_otps', 'performance_metrics', 'analytics_events', 'escrow_orders',
            'disputes', 'promotion_payments', 'transactions', 'wallets', 'recent_deals', 'safe_spots',
            'promotion_plans', 'site_settings', 'system_configs', 'intrusion_logs', 'audit_logs', 'reports',
            'notifications', 'messages', 'conversations', 'password_requests', 'verification_requests',
            'push_subscriptions', 'user_settings', 'saved_searches', 'search_alerts', 'favorites',
            'buyer_request_responses', 'buyer_requests', 'reviews', 'announcements', 'ad_images', 'ads',
            'subcategories', 'categories',
        ];

        foreach ($tableNames as $tableName) {
            Schema::dropIfExists($tableName);
        }
    }
};
