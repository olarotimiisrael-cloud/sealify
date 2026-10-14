<?php

namespace App\Services;

use App\Models\SellerAnalytics;
use App\Models\AutomationRule;
use App\Models\ScheduledReport;
use App\Models\CustomListing;
use App\Models\PriceOptimization;
use App\Models\InventoryAlert;
use App\Models\CustomerInsight;
use App\Models\SalesForecast;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProfessionalToolsService
{
    /**
     * Generate comprehensive seller analytics report
     */
    public function generateSellerAnalyticsReport($sellerId, $period = '30d')
    {
        $cacheKey = "seller_analytics_{$sellerId}_{$period}";
        
        $cached = Cache::get($cacheKey);
        if ($cached) {
            return $cached;
        }

        $startDate = now()->subDays($this->parsePeriod($period));
        
        // Get seller listings performance
        $listings = $this->analyzeListingsPerformance($sellerId, $startDate);
        
        // Get sales analytics
        $sales = $this->analyzeSalesPerformance($sellerId, $startDate);
        
        // Get customer insights
        $customers = $this->analyzeCustomerBehavior($sellerId, $startDate);
        
        // Get market comparison
        $marketComparison = $this->compareWithMarket($sellerId, $startDate);
        
        // Get optimization opportunities
        $opportunities = $this->identifyOptimizationOpportunities($sellerId, $startDate);
        
        $report = [
            'seller_id' => $sellerId,
            'period' => $period,
            'period_start' => $startDate->toIso8601String(),
            'listings_performance' => $listings,
            'sales_performance' => $sales,
            'customer_insights' => $customers,
            'market_comparison' => $marketComparison,
            'optimization_opportunities' => $opportunities,
            'key_metrics' => $this->calculateKeyMetrics($listings, $sales, $customers),
            'generated_at' => now()->toIso8601String(),
        ];

        Cache::put($cacheKey, $report, now()->addMinutes(30));
        
        Log::info("Generated analytics report for seller {$sellerId}");
        
        return $report;
    }

    /**
     * Analyze listings performance metrics
     */
    private function analyzeListingsPerformance($sellerId, $startDate)
    {
        $listings = CustomListing::where('seller_id', $sellerId)
            ->where('created_at', '>=', $startDate)
            ->get()
            ->map(function ($listing) {
                $views = $listing->views ?? 0;
                $inquiries = $listing->inquiries ?? 0;
                $conversions = $listing->conversions ?? 0;
                $price = $listing->price ?? 0;
                $category = $listing->category;
                $condition = $listing->condition;
                
                $viewToInquiryRate = $views > 0 ? ($inquiries / $views) * 100 : 0;
                $inquiryToConversionRate = $inquiries > 0 ? ($conversions / $inquiries) * 100 : 0;
                $listingAge = now()->diffInDays($listing->created_at);
                $engagementScore = ($viewToInquiryRate * 0.4) + ($inquiryToConversionRate * 0.6);
                
                return [
                    'listing_id' => $listing->id,
                    'title' => $listing->title,
                    'category' => $category,
                    'condition' => $condition,
                    'price' => $price,
                    'views' => $views,
                    'inquiries' => $inquiries,
                    'conversions' => $conversions,
                    'view_to_inquiry_rate' => round($viewToInquiryRate, 2),
                    'inquiry_to_conversion_rate' => round($inquiryToConversionRate, 2),
                    'engagement_score' => round($engagementScore, 2),
                    'listing_age_days' => $listingAge,
                    'performance_rating' => $this->calculateListingPerformanceRating($viewToInquiryRate, $inquiryToConversionRate),
                ];
            });
        
        // Aggregate statistics
        $totalListings = $listings->count();
        $totalViews = $listings->sum('views');
        $totalInquiries = $listings->sum('inquiries');
        $totalConversions = $listings->sum('conversions');
        $averageViews = $totalListings > 0 ? $totalViews / $totalListings : 0;
        $averageInquiries = $totalListings > 0 ? $totalInquiries / $totalListings : 0;
        $averageConversions = $totalListings > 0 ? $totalConversions / $totalListings : 0;
        
        $averageViewToInquiryRate = $totalViews > 0 ? ($totalInquiries / $totalViews) * 100 : 0;
        $averageInquiryToConversionRate = $totalInquiries > 0 ? ($totalConversions / $totalInquiries) * 100 : 0;
        
        return [
            'listings' => $listings->toArray(),
            'summary' => [
                'total_listings' => $totalListings,
                'total_views' => $totalViews,
                'total_inquiries' => $totalInquiries,
                'total_conversions' => $totalConversions,
                'average_views_per_listing' => round($averageViews, 2),
                'average_inquiries_per_listing' => round($averageInquiries, 2),
                'average_conversions_per_listing' => round($averageConversions, 2),
                'average_view_to_inquiry_rate' => round($averageViewToInquiryRate, 2),
                'average_inquiry_to_conversion_rate' => round($averageInquiryToConversionRate, 2),
                'best_performing_category' => $this->findBestPerformingCategory($listings),
                'worst_performing_category' => $this->findWorstPerformingCategory($listings),
            ],
        ];
    }

    /**
     * Analyze sales performance metrics
     */
    private function analyzeSalesPerformance($sellerId, $startDate)
    {
        $sales = CustomListing::where('seller_id', $sellerId)
            ->where('sold_at', '>=', $startDate)
            ->with('soldTransactions')
            ->get()
            ->map(function ($listing) {
                $transactions = $listing->soldTransactions ?? collect();
                $totalRevenue = $transactions->sum('amount');
                $totalCommission = $transactions->sum('commission');
                $totalItems = $transactions->sum('quantity');
                $averageOrderValue = $transactions->count() > 0 ? ($totalRevenue / $transactions->count()) : 0;
                $averageItemsPerOrder = $transactions->count() > 0 ? ($totalItems / $transactions->count()) : 0;
                
                return [
                    'listing_id' => $listing->id,
                    'title' => $listing->title,
                    'total_revenue' => $totalRevenue,
                    'total_commission' => $totalCommission,
                    'net_revenue' => $totalRevenue - $totalCommission,
                    'total_items_sold' => $totalItems,
                    'order_count' => $transactions->count(),
                    'average_order_value' => round($averageOrderValue, 2),
                    'average_items_per_order' => round($averageItemsPerOrder, 2),
                    'revenue_per_view' => $listing->views > 0 ? (($totalRevenue - $totalCommission) / $listing->views) : 0,
                    'conversion_rate' => $listing->views > 0 ? (($transactions->count() / $listing->views) * 100) : 0,
                ];
            });
        
        $totalRevenue = $sales->sum('total_revenue');
        $totalCommission = $sales->sum('total_commission');
        $netRevenue = $totalRevenue - $totalCommission;
        $totalOrders = $sales->sum('order_count');
        $totalItemsSold = $sales->sum('total_items_sold');
        
        return [
            'sales' => $sales->toArray(),
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_commission' => $totalCommission,
                'net_revenue' => $netRevenue,
                'total_orders' => $totalOrders,
                'total_items_sold' => $totalItemsSold,
                'average_order_value' => $totalOrders > 0 ? ($totalRevenue / $totalOrders) : 0,
                'items_per_order' => $totalOrders > 0 ? ($totalItemsSold / $totalOrders) : 0,
                'commission_rate' => $totalRevenue > 0 ? ($totalCommission / $totalRevenue) * 100 : 0,
                'best_selling_products' => $this->findBestSellingProducts($sales),
                'top_revenue_generators' => $this->findTopRevenueGenerators($sales),
            ],
        ];
    }

    /**
     * Analyze customer behavior insights
     */
    private function analyzeCustomerBehavior($sellerId, $startDate)
    {
        $customers = CustomerInsight::where('seller_id', $sellerId)
            ->where('created_at', '>=', $startDate)
            ->get()
            ->map(function ($customer) {
                return [
                    'customer_id' => $customer->customer_id,
                    'customer_name' => $customer->customer_name,
                    'customer_email' => $customer->customer_email,
                    'total_purchases' => $customer->total_purchases,
                    'total_spent' => $customer->total_spent,
                    'average_order_value' => $customer->total_purchases > 0 ? ($customer->total_spent / $customer->total_purchases) : 0,
                    'last_purchase_date' => $customer->last_purchase_date,
                    'first_purchase_date' => $customer->first_purchase_date,
                    'customer_lifetime_value' => $this->calculateCustomerLifetimeValue($customer, $startDate),
                    'purchase_frequency' => $this->calculatePurchaseFrequency($customer),
                    'churn_risk' => $this->calculateChurnRisk($customer),
                ];
            });
        
        $totalCustomers = $customers->count();
        $totalRevenueFromCustomers = $customers->sum('total_spent');
        $averageCustomerValue = $totalCustomers > 0 ? ($totalRevenueFromCustomers / $totalCustomers) : 0;
        $repeatCustomerRate = $customers->where('purchase_frequency', 'high')->count() / max($totalCustomers, 1) * 100;
        
        return [
            'customers' => $customers->toArray(),
            'summary' => [
                'total_customers' => $totalCustomers,
                'total_revenue_from_customers' => $totalRevenueFromCustomers,
                'average_customer_value' => round($averageCustomerValue, 2),
                'repeat_customer_rate' => round($repeatCustomerRate, 2),
                'new_customers' => $customers->where('first_purchase_date', '>=', now()->subDays(30))->count(),
                'at_risk_customers' => $customers->where('churn_risk', 'high')->count(),
                'vip_customers' => $customers->where('customer_lifetime_value', '>', 10000)->count(),
            ],
        ];
    }

    /**
     * Compare seller performance with market averages
     */
    private function compareWithMarket($sellerId, $startDate)
    {
        // Get all sellers' performance data
        $allSellers = CustomListing::where('seller_id', '!=', $sellerId)
            ->where('created_at', '>=', $startDate)
            ->get()
            ->groupBy('seller_id');
        
        // Calculate market averages
        $marketAverages = $this->calculateMarketAverages($allSellers);
        
        // Get current seller's performance
        $sellerPerformance = $this->analyzeSellerPerformance($sellerId, $startDate);
        
        return [
            'market_averages' => $marketAverages,
            'seller_performance' => $sellerPerformance,
            'comparison' => $this->generatePerformanceComparison($sellerPerformance, $marketAverages),
        ];
    }

    /**
     * Identify optimization opportunities
     */
    private function identifyOptimizationOpportunities($sellerId, $startDate)
    {
        $opportunities = [];
        
        // Get seller data
        $sellerListings = CustomListing::where('seller_id', $sellerId)
            ->where('created_at', '>=', $startDate)
            ->get();
        
        // Analyze underperforming listings
        foreach ($sellerListings as $listing) {
            $performance = $this->calculateListingPerformance($listing, $startDate);
            
            if ($performance['engagement_score'] < 30) {
                $opportunities[] = [
                    'type' => 'underperforming_listing',
                    'listing_id' => $listing->id,
                    'title' => $listing->title,
                    'issue' => 'Low engagement score',
                    'potential_improvement' => 'Increase listing quality and visibility',
                    'priority' => 'high',
                    'estimated_impact' => 'Increase inquiries by 50-100%',
                ];
            }
            
            if ($performance['price'] > $this->getMarketAveragePrice($listing->category)) {
                $opportunities[] = [
                    'type' => 'pricing_optimization',
                    'listing_id' => $listing->id,
                    'title' => $listing->title,
                    'issue' => 'Above market average price',
                    'potential_improvement' => 'Reduce price by 5-15%',
                    'priority' => 'medium',
                    'estimated_impact' => 'Increase conversion rate by 20-40%',
                ];
            }
        }
        
        return $opportunities;
    }

    /**
     * Calculate key performance metrics
     */
    private function calculateKeyMetrics($listings, $sales, $customers)
    {
        $listingsData = $listings['summary'] ?? ['total_listings' => 0, 'average_views_per_listing' => 0];
        $salesData = $sales['summary'] ?? ['total_revenue' => 0, 'total_orders' => 0];
        $customersData = $customers['summary'] ?? ['total_customers' => 0];
        
        return [
            'listings_metrics' => [
                'listings_per_day' => round($listingsData['total_listings'] / 30, 2),
                'views_per_listing' => round($listingsData['average_views_per_listing'], 2),
                'engagement_quality_score' => $this->calculateEngagementQualityScore($listingsData),
            ],
            'sales_metrics' => [
                'revenue_per_listing' => $listingsData['total_listings'] > 0 ? ($salesData['total_revenue'] / $listingsData['total_listings']) : 0,
                'conversion_rate' => $listingsData['average_views_per_listing'] > 0 ? (($salesData['total_orders'] / $listingsData['average_views_per_listing']) * 100) : 0,
                'customer_acquisition_cost' => $customersData['total_customers'] > 0 ? ($salesData['total_revenue'] / $customersData['total_customers']) : 0,
            ],
            'customer_metrics' => [
                'customer_retention_rate' => $this->calculateCustomerRetentionRate($customersData),
                'customer_satisfaction_score' => $this->calculateCustomerSatisfactionScore($customers),
                'market_penetration' => $this->calculateMarketPenetration($customersData, $listingsData['total_listings']),
            ],
            'overall_performance_score' => $this->calculateOverallPerformanceScore($listingsData, $salesData, $customersData),
        ];
    }

    /**
     * Calculate market averages for comparison
     */
    private function calculateMarketAverages($allSellers)
    {
        $totalListings = 0;
        $totalViews = 0;
        $totalRevenue = 0;
        $totalOrders = 0;
        $totalCustomers = 0;
        
        foreach ($allSellers as $sellerListings) {
            foreach ($sellerListings as $listing) {
                $totalListings++;
                $totalViews += $listing->views ?? 0;
                $totalRevenue += $listing->total_revenue ?? 0;
                $totalOrders += $listing->order_count ?? 0;
            }
        }
        
        $averageListingsPerSeller = count($allSellers);
        $averageViewsPerListing = $totalListings > 0 ? $totalViews / $totalListings : 0;
        $averageRevenuePerSeller = $averageListingsPerSeller > 0 ? $totalRevenue / $averageListingsPerSeller : 0;
        $averageOrdersPerSeller = $averageListingsPerSeller > 0 ? $totalOrders / $averageListingsPerSeller : 0;
        
        return [
            'average_listings_per_seller' => round($averageListingsPerSeller, 2),
            'average_views_per_listing' => round($averageViewsPerListing, 2),
            'average_revenue_per_seller' => round($averageRevenuePerSeller, 2),
            'average_orders_per_seller' => round($averageOrdersPerSeller, 2),
        ];
    }

    /**
     * Calculate seller performance for comparison
     */
    private function analyzeSellerPerformance($sellerId, $startDate)
    {
        $listings = CustomListing::where('seller_id', $sellerId)
            ->where('created_at', '>=', $startDate)
            ->get()
            ->map(function ($listing) {
                return [
                    'listing_id' => $listing->id,
                    'views' => $listing->views ?? 0,
                    'inquiries' => $listing->inquiries ?? 0,
                    'conversions' => $listing->conversions ?? 0,
                    'price' => $listing->price ?? 0,
                    'category' => $listing->category,
                ];
            });
        
        $totalViews = $listings->sum('views');
        $totalInquiries = $listings->sum('inquiries');
        $totalConversions = $listings->sum('conversions');
        $totalRevenue = $listings->sum(fn($l) => $l['price'] * ($l['conversions'] ?? 0));
        
        return [
            'listings_count' => $listings->count(),
            'total_views' => $totalViews,
            'total_inquiries' => $totalInquiries,
            'total_conversions' => $totalConversions,
            'total_revenue' => $totalRevenue,
            'average_views_per_listing' => $listings->count() > 0 ? ($totalViews / $listings->count()) : 0,
            'average_inquiries_per_listing' => $listings->count() > 0 ? ($totalInquiries / $listings->count()) : 0,
            'average_conversions_per_listing' => $listings->count() > 0 ? ($totalConversions / $listings->count()) : 0,
            'revenue_per_listing' => $listings->count() > 0 ? ($totalRevenue / $listings->count()) : 0,
        ];
    }

    /**
     * Generate performance comparison
     */
    private function generatePerformanceComparison($sellerPerformance, $marketAverages)
    {
        $comparison = [];
        
        foreach (['average_views_per_listing', 'average_inquiries_per_listing', 'average_conversions_per_listing', 'revenue_per_listing'] as $metric) {
            $sellerValue = $sellerPerformance[$metric] ?? 0;
            $marketValue = $marketAverages[$metric] ?? 0;
            
            if ($marketValue > 0) {
                $variance = (($sellerValue - $marketValue) / $marketValue) * 100;
                $performance = $variance > 0 ? 'above_average' : 'below_average';
            } else {
                $variance = 0;
                $performance = 'no_data';
            }
            
            $comparison[$metric] = [
                'seller_value' => round($sellerValue, 2),
                'market_value' => round($marketValue, 2),
                'variance_percent' => round($variance, 2),
                'performance' => $performance,
            ];
        }
        
        return $comparison;
    }

    /**
     * Calculate customer lifetime value
     */
    private function calculateCustomerLifetimeValue($customer, $startDate)
    {
        $purchaseHistory = CustomerInsight::where('customer_id', $customer->customer_id)
            ->where('created_at', '>=', $startDate)
            ->get();
        
        if ($purchaseHistory->count() < 2) {
            return 'low';
        }
        
        $totalSpent = $purchaseHistory->sum('total_spent');
        $firstPurchase = $purchaseHistory->min('first_purchase_date');
        $lastPurchase = $purchaseHistory->max('last_purchase_date');
        $monthsActive = now()->diffInMonths($firstPurchase, $lastPurchase);
        
        $clv = $totalSpent;
        $monthlySpending = $totalSpent / max($monthsActive, 1);
        
        if ($monthlySpending > 1000 && $clv > 10000) {
            return 'high';
        } elseif ($monthlySpending > 500 && $clv > 5000) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Calculate purchase frequency
     */
    private function calculatePurchaseFrequency($customer)
    {
        $daysActive = now()->diffInDays($customer->first_purchase_date, $customer->last_purchase_date);
        $daysActive = max($daysActive, 1);
        
        $purchasesPerWeek = ($customer->total_purchases / $daysActive) * 7;
        
        if ($purchasesPerWeek > 2) {
            return 'high';
        } elseif ($purchasesPerWeek > 0.5) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Calculate churn risk
     */
    private function calculateChurnRisk($customer)
    {
        $daysSinceLastPurchase = now()->diffInDays($customer->last_purchase_date);
        
        if ($daysSinceLastPurchase > 90) {
            return 'high';
        } elseif ($daysSinceLastPurchase > 30) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Calculate engagement quality score
     */
    private function calculateEngagementQualityScore($listingsData)
    {
        $viewsPerListing = $listingsData['average_views_per_listing'] ?? 0;
        $inquiryRate = $listingsData['average_view_to_inquiry_rate'] ?? 0;
        $conversionRate = $listingsData['average_inquiry_to_conversion_rate'] ?? 0;
        
        $qualityScore = ($viewsPerListing * 0.3) + ($inquiryRate * 0.4) + ($conversionRate * 0.3);
        
        return round(min($qualityScore, 100), 2);
    }

    /**
     * Calculate customer retention rate
     */
    private function calculateCustomerRetentionRate($customersData)
    {
        $newCustomers = $customersData['new_customers'] ?? 0;
        $totalCustomers = $customersData['total_customers'] ?? 0;
        
        return $totalCustomers > 0 ? ($newCustomers / $totalCustomers) * 100 : 0;
    }

    /**
     * Calculate customer satisfaction score
     */
    private function calculateCustomerSatisfactionScore($customers)
    {
        $customersData = $customers['summary'] ?? ['total_customers' => 0];
        $totalCustomers = $customersData['total_customers'];
        
        if ($totalCustomers === 0) return 0;
        
        $satisfactionScore = ($customers['summary']['vip_customers'] / $totalCustomers) * 100;
        
        return round($satisfactionScore, 2);
    }

    /**
     * Calculate market penetration
     */
    private function calculateMarketPenetration($customersData, $listingsData)
    {
        $totalCustomers = $customersData['total_customers'];
        $totalListings = $listingsData;
        
        if ($totalCustomers === 0 || $totalListings === 0) return 0;
        
        $penetrationScore = ($totalCustomers / $totalListings) * 10;
        
        return round(min($penetrationScore, 100), 2);
    }

    /**
     * Calculate overall performance score
     */
    private function calculateOverallPerformanceScore($listingsData, $salesData, $customersData)
    {
        $listingsScore = $listingsData['engagement_quality_score'] * 0.3;
        $salesScore = min(($salesData['revenue_per_listing'] / 1000) * 100, 100) * 0.4;
        $customerScore = $customersData['customer_satisfaction_score'] * 0.3;
        
        return round(($listingsScore + $salesScore + $customerScore) / 3, 2);
    }

    /**
     * Helper methods for analysis
     */
    private function parsePeriod($period)
    {
        $period = strtolower($period);
        if (str_ends_with($period, 'd')) {
            return (int)substr($period, 0, -1);
        } elseif (str_ends_with($period, 'w')) {
            return (int)substr($period, 0, -1) * 7;
        } elseif (str_ends_with($period, 'm')) {
            return (int)substr($period, 0, -1) * 30;
        }
        return (int)$period;
    }

    private function calculateListingPerformanceRating($viewToInquiryRate, $inquiryToConversionRate)
    {
        $rating = ($viewToInquiryRate * 0.5) + ($inquiryToConversionRate * 0.5);
        if ($rating >= 80) return 'excellent';
        if ($rating >= 60) return 'good';
        if ($rating >= 40) return 'average';
        if ($rating >= 20) return 'poor';
        return 'very_poor';
    }

    private function findBestPerformingCategory($listings)
    {
        $categoryStats = [];
        foreach ($listings as $listing) {
            $category = $listing['category'];
            if (!isset($categoryStats[$category])) {
                $categoryStats[$category] = ['views' => 0, 'inquiries' => 0, 'conversions' => 0];
            }
            $categoryStats[$category]['views'] += $listing['views'];
            $categoryStats[$category]['inquiries'] += $listing['inquiries'];
            $categoryStats[$category]['conversions'] += $listing['conversions'];
        }
        
        usort($categoryStats, function ($a, $b) {
            $aScore = $this->calculateCategoryScore($a);
            $bScore = $this->calculateCategoryScore($b);
            return $bScore <=> $aScore;
        });
        
        return array_key_first($categoryStats);
    }

    private function calculateCategoryScore($stats)
    {
        $views = $stats['views'];
        $inquiries = $stats['inquiries'];
        $conversions = $stats['conversions'];
        
        $viewToInquiryRate = $views > 0 ? ($inquiries / $views) * 100 : 0;
        $inquiryToConversionRate = $inquiries > 0 ? ($conversions / $inquiries) * 100 : 0;
        
        return ($viewToInquiryRate * 0.4) + ($inquiryToConversionRate * 0.6);
    }

    private function findWorstPerformingCategory($listings)
    {
        $categoryStats = [];
        foreach ($listings as $listing) {
            $category = $listing['category'];
            if (!isset($categoryStats[$category])) {
                $categoryStats[$category] = ['views' => 0, 'inquiries' => 0, 'conversions' => 0];
            }
            $categoryStats[$category]['views'] += $listing['views'];
            $categoryStats[$category]['inquiries'] += $listing['inquiries'];
            $categoryStats[$category]['conversions'] += $listing['conversions'];
        }
        
        usort($categoryStats, function ($a, $b) {
            $aScore = $this->calculateCategoryScore($a);
            $bScore = $this->calculateCategoryScore($b);
            return $aScore <=> $bScore;
        });
        
        return array_key_first($categoryStats);
    }

    private function findBestSellingProducts($sales)
    {
        $productRevenue = collect($sales)->groupBy('title')->map(function ($items) {
            return $items->sum('total_revenue');
        });
        
        $sortedProducts = $productRevenue->sortDesc();
        
        return $sortedProducts->take(5)->keys()->toArray();
    }

    private function findTopRevenueGenerators($sales)
    {
        $revenueByListing = collect($sales)->groupBy('listing_id')->map(function ($items) {
            $listing = $items->first();
            return [
                'listing_id' => $listing['listing_id'],
                'title' => $listing['title'],
                'total_revenue' => $items->sum('total_revenue'),
            ];
        });
        
        $sortedByRevenue = $revenueByListing->sortDesc(fn($a, $b) => $b['total_revenue'] <=> $a['total_revenue']);
        
        return $sortedByRevenue->take(5)->values()->toArray();
    }

    private function getMarketAveragePrice($category)
    {
        // Mock market data - in real implementation, this would query market data
        $marketPrices = [
            'electronics' => 500,
            'clothing' => 50,
            'home_goods' => 100,
            'sports' => 150,
            'books' => 20,
            'vehicles' => 5000,
            'real_estate' => 250000,
            'services' => 75,
            'jobs' => 0,
            'art_collectibles' => 200,
        ];
        
        return $marketPrices[$category] ?? 100;
    }

    private function calculateListingPerformance($listing, $startDate)
    {
        $views = $listing['views'] ?? 0;
        $inquiries = $listing['inquiries'] ?? 0;
        $conversions = $listing['conversions'] ?? 0;
        
        $viewToInquiryRate = $views > 0 ? ($inquiries / $views) * 100 : 0;
        $inquiryToConversionRate = $inquiries > 0 ? ($conversions / $inquiries) * 100 : 0;
        
        return [
            'engagement_score' => ($viewToInquiryRate * 0.4) + ($inquiryToConversionRate * 0.6),
            'view_to_inquiry_rate' => $viewToInquiryRate,
            'inquiry_to_conversion_rate' => $inquiryToConversionRate,
        ];
    }
}