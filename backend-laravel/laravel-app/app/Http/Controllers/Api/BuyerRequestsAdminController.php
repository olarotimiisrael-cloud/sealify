<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BuyerRequest;
use App\Models\BuyerRequestResponse;
use Illuminate\Http\Request;

class BuyerRequestsAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = BuyerRequest::with(['user', 'category', 'responses.user'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->paginate(20);

        return response()->json($query);
    }

    public function update(Request $request, string $id)
    {
        $buyerRequest = BuyerRequest::findOrFail($id);

        $data = $request->validate([
            'status' => 'sometimes|in:open,matched,closed,cancelled,flagged',
            'admin_notes' => 'sometimes|nullable|string',
        ]);

        $buyerRequest->update($data);

        return response()->json($buyerRequest->fresh());
    }

    public function delete(Request $request, string $id)
    {
        $buyerRequest = BuyerRequest::findOrFail($id);
        $buyerRequest->delete();

        return response()->json(['success' => true]);
    }

    public function bulk(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'string|max:100',
            'action' => 'required|in:close,flag,delete,open',
        ]);

        $requests = BuyerRequest::whereIn('id', $data['ids'])->get();

        foreach ($requests as $request) {
            switch ($data['action']) {
                case 'close':
                    $request->update(['status' => 'closed']);
                    break;
                case 'flag':
                    $request->update(['status' => 'flagged']);
                    break;
                case 'delete':
                    $request->delete();
                    break;
                case 'open':
                    $request->update(['status' => 'open']);
                    break;
            }
        }

        return response()->json(['success' => true, 'updated' => count($requests)]);
    }
}