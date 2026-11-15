<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $attributes = [
        'status' => 'active',
        'is_verified_seller' => false,
        'has_used_free_promotion' => false,
        'balance' => 0,
    ];

    protected $fillable = [
        'name',
        'username',
        'email',
        'phone',
        'password',
        'status',
        'avatar_url',
        'location',
        'bio',
        'is_verified_seller',
        'has_used_free_promotion',
        'balance',
        'kyc_verified_at',
        'kyc_type',
        'email_verified_at',
        'phone_verified_at',
        'last_seen_at',
        'role',
        'cover_url',
        'business_name',
        'business_category',
        'business_address',
        'cac_number',
        'business_hours',
        'website_url',
        'instagram_handle',
        'twitter_handle',
        'whatsapp_number',
        'email_notifications',
        'whatsapp_notifications',
        'hide_phone_publicly',
        'hide_location_publicly',
        'restriction_reason',
        'appeal_status',
        'total_value_traded',
        'completed_deals',
        'verified_credentials',
        'trust_score',
        'credential_expiry_warning_date',
        'verification_preferences',
        'referral_code',
        'badge',
        'banned_until',
        'ban_reason',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'kyc_verified_at' => 'datetime',
        'is_verified_seller' => 'boolean',
        'has_used_free_promotion' => 'boolean',
        'balance' => 'decimal:2',
        'password' => 'hashed',
        'email_notifications' => 'boolean',
        'whatsapp_notifications' => 'boolean',
        'hide_phone_publicly' => 'boolean',
        'hide_location_publicly' => 'boolean',
        'total_value_traded' => 'decimal:2',
        'completed_deals' => 'integer',
        'verified_credentials' => 'array',
        'trust_score' => 'integer',
        'credential_expiry_warning_date' => 'date',
        'verification_preferences' => 'array',
        'referral_code' => 'string',
        'badge' => 'string',
        'banned_until' => 'datetime',
    ];

    // ------------------------------------------------------------------
    // Account state
    // ------------------------------------------------------------------

    public function isActive(): bool
    {
        return $this->status === 'active' && !$this->isBanned();
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function isBanned(): bool
    {
        if ($this->status !== 'banned') {
            return false;
        }

        if ($this->banned_until === null) {
            return true; // Permanent ban
        }

        return now()->before($this->banned_until);
    }

    public function isBanExpired(): bool
    {
        if ($this->banned_until === null) {
            return false; // Permanent ban never expires
        }

        return now()->after($this->banned_until);
    }

    public function remainingBanTime(): ?\DateInterval
    {
        if (!$this->isBanned() || $this->banned_until === null) {
            return null;
        }

        return now()->diff($this->banned_until);
    }

    public function isKycVerified(): bool
    {
        return $this->kyc_verified_at !== null;
    }

    // ------------------------------------------------------------------
    // Relations
    // ------------------------------------------------------------------

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function favoriteListings(): BelongsToMany
    {
        return $this->belongsToMany(Listing::class, 'favorites')
            ->withTimestamps();
    }

    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
            ->withPivot('last_read_at')
            ->withTimestamps();
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function bankAccounts(): HasMany
    {
        return $this->hasMany(BankAccount::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function promotions(): HasMany
    {
        return $this->hasMany(Promotion::class);
    }

    public function kycVerifications(): HasMany
    {
        return $this->hasMany(KycVerification::class);
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id')->latest();
    }

    // ------------------------------------------------------------------
    // Social graph (followers / following)
    // ------------------------------------------------------------------

    public function following(): HasMany
    {
        return $this->hasMany(Follow::class, 'follower_id');
    }

    public function followers(): HasMany
    {
        return $this->hasMany(Follow::class, 'following_id');
    }

    public function followingUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
            ->withTimestamps();
    }

    public function followersUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
            ->withTimestamps();
    }

    public function isFollowing(User $user): bool
    {
        return $this->id !== $user->id && $this->followingUsers()->where('following_id', $user->id)->exists();
    }

    public function isFollowedBy(User $user): bool
    {
        return $user->isFollowing($this);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    // ------------------------------------------------------------------
    // Verified Badges
    // ------------------------------------------------------------------

    public const BADGE_BUSINESS = 'business';
    public const BADGE_VENDOR = 'vendor';
    public const BADGE_SEALIFY_OFFICIAL = 'sealify_official';
    public const BADGE_SEALIFY_STAFF = 'sealify_staff';
    public const BADGE_SEALIFY_OFFICER = 'sealify_officer';

    public static function badgeOptions(): array
    {
        return [
            self::BADGE_BUSINESS => 'Business',
            self::BADGE_VENDOR => 'Vendor',
            self::BADGE_SEALIFY_OFFICIAL => 'Sealify Official',
            self::BADGE_SEALIFY_STAFF => 'Sealify Staff',
            self::BADGE_SEALIFY_OFFICER => 'Sealify Officer',
        ];
    }

    public function hasBadge(): bool
    {
        return !blank($this->badge);
    }

    public function badgeLabel(): ?string
    {
        return self::badgeOptions()[$this->badge] ?? null;
    }

    public function badgeColor(): string
    {
        return match ($this->badge) {
            self::BADGE_BUSINESS => 'emerald',
            self::BADGE_VENDOR => 'amber',
            self::BADGE_SEALIFY_OFFICIAL => 'indigo',
            self::BADGE_SEALIFY_STAFF => 'rose',
            self::BADGE_SEALIFY_OFFICER => 'purple',
            default => 'slate',
        };
    }
}
