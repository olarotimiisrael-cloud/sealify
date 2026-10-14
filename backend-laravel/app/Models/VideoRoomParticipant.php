<?php

namespace App\Models;

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