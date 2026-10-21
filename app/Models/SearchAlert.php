<?php

namespace App\Models;

use Database\Factories\SearchAlertFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SearchAlert extends Model
{
    /** @use HasFactory<SearchAlertFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'category_id', 'query', 'max_price', 'location', 'match_count'];

    protected function casts(): array
    {
        return ['max_price' => 'decimal:2', 'match_count' => 'integer'];
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
