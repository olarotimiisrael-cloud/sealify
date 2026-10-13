<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CopilotController;
use App\Http\Controllers\Api\DataController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReviewController;
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

Route::get('/data/{resource}', [DataController::class, 'index']);
Route::get('/data/{resource}/{id}', [DataController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/data/{resource}', [DataController::class, 'store']);
    Route::put('/data/{resource}/{id}', [DataController::class, 'update']);
    Route::patch('/data/{resource}/{id}', [DataController::class, 'update']);
    Route::delete('/data/{resource}/{id}', [DataController::class, 'destroy']);

    Route::post('/uploads', [UploadController::class, 'store']);
});

Route::middleware('auth:sanctum')->group(function () {
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
});
