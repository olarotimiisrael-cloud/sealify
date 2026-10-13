<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    public function conversations(Request $request)
    {
        $userId = $request->user()->id;

        $conversations = Conversation::query()
            ->with([
                'messages' => fn ($q) => $q->latest()->limit(1),
            ])
            ->where('participant_1', $userId)
            ->orWhere('participant_2', $userId)
            ->orderByDesc('last_message_time')
            ->get()
            ->map(function (Conversation $conversation) use ($userId) {
                $isFirst = (int) $conversation->participant_1 === (int) $userId;
                $conversation->other_user_id = $isFirst ? $conversation->participant_2 : $conversation->participant_1;
                $conversation->unread_count = $isFirst ? $conversation->unread_count_1 : $conversation->unread_count_2;

                return $conversation;
            });

        return response()->json(['conversations' => $conversations]);
    }

    public function messages(string $id)
    {
        $conversation = Conversation::findOrFail($id);

        $messages = Message::where('conversation_id', $conversation->id)
            ->orderBy('created_at')
            ->get();

        return response()->json(['messages' => $messages]);
    }

    public function store(Request $request, string $id)
    {
        $data = $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $conversation = Conversation::findOrFail($id);
        $userId = $request->user()->id;

        $isFirst = (int) $conversation->participant_1 === (int) $userId;
        $receiverId = $isFirst ? $conversation->participant_2 : $conversation->participant_1;

        $message = DB::transaction(function () use ($conversation, $request, $userId, $receiverId, $data, $isFirst) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $userId,
                'receiver_id' => $receiverId,
                'ad_id' => $conversation->ad_id,
                'content' => $data['content'],
            ]);

            $conversation->update([
                'last_message' => $data['content'],
                'last_message_time' => now(),
                'unread_count_1' => $isFirst ? 0 : $conversation->unread_count_1 + 1,
                'unread_count_2' => $isFirst ? $conversation->unread_count_2 + 1 : 0,
            ]);

            return $message;
        });

        return response()->json($message, 201);
    }
}
