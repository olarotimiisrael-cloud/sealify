<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->user_id,
            'user' => new PublicUserResource($this->whenLoaded('user')),
            'last_read_at' => $this->last_read_at,
        ];
    }
}
