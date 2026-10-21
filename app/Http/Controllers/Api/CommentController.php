<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'commentable_type' => ['required', 'string', 'in:' . implode(',', \App\Http\Requests\StoreCommentRequest::ALLOWED_MODELS)],
            'commentable_id' => ['required', 'string'],
        ]);

        $comments = Comment::query()
            ->where('commentable_type', $request->string('commentable_type'))
            ->where('commentable_id', $request->string('commentable_id'))
            ->whereNull('parent_id')
            ->with(['user', 'replies.user'])
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return response()->json([
            'data' => CommentResource::collection($comments),
            'links' => $comments->toArray()['links'] ?? [],
            'meta' => $comments->toArray()['meta'] ?? [],
        ]);
    }

    public function store(StoreCommentRequest $request): JsonResponse
    {
        Gate::authorize('create', Comment::class);

        $data = $request->validated();
        $modelClass = $data['commentable_type'];
        $modelId = $data['commentable_id'];

        $model = $modelClass::findOrFail($modelId);
        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'commentable_type' => $modelClass,
            'commentable_id' => $model->getKey(),
            'parent_id' => $data['parent_id'] ?? null,
            'content' => $data['content'],
        ]);

        $comment->load('user');

        return response()->json([
            'data' => new CommentResource($comment),
            'message' => 'Comment posted.',
        ], 201);
    }

    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        Gate::authorize('delete', $comment);

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted.',
        ]);
    }
}
