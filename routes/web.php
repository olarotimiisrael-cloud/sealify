<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\AuthController as WebAuthController;
use App\Http\Controllers\Web\WebController;

/*
|--------------------------------------------------------------------------
| Web Routes — Server-rendered Blade frontend
|--------------------------------------------------------------------------
*/

Route::post('/feedback', [WebController::class, 'storeFeedback'])->name('feedback.store');

Route::get('/listings', [WebController::class, 'listings'])->name('listings.index');
Route::get('/listings/create', [WebController::class, 'listingCreate'])->name('listings.create');
Route::get('/listings/{listing}', [WebController::class, 'listingShow'])->name('listings.show');
Route::post('/listings/{listing}/review', [WebController::class, 'storeReview'])->name('listings.review')->middleware('auth');
Route::post('/listings/{listing}/comment', [WebController::class, 'storeComment'])->name('listings.comment')->middleware('auth');
Route::delete('/comments/{comment}', [WebController::class, 'deleteComment'])->name('comments.destroy')->middleware('auth');
Route::get('/categories/{slug}', [WebController::class, 'category'])->name('categories.show');
Route::get('/categories', [WebController::class, 'categories'])->name('categories.index');

Route::get('/services', [WebController::class, 'services'])->name('services');
Route::get('/how-it-works', [WebController::class, 'howItWorks'])->name('how-it-works');
Route::get('/contact', [WebController::class, 'contact'])->name('contact');
Route::get('/faq', [WebController::class, 'faq'])->name('faq');
Route::get('/help-center', [WebController::class, 'helpCenter'])->name('help-center');
Route::get('/terms', [WebController::class, 'terms'])->name('terms');
Route::get('/privacy', [WebController::class, 'privacy'])->name('privacy');
Route::get('/refund-policy', [WebController::class, 'refundPolicy'])->name('refund-policy');
Route::get('/market-insights', [WebController::class, 'marketInsights'])->name('market-insights');
Route::get('/community', [WebController::class, 'community'])->name('community');
Route::get('/safety', [WebController::class, 'safety'])->name('safety');
Route::get('/vendors', [WebController::class, 'vendors'])->name('vendors');

/* Auth */
Route::get('/login', [WebAuthController::class, 'showLogin'])->name('login')->middleware('guest');
Route::post('/login', [WebAuthController::class, 'login'])->name('login.submit')->middleware('guest');
Route::get('/register', [WebAuthController::class, 'showRegister'])->name('register')->middleware('guest');
Route::post('/register', [WebAuthController::class, 'register'])->name('register.submit')->middleware('guest');
Route::get('/ref/{referral_code}', [WebAuthController::class, 'showRegister'])->name('register.referral')->middleware('guest');
Route::get('/verify-email', [WebAuthController::class, 'showVerify'])->name('verify')->middleware('guest');
Route::post('/verify-email', [WebAuthController::class, 'verifyEmail'])->name('verify.submit')->middleware('guest');
Route::get('/resend-verification', [WebAuthController::class, 'showResend'])->name('resend')->middleware('guest');
Route::post('/resend-verification', [WebAuthController::class, 'resendVerification'])->name('resend.submit')->middleware('guest');
Route::get('/forgot-password', [WebAuthController::class, 'showForgot'])->name('password.request')->middleware('guest');
Route::post('/forgot-password', [WebAuthController::class, 'forgotPassword'])->name('password.email')->middleware('guest');
Route::get('/reset-password', [WebAuthController::class, 'showReset'])->name('password.reset')->middleware('guest');
Route::post('/reset-password', [WebAuthController::class, 'resetPassword'])->name('password.update')->middleware('guest');

Route::post('/logout', [WebAuthController::class, 'logout'])->name('logout');

/* Banned User Page */
Route::get('/banned', [WebController::class, 'bannedPage'])->name('banned');

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

    Route::post('/listings/{listing}/favorite', [WebController::class, 'toggleFavorite'])->name('listings.favorite');
    Route::get('/favorites', [WebController::class, 'favorites'])->name('favorites.index');

    Route::get('/conversations', [WebController::class, 'conversations'])->name('messages.index');
    Route::get('/conversations/{conversation}', [WebController::class, 'conversationShow'])->name('messages.show');
    Route::post('/conversations/{conversation}/messages', [WebController::class, 'messageStore'])->name('messages.store');
    Route::post('/conversations/{conversation}/messages/attachments', [WebController::class, 'messageAttachmentStore'])->name('messages.attachments.store');
    Route::get('/messages/attachments/{attachment}', [WebController::class, 'messageAttachmentShow'])->name('messages.attachments.show');
    Route::post('/conversations/{conversation}/video-call', [WebController::class, 'videoCallInitiate'])->name('messages.video-call');
    Route::post('/conversations/{conversation}/signaling', [WebController::class, 'signalingStore'])->name('messages.signaling.store');
    Route::get('/conversations/{conversation}/signaling', [WebController::class, 'signalingPoll'])->name('messages.signaling.poll');

    Route::get('/bank-accounts', [WebController::class, 'bankAccounts'])->name('bank-accounts.index');
    Route::post('/bank-accounts', [WebController::class, 'bankAccountStore'])->name('bank-accounts.store');

    Route::get('/payments', [WebController::class, 'payments'])->name('payments.index');
    Route::post('/payments/initiate', [WebController::class, 'paymentInitiate'])->name('payments.initiate');

    Route::get('/promotions', [WebController::class, 'promotions'])->name('promotions.index');
    Route::post('/listings/{listing}/promote', [WebController::class, 'promote'])->name('listings.promote');
    Route::post('/listings/{listing}/payment', [WebController::class, 'paymentInitiatePromotion'])->name('listings.promotion.payment');
    Route::get('/payments/receipts/mine', [WebController::class, 'myPaymentReceipts'])->name('payments.receipts.mine');
    Route::post('/payments/receipts/upload', [WebController::class, 'uploadPaymentReceipt'])->name('payments.receipts.upload');

    Route::get('/kyc', [WebController::class, 'kyc'])->name('kyc.index');
    Route::post('/kyc/submit', [WebController::class, 'kycSubmit'])->name('kyc.submit');

    /* Business Profile */
    Route::get('/business/profile', [WebController::class, 'businessProfile'])->name('business.profile');
    Route::post('/business/profile', [WebController::class, 'businessProfileUpdate'])->name('business.profile.update');

    /* Biometric / Face ID Lock */
    Route::post('/settings/biometric/toggle', [WebController::class, 'toggleBiometric'])->name('settings.biometric.toggle');
    Route::post('/settings/face-id/toggle', [WebController::class, 'toggleFaceId'])->name('settings.face-id.toggle');
    Route::post('/settings/biometric/register', [WebController::class, 'registerBiometric'])->name('settings.biometric.register');
    Route::post('/settings/face-id/register', [WebController::class, 'registerFaceId'])->name('settings.face-id.register');

    /* Verified Badge Application */
    Route::post('/verified-badge/apply', [WebController::class, 'applyForVerifiedBadge'])->name('verified-badge.apply');

    /* Trade Disputes */
    Route::get('/dispute', [WebController::class, 'dispute'])->name('dispute');
    Route::post('/dispute', [WebController::class, 'disputeStore'])->name('dispute.store');

    /* User Dashboard */
    Route::get('/dashboard', [WebController::class, 'userDashboard'])->name('dashboard');

    Route::get('/notifications', [WebController::class, 'notifications'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [WebController::class, 'markNotificationRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [WebController::class, 'markAllNotificationsRead'])->name('notifications.read-all');

    /* Phone/SMS OTP Verification (no third-party) */
    Route::post('/phone/otp/request', [WebController::class, 'requestSmsOtp'])->name('phone.otp.request');
    Route::post('/phone/otp/verify', [WebController::class, 'verifySmsOtp'])->name('phone.otp.verify');

    Route::get('/users/{user}', [WebController::class, 'userProfile'])->name('users.show');
    Route::get('/users/{user}/listings', [WebController::class, 'userListings'])->name('users.listings');

    Route::get('/users/{user}/follow', [WebController::class, 'toggleFollow'])->name('users.follow');
    Route::get('/referrals', [WebController::class, 'referrals'])->name('referrals.index');
    Route::get('/saved-searches', [WebController::class, 'savedSearches'])->name('saved-searches.index');

    Route::get('/search', [WebController::class, 'search'])->name('search');

    /* Report System */
    Route::get('/report/listing/{listing}', [WebController::class, 'reportListing'])->name('reports.listing');
    Route::post('/report/listing/{listing}', [WebController::class, 'storeListingReport'])->name('reports.storeListing');
    Route::get('/report/user/{user}', [WebController::class, 'reportUser'])->name('reports.user');
    Route::post('/report/user/{user}', [WebController::class, 'storeUserReport'])->name('reports.storeUser');
    Route::get('/report/concern', [WebController::class, 'reportConcern'])->name('reports.concern');
    Route::post('/report/concern', [WebController::class, 'storeConcernReport'])->name('reports.storeConcern');
});

Route::middleware(['auth', 'verified', 'active', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [WebController::class, 'adminDashboard'])->name('dashboard');
    Route::get('/dashboard', [WebController::class, 'adminDashboard']);

    /* Users */
    Route::get('/users', [WebController::class, 'adminUsers'])->name('users');
    Route::get('/users/{user}/edit', [WebController::class, 'adminUserEdit'])->name('users.edit');
    Route::put('/users/{user}', [WebController::class, 'adminUserUpdate'])->name('users.update');
    Route::post('/users/{user}/status', [WebController::class, 'adminUserStatus'])->name('users.status');
    Route::post('/users/{user}/role', [WebController::class, 'adminUserRole'])->name('users.role');
    Route::post('/users/{user}/badge', [WebController::class, 'adminUserBadge'])->name('users.badge');
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
    Route::get('/kyc/{verification}/document', [WebController::class, 'adminKycDocument'])->name('kyc.document');
    Route::post('/kyc/{verification}/approve', [WebController::class, 'adminKycApprove'])->name('kyc.approve');
    Route::post('/kyc/{verification}/reject', [WebController::class, 'adminKycReject'])->name('kyc.reject');

    /* Business Profiles */
    Route::get('/businesses', [WebController::class, 'adminBusinesses'])->name('businesses');
    Route::get('/businesses/{user}', [WebController::class, 'adminBusinessShow'])->name('businesses.show');
    Route::post('/businesses/{user}/verify', [WebController::class, 'adminBusinessVerify'])->name('businesses.verify');
    Route::post('/businesses/{user}/unverify', [WebController::class, 'adminBusinessUnverify'])->name('businesses.unverify');

    /* Verified Badge Applications */
    Route::get('/verified-badge-applications', [WebController::class, 'adminVerifyBadgeApplications'])->name('badge-applications');
    Route::post('/verified-badge-applications/{user}/approve', [WebController::class, 'adminApproveBadge'])->name('badge.approve');
    Route::post('/verified-badge-applications/{user}/reject', [WebController::class, 'adminRejectBadge'])->name('badge.reject');

/* Neighborhood Hubs (Admin) */
Route::get('/neighborhood-hubs', [WebController::class, 'adminNeighborhoodHubs'])->name('admin.neighborhood-hubs');
Route::post('/neighborhood-hubs', [WebController::class, 'adminNeighborhoodHubStore'])->name('admin.neighborhood-hubs.store');
Route::put('/neighborhood-hubs/{hub}', [WebController::class, 'adminNeighborhoodHubUpdate'])->name('admin.neighborhood-hubs.update');
Route::delete('/neighborhood-hubs/{hub}', [WebController::class, 'adminNeighborhoodHubDestroy'])->name('admin.neighborhood-hubs.destroy');

/* Feedback */
Route::get('/feedback', [WebController::class, 'adminFeedback'])->name('feedback');
Route::post('/feedback/{feedback}/resolve', [WebController::class, 'adminFeedbackResolve'])->name('feedback.resolve');
Route::post('/promotions/{promotion}/stop', [WebController::class, 'adminPromotionStop'])->name('promotions.stop');
Route::post('/promotions/{promotion}/email', [WebController::class, 'adminPromotionEmail'])->name('promotions.email');
Route::delete('/promotions/{promotion}', [WebController::class, 'adminPromotionDestroy'])->name('promotions.destroy');

    /* Payment Receipts (Admin) - review user-uploaded payment proofs */
    Route::get('/payments/receipts', [WebController::class, 'adminPaymentReceipts'])->name('payments.receipts');
    Route::post('/payments/receipts/{receipt}/approve', [WebController::class, 'adminReceiptApprove'])->name('payments.receipts.approve');
    Route::post('/payments/receipts/{receipt}/reject', [WebController::class, 'adminReceiptReject'])->name('payments.receipts.reject');

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

    /* SEO, AdSense & Analytics */
    Route::get('/seo', [WebController::class, 'adminSeo'])->name('seo');
    Route::post('/seo', [WebController::class, 'adminSeoUpdate'])->name('seo.update');

    /* Announcements */
    Route::get('/announcements', [WebController::class, 'adminAnnouncements'])->name('announcements');
    Route::post('/announcements', [WebController::class, 'adminAnnouncementStore'])->name('announcements.store');
    Route::delete('/announcements/{announcement}', [WebController::class, 'adminAnnouncementDestroy'])->name('announcements.destroy');

    /* Community News Board */
    Route::get('/community', [WebController::class, 'adminCommunity'])->name('community');
    Route::post('/community', [WebController::class, 'adminCommunityStore'])->name('community.store');
    Route::put('/community/{post}', [WebController::class, 'adminCommunityUpdate'])->name('community.update');
    Route::delete('/community/{post}', [WebController::class, 'adminCommunityDestroy'])->name('community.destroy');

    /* Email Broadcaster */
    Route::get('/email-broadcaster', [WebController::class, 'adminEmailBroadcaster'])->name('email.broadcaster');
    Route::post('/email-broadcaster/send', [WebController::class, 'adminEmailSend'])->name('email.broadcaster.send');
    Route::post('/email-broadcaster/send-individual', [WebController::class, 'adminEmailSendIndividual'])->name('email.broadcaster.send-individual');
    Route::post('/email-broadcaster/upload-image', [WebController::class, 'adminEmailUploadImage'])->name('email.broadcaster.upload-image');

    /* SMS OTP Management (Admin) - No third-party */
    Route::get('/sms-otp', [WebController::class, 'adminSmsOtp'])->name('admin.sms-otp');
    Route::post('/sms-otp/{otp}/verify-admin', [WebController::class, 'adminVerifySmsOtp'])->name('admin.sms-otp.verify');
    Route::delete('/sms-otp/{otp}', [WebController::class, 'adminDeleteSmsOtp'])->name('admin.sms-otp.delete');

    /* User Ban Management (Admin) */
    Route::post('/users/{user}/ban', [WebController::class, 'adminBanUser'])->name('users.ban');
    Route::post('/users/{user}/unban', [WebController::class, 'adminUnbanUser'])->name('users.unban');
});

Route::get('/auth/google', [WebAuthController::class, 'googleRedirect'])->name('auth.google');
Route::get('/auth/google/callback', [WebAuthController::class, 'googleCallback'])->name('auth.google.callback');
Route::get('/auth/apple', [WebAuthController::class, 'appleRedirect'])->name('auth.apple');
Route::get('/auth/apple/callback', [WebAuthController::class, 'appleCallback'])->name('auth.apple.callback');
