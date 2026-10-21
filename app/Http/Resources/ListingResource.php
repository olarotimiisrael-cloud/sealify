<?php

namespace App\Http\Resources;

use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $authUser = auth('sanctum')->user();

        $isFavorited = false;
        if ($authUser) {
            $isFavorited = $this->relationLoaded('favorites')
                ? $this->favorites->contains('user_id', $authUser->id)
                : Favorite::where('user_id', $authUser->id)
                    ->where('listing_id', $this->id)
                    ->exists();
        }

        $activePromotion = $this->relationLoaded('activePromotion')
            ? $this->activePromotion
            : null;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'original_price' => $this->original_price,
            'price_negotiable' => $this->price_negotiable,
            'condition' => $this->condition,
            'location' => $this->location,
            'status' => $this->status,
            'views_count' => $this->views_count,
            'expires_at' => $this->expires_at,
            'video_url' => $this->video_url,
            'specifications' => $this->specifications,
            'featured' => $this->featured,
            'user_id' => $this->user_id,
            'seller_id' => $this->user_id,
            'seller_name' => $this->whenLoaded('user', fn () => $this->user?->name),
            'seller_phone' => $this->whenLoaded('user', fn () => $this->user?->hide_phone_publicly ? null : $this->user?->phone),
            'seller_avatar' => $this->whenLoaded('user', fn () => $this->user?->avatar_url),
            'seller_verified' => $this->whenLoaded('user', fn () => $this->user?->is_verified_seller),
            'created_at' => $this->created_at,
            'is_favorited' => $isFavorited,
            'is_boosted' => $activePromotion !== null,
            'boosted_until' => $activePromotion?->ends_at,
            'seller' => new PublicUserResource($this->whenLoaded('user')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'images' => ListingImageResource::collection(
                $this->whenLoaded('images')
            ),
        ];
    }
}
