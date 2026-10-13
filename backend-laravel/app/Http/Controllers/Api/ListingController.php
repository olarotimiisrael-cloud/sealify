<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ListingController extends Controller
{
    public function index(Request $request)
    {
        $query = Listing::query()->with([
            'seller:id,full_name,phone_number,avatar_url,verified,verification_type,hide_phone_publicly',
        ]);

        if ($request->filled('category') && $request->input('category') !== 'All') {
            $query->where('category_id', $request->input('category'));
        }

        if ($request->filled('subcategory') && $request->input('subcategory') !== 'All') {
            $query->where('subcategory_id', $request->input('subcategory'));
        }

        if ($request->filled('condition') && $request->input('condition') !== 'All') {
            $query->where('condition', $request->input('condition'));
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', '%'.$request->input('location').'%');
        }

        if ($request->filled('minPrice')) {
            $query->where('price', '>=', $request->input('minPrice'));
        }

        if ($request->filled('maxPrice')) {
            $query->where('price', '<=', $request->input('maxPrice'));
        }

        if ($request->filled('searchQuery')) {
            $term = $request->input('searchQuery');
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%");
            });
        }

        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }

        $status = $request->input('status', 'active');
        $query->where('status', $status);

        $sortBy = $request->input('sortBy', 'newest');
        if ($sortBy === 'price-asc') {
            $query->orderBy('price', 'asc');
        } elseif ($sortBy === 'price-desc') {
            $query->orderBy('price', 'desc');
        } elseif ($sortBy === 'popular') {
            $query->orderBy('views_count', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $limit = min(max((int) $request->input('limit', 20), 1), 100);
        $offset = max((int) $request->input('offset', 0), 0);

        $total = (clone $query)->count();
        $listings = $query->skip($offset)->take($limit)->get();

        $listings->each(fn ($listing) => $this->decorateListing($listing));

        return response()->json([
            'listings' => $listings,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    public function show(string $id)
    {
        $listing = Listing::with([
            'seller:id,full_name,phone_number,avatar_url,verified,verification_type,hide_phone_publicly',
        ])->findOrFail($id);

        $listing->increment('views_count');

        return response()->json($this->decorateListing($listing));
    }

    public function store(Request $request)
    {
        $data = $this->validateListing($request);

        $data['status'] = $data['status'] ?? 'active';

        $listing = $request->user()->listings()->create($data);

        return response()->json($listing, 201);
    }

    public function update(Request $request, string $id)
    {
        $listing = Listing::findOrFail($id);
        $this->authorizeOwner($request, $listing);

        $data = $this->validateListing($request, false);
        $listing->update($data);

        return response()->json($listing->fresh());
    }

    public function destroy(Request $request, string $id)
    {
        $listing = Listing::findOrFail($id);
        $this->authorizeOwner($request, $listing);

        $listing->delete();

        return response()->json(['success' => true]);
    }

    private function authorizeOwner(Request $request, Listing $listing)
    {
        abort_unless((int) $listing->seller_id === (int) $request->user()->id, 403, 'You can only modify your own listings.');
    }

    private function decorateListing(Listing $listing): Listing
    {
        $seller = $listing->seller;

        $listing->seller_name = $seller?->full_name;
        $listing->seller_phone = ($seller?->hide_phone_publicly ?? false) ? null : $seller?->phone_number;
        $listing->seller_avatar = $seller?->avatar_url;
        $listing->seller_verified = $seller?->verified;
        $listing->seller_verification_type = $seller?->verification_type;

        $listing->unsetRelation('seller');

        return $listing;
    }

    private function validateListing(Request $request, bool $create = true): array
    {
        return $request->validate([
            'title' => [$create ? 'required' : 'sometimes', 'string', 'min:5', 'max:100'],
            'description' => [$create ? 'required' : 'sometimes', 'string', 'min:20', 'max:5000'],
            'price' => [$create ? 'required' : 'sometimes', 'numeric', 'min:0.01', 'max:100000000'],
            'category_id' => [$create ? 'required' : 'sometimes', 'exists:categories,id'],
            'subcategory_id' => 'sometimes|nullable|string|max:100',
            'condition' => [$create ? 'required' : 'sometimes', 'in:Brand New,Like New,Used - Good,Used - Fair'],
            'location' => [$create ? 'required' : 'sometimes', 'string', 'min:2', 'max:100'],
            'images' => [$create ? 'required' : 'sometimes', 'array', 'min:1', 'max:10'],
            'images.*' => 'string|max:500',
            'video_url' => 'sometimes|nullable|string|max:500',
            'specifications' => 'sometimes|nullable|array',
            'status' => 'sometimes|in:active,sold,draft,pending_review',
        ]);
    }
}
