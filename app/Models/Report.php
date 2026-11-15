<?php

namespace App\Models;

use Database\Factories\ReportFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    /** @use HasFactory<ReportFactory> */
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'reporter_id',
        'reported_user_id',
        'report_type',
        'reason',
        'details',
        'evidence_file',
        'status',
    ];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function reportedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }
}
