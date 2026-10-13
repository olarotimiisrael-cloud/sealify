<?php

namespace App\Models;

class Review extends SealifyModel
{
    protected $table = 'reviews';

    protected $casts = [
        'rating' => 'integer',
    ];
}
