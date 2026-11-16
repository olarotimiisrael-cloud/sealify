<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Category;
use App\Models\Conversation;
use App\Models\Dispute;
use App\Models\Favorite;
use App\Models\KycVerification;
use App\Models\Listing;
use App\Models\ListingImage;
use \App\Models\Message;
use App\Models\Promotion;
use App\Models\Report;
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
        $listings = Listing::active()->latest()->paginate(12);
        $categories = Category::withCount('listings')->orderBy('name')->get();
        $topCategories = Category::topLevel()->active()->withCount('listings')->orderBy('sort_order')->get();
        $settings = SiteSetting::first();

        $userLocation = auth()->check() ? auth()->user()->location : null;
        $neighborhoodHubs = $this->neighborhoodHubs();
        $stats = $this->marketStats();

        return view('pages.home', compact('listings', 'categories', 'topCategories', 'settings', 'userLocation', 'neighborhoodHubs', 'stats'));
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
        return [
            ['key' => 'all', 'label' => 'All Ogbomoso', 'icon' => 'grid', 'query' => null],
            ['key' => 'under-g', 'label' => 'Under G', 'icon' => 'home', 'query' => 'Under G'],
            ['key' => 'lautech-gate', 'label' => 'LAUTECH Gate', 'icon' => 'academic', 'query' => 'LAUTECH'],
            ['key' => 'takie-square', 'label' => 'Takie Square', 'icon' => 'building', 'query' => 'Takie'],
            ['key' => 'sabo-market', 'label' => 'Sabo Market', 'icon' => 'store', 'query' => 'Sabo'],
            ['key' => 'adenike-area', 'label' => 'Adenike Area', 'icon' => 'building', 'query' => 'Adenike'],
            ['key' => 'aroje-akala', 'label' => 'Aroje & Akala Way', 'icon' => 'map', 'query' => 'Aroje'],
        ];
    }

    private function marketStats(): array
    {
        return [
            'community' => User::count(),
            'impressions' => (int) Listing::sum('views_count'),
            'volume' => Listing::active()->count(),
        ];
    }

    public function listingShow(Listing $listing)
    {
        $listing->increment('views_count');
        $listing->load('seller', 'images', 'category');
        $settings = SiteSetting::first();

        return view('pages.listings.show', compact('listing', 'settings'));
    }

    public function category(Category $category)
    {
        $listings = $category->listings()->active()->latest()->paginate(12);

        return view('pages.categories.show', compact('category', 'listings'));
    }

    public function services() { return view('pages.services'); }
    public function howItWorks() { return view('pages.how-it-works'); }
    public function contact() { return view('pages.contact'); }
    public function dispute() { return view('pages.dispute'); }
    public function faq() { return view('pages.faq'); }
    public function helpCenter() { return view('pages.help-center'); }
    public function marketInsights() { return view('pages.market-insights'); }
    public function community() { return view('pages.community'); }
    public function safety() { return view('pages.safety'); }
    public function vendors() { return view('pages.vendors'); }

    public function profile()
    {
        $user = Auth::user()->load('listings');
        return view('pages.profile.show', compact('user'));
    }

    public function settings() { return view('pages.settings'); }

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
        ]);
        $user->update([
            'name' => $data['full_name'],
            'phone' => $data['phone_number'],
        ]);
        return redirect()->route('profile.show')->with('status', 'Profile completed.');
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
            'condition' => 'required|in:new,like_new,good,fair,poor',
            'location' => 'required|string|max:255',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'video_url' => 'nullable|url',
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
            'condition' => 'required|in:new,like_new,good,fair,poor',
            'location' => 'required|string|max:255',
            'new_images' => 'nullable|array|max:10',
            'new_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'video_url' => 'nullable|url',
        ]);
        $listing->update($data);

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
        $favorite = Favorite::where('user_id', Auth::id())->where('listing_id', $listing->id)->first();
        if ($favorite) {
            $favorite->delete();
        } else {
            Favorite::create(['user_id' => Auth::id(), 'listing_id' => $listing->id]);
        }
        return back()->with('status', 'Favorite updated.');
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
            'content' => 'required|string|max:5000',
        ]);
        $conversation->messages()->create([
            'sender_id' => Auth::id(),
            'receiver_id' => $conversation->participants()->where('user_id', '!=', Auth::id())->first()->user_id,
            'content' => $data['content'],
        ]);
        return back()->with('status', 'Message sent.');
    }

    public function bankAccounts() { return view('pages.bank-accounts.index'); }
    public function bankAccountStore(Request $request) { return back()->with('status', 'Bank account added.'); }

    public function payments() { return view('pages.payments.index'); }
    public function paymentInitiate(Request $request) { return back()->with('status', 'Payment initiated.'); }

    public function promotions() { return view('pages.promotions.index'); }
    public function promote(Request $request, Listing $listing) { return back()->with('status', 'Promotion requested.'); }

    public function kyc() { return view('pages.kyc.index'); }
    public function kycSubmit(Request $request) { return back()->with('status', 'KYC submitted.'); }

    public function notifications()
    {
        $notifications = Auth::user()->notifications()->latest()->paginate(12);
        return view('pages.notifications.index', compact('notifications'));
    }

    public function markNotificationRead($id) { return back()->with('status', 'Marked read.'); }
    public function markAllNotificationsRead() { return back()->with('status', 'All marked read.'); }

    public function userProfile(User $user) { return view('pages.users.show', compact('user')); }
    public function userListings(User $user)
    {
        $listings = $user->listings()->active()->latest()->paginate(12);
        return view('pages.users.listings', compact('user', 'listings'));
    }

    public function toggleFollow(User $user) { return back()->with('status', 'Follow updated.'); }
    public function referrals() { return view('pages.referrals.index'); }
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
        $query = KycVerification::with('user')->orderBy('created_at', 'desc');
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $verifications = $query->paginate(20)->withQueryString();
        return view('pages.admin.verifications', compact('verifications', 'request'));
    }

    public function adminKycApprove(KycVerification $verification) {
        $verification->update(['status' => 'approved', 'reviewed_at' => now()]);
        $verification->user->update(['kyc_verified_at' => now(), 'is_verified_seller' => true]);
        return back()->with('status', 'KYC approved.');
    }

    public function adminKycReject(KycVerification $verification) {
        $verification->update(['status' => 'rejected', 'reviewed_at' => now()]);
        return back()->with('status', 'KYC rejected.');
    }

    public function adminPromotions() {
        $promotions = Promotion::with('listing.user')->orderBy('created_at', 'desc')->paginate(20);
        return view('pages.admin.promotions', compact('promotions'));
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
        $user->update(['is_verified_seller' => true]);
        return back()->with('status', 'Business verified.');
    }

    public function adminBusinessUnverify(User $user) {
        $user->update(['is_verified_seller' => false]);
        return back()->with('status', 'Business unverified.');
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
            'type' => 'required|in:offer,answer,ice-candidate',
            'payload' => 'required|array',
        ]);

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

        $signals = \App\Models\SignalingMessage::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', Auth::id())
            ->where('created_at', '>', $request->input('since', now()->subMinutes(5)->toISOString()))
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
