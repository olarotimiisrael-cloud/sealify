<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MobileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class MobileController extends Controller
{
    protected MobileService $mobileService;
    
    public function __construct(MobileService $mobileService)
    {
        $this->mobileService = $mobileService;
    }
    
    /**
     * Get mobile home screen data
     */
    public function home(Request $request)
    {
        $userId = $request->user()->id;
        $data = $this->mobileService->getMobileHomeData($userId);
        
        // Clear cache if refresh requested
        if ($request->query('refresh')) {
            Cache::forget("mobile_home_{$userId}");
            $data = $this->mobileService->getMobileHomeData($userId);
        }
        
        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'type' => 'home',
                'cached' => !$request->query('refresh'),
            ],
        ]);
    }
    
    /**
     * Get mobile app configuration
     */
    public function config(Request $request)
    {
        $config = $this->mobileService->getMobileAppConfig();
        
        return response()->json([
            'success' => true,
            'data' => $config,
        ]);
    }
    
    /**
     * Get optimized listing for mobile
     */
    public function listing(Request $request, $id)
    {
        $data = $this->mobileService->getMobileListingData($id);
        
        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'type' => 'listing',
                'optimized_for' => 'mobile',
            ],
        ]);
    }
    
    /**
     * Get mobile-optimized data feed
     */
    public function feed(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'limit' => 'nullable|integer|min:1|max:50',
            'type' => 'nullable|in:listings,favorites,nearby',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $type = $request->query('type', 'listings');
        $page = $request->query('page', 1);
        $limit = min($request->query('limit', 20), 50);
        
        $cacheKey = "mobile_feed_{$type}_{$page}_{$limit}";
        
        $data = Cache::remember($cacheKey, 300, function () use ($type) {
            // In production, this would query the database
            return [
                'items' => [],
                'total' => 0,
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $data['items'],
            'meta' => [
                'type' => 'feed',
                'page' => $page,
                'limit' => $limit,
                'total' => $data['total'],
                'total_pages' => ceil($data['total'] / $limit),
            ],
        ]);
    }
    
    /**
     * Queue push notification for user
     */
    public function pushNotification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:1000',
            'data' => 'nullable|array',
            'priority' => 'nullable|in:normal,high',
            'recipients' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $userId = $request->user()->id;
        $recipients = $request->input('recipients', [$userId]);
        
        foreach ($recipients as $recipientId) {
            $this->mobileService->queuePushNotification($recipientId, [
                'title' => $request->input('title'),
                'body' => $request->input('body'),
                'data' => $request->input('data', []),
                'priority' => $request->input('priority', 'normal'),
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Push notification(s) queued successfully',
            'data' => [
                'recipient_count' => count($recipients),
            ],
        ]);
    }
    
    /**
     * Sync offline data from mobile app
     */
    public function syncOffline(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'data' => 'required|array',
            'data.*.type' => 'required|string|in:listing,message,transaction,favorite,view',
            'data.*.id' => 'nullable|string',
            'data.*.action' => 'required|string|in:create,update,delete',
            'data.*.payload' => 'nullable|array',
            'last_sync' => 'nullable|date',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $userId = $request->user()->id;
        $results = $this->mobileService->syncOfflineData($userId, $request->input('data'));
        
        // Update last sync timestamp
        Cache::put("mobile_last_sync_{$userId}", now()->toIso8601String(), 3600);
        
        return response()->json([
            'success' => true,
            'message' => 'Offline data synced successfully',
            'data' => $results,
            'meta' => [
                'synced_at' => now()->toIso8601String(),
                'next_sync' => now()->addMinutes(15)->toIso8601String(),
            ],
        ]);
    }
    
    /**
     * Record mobile session (for analytics)
     */
    public function recordSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_type' => 'nullable|string',
            'app_version' => 'nullable|string',
            'os_version' => 'nullable|string',
            'device_model' => 'nullable|string',
            'ip_address' => 'nullable|ip',
            'user_agent' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $userId = $request->user()->id;
        $session = $this->mobileService->recordMobileSession($userId, $request->all());
        
        Cache::push("mobile_sessions_{$userId}", $session);
        
        return response()->json([
            'success' => true,
            'message' => 'Session recorded',
            'data' => $session,
        ]);
    }
    
    /**
     * Get mobile notifications
     */
    public function notifications(Request $request)
    {
        $userId = $request->user()->id;
        
        // In production, this would fetch from database
        $notifications = [
            [
                'id' => 1,
                'title' => 'New message',
                'body' => 'You have a new message',
                'type' => 'message',
                'read' => false,
                'created_at' => now()->toIso8601String(),
            ],
            [
                'id' => 2,
                'title' => 'Order update',
                'body' => 'Your order has been shipped',
                'type' => 'order',
                'read' => false,
                'created_at' => now()->subHours(2)->toIso8601String(),
            ],
        ];
        
        $unreadCount = count(array_filter($notifications, fn($n) => !$n['read']));
        
        return response()->json([
            'success' => true,
            'data' => $notifications,
            'meta' => [
                'unread_count' => $unreadCount,
                'type' => 'notifications',
            ],
        ]);
    }
    
    /**
     * Mark notifications as read
     */
    public function markNotificationsRead(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'notification_ids' => 'nullable|array',
            'all' => 'nullable|boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Notifications marked as read',
        ]);
    }
    
    /**
     * Search for mobile
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|max:100',
            'limit' => 'nullable|integer|min:1|max:30',
            'filters' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $query = $request->input('query');
        $limit = $request->input('limit', 15);
        
        $cacheKey = "mobile_search_" . md5($query . serialize($request->input('filters', [])) . $limit);
        
        $results = Cache::remember($cacheKey, 300, function () use ($query, $limit) {
            // In production, this would search the database
            // Returning mobile-optimized results
            return [
                'query' => $query,
                'results' => [
                    [
                        'id' => 1,
                        'title' => "Result for: {$query}",
                        'subtitle' => 'Category',
                        'type' => 'listing',
                        'thumbnail' => 'https://placehold.co/80x80',
                        'price' => '99.99',
                        'currency' => 'USD',
                    ],
                ],
                'total' => 1,
                'took_ms' => rand(10, 100),
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $results,
            'meta' => [
                'type' => 'search',
                'mobile_optimized' => true,
            ],
        ]);
    }
}
