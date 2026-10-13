<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\Request;

class PushController extends Controller
{
    public function subscribe(Request $request)
    {
        $data = $request->validate([
            'endpoint' => 'required|string|url',
            'keys' => 'required|array',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $subscription = PushSubscription::updateOrCreate(
            ['user_id' => $request->user()->id, 'endpoint' => $data['endpoint']],
            [
                'p256dh' => $data['keys']['p256dh'],
                'auth' => $data['keys']['auth'],
            ]
        );

        return response()->json(['success' => true, 'subscription' => $subscription]);
    }

    public function unsubscribe(Request $request)
    {
        $data = $request->validate([
            'endpoint' => 'required|string|url',
        ]);

        PushSubscription::where('user_id', $request->user()->id)
            ->where('endpoint', $data['endpoint'])
            ->delete();

        return response()->json(['success' => true]);
    }

    public function subscriptions(Request $request)
    {
        $subscriptions = PushSubscription::where('user_id', $request->user()->id)->get();
        return response()->json($subscriptions);
    }

    public function send(Request $request)
    {
        // Admin only - send push notification
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Admin access required'], 403);
        }

        $data = $request->validate([
            'title' => 'required|string|max:100',
            'body' => 'required|string|max:500',
            'icon' => 'sometimes|string|url',
            'target_user_ids' => 'sometimes|array',
            'target_user_ids.*' => 'exists:users,id',
            'target_all' => 'sometimes|boolean',
        ]);

        $query = PushSubscription::query();

        if (!empty($data['target_user_ids'])) {
            $query->whereIn('user_id', $data['target_user_ids']);
        } elseif (!$data['target_all']) {
            return response()->json(['message' => 'Specify target_user_ids or target_all'], 400);
        }

        $subscriptions = $query->get();

        $sent = 0;
        foreach ($subscriptions as $subscription) {
            try {
                $this->sendPushNotification($subscription, $data['title'], $data['body'], $data['icon'] ?? null);
                $sent++;
            } catch (\Exception $e) {
                // Log error but continue
                \Log::error('Push notification failed: ' . $e->getMessage());
            }
        }

        return response()->json(['success' => true, 'sent' => $sent, 'total' => $subscriptions->count()]);
    }

    protected function sendPushNotification(PushSubscription $subscription, string $title, string $body, ?string $icon = null)
    {
        $vapidPublicKey = config('services.push.vapid_public_key');
        $vapidPrivateKey = config('services.push.vapid_private_key');
        
        if (!$vapidPublicKey || !$vapidPrivateKey) {
            throw new \Exception('VAPID keys not configured');
        }

        $payload = json_encode([
            'title' => $title,
            'body' => $body,
            'icon' => $icon ?? config('app.url') . '/icon-192.png',
            'badge' => config('app.url') . '/badge-72.png',
            'data' => [
                'url' => config('app.url'),
                'timestamp' => time(),
            ],
        ]);

        $webPush = new \Minishlink\WebPush\WebPush([
            'VAPID' => [
                'subject' => config('app.url'),
                'publicKey' => $vapidPublicKey,
                'privateKey' => $vapidPrivateKey,
            ],
        ]);

        $webPush->sendNotification(
            \Minishlink\WebPush\Subscription::create([
                'endpoint' => $subscription->endpoint,
                'keys' => [
                    'p256dh' => $subscription->p256dh,
                    'auth' => $subscription->auth,
                ],
            ]),
            $payload
        );

        $webPush->flush();
    }
}