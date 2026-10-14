<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            if (! Schema::hasColumn('conversations', 'unread_count_1')) {
                $table->unsignedInteger('unread_count_1')->default(0);
            }
            if (! Schema::hasColumn('conversations', 'unread_count_2')) {
                $table->unsignedInteger('unread_count_2')->default(0);
            }
        });

        Schema::table('reports', function (Blueprint $table) {
            if (! Schema::hasColumn('reports', 'reported_id')) {
                $table->unsignedBigInteger('reported_id')->nullable()->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            if (Schema::hasColumn('conversations', 'unread_count_1')) {
                $table->dropColumn('unread_count_1');
            }
        });

        Schema::table('reports', function (Blueprint $table) {
            if (Schema::hasColumn('reports', 'reported_id')) {
                $table->dropColumn('reported_id');
            }
        });
    }
};
