<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kyc_verifications', function (Blueprint $table) {
            $table->string('document_path')->nullable()->after('provider_response');
            $table->foreignId('reviewed_by')->nullable()->after('document_path')->constrained('users')->nullOnDelete();
            $table->dateTime('reviewed_at')->nullable()->after('reviewed_by');
            $table->string('review_notes')->nullable()->after('reviewed_at');
            $table->string('badge_awarded')->nullable()->after('review_notes');
        });
    }

    public function down(): void
    {
        Schema::table('kyc_verifications', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reviewed_by');
            $table->dropColumn(['document_path', 'reviewed_at', 'review_notes', 'badge_awarded']);
        });
    }
};
