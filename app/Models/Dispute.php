<?php

namespace App\Models;

use Database\Factories\DisputeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispute extends Model
{
    /** @use HasFactory<DisputeFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id', 'counterparty_id', 'listing_id', 'receipt_reference', 'item_title',
        'category', 'reason', 'details', 'evidence_url', 'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function counterparty(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counterparty_id');
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
