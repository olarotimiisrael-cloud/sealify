<?php

namespace App\Services;

class TurnCredentialService
{
    public function credentials(int $userId): array
    {
        $secret = config('services.turn.secret') ?: env('TURN_SECRET');
        $urls = (array) config('services.turn.urls', ['stun:stun.l.google.com:19302']);

        if (! $secret) {
            return [
                'iceServers' => array_values(array_map(fn ($url) => ['urls' => $url], $urls)),
                'ttl' => 0,
            ];
        }

        $ttl = (int) (config('services.turn.ttl') ?: 3600);
        $timestamp = time() + $ttl;
        $username = $timestamp . ':' . $userId;
        $password = base64_encode(hash_hmac('sha1', $username, $secret, true));

        $iceServers = array_values(array_map(function ($url) use ($username, $password) {
            return [
                'urls' => $url,
                'username' => $username,
                'credential' => $password,
            ];
        }, $urls));

        return [
            'iceServers' => $iceServers,
            'ttl' => $ttl,
        ];
    }
}
