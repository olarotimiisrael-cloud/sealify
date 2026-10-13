<?php

namespace App\Models;

class Adsense extends SealifyModel
{
    protected $table = 'adsense';

    protected $casts = [
        'responsive' => 'boolean',
        'active' => 'boolean',
    ];
}