<?php

namespace App\Models;

use Database\Factories\ReferralFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    /** @use HasFactory<ReferralFactory> */
    use HasFactory;

    protected $fillable = ['referrer_id', 'referee_id', 'code', 'reward_amount', 'status', 'rewarded_at'];

    protected function casts(): array
    {
        return ['reward_amount' => 'decimal:2', 'rewarded_at' => 'datetime'];
    }
}
