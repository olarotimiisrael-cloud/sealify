<?php

namespace App\Models;

class Conversation extends SealifyModel
{
    protected $table = 'conversations';

    protected $casts = [
        'last_message_time' => 'datetime',
    ];
}
