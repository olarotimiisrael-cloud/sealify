<?php

namespace App\Models;

class Notification extends SealifyModel
{
    protected $table = 'notifications';

    protected $casts = [
        'read' => 'boolean',
    ];
}
