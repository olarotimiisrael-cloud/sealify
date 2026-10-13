<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedSearch;
use Illuminate\Http\Request;

class SavedSearchesController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $savedSearches = SavedSearch::where('user_id', $user->id)
            ->latest()
            ->paginate(20);

        return response()->json($savedSearches);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'query' => 'sometimes|string',
            'filters' => 'sometimes|array',
            'alert_enabled' => 'sometimes|boolean',
            'alert_frequency' => 'sometimes|in:daily,weekly,instant',
        ]);

        $savedSearch = SavedSearch::create([
            'user_id' => $request->user()->id,
            'name' => $data['name'],
            'query' => $data['query'] ?? '',
            'filters' => $data['filters'] ?? [],
            'alert_enabled' => $data['alert_enabled'] ?? false,
            'alert_frequency' => $data['alert_frequency'] ?? 'daily',
        ]);

        return response()->json($savedSearch, 201);
    }

    public function show(string $id)
    {
        $savedSearch = SavedSearch::where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($savedSearch);
    }

    public function update(Request $request, string $id)
    {
        $savedSearch = SavedSearch::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'query' => 'sometimes|string',
            'filters' => 'sometimes|array',
            'alert_enabled' => 'sometimes|boolean',
            'alert_frequency' => 'sometimes|in:daily,weekly,instant',
        ]);

        $savedSearch->update($data);

        return response()->json($savedSearch->fresh());
    }

    public function destroy(Request $request, string $id)
    {
        $savedSearch = SavedSearch::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $savedSearch->delete();

        return response()->json(['success' => true]);
    }

    public function trigger(Request $request, string $id)
    {
        $savedSearch = SavedSearch::where('user_id', $request->user()->id)
            ->findOrFail($id);

        // This would trigger the search and send alerts
        // For now, just return the search results
        $listings = \App\Models\Listing::query()
            ->where('status', 'active');

        if ($savedSearch->query) {
            $listings->where(function ($q) use ($savedSearch) {
                $q->where('title', 'like', "%{$savedSearch->query}%")
                    ->orWhere('description', 'like', "%{$savedSearch->query}%");
            });
        }

        if (!empty($savedSearch->filters)) {
            foreach ($savedSearch->filters as $key => $value) {
                if ($value) {
                    $listings->where($key, $value);
                }
            }
        }

        $results = $listings->latest()->limit(50)->get();

        return response()->json([
            'saved_search' => $savedSearch,
            'results' => $results,
            'count' => $results->count(),
        ]);
    }
}