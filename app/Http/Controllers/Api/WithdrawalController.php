<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Withdrawal\StoreWithdrawalRequest;
use App\Models\BankAccount;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WithdrawalController extends Controller
{
    public function index(Request $request)
    {
        $withdrawals = $request->user()
            ->withdrawals()
            ->with('bankAccount')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json(['data' => $withdrawals]);
    }

    public function show(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        if ($withdrawal->user_id !== $request->user()->id) {
            abort(403);
        }

        $withdrawal->load('bankAccount');

        return response()->json(['data' => $withdrawal]);
    }

    public function store(StoreWithdrawalRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $amount = (float) $data['amount'];
        $fee = (float) config('withdrawals.fee', 50);
        $net = $amount - $fee;

        if ($fee >= $amount) {
            return response()->json([
                'message' => 'Amount is too small after fees.',
            ], 422);
        }

        $bankAccount = BankAccount::where('id', $data['bank_account_id'])
            ->where('user_id', $user->id)
            ->first();

        if (! $bankAccount) {
            return response()->json([
                'message' => 'Bank account not found or does not belong to you.',
            ], 404);
        }

        if ($bankAccount->recipient_code === null) {
            return response()->json([
                'message' => 'This bank account is not yet verified for payouts. Remove and re-add it, or try a different bank account.',
            ], 422);
        }

        // Check balance and lock for updates
        $withdrawal = DB::transaction(function () use ($user, $bankAccount, $amount, $fee, $net) {
            $locked = User::lockForUpdate()->find($user->id);

            if ($locked->balance < $amount) {
                abort(response()->json([
                    'message' => 'Insufficient balance.',
                    'balance' => $locked->balance,
                ], 422));
            }

            // Deduct immediately (hold)
            $newBalance = $locked->balance - $amount;
            $locked->forceFill(['balance' => $newBalance])->save();

            WalletTransaction::create([
                'user_id' => $locked->id,
                'type' => 'debit',
                'amount' => $amount,
                'balance_after' => $newBalance,
                'description' => "Withdrawal request — {$bankAccount->bank_name} {$bankAccount->account_number}",
            ]);

            return Withdrawal::create([
                'user_id' => $locked->id,
                'bank_account_id' => $bankAccount->id,
                'amount' => $amount,
                'fee' => $fee,
                'net_amount' => $net,
                'status' => 'pending',
                'reference' => 'WDR-'.strtoupper(Str::random(14)),
                'provider' => 'paystack',
            ]);
        });

        return response()->json([
            'data' => $withdrawal,
            'message' => 'Withdrawal request submitted. It will be reviewed shortly.',
        ], 201);
    }
}
