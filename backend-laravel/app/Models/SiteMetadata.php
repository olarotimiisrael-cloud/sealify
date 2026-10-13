<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteMetadata extends Model
{
    protected $fillable = ['meta_key', 'meta_value'];

    protected function casts(): array
    {
        return [
            'meta_value' => 'array',
        ];
    }
}
