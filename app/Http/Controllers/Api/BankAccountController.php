<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BankAccount\StoreBankAccountRequest;
use App\Http\Requests\BankAccount\UpdateBankAccountRequest;
use App\Http\Resources\BankAccountResource;
use App\Models\BankAccount;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BankAccountController extends Controller
{
    public function __construct(private PaystackService $paystack) {}

    public function banks(): JsonResponse
    {
        return response()->json([
            'data' => $this->paystack->listBanks(),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $accounts = $request->user()
            ->bankAccounts()
            ->orderByDesc('is_default')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => BankAccountResource::collection($accounts),
        ]);
    }

    public function store(StoreBankAccountRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $existing = BankAccount::where('user_id', $user->id)
            ->where('bank_code', $data['bank_code'])
            ->where('account_number', $data['account_number'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'This bank account is already saved.',
                'data' => new BankAccountResource($existing),
            ], 409);
        }

        $isTestBank = $data['bank_code'] === '001' && ! app()->environment('production');

        $resolved = $this->paystack->resolveAccount(
            $data['account_number'],
            $data['bank_code']
        );

        // Fallback for the official Paystack test bank (001) outside production.
        // Real accounts in production must resolve through Paystack.
        if (! $resolved && $isTestBank) {
            $resolved = [
                'account_name' => 'Test Account '.substr($data['account_number'], -4),
                'account_number' => $data['account_number'],
            ];
        }

        if (! $resolved || ! $resolved['account_name']) {
            return response()->json([
                'message' => 'We could not verify that account number. Please double-check and try again.',
                'errors' => [
                    'account_number' => ['Account number could not be verified.'],
                ],
            ], 422);
        }

        $banks = collect($this->paystack->listBanks());
        $bank = $banks->firstWhere('code', $data['bank_code']);

        if (! $bank && $isTestBank) {
            $bank = ['code' => '001', 'name' => 'Paystack Test Bank'];
        }

        if (! $bank) {
            return response()->json([
                'message' => 'Unknown bank code.',
                'errors' => ['bank_code' => ['Unknown bank.']],
            ], 422);
        }

        $account = DB::transaction(function () use ($user, $data, $bank, $resolved, $isTestBank) {
            $isFirst = $user->bankAccounts()->count() === 0;
            $isDefault = $isFirst || ($data['set_default'] ?? false);

            if ($isDefault) {
                $user->bankAccounts()->update(['is_default' => false]);
            }

            $account = BankAccount::create([
                'user_id' => $user->id,
                'bank_code' => $data['bank_code'],
                'bank_name' => $bank['name'],
                'account_number' => $data['account_number'],
                'account_name' => $resolved['account_name'],
                'is_default' => $isDefault,
            ]);

            // Skip recipient creation for the test bank — Paystack's transferrecipient
            // API doesn't accept bank_code 001.
            if (! $isTestBank) {
                $recipientCode = $this->paystack->createTransferRecipient(
                    $resolved['account_name'],
                    $data['account_number'],
                    $data['bank_code']
                );

                if ($recipientCode) {
                    $account->forceFill(['recipient_code' => $recipientCode])->save();
                }
            }

            return $account;
        });

        return response()->json([
            'data' => new BankAccountResource($account),
            'message' => 'Bank account added successfully.',
        ], 201);
    }

    public function update(UpdateBankAccountRequest $request, BankAccount $bankAccount): JsonResponse
    {
        if ($bankAccount->user_id !== $request->user()->id) {
            abort(403);
        }

        DB::transaction(function () use ($request, $bankAccount) {
            if ($request->is_default) {
                BankAccount::where('user_id', $request->user()->id)
                    ->where('id', '!=', $bankAccount->id)
                    ->update(['is_default' => false]);
            }

            $bankAccount->forceFill(['is_default' => $request->is_default])->save();
        });

        return response()->json([
            'data' => new BankAccountResource($bankAccount->fresh()),
            'message' => 'Bank account updated.',
        ]);
    }

    public function destroy(Request $request, BankAccount $bankAccount): JsonResponse
    {
        if ($bankAccount->user_id !== $request->user()->id) {
            abort(403);
        }

        $wasDefault = $bankAccount->is_default;
        $bankAccount->delete();

        if ($wasDefault) {
            $next = $request->user()->bankAccounts()->orderByDesc('id')->first();
            if ($next) {
                $next->forceFill(['is_default' => true])->save();
            }
        }

        return response()->json([
            'message' => 'Bank account removed.',
        ]);
    }
}
