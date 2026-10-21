<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $conversations = Conversation::query()
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with([
                'listing',
                'participants.user',
                'lastMessage.sender',
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->paginate(20);

        // Compute unread count per conversation (N+1 at page-size 20; acceptable for MVP)
        foreach ($conversations as $conv) {
            $me = $conv->participants->firstWhere('user_id', $user->id);

            $conv->unread_count = Message::query()
                ->where('conversation_id', $conv->id)
                ->where('sender_id', '!=', $user->id)
                ->when($me && $me->last_read_at, fn ($q) => $q->where('created_at', '>', $me->last_read_at))
                ->count();
        }

        return ConversationResource::collection($conversations);
    }

    public function show(Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $conversation->load(['listing', 'participants.user', 'lastMessage.sender']);

        return response()->json([
            'data' => new ConversationResource($conversation),
        ]);
    }

    public function store(StoreConversationRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // Reuse an existing 1:1 conversation for the same listing + same two users, if one exists
        $existing = Conversation::query()
            ->when($data['listing_id'] ?? null,
                fn ($q, $listingId) => $q->where('listing_id', $listingId),
                fn ($q) => $q->whereNull('listing_id')
            )
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->whereHas('participants', fn ($q) => $q->where('user_id', $data['recipient_id']))
            ->withCount('participants')
            ->having('participants_count', 2)
            ->first();

        if ($existing) {
            $existing->load(['listing', 'participants.user', 'lastMessage.sender']);

            return response()->json([
                'data' => new ConversationResource($existing),
                'message' => 'Conversation already exists.',
            ]);
        }

        $conversation = DB::transaction(function () use ($user, $data) {
            $conversation = Conversation::create([
                'listing_id' => $data['listing_id'] ?? null,
                'created_by' => $user->id,
                'last_message_at' => now(),
            ]);

            ConversationParticipant::insert([
                [
                    'conversation_id' => $conversation->id,
                    'user_id' => $user->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'conversation_id' => $conversation->id,
                    'user_id' => $data['recipient_id'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            if (! empty($data['message'])) {
                Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $user->id,
                    'body' => $data['message'],
                    'type' => 'text',
                ]);
            }

            return $conversation;
        });

        $conversation->load(['listing', 'participants.user', 'lastMessage.sender']);

        return response()->json([
            'data' => new ConversationResource($conversation),
            'message' => 'Conversation started.',
        ], 201);
    }

    public function markRead(Conversation $conversation): JsonResponse
    {
        Gate::authorize('view', $conversation);

        ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', request()->user()->id)
            ->update(['last_read_at' => now()]);

        return response()->json([
            'message' => 'Conversation marked as read.',
        ]);
    }
}
