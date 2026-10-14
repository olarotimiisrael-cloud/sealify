<?php

namespace App\Models;

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