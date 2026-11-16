<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'biometric_lock_enabled')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('biometric_lock_enabled')->default(false)->after('email_notifications');
                $table->boolean('face_id_lock_enabled')->default(false)->after('biometric_lock_enabled');
                $table->string('biometric_public_key', 512)->nullable()->after('face_id_lock_enabled');
                $table->string('face_id_public_key', 512)->nullable()->after('biometric_public_key');
                $table->timestamp('biometric_registered_at')->nullable()->after('face_id_public_key');
                $table->timestamp('face_id_registered_at')->nullable()->after('biometric_registered_at');
                $table->boolean('profile_completed')->default(false)->after('badge');
                $table->timestamp('profile_completed_at')->nullable()->after('profile_completed');
                $table->boolean('business_profile_completed')->default(false)->after('profile_completed_at');
                $table->timestamp('business_profile_completed_at')->nullable()->after('business_profile_completed');
                $table->boolean('verified_badge_application')->default(false)->after('business_profile_completed_at');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'biometric_lock_enabled')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn([
                    'biometric_lock_enabled',
                    'face_id_lock_enabled',
                    'biometric_public_key',
                    'face_id_public_key',
                    'biometric_registered_at',
                    'face_id_registered_at',
                    'profile_completed',
                    'profile_completed_at',
                    'business_profile_completed',
                    'business_profile_completed_at',
                    'verified_badge_application',
                ]);
            });
        }
    }
};