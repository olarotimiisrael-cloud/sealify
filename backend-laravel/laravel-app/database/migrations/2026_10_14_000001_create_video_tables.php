<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Video Rooms table
        Schema::create('video_rooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('ad_id')->nullable();
            $table->unsignedBigInteger('initiator_id');
            $table->unsignedBigInteger('participant_id')->nullable(); // For group calls
            $table->string('status')->default('waiting'); // waiting, active, ended, declined
            $table->json('quality_settings')->nullable(); // Video quality preferences
            $table->json('metadata')->nullable(); // Additional room metadata
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
            
            $table->foreign('ad_id')->references('id')->on('ads')->onDelete('set null');
            $table->foreign('initiator_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('participant_id')->references('id')->on('users')->onDelete('set null');
        });
        
        // Video Room Participants table (for group calls)
        Schema::create('video_room_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('room_id');
            $table->unsignedBigInteger('user_id');
            $table->string('role')->default('viewer'); // presenter, viewer, moderator
            $table->string('connection_status')->default('disconnected'); // connecting, connected, disconnected
            $table->json('media_settings')->nullable(); // Audio/video mute status, etc.
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->timestamps();
            
            $table->foreign('room_id')->references('id')->on('video_rooms')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['room_id', 'user_id']);
        });
        
        // Video Recordings table
        Schema::create('video_recordings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('room_id');
            $table->unsignedBigInteger('ad_id')->nullable();
            $table->unsignedBigInteger('initiator_id');
            $table->string('status')->default('recording'); // recording, processing, completed, failed
            $table->string('quality')->default('1080p30fps'); // 720p30fps, 1080p30fps, 1080p60fps, 4k
            $table->string('recording_path');
            $table->string('thumbnail_path')->nullable();
            $table->integer('duration_seconds')->default(0);
            $table->bigInteger('file_size_bytes')->default(0);
            $table->text('ai_summary')->nullable();
            $table->json('key_points')->nullable();
            $table->json('action_items')->nullable();
            $table->string('sentiment')->nullable(); // positive, negative, neutral
            $table->string('processing_status')->default('pending'); // pending, processing, completed, failed
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
            
            $table->foreign('room_id')->references('id')->on('video_rooms')->onDelete('cascade');
            $table->foreign('ad_id')->references('id')->on('ads')->onDelete('set null');
            $table->foreign('initiator_id')->references('id')->on('users')->onDelete('cascade');
        });
        
        // Profile Stories table (for social features)
        Schema::create('profile_stories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('media_type'); // image, video, text
            $table->string('media_url');
            $table->string('thumbnail_url')->nullable();
            $table->text('caption')->nullable();
            $table->timestamp('expires_at'); // Stories expire after 24 hours
            $table->integer('view_count')->default(0);
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('expires_at');
        });
        
        // Profile Reactions table (likes, loves, etc.)
        Schema::create('profile_reactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('story_id');
            $table->unsignedBigInteger('user_id');
            $table->string('reaction_type'); // like, love, wow, sad, angry
            $table->timestamps();
            
            $table->foreign('story_id')->references('id')->on('profile_stories')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['story_id', 'user_id', 'reaction_type']);
        });
        
        // Scheduled Messages table
        Schema::create('scheduled_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conversation_id');
            $table->text('content');
            $table->timestamp('send_at');
            $table->string('status')->default('pending'); // pending, sent, failed, cancelled
            $table->integer('retry_count')->default(0);
            $table->timestamps();
            
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            $table->index(['status', 'send_at']);
        });
        
        // User Interests table
        Schema::create('user_interests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('interest');
            $table->integer('weight')->default(1); // How strong the interest is
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['user_id', 'interest']);
        });
        
        // User Skills table
        Schema::create('user_skills', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('skill');
            $table->integer('proficiency_level')->default(1); // 1-5 scale
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['user_id', 'skill']);
        });
        
        // Safety Reports Analysis table (for tracking report frequency)
        Schema::create('safety_report_analyses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->integer('report_count_7d')->default(0);
            $table->integer('report_count_30d')->default(0);
            $table->decimal('risk_score', 5, 2)->default(0.00);
            $table->string('risk_level')->default('low'); // low, medium, high, critical
            $table->json('report_reasons')->nullable(); // Array of reasons for reports
            $table->timestamp('last_assessed_at');
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'risk_level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('safety_report_analyses');
        Schema::dropIfExists('user_skills');
        Schema::dropIfExists('user_interests');
        Schema::dropIfExists('scheduled_messages');
        Schema::dropIfExists('profile_reactions');
        Schema::dropIfExists('profile_stories');
        Schema::dropIfExists('video_recordings');
        Schema::dropIfExists('video_room_participants');
        Schema::dropIfExists('video_rooms');
    }
};