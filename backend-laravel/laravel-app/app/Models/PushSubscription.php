<?php

namespace App\Models;

class PushSubscription extends SealifyModel
{
    protected $table = 'push_subscriptions';

    protected $casts = [
        'keys' => 'array',
    ];
}