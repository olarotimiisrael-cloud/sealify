<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'reference',
        'provider_reference',
        'provider',
        'user_id',
        'amount',
        'currency',
        'purpose',
        'status',
        'metadata',
        'provider_response',
        'error_message',
        'paid_at',
        'failed_at',
        'expires_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'provider_response' => 'array',
        'paid_at' => 'datetime',
        'failed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isSuccess(): bool
    {
        return $this->status === 'success';
    }
}
