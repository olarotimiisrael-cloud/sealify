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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
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

    public function googleRedirect(Request $request): JsonResponse
    {
        $clientId = config('services.google.client_id');
        $redirectUri = config('services.google.redirect');
        $state = Str::random(32);

        $request->session()->put('oauth_state', $state);
        $request->session()->put('oauth_provider', 'google');

        $query = http_build_query([
            'client_id'     => $clientId,
            'redirect_uri'  => $redirectUri,
            'response_type' => 'code',
            'scope'         => 'openid profile email',
            'access_type'   => 'offline',
            'prompt'        => 'consent',
            'state'         => $state,
        ]);

        return Redirect::to('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    public function googleCallback(Request $request): JsonResponse
    {
        $state = $request->session()->pull('oauth_state');
        if (! $state || $state !== $request->query('state')) {
            throw ValidationException::withMessages([
                'state' => ['Invalid OAuth state. Please try again.'],
            ]);
        }

        $code = $request->query('code');
        if (! $code) {
            throw ValidationException::withMessages([
                'code' => ['No authorization code returned from Google.'],
            ]);
        }

        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirectUri = config('services.google.redirect');

        $tokenResponse = Http::asJson()->post('https://oauth2.googleapis.com/token', [
            'code'          => $code,
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri'  => $redirectUri,
            'grant_type'    => 'authorization_code',
        ]);

        if (! $tokenResponse->ok()) {
            Log::warning('Google OAuth token exchange failed', ['body' => $tokenResponse->body()]);
            throw ValidationException::withMessages([
                'google' => ['Unable to exchange authorization code with Google.'],
            ]);
        }

        $tokens = $tokenResponse->json();
        $accessToken = $tokens['access_token'] ?? null;

        if (! $accessToken) {
            throw ValidationException::withMessages([
                'google' => ['No access token returned from Google.'],
            ]);
        }

        $profileResponse = Http::withToken($accessToken)
            ->get('https://www.googleapis.com/oauth2/v2/userinfo');

        if (! $profileResponse->ok()) {
            throw ValidationException::withMessages([
                'google' => ['Unable to fetch profile from Google.'],
            ]);
        }

        $profile = $profileResponse->json();
        $googleId = $profile['id'] ?? null;
        $email = $profile['email'] ?? null;
        $name = $profile['name'] ?? $email;
        $picture = $profile['picture'] ?? null;

        if (! $googleId || ! $email) {
            throw ValidationException::withMessages([
                'google' => ['Google profile is missing required fields.'],
            ]);
        }

        return DB::transaction(function () use ($googleId, $email, $name, $picture) {
            $user = User::where('email', $email)->first();

            if (! $user) {
                $user = User::create([
                    'name'             => $name,
                    'email'            => $email,
                    'password'         => Str::random(60),
                    'email_verified_at'=> now(),
                    'avatar_url'       => $picture,
                ]);
            }

            $credentials = $user->verified_credentials ?? [];
            $credentials['google'] = [
                'provider' => 'google',
                'provider_id' => $googleId,
                'connected_at' => now()->toISOString(),
            ];
            $user->forceFill(['verified_credentials' => $credentials])->save();

            $user->forceFill(['last_seen_at' => now()])->save();

            $token = $user->createToken('user')->plainTextToken;

            $callback = config('services.google.callback_url')
                ?: config('app.frontend_url', 'http://localhost:5173') . '/auth/oauth-callback';

            return Redirect::to($callback . '?token=' . urlencode($token) . '&user=' . urlencode(json_encode([
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'avatar_url' => $user->avatar_url,
            ])));
        });
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
