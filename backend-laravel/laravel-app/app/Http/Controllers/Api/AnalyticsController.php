<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function track(Request $request)
    {
        $data = $request->validate([
            'event' => 'required|string|max:100',
            'properties' => 'sometimes|array',
            'user_id' => 'sometimes|exists:users,id',
            'session_id' => 'sometimes|string',
        ]);

        AnalyticsEvent::create([
            'event' => $data['event'],
            'properties' => $data['properties'] ?? [],
            'user_id' => $data['user_id'] ?? ($request->user()?->id),
            'session_id' => $data['session_id'] ?? $request->header('x-session-id'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->header('referer'),
            'created_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    public function batch(Request $request)
    {
        $data = $request->validate([
            'events' => 'required|array|min:1|max:100',
            'events.*.event' => 'required|string|max:100',
            'events.*.properties' => 'sometimes|array',
            'events.*.timestamp' => 'sometimes|date',
        ]);

        $events = [];
        foreach ($data['events'] as $eventData) {
            $events[] = [
                'event' => $eventData['event'],
                'properties' => $eventData['properties'] ?? [],
                'user_id' => $eventData['user_id'] ?? ($request->user()?->id),
                'session_id' => $eventData['session_id'] ?? $request->header('x-session-id'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $eventData['url'] ?? $request->header('referer'),
                'created_at' => $eventData['timestamp'] ?? now(),
            ];
        }

        AnalyticsEvent::insert($events);

        return response()->json(['success' => true, 'count' => count($events)]);
    }

    public function summary(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->is_admin) {
            return response()->json(['message' => 'Admin access required'], 403);
        }

        $days = $request->input('days', 30);
        $startDate = now()->subDays($days);

        $eventCounts = AnalyticsEvent::where('created_at', '>=', $startDate)
            ->selectRaw('event, count(*) as count')
            ->groupBy('event')
            ->orderByDesc('count')
            ->get();

        $dailyCounts = AnalyticsEvent::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $uniqueUsers = AnalyticsEvent::where('created_at', '>=', $startDate)
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        return response()->json([
            'period_days' => $days,
            'total_events' => AnalyticsEvent::where('created_at', '>=', $startDate)->count(),
            'unique_users' => $uniqueUsers,
            'event_breakdown' => $eventCounts,
            'daily_trend' => $dailyCounts,
        ]);
    }
}