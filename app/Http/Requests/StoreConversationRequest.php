<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'recipient_id' => ['required', 'integer', 'exists:users,id', 'different:'.$this->user()->id],
            'listing_id' => ['nullable', 'integer', 'exists:listings,id'],
            'message' => ['sometimes', 'string', 'max:2000'],
        ];
    }
}
