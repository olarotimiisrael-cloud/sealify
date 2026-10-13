<?php

namespace App\Models;

class Announcement extends SealifyModel
{
    protected $table = 'announcements';

    protected $casts = [
        'target_roles' => 'array',
        'active' => 'boolean',
    ];
}
