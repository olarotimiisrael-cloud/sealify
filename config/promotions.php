<?php

return [
    'price' => (float) env('PROMOTION_PRICE', 500),
    'duration_days' => (int) env('PROMOTION_DURATION_DAYS', 7),
];
