<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $guarded = [];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'verified' => 'boolean',
            'email_notifications' => 'boolean',
            'whatsapp_notifications' => 'boolean',
            'hide_phone_publicly' => 'boolean',
            'hide_location_publicly' => 'boolean',
            'verified_credentials' => 'array',
            'verification_preferences' => 'array',
            'total_value_traded' => 'decimal:2',
            'completed_deals' => 'integer',
            'referral_count' => 'integer',
            'referral_cycle' => 'integer',
            'trust_score' => 'integer',
        ];
    }

    public function listings()
    {
        return $this->hasMany(Listing::class, 'seller_id');
    }

    public function interests()
    {
        return $this->hasMany(UserInterest::class, 'user_id');
    }

    public function skills()
    {
        return $this->hasMany(UserSkill::class, 'user_id');
    }

    public function stories()
    {
        return $this->hasMany(ProfileStory::class, 'user_id');
    }

    public function safetyAnalyses()
    {
        return $this->hasMany(SafetyReportAnalysis::class, 'user_id');
    }

    public function hasRole($role)
    {
        return ($this->role ?? 'buyer') === $role;
    }
}
