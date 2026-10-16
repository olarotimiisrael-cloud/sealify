<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('saved_searches', function (Blueprint $table) {
            if (! Schema::hasColumn('saved_searches', 'query')) {
                $table->text('query')->nullable()->after('name');
            }
            if (! Schema::hasColumn('saved_searches', 'filters')) {
                $table->json('filters')->nullable()->after('query');
            }
            if (! Schema::hasColumn('saved_searches', 'alert_enabled')) {
                $table->boolean('alert_enabled')->default(false)->after('filters');
            }
            if (! Schema::hasColumn('saved_searches', 'alert_frequency')) {
                $table->string('alert_frequency')->default('daily')->after('alert_enabled');
            }
        });
    }

    public function down(): void
    {
        Schema::table('saved_searches', function (Blueprint $table) {
            $table->dropColumn(['query', 'filters', 'alert_enabled', 'alert_frequency']);
        });
    }
};