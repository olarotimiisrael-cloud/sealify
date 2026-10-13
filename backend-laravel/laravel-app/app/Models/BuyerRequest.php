<?php

namespace App\Models;

class BuyerRequest extends SealifyModel
{
    protected $table = 'buyer_requests';

    protected $casts = [
        'images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function responses()
    {
        return $this->hasMany(BuyerRequestResponse::class);
    }
}