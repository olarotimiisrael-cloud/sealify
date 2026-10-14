<?php

namespace App\Models;

class ProfileStory extends SealifyModel
{
    protected $table = 'profile_stories';
    protected $keyType = 'uuid';
    public $incrementing = false;

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reactions()
    {
        return $this->hasMany(ProfileReaction::class, 'story_id');
    }
}
