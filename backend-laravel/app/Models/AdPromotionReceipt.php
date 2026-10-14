<?php

namespace App\Models;

class AdPromotionReceipt extends SealifyModel
{
    protected $table = 'ad_promotion_receipts';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function promotion()
    {
        return $this->belongsTo(AdPromotion::class, 'promotion_id');
    }
}