<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminMessagingController;
use App\Http\Controllers\Api\AdsenseController;
use App\Http\Controllers\Api\AiGenerationController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AttachmentsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BuyerRequestsAdminController;
use App\Http\Controllers\Api\BuyerRequestsController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CopilotController;
use App\Http\Controllers\Api\DataController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MarketInsightsController;
use App\Http\Controllers\Api\McpController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OtpController;
use App\Http\Controllers\Api\PushController;
use App\Http\Controllers\Api\ReferralsController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SavedSearchesController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SiteMetadataController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/{id}', [ListingController::class, 'show']);

Route::get('/search', [SearchController::class, 'search']);
Route::get('/site-metadata', [SiteMetadataController::class, 'show']);
Route::post('/copilot', [CopilotController::class, 'ask']);
Route::match(['GET', 'POST'], '/mcp', [McpController::class, 'handle']);
Route::get('/mcp/search', [McpController::class, 'handle'])->defaults('tool', 'sealify_web_search');
Route::post('/mcp/query', [McpController::class, 'handle'])->defaults('tool', 'sealify_copilot_query');
Route::get('/mcp/info', [McpController::class, 'handle'])->defaults('tool', 'sealify_marketplace_info');

Route::get('/health', [HealthController::class, 'check']);

Route::get('/data/{resource}', [DataController::class, 'index']);
Route::get('/data/{resource}/{id}', [DataController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/data/{resource}', [DataController::class, 'store']);
    Route::put('/data/{resource}/{id}', [DataController::class, 'update']);
    Route::patch('/data/{resource}/{id}', [DataController::class, 'update']);
    Route::delete('/data/{resource}/{id}', [DataController::class, 'destroy']);

    Route::post('/uploads', [UploadController::class, 'store']);

    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // OTP
    Route::post('/otp/request', [OtpController::class, 'request']);
    Route::post('/otp/verify', [OtpController::class, 'verify']);
    Route::post('/otp/resend', [OtpController::class, 'resend']);

    // Listings
    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{id}', [ListingController::class, 'update']);
    Route::delete('/listings/{id}', [ListingController::class, 'destroy']);

    // Messages
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/conversations/{id}/messages', [MessageController::class, 'messages']);
    Route::post('/conversations/{id}/messages', [MessageController::class, 'store']);

    // Reviews
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // Users
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);

    // Referrals
    Route::get('/referrals', [ReferralsController::class, 'index']);
    Route::get('/referrals/my-code', [ReferralsController::class, 'myCode']);
    Route::post('/referrals/claim', [ReferralsController::class, 'claim']);
    Route::get('/referrals/rewards', [ReferralsController::class, 'rewards']);
    Route::post('/referrals/track/{code}', [ReferralsController::class, 'trackClick']);

    // Saved Searches
    Route::get('/saved-searches', [SavedSearchesController::class, 'index']);
    Route::post('/saved-searches', [SavedSearchesController::class, 'store']);
    Route::get('/saved-searches/{id}', [SavedSearchesController::class, 'show']);
    Route::put('/saved-searches/{id}', [SavedSearchesController::class, 'update']);
    Route::delete('/saved-searches/{id}', [SavedSearchesController::class, 'destroy']);
    Route::post('/saved-searches/{id}/trigger', [SavedSearchesController::class, 'trigger']);

    // Attachments
    Route::post('/attachments', [AttachmentsController::class, 'store']);
    Route::get('/attachments/{id}', [AttachmentsController::class, 'show']);
    Route::get('/attachments/{id}/download', [AttachmentsController::class, 'download']);
    Route::delete('/attachments/{id}', [AttachmentsController::class, 'destroy']);

    // Push Notifications
    Route::post('/push/subscribe', [PushController::class, 'subscribe']);
    Route::post('/push/unsubscribe', [PushController::class, 'unsubscribe']);
    Route::get('/push/subscriptions', [PushController::class, 'subscriptions']);
    Route::post('/push/send', [PushController::class, 'send']);

    // AI Generation
    Route::post('/ai/generate', [AiGenerationController::class, 'generate']);
    Route::get('/ai/generation/{id}', [AiGenerationController::class, 'status']);
    Route::get('/ai/generations', [AiGenerationController::class, 'history']);
    Route::delete('/ai/generation/{id}', [AiGenerationController::class, 'delete']);

    // Market Insights
    Route::get('/market-insights', [MarketInsightsController::class, 'index']);
    Route::get('/market-insights/{id}', [MarketInsightsController::class, 'show']);
    Route::get('/market-insights/stats', [MarketInsightsController::class, 'stats']);

    // Analytics
    Route::post('/analytics/track', [AnalyticsController::class, 'track']);
    Route::post('/analytics/batch', [AnalyticsController::class, 'batch']);
    Route::get('/analytics/summary', [AnalyticsController::class, 'summary']);

    // Adsense
    Route::get('/adsense', [AdsenseController::class, 'config']);
    Route::post('/adsense', [AdsenseController::class, 'store']);
    Route::put('/adsense/{id}', [AdsenseController::class, 'update']);
    Route::delete('/adsense/{id}', [AdsenseController::class, 'destroy']);

    // Buyer Requests
    Route::get('/buyer-requests', [BuyerRequestsController::class, 'index']);
    Route::post('/buyer-requests', [BuyerRequestsController::class, 'store']);
    Route::get('/buyer-requests/{id}', [BuyerRequestsController::class, 'show']);
    Route::put('/buyer-requests/{id}', [BuyerRequestsController::class, 'update']);
    Route::delete('/buyer-requests/{id}', [BuyerRequestsController::class, 'destroy']);
    Route::post('/buyer-requests/{id}/respond', [BuyerRequestsController::class, 'respond']);
    Route::get('/buyer-requests/{id}/responses', [BuyerRequestsController::class, 'responses']);

    // Email
    Route::post('/email/send', [EmailController::class, 'send']);
    Route::post('/email/bulk', [EmailController::class, 'bulk']);
    Route::post('/email/queue', [EmailController::class, 'queue']);

    // Admin
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
    Route::post('/admin/users/bulk', [AdminController::class, 'bulkUsers']);

    Route::put('/admin/verifications/{id}', [AdminController::class, 'updateVerification']);
    Route::put('/admin/promotions/{id}', [AdminController::class, 'updatePromotion']);
    Route::put('/admin/reports/{id}', [AdminController::class, 'updateReport']);
    Route::put('/admin/disputes/{id}', [AdminController::class, 'updateDispute']);

    Route::get('/admin/signup-alerts', [AdminController::class, 'signupAlerts']);
    Route::put('/admin/signup-alerts/{id}', [AdminController::class, 'updateSignupAlert']);
    Route::delete('/admin/signup-alerts/{id}', [AdminController::class, 'deleteSignupAlert']);

    Route::get('/admin/login-sessions', [AdminController::class, 'loginSessions']);
    Route::delete('/admin/login-sessions/{id}', [AdminController::class, 'deleteLoginSession']);

    Route::get('/admin/system-config', [AdminController::class, 'systemConfig']);
    Route::put('/admin/system-config', [AdminController::class, 'updateSystemConfig']);

    Route::post('/admin/broadcast', [AdminController::class, 'broadcast']);
    Route::post('/admin/email-digest', [AdminController::class, 'emailDigest']);

    Route::post('/email/admin/send', [AdminController::class, 'sendAdminEmail']);
    Route::post('/email/password-reset', [AdminController::class, 'passwordResetEmail']);
    Route::post('/email/admin/sms', [AdminController::class, 'smsBroadcast']);
    Route::post('/email/admin/whatsapp', [AdminController::class, 'whatsappBroadcast']);
    Route::post('/email/admin/upload-attachment', [AdminController::class, 'uploadAttachment']);

    // Admin Messaging
    Route::get('/admin/messages', [AdminMessagingController::class, 'index']);
    Route::post('/admin/messages', [AdminMessagingController::class, 'store']);
    Route::post('/admin/messages/broadcast', [AdminMessagingController::class, 'broadcast']);
    Route::post('/admin/messages/{id}/read', [AdminMessagingController::class, 'markRead']);
    Route::post('/admin/messages/read-all', [AdminMessagingController::class, 'markAllRead']);

    // Admin Buyer Requests
    Route::get('/admin/buyer-requests', [BuyerRequestsAdminController::class, 'index']);
    Route::put('/admin/buyer-requests/{id}', [BuyerRequestsAdminController::class, 'update']);
    Route::delete('/admin/buyer-requests/{id}', [BuyerRequestsAdminController::class, 'delete']);
    Route::post('/admin/buyer-requests/bulk', [BuyerRequestsAdminController::class, 'bulk']);
});