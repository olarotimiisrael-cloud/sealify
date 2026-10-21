<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminMessagingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\DevWalletController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\KycController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\ListingImageController;
use App\Http\Controllers\Api\MarketInsightsController;
use App\Http\Controllers\Api\MarketplaceDataController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OtpController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\ReactionController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VoiceNoteController;
use App\Http\Controllers\Api\WithdrawalController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes — NO auth middleware
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('verify-email', [AuthController::class, 'verifyEmail'])->middleware('throttle:auth');
    Route::post('resend-verification', [AuthController::class, 'resendVerification'])->middleware('throttle:auth');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth');
    Route::post('password/reset-request', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:auth');
});

Route::get('referrals/validate', [ReferralController::class, 'validate']);

Route::post('otp/request', [OtpController::class, 'request']);
Route::post('otp/verify', [OtpController::class, 'verify']);
Route::post('otp/resend', [OtpController::class, 'resend']);

Route::get('users/{user}', [UserController::class, 'show']);
Route::get('users/{user}/listings', [UserController::class, 'listings']);

// Social graph — public read
Route::get('users/{user}/following', [FollowController::class, 'following']);
Route::get('users/{user}/followers', [FollowController::class, 'followers']);

// Post interactions — public read (polymorphic: works on listings and live-video sessions)
Route::get('comments', [CommentController::class, 'index']);
Route::get('reactions', [ReactionController::class, 'index']);

Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{slug}', [CategoryController::class, 'show']);

Route::get('listings', [ListingController::class, 'index']);
Route::get('listings/{listing:slug}', [ListingController::class, 'show']);

Route::get('search', [SearchController::class, 'search'])->middleware('throttle:api');
Route::get('search/trending', [SearchController::class, 'trending'])->middleware('throttle:api');
Route::get('search/suggestions', [SearchController::class, 'suggestions'])->middleware('throttle:api');

Route::get('market-insights/stats', [MarketInsightsController::class, 'stats']);
Route::get('market-insights/price-index', [MarketInsightsController::class, 'priceIndex']);

Route::get('data/{resource}', [MarketplaceDataController::class, 'index'])->middleware('throttle:api');
Route::get('data/{resource}/{id}', [MarketplaceDataController::class, 'show'])->middleware('throttle:api');

// Payment callback and webhook — public (Paystack calls these directly)
Route::get('payments/callback', [PaymentController::class, 'callback']);
Route::post('payments/webhook', [PaymentController::class, 'webhook']);

/*
|--------------------------------------------------------------------------
| Authenticated (no email verification) + active account
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
});

/*
|--------------------------------------------------------------------------
| Authenticated + email-verified + active account
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'verified', 'active'])->group(function () {
    // Profile
    Route::put('auth/profile', [ProfileController::class, 'update']);
    Route::put('auth/password', [ProfileController::class, 'changePassword']);
    Route::post('auth/avatar', [ProfileController::class, 'uploadAvatar']);

    // Listings
    Route::get('auth/me/listings', [ListingController::class, 'myListings']);
    Route::post('listings', [ListingController::class, 'store']);
    Route::put('listings/{listing}', [ListingController::class, 'update']);
    Route::delete('listings/{listing}', [ListingController::class, 'destroy']);

    // Listing images
    Route::post('listings/{listing}/images', [ListingImageController::class, 'store']);
    Route::delete('listings/{listing}/images/{imageId}', [ListingImageController::class, 'destroy']);

    // Favorites
    Route::get('auth/me/favorites', [FavoriteController::class, 'index']);
    Route::post('listings/{listing}/favorite', [FavoriteController::class, 'store']);
    Route::delete('listings/{listing}/favorite', [FavoriteController::class, 'destroy']);

    // Conversations
    Route::get('conversations', [ConversationController::class, 'index']);
    Route::post('conversations', [ConversationController::class, 'store']);
    Route::get('conversations/{conversation}', [ConversationController::class, 'show']);
    Route::post('conversations/{conversation}/read', [ConversationController::class, 'markRead']);

    // Messages
    Route::get('conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('conversations/{conversation}/messages', [MessageController::class, 'store']);

    // Bank accounts
    Route::get('banks', [BankAccountController::class, 'banks']);
    Route::get('auth/bank-accounts', [BankAccountController::class, 'index']);
    Route::post('auth/bank-accounts', [BankAccountController::class, 'store']);
    Route::put('auth/bank-accounts/{bankAccount}', [BankAccountController::class, 'update']);
    Route::delete('auth/bank-accounts/{bankAccount}', [BankAccountController::class, 'destroy']);

    // Payments
    Route::post('payments/initiate', [PaymentController::class, 'initiate']);
    Route::get('payments', [PaymentController::class, 'index']);
    Route::get('payments/verify/{reference}', [PaymentController::class, 'verify']);

    // Promotions
    Route::get('auth/me/promotions/eligibility', [PromotionController::class, 'eligibility']);
    Route::get('auth/me/promotions', [PromotionController::class, 'index']);
    Route::post('listings/{listing}/promote', [PromotionController::class, 'promote']);
    Route::delete('promotions/{promotion}', [PromotionController::class, 'cancel']);

    // KYC
    Route::get('auth/kyc/status', [KycController::class, 'status']);
    Route::post('auth/kyc/submit', [KycController::class, 'submit']);
    Route::get('auth/kyc/history', [KycController::class, 'history']);

    // Withdrawals
    Route::get('auth/withdrawals', [WithdrawalController::class, 'index']);
    Route::post('auth/withdrawals', [WithdrawalController::class, 'store']);
    Route::get('auth/withdrawals/{withdrawal}', [WithdrawalController::class, 'show']);

    // Referrals
    Route::get('referrals/me', [ReferralController::class, 'me']);

    // Dev-only wallet credit (guarded by environment check in controller — 404 in production)
    Route::post('dev/wallet/credit', [DevWalletController::class, 'credit']);

    // Frontend data adapter. The controller has a strict resource allow-list and applies owner scopes.
    Route::post('data/{resource}', [MarketplaceDataController::class, 'store']);
    Route::match(['put', 'patch'], 'data/{resource}/{id}', [MarketplaceDataController::class, 'update']);
    Route::delete('data/{resource}/{id}', [MarketplaceDataController::class, 'destroy']);

    // Notifications and uploads are explicit endpoints for browser clients.
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('uploads', [UploadController::class, 'store']);

    // Social graph — authenticated mutations
    Route::get('users/{user}/follow/check', [FollowController::class, 'check']);
    Route::post('users/{user}/follow', [FollowController::class, 'store']);
    Route::delete('users/{user}/follow', [FollowController::class, 'destroy']);

    // Post interactions — authenticated mutations (polymorphic)
    Route::post('reactions', [ReactionController::class, 'store']);
    Route::post('comments', [CommentController::class, 'store']);
    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);

    // Voice notes in chat
    Route::post('conversations/{conversation}/voice-notes', [VoiceNoteController::class, 'store']);

    // Email / SMS / WhatsApp (stubbed — not configured)
    Route::post('email/send', [EmailController::class, 'send']);
    Route::post('email/admin/send', [EmailController::class, 'adminSend']);
    Route::post('email/password-reset', [EmailController::class, 'passwordReset']);
    Route::post('email/admin/sms', [EmailController::class, 'sms']);
    Route::post('email/admin/whatsapp', [EmailController::class, 'whatsapp']);
    Route::post('email/admin/upload-attachment', [EmailController::class, 'uploadAttachment']);

    // Admin messaging (stubbed — not configured)
    Route::post('admin-messaging/send', [AdminMessagingController::class, 'send']);
    Route::post('admin-messaging/broadcast', [AdminMessagingController::class, 'broadcast']);
    Route::get('admin-messaging/messages', [AdminMessagingController::class, 'messages']);
    Route::get('admin-messaging/broadcasts', [AdminMessagingController::class, 'broadcasts']);
    Route::get('admin-messaging/config', [AdminMessagingController::class, 'config']);
});

Route::middleware(['auth:sanctum', 'verified', 'active', 'admin'])->prefix('admin')->group(function () {
    Route::get('stats', [AdminController::class, 'stats']);
    Route::get('users', [AdminController::class, 'users']);
    Route::match(['put', 'patch'], 'users/{user}', [AdminController::class, 'updateUser']);
    Route::delete('users/{user}', [AdminController::class, 'destroyUser']);
    Route::get('listings', [AdminController::class, 'listings']);
    Route::get('reports', [AdminController::class, 'reports']);
    Route::get('disputes', [AdminController::class, 'disputes']);
    Route::get('verifications', [AdminController::class, 'verifications']);
    Route::get('promotions', [AdminController::class, 'promotions']);
    Route::get('audit-logs', [AdminController::class, 'auditLogs']);
    Route::get('intrusion-logs', [AdminController::class, 'intrusionLogs']);
    Route::match(['put', 'patch'], 'reports/{report}', [AdminController::class, 'updateReport']);
    Route::match(['put', 'patch'], 'disputes/{dispute}', [AdminController::class, 'updateDispute']);
    Route::match(['put', 'patch'], 'verifications/{verification}', [AdminController::class, 'updateVerification']);
    Route::match(['put', 'patch'], 'promotions/{promotion}', [AdminController::class, 'updatePromotion']);
    Route::get('system-config', [AdminController::class, 'systemConfig']);
    Route::put('system-config', [AdminController::class, 'updateSystemConfig']);
    Route::post('broadcast', [AdminController::class, 'broadcast']);

    // Admin categories
    Route::get('categories', [CategoryController::class, 'index']);
    Route::post('categories', [CategoryController::class, 'store']);
    Route::match(['put', 'patch'], 'categories/{category}', [CategoryController::class, 'update']);
    Route::delete('categories/{category}', [CategoryController::class, 'destroy']);

    // Admin referrals
    Route::get('referrals/stats', [ReferralController::class, 'adminStats']);
    Route::get('referrals/{user}', [ReferralController::class, 'adminReferral']);
    Route::post('referrals/{user}/grant', [ReferralController::class, 'grant']);
    Route::post('referrals/{user}/reset', [ReferralController::class, 'reset']);

    // Admin signup alerts
    Route::get('signup-alerts', [AdminController::class, 'signupAlerts']);
    Route::patch('signup-alerts/{id}', [AdminController::class, 'updateSignupAlert']);

    // Admin login sessions
    Route::get('login-sessions', [AdminController::class, 'loginSessions']);
    Route::patch('login-sessions/{id}', [AdminController::class, 'updateLoginSession']);
});
