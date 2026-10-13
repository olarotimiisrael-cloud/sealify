<?php

namespace App\Models;

class Category extends SealifyModel
{
    protected $table = 'categories';

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
