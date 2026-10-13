<?php

namespace App\Models;

class VerificationBadge extends SealifyModel
{
    protected $table = 'verification_badges';

    protected $casts = [
        'is_required_for' => 'array',
        'is_public' => 'boolean',
        'requires_manual_review' => 'boolean',
    ];
}
