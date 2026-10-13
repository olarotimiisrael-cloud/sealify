<?php

namespace App\Models;

class EmailOutbox extends SealifyModel
{
    protected $table = 'email_outbox';

    protected $casts = [
        'payload' => 'array',
    ];
}
