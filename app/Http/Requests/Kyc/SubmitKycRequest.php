<?php

namespace App\Http\Requests\Kyc;

use Illuminate\Foundation\Http\FormRequest;

class SubmitKycRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:nin,bvn,cac,drivers_license,voters_card'],
            'id_number' => ['required', 'string', 'min:8', 'max:20'],
            'first_name' => ['required_unless:type,cac', 'string', 'max:100'],
            'last_name' => ['required_unless:type,cac', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
        ];
    }
}
