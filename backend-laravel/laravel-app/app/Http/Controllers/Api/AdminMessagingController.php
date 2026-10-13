<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminMessage;
use App\Models\User;
use Illuminate\Http\Request;

class AdminMessagingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = AdminMessage::with(['sender', 'recipient'])
            ->where('recipient_id', $user->id)
            ->orWhere('sender_id', $user->id)
            ->latest()
            ->paginate(20);

        return response()->json($query);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'priority' => 'sometimes|in:low,normal,high,urgent',
        ]);

        $message = AdminMessage::create([
            'sender_id' => $request->user()->id,
            'recipient_id' => $data['recipient_id'],
            'subject' => $data['subject'],
            'body' => $data['body'],
            'priority' => $data['priority'] ?? 'normal',
            'read_at' => null,
        ]);

        return response()->json($message->load(['sender', 'recipient']), 201);
    }

    public function broadcast(Request $request)
    {
        $data = $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'target_roles' => 'sometimes|array',
            'target_roles.*' => 'in:buyer,seller,admin',
            'target_user_ids' => 'sometimes|array',
            'target_user_ids.*' => 'exists:users,id',
        ]);

        $query = User::query();

        if (!empty($data['target_roles'])) {
            $query->whereIn('role', $data['target_roles']);
        }

        if (!empty($data['target_user_ids'])) {
            $query->whereIn('id', $data['target_user_ids']);
        }

        $users = $query->get();

        $messages = [];
        foreach ($users as $user) {
            $messages[] = AdminMessage::create([
                'sender_id' => $request->user()->id,
                'recipient_id' => $user->id,
                'subject' => $data['subject'],
                'body' => $data['body'],
                'priority' => 'normal',
            ]);
        }

        return response()->json([
            'sent_count' => count($messages),
            'messages' => $messages,
        ]);
    }

    public function markRead(Request $request, string $id)
    {
        $message = AdminMessage::where('recipient_id', $request->user()->id)
            ->findOrFail($id);

        $message->update(['read_at' => now()]);

        return response()->json($message);
    }

    public function markAllRead(Request $request)
    {
        AdminMessage::where('recipient_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}