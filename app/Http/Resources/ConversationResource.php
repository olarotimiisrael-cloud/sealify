<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $authUser = auth('sanctum')->user();

        return [
            'id' => $this->id,
            'listing' => $this->whenLoaded('listing', fn () => $this->listing ? [
                'id' => $this->listing->id,
                'slug' => $this->listing->slug,
                'title' => $this->listing->title,
                'price' => $this->listing->price,
                'status' => $this->listing->status,
            ] : null),
            'participants' => ConversationParticipantResource::collection(
                $this->whenLoaded('participants')
            ),
            'last_message' => new MessageResource($this->whenLoaded('lastMessage')),
            'unread_count' => $this->when(isset($this->unread_count), fn () => (int) $this->unread_count),
            'last_message_at' => $this->last_message_at,
            'created_at' => $this->created_at,
        ];
    }
}
