<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CopilotController;
use App\Http\Controllers\Api\DataController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SiteMetadataController;
use App\Http\Controllers\Api\SafetyController;
use App\Http\Controllers\Api\SmartMessagingController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VideoController;
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

Route::get('/data/{resource}', [DataController::class, 'index']);
Route::get('/data/{resource}/{id}', [DataController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/data/{resource}', [DataController::class, 'store']);
    Route::put('/data/{resource}/{id}', [DataController::class, 'update']);
    Route::patch('/data/{resource}/{id}', [DataController::class, 'update']);
    Route::delete('/data/{resource}/{id}', [DataController::class, 'destroy']);

    Route::post('/uploads', [UploadController::class, 'store']);
});
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{id}', [ListingController::class, 'update']);
    Route::delete('/listings/{id}', [ListingController::class, 'destroy']);

    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/conversations/{id}/messages', [MessageController::class, 'messages']);
    Route::post('/conversations/{id}/messages', [MessageController::class, 'store']);

    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);

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

    // Video chat routes
    Route::post('/video/initiate', [VideoController::class, 'initiateCall']);
    Route::post('/video/join/{roomId}', [VideoController::class, 'joinCall']);
    Route::post('/video/leave/{roomId}', [VideoController::class, 'leaveCall']);
    Route::post('/video/end/{roomId}', [VideoController::class, 'endCall']);
    Route::post('/video/start-recording/{roomId}', [VideoController::class, 'startRecording']);
    Route::post('/video/stop-recording/{recordingId}', [VideoController::class, 'stopRecording']);
    Route::post('/video/recordings/{recordingId}', [VideoController::class, 'getRecording']);
    Route::post('/video/user-calls', [VideoController::class, 'getUserCalls']);
    Route::post('/video/signal/{roomId}', [VideoController::class, 'signal']);
    Route::get('/video/turn-credentials/{roomId}', [VideoController::class, 'turnCredentials']);

    // Safety routes
    Route::post('/safety/check', [SafetyController::class, 'checkUserSafety']);
    Route::post('/safety/conversation/{participantId}', [SafetyController::class, 'checkConversationSafety']);
    Route::post('/safety/conversation-info/{participantId}', [SafetyController::class, 'getConversationSafety']);
    Route::post('/safety/report/{userId}', [SafetyController::class, 'reportUser']);
    Route::post('/safety/safety-center', [SafetyController::class, 'getSafetyCenterInfo']);

    // Smart messaging routes
    Route::post('/messaging/smart-replies/{conversationId}', [SmartMessagingController::class, 'getSmartReplies']);
    Route::post('/messaging/schedule', [SmartMessagingController::class, 'scheduleMessage']);
    Route::post('/messaging/scheduled/{conversationId}', [SmartMessagingController::class, 'getScheduledMessages']);
    Route::post('/messaging/cancel/{scheduledMessageId}', [SmartMessagingController::class, 'cancelScheduledMessage']);

    // Profile routes
    Route::post('/profile/stories', [ProfileController::class, 'getStories']);
    Route::post('/profile/stories', [ProfileController::class, 'createStory']);
    Route::post('/profile/stories/{storyId}/react', [ProfileController::class, 'reactToStory']);
    Route::post('/profile/{userId}', [ProfileController::class, 'getProfile']);
    Route::post('/profile/interests', [ProfileController::class, 'updateInterests']);
    Route::post('/profile/skills', [ProfileController::class, 'updateSkills']);

    // Promotion routes
    Route::post('/promotion/create', [PromotionController::class, 'createPromotion']);
    Route::post('/promotion/payment-callback', [PromotionController::class, 'paymentCallback']);
    Route::post('/promotion/admin/approve/{promotionId}', [PromotionController::class, 'adminApprovePromotion']);
    Route::post('/promotion/admin/terminate/{promotionId}', [PromotionController::class, 'adminTerminatePromotion']);
    Route::post('/promotion/receipt/upload/{receiptId}', [PromotionController::class, 'uploadReceipt']);
    Route::post('/promotion/user', [PromotionController::class, 'userPromotions']);
    Route::post('/promotion/receipt/{receiptId}', [PromotionController::class, 'getReceipt']);

    // Verification routes
    Route::post('/verification/id', [VerificationController::class, 'createIdVerification']);
    Route::post('/verification/business', [VerificationController::class, 'createBusinessVerification']);
    Route::post('/verification/admin/id/{verificationId}', [VerificationController::class, 'adminVerifyIdVerification']);
    Route::post('/verification/admin/business/{verificationId}', [VerificationController::class, 'adminVerifyBusinessVerification']);
    Route::post('/verification/user', [VerificationController::class, 'getUserVerifications']);
    Route::post('/verification/user/business', [VerificationController::class, 'getUserBusinessVerifications']);
    Route::post('/verification/status', [VerificationController::class, 'verificationStatus']);
    Route::post('/verification/document/{verificationId}', [VerificationController::class, 'getVerificationDocument']);
});
