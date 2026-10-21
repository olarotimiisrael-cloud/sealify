<?php

namespace App\Http\Requests\Withdrawal;

use Illuminate\Foundation\Http\FormRequest;

class StoreWithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $min = (float) config('withdrawals.min_amount', 1000);

        return [
            'amount' => ['required', 'numeric', "min:{$min}"],
            'bank_account_id' => ['required', 'integer', 'exists:bank_accounts,id'],
        ];
    }
}
