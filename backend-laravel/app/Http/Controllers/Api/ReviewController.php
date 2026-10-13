<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::query();

        if ($request->filled('user_id')) {
            $query->where('reviewed_user_id', $request->input('user_id'));
        }

        if ($request->filled('listing_id')) {
            $query->where('listing_id', $request->input('listing_id'));
        }

        return response()->json(['reviews' => $query->latest()->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'reviewed_user_id' => 'required|exists:users,id',
            'listing_id' => 'nullable|exists:listings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        $review = Review::create([
            'reviewer_id' => $request->user()->id,
            'reviewed_user_id' => $data['reviewed_user_id'],
            'listing_id' => $data['listing_id'] ?? null,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);

        return response()->json($review, 201);
    }
}
