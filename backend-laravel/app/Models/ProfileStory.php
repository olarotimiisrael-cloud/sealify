<?php

namespace App\Models;

class ProfileStory extends SealifyModel
{
    protected $table = 'profile_stories';
    protected $keyType = 'uuid';
    public $incrementing = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reactions()
    {
        return $this->hasMany(ProfileReaction::class, 'story_id');
    }

    public function reactionCount()
    {
        return $this->reactions()->count();
    }
}

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

    public function reactionType()
    {
        return $this->reaction_type;
    }
}