<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\BuyerRequest;
use App\Models\Category;
use App\Models\Conversation;
use App\Models\Dispute;
use App\Models\Favorite;
use App\Models\IntrusionLog;
use App\Models\KycVerification;
use App\Models\Listing;
use App\Models\ListingImage;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Promotion;
use App\Models\PromotionPlan;
use App\Models\Referral;
use App\Models\Report;
use App\Models\Review;
use App\Models\SafeSpot;
use App\Models\SearchAlert;
use App\Models\SiteSetting;
use App\Models\SystemConfig;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MarketplaceDataController extends Controller
{
    /** @var array<string, class-string<Model>> */
    private const MODELS = [
        'profiles' => User::class,
        'categories' => Category::class,
        'subcategories' => Category::class,
        'ads' => Listing::class,
        'notifications' => Notification::class,
        'verification_requests' => KycVerification::class,
        'promotion_payments' => Promotion::class,
        'disputes' => Dispute::class,
        'reports' => Report::class,
        'reviews' => Review::class,
        'buyer_requests' => BuyerRequest::class,
        'announcements' => Announcement::class,
        'safe_spots' => SafeSpot::class,
        'site_settings' => SiteSetting::class,
        'system_configs' => SystemConfig::class,
        'promotion_plans' => PromotionPlan::class,
        'search_alerts' => SearchAlert::class,
        'audit_logs' => AuditLog::class,
        'intrusion_logs' => IntrusionLog::class,
        'referrals' => Referral::class,
        'favorites' => Favorite::class,
        'conversations' => Conversation::class,
        'messages' => Message::class,
    ];

    /** @var list<string> */
    private const PUBLIC_RESOURCES = [
        'profiles', 'categories', 'subcategories', 'ads', 'announcements', 'safe_spots',
        'site_settings', 'promotion_plans', 'reviews', 'buyer_requests', 'favorites',
    ];

    /** @var list<string> */
    private const ADMIN_RESOURCES = [
        'categories', 'subcategories', 'announcements', 'safe_spots', 'site_settings',
        'system_configs', 'promotion_plans', 'audit_logs', 'intrusion_logs',
    ];

    public function index(Request $request, string $resource)
    {
        $this->assertResource($resource);
        $this->assertReadable($request, $resource);

        $query = $this->scopedQuery($request, $resource);
        $this->applyFilters($request, $resource, $query);

        $limit = min(max($request->integer('limit', 100), 1), 100);

        return response()->json(
            $query->latest('created_at')->limit($limit)->get()->map(
                fn (Model $model): array => $this->present($resource, $model, $request)
            )->values()
        );
    }

    public function show(Request $request, string $resource, string $id)
    {
        $this->assertResource($resource);
        $this->assertReadable($request, $resource);

        $model = $this->scopedQuery($request, $resource)->findOrFail($id);

        return response()->json($this->present($resource, $model, $request));
    }

    public function store(Request $request, string $resource)
    {
        $this->assertResource($resource);
        $user = $this->currentUser($request);
        abort_unless($user, 401, 'Authentication required.');

        $this->assertWritable($user, $resource);
        $data = $this->validatedData($request, $resource);
        $model = $this->createResource($resource, $data, $user);

        return response()->json($this->present($resource, $model, $request), 201);
    }

    public function update(Request $request, string $resource, string $id)
    {
        $this->assertResource($resource);
        $user = $this->currentUser($request);
        abort_unless($user, 401, 'Authentication required.');

        $model = $this->scopedQuery($request, $resource, true)->findOrFail($id);
        $this->assertWritable($user, $resource, $model);
        $data = $this->validatedData($request, $resource, true);

        if ($resource === 'notifications' && Arr::get($data, 'read')) {
            $data['read_at'] = now();
        }

        $model->fill(Arr::except($data, ['read']));
        $model->save();

        return response()->json($this->present($resource, $model->fresh(), $request));
    }

    public function destroy(Request $request, string $resource, string $id)
    {
        $this->assertResource($resource);
        $user = $this->currentUser($request);
        abort_unless($user, 401, 'Authentication required.');

        $model = $this->scopedQuery($request, $resource, true)->findOrFail($id);
        $this->assertWritable($user, $resource, $model);
        $model->delete();

        return response()->json(['success' => true]);
    }

    private function assertResource(string $resource): void
    {
        abort_unless(array_key_exists($resource, self::MODELS), 404, 'Unsupported marketplace resource.');
    }

    private function assertReadable(Request $request, string $resource): void
    {
        if (! in_array($resource, self::PUBLIC_RESOURCES, true)) {
            abort_unless($this->currentUser($request), 401, 'Authentication required.');
        }
    }

    private function assertWritable(User $user, string $resource, ?Model $model = null): void
    {
        if (in_array($resource, self::ADMIN_RESOURCES, true)) {
            abort_unless($user->role === 'admin', 403, 'Administrator access is required.');

            return;
        }

        abort_unless(! in_array($resource, ['profiles', 'verification_requests', 'promotion_payments', 'referrals'], true), 403, 'Use the dedicated API endpoint for this action.');

        if ($model === null) {
            return;
        }

        if ($resource === 'reviews') {
            abort_unless($model->buyer_id === $user->id || $user->role === 'admin', 404);

            return;
        }

        $ownerColumn = $this->ownerColumn($resource);
        abort_unless($ownerColumn !== null && (int) $model->{$ownerColumn} === $user->id || $user->role === 'admin', 404);
    }

    private function scopedQuery(Request $request, string $resource, bool $forWrite = false): Builder
    {
        $class = self::MODELS[$resource];
        $query = $class::query();
        $user = $this->currentUser($request);

        if ($resource === 'profiles') {
            if (! $user || $user->role !== 'admin') {
                $query->where('status', 'active');
            }
        }

        if ($resource === 'subcategories') {
            $query->whereNotNull('parent_id');
        }

        if ($resource === 'categories') {
            $query->whereNull('parent_id');
        }

        if ($resource === 'ads') {
            $query->with(['user', 'category', 'images', 'activePromotion']);
            if (! $forWrite && (! $user || $user->role !== 'admin')) {
                $query->active();
            }
        }

        if ($resource === 'favorites') {
            $query->with('listing');
            if (! $user || $user->role !== 'admin') {
                $query->where('user_id', $user->id);
            }
        }

        if ($resource === 'conversations') {
            $query->with('messages');
            if (! $user || $user->role !== 'admin') {
                // Conversations are scoped via conversation_participants pivot
                $query->whereHas('participants', fn ($q) => $q->where('user_id', $user->id));
            }
        }

        if ($resource === 'messages') {
            $query->with('sender');
            if ($request->filled('conversation_id')) {
                $query->where('conversation_id', $request->input('conversation_id'));
            }
            if (! $user || $user->role !== 'admin') {
                $query->where('sender_id', $user->id);
            }
        }

        if (! $forWrite && $resource === 'announcements') {
            $query->where('active', true);
        }

        if (! $forWrite && ($resource === 'safe_spots' || $resource === 'site_settings' || $resource === 'promotion_plans')) {
            $query->where('is_active', true);
        }

        if ($user && $user->role !== 'admin') {
            $ownerColumn = $this->ownerColumn($resource);
            if ($ownerColumn !== null && ! in_array($resource, ['buyer_requests', 'reviews'], true)) {
                $query->where($ownerColumn, $user->id);
            }
        }

        return $query;
    }

    private function applyFilters(Request $request, string $resource, Builder $query): void
    {
        $allowed = match ($resource) {
            'profiles' => ['id', 'role', 'status'],
            'categories', 'subcategories' => ['parent_id', 'is_active'],
            'ads' => ['category_id', 'status', 'user_id'],
            'buyer_requests' => ['category_id', 'status'],
            'reviews' => ['seller_id', 'listing_id'],
            'announcements' => ['type'],
            'safe_spots' => ['zone', 'category'],
            default => [],
        };

        foreach ($allowed as $column) {
            if ($request->filled($column)) {
                $query->where($column, $request->input($column));
            }
        }
    }

    private function ownerColumn(string $resource): ?string
    {
        return match ($resource) {
            'ads' => 'user_id',
            'favorites' => 'id',
            'conversations', 'messages' => 'id',
            'notifications', 'search_alerts', 'audit_logs', 'intrusion_logs', 'disputes', 'buyer_requests' => 'user_id',
            'reports' => 'reporter_id',
            default => null,
        };
    }

    /** @return array<string, mixed> */
    private function validatedData(Request $request, string $resource, bool $isUpdate = false): array
    {
        $required = $isUpdate ? 'sometimes' : 'required';

        return match ($resource) {
            'profiles' => $request->validate([
                'name' => [$required, 'string', 'max:100'],
                'username' => ['sometimes', 'nullable', 'string', 'max:50', 'alpha_dash'],
                'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
                'avatar_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
                'location' => ['sometimes', 'nullable', 'string', 'max:120'],
                'bio' => ['sometimes', 'nullable', 'string', 'max:2000'],
                'cover_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
                'business_name' => ['sometimes', 'nullable', 'string', 'max:255'],
                'business_category' => ['sometimes', 'nullable', 'string', 'max:255'],
                'business_address' => ['sometimes', 'nullable', 'string', 'max:255'],
                'business_hours' => ['sometimes', 'nullable', 'string', 'max:255'],
                'website_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
                'instagram_handle' => ['sometimes', 'nullable', 'string', 'max:100'],
                'twitter_handle' => ['sometimes', 'nullable', 'string', 'max:100'],
                'whatsapp_number' => ['sometimes', 'nullable', 'string', 'max:20'],
                'email_notifications' => ['sometimes', 'boolean'],
                'whatsapp_notifications' => ['sometimes', 'boolean'],
                'hide_phone_publicly' => ['sometimes', 'boolean'],
                'hide_location_publicly' => ['sometimes', 'boolean'],
                'verification_preferences' => ['sometimes', 'array'],
            ]),
            'categories', 'subcategories' => $request->validate([
                'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
                'name' => [$required, 'string', 'max:100'],
                'slug' => ['sometimes', 'nullable', 'string', 'max:120', 'alpha_dash'],
                'icon' => ['sometimes', 'nullable', 'string', 'max:100'],
                'color' => ['sometimes', 'nullable', 'string', 'max:30'],
                'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
                'listing_type' => ['sometimes', 'string', 'max:50'],
                'spec_fields' => ['sometimes', 'nullable', 'array'],
                'sort_order' => ['sometimes', 'integer', 'min:0'],
                'is_active' => ['sometimes', 'boolean'],
            ]),
            'ads' => $request->validate([
                'category_id' => [$required, 'integer', 'exists:categories,id'],
                'title' => [$required, 'string', 'max:150'],
                'description' => [$required, 'string', 'min:20', 'max:5000'],
                'price' => [$required, 'numeric', 'min:0', 'max:999999999.99'],
                'original_price' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:999999999.99'],
                'condition' => [$required, 'string', 'max:50'],
                'location' => [$required, 'string', 'max:120'],
                'status' => ['sometimes', 'in:draft,active,sold,archived'],
                'video_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
                'specifications' => ['sometimes', 'nullable', 'array'],
                'images' => ['sometimes', 'array', 'max:10'],
                'images.*' => ['string', 'max:2048'],
            ]),
            'notifications' => $request->validate([
                'type' => ['sometimes', 'string', 'max:100'],
                'title' => [$required, 'string', 'max:255'],
                'description' => [$required, 'string', 'max:5000'],
                'link_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
                'read' => ['sometimes', 'boolean'],
            ]),
            'reviews' => $request->validate([
                'seller_id' => [$required, 'integer', 'exists:users,id'],
                'listing_id' => ['sometimes', 'nullable', 'integer', 'exists:listings,id'],
                'rating' => [$required, 'integer', 'between:1,5'],
                'comment' => ['sometimes', 'nullable', 'string', 'max:2000'],
            ]),
            'buyer_requests' => $request->validate([
                'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
                'title' => [$required, 'string', 'max:255'],
                'max_budget' => ['sometimes', 'nullable', 'numeric', 'min:0'],
                'location' => [$required, 'string', 'max:120'],
                'description' => [$required, 'string', 'max:5000'],
                'status' => ['sometimes', 'in:open,closed,fulfilled'],
            ]),
            'reports' => $request->validate([
                'listing_id' => ['nullable', 'integer', 'exists:listings,id'],
                'ad_id' => ['nullable', 'integer', 'exists:listings,id'],
                'reason' => [$required, 'string', 'max:255'],
                'details' => ['sometimes', 'nullable', 'string', 'max:5000'],
            ]),
            'disputes' => $request->validate([
                'counterparty_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
                'listing_id' => ['sometimes', 'nullable', 'integer', 'exists:listings,id'],
                'receipt_reference' => ['sometimes', 'nullable', 'string', 'max:255'],
                'item_title' => [$required, 'string', 'max:255'],
                'category' => ['sometimes', 'nullable', 'string', 'max:255'],
                'reason' => [$required, 'string', 'max:255'],
                'details' => [$required, 'string', 'max:5000'],
                'evidence_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            ]),
            'search_alerts' => $request->validate([
                'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
                'query' => ['sometimes', 'nullable', 'string', 'max:255'],
                'max_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
                'location' => ['sometimes', 'nullable', 'string', 'max:120'],
            ]),
            'announcements' => $request->validate([
                'title' => [$required, 'string', 'max:255'],
                'message' => [$required, 'string', 'max:5000'],
                'type' => ['sometimes', 'string', 'max:50'],
                'active' => ['sometimes', 'boolean'],
                'target_roles' => ['sometimes', 'nullable', 'array'],
            ]),
            'safe_spots' => $request->validate([
                'name' => [$required, 'string', 'max:255'],
                'zone' => [$required, 'string', 'max:255'],
                'category' => [$required, 'string', 'max:255'],
                'address' => [$required, 'string', 'max:255'],
                'distance' => ['sometimes', 'nullable', 'string', 'max:100'],
                'hours' => ['sometimes', 'nullable', 'string', 'max:255'],
                'cctv_verified' => ['sometimes', 'boolean'],
                'is_active' => ['sometimes', 'boolean'],
            ]),
            'site_settings' => $request->validate([
                'site_name' => ['sometimes', 'string', 'max:255'],
                'site_description' => ['sometimes', 'nullable', 'string', 'max:5000'],
                'logo_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
                'og_image' => ['sometimes', 'nullable', 'url', 'max:2048'],
                'favicon_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
                'apple_touch_icon_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
                'page_title_home' => ['sometimes', 'nullable', 'string', 'max:255'],
                'theme_color' => ['sometimes', 'nullable', 'string', 'max:20'],
                'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
                'contact_phone' => ['sometimes', 'nullable', 'string', 'max:30'],
                'is_active' => ['sometimes', 'boolean'],
            ]),
            'system_configs' => $request->validate([
                'key' => [$required, 'string', 'max:255'],
                'value' => [$required, 'array'],
                'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            ]),
            'promotion_plans' => $request->validate([
                'months' => [$required, 'integer', 'min:1', 'max:120'],
                'label' => [$required, 'string', 'max:255'],
                'rate' => [$required, 'numeric', 'min:0'],
                'badge' => ['sometimes', 'nullable', 'string', 'max:100'],
                'is_active' => ['sometimes', 'boolean'],
            ]),
            'audit_logs' => $request->validate([
                'action' => [$required, 'string', 'max:255'],
                'details' => ['sometimes', 'nullable', 'string', 'max:5000'],
                'type' => ['sometimes', 'string', 'max:100'],
                'metadata' => ['sometimes', 'nullable', 'array'],
            ]),
            'intrusion_logs' => $request->validate([
                'attempted_email' => ['sometimes', 'nullable', 'email', 'max:255'],
                'device_info' => ['sometimes', 'nullable', 'array'],
                'media_captured' => ['sometimes', 'boolean'],
                'media_status' => ['sometimes', 'string', 'max:100'],
                'status' => ['sometimes', 'string', 'max:100'],
            ]),
            default => abort(422, 'This resource is read-only.'),
        };
    }

    /** @param array<string, mixed> $data */
    private function createResource(string $resource, array $data, User $user): Model
    {
        if ($resource === 'profiles') {
            abort(403, 'Accounts can only be created through registration.');
        }

        if ($resource === 'ads') {
            $imageUrls = Arr::pull($data, 'images', []);
            $data['user_id'] = $user->id;
            $data['condition'] = $this->normaliseCondition($data['condition']);
            $listing = Listing::create($data);

            foreach ($imageUrls as $index => $url) {
                $path = $this->storagePathFromUrl($url, $user->id);
                if ($path !== null) {
                    ListingImage::create(['listing_id' => $listing->id, 'path' => $path, 'sort_order' => $index]);
                }
            }

            return $listing->load(['user', 'category', 'images', 'activePromotion']);
        }

        if ($resource === 'reviews') {
            $data['buyer_id'] = $user->id;
        }

        if ($resource === 'buyer_requests' || $resource === 'search_alerts' || $resource === 'notifications' || $resource === 'audit_logs' || $resource === 'intrusion_logs' || $resource === 'disputes') {
            $data['user_id'] = $user->id;
        }

        if ($resource === 'reports') {
            $data['reporter_id'] = $user->id;
            $data['listing_id'] = $data['listing_id'] ?? $data['ad_id'] ?? null;
            unset($data['ad_id']);
            abort_if($data['listing_id'] === null, 422, 'A listing is required to submit a report.');
        }

        if ($resource === 'notifications' && Arr::pull($data, 'read', false)) {
            $data['read_at'] = now();
        }

        $class = self::MODELS[$resource];

        return $class::create($data);
    }

    private function normaliseCondition(string $condition): string
    {
        return match (Str::of($condition)->lower()->replace([' ', '-'], '_')->toString()) {
            'brand_new' => 'new',
            'used_like_new' => 'like_new',
            'used_good' => 'good',
            'used_fair' => 'fair',
            'needs_repair' => 'needs_repair',
            default => in_array($condition, ['new', 'like_new', 'good', 'fair', 'needs_repair'], true) ? $condition : 'good',
        };
    }

    private function storagePathFromUrl(string $url, int $userId): ?string
    {
        $path = ltrim((string) parse_url($url, PHP_URL_PATH), '/');
        $path = Str::after($path, 'storage/');

        if (! Str::startsWith($path, "uploads/{$userId}/") || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        return $path;
    }

    /** @return array<string, mixed> */
    private function present(string $resource, Model $model, Request $request): array
    {
        if ($resource === 'profiles') {
            /** @var User $model */
            $isOwner = $this->currentUser($request)?->is($model) ?? false;

            return [
                'id' => (string) $model->id,
                'email' => $isOwner ? $model->email : null,
                'auth_email' => $isOwner ? $model->email : null,
                'full_name' => $model->name,
                'phone_number' => $isOwner || ! $model->hide_phone_publicly ? $model->phone : null,
                'avatar_url' => $model->avatar_url,
                'cover_url' => $model->cover_url,
                'bio' => $model->bio,
                'role' => $model->role,
                'verified' => $model->is_verified_seller,
                'verification_type' => $model->kyc_type ?? 'none',
                'business_name' => $model->business_name,
                'business_category' => $model->business_category,
                'business_address' => $model->business_address,
                'business_hours' => $model->business_hours,
                'website_url' => $model->website_url,
                'instagram_handle' => $model->instagram_handle,
                'twitter_handle' => $model->twitter_handle,
                'whatsapp_number' => $model->whatsapp_number,
                'email_notifications' => $isOwner ? $model->email_notifications : null,
                'whatsapp_notifications' => $isOwner ? $model->whatsapp_notifications : null,
                'hide_phone_publicly' => $model->hide_phone_publicly,
                'hide_location_publicly' => $model->hide_location_publicly,
                'location' => $model->hide_location_publicly && ! $isOwner ? null : $model->location,
                'status' => $model->status,
                'total_value_traded' => $model->total_value_traded,
                'completed_deals' => $model->completed_deals,
                'verified_credentials' => $model->verified_credentials,
                'trust_score' => $model->trust_score,
                'credential_expiry_warning_date' => $model->credential_expiry_warning_date,
                'member_since' => $model->created_at,
                'created_at' => $model->created_at,
            ];
        }

        if ($resource === 'ads') {
            /** @var Listing $model */
            $model->loadMissing(['user', 'category', 'images']);

            return [
                'id' => (string) $model->id,
                'slug' => $model->slug,
                'seller_id' => (string) $model->user_id,
                'seller_name' => $model->user?->name,
                'seller_phone' => $model->user?->hide_phone_publicly ? null : $model->user?->phone,
                'seller_avatar' => $model->user?->avatar_url,
                'seller_verified' => $model->user?->is_verified_seller ?? false,
                'seller_verification_type' => $model->user?->kyc_type ?? 'none',
                'category_id' => (string) $model->category_id,
                'title' => $model->title,
                'description' => $model->description,
                'price' => $model->price,
                'original_price' => $model->original_price,
                'condition' => $model->condition,
                'location' => $model->location,
                'status' => $model->status,
                'images' => $model->images->map(fn (ListingImage $image): string => $image->url)->values(),
                'video_url' => $model->video_url,
                'specifications' => $model->specifications ?? [],
                'featured' => $model->featured,
                'views_count' => $model->views_count,
                'created_at' => $model->created_at,
            ];
        }

        if ($resource === 'notifications') {
            /** @var Notification $model */
            return [
                ...$model->toArray(),
                'read' => $model->read_at !== null,
            ];
        }

        if ($resource === 'subcategories') {
            return [...$model->toArray(), 'category_id' => $model->parent_id];
        }

        if ($resource === 'favorites') {
            /** @var Favorite $model */
            return [
                'id' => (string) $model->id,
                'user_id' => (string) $model->user_id,
                'listing_id' => (string) $model->listing_id,
                'listing' => $model->listing ? [
                    'id' => (string) $model->listing->id,
                    'title' => $model->listing->title,
                    'price' => $model->listing->price,
                    'images' => $model->listing->images->map(fn ($img) => $img->url)->values(),
                ] : null,
                'created_at' => $model->created_at,
            ];
        }

        if ($resource === 'conversations') {
            /** @var Conversation $model */
            return [
                'id' => (string) $model->id,
                'listing_id' => (string) $model->listing_id,
                'created_by' => (string) $model->created_by,
                'last_message_at' => $model->last_message_at,
                'created_at' => $model->created_at,
            ];
        }

        if ($resource === 'messages') {
            /** @var Message $model */
            return [
                'id' => (string) $model->id,
                'conversation_id' => (string) $model->conversation_id,
                'sender_id' => (string) $model->sender_id,
                'body' => $model->body,
                'type' => $model->type,
                'created_at' => $model->created_at,
            ];
        }

        return $model->toArray();
    }

    private function currentUser(Request $request): ?User
    {
        $user = auth('sanctum')->user();

        return $user instanceof User ? $user : null;
    }
}
