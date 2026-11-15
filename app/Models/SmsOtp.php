<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmsOtp extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone_number',
        'otp_code',
        'purpose',
        'is_used',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function generateOtp(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public static function createOtp(User $user, string $phoneNumber, string $purpose = 'verification', int $ttlMinutes = 10): self
    {
        // Invalidate any existing unused OTPs for this user and purpose
        self::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->update(['is_used' => true]);

        return self::create([
            'user_id' => $user->id,
            'phone_number' => $phoneNumber,
            'otp_code' => self::generateOtp(),
            'purpose' => $purpose,
            'is_used' => false,
            'expires_at' => now()->addMinutes($ttlMinutes),
        ]);
    }

    public function isExpired(): bool
    {
        return now()->after($this->expires_at);
    }

    public function isValid(): bool
    {
        return !$this->is_used && !$this->isExpired();
    }

    public function markUsed(): void
    {
        $this->update([
            'is_used' => true,
            'used_at' => now(),
        ]);
    }
}
