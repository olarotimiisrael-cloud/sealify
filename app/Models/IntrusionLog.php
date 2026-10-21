<?php

namespace App\Models;

use Database\Factories\IntrusionLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IntrusionLog extends Model
{
    /** @use HasFactory<IntrusionLogFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id', 'attempted_email', 'device_info', 'media_captured', 'media_status', 'status',
    ];

    protected function casts(): array
    {
        return ['device_info' => 'array', 'media_captured' => 'boolean'];
    }
}
