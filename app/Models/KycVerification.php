<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KycVerification extends Model
{
    protected $fillable = [
        'user_id', 'type', 'id_number_last4', 'id_number_hash',
        'first_name', 'last_name', 'date_of_birth',
        'status', 'provider', 'provider_reference',
        'provider_response', 'rejection_reason',
        'verified_at', 'rejected_at',
    ];

    protected $casts = [
        'provider_response' => 'array',
        'date_of_birth' => 'date',
        'verified_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    protected $hidden = ['id_number_hash'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isVerified(): bool
    {
        return $this->status === 'verified';
    }
}
