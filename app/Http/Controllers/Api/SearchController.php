<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $data = $request->validate([
            'q' => ['nullable', 'string', 'max:150'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'location' => ['nullable', 'string', 'max:120'],
        ]);

        $query = Listing::query()
            ->active()
            ->with(['user', 'category', 'images', 'activePromotion']);

        if ($term = $data['q'] ?? null) {
            $query->where(function ($listingQuery) use ($term): void {
                $listingQuery
                    ->where('title', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhere('location', 'like', "%{$term}%");
            });
        }

        foreach (['category_id', 'location'] as $column) {
            if (array_key_exists($column, $data)) {
                $operator = $column === 'location' ? 'like' : '=';
                $value = $column === 'location' ? "%{$data[$column]}%" : $data[$column];
                $query->where($column, $operator, $value);
            }
        }

        if (array_key_exists('min_price', $data)) {
            $query->where('price', '>=', $data['min_price']);
        }

        if (array_key_exists('max_price', $data)) {
            $query->where('price', '<=', $data['max_price']);
        }

        $listings = $query->latest()->paginate(20)->withQueryString();

        return response()->json([
            'listings' => ListingResource::collection($listings)->resolve(),
            'total' => $listings->total(),
            'query' => $data['q'] ?? '',
        ]);
    }

    public function trending(): JsonResponse
    {
        $listings = Listing::query()
            ->active()
            ->with(['user', 'category', 'images', 'activePromotion'])
            ->orderByDesc('views_count')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return response()->json(['listings' => ListingResource::collection($listings)->resolve()]);
    }

    public function suggestions(Request $request): JsonResponse
    {
        $term = $request->validate(['q' => ['required', 'string', 'min:2', 'max:100']])['q'];

        return response()->json([
            'suggestions' => Listing::query()
                ->active()
                ->where('title', 'like', "%{$term}%")
                ->orderByDesc('views_count')
                ->limit(10)
                ->pluck('title')
                ->values(),
        ]);
    }
}
