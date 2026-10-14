<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MobileModel extends Model
{
    protected $table = 'mobile_sessions';
    
    protected $fillable = [
        'user_id',
        'device_type',
        'device_model',
        'app_version',
        'os_version',
        'ip_address',
        'user_agent',
        'last_active',
        'push_token',
        'push_provider',
        'locale',
        'currency',
        'is_online',
    ];
    
    protected $casts = [
        'last_active' => 'datetime',
        'is_online' => 'boolean',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
