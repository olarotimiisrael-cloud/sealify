<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('listings', 'condition_note')) {
            Schema::table('listings', function (Blueprint $table) {
                $table->string('condition_note', 100)->nullable()->after('condition');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('listings', 'condition_note')) {
            Schema::table('listings', function (Blueprint $table) {
                $table->dropColumn('condition_note');
            });
        }
    }
};