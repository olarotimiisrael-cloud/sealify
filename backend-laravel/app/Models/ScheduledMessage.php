<?php

namespace App\Models;

class ScheduledMessage extends SealifyModel
{
    protected $table = 'scheduled_messages';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}