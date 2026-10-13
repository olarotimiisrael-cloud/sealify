<?php

namespace App\Models;

class SiteSetting extends SealifyModel
{
    protected $table = 'site_settings';

    protected $casts = [
        'page_metadata' => 'array',
        'robots_indexing' => 'boolean',
        'is_active' => 'boolean',
    ];
}
