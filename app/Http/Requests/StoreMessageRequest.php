<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['nullable', 'string', 'max:2000'],
            'reply_to_id' => ['nullable', 'uuid', 'exists:messages,id'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => [
                'file',
                'max:20480', // 20 MB per file
                'mimes:jpg,jpeg,png,gif,webp,mp3,mp4,m4a,wav,ogg,webm,amr,pdf,doc,docx,xls,xlsx,ppt,pptx,zip,txt',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $hasBody = trim((string) $this->input('body')) !== '';
            $hasFiles = ! empty($this->file('attachments'));

            if (! $hasBody && ! $hasFiles) {
                $v->errors()->add(
                    'body',
                    'Either a message body or at least one attachment is required.'
                );
            }
        });
    }
}
