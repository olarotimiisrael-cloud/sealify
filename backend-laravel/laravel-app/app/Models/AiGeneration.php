<?php

namespace App\Models;

class AiGeneration extends SealifyModel
{
    protected $table = 'ai_generations';

    protected $casts = [
        'parameters' => 'array',
        'result' => 'array',
    ];
}