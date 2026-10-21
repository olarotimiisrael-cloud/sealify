<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PromotionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'listing_id' => $this->listing_id,
            'user_id' => $this->user_id,
            'transaction_id' => $this->transaction_id,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'is_free_trial' => $this->is_free_trial,
            'status' => $this->status,
            'is_active' => $this->isActive(),
            'created_at' => $this->created_at,
            'listing' => $this->whenLoaded('listing', fn () => $this->listing ? [
                'id' => $this->listing->id,
                'slug' => $this->listing->slug,
                'title' => $this->listing->title,
                'price' => $this->listing->price,
                'status' => $this->listing->status,
            ] : null),
        ];
    }
}
