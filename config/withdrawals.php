<?php

return [
    'min_amount' => (float) env('WITHDRAWAL_MIN_AMOUNT', 1000),
    'fee' => (float) env('WITHDRAWAL_FEE', 50),
];
