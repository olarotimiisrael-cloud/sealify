<?php

namespace App\Models;

class Message extends SealifyModel
{
    protected $table = 'messages';

    protected $casts = [
        'read' => 'boolean',
    ];
}
