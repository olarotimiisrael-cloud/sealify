<?php

namespace App\Models;

class AdminBroadcast extends SealifyModel
{
    protected $table = 'admin_broadcasts';

    protected $casts = [
        'user_ids' => 'array',
        'audience' => 'array',
    ];
}
