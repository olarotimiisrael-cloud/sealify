<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'reply_to_id' => $this->reply_to_id,
            'sender' => new PublicUserResource($this->whenLoaded('sender')),
            'replyTo' => $this->whenLoaded('parent', function () {
                return [
                    'id' => $this->parent->id,
                    'body' => $this->parent->body,
                    'sender' => new PublicUserResource($this->parent->whenLoaded('sender')),
                    'senderId' => $this->parent->sender_id,
                    'type' => $this->parent->type,
                ];
            }),
            'body' => $this->body,
            'type' => $this->type,
            'attachments' => MessageAttachmentResource::collection(
                $this->whenLoaded('attachments')
            ),
            'created_at' => $this->created_at,
        ];
    }
}
