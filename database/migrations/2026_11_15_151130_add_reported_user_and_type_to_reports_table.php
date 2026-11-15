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
        Schema::table('reports', function (Blueprint $table) {
            $table->foreignId('reported_user_id')->nullable()->constrained('users')->nullOnDelete()->after('reporter_id');
            $table->string('report_type')->default('listing')->after('reported_user_id'); // listing, user, drugs, fraud
            $table->string('evidence_file')->nullable()->after('details'); // uploaded evidence file path
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn(['reported_user_id', 'report_type', 'evidence_file']);
        });
    }
};
