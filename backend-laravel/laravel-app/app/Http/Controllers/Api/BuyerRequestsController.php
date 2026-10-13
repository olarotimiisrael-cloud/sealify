<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BuyerRequest;
use App\Models\BuyerRequestResponse;
use Illuminate\Http\Request;

class BuyerRequestsController extends Controller
{
    public function index(Request $request)
    {
        $query = BuyerRequest::with(['user', 'category'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('category_id'), fn($q) => $q->where('category_id', $request->input('category_id')))
            ->latest()
            ->paginate(20);

        return response()->json($query);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|min:5|max:200',
            'description' => 'required|string|min:20|max:5000',
            'category_id' => 'required|exists:categories,id',
            'budget_min' => 'sometimes|nullable|numeric|min:0',
            'budget_max' => 'sometimes|nullable|numeric|min:0',
            'location' => 'required|string|min:2|max:100',
            'urgency' => 'sometimes|in:low,normal,high,urgent',
            'images' => 'sometimes|array|max:5',
            'images.*' => 'string|max:500',
        ]);

        $buyerRequest = $request->user()->buyerRequests()->create($data);

        return response()->json($buyerRequest->load(['user', 'category']), 201);
    }

    public function show(string $id)
    {
        $buyerRequest = BuyerRequest::with(['user', 'category', 'responses.user'])->findOrFail($id);
        return response()->json($buyerRequest);
    }

    public function update(Request $request, string $id)
    {
        $buyerRequest = BuyerRequest::where('user_id', $request->user()->id)->findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|string|min:5|max:200',
            'description' => 'sometimes|string|min:20|max:5000',
            'budget_min' => 'sometimes|nullable|numeric|min:0',
            'budget_max' => 'sometimes|nullable|numeric|min:0',
            'location' => 'sometimes|string|min:2|max:100',
            'urgency' => 'sometimes|in:low,normal,high,urgent',
            'status' => 'sometimes|in:open,matched,closed,cancelled',
        ]);

        $buyerRequest->update($data);

        return response()->json($buyerRequest->fresh());
    }

    public function destroy(Request $request, string $id)
    {
        $buyerRequest = BuyerRequest::where('user_id', $request->user()->id)->findOrFail($id);
        $buyerRequest->delete();

        return response()->json(['success' => true]);
    }

    public function respond(Request $request, string $id)
    {
        $buyerRequest = BuyerRequest::findOrFail($id);

        $data = $request->validate([
            'message' => 'required|string|min:10|max:2000',
            'proposed_price' => 'sometimes|nullable|numeric|min:0',
            'availability' => 'sometimes|string|max:100',
        ]);

        $response = $buyerRequest->responses()->create([
            'user_id' => $request->user()->id,
            'message' => $data['message'],
            'proposed_price' => $data['proposed_price'] ?? null,
            'availability' => $data['availability'] ?? null,
        ]);

        return response()->json($response->load('user'), 201);
    }

    public function responses(Request $request, string $id)
    {
        $buyerRequest = BuyerRequest::where('user_id', $request->user()->id)->findOrFail($id);

        $responses = BuyerRequestResponse::where('buyer_request_id', $id)
            ->with('user')
            ->latest()
            ->get();

        return response()->json($responses);
    }
}