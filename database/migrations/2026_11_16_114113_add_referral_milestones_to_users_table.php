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
            $table->boolean('has_referred_10_referrals')->default(false)->after('has_used_free_promotion');
            $table->boolean('has_referred_20_referrals')->default(false)->after('has_referred_10_referrals');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['has_referred_10_referrals', 'has_referred_20_referrals']);
        });
    }
};
