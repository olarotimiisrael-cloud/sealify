<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->enum('kind', ['paid', 'referral'])->after('is_free_trial')->default('paid');
            $table->index(['user_id', 'kind']);
        });
    }

    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'kind']);
            $table->dropColumn('kind');
        });
    }
};
