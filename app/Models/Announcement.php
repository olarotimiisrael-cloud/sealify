<?php

namespace App\Models;

use Database\Factories\AnnouncementFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    /** @use HasFactory<AnnouncementFactory> */
    use HasFactory;

    protected $fillable = ['title', 'message', 'type', 'active', 'target_roles'];

    protected function casts(): array
    {
        return ['active' => 'boolean', 'target_roles' => 'array'];
    }
}
