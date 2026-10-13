<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $term = (string) $request->input('q', '');

        $listings = Listing::query()
            ->with('seller:id,full_name,avatar_url,verified')
            ->where('status', 'active')
            ->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhere('location', 'like', "%{$term}%");
            })
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return response()->json([
            'listings' => $listings,
            'total' => $listings->count(),
            'q' => $term,
        ]);
    }
}
