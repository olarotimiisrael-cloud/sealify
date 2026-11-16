<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Requests\Auth\ResendVerificationRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Services\Auth\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private OtpService $otp) {}

    public function showLogin() { return view('auth.login'); }

    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'The provided credentials are incorrect.',
            ])->withInput();
        }

        $request->session()->regenerate();

        $user = Auth::user();
        if (! $user->isActive()) {
            Auth::logout();
            return back()->withErrors(['email' => 'This account is not active. Contact support.'])->withInput();
        }
        if ($user->email_verified_at === null) {
            Auth::logout();
            return back()->withErrors(['email' => 'Please verify your email before logging in.'])->withInput();
        }

        return redirect()->intended(route('home'))->with('status', 'Welcome back, '.$user->name.'!');
    }

    public function showRegister(Request $request, ?string $referral_code = null)
    {
        $code = $referral_code ?? $request->query('ref');

        return view('auth.register', ['referralCode' => $code]);
    }

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $referrer = null;
        if (! empty($data['referral_code'])) {
            $referrer = User::where('referral_code', $data['referral_code'])->first();
        }

        $user = User::create(array_merge($data, [
            'password' => Hash::make($data['password']),
        ]));

        if ($referrer) {
            $user->referrals()->create([
                'referrer_id' => $referrer->id,
                'code' => $referrer->referral_code,
                'status' => 'pending',
                'reward_amount' => 0,
            ]);
        }

        $user->refresh();

        $this->otp->issue($user, OtpService::PURPOSE_EMAIL_VERIFICATION);

        $referralMessage = $referrer
            ? 'Registration successful via referral. Check your email for a 6-digit verification code.'
            : 'Registration successful. Check your email for a 6-digit verification code.';

        return redirect()->route('verify')->with('status', $referralMessage);
    }

    public function showVerify() { return view('auth.verify'); }

    public function verifyEmail(VerifyEmailRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return back()->withErrors(['email' => 'We could not find an account with that email.'])->withInput();
        }
        if ($user->email_verified_at !== null) {
            return redirect()->route('login')->with('status', 'Email is already verified. You can log in.');
        }

        $ok = $this->otp->verify($user, OtpService::PURPOSE_EMAIL_VERIFICATION, $request->code);

        if (! $ok) {
            return back()->withErrors(['code' => 'The code is invalid or has expired.'])->withInput();
        }

        $user->forceFill(['email_verified_at' => now()])->save();

        return redirect()->route('login')->with('status', 'Email verified successfully. You can now log in.');
    }

    public function showResend() { return view('auth.resend'); }

    public function resendVerification(ResendVerificationRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || $user->email_verified_at !== null) {
            return back()->with('status', 'If your email is unverified, a new code has been sent.');
        }

        $this->otp->issue($user, OtpService::PURPOSE_EMAIL_VERIFICATION);

        return back()->with('status', 'A new verification code has been sent to your email.');
    }

    public function showForgot() { return view('auth.forgot'); }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return back()->with('status', 'If an account exists for that email, a reset code has been sent.');
        }

        $this->otp->issue($user, OtpService::PURPOSE_PASSWORD_RESET);

        return back()->with('status', 'A password reset code has been sent to your email.');
    }

    public function showReset() { return view('auth.reset'); }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return back()->withErrors(['email' => 'We could not find an account with that email.'])->withInput();
        }

        $ok = $this->otp->verify($user, OtpService::PURPOSE_PASSWORD_RESET, $request->code);

        if (! $ok) {
            return back()->withErrors(['code' => 'The code is invalid or has expired.'])->withInput();
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($user, $request) {
            $user->forceFill(['password' => Hash::make($request->password)])->save();
            $user->tokens()->delete();
        });

        return redirect()->route('login')->with('status', 'Password reset successfully. You can now log in.');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('home')->with('status', 'Logged out.');
    }

    public function googleRedirect(Request $request)
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

        return Redirect::to('https://accounts.google.com/o/oauth2/v2/auth?'.$query);
    }

    public function appleRedirect(Request $request)
    {
        $clientId = config('services.apple.client_id');
        $redirectUri = config('services.apple.redirect');
        $state = Str::random(32);
        $request->session()->put('oauth_state', $state);
        $request->session()->put('oauth_provider', 'apple');

        $query = http_build_query([
            'client_id'     => $clientId,
            'redirect_uri'  => $redirectUri,
            'response_type' => 'code',
            'scope'         => 'name email',
            'language'      => 'en',
            'state'         => $state,
        ]);

        return Redirect::to('https://appleid.apple.com/auth/authorize?'.$query);
    }

    public function googleCallback(Request $request)
    {
        $state = $request->session()->pull('oauth_state');
        if (! $state || $state !== $request->query('state')) {
            return back()->withErrors(['state' => 'Invalid OAuth state. Please try again.']);
        }

        $code = $request->query('code');
        if (! $code) {
            return back()->withErrors(['code' => 'No authorization code returned from Google.']);
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
            return back()->withErrors(['google' => 'Unable to exchange authorization code with Google.']);
        }

        $tokens = $tokenResponse->json();
        $accessToken = $tokens['access_token'] ?? null;

        if (! $accessToken) {
            return back()->withErrors(['google' => 'No access token returned from Google.']);
        }

        $profileResponse = Http::withToken($accessToken)->get('https://www.googleapis.com/oauth2/v2/userinfo');

        if (! $profileResponse->ok()) {
            return back()->withErrors(['google' => 'Unable to fetch profile from Google.']);
        }

        $profile = $profileResponse->json();
        $googleId = $profile['id'] ?? null;
        $email = $profile['email'] ?? null;
        $name = $profile['name'] ?? $email;
        $picture = $profile['picture'] ?? null;

        if (! $googleId || ! $email) {
            return back()->withErrors(['google' => 'Google profile is missing required fields.']);
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($googleId, $email, $name, $picture) {
            $user = User::where('email', $email)->first();

            if (! $user) {
                $user = User::create([
                    'name'             => $name,
                    'email'            => $email,
                    'password'         => Str::random(60),
                    'email_verified_at'=> now(),
                    'avatar_url'       => $picture,
                    'google_id'        => $googleId,
                ]);
            } else {
                $user->forceFill(['google_id' => $googleId])->save();
            }

            $credentials = $user->verified_credentials ?? [];
            $credentials['google'] = [
                'provider' => 'google',
                'provider_id' => $googleId,
                'connected_at' => now()->toISOString(),
            ];
            $user->forceFill(['verified_credentials' => $credentials])->save();
            $user->forceFill(['last_seen_at' => now()])->save();

            Auth::login($user);

            return redirect()->route('home')->with('status', 'Signed in with Google.');
        });
    }

    public function appleCallback(Request $request)
    {
        $state = $request->session()->pull('oauth_state');
        if (! $state || $state !== $request->query('state')) {
            return back()->withErrors(['state' => 'Invalid OAuth state. Please try again.']);
        }

        $code = $request->query('code');
        if (! $code) {
            return back()->withErrors(['code' => 'No authorization code returned from Apple.']);
        }

        $clientId = config('services.apple.client_id');
        $clientSecret = config('services.apple.client_secret');
        $redirectUri = config('services.apple.redirect');

        $tokenResponse = Http::asJson()->post('https://appleid.apple.com/auth/token', [
            'grant_type'    => 'authorization_code',
            'code'          => $code,
            'redirect_uri'  => $redirectUri,
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
        ]);

        if (! $tokenResponse->ok()) {
            Log::warning('Apple OAuth token exchange failed', ['body' => $tokenResponse->body()]);
            return back()->withErrors(['apple' => 'Unable to exchange authorization code with Apple.']);
        }

        $tokens = $tokenResponse->json();
        $idToken = $tokens['id_token'] ?? null;

        if (! $idToken) {
            return back()->withErrors(['apple' => 'No ID token returned from Apple.']);
        }

        $parts = explode('.', $idToken);
        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]).str_repeat('=', 4 - strlen($parts[1]) % 4)), true);
        $appleId = $payload['sub'] ?? null;
        $email = $payload['email'] ?? null;
        $name = $payload['name'] ?? $payload['email'];

        if (! $appleId || ! $email) {
            return back()->withErrors(['apple' => 'Apple profile is missing required fields.']);
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($appleId, $email, $name) {
            $user = User::where('email', $email)->first();

            if (! $user) {
                $user = User::create([
                    'name'             => $name,
                    'email'            => $email,
                    'password'         => Str::random(60),
                    'email_verified_at'=> now(),
                    'apple_id'         => $appleId,
                ]);
            } else {
                $user->forceFill(['apple_id' => $appleId])->save();
            }

            $credentials = $user->verified_credentials ?? [];
            $credentials['apple'] = [
                'provider' => 'apple',
                'provider_id' => $appleId,
                'connected_at' => now()->toISOString(),
            ];
            $user->forceFill(['verified_credentials' => $credentials])->save();
            $user->forceFill(['last_seen_at' => now()])->save();

            Auth::login($user);

            return redirect()->route('home')->with('status', 'Signed in with Apple.');
        });
    }
}
