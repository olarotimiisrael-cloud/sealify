<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Listing;
use App\Models\Promotion;
use App\Models\User;
use Carbon\Carbon;

// Get some active listings
$listings = Listing::active()->latest()->take(5)->get();
if ($listings->isEmpty()) {
    echo "No active listings found\n";
    exit;
}

// Get a user (first user or create one)
$user = User::first();
if (!$user) {
    echo "No user found\n";
    exit;
}

foreach ($listings as $index => $listing) {
    // Check if already has active promotion
    if ($listing->activePromotion) {
        echo "Listing {$listing->id} ({$listing->title}) already has active promotion\n";
        continue;
    }

    $promo = Promotion::create([
        'listing_id' => $listing->id,
        'user_id' => $user->id,
        'starts_at' => Carbon::now()->subHour(),
        'ends_at' => Carbon::now()->addDays(7),
        'is_free_trial' => true,
        'status' => 'active',
    ]);

    echo "Created promotion id={$promo->id} for listing {$listing->id} ({$listing->title})\n";
}

echo "Done.\n";