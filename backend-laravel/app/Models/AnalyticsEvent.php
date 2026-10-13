<?php

namespace App\Models;

class AnalyticsEvent extends SealifyModel
{
    protected $table = 'analytics_events';

    protected $casts = [
        'properties' => 'array',
    ];
}
