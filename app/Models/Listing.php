<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Listing extends Model
{
    use HasFactory, SoftDeletes;

    protected $attributes = [
        'views_count' => 0,
        'status' => 'active',
    ];

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'description',
        'price',
        'price_negotiable',
        'condition',
        'location',
        'status',
        'views_count',
        'expires_at',
        'original_price',
        'video_url',
        'specifications',
        'featured',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'price_negotiable' => 'boolean',
        'views_count' => 'integer',
        'expires_at' => 'datetime',
        'original_price' => 'decimal:2',
        'specifications' => 'array',
        'featured' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ListingImage::class)->orderBy('sort_order');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function promotions(): HasMany
    {
        return $this->hasMany(Promotion::class);
    }

    public function activePromotion(): HasOne
    {
        return $this->hasOne(Promotion::class)
            ->where('status', 'active')
            ->where('ends_at', '>', now());
    }

    public function scopeActive($query)
    {
        return $query->where('listings.status', 'active')
            ->where(function ($q) {
                $q->whereNull('listings.expires_at')
                    ->orWhere('listings.expires_at', '>', now());
            });
    }

    protected static function booted(): void
    {
        static::creating(function (Listing $listing) {
            if (empty($listing->slug)) {
                $listing->slug = static::generateUniqueSlug($listing->title);
            }
        });
    }

    protected static function generateUniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'listing';
        $slug = $base;
        $i = 1;

        while (static::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
