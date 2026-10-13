<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MarketInsight;
use Illuminate\Http\Request;

class MarketInsightsController extends Controller
{
    public function index(Request $request)
    {
        $query = MarketInsight::query()
            ->when($request->filled('category'), fn($q) => $q->where('category', $request->input('category')))
            ->when($request->filled('type'), fn($q) => $q->where('type', $request->input('type')))
            ->latest('published_at')
            ->paginate(20);

        return response()->json($query);
    }

    public function show(string $id)
    {
        $insight = MarketInsight::findOrFail($id);
        return response()->json($insight);
    }

    public function stats(Request $request)
    {
        $stats = [
            'total_listings' => \App\Models\Listing::count(),
            'active_listings' => \App\Models\Listing::where('status', 'active')->count(),
            'categories' => \App\Models\Category::count(),
            'avg_price' => \App\Models\Listing::where('status', 'active')->avg('price'),
            'top_categories' => \App\Models\Listing::where('status', 'active')
                ->selectRaw('category_id, count(*) as count')
                ->groupBy('category_id')
                ->orderByDesc('count')
                ->limit(10)
                ->with('category')
                ->get()
                ->map(fn($l) => ['category' => $l->category, 'count' => $l->count]),
            'price_ranges' => $this->getPriceRanges(),
            'location_distribution' => \App\Models\Listing::where('status', 'active')
                ->selectRaw('location, count(*) as count')
                ->groupBy('location')
                ->orderByDesc('count')
                ->limit(20)
                ->get(),
        ];

        return response()->json($stats);
    }

    protected function getPriceRanges(): array
    {
        $ranges = [
            ['label' => 'Under ₦50,000', 'min' => 0, 'max' => 50000],
            ['label' => '₦50,000 - ₦200,000', 'min' => 50000, 'max' => 200000],
            ['label' => '₦200,000 - ₦500,000', 'min' => 200000, 'max' => 500000],
            ['label' => '₦500,000 - ₦1,000,000', 'min' => 500000, 'max' => 1000000],
            ['label' => '₦1,000,000 - ₦5,000,000', 'min' => 1000000, 'max' => 5000000],
            ['label' => 'Above ₦5,000,000', 'min' => 5000000, 'max' => null],
        ];

        foreach ($ranges as &$range) {
            $query = \App\Models\Listing::where('status', 'active')
                ->where('price', '>=', $range['min']);
            if ($range['max']) {
                $query->where('price', '<=', $range['max']);
            }
            $range['count'] = $query->count();
        }

        return $ranges;
    }
}