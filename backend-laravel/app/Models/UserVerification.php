<?php

namespace App\Models;

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