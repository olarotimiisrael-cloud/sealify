<?php

namespace App\Models;

class UserSkill extends SealifyModel
{
    protected $table = 'user_skills';
    protected $keyType = 'uuid';
    public $incrementing = false;

    protected $casts = [
        'proficiency_level' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
