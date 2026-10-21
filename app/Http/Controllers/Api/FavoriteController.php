<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingResource;
use App\Models\Favorite;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function store(Listing $listing): JsonResponse
    {
        $userId = request()->user()->id;

        Favorite::firstOrCreate([
            'user_id' => $userId,
            'listing_id' => $listing->id,
        ]);

        return response()->json([
            'message' => 'Listing added to favorites.',
        ], 201);
    }

    public function destroy(Listing $listing): JsonResponse
    {
        Favorite::where('user_id', request()->user()->id)
            ->where('listing_id', $listing->id)
            ->delete();

        return response()->json([
            'message' => 'Listing removed from favorites.',
        ]);
    }

    public function index(Request $request)
    {
        $listings = $request->user()
            ->favoriteListings()
            ->with(['user', 'category', 'images'])
            ->orderByDesc('favorites.created_at')
            ->paginate(20);

        return ListingResource::collection($listings);
    }
}
