<?php

namespace App\Models;

class Message extends SealifyModel
{
    protected $table = 'messages';

    protected $casts = [
        'read' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
