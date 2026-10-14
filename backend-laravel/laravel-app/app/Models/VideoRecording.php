<?php

namespace App\Models;

class VideoRecording extends SealifyModel
{
    protected $table = 'video_recordings';
    protected $keyType = 'uuid';
    public $incrementing = false;

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
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
