<?php

namespace App\Models;

class VideoRoomParticipant extends SealifyModel
{
    protected $table = 'video_room_participants';

    protected $casts = [
        'media_settings' => 'array',
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
        'last_active_at' => 'datetime',
        'is_active' => 'boolean',
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
