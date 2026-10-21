<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVoiceNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'voice' => ['required', 'file', 'max:20480'], // 20 MB
            'duration_seconds' => ['nullable', 'integer', 'min:1', 'max:3600'],
        ];
    }
}
