<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResendVerificationRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Auth\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private OtpService $otp) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());
        $user->refresh();

        $this->otp->issue($user, OtpService::PURPOSE_EMAIL_VERIFICATION);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'requires_email_verification' => true,
            ],
            'message' => 'Registration successful. Check your email for a 6-digit verification code.',
        ], 201);
    }

    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['We could not find an account with that email.'],
            ]);
        }

        if ($user->email_verified_at !== null) {
            return response()->json([
                'message' => 'Email is already verified. You can log in.',
            ]);
        }

        $ok = $this->otp->verify($user, OtpService::PURPOSE_EMAIL_VERIFICATION, $request->code);

        if (! $ok) {
            throw ValidationException::withMessages([
                'code' => ['The code is invalid or has expired.'],
            ]);
        }

        $user->forceFill(['email_verified_at' => now()])->save();

        return response()->json([
            'message' => 'Email verified successfully. You can now log in.',
        ]);
    }

    public function resendVerification(ResendVerificationRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || $user->email_verified_at !== null) {
            return response()->json([
                'message' => 'If your email is unverified, a new code has been sent.',
            ]);
        }

        $this->otp->issue($user, OtpService::PURPOSE_EMAIL_VERIFICATION);

        return response()->json([
            'message' => 'A new verification code has been sent to your email.',
        ]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->isActive()) {
            throw ValidationException::withMessages([
                'email' => ['This account is not active. Contact support.'],
            ]);
        }

        if ($user->email_verified_at === null) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your email before logging in.'],
            ])->status(403);
        }

        $user->forceFill(['last_seen_at' => now()])->save();

        $token = $user->createToken('user')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
            'message' => 'Login successful.',
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'message' => 'If an account exists for that email, a reset code has been sent.',
            ]);
        }

        $this->otp->issue($user, OtpService::PURPOSE_PASSWORD_RESET);

        return response()->json([
            'message' => 'A password reset code has been sent to your email.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['We could not find an account with that email.'],
            ]);
        }

        $ok = $this->otp->verify($user, OtpService::PURPOSE_PASSWORD_RESET, $request->code);

        if (! $ok) {
            throw ValidationException::withMessages([
                'code' => ['The code is invalid or has expired.'],
            ]);
        }

        DB::transaction(function () use ($user, $request) {
            $user->forceFill(['password' => $request->password])->save();
            $user->tokens()->delete();
        });

        return response()->json([
            'message' => 'Password reset successfully. You can now log in with your new password.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }
}
