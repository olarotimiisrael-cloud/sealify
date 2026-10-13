<?php

namespace App\Models;

class Subcategory extends SealifyModel
{
    protected $table = 'subcategories';

    protected $casts = [
        'spec_fields' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
