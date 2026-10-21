<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DevWalletController extends Controller
{
    public function credit(Request $request): JsonResponse
    {
        abort_unless(app()->environment('local', 'testing'), 404);

        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'description' => ['nullable', 'string', 'max:200'],
        ]);

        $user = $request->user();

        $result = DB::transaction(function () use ($user, $data) {
            $locked = User::lockForUpdate()->find($user->id);
            $new = $locked->balance + $data['amount'];
            $locked->forceFill(['balance' => $new])->save();

            WalletTransaction::create([
                'user_id' => $locked->id,
                'type' => 'credit',
                'amount' => $data['amount'],
                'balance_after' => $new,
                'description' => $data['description'] ?? 'Dev credit',
            ]);

            return $new;
        });

        return response()->json([
            'message' => 'Balance credited (dev only).',
            'balance' => $result,
        ]);
    }
}
