<?php

namespace App\Models;

use Database\Factories\PromotionPlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromotionPlan extends Model
{
    /** @use HasFactory<PromotionPlanFactory> */
    use HasFactory;

    protected $fillable = ['months', 'label', 'rate', 'badge', 'is_active'];

    protected function casts(): array
    {
        return ['rate' => 'decimal:2', 'is_active' => 'boolean'];
    }
}
