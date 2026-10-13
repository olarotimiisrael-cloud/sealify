<?php

namespace App\Models;

class StatusTemplate extends SealifyModel
{
    protected $table = 'status_templates';

    protected $casts = [
        'template_data' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];
}
