<?php

return [

    // Flutterwave Configuration
    'flutterwave' => [
        'public_key' => env('FLUTTERWAVE_PUBLIC_KEY', 'FLWPUB_'),
        'secret_key' => env('FLUTTERWAVE_SECRET_KEY', 'FLWSECRET_'),
        'base_url' => 'https://api.flutterwave.com/v3',
    ],

];