<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'provider_reference' => $this->provider_reference,
            'provider' => $this->provider,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'purpose' => $this->purpose,
            'status' => $this->status,
            'metadata' => $this->metadata,
            'error_message' => $this->error_message,
            'paid_at' => $this->paid_at,
            'failed_at' => $this->failed_at,
            'expires_at' => $this->expires_at,
            'created_at' => $this->created_at,
        ];
    }
}
