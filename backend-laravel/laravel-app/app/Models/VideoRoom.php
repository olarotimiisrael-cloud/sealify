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
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
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
