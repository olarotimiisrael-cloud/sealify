<?php

namespace App\Models;

class ProfileReaction extends SealifyModel
{
    protected $table = 'profile_reactions';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function story()
    {
        return $this->belongsTo(ProfileStory::class, 'story_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}