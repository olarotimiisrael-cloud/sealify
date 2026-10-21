<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingResource;
use App\Http\Resources\PublicUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function show(User $user): JsonResponse
    {
        if ($user->status !== 'active') {
            abort(404);
        }

        return response()->json([
            'data' => new PublicUserResource($user),
        ]);
    }

    public function listings(User $user)
    {
        if ($user->status !== 'active') {
            abort(404);
        }

        $listings = $user->listings()
            ->active()
            ->with(['user', 'category', 'images'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return ListingResource::collection($listings);
    }
}
