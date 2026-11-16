<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('promotion_credits')->default(0)->after('has_referred_20_referrals');
            $table->unsignedInteger('credits_used')->default(0)->after('promotion_credits');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['promotion_credits', 'credits_used']);
        });
    }
};