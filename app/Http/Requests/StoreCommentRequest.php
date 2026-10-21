<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'commentable_type' => ['required', 'string', 'in:' . implode(',', self::ALLOWED_MODELS)],
            'commentable_id' => ['required'],
            'content' => ['required', 'string', 'max:1000'],
            'parent_id' => ['nullable', 'exists:comments,id'],
        ];
    }

    public const ALLOWED_MODELS = [
        \App\Models\Listing::class,
    ];
}
