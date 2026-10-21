<?php

namespace App\Models;

use Database\Factories\SystemConfigFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemConfig extends Model
{
    /** @use HasFactory<SystemConfigFactory> */
    use HasFactory;

    protected $fillable = ['key', 'value', 'description'];

    protected function casts(): array
    {
        return ['value' => 'array'];
    }
}
