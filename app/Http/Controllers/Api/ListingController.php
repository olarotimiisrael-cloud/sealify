<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreListingRequest;
use App\Http\Requests\UpdateListingRequest;
use App\Http\Resources\ListingResource;
use App\Mail\NewListingMail;
use App\Models\Category;
use App\Models\Listing;
use App\Models\Notification;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;

class ListingController extends Controller
{
    public function index(Request $request)
    {
        $query = Listing::query()
            ->active()
            ->with(['user', 'category', 'images', 'activePromotion']);

        $user = auth('sanctum')->user();
        if ($user) {
            $query->with(['favorites' => fn ($q) => $q->where('user_id', $user->id)]);
        }

        if ($request->filled('category')) {
            $category = Category::where('slug', $request->string('category'))->first();
            if ($category) {
                $categoryIds = collect([$category->id])
                    ->merge($category->children()->pluck('id'))
                    ->all();
                $query->whereIn('category_id', $categoryIds);
            }
        }

        if ($request->filled('q')) {
            $term = '%'.$request->string('q').'%';
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', $term)
                    ->orWhere('description', 'like', $term);
            });
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', '%'.$request->string('location').'%');
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->input('max_price'));
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->string('condition'));
        }

        // Boost sort: add a computed `is_boosted_flag` column for ordering
        $query->addSelect([
            'is_boosted_flag' => Promotion::selectRaw('1')
                ->whereColumn('promotions.listing_id', 'listings.id')
                ->where('promotions.status', 'active')
                ->where('promotions.ends_at', '>', now())
                ->limit(1),
        ]);

        $query->orderByRaw('is_boosted_flag IS NOT NULL DESC');

        match ($request->input('sort', 'latest')) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'popular' => $query->orderByDesc('views_count'),
            default => $query->orderByDesc('created_at'),
        };

        $listings = $query->paginate(20)->withQueryString();

        return ListingResource::collection($listings);
    }

    public function show(string $slug)
    {
        $query = Listing::query()
            ->active()
            ->where('slug', $slug)
            ->with(['user', 'category', 'images', 'activePromotion']);

        $user = auth('sanctum')->user();
        if ($user) {
            $query->with(['favorites' => fn ($q) => $q->where('user_id', $user->id)]);
        }

        $listing = $query->firstOrFail();

        Listing::where('id', $listing->id)->increment('views_count');
        $listing->views_count += 1;

        return response()->json([
            'data' => new ListingResource($listing),
        ]);
    }

    public function store(StoreListingRequest $request): JsonResponse
    {
        Gate::authorize('create', Listing::class);

        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['status'] = $data['status'] ?? 'active';
        $data['expires_at'] = now()->addDays(30);

        $listing = Listing::create($data);
        $listing->load(['user', 'category', 'images', 'activePromotion']);

        $this->notifyFollowersOfNewListing($listing);

        return response()->json([
            'data' => new ListingResource($listing),
            'message' => 'Listing created.',
        ], 201);
    }

    /**
     * Notify the listing owner's followers in-app and by email (opt-in).
     */
    protected function notifyFollowersOfNewListing(Listing $listing): void
    {
        $owner = $listing->user;
        $followers = $owner->followers()->with('follower')->get()->pluck('follower');

        $notifications = $followers->map(fn (User $follower) => [
            'user_id' => $follower->id,
            'type' => 'new_listing',
            'title' => 'New listing from '.$owner->name,
            'description' => $listing->title,
            'link_url' => '/listings/'.$listing->slug,
            'read_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ])->filter()->toArray();

        if (! empty($notifications)) {
            Notification::insert($notifications);
        }

        foreach ($followers as $follower) {
            if (! $follower->email_notifications) {
                continue;
            }

            Mail::to($follower)->send(new NewListingMail($listing, $follower));
        }
    }

    public function update(UpdateListingRequest $request, Listing $listing): JsonResponse
    {
        Gate::authorize('update', $listing);

        $listing->fill($request->validated());
        $listing->save();
        $listing->load(['user', 'category', 'images', 'activePromotion']);

        return response()->json([
            'data' => new ListingResource($listing),
            'message' => 'Listing updated.',
        ]);
    }

    public function destroy(Listing $listing): JsonResponse
    {
        Gate::authorize('delete', $listing);

        $listing->delete();

        return response()->json([
            'message' => 'Listing deleted.',
        ]);
    }

    public function myListings(Request $request)
    {
        $listings = Listing::query()
            ->where('user_id', $request->user()->id)
            ->with(['user', 'category', 'images', 'activePromotion'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return ListingResource::collection($listings);
    }
}
