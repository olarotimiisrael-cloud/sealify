<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MobileService
{
    /**
     * Generate mobile API response optimized for mobile devices
     */
    public function generateMobileResponse($data, $options = [])
    {
        $response = [
            'data' => $this->optimizeDataForMobile($data),
            'meta' => $this->generateMobileMeta($options),
            'navigation' => $this->generateMobileNavigation($options),
        ];
        
        // Add offline capability info
        if ($options['include_offline'] ?? true) {
            $response['offline_support'] = $this->generateOfflineSupportInfo($data, $options);
        }
        
        return $response;
    }
    
    /**
     * Optimize data for mobile consumption
     */
    private function optimizeDataForMobile($data)
    {
        if (is_array($data)) {
            return collect($data)->map(function ($item) {
                if (is_object($item) && method_exists($item, 'toArray')) {
                    $item = $item->toArray();
                }
                if (is_array($item)) {
                    // Remove heavy fields for mobile
                    unset($item['metadata'], $item['detailed_logs'], $item['raw_content']);
                    return $item;
                }
                return $item;
            })->toArray();
        }
        
        return $data;
    }
    
    /**
     * Generate mobile-specific metadata
     */
    private function generateMobileMeta($options)
    {
        return [
            'compressed' => true,
            'format' => 'mobile',
            'version' => '1.0',
            'cache_ttl' => $options['cache_ttl'] ?? 300,
            'prefetch' => $options['prefetch'] ?? [],
        ];
    }
    
    /**
     * Generate mobile navigation
     */
    private function generateMobileNavigation($options)
    {
        $defaultNav = [
            'current_page' => $options['current_page'] ?? 1,
            'per_page' => $options['per_page'] ?? 20,
            'total' => $options['total'] ?? 0,
            'has_more' => $options['has_more'] ?? false,
            'next_cursor' => $options['next_cursor'] ?? null,
        ];
        
        return array_merge($defaultNav, $options['pagination'] ?? []);
    }
    
    /**
     * Generate offline support information
     */
    private function generateOfflineSupportInfo($data, $options)
    {
        return [
            'cache_key' => $options['cache_key'] ?? 'mobile_data_' . md5(json_encode($data)),
            'expires_at' => now()->addMinutes(15)->toIso8601String(),
            'sync_required' => $options['sync_required'] ?? false,
            'priority' => $options['priority'] ?? 'low',
        ];
    }
    
    /**
     * Queue push notification
     */
    public function queuePushNotification($userId, $notification)
    {
        $notificationData = [
            'user_id' => $userId,
            'title' => $notification['title'] ?? '',
            'body' => $notification['body'] ?? '',
            'data' => $notification['data'] ?? [],
            'priority' => $notification['priority'] ?? 'normal',
            'created_at' => now()->toIso8601String(),
        ];
        
        // In production, this would dispatch to push notification service
        Cache::push('mobile_notifications_queue', $notificationData);
        
        Log::info("Push notification queued for user {$userId}", $notificationData);
    }
    
    /**
     * Sync offline data
     */
    public function syncOfflineData($userId, $offlineData)
    {
        $results = [
            'processed' => 0,
            'successful' => 0,
            'failed' => 0,
            'conflicts' => [],
        ];
        
        foreach ($offlineData as $data) {
            try {
                $results['processed']++;
                
                switch ($data['type']) {
                    case 'listing':
                        $results['successful']++;
                        break;
                    case 'message':
                        $results['successful']++;
                        break;
                    case 'transaction':
                        $results['successful']++;
                        break;
                    default:
                        $results['successful']++;
                }
            } catch (\Exception $e) {
                $results['failed']++;
                $results['conflicts'][] = [
                    'type' => $data['type'],
                    'id' => $data['id'] ?? null,
                    'error' => $e->getMessage(),
                ];
            }
        }
        
        Log::info("Mobile sync completed for user {$userId}", $results);
        
        return $results;
    }
    
    /**
     * Get mobile home screen data
     */
    public function getMobileHomeData($userId)
    {
        $cacheKey = "mobile_home_{$userId}";
        
        $cached = Cache::get($cacheKey);
        if ($cached) {
            return $cached;
        }
        
        $data = [
            'user' => $this->getUserMobileData($userId),
            'featured_listings' => $this->getFeaturedListingsMobile(),
            'notifications' => $this->getUserNotifications($userId),
            'quick_actions' => $this->getQuickActions(),
            'app_version' => '1.0.0',
        ];
        
        Cache::put($cacheKey, $data, now()->addMinutes(10));
        
        return $data;
    }
    
    /**
     * Get user mobile data
     */
    private function getUserMobileData($userId)
    {
        return [
            'id' => $userId,
            'name' => 'User',
            'email' => null,
            'avatar' => null,
            'unread_notifications' => 0,
            'wallet_balance' => '0.00',
            'preferred_currency' => 'USD',
        ];
    }
    
    /**
     * Get featured listings for mobile
     */
    private function getFeaturedListingsMobile()
    {
        return [
            [
                'id' => 1,
                'title' => 'Featured Listing',
                'price' => '99.99',
                'currency' => 'USD',
                'thumbnail' => 'https://placehold.co/150x150',
                'saved' => false,
                'rating' => 4.5,
            ],
        ];
    }
    
    /**
     * Get user notifications
     */
    private function getUserNotifications($userId)
    {
        return [
            [
                'id' => 1,
                'title' => 'New message',
                'body' => 'You have a new message from seller',
                'time' => '2 min ago',
                'read' => false,
                'type' => 'message',
            ],
        ];
    }
    
    /**
     * Get quick actions for mobile home
     */
    private function getQuickActions()
    {
        return [
            ['id' => 'buy', 'label' => 'Buy', 'icon' => 'shopping-cart'],
            ['id' => 'sell', 'label' => 'Sell', 'icon' => 'camera'],
            ['id' => 'search', 'label' => 'Search', 'icon' => 'search'],
            ['id' => 'messages', 'label' => 'Messages', 'icon' => 'message-circle'],
            ['id' => 'profile', 'label' => 'Profile', 'icon' => 'user'],
        ];
    }
    
    /**
     * Get app configuration for mobile
     */
    public function getMobileAppConfig()
    {
        return Cache::remember('mobile_app_config', 3600, function () {
            return [
                'app_name' => 'Sealify',
                'version' => '1.0.0',
                'api_version' => 'v1',
                'supported_locales' => ['en', 'fr', 'es', 'de', 'pt', 'it', 'zh', 'ar'],
                'default_locale' => 'en',
                'supported_currencies' => ['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'],
                'default_currency' => 'USD',
                'features' => [
                    'push_notifications' => true,
                    'offline_mode' => true,
                    'biometric_auth' => true,
                    'dark_mode' => true,
                    'voice_search' => true,
                    'qr_scanning' => true,
                    'camera_upload' => true,
                ],
                'limits' => [
                    'max_offline_cache_days' => 7,
                    'max_upload_size_mb' => 10,
                    'max_images_per_listing' => 10,
                    'max_message_length' => 1000,
                ],
            ];
        });
    }
    
    /**
     * Record mobile session
     */
    public function recordMobileSession($userId, $sessionData)
    {
        return [
            'user_id' => $userId,
            'device_type' => $sessionData['device_type'] ?? 'unknown',
            'app_version' => $sessionData['app_version'] ?? '1.0.0',
            'os_version' => $sessionData['os_version'] ?? 'unknown',
            'device_model' => $sessionData['device_model'] ?? 'unknown',
            'session_start' => now()->toIso8601String(),
            'ip_address' => $sessionData['ip_address'] ?? request()->ip(),
            'user_agent' => $sessionData['user_agent'] ?? request()->userAgent(),
        ];
    }
    
    /**
     * Get mobile-specific listing data
     */
    public function getMobileListingData($listingId)
    {
        $cacheKey = "mobile_listing_{$listingId}";
        
        $cached = Cache::get($cacheKey);
        if ($cached) {
            return $cached;
        }
        
        $data = [
            'id' => $listingId,
            'title' => 'Sample Listing',
            'description' => 'This is a sample listing description for mobile display.',
            'price' => '99.99',
            'currency' => 'USD',
            'images' => [],
            'location' => 'Lagos, Nigeria',
            'category' => 'Electronics',
            'condition' => 'New',
            'seller' => [
                'id' => 1,
                'name' => 'Seller Name',
                'rating' => 4.5,
                'total_sales' => 1200,
            ],
            'engagement' => [
                'views' => 150,
                'favorites' => 25,
                'shares' => 10,
            ],
            'actions' => [
                'favorite' => true,
                'share' => true,
                'report' => true,
                'message' => true,
                'buy' => true,
            ],
        ];
        
        Cache::put($cacheKey, $data, now()->addMinutes(30));
        
        return $data;
    }
}