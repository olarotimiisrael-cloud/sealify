<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\MessageAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class MessageController extends Controller
{
    public function index(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $messages = $conversation->messages()
            ->with(['sender', 'attachments', 'parent.sender'])
            ->orderByDesc('id')
            ->paginate(30)
            ->withQueryString();

        return MessageResource::collection($messages);
    }

    public function store(StoreMessageRequest $request, Conversation $conversation): JsonResponse
    {
        Gate::authorize('sendMessage', $conversation);

        $user = $request->user();
        $body = $request->input('body');
        $files = $request->file('attachments', []);

        $type = $this->detectType($files);

        $message = DB::transaction(function () use ($conversation, $user, $body, $files, $type) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'body' => $body,
                'type' => $type,
                'reply_to_id' => $request->input('reply_to_id'),
            ]);

            foreach ($files as $file) {
                $originalName = $file->getClientOriginalName();
                $mime = $file->getMimeType() ?: 'application/octet-stream';
                $size = (int) $file->getSize();

                $ext = strtolower($file->extension() ?: 'bin');
                $name = "msg-{$message->id}-".time().'-'.uniqid().".{$ext}";

                $path = $file->storeAs("messages/{$conversation->id}", $name, 'public');

                MessageAttachment::create([
                    'message_id' => $message->id,
                    'path' => $path,
                    'original_name' => $originalName,
                    'mime_type' => $mime,
                    'size_bytes' => $size,
                ]);
            }

            $conversation->forceFill(['last_message_at' => now()])->save();

            ConversationParticipant::where('conversation_id', $conversation->id)
                ->where('user_id', $user->id)
                ->update(['last_read_at' => now()]);

            return $message;
        });

        $message->load(['sender', 'attachments']);

        return response()->json([
            'data' => new MessageResource($message),
            'message' => 'Message sent.',
        ], 201);
    }

    protected function detectType(array $files): string
    {
        if (empty($files)) {
            return 'text';
        }

        $hasImage = false;
        $hasAudio = false;
        $hasOther = false;

        foreach ($files as $f) {
            $mime = $f->getMimeType() ?: '';
            if (str_starts_with($mime, 'image/')) {
                $hasImage = true;
            } elseif (str_starts_with($mime, 'audio/')) {
                $hasAudio = true;
            } else {
                $hasOther = true;
            }
        }

        if ($hasAudio && ! $hasImage && ! $hasOther && count($files) === 1) {
            return 'voice';
        }
        if ($hasImage && ! $hasAudio && ! $hasOther) {
            return 'image';
        }

        return 'file';
    }
}
