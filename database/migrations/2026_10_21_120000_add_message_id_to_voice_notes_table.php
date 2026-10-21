<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voice_notes', function (Blueprint $table) {
            $table->foreignId('message_id')->nullable()->constrained()->onDelete('cascade')->after('id');
            $table->index('message_id');
        });
    }

    public function down(): void
    {
        Schema::table('voice_notes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('message_id');
        });
    }
};
