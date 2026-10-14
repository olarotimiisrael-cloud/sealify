<?php

namespace App\Models;

class SafetyReportAnalysis extends SealifyModel
{
    protected $table = 'safety_report_analyses';
    protected $keyType = 'uuid';
    public $incrementing = false;

    protected $casts = [
        'risk_score' => 'float',
        'report_reasons' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}