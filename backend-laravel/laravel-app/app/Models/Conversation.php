<?php

namespace App\Models;

class Conversation extends SealifyModel
{
    protected $table = 'conversations';

    protected $casts = [
        'last_message_time' => 'datetime',
    ];

    public function messages()
    {
        return $this->hasMany(Message::class, 'conversation_id');
    }

    public function participantOne()
    {
        return $this->belongsTo(User::class, 'participant_1');
    }

    public function participantTwo()
    {
        return $this->belongsTo(User::class, 'participant_2');
    }
}
