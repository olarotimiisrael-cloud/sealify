<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Category;
use App\Models\Comment;
use App\Models\CommunityPost;
use App\Models\Conversation;
use App\Models\Dispute;
use App\Models\Favorite;
use App\Models\KycVerification;
use App\Models\NeighborhoodHub;
use App\Models\Listing;
use App\Models\ListingImage;
use \App\Models\Message;
use App\Models\PaymentReceipt;
use App\Models\Promotion;
use App\Models\Report;
use App\Models\Review;
use App\Models\SiteSetting;
use App\Models\SignalingMessage;
use App\Models\SmsOtp;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Requests\Auth\ResendVerificationRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\Auth\OtpService;

class WebController extends Controller
{
    public function home()
    {
        $listings = Listing::active()
            ->with(['images', 'user'])
            ->latest()
            ->paginate(12);
        $categories = Category::withCount('listings')->orderBy('name')->get();
        $topCategories = Category::topLevel()->active()->withCount('listings')->orderBy('sort_order')->get();
        $settings = SiteSetting::first();

        // Fetch active promotions (promoted listings)
        $promotedListings = Listing::active()
            ->whereHas('activePromotion')
            ->with(['images', 'activePromotion'])
            ->latest()
            ->limit(5)
            ->get();

        $userLocation = auth()->check() ? auth()->user()->location : null;
        $neighborhoodHubs = $this->neighborhoodHubs();
        $stats = $this->marketStats();

        return view('pages.home', compact('listings', 'categories', 'topCategories', 'settings', 'userLocation', 'neighborhoodHubs', 'stats', 'promotedListings'));
    }

    public function listings(Request $request)
    {
        $query = Listing::active()->with('seller');

        if ($request->filled('q')) {
            $query->where('title', 'like', '%'.$request->q.'%');
        }
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }
        if ($request->filled('location')) {
            $query->where('location', 'like', '%'.$request->location.'%');
        }

        $listings = $query->latest()->paginate(12)->withQueryString();
        $categories = Category::orderBy('name')->get();
        $settings = SiteSetting::first();

        $userLocation = auth()->check() ? auth()->user()->location : ($request->filled('location') ? $request->location : null);
        $neighborhoodHubs = $this->neighborhoodHubs();

        return view('pages.listings.index', compact('listings', 'categories', 'settings', 'userLocation', 'neighborhoodHubs'));
    }

    private function neighborhoodHubs(): array
    {
        return \Illuminate\Support\Facades\Cache::remember('neighborhood_hubs', 300, function () {
            return NeighborhoodHub::active()->get()->map(function ($hub) {
                return [
                    'key' => $hub->key,
                    'label' => $hub->label,
                    'icon' => $hub->icon,
                    'query' => $hub->query,
                ];
            })->toArray();
        });
    }

    private function marketStats(): array
    {
        return \Illuminate\Support\Facades\Cache::remember('market_stats', 300, function () {
            return [
                'community' => User::count(),
                'impressions' => (int) Listing::sum('views_count'),
                'volume' => Listing::active()->count(),
            ];
        });
    }

    public function listingShow(Listing $listing)
    {
        $listing->increment('views_count');
        $listing->load('seller', 'images', 'category');
        $settings = SiteSetting::first();
        $activePromotion = $listing->activePromotion()->with('user')->first();
        $reviews = $listing->reviews()->with('buyer')->latest()->get();
        $userReview = auth()->check() ? $listing->reviews()->where('buyer_id', auth()->id())->first() : null;
        $comments = $listing->comments()->with('user', 'replies.user')->whereNull('parent_id')->latest()->get();

        return view('pages.listings.show', compact('listing', 'settings', 'activePromotion', 'reviews', 'userReview', 'comments'));
    }

    public function storeReview(Request $request, Listing $listing)
    {
        $user = Auth::user();

        if (! $user) {
            return redirect()->route('login')->with('error', 'You must be logged in to leave a review.');
        }

        if ($user->id === $listing->user_id) {
            return back()->with('error', 'You cannot review your own listing.');
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        Review::updateOrCreate(
            ['seller_id' => $listing->user_id, 'buyer_id' => $user->id, 'listing_id' => $listing->id],
            ['rating' => $validated['rating'], 'comment' => $validated['comment'] ?? null]
        );

        return back()->with('status', 'Your review has been submitted.');
    }

    public function storeComment(Request $request, Listing $listing)
    {
        $user = Auth::user();

        if (! $user) {
            return redirect()->route('login')->with('error', 'You must be logged in to comment.');
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
        ]);

        Comment::create([
            'user_id' => $user->id,
            'commentable_type' => Listing::class,
            'commentable_id' => $listing->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'content' => $validated['content'],
        ]);

        return back()->with('status', 'Your comment has been posted.');
    }

    public function deleteComment(Comment $comment)
    {
        $user = Auth::user();

        if (! $user || ! $user->isAdmin()) {
            abort(403);
        }

        $comment->delete();

        return back()->with('status', 'Comment deleted.');
    }

    public function category(string $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        $listings = $category->listings()->active()->latest()->paginate(12);

        return view('pages.categories.show', compact('category', 'listings'));
    }

    public function categories()
    {
        $categories = Category::topLevel()->active()->with(['children' => function ($q) {
            $q->withCount('listings');
        }])->withCount('listings')->orderBy('sort_order')->get();
        $settings = SiteSetting::first();
        return view('pages.categories.index', compact('categories', 'settings'));
    }

    public function services() { return view('pages.services'); }
    public function howItWorks() { return view('pages.how-it-works'); }
    public function contact() { return view('pages.contact'); }
    public function dispute()
    {
        $user = Auth::user();
        $transactions = Transaction::where('user_id', $user->id)
            ->whereIn('status', ['success', 'paid'])
            ->latest()
            ->take(50)
            ->get();
        $categories = Category::orderBy('name')->get();
        $disputes = Dispute::with('listing')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return view('pages.dispute', compact('transactions', 'categories', 'disputes', 'user'));
    }

    public function disputeStore(Request $request)
    {
        $user = Auth::user();
        $data = $request->validate([
            'transaction_id' => 'nullable|exists:transactions,id',
            'item_title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'reason' => 'required|in:item_not_received,not_as_described,damaged_or_defective,refund_not_received,other',
            'details' => 'required|string|min:10|max:3000',
            'evidence_url' => 'nullable|url|max:2048',
            'receipt_reference' => 'nullable|string|max:255',
        ]);

        $transaction = null;
        $receiptReference = $data['receipt_reference'] ?? null;
        $listingId = null;
        $counterpartyId = null;

        if (!empty($data['transaction_id'])) {
            $transaction = Transaction::where('user_id', $user->id)->find($data['transaction_id']);
            if ($transaction) {
                $receiptReference = $receiptReference ?: $transaction->reference;
                $meta = $transaction->metadata ?? [];
                $listingId = $meta['listing_id'] ?? null;
                $counterpartyId = $meta['seller_id'] ?? $meta['counterparty_id'] ?? null;
            }
        }

        $dispute = Dispute::create([
            'user_id' => $user->id,
            'counterparty_id' => $counterpartyId,
            'listing_id' => $listingId,
            'receipt_reference' => $receiptReference,
            'item_title' => $data['item_title'],
            'category' => $data['category'] ?? null,
            'reason' => $data['reason'],
            'details' => $data['details'],
            'evidence_url' => $data['evidence_url'] ?? null,
            'status' => 'pending',
        ]);

        // Notify all admins in-app
        try {
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'dispute',
                    'title' => 'New trade dispute filed',
                    'description' => $user->name . ' filed a dispute: ' . $data['item_title'] . ' (' . ucfirst(str_replace('_', ' ', $data['reason'])) . ').',
                    'link_url' => route('admin.disputes'),
                    'data' => [
                        'dispute_id' => $dispute->id,
                        'filed_by' => $user->name,
                    ],
                ]);
            }
        } catch (\Throwable $e) {
            logger()->warning('Dispute admin notification failed: ' . $e->getMessage());
        }

        return redirect()->route('dispute')->with('status', 'Your dispute has been submitted. Our team will review it shortly.');
    }
    public function faq() { return view('pages.faq'); }
    public function helpCenter() { return view('pages.help-center'); }
    public function terms() { return view('pages.terms'); }
    public function privacy() { return view('pages.privacy'); }
    public function refundPolicy() { return view('pages.refund-policy'); }
    public function marketInsights() { return view('pages.market-insights'); }
    public function community() {
        $posts = CommunityPost::published()->with('author')->orderBy('created_at', 'desc')->get();
        return view('pages.community', compact('posts'));
    }
    public function safety() { return view('pages.safety'); }
    public function vendors() {
        $verifiedMerchants = User::where('is_verified_seller', true)
            ->orderBy('created_at', 'desc')
            ->get();
        return view('pages.vendors', compact('verifiedMerchants'));
    }

    public function profile()
    {
        $user = Auth::user()->load('listings');
        $referralStatus = $user->getReferralPromotionStatus();
        return view('pages.profile.show', compact('user', 'referralStatus'));
    }

    public function settings() {
        $user = Auth::user();
        return view('pages.settings', compact('user'));
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'phone' => 'sometimes|string|max:50',
            'location' => 'sometimes|string|max:255',
            'bio' => 'sometimes|string|max:1000',
            'avatar_url' => 'sometimes|nullable|url',
        ]);
        $user->update($data);
        $user->update(['profile_completed' => true, 'profile_completed_at' => now()]);

        return back()->with('status', 'Profile updated.');
    }

    public function changePassword(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|confirmed|min:8',
        ]);
        if (! Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }
        $user->update(['password' => Hash::make($request->password)]);
        return back()->with('status', 'Password changed.');
    }

    public function profileComplete() { return view('pages.profile.complete'); }

    public function completeProfile(Request $request)
    {
        $user = Auth::user();
        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:50',
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
        ]);
        $user->update([
            'name' => $data['full_name'],
            'phone' => $data['phone_number'],
            'location' => $data['location'] ?? $user->location,
            'bio' => $data['bio'] ?? $user->bio,
            'profile_completed' => true,
            'profile_completed_at' => now(),
        ]);
        return redirect()->route('dashboard')->with('status', 'Profile completed successfully!');
    }

    public function userDashboard()
    {
        $user = Auth::user()->load(['listings', 'favorites', 'sentReviews', 'receivedReviews', 'transactions', 'paymentReceipts']);
        $stats = [
            'listings' => $user->listings()->count(),
            'active_listings' => $user->listings()->active()->count(),
            'favorites' => $user->favorites()->count(),
            'unread_notifications' => $user->notifications()->whereNull('read_at')->count(),
            'unread_messages' => \App\Models\ConversationParticipant::where('user_id', $user->id)->whereColumn('last_read_at', '<', \App\Models\Conversation::select('last_message_at')->whereColumn('conversations.id', 'conversation_participants.conversation_id'))->count(),
            'wallet_balance' => $user->walletBalance(),
            'average_rating' => $user->averageRating(),
            'review_count' => $user->reviewCount(),
            'referral_count' => $user->successfulReferrals()->count(),
        ];
        return view('pages.dashboard', compact('user', 'stats'));
    }

    /* Biometric / Face ID Lock */
    public function toggleBiometric(Request $request)
    {
        $user = Auth::user();
        $user->biometric_lock_enabled = !$user->biometric_lock_enabled;
        $user->save();
        return back()->with('status', 'Biometric lock ' . ($user->biometric_lock_enabled ? 'enabled' : 'disabled') . '.');
    }

    public function toggleFaceId(Request $request)
    {
        $user = Auth::user();
        $user->face_id_lock_enabled = !$user->face_id_lock_enabled;
        $user->save();
        return back()->with('status', 'Face ID lock ' . ($user->face_id_lock_enabled ? 'enabled' : 'disabled') . '.');
    }

    public function registerBiometric(Request $request)
    {
        $request->validate(['public_key' => 'required|string|max:512']);
        Auth::user()->update([
            'biometric_public_key' => $request->public_key,
            'biometric_registered_at' => now(),
        ]);
        return back()->with('status', 'Biometric key registered successfully.');
    }

    public function registerFaceId(Request $request)
    {
        $request->validate(['public_key' => 'required|string|max:512']);
        Auth::user()->update([
            'face_id_public_key' => $request->public_key,
            'face_id_registered_at' => now(),
        ]);
        return back()->with('status', 'Face ID key registered successfully.');
    }

    /* Verified Badge Application */
    public function applyForVerifiedBadge(Request $request)
    {
        $user = Auth::user();
        if ($user->is_verified_seller) {
            return back()->with('status', 'You already have a verified badge.');
        }
        if ($user->verified_badge_application) {
            return back()->with('status', 'You already have a pending verified badge application.');
        }
        if (!$user->isKycVerified()) {
            return back()->with('error', 'Please complete KYC verification before applying for a verified badge.');
        }
        if (!$user->business_profile_completed) {
            return back()->with('error', 'Please complete your business profile before applying.');
        }
        $user->update(['verified_badge_application' => true]);
        return back()->with('status', 'Verified badge application submitted. Admin will review shortly.');
    }

    public function listingCreate()
    {
        $categories = Category::orderBy('name')->get();
        return view('pages.listings.create', compact('categories'));
    }

    public function listingStore(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'condition' => 'required|in:new,like_new,good,fair,poor,needs_repair',
            'condition_note' => 'nullable|string|max:100',
            'location' => 'required|string|max:255',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'video' => 'nullable|file|mimes:mp4,mov,webm|max:51200',
            'youtube_url' => 'nullable|url',
            'tiktok_url' => 'nullable|url',
        ]);

        $listing = Auth::user()->listings()->create(array_merge($data, [
            'status' => 'active',
            'selling_status' => 'available',
        ]));

        $sortOrder = 0;
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('listings/' . $listing->id, 'public');
                ListingImage::create([
                    'listing_id' => $listing->id,
                    'path' => $path,
                    'sort_order' => $sortOrder++,
                ]);
            }
        }

        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('listings/' . $listing->id . '/videos', 'public');
            $listing->update(['video_url' => $videoPath]);
        }

        return redirect()->route('listings.show', $listing)->with('status', 'Ad posted.');
    }

    public function listingEdit(Listing $listing)
    {
        $this->authorize('update', $listing);
        $categories = Category::orderBy('name')->get();
        return view('pages.listings.edit', compact('listing', 'categories'));
    }

    public function listingUpdate(Request $request, Listing $listing)
    {
        $this->authorize('update', $listing);
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'condition' => 'required|in:new,like_new,good,fair,poor,needs_repair',
            'condition_note' => 'nullable|string|max:100',
            'location' => 'required|string|max:255',
            'new_images' => 'nullable|array|max:10',
            'new_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'video' => 'nullable|file|mimes:mp4,mov,webm|max:51200',
            'youtube_url' => 'nullable|url',
            'tiktok_url' => 'nullable|url',
        ]);
        $listing->update($data);

        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('listings/' . $listing->id . '/videos', 'public');
            $listing->update(['video_url' => $videoPath]);
        }

        // Remove images marked for deletion
        $toRemove = json_decode($request->input('images_to_remove', '[]'), true);
        if ($toRemove) {
            foreach ($toRemove as $imageId) {
                $image = ListingImage::find($imageId);
                if ($image && $image->listing_id === $listing->id) {
                    Storage::disk('public')->delete($image->path);
                    $image->delete();
                }
            }
        }

        // Add new images
        $existingCount = $listing->images()->count();
        $maxTotal = 10;
        $availableSlots = $maxTotal - $existingCount;
        if ($request->hasFile('new_images') && $availableSlots > 0) {
            $sortOrder = $existingCount;
            $files = array_slice($request->file('new_images'), 0, $availableSlots);
            foreach ($files as $image) {
                $path = $image->store('listings/' . $listing->id, 'public');
                ListingImage::create([
                    'listing_id' => $listing->id,
                    'path' => $path,
                    'sort_order' => $sortOrder++,
                ]);
            }
        }

        return redirect()->route('listings.show', $listing)->with('status', 'Ad updated.');
    }

    public function listingDestroy(Listing $listing)
    {
        $this->authorize('delete', $listing);
        foreach ($listing->images as $image) {
            Storage::disk('public')->delete($image->path);
        }
        $listing->delete();
        return redirect()->route('listings.my')->with('status', 'Ad deleted.');
    }

    public function myListings()
    {
        $listings = Auth::user()->listings()->latest()->paginate(12);
        return view('pages.listings.my', compact('listings'));
    }

    public function toggleFavorite(Request $request, Listing $listing)
    {
        $user = Auth::user();
        $favorite = Favorite::where('user_id', $user->id)->where('listing_id', $listing->id)->first();
        $nowFavorite = false;

        if ($favorite) {
            $favorite->delete();
        } else {
            Favorite::create(['user_id' => $user->id, 'listing_id' => $listing->id]);
            $nowFavorite = true;

            // Notify the seller (listing owner) — skip if favoriting your own ad
            if ($listing->user_id !== $user->id) {
                $seller = $listing->user;

                // In-app notification
                $notificationData = [
                    'user_id' => $seller->id,
                    'title' => 'Someone saved your ad',
                    'description' => $user->name . ' added your ad "' . $listing->title . '" to favorites.',
                    'link_url' => route('listings.show', $listing),
                    'data' => [
                        'favorited_by' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'username' => $user->username,
                            'phone' => $user->phone_number ?? $user->phone ?? null,
                            'email' => $user->email,
                            'profile_url' => route('profile.show', $user->username),
                        ],
                        'listing_url' => route('listings.show', $listing),
                        'listing_title' => $listing->title,
                    ],
                ];

                \App\Models\Notification::create($notificationData);

                // Email notification (if seller has email notifications enabled)
                if ($seller->email_notifications) {
                    try {
                        Mail::to($seller)->send(new \App\Mail\ListingFavoritedMail($listing, $seller, $user));
                    } catch (\Throwable $e) {
                        // Email failure should not break favoriting
                        logger()->warning('Failed to send favorite notification email: ' . $e->getMessage());
                    }
                }
            }
        }

        if ($request->expectsJson()) {
            return response()->json([
                'favorited' => $nowFavorite,
                'count' => $user->favoriteListings()->count(),
            ]);
        }

        return back()->with('status', $nowFavorite ? 'Added to favorites.' : 'Removed from favorites.');
    }

    public function favorites()
    {
        $listings = Auth::user()->favoriteListings()->latest()->paginate(12);
        return view('pages.listings.favorites', compact('listings'));
    }

    public function conversations()
    {
        $conversations = Auth::user()->conversations()->with('messages')->latest()->paginate(12);
        return view('pages.messages.index', compact('conversations'));
    }

    public function conversationShow(Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $conversation->load('messages.sender', 'participants');
        return view('pages.messages.show', compact('conversation'));
    }

    public function messageStore(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $data = $request->validate([
            'body' => 'nullable|string|max:5000',
            'attachments' => 'nullable|array|max:10',
            'attachments.*' => 'file|max:20480',
        ]);

        $body = $data['body'] ?? '';
        $files = $request->file('attachments', []);

        $message = $conversation->messages()->create([
            'sender_id' => Auth::id(),
            'receiver_id' => $conversation->participants()->where('user_id', '!=', Auth::id())->first()->user_id,
            'body' => $body,
            'type' => $this->detectMessageType($files),
        ]);

        foreach ($files as $file) {
            $path = $file->store('messages/' . $conversation->id, 'public');
            MessageAttachment::create([
                'message_id' => $message->id,
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                'size_bytes' => $file->getSize(),
            ]);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $message->load('attachments'),
            ], 201);
        }

        return back()->with('status', 'Message sent.');
    }

    private function detectMessageType(array $files): string
    {
        if (empty($files)) {
            return Message::TYPE_TEXT;
        }

        foreach ($files as $file) {
            $mime = $file->getMimeType() ?: '';
            if (str_starts_with($mime, 'image/')) {
                return Message::TYPE_IMAGE;
            }
            if (str_starts_with($mime, 'audio/')) {
                return Message::TYPE_VOICE;
            }
            if (str_starts_with($mime, 'video/')) {
                return Message::TYPE_VIDEO;
            }
        }

        return Message::TYPE_TEXT;
    }

    public function bankAccounts() { return view('pages.bank-accounts.index'); }
    public function bankAccountStore(Request $request) { return back()->with('status', 'Bank account added.'); }

    public function payments()
    {
        $user = Auth::user();
        $transactions = $user->transactions()->latest()->paginate(20);
        $receipts = $user->paymentReceipts()->with('listing')->latest()->limit(50)->get();
        return view('pages.payments.index', compact('user', 'transactions', 'receipts'));
    }

    public function paymentInitiate(Request $request)
    {
        $user = Auth::user();
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'purpose' => ['required', 'string', 'max:50'],
            'metadata' => ['sometimes', 'array'],
        ]);

        try {
            $result = $this->payments->initiate(
                user: $user,
                amount: (float) $data['amount'],
                purpose: $data['purpose'],
                metadata: $data['metadata'] ?? [],
            );
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->away($result['authorization_url']);
    }

    /**
     * Create a unique payment reference for promoting a specific listing.
     * The user then pays (bank transfer etc.) and uploads a receipt for admin review.
     */
    public function paymentInitiatePromotion(Request $request, Listing $listing)
    {
        $user = Auth::user();

        if ($listing->user_id !== $user->id) {
            return back()->with('error', 'You can only promote your own listings.');
        }

        if ($listing->status !== 'active') {
            return back()->with('error', 'Only active listings can be promoted.');
        }

        if (Promotion::active()->where('listing_id', $listing->id)->exists()) {
            return back()->with('error', 'This listing is already promoted.');
        }

        $data = $request->validate([
            'weeks' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $weeks = (int) $data['weeks'];
        $days = $weeks * 7;
        $price = (float) config('promotions.price', 500) * $weeks;

        $reference = 'PROMO-'.$listing->id.'-'.$user->id.'-'.now()->format('YmdHis').'-'.strtoupper(\Illuminate\Support\Str::random(4));

        $transaction = Transaction::create([
            'reference' => $reference,
            'provider' => 'manual',
            'user_id' => $user->id,
            'amount' => $price,
            'currency' => 'NGN',
            'purpose' => 'promotion_boost',
            'status' => 'pending',
            'metadata' => [
                'listing_id' => $listing->id,
                'listing_title' => $listing->title,
                'days' => $days,
                'weeks' => $weeks,
                'kind' => 'paid',
                'unique_payment_id' => $reference,
            ],
            'expires_at' => now()->addDays(7),
        ]);

        return back()->with('promotion_payment', [
            'reference' => $transaction->reference,
            'listing_id' => $listing->id,
            'listing_title' => $listing->title,
            'weeks' => $weeks,
            'days' => $days,
            'amount' => $price,
        ])->with('status', 'Payment reference '.$transaction->reference.' generated for "'.$listing->title.'". Make payment and upload your receipt below.');
    }

    public function myPaymentReceipts()
    {
        $user = Auth::user();
        $receipts = $user->paymentReceipts()->with(['transaction', 'listing'])->latest()->paginate(20);
        return view('pages.payments.receipts', compact('user', 'receipts'));
    }

    public function uploadPaymentReceipt(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'transaction_reference' => ['required', 'string', 'max:64'],
            'receipt' => ['required', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'payer_name' => ['nullable', 'string', 'max:255'],
            'payer_account' => ['nullable', 'string', 'max:50'],
            'amount_paid' => ['required', 'numeric', 'min:1'],
            'paid_at' => ['nullable', 'date'],
        ]);

        $transaction = Transaction::where('reference', $data['transaction_reference'])
            ->where('user_id', $user->id)
            ->where('purpose', 'promotion_boost')
            ->first();

        if (! $transaction) {
            return back()->with('error', 'Payment reference not found.');
        }

        $listingId = $transaction->metadata['listing_id'] ?? null;
        if (! $listingId) {
            return back()->with('error', 'This transaction is not linked to an ad.');
        }

        $file = $request->file('receipt');
        $filename = 'receipt-'.now()->format('YmdHis').'-'.strtoupper(\Illuminate\Support\Str::random(6)).'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('payment-receipts', $filename, 'public');

        PaymentReceipt::create([
            'transaction_id' => $transaction->id,
            'listing_id' => $listingId,
            'user_id' => $user->id,
            'receipt_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'payment_method' => $data['payment_method'] ?? 'bank_transfer',
            'payer_name' => $data['payer_name'] ?? null,
            'payer_account' => $data['payer_account'] ?? null,
            'amount_paid' => $data['amount_paid'],
            'paid_at' => $data['paid_at'] ?? now(),
            'status' => PaymentReceipt::STATUS_PENDING,
        ]);

        // Notify admin via email
        try {
            $adminEmail = config('mail.admin_email', 'admin@sealify.com.ng');
            $subject = 'New Payment Receipt Submitted - Sealify';
            $content = '<h2>New Payment Receipt</h2>' .
                       '<p>A user has submitted a payment receipt for review.</p>' .
                       '<p><strong>User:</strong> ' . e($user->name) . ' (' . e($user->email) . ')</p>' .
                       '<p><strong>Amount:</strong> ₦' . number_format($data['amount_paid'], 0) . '</p>' .
                       '<p><strong>Payment Method:</strong> ' . e($data['payment_method'] ?? 'bank_transfer') . '</p>' .
                       '<p><strong>Listing:</strong> ' . e($transaction->metadata['listing_id'] ?? 'N/A') . '</p>' .
                       '<p>Please review this receipt in the admin dashboard.</p>';
            
            $headers = [
                'From: Sealify Nigeria <noreply@sealify.com.ng>',
                'Reply-To: support@sealify.com.ng',
                'MIME-Version: 1.0',
                'Content-Type: text/html; charset=UTF-8',
            ];
            
            mail($adminEmail, $subject, $content, implode("\r\n", $headers), '-f noreply@sealify.com.ng');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to notify admin of payment receipt: ' . $e->getMessage());
        }

        return redirect()->route('payments.index')
            ->with('status', 'Receipt uploaded. Admin will review and activate your promotion.');
    }

    public function adminPaymentReceipts(Request $request)
    {
        $query = PaymentReceipt::with(['transaction', 'listing.user', 'user', 'reviewer'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $receipts = $query->paginate(20)->withQueryString();
        $pendingCount = PaymentReceipt::where('status', PaymentReceipt::STATUS_PENDING)->count();

        return view('pages.admin.payment-receipts', compact('receipts', 'request', 'pendingCount'));
    }

    public function adminReceiptApprove(Request $request, PaymentReceipt $receipt)
    {
        $data = $request->validate([
            'weeks' => ['required', 'integer', 'min:1', 'max:12'],
            'review_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $weeks = (int) $data['weeks'];
        $days = $weeks * 7;

        DB::transaction(function () use ($receipt, $request, $weeks, $days, $data) {
            $receipt->update([
                'status' => PaymentReceipt::STATUS_APPROVED,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'review_notes' => $data['review_notes'] ?? null,
            ]);

            $transaction = $receipt->transaction;

            if ($transaction) {
                $transaction->forceFill([
                    'status' => 'success',
                    'paid_at' => now(),
                    'failed_at' => null,
                ])->save();

                $transaction->metadata = array_merge($transaction->metadata ?? [], [
                    'days' => $days,
                    'weeks' => $weeks,
                ]);
                $transaction->save();
            }

            // Activate (or extend) the promotion for the ad
            $existing = Promotion::active()->where('listing_id', $receipt->listing_id)->first();

            if ($existing) {
                $existing->forceFill([
                    'ends_at' => $existing->ends_at->copy()->addDays($days),
                    'transaction_id' => $transaction?->id ?? $existing->transaction_id,
                ])->save();
            } else {
                Promotion::create([
                    'listing_id' => $receipt->listing_id,
                    'user_id' => $receipt->user_id,
                    'transaction_id' => $transaction?->id,
                    'starts_at' => now(),
                    'ends_at' => now()->addDays($days),
                    'is_free_trial' => false,
                    'kind' => 'paid',
                    'status' => 'active',
                ]);
            }
        });

        return back()->with('status', 'Receipt approved. The ad is now promoted for '.$weeks.' week(s).');
    }

    public function adminReceiptReject(Request $request, PaymentReceipt $receipt)
    {
        $data = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        $receipt->update([
            'status' => PaymentReceipt::STATUS_REJECTED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_notes' => $data['rejection_reason'],
        ]);

        if ($receipt->transaction) {
            $receipt->transaction->forceFill([
                'status' => 'failed',
                'failed_at' => now(),
                'error_message' => $data['rejection_reason'],
            ])->save();
        }

        return back()->with('status', 'Receipt rejected.');
    }

    public function promotions()
    {
        $user = Auth::user();
        $listings = $user->listings()->active()->latest()->get();
        $referralStatus = $user->getReferralPromotionStatus();
        return view('pages.promotions.index', compact('user', 'listings', 'referralStatus'));
    }

    public function promote(Request $request, Listing $listing)
    {
        $user = Auth::user();

        if ($listing->user_id !== $user->id) {
            return back()->with('error', 'You can only promote your own listings.');
        }

        if ($listing->status !== 'active') {
            return back()->with('error', 'Only active listings can be promoted.');
        }

        $alreadyActive = Promotion::active()
            ->where('listing_id', $listing->id)
            ->exists();

        if ($alreadyActive) {
            return back()->with('error', 'This listing is already promoted.');
        }

        // Requested duration in weeks (1 = 1 week, 2 = 2 weeks, etc.)
        $weeks = max(1, (int) $request->input('weeks', 1));
        $choice = $request->input('payment_choice'); // 'referral' | 'paid' | null

        // --- Referral-based free promotion (credit-based) ---
        $useReferral = $choice === 'referral' || ($choice === null && $user->canClaimPromotion($weeks));

        if ($useReferral) {
            if (! $user->canClaimPromotion($weeks)) {
                return back()->with('error', 'Not enough referral credits for a '.$weeks.'-week promotion.');
            }

            $days = $weeks * 7;

            $promotion = DB::transaction(function () use ($user, $listing, $days, $weeks) {
                $locked = User::lockForUpdate()->find($user->id);

                if (! $locked->canClaimPromotion($weeks)) {
                    return null;
                }

                $promotion = Promotion::create([
                    'listing_id' => $listing->id,
                    'user_id' => $user->id,
                    'transaction_id' => null,
                    'starts_at' => now(),
                    'ends_at' => now()->addDays($days),
                    'is_free_trial' => true,
                    'kind' => 'referral',
                    'status' => 'active',
                ]);

                $locked->usePromotionCredits($weeks);

                return $promotion;
            });

            if ($promotion === null) {
                return back()->with('error', 'Not enough referral credits for a '.$weeks.'-week promotion.');
            }

            return back()->with('status', 'Your '.$weeks.'-week promotion is now active! (Referral credits used)');
        }

        // --- Paid promotion: generate unique payment reference for this ad ---
        $days = $weeks * 7;
        $price = (float) config('promotions.price', 500) * $weeks;
        $reference = 'PROMO-'.$listing->id.'-'.$user->id.'-'.now()->format('YmdHis').'-'.strtoupper(\Illuminate\Support\Str::random(4));

        Transaction::create([
            'reference' => $reference,
            'provider' => 'manual',
            'user_id' => $user->id,
            'amount' => $price,
            'currency' => 'NGN',
            'purpose' => 'promotion_boost',
            'status' => 'pending',
            'metadata' => [
                'listing_id' => $listing->id,
                'listing_title' => $listing->title,
                'days' => $days,
                'weeks' => $weeks,
                'kind' => 'paid',
                'unique_payment_id' => $reference,
            ],
            'expires_at' => now()->addDays(7),
        ]);

        return redirect()->route('payments.index')->with('status', 'Payment reference '.$reference.' generated for "'.$listing->title.'". Pay and upload your receipt for admin approval.');
    }

    public function kyc()
    {
        $user = Auth::user();
        $latest = $user->kycVerifications()->latest('id')->first();
        $badges = User::badgeOptions();
        return view('pages.kyc.index', compact('user', 'latest', 'badges'));
    }

    public function kycSubmit(Request $request)
    {
        $user = Auth::user();

        if ($user->isKycVerified()) {
            return back()->with('status', 'Your identity is already verified.');
        }

        $data = $request->validate([
            'type' => ['required', 'in:nin,bvn,cac,drivers_license,voters_card'],
            'id_number' => ['required', 'string', 'min:8', 'max:20'],
            'first_name' => ['required_unless:type,cac', 'string', 'max:100'],
            'last_name' => ['required_unless:type,cac', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'document' => ['required', 'image', 'mimes:jpeg,png,jpg,pdf,heic,heic|max:5120'],
        ]);

        $file = $request->file('document');
        $extension = $file->getClientOriginalExtension();
        $filename = 'kyc-'.strtolower($data['type']).'-'.$user->id.'-'.now()->timestamp.'.'.$extension;
        $path = $file->storeAs('kyc', $filename, 'public');

        // Create pending KYC verification (manual review, no Bytid call)
        $verification = KycVerification::create([
            'user_id' => $user->id,
            'type' => $data['type'],
            'id_number_last4' => substr($data['id_number'], -4),
            'id_number_hash' => hash('sha256', $data['id_number']),
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'status' => KycVerification::STATUS_PENDING,
            'provider' => 'manual',
            'provider_reference' => 'manual-submission-'.now()->timestamp,
            'document_path' => $path,
        ]);

        return redirect()
            ->route('kyc.index')
            ->with('status', 'KYC submission pending admin review. You will be notified once reviewed.');
    }

    public function notifications()
    {
        $notifications = Auth::user()->notifications()->latest()->paginate(12);
        return view('pages.notifications.index', compact('notifications'));
    }

    public function markNotificationRead($id) { return back()->with('status', 'Marked read.'); }
    public function markAllNotificationsRead() { return back()->with('status', 'All marked read.'); }

    public function userProfile(User $user)
    {
        $listings = $user->listings()->active()->latest()->paginate(12);
        $referralStatus = $user->getReferralPromotionStatus();
        return view('pages.users.show', compact('user', 'listings', 'referralStatus'));
    }

    public function userListings(User $user)
    {
        $listings = $user->listings()->active()->latest()->paginate(12);
        return view('pages.users.listings', compact('user', 'listings'));
    }

    public function toggleFollow(User $user) { return back()->with('status', 'Follow updated.'); }

    public function referrals()
    {
        $user = Auth::user();
        $referralStatus = $user->getReferralPromotionStatus();
        $referrals = $user->successfulReferrals()->with('referee')->latest()->paginate(20);
        $referralLink = route('register.referral', $user->referral_code);

        return view('pages.referrals.index', compact('user', 'referralStatus', 'referrals', 'referralLink'));
    }

    public function savedSearches() { return view('pages.saved-searches.index'); }

    public function search(Request $request)
    {
        $query = Listing::active()->with('seller');
        if ($request->filled('q')) {
            $query->where('title', 'like', '%'.$request->q.'%');
        }
        $listings = $query->latest()->paginate(12)->withQueryString();
        return view('pages.search.index', compact('listings', 'request'));
    }

    public function adminDashboard() {
        $stats = [
            'users' => User::count(),
            'listings' => Listing::count(),
            'active_listings' => Listing::active()->count(),
            'pending_kyc' => KycVerification::where('status', 'pending')->count(),
            'open_disputes' => Dispute::where('status', 'open')->count(),
            'open_reports' => Report::where('status', 'open')->count(),
            'total_value' => Transaction::sum('amount'),
        ];
        return view('pages.admin.dashboard', compact('stats'));
    }

    public function adminUsers(Request $request) {
        $query = User::orderBy('created_at', 'desc');
        if ($request->filled('q')) {
            $query->where('name', 'like', '%'.$request->q.'%')
                  ->orWhere('email', 'like', '%'.$request->q.'%')
                  ->orWhere('phone', 'like', '%'.$request->q.'%');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $users = $query->paginate(20)->withQueryString();
        return view('pages.admin.users', compact('users', 'request'));
    }

    public function adminUserStatus(Request $request, User $user) {
        $request->validate(['status' => 'required|in:active,suspended,banned']);
        $user->update(['status' => $request->status]);
        return back()->with('status', 'User status updated to '.$request->status);
    }

    public function adminUserRole(Request $request, User $user) {
        $request->validate(['role' => 'required|in:user,admin']);
        $user->update(['role' => $request->role]);
        return back()->with('status', 'User role updated to '.$request->role);
    }

    public function adminUserDestroy(User $user) {
        $user->delete();
        return back()->with('status', 'User deleted.');
    }

    public function adminListings(Request $request) {
        $query = Listing::with('user', 'category')->orderBy('created_at', 'desc');
        if ($request->filled('q')) {
            $query->where('title', 'like', '%'.$request->q.'%');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $listings = $query->paginate(20)->withQueryString();
        return view('pages.admin.listings', compact('listings', 'request'));
    }

    public function adminListingStatus(Request $request, Listing $listing) {
        $request->validate(['status' => 'required|in:active,suspended,rejected,sold']);
        $listing->update(['status' => $request->status]);
        return back()->with('status', 'Listing status updated to '.$request->status);
    }

    public function adminListingFeatured(Listing $listing) {
        $listing->update(['featured' => !$listing->featured]);
        return back()->with('status', 'Featured status toggled.');
    }

    public function adminListingDestroy(Listing $listing) {
        foreach ($listing->images as $image) {
            Storage::disk('public')->delete($image->path);
        }
        $listing->delete();
        return back()->with('status', 'Listing deleted.');
    }

    public function adminCategories() {
        $categories = Category::orderBy('sort_order')->orderBy('name')->get();
        return view('pages.admin.categories', compact('categories'));
    }

    public function adminCategoryStore(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer',
            'is_active' => 'sometimes|boolean',
        ]);
        Category::create(array_merge($request->only(['name','slug','icon','color','description','sort_order','is_active']), [
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->integer('sort_order', 0),
        ]));
        return back()->with('status', 'Category created.');
    }

    public function adminCategoryUpdate(Request $request, Category $category) {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug,'.$category->id,
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer',
            'is_active' => 'sometimes|boolean',
        ]);
        $category->update(array_merge($request->only(['name','slug','icon','color','description','sort_order']), [
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->integer('sort_order', 0),
        ]));
        return back()->with('status', 'Category updated.');
    }

    public function adminCategoryDestroy(Category $category) {
        $category->delete();
        return back()->with('status', 'Category deleted.');
    }

    public function adminVerifications(Request $request) {
        $query = KycVerification::with(['user', 'reviewer'])
            ->orderBy('created_at', 'desc');
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $verifications = $query->paginate(20)->withQueryString();
        $badges = User::badgeOptions();
        return view('pages.admin.verifications', compact('verifications', 'request', 'badges'));
    }

    public function adminKycApprove(Request $request, KycVerification $verification) {
        $data = $request->validate([
            'badge' => ['nullable', 'string', 'in:'.implode(',', array_keys(User::badgeOptions()))],
            'review_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $verification->update([
            'status' => KycVerification::STATUS_VERIFIED,
            'verified_at' => now(),
            'rejected_at' => null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_notes' => $data['review_notes'] ?? null,
            'badge_awarded' => $data['badge'] ?? null,
        ]);

        if ($verification->badge_awarded) {
            $verification->user->update([
                'kyc_verified_at' => now(),
                'kyc_type' => $verification->type,
                'is_verified_seller' => true,
                'badge' => $verification->badge_awarded,
            ]);
        }

        return back()->with('status', 'KYC approved.');
    }

    public function adminKycReject(Request $request, KycVerification $verification) {
        $data = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        $verification->update([
            'status' => KycVerification::STATUS_REJECTED,
            'rejected_at' => now(),
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => $data['rejection_reason'],
            'verified_at' => null,
        ]);

        return back()->with('status', 'KYC rejected.');
    }

    public function adminKycDocument(KycVerification $verification) {
        $verification->load('user');
        if (! $verification->hasDocument()) {
            abort(404);
        }

        $path = Storage::disk('public')->path($verification->document_path);

        return response()->file($path, [
            'Content-Type' => Storage::disk('public')->mimeType($verification->document_path),
        ]);
    }

    public function adminPromotions() {
        $promotions = Promotion::with('listing.user')->orderBy('created_at', 'desc')->paginate(20);
        return view('pages.admin.promotions', compact('promotions'));
    }

    public function adminNeighborhoodHubs() {
        $hubs = NeighborhoodHub::orderBy('sort_order')->get();
        return view('pages.admin.neighborhood-hubs', compact('hubs'));
    }

    public function adminNeighborhoodHubStore(Request $request) {
        $data = $request->validate([
            'key' => ['required', 'string', 'max:50', 'unique:neighborhood_hubs,key'],
            'label' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:30'],
            'query' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        NeighborhoodHub::create([
            'key' => $data['key'],
            'label' => $data['label'],
            'icon' => $data['icon'] ?? 'grid',
            'query' => $data['query'] ?? null,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        return back()->with('status', 'Neighborhood hub added.');
    }

    public function adminNeighborhoodHubUpdate(Request $request, NeighborhoodHub $hub) {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:30'],
            'query' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $hub->update($data);

        return back()->with('status', 'Neighborhood hub updated.');
    }

    public function adminNeighborhoodHubDestroy(NeighborhoodHub $hub) {
        $hub->delete();
        return back()->with('status', 'Neighborhood hub deleted.');
    }

    public function adminPromotionStop(Promotion $promotion) {
        $promotion->update([
            'status' => 'stopped',
            'ends_at' => now(),
        ]);
        return back()->with('status', 'Promotion stopped.');
    }

    public function adminPromotionEmail(Request $request, Promotion $promotion) {
        $promotion->load('listing.user');

        $listing = $promotion->listing;
        if (! $listing) {
            return back()->withErrors(['email' => 'Listing not found for this promotion.']);
        }

        $users = User::where('email_verified_at', '!=', null)->get();

        $subject = $request->input('subject', 'Featured Ad: ' . $listing->title);

        $content = $request->input('content', '');
        if (empty($content)) {
            $url = route('listings.show', $listing);
            $content = '<p>Check out this featured listing:</p>' .
                       '<h2>' . e($listing->title) . '</h2>' .
                       '<p>Price: ₦' . number_format($listing->price, 0) . '</p>' .
                       '<p>Location: ' . e($listing->location) . '</p>' .
                       '<p><a href="' . $url . '">View listing</a></p>';
        }

        $fromName = 'Sealify Nigeria';
        $fromEmail = 'noreply@sealify.com.ng';
        $replyTo = 'support@sealify.com.ng';

        $sent = 0;
        $failed = 0;

        foreach ($users as $user) {
            try {
                $headers = [
                    'From: ' . $fromName . ' <' . $fromEmail . '>',
                    'Reply-To: ' . $replyTo,
                    'X-Mailer: PHP/' . phpversion(),
                    'MIME-Version: 1.0',
                    'Content-Type: text/html; charset=UTF-8',
                ];

                $success = mail(
                    $user->email,
                    $subject,
                    $content,
                    implode("\r\n", $headers),
                    '-f ' . $fromEmail
                );

                if ($success) {
                    $sent++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Email send failed to {$user->email}: " . $e->getMessage());
                $failed++;
            }
        }

        return back()->with('status', "Promotion email sent to {$sent} users ({$failed} failed).");
    }

    public function adminPromotionDestroy(Promotion $promotion) {
        $promotion->delete();
        return back()->with('status', 'Promotion deleted.');
    }

    public function adminDisputes(Request $request) {
        $query = Dispute::with('listing', 'user')->orderBy('created_at', 'desc');
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $disputes = $query->paginate(20)->withQueryString();
        return view('pages.admin.disputes', compact('disputes', 'request'));
    }

    public function adminDisputeResolve(Request $request, Dispute $dispute) {
        $request->validate(['status' => 'required|in:resolved,rejected,escalated']);
        $dispute->update(['status' => $request->status, 'resolved_at' => now()]);
        return back()->with('status', 'Dispute resolved.');
    }

    public function adminReports(Request $request) {
        $query = Report::with('reporter')->orderBy('created_at', 'desc');
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $reports = $query->paginate(20)->withQueryString();
        return view('pages.admin.reports', compact('reports', 'request'));
    }

    public function adminReportResolve(Request $request, Report $report) {
        $request->validate(['status' => 'required|in:resolved,dismissed']);
        $report->update(['status' => $request->status, 'resolved_at' => now()]);
        return back()->with('status', 'Report resolved.');
    }

    public function adminTransactions() {
        $transactions = Transaction::with('user')->orderBy('created_at', 'desc')->paginate(20);
        return view('pages.admin.transactions', compact('transactions'));
    }

    public function adminSystemConfig() {
        $settings = SiteSetting::pluck('value', 'key')->all();
        return view('pages.admin.system-config', compact('settings'));
    }

    public function adminSystemConfigUpdate(Request $request) {
        foreach ($request->except('_token') as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return back()->with('status', 'System config updated.');
    }

    public function adminAnnouncements() {
        $announcements = Announcement::orderBy('created_at', 'desc')->paginate(20);
        return view('pages.admin.announcements', compact('announcements'));
    }

    public function adminAnnouncementStore(Request $request) {
        $request->validate(['title' => 'required|string|max:255', 'content' => 'required|string']);
        Announcement::create($request->only(['title','content','is_active']));
        return back()->with('status', 'Announcement created.');
    }

    public function adminAnnouncementDestroy(Announcement $announcement) {
        $announcement->delete();
        return back()->with('status', 'Announcement deleted.');
    }

    /* Community News Board (Admin) */
    public function adminCommunity() {
        $posts = CommunityPost::with('author')->orderBy('created_at', 'desc')->paginate(20);
        return view('pages.admin.community', compact('posts'));
    }

    public function adminCommunityStore(Request $request) {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_published' => 'sometimes|boolean',
        ]);
        CommunityPost::create(array_merge($request->only(['title', 'content', 'is_published']), [
            'user_id' => auth()->id(),
        ]));
        return back()->with('status', 'Community post created.');
    }

    public function adminCommunityUpdate(Request $request, CommunityPost $post) {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_published' => 'sometimes|boolean',
        ]);
        $post->update($request->only(['title', 'content', 'is_published']));
        return back()->with('status', 'Community post updated.');
    }

    public function adminCommunityDestroy(CommunityPost $post) {
        $post->delete();
        return back()->with('status', 'Community post deleted.');
    }

    /* SEO, AdSense & Analytics */
    public function adminSeo() {
        $settings = SiteSetting::first() ?? new SiteSetting();
        return view('pages.admin.seo', compact('settings'));
    }

    public function adminSeoUpdate(Request $request) {
        $request->validate([
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:500',
            'google_analytics_id' => 'nullable|string|max:50',
            'google_tag_manager_id' => 'nullable|string|max:50',
            'facebook_pixel_id' => 'nullable|string|max:50',
            'robots_txt' => 'nullable|string',
            'adsense_enabled' => 'sometimes|boolean',
            'adsense_client_id' => 'nullable|string|max:50',
            'adsense_slot_home' => 'nullable|string|max:50',
            'adsense_slot_listing' => 'nullable|string|max:50',
            'adsense_slot_detail' => 'nullable|string|max:50',
            'adsense_auto_ads' => 'sometimes|boolean',
            'adsense_placement_home_top' => 'sometimes|boolean',
            'adsense_placement_home_bottom' => 'sometimes|boolean',
            'adsense_placement_listing_top' => 'sometimes|boolean',
            'adsense_placement_listing_bottom' => 'sometimes|boolean',
            'adsense_placement_detail_top' => 'sometimes|boolean',
            'adsense_placement_detail_bottom' => 'sometimes|boolean',
        ]);

        $settings = SiteSetting::first() ?? new SiteSetting();
        $settings->fill($request->only([
            'meta_title', 'meta_description', 'meta_keywords',
            'google_analytics_id', 'google_tag_manager_id', 'facebook_pixel_id',
            'robots_txt',
            'adsense_enabled', 'adsense_client_id', 'adsense_slot_home',
            'adsense_slot_listing', 'adsense_slot_detail', 'adsense_auto_ads',
            'adsense_placement_home_top', 'adsense_placement_home_bottom',
            'adsense_placement_listing_top', 'adsense_placement_listing_bottom',
            'adsense_placement_detail_top', 'adsense_placement_detail_bottom',
        ]));
        $settings->save();

        return back()->with('status', 'SEO, AdSense & Analytics settings updated.');
    }

    /* Business Profile - User */
    public function businessProfile() {
        $user = Auth::user()->load('listings');
        return view('pages.business.profile', compact('user'));
    }

    public function businessProfileUpdate(Request $request) {
        $user = Auth::user();
        $data = $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'business_category' => 'sometimes|string|max:255',
            'business_address' => 'sometimes|string|max:255',
            'cac_number' => 'sometimes|string|max:100',
            'business_hours' => 'sometimes|string|max:255',
            'website_url' => 'sometimes|nullable|url|max:255',
            'instagram_handle' => 'sometimes|nullable|string|max:100',
            'twitter_handle' => 'sometimes|nullable|string|max:100',
            'whatsapp_number' => 'sometimes|nullable|string|max:50',
        ]);
        $user->update($data);

        return back()->with('status', 'Business profile updated.');
    }

    /* Business Profile - Admin */
    public function adminBusinesses(Request $request) {
        $query = User::whereNotNull('business_name')
            ->orWhereNotNull('business_category')
            ->orWhere('is_verified_seller', true)
            ->orderBy('created_at', 'desc');
        if ($request->filled('q')) {
            $query->where('name', 'like', '%'.$request->q.'%')
                  ->orWhere('business_name', 'like', '%'.$request->q.'%')
                  ->orWhere('email', 'like', '%'.$request->q.'%');
        }
        if ($request->filled('verified')) {
            $query->where('is_verified_seller', $request->boolean('verified'));
        }
        $businesses = $query->paginate(20)->withQueryString();
        return view('pages.admin.businesses', compact('businesses', 'request'));
    }

    public function adminBusinessShow(User $user) {
        $user->load('listings', 'kycVerifications');
        return view('pages.admin.business-show', compact('user'));
    }

    public function adminBusinessVerify(User $user) {
        $user->update(['is_verified_seller' => true, 'verified_badge_application' => false]);
        return back()->with('status', 'Business verified.');
    }

    public function adminBusinessUnverify(User $user) {
        $user->update(['is_verified_seller' => false]);
        return back()->with('status', 'Business unverified.');
    }

    public function adminVerifyBadgeApplications()
    {
        $users = User::where('verified_badge_application', true)
            ->where('is_verified_seller', false)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        return view('pages.admin.verified-badge-applications', compact('users'));
    }

    public function adminApproveBadge(User $user)
    {
        $user->update(['is_verified_seller' => true, 'verified_badge_application' => false]);
        return back()->with('status', 'Verified badge approved for ' . $user->name . '.');
    }

    public function adminRejectBadge(User $user)
    {
        $user->update(['verified_badge_application' => false]);
        return back()->with('status', 'Verified badge application rejected for ' . $user->name . '.');
    }

    /* Messaging - Media Attachments */
    public function messageAttachmentStore(Request $request, Conversation $conversation) {
        $this->authorize('view', $conversation);

        $request->validate([
            'file' => 'required|file|max:20480', // 20MB max
            'type' => 'required|in:image,voice,video',
            'body' => 'nullable|string|max:5000',
            'duration_seconds' => 'nullable|integer|min:1|max:3600',
        ]);

        $file = $request->file('file');
        $path = $file->store('messages/' . $conversation->id, 'public');

        $message = $conversation->messages()->create([
            'sender_id' => Auth::id(),
            'receiver_id' => $conversation->participants()->where('user_id', '!=', Auth::id())->first()->user_id,
            'body' => $request->input('body', ''),
            'type' => match ($request->input('type')) {
                'image' => Message::TYPE_IMAGE,
                'voice' => Message::TYPE_VOICE,
                'video' => Message::TYPE_VIDEO,
                default => Message::TYPE_TEXT,
            },
            'duration_seconds' => $request->input('duration_seconds'),
        ]);

        MessageAttachment::create([
            'message_id' => $message->id,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'duration_seconds' => $request->input('duration_seconds'),
        ]);

        return response()->json([
            'success' => true,
            'message' => $message->load('attachments'),
        ]);
    }

    public function messageAttachmentShow(MessageAttachment $attachment) {
        $message = $attachment->message;
        $this->authorize('view', $message->conversation);

        return response()->file(Storage::disk('public')->path($attachment->path), [
            'Content-Type' => $attachment->mime_type,
            'Content-Disposition' => 'inline; filename="' . $attachment->original_name . '"',
        ]);
    }

    public function videoCallInitiate(Request $request, Conversation $conversation) {
        $this->authorize('view', $conversation);

        $request->validate([
            'type' => 'required|in:video,voice',
        ]);

        // Generate a call session identifier
        $callSessionId = 'call_' . $conversation->id . '_' . time() . '_' . Str::random(8);

        // Store call session in conversation metadata or return for WebRTC signaling
        return response()->json([
            'success' => true,
            'call_session_id' => $callSessionId,
            'type' => $request->input('type'),
            'conversation_id' => $conversation->id,
            'initiator_id' => Auth::id(),
            'initiator_name' => Auth::user()->name,
        ]);
    }

    public function signalingStore(Request $request, Conversation $conversation) {
        $this->authorize('view', $conversation);

        $request->validate([
            'type' => 'required|in:offer,answer,ice-candidate,hangup',
            'payload' => 'required|array',
        ]);

        // Clean old signaling messages (older than 5 minutes) to prevent buildup
        \App\Models\SignalingMessage::where('conversation_id', $conversation->id)
            ->where('created_at', '<', now()->subMinutes(5))
            ->delete();

        $signal = \App\Models\SignalingMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => Auth::id(),
            'type' => $request->input('type'),
            'payload' => $request->input('payload'),
        ]);

        return response()->json([
            'success' => true,
            'signal_id' => $signal->id,
            'created_at' => $signal->created_at->toISOString(),
        ]);
    }

    public function signalingPoll(Request $request, Conversation $conversation) {
        $this->authorize('view', $conversation);

        $since = $request->input('since', now()->subMinutes(2)->toISOString());

        // Get signals from other user, newer than since
        $signals = \App\Models\SignalingMessage::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', Auth::id())
            ->where('created_at', '>', $since)
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'signals' => $signals->map(fn($s) => [
                'id' => $s->id,
                'type' => $s->type,
                'payload' => $s->payload,
                'sender_id' => $s->sender_id,
                'created_at' => $s->created_at->toISOString(),
            ]),
        ]);
    }

    /* Users - Full Admin CRUD */
    public function adminUserEdit(User $user) {
        $badges = User::badgeOptions();
        return view('pages.admin.user-edit', compact('user', 'badges'));
    }

    public function adminUserUpdate(Request $request, User $user) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:50',
            'status' => 'required|in:active,suspended,banned',
            'role' => 'required|in:user,admin',
            'badge' => 'nullable|in:' . implode(',', array_keys(User::badgeOptions())),
            'bio' => 'nullable|string|max:1000',
            'location' => 'nullable|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'business_category' => 'nullable|string|max:255',
            'business_address' => 'nullable|string|max:255',
            'cac_number' => 'nullable|string|max:100',
            'business_hours' => 'nullable|string|max:255',
            'website_url' => 'nullable|url|max:255',
            'instagram_handle' => 'nullable|string|max:100',
            'twitter_handle' => 'nullable|string|max:100',
            'whatsapp_number' => 'nullable|string|max:50',
            'new_password' => 'nullable|string|min:8|confirmed',
        ]);

        $data = $request->only([
            'name', 'email', 'phone', 'status', 'role', 'badge',
            'bio', 'location', 'business_name', 'business_category',
            'business_address', 'cac_number', 'business_hours',
            'website_url', 'instagram_handle', 'twitter_handle', 'whatsapp_number',
        ]);

        if ($request->filled('new_password')) {
            $data['password'] = Hash::make($request->new_password);
        }

        $user->update($data);

        return back()->with('status', 'User "' . $user->name . '" updated successfully.');
    }

    public function adminUserBadge(Request $request, User $user) {
        $request->validate([
            'badge' => 'required|in:' . implode(',', array_merge([null], array_keys(User::badgeOptions()))),
        ]);

        $user->update(['badge' => $request->badge === 'none' ? null : $request->badge]);

        return back()->with('status', 'Badge updated for ' . $user->name . '.');
    }

    /* User Ban Management */
    public function adminBanUser(Request $request, User $user) {
        $request->validate([
            'duration' => 'required|in:1_week,2_weeks,1_month,3_months,permanent',
            'reason' => 'required|string|max:500',
        ]);

        $now = now();
        $bannedUntil = match ($request->duration) {
            '1_week' => $now->copy()->addWeek(),
            '2_weeks' => $now->copy()->addWeeks(2),
            '1_month' => $now->copy()->addMonth(),
            '3_months' => $now->copy()->addMonths(3),
            'permanent' => null,
        };

        $user->update([
            'status' => 'banned',
            'banned_until' => $bannedUntil,
            'ban_reason' => $request->reason,
        ]);

        // Send ban notification email
        try {
            $fromName = 'Sealify Nigeria';
            $fromEmail = 'noreply@sealify.com.ng';
            $replyTo = 'support@sealify.com.ng';

            $durationText = match ($request->duration) {
                '1_week' => '1 week',
                '2_weeks' => '2 weeks',
                '1_month' => '1 month',
                '3_months' => '3 months',
                'permanent' => 'permanently',
            };

            $headers = [
                'From: ' . $fromName . ' <' . $fromEmail . '>',
                'Reply-To: ' . $replyTo,
                'X-Mailer: PHP/' . phpversion(),
                'MIME-Version: 1.0',
                'Content-Type: text/html; charset=UTF-8',
            ];

            $content = '
            <h2>Sealify Account Temporarily Banned</h2>
            <p>Dear <strong>' . $user->name . '</strong>,</p>
            <p>Your Sealify account has been <strong>temporarily banned</strong> for the following reason:</p>
            <p><em>' . htmlspecialchars($request->reason) . '</em></p>
            <p><strong>Ban Duration:</strong> ' . ucfirst($durationText) . '</p>' .
            ($bannedUntil ? '<p><strong>Ban Expires:</strong> ' . $bannedUntil->format('F j, Y, g:i A') . '</p>' : '<p><strong>Ban Type:</strong> Permanent</p>') .
            '<p>If you believe this ban was made in error or wish to discuss this decision, please contact our support team at <strong>support@sealify.com.ng</strong>.</p>
            <p>Thank you for your understanding.</p>
            <p>— The Sealify Team</p>
            ';

            mail(
                $user->email,
                'Your Sealify Account Has Been Temporarily Banned',
                $content,
                implode("\r\n", $headers),
                '-f ' . $fromEmail
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Ban email failed to {$user->email}: " . $e->getMessage());
        }

        return back()->with('status', 'User "' . $user->name . '" has been banned for ' . $request->duration . '. Notification email sent.');
    }

    public function adminUnbanUser(Request $request, User $user) {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $user->update([
            'status' => 'active',
            'banned_until' => null,
            'ban_reason' => null,
        ]);

        // Send unban notification email
        try {
            $fromName = 'Sealify Nigeria';
            $fromEmail = 'noreply@sealify.com.ng';
            $replyTo = 'support@sealify.com.ng';

            $content = '
            <h2>Sealify Account Unbanned</h2>
            <p>Dear <strong>' . $user->name . '</strong>,</p>
            <p>Good news! Your Sealify account has been <strong>unbanned</strong> and is now active again.</p>
            <p>You can now log in and continue using Sealify to buy, sell, and connect locally.</p>
            <p>If you have any questions, please contact our support team at <strong>support@sealify.com.ng</strong>.</p>
            <p>— The Sealify Team</p>
            ';

            $headers = [
                'From: ' . $fromName . ' <' . $fromEmail . '>',
                'Reply-To: ' . $replyTo,
                'X-Mailer: PHP/' . phpversion(),
                'MIME-Version: 1.0',
                'Content-Type: text/html; charset=UTF-8',
            ];

            mail(
                $user->email,
                'Your Sealify Account Has Been Unbanned',
                $content,
                implode("\r\n", $headers),
                '-f ' . $fromEmail
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Unban email failed to {$user->email}: " . $e->getMessage());
        }

        return back()->with('status', 'User "' . $user->name . '" has been unbanned.');
    }

    /* Banned User Page */
    public function bannedPage() {
        $user = auth()->user();

        if (! $user || ! $user->isBanned()) {
            return redirect()->route('home');
        }

        return view('pages.banned', compact('user'));
    }

    /* Email Broadcaster */
    public function adminEmailBroadcaster() {
        $users = User::where('email_verified_at', '!=', null)->orderBy('created_at', 'desc')->get();
        return view('pages.admin.email-broadcaster', compact('users'));
    }

    public function adminEmailSend(Request $request) {
        $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'send_to' => 'required|in:all,verified,active',
        ]);

        $query = User::where('email_verified_at', '!=', null);

        if ($request->send_to === 'active') {
            $query->where('status', 'active');
        }

        $recipients = $query->get();

        $sent = 0;
        $failed = 0;

        $fromName = 'Sealify Nigeria';
        $fromEmail = 'noreply@sealify.com.ng';
        $replyTo = 'support@sealify.com.ng';

        foreach ($recipients as $user) {
            try {
                $headers = [
                    'From: ' . $fromName . ' <' . $fromEmail . '>',
                    'Reply-To: ' . $replyTo,
                    'X-Mailer: PHP/' . phpversion(),
                    'MIME-Version: 1.0',
                    'Content-Type: text/html; charset=UTF-8',
                ];

                $success = mail(
                    $user->email,
                    $request->subject,
                    $request->content,
                    implode("\r\n", $headers),
                    '-f ' . $fromEmail
                );

                if ($success) {
                    $sent++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Email send failed to {$user->email}: " . $e->getMessage());
                $failed++;
            }
        }

        return back()->with('status', "Email broadcast sent: {$sent} sent, {$failed} failed.");
    }

    public function adminEmailSendIndividual(Request $request) {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $user = User::find($request->user_id);

        if (! $user->email_verified_at) {
            return back()->withErrors(['user_id' => 'User email is not verified.']);
        }

        $fromName = 'Sealify Nigeria';
        $fromEmail = 'noreply@sealify.com.ng';
        $replyTo = 'support@sealify.com.ng';

        $headers = [
            'From: ' . $fromName . ' <' . $fromEmail . '>',
            'Reply-To: ' . $replyTo,
            'X-Mailer: PHP/' . phpversion(),
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
        ];

        try {
            $success = mail(
                $user->email,
                $request->subject,
                $request->content,
                implode("\r\n", $headers),
                '-f ' . $fromEmail
            );

            if ($success) {
                return back()->with('status', "Email sent to {$user->name} ({$user->email}).");
            }
            return back()->withErrors(['email' => 'Failed to send email.']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Email send failed to {$user->email}: " . $e->getMessage());
            return back()->withErrors(['email' => 'Failed to send email.']);
        }
    }

    public function adminEmailUploadImage(Request $request) {
        $request->validate([
            'file' => 'required|image|max:10240', // 10MB max for email images
        ]);

        $file = $request->file('file');
        $path = $file->store('email-images/' . date('Y/m/d'), 'public');

        return response()->json([
            'location' => Storage::disk('public')->url($path),
        ]);
    }

    /* SMS OTP - No third-party, all local */
    public function requestSmsOtp(Request $request) {
        $request->validate([
            'phone_number' => 'required|string|max:50',
            'purpose' => 'sometimes|string|max:50',
        ]);

        $user = Auth::user();
        $purpose = $request->input('purpose', 'verification');

        $otp = SmsOtp::createOtp($user, $request->phone_number, $purpose, 15);

        // Since no third-party SMS gateway, store OTP locally.
        // The OTP code is shown to the user via session flash.
        // Admin can also view all pending OTPs in the SMS OTP admin panel.

        return back()->with('status', "SMS OTP code generated: <strong>{$otp->otp_code}</strong> for {$request->phone_number}. Code valid for 15 minutes. Check Admin Panel > SMS OTP to manage all codes.");
    }

    public function verifySmsOtp(Request $request) {
        $request->validate([
            'phone_number' => 'required|string|max:50',
            'otp_code' => 'required|string|size:6',
            'purpose' => 'sometimes|string|max:50',
        ]);

        $user = Auth::user();
        $purpose = $request->input('purpose', 'verification');

        $otp = SmsOtp::where('user_id', $user->id)
            ->where('phone_number', $request->phone_number)
            ->where('purpose', $purpose)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->orderBy('created_at', 'desc')
            ->first();

        if (! $otp || $otp->otp_code !== $request->otp_code) {
            return back()->withErrors(['otp_code' => 'Invalid or expired OTP code.']);
        }

        $otp->markUsed();

        // Mark phone as verified on user
        $user->update(['phone_verified_at' => now()]);

        return back()->with('status', "Phone number {$request->phone_number} verified successfully!");
    }

    /* SMS OTP Admin Management */
    public function adminSmsOtp() {
        $otps = SmsOtp::with('user')->orderBy('created_at', 'desc')->paginate(20);
        return view('pages.admin.sms-otp', compact('otps'));
    }

    public function adminVerifySmsOtp(SmsOtp $otp) {
        $otp->markUsed();
        $otp->user->update(['phone_verified_at' => now()]);
        return back()->with('status', "OTP for {$otp->phone_number} manually verified by admin.");
    }

    public function adminDeleteSmsOtp(SmsOtp $otp) {
        $otp->delete();
        return back()->with('status', "OTP record deleted.");
    }

    /* Reporting System - Users can report listings, users, drugs, fraud */
    public function reportListing(Listing $listing) {
        return view('pages.report.listing', compact('listing'));
    }

    public function storeListingReport(Request $request, Listing $listing) {
        $request->validate([
            'reason' => 'required|string|max:255',
            'details' => 'required|string|max:2000',
            'evidence_file' => 'nullable|file|max:10240',
        ]);

        $data = [
            'listing_id' => $listing->id,
            'reporter_id' => Auth::id(),
            'report_type' => 'listing',
            'reason' => $request->reason,
            'details' => $request->details,
            'status' => 'pending',
        ];

        if ($request->hasFile('evidence_file')) {
            $path = $request->file('evidence_file')->store('reports/' . date('Y/m/d'), 'public');
            $data['evidence_file'] = $path;
        }

        Report::create($data);

        return redirect()->route('listings.show', $listing)
            ->with('status', 'Your report has been submitted. Our team will review it.');
    }

    public function reportUser(User $user) {
        return view('pages.report.user', compact('user'));
    }

    public function storeUserReport(Request $request, User $user) {
        $request->validate([
            'reason' => 'required|string|max:255',
            'details' => 'required|string|max:2000',
            'evidence_file' => 'nullable|file|max:10240',
        ]);

        $data = [
            'reporter_id' => Auth::id(),
            'reported_user_id' => $user->id,
            'report_type' => 'user',
            'reason' => $request->reason,
            'details' => $request->details,
            'status' => 'pending',
        ];

        if ($request->hasFile('evidence_file')) {
            $path = $request->file('evidence_file')->store('reports/' . date('Y/m/d'), 'public');
            $data['evidence_file'] = $path;
        }

        Report::create($data);

        return redirect()->route('users.show', $user)
            ->with('status', 'Your report has been submitted. Our team will review it.');
    }

    public function reportConcern() {
        return view('pages.report.concern');
    }

    public function storeConcernReport(Request $request) {
        $request->validate([
            'report_type' => 'required|in:drugs,fraud,scam,other',
            'reason' => 'required|string|max:255',
            'details' => 'required|string|max:2000',
            'evidence_file' => 'nullable|file|max:10240',
        ]);

        $data = [
            'reporter_id' => Auth::id(),
            'report_type' => $request->report_type,
            'reason' => $request->reason,
            'details' => $request->details,
            'status' => 'pending',
        ];

        if ($request->hasFile('evidence_file')) {
            $path = $request->file('evidence_file')->store('reports/' . date('Y/m/d'), 'public');
            $data['evidence_file'] = $path;
        }

        Report::create($data);

        return back()->with('status', 'Your report has been submitted. Our team will review it.');
    }
}
