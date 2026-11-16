<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('signaling_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->string('type')->index(); // offer, answer, ice-candidate
            $table->json('payload'); // SDP or ICE candidate data
            $table->timestamps();

            $table->index(['conversation_id', 'type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('signaling_messages');
    }
};