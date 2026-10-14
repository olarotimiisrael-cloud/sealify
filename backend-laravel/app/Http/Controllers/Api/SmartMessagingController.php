<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\ScheduledMessage;
use App\Models\User;
use App\Services\SmartMessagingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SmartMessagingController extends Controller
{
    protected $smartMessagingService;

    public function __construct(SmartMessagingService $smartMessagingService)
    {
        $this->smartMessagingService = $smartMessagingService;
    }

    /**
     * Get smart reply suggestions
     */
    public function getSmartReplies(Request $request, $conversationId)
    {
        $user = $request->user();
        $userId = $user->id;

        // Verify user is part of conversation
        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($userId) {
                $query->where('participant_1', $userId)
                    ->orWhere('participant_2', $userId);
            })
            ->firstOrFail();

        // Get recent messages for context
        $recentMessages = Message::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Generate smart replies
        $suggestions = $this->smartMessagingService->generateSmartReplies(
            $request->input('message', ''),
            [
                'conversation_id' => $conversationId,
                'recent_messages' => $recentMessages,
                'user_id' => $userId,
            ]
        );

        return response()->json([
            'suggestions' => $suggestions,
        ], 200);
    }

    /**
     * Schedule a message to be sent later
     */
    public function scheduleMessage(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'content' => 'required|string|max:2000',
            'send_at' => 'required|date|after:now',
        ]);

        $user = $request->user();
        $userId = $user->id;

        // Verify user is part of conversation
        $conversation = Conversation::where('id', $request->input('conversation_id'))
            ->where(function ($query) use ($userId) {
                $query->where('participant_1', $userId)
                    ->orWhere('participant_2', $userId);
            })
            ->firstOrFail();

        // Create scheduled message
        $scheduledMessage = ScheduledMessage::create([
            'id' => Str::uuid(),
            'conversation_id' => $request->input('conversation_id'),
            'content' => $request->input('content'),
            'send_at' => $request->input('send_at'),
            'status' => 'pending',
        ]);

        // Dispatch job to send scheduled message
        dispatch(new \App\Jobs\SendScheduledMessage($scheduledMessage->id))
            ->delay(\Carbon\Carbon::parse($request->input('send_at')));

        return response()->json([
            'scheduled_message' => $scheduledMessage,
        ], 201);
    }

    /**
     * Get scheduled messages for a conversation
     */
    public function getScheduledMessages(Request $request, $conversationId)
    {
        $user = $request->user();
        $userId = $user->id;

        // Verify user is part of conversation
        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($userId) {
                $query->where('participant_1', $userId)
                    ->orWhere('participant_2', $userId);
            })
            ->firstOrFail();

        $scheduledMessages = ScheduledMessage::where('conversation_id', $conversationId)
            ->where('status', 'pending')
            ->orderBy('send_at', 'asc')
            ->get();

        return response()->json([
            'scheduled_messages' => $scheduledMessages,
        ], 200);
    }

    /**
     * Cancel a scheduled message
     */
    public function cancelScheduledMessage(Request $request, $scheduledMessageId)
    {
        $user = $request->user();
        $userId = $user->id;

        $scheduledMessage = ScheduledMessage::where('id', $scheduledMessageId)
            ->whereHas('conversation', function ($query) use ($userId) {
                $query->where(function ($q) use ($userId) {
                    $q->where('participant_1', $userId)
                        ->orWhere('participant_2', $userId);
                });
            })
            ->firstOrFail();

        $scheduledMessage->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Scheduled message cancelled',
        ], 200);
    }
}