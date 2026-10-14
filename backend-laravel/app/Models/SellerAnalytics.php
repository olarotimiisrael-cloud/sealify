<?php

namespace App\Models;

use Illuminate\Database\Model;

class SellerAnalytics extends Model
{
    protected $table = 'seller_analytics';
    
    protected $fillable = [
        'seller_id',
        'metric_type',
        'metric_value',
        'period_start',
        'period_end',
        'calculated_at',
    ];
    
    protected $casts = [
        'metric_value' => 'decimal:2',
        'period_start' => 'datetime',
        'period_end' => 'datetime',
        'calculated_at' => 'datetime',
    ];
    
    public function seller()
    {
        return $this->belongsTo(User::class);
    }
}