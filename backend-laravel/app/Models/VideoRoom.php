<?php

namespace App\Models;

class VideoRoom extends SealifyModel
{
    protected $table = 'video_rooms';
    protected $keyType = 'uuid';
    public $incrementing = false;

    protected $casts = [
        'quality_settings' => 'array',
        'metadata' => 'array',
    ];

    public function ad()
    {
        return $this->belongsTo(Listing::class, 'ad_id');
    }

    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiator_id');
    }

    public function participant()
    {
        return $this->belongsTo(User::class, 'participant_id');
    }

    public function recordings()
    {
        return $this->hasMany(VideoRecording::class, 'room_id');
    }

    public function participants()
    {
        return $this->hasMany(VideoRoomParticipant::class, 'room_id');
    }
}

class VideoRoomParticipant extends SealifyModel
{
    protected $table = 'video_room_participants';
    protected $keyType = 'uuid';
    public $incrementing = false;

    protected $casts = [
        'media_settings' => 'array',
    ];

    public function room()
    {
        return $this->belongsTo(VideoRoom::class, 'room_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

class VideoRecording extends SealifyModel
{
    protected $table = 'video_recordings';
    protected $keyType = 'uuid';
    public $incrementing = false;

    protected $casts = [
        'key_points' => 'array',
        'action_items' => 'array',
    ];

    public function room()
    {
        return $this->belongsTo(VideoRoom::class, 'room_id');
    }

    public function ad()
    {
        return $this->belongsTo(Listing::class, 'ad_id');
    }

    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiator_id');
    }
}

class ProfileStory extends SealifyModel
{
    protected $table = 'profile_stories';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reactions()
    {
        return $this->hasMany(ProfileReaction::class, 'story_id');
    }
}

class ProfileReaction extends SealifyModel
{
    protected $table = 'profile_reactions';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function story()
    {
        return $this->belongsTo(ProfileStory::class, 'story_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

class ScheduledMessage extends SealifyModel
{
    protected $table = 'scheduled_messages';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }
}

class UserInterest extends SealifyModel
{
    protected $table = 'user_interests';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

class UserSkill extends SealifyModel
{
    protected $table = 'user_skills';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

class SafetyReportAnalysis extends SealifyModel
{
    protected $table = 'safety_report_analyses';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}