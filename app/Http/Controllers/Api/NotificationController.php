<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (Notification $notification): array => $this->present($notification));

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $notifications->where('read', false)->count(),
        ]);
    }

    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 404);

        $notification->forceFill(['read_at' => now()])->save();

        return response()->json($this->present($notification));
    }

    public function markAllRead(Request $request): JsonResponse
    {
        Notification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /** @return array<string, mixed> */
    private function present(Notification $notification): array
    {
        return [...$notification->toArray(), 'read' => $notification->read_at !== null];
    }
}
