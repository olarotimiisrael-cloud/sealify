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
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
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

        return view('pages.home', compact('listings', 'categories'));
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

        $listings = $query->latest()->paginate(12)->withQueryString();
        $categories = Category::orderBy('name')->get();

        return view('pages.listings.index', compact('listings', 'categories'));
    }

    public function listingShow(Listing $listing)
    {
        $listing->increment('views_count');
        $listing->load('seller', 'images', 'category');

        return view('pages.listings.show', compact('listing'));
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
}
