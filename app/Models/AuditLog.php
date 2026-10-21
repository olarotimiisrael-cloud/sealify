<?php

namespace App\Models;

use Database\Factories\AuditLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    /** @use HasFactory<AuditLogFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'action', 'details', 'type', 'metadata'];

    protected function casts(): array
    {
        return ['metadata' => 'array'];
    }
}
