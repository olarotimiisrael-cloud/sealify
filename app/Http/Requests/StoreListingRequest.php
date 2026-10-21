<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'min:20', 'max:5000'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'price_negotiable' => ['sometimes', 'boolean'],
            'condition' => [
                'required',
                'string',
                'in:new,like_new,good,fair,needs_repair',
            ],
            'location' => ['required', 'string', 'max:120'],
            'status' => ['sometimes', 'string', 'in:draft,active'],
        ];
    }
}
