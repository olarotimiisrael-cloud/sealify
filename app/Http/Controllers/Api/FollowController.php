<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicUserResource;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function store(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();

        abort_unless($authUser->id !== $user->id, 403, 'You cannot follow yourself.');

        Follow::firstOrCreate([
            'follower_id' => $authUser->id,
            'following_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'You are now following '.$user->name.'.',
            'is_following' => true,
        ], 201);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();

        Follow::where('follower_id', $authUser->id)
            ->where('following_id', $user->id)
            ->delete();

        return response()->json([
            'message' => 'You unfollowed '.$user->name.'.',
            'is_following' => false,
        ]);
    }

    public function following(Request $request, User $user): JsonResponse
    {
        $users = $user->followingUsers()
            ->with(['listings' => fn ($q) => $q->active()->limit(4)])
            ->orderByDesc('follows.created_at')
            ->paginate(20);

        return response()->json([
            'data' => PublicUserResource::collection($users),
            'links' => $users->toArray()['links'] ?? [],
            'meta' => $users->toArray()['meta'] ?? [],
        ]);
    }

    public function followers(Request $request, User $user): JsonResponse
    {
        $users = $user->followersUsers()
            ->with(['listings' => fn ($q) => $q->active()->limit(4)])
            ->orderByDesc('follows.created_at')
            ->paginate(20);

        return response()->json([
            'data' => PublicUserResource::collection($users),
            'links' => $users->toArray()['links'] ?? [],
            'meta' => $users->toArray()['meta'] ?? [],
        ]);
    }

    public function check(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();

        return response()->json([
            'is_following' => $authUser->id !== $user->id && $authUser->isFollowing($user),
        ]);
    }
}
