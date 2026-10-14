<?php

return [

    // FFmpeg Configuration
    'ffmpeg' => [
        'path' => '/usr/bin/ffmpeg',
        'timeout' => 300,
    ],

    // OpenAI Configuration
    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => 'gpt-4',
        'temperature' => 0.3,
    ],

    // Video Processing Quality Settings
    'video_quality' => [
        'default_quality' => '1080p30fps',
        'supported_qualities' => [
            '720p30fps' => ['width' => 1280, 'height' => 720, 'frameRate' => 30],
            '1080p30fps' => ['width' => 1920, 'height' => 1080, 'frameRate' => 30],
            '1080p60fps' => ['width' => 1920, 'height' => 1080, 'frameRate' => 60],
            '4k30fps' => ['width' => 3840, 'height' => 2160, 'frameRate' => 30],
        ],
    ],

    // Safety Configuration
    'safety' => [
        'report_count_threshold_medium' => 3,
        'report_count_threshold_high' => 7,
        'report_count_threshold_critical' => 12,
        'risk_score_medium' => 3.00,
        'risk_score_high' => 7.00,
        'risk_score_critical' => 12.00,
        'auto_restriction_high' => true,
        'auto_restriction_critical' => true,
        'warning_email_enabled' => true,
        'warning_in_app_enabled' => true,
    ],

    // MediaSoup Configuration
    'mediasoup' => [
        'router' => [
            'internal_ip' => env('MEDIASoup_INTERNAL_IP'),
            'external_ip' => env('MEDIASoup_EXTERNAL_IP'),
        ],
    ],

    // Storage Configuration
    'filesystems' => [
        'default' => env('FILESYSTEM_DEFAULT', 'local'),
    ],

    // Redis Configuration
    'cache' => [
        'store' => 'redis',
        'prefix' => 'sealify_',
    ],

    // Job Processing Configuration
    'jobs' => [
        'retry_backoff' => [10, 60, 300], // seconds
        'max_retries' => 3,
        'timeout_seconds' => 300,
    ],

    // Flutterwave Configuration
    'flutterwave' => [
        'public_key' => env('FLUTTERWAVE_PUBLIC_KEY', 'FLWPUB_'),
        'secret_key' => env('FLUTTERWAVE_SECRET_KEY', 'FLWSECRET_'),
        'base_url' => 'https://api.flutterwave.com/v3',
        'payment_link' => env('FLUTTERWAVE_PAYMENT_LINK', 'https://flutterwave.com/pay/8eqijxd7cmv1'),
    ],

];