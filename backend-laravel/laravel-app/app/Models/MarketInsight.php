<?php

namespace App\Models;

class MarketInsight extends SealifyModel
{
    protected $table = 'market_insights';

    protected $casts = [
        'data' => 'array',
    ];
}