<?php

return [
    'price' => (float) env('PROMOTION_PRICE', 500),
    'duration_days' => (int) env('PROMOTION_DURATION_DAYS', 7),

    // Referral-based free promotion
    'referral' => [
        'free_promotion_referrals' => (int) env('REFERRAL_FREE_PROMOTION_REFERRALS', 10), // 10 referrals = 1 week free
        'free_promotion_duration_days' => (int) env('REFERRAL_FREE_PROMOTION_DAYS', 7),
        'double_free_promotion_referrals' => (int) env('REFERRAL_DOUBLE_FREE_PROMOTION_REFERRALS', 20), // 20 referrals = 2 weeks free
        'double_free_promotion_duration_days' => (int) env('REFERRAL_DOUBLE_FREE_PROMOTION_DAYS', 14),
        'wallet_name' => 'promotion_credits',
    ],

    // Manual payment details shown to users for ad promotion (bank transfer etc.)
    'manual' => [
        'bank_name' => env('PROMOTION_BANK_NAME', 'Sealify Nigeria'),
        'account_number' => env('PROMOTION_ACCOUNT_NUMBER', '0123456789'),
        'account_name' => env('PROMOTION_ACCOUNT_NAME', 'Sealify Nigeria Ltd'),
        'methods' => ['bank_transfer', 'ussd', 'pos', 'cash_deposit'],
        'support_email' => env('PROMOTION_SUPPORT_EMAIL', 'support@sealify.com.ng'),
    ],
];
