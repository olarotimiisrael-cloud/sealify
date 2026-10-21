<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarketInsightsController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalAds = Listing::where('status', 'active')->count();
        $totalUsers = User::where('status', 'active')->count();
        $totalSold = Listing::where('status', 'sold')->count();
        $totalRevenue = Listing::where('status', 'sold')->sum('price');

        return response()->json([
            'data' => [
                'total_ads' => $totalAds,
                'total_users' => $totalUsers,
                'total_sold' => $totalSold,
                'total_revenue' => $totalRevenue,
            ],
        ]);
    }

    public function priceIndex(Request $request): JsonResponse
    {
        $category = $request->query('category');

        $query = Listing::where('status', 'active');

        if ($category && $category !== 'All') {
            $categoryModel = Category::where('slug', $category)->orWhere('name', $category)->first();
            if ($categoryModel) {
                $query->where('category_id', $categoryModel->id);
            }
        }

        $stats = $query->selectRaw('
            MIN(price) as min_price,
            MAX(price) as max_price,
            AVG(price) as avg_price,
            COUNT(*) as total_ads
        ')->first();

        return response()->json([
            'data' => [
                'category' => $category ?? 'All',
                'min_price' => $stats->min_price ?? 0,
                'max_price' => $stats->max_price ?? 0,
                'avg_price' => $stats->avg_price ?? 0,
                'total_ads' => $stats->total_ads ?? 0,
            ],
        ]);
    }
}
