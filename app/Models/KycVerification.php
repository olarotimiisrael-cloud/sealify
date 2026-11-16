<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class KycVerification extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_VERIFIED = 'verified';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'user_id', 'type', 'id_number_last4', 'id_number_hash',
        'first_name', 'last_name', 'date_of_birth',
        'status', 'provider', 'provider_reference',
        'provider_response', 'rejection_reason',
        'document_path', 'reviewed_by', 'reviewed_at', 'review_notes',
        'badge_awarded',
        'verified_at', 'rejected_at',
    ];

    protected $casts = [
        'provider_response' => 'array',
        'date_of_birth' => 'date',
        'verified_at' => 'datetime',
        'rejected_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    protected $hidden = ['id_number_hash'];

    public static function typeLabels(): array
    {
        return [
            'nin' => 'National Identity Number (NIN)',
            'bvn' => 'Bank Verification Number (BVN)',
            'cac' => 'Corporate Affairs Commission (CAC)',
            'drivers_license' => "Driver's License",
            'voters_card' => "Voter's Card",
        ];
    }

    public static function statusLabels(): array
    {
        return [
            self::STATUS_PENDING => 'Pending Review',
            self::STATUS_VERIFIED => 'Verified',
            self::STATUS_REJECTED => 'Rejected',
            self::STATUS_FAILED => 'Failed',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isVerified(): bool
    {
        return $this->status === self::STATUS_VERIFIED;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function hasDocument(): bool
    {
        return $this->document_path !== null
            && Storage::disk('local')->exists($this->document_path);
    }

    public function typeLabel(): string
    {
        return self::typeLabels()[$this->type] ?? strtoupper($this->type);
    }

    public function statusLabel(): string
    {
        return self::statusLabels()[$this->status] ?? ucfirst($this->status);
    }

    public function statusColorClass(): string
    {
        return match ($this->status) {
            self::STATUS_VERIFIED => 'bg-emerald-100 text-emerald-700',
            self::STATUS_REJECTED => 'bg-rose-100 text-rose-700',
            self::STATUS_FAILED => 'bg-slate-200 text-slate-600',
            default => 'bg-amber-100 text-amber-700',
        };
    }

    public function idNumberDisplay(): string
    {
        return $this->id_number_last4
            ? '•••• '.$this->id_number_last4
            : 'Not provided';
    }
}
