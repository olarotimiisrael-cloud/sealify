<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadListingImagesRequest;
use App\Http\Resources\ListingImageResource;
use App\Models\Listing;
use App\Models\ListingImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class ListingImageController extends Controller
{
    private const MAX_IMAGES_PER_LISTING = 5;

    public function store(UploadListingImagesRequest $request, Listing $listing): JsonResponse
    {
        Gate::authorize('update', $listing);

        $existing = $listing->images()->count();
        $incoming = count($request->file('images', []));

        if ($existing + $incoming > self::MAX_IMAGES_PER_LISTING) {
            abort(response()->json([
                'message' => 'A listing can have at most '
                    .self::MAX_IMAGES_PER_LISTING.' images. '
                    .($existing > 0 ? "You already have {$existing}." : ''),
            ], 422));
        }

        $nextSort = (int) ($listing->images()->max('sort_order') ?? -1) + 1;
        $created = [];

        foreach ($request->file('images') as $i => $file) {
            $ext = strtolower($file->extension() ?: 'jpg');
            $name = "listing-{$listing->id}-".time()."-{$i}.{$ext}";

            $path = $file->storeAs(
                "listings/{$listing->id}",
                $name,
                'public'
            );

            $image = ListingImage::create([
                'listing_id' => $listing->id,
                'path' => $path,
                'sort_order' => $nextSort + $i,
            ]);

            $created[] = $image;
        }

        return response()->json([
            'data' => ListingImageResource::collection(collect($created)),
            'message' => count($created).' image(s) uploaded.',
        ], 201);
    }

    public function destroy(Listing $listing, int $imageId): JsonResponse
    {
        Gate::authorize('update', $listing);

        $image = $listing->images()->findOrFail($imageId);

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json([
            'message' => 'Image deleted.',
        ]);
    }
}
