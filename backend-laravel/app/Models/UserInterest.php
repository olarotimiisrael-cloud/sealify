<?php

namespace App\Models;

class UserInterest extends SealifyModel
{
    protected $table = 'user_interests';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}