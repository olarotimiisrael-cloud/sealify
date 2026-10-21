<?php

namespace App\Http\Resources;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Comment
 */
class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'commentable_type' => $this->commentable_type,
            'commentable_id' => $this->commentable_id,
            'parent_id' => $this->parent_id,
            'content' => $this->content,
            'user' => new PublicUserResource($this->whenLoaded('user')),
            'replies' => CommentResource::collection($this->whenLoaded('replies')),
            'replies_count' => $this->whenLoaded('replies', fn () => $this->replies->count()),
            'is_edited' => $this->when($this->updated_at !== $this->created_at, true),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
