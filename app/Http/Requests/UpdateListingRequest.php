<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'title' => ['sometimes', 'string', 'max:150'],
            'description' => ['sometimes', 'string', 'min:20', 'max:5000'],
            'price' => ['sometimes', 'numeric', 'min:0', 'max:999999999.99'],
            'price_negotiable' => ['sometimes', 'boolean'],
            'condition' => [
                'sometimes',
                'string',
                'in:new,like_new,good,fair,needs_repair',
            ],
            'location' => ['sometimes', 'string', 'max:120'],
            'status' => ['sometimes', 'string', 'in:draft,active,sold,archived'],
        ];
    }
}
