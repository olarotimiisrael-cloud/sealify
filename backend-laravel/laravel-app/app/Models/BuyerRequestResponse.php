<?php

namespace App\Models;

class BuyerRequestResponse extends SealifyModel
{
    protected $table = 'buyer_request_responses';

    public function buyerRequest()
    {
        return $this->belongsTo(BuyerRequest::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}