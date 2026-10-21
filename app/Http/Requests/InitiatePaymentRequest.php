<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InitiatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:1', 'max:10000000'],
            'purpose' => ['required', 'string', 'in:test_payment'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
