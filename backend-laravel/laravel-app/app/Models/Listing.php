<?php

namespace App\Models;

class Listing extends SealifyModel
{
    protected $table = 'ads';

    protected $casts = [
        'images' => 'array',
        'specifications' => 'array',
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'featured' => 'boolean',
        'views_count' => 'integer',
        'promotion_duration_months' => 'integer',
    ];
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
