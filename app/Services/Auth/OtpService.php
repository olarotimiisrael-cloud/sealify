<?php

namespace App\Services\Auth;

use App\Mail\OtpCodeMail;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    public const PURPOSE_EMAIL_VERIFICATION = 'email_verification';

    public const PURPOSE_PASSWORD_RESET = 'password_reset';

    public const CODE_LENGTH = 6;

    public const CODE_TTL_MINUTES = 10;

    public const MAX_ATTEMPTS = 5;

    public const RESEND_COOLDOWN = 60; // seconds

    public function issue(User $user, string $purpose): string
    {
        $this->guardResendCooldown($user, $purpose);
        $this->invalidateActive($user, $purpose);

        $code = $this->generateCode();

        OtpCode::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'code' => Hash::make($code),
            'purpose' => $purpose,
            'attempts' => 0,
            'expires_at' => Carbon::now()->addMinutes(self::CODE_TTL_MINUTES),
        ]);

        Mail::to($user->email)->send(
            new OtpCodeMail($code, $purpose, $user->name)
        );

        return $code;
    }

    public function verify(User $user, string $purpose, string $submittedCode): bool
    {
        $otp = OtpCode::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->latest('id')
            ->first();

        if (! $otp || ! $otp->isUsable()) {
            return false;
        }

        if (! Hash::check($submittedCode, $otp->code)) {
            $otp->increment('attempts');

            return false;
        }

        $otp->forceFill(['consumed_at' => Carbon::now()])->save();

        return true;
    }

    protected function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), self::CODE_LENGTH, '0', STR_PAD_LEFT);
    }

    protected function invalidateActive(User $user, string $purpose): void
    {
        OtpCode::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => Carbon::now()]);
    }

    protected function guardResendCooldown(User $user, string $purpose): void
    {
        $recent = OtpCode::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->where('created_at', '>', Carbon::now()->subSeconds(self::RESEND_COOLDOWN))
            ->exists();

        if ($recent) {
            abort(response()->json([
                'message' => 'Please wait before requesting another code.',
            ], 429));
        }
    }
}
