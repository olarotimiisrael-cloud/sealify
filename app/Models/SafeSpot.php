<?php

namespace App\Models;

use Database\Factories\SafeSpotFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SafeSpot extends Model
{
    /** @use HasFactory<SafeSpotFactory> */
    use HasFactory;

    protected $fillable = [
        'name', 'zone', 'category', 'address', 'distance', 'hours', 'cctv_verified', 'is_active',
    ];

    protected function casts(): array
    {
        return ['cctv_verified' => 'boolean', 'is_active' => 'boolean'];
    }
}
