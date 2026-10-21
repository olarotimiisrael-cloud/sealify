<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reactionable_type' => ['required', 'string', 'in:' . implode(',', self::ALLOWED_MODELS)],
            'reactionable_id' => ['required'],
            'reaction_type' => ['sometimes', 'string', 'in:like,love,haha,wow,sad,angry'],
        ];
    }

    public const ALLOWED_MODELS = [
        \App\Models\Listing::class,
    ];
}
