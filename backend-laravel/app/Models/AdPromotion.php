<?php

namespace App\Models;

class AdPromotion extends SealifyModel
{
    protected $table = 'ad_promotions';
    protected $keyType = 'uuid';
    public $incrementing = false;

    protected $casts = [
        'amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function ad()
    {
        return $this->belongsTo(Listing::class, 'ad_id');
    }

    public function receipts()
    {
        return $this->hasMany(AdPromotionReceipt::class, 'promotion_id');
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isActive()
    {
        return $this->status === 'active' && $this->is_active && !$this->isExpired();
    }
}

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

class UserVerification extends SealifyModel
{
    protected $table = 'user_verifications';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function isVerified()
    {
        return $this->verification_status === 'verified' && (!$this->expires_at || !$this->expires_at->isPast());
    }
}

class BusinessVerification extends SealifyModel
{
    protected $table = 'business_verifications';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function isVerified()
    {
        return $this->verification_status === 'verified' && (!$this->expires_at || !$this->expires_at->isPast());
    }
}

class UserKycAcceptance extends SealifyModel
{
    protected $table = 'user_kyc_acceptances';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}