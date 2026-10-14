<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'ffmpeg' => [
        'path' => env('FFMPEG_PATH', '/usr/bin/ffmpeg'),
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'base_url' => env('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        'temperature' => 0.3,
    ],

    'video_quality' => [
        '' => '360p30fps',
        'low' => '720p30fps',
        'high' => '1080p30fps',
        'adaptive' => true,
    ],

    'safety' => [
        'auto_scan' => env('SAFETY_AUTO_SCAN', true),
        'risk_score_medium' => (int) env('SAFETY_RISK_MEDIUM', 3),
        'risk_score_high' => (int) env('SAFETY_RISK_HIGH', 7),
        'risk_score_critical' => (int) env('SAFETY_RISK_CRITICAL', 12),
        'warning_email_enabled' => env('SAFETY_WARNING_EMAIL', true),
        'auto_restrict' => env('SAFETY_AUTO_RESTRICT', true),
    ],

    'mediasoup' => [
        'announced_ip' => env('MEDIASOUP_ANNOUNCED_IP', '127.0.0.1'),
        'rtc_min_port' => (int) env('MEDIASOUP_RTC_MIN_PORT', 40000),
        'rtc_max_port' => (int) env('MEDIASOUP_RTC_MAX_PORT', 40100),
        'worker_count' => (int) env('MEDIASOUP_WORKERS', 1),
    ],

    'turn' => [
        'secret' => env('TURN_SECRET'),
        'ttl' => (int) env('TURN_TTL', 3600),
        'urls' => array_values(array_filter(array_map('trim', explode(',', (string) env('TURN_URLS', 'stun:stun.l.google.com:19302'))))),
    ],

    'flutterwave' => [
        'public_key' => env('FLUTTERWAVE_PUBLIC_KEY', 'FLWPUB_'),
        'secret_key' => env('FLUTTERWAVE_SECRET_KEY', 'FLWSEC_'),
        'base_url' => 'https://api.flutterwave.com/v3',
        'payment_link' => env('FLUTTERWAVE_PAYMENT_LINK', 'https://flutterwave.com/pay/8eqijxd7cmv1'),
    ],
];
