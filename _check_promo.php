<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo 'Promotions total: ' . App\Models\Promotion::count() . PHP_EOL;
echo 'Active (scope): ' . App\Models\Promotion::active()->count() . PHP_EOL;
echo 'Promoted listings: ' . App\Models\Listing::active()->whereHas('activePromotion')->count() . PHP_EOL;

foreach (App\Models\Promotion::limit(10)->get() as $p) {
    echo "Promo id={$p->id} listing_id={$p->listing_id} status={$p->status} ends_at={$p->ends_at}" . PHP_EOL;
}
