<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\AuthController as WebAuthController;
use App\Http\Controllers\Web\WebController;

/*
|--------------------------------------------------------------------------
| Web Routes — Server-rendered Blade frontend
|--------------------------------------------------------------------------
*/

Route::get('/', [WebController::class, 'home'])->name('home');

Route::get('/listings', [WebController::class, 'listings'])->name('listings.index');
Route::get('/listings/create', [WebController::class, 'listingCreate'])->name('listings.create');
Route::get('/listings/{listing}', [WebController::class, 'listingShow'])->name('listings.show');
Route::get('/categories/{slug}', [WebController::class, 'category'])->name('categories.show');

Route::get('/services', [WebController::class, 'services'])->name('services');
Route::get('/how-it-works', [WebController::class, 'howItWorks'])->name('how-it-works');
Route::get('/contact', [WebController::class, 'contact'])->name('contact');
Route::get('/dispute', [WebController::class, 'dispute'])->name('dispute');
Route::get('/faq', [WebController::class, 'faq'])->name('faq');
Route::get('/help-center', [WebController::class, 'helpCenter'])->name('help-center');
Route::get('/market-insights', [WebController::class, 'marketInsights'])->name('market-insights');
Route::get('/community', [WebController::class, 'community'])->name('community');
Route::get('/safety', [WebController::class, 'safety'])->name('safety');
Route::get('/vendors', [WebController::class, 'vendors'])->name('vendors');

/* Auth */
Route::get('/login', [WebAuthController::class, 'showLogin'])->name('login')->middleware('guest');
Route::post('/login', [WebAuthController::class, 'login'])->name('login.submit')->middleware('guest');
Route::get('/register', [WebAuthController::class, 'showRegister'])->name('register')->middleware('guest');
Route::post('/register', [WebAuthController::class, 'register'])->name('register.submit')->middleware('guest');
Route::get('/verify-email', [WebAuthController::class, 'showVerify'])->name('verify')->middleware('guest');
Route::post('/verify-email', [WebAuthController::class, 'verifyEmail'])->name('verify.submit')->middleware('guest');
Route::get('/resend-verification', [WebAuthController::class, 'showResend'])->name('resend')->middleware('guest');
Route::post('/resend-verification', [WebAuthController::class, 'resendVerification'])->name('resend.submit')->middleware('guest');
Route::get('/forgot-password', [WebAuthController::class, 'showForgot'])->name('password.request')->middleware('guest');
Route::post('/forgot-password', [WebAuthController::class, 'forgotPassword'])->name('password.email')->middleware('guest');
Route::get('/reset-password', [WebAuthController::class, 'showReset'])->name('password.reset')->middleware('guest');
Route::post('/reset-password', [WebAuthController::class, 'resetPassword'])->name('password.update')->middleware('guest');

Route::post('/logout', [WebAuthController::class, 'logout'])->name('logout');

/* Protected routes */
Route::middleware(['auth', 'active'])->group(function () {
    Route::get('/profile', [WebController::class, 'profile'])->name('profile.show');
    Route::get('/settings', [WebController::class, 'settings'])->name('settings');
    Route::post('/profile', [WebController::class, 'updateProfile'])->name('profile.update');
    Route::post('/password', [WebController::class, 'changePassword'])->name('password.change');
    Route::get('/profile-complete', [WebController::class, 'profileComplete'])->name('profile.complete');
    Route::post('/profile-complete', [WebController::class, 'completeProfile'])->name('profile.complete.submit');

    Route::post('/listings', [WebController::class, 'listingStore'])->name('listings.store');
    Route::get('/listings/{listing}/edit', [WebController::class, 'listingEdit'])->name('listings.edit');
    Route::put('/listings/{listing}', [WebController::class, 'listingUpdate'])->name('listings.update');
    Route::delete('/listings/{listing}', [WebController::class, 'listingDestroy'])->name('listings.destroy');
    Route::get('/my-ads', [WebController::class, 'myListings'])->name('listings.my');

    Route::get('/listings/{listing}/favorite', [WebController::class, 'toggleFavorite'])->name('listings.favorite');
    Route::get('/favorites', [WebController::class, 'favorites'])->name('favorites.index');

    Route::get('/conversations', [WebController::class, 'conversations'])->name('messages.index');
    Route::get('/conversations/{conversation}', [WebController::class, 'conversationShow'])->name('messages.show');
    Route::post('/conversations/{conversation}/messages', [WebController::class, 'messageStore'])->name('messages.store');

    Route::get('/bank-accounts', [WebController::class, 'bankAccounts'])->name('bank-accounts.index');
    Route::post('/bank-accounts', [WebController::class, 'bankAccountStore'])->name('bank-accounts.store');

    Route::get('/payments', [WebController::class, 'payments'])->name('payments.index');
    Route::post('/payments/initiate', [WebController::class, 'paymentInitiate'])->name('payments.initiate');

    Route::get('/promotions', [WebController::class, 'promotions'])->name('promotions.index');
    Route::post('/listings/{listing}/promote', [WebController::class, 'promote'])->name('listings.promote');

    Route::get('/kyc', [WebController::class, 'kyc'])->name('kyc.index');
    Route::post('/kyc/submit', [WebController::class, 'kycSubmit'])->name('kyc.submit');

    /* Business Profile */
    Route::get('/business/profile', [WebController::class, 'businessProfile'])->name('business.profile');
    Route::post('/business/profile', [WebController::class, 'businessProfileUpdate'])->name('business.profile.update');

    Route::get('/notifications', [WebController::class, 'notifications'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [WebController::class, 'markNotificationRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [WebController::class, 'markAllNotificationsRead'])->name('notifications.read-all');

    Route::get('/users/{user}', [WebController::class, 'userProfile'])->name('users.show');
    Route::get('/users/{user}/listings', [WebController::class, 'userListings'])->name('users.listings');

    Route::get('/users/{user}/follow', [WebController::class, 'toggleFollow'])->name('users.follow');
    Route::get('/referrals', [WebController::class, 'referrals'])->name('referrals.index');
    Route::get('/saved-searches', [WebController::class, 'savedSearches'])->name('saved-searches.index');

    Route::get('/search', [WebController::class, 'search'])->name('search');
});

Route::middleware(['auth', 'verified', 'active', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [WebController::class, 'adminDashboard'])->name('dashboard');
    Route::get('/dashboard', [WebController::class, 'adminDashboard'])->name('dashboard');

    /* Users */
    Route::get('/users', [WebController::class, 'adminUsers'])->name('users');
    Route::post('/users/{user}/status', [WebController::class, 'adminUserStatus'])->name('users.status');
    Route::post('/users/{user}/role', [WebController::class, 'adminUserRole'])->name('users.role');
    Route::delete('/users/{user}', [WebController::class, 'adminUserDestroy'])->name('users.destroy');

    /* Listings */
    Route::get('/listings', [WebController::class, 'adminListings'])->name('listings');
    Route::post('/listings/{listing}/status', [WebController::class, 'adminListingStatus'])->name('listings.status');
    Route::post('/listings/{listing}/featured', [WebController::class, 'adminListingFeatured'])->name('listings.featured');
    Route::delete('/listings/{listing}', [WebController::class, 'adminListingDestroy'])->name('listings.destroy');

    /* Categories */
    Route::get('/categories', [WebController::class, 'adminCategories'])->name('categories');
    Route::post('/categories', [WebController::class, 'adminCategoryStore'])->name('categories.store');
    Route::put('/categories/{category}', [WebController::class, 'adminCategoryUpdate'])->name('categories.update');
    Route::delete('/categories/{category}', [WebController::class, 'adminCategoryDestroy'])->name('categories.destroy');

    /* KYC Verifications */
    Route::get('/kyc', [WebController::class, 'adminVerifications'])->name('verifications');
    Route::post('/kyc/{verification}/approve', [WebController::class, 'adminKycApprove'])->name('kyc.approve');
    Route::post('/kyc/{verification}/reject', [WebController::class, 'adminKycReject'])->name('kyc.reject');

    /* Business Profiles */
    Route::get('/businesses', [WebController::class, 'adminBusinesses'])->name('businesses');
    Route::get('/businesses/{user}', [WebController::class, 'adminBusinessShow'])->name('businesses.show');
    Route::post('/businesses/{user}/verify', [WebController::class, 'adminBusinessVerify'])->name('businesses.verify');
    Route::post('/businesses/{user}/unverify', [WebController::class, 'adminBusinessUnverify'])->name('businesses.unverify');

    /* Promotions */
    Route::get('/promotions', [WebController::class, 'adminPromotions'])->name('promotions');
    Route::delete('/promotions/{promotion}', [WebController::class, 'adminPromotionDestroy'])->name('promotions.destroy');

    /* Disputes */
    Route::get('/disputes', [WebController::class, 'adminDisputes'])->name('disputes');
    Route::post('/disputes/{dispute}/resolve', [WebController::class, 'adminDisputeResolve'])->name('disputes.resolve');

    /* Reports */
    Route::get('/reports', [WebController::class, 'adminReports'])->name('reports');
    Route::post('/reports/{report}/resolve', [WebController::class, 'adminReportResolve'])->name('reports.resolve');

    /* Transactions */
    Route::get('/transactions', [WebController::class, 'adminTransactions'])->name('transactions');

    /* System Config */
    Route::get('/system-config', [WebController::class, 'adminSystemConfig'])->name('system-config');
    Route::post('/system-config', [WebController::class, 'adminSystemConfigUpdate'])->name('system-config.update');

    /* Announcements */
    Route::get('/announcements', [WebController::class, 'adminAnnouncements'])->name('announcements');
    Route::post('/announcements', [WebController::class, 'adminAnnouncementStore'])->name('announcements.store');
    Route::delete('/announcements/{announcement}', [WebController::class, 'adminAnnouncementDestroy'])->name('announcements.destroy');
});

Route::get('/auth/google', [WebAuthController::class, 'googleRedirect'])->name('auth.google');
Route::get('/auth/google/callback', [WebAuthController::class, 'googleCallback'])->name('auth.google.callback');
Route::get('/auth/apple', [WebAuthController::class, 'appleRedirect'])->name('auth.apple');
Route::get('/auth/apple/callback', [WebAuthController::class, 'appleCallback'])->name('auth.apple.callback');
