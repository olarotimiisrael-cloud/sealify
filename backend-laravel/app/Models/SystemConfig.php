<?php

namespace App\Models;

class SystemConfig extends SealifyModel
{
    protected $table = 'system_configs';

    protected $casts = [
        'value' => 'array',
    ];
}
