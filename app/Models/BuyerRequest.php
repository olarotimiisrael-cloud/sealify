<?php

namespace App\Models;

use Database\Factories\BuyerRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BuyerRequest extends Model
{
    /** @use HasFactory<BuyerRequestFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id', 'category_id', 'title', 'max_budget', 'location', 'description',
        'responses_count', 'status',
    ];

    protected function casts(): array
    {
        return ['max_budget' => 'decimal:2', 'responses_count' => 'integer'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
