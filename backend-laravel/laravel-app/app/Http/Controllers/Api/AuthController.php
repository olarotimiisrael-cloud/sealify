<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use App\Models\PasswordRequest;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'full_name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:30',
        ]);

        $user = User::create([
            'name' => $data['full_name'],
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'phone_number' => $data['phone_number'] ?? null,
            'role' => 'buyer',
            'verified' => false,
        ]);

        return response()->json($this->tokenPayload($user), 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return $this->tokenResponse($user);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['success' => true]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|nullable|string|max:30',
            'avatar_url' => 'sometimes|nullable|string|max:500',
            'cover_url' => 'sometimes|nullable|string|max:500',
            'bio' => 'sometimes|nullable|string|max:1000',
            'location' => 'sometimes|string|max:255',
            'business_name' => 'sometimes|nullable|string|max:255',
            'business_category' => 'sometimes|nullable|string|max:255',
            'business_address' => 'sometimes|nullable|string|max:255',
            'cac_number' => 'sometimes|nullable|string|max:100',
            'business_hours' => 'sometimes|nullable|string|max:255',
            'bank_name' => 'sometimes|nullable|string|max:255',
            'account_number' => 'sometimes|nullable|string|max:30',
            'account_name' => 'sometimes|nullable|string|max:255',
            'website_url' => 'sometimes|nullable|string|max:500',
            'instagram_handle' => 'sometimes|nullable|string|max:100',
            'twitter_handle' => 'sometimes|nullable|string|max:100',
            'whatsapp_number' => 'sometimes|nullable|string|max:30',
            'email_notifications' => 'sometimes|boolean',
            'whatsapp_notifications' => 'sometimes|boolean',
            'hide_phone_publicly' => 'sometimes|boolean',
            'hide_location_publicly' => 'sometimes|boolean',
        ]);

        if (isset($data['full_name'])) {
            $data['name'] = $data['full_name'];
        }

        $user->update($data);

        return response()->json($user->fresh());
    }

    private function tokenResponse(User $user)
    {
        return response()->json($this->tokenPayload($user));
    }

    private function tokenPayload(User $user): array
    {
        $token = $user->createToken('sealify-spa')->plainTextToken;

        return [
            'access_token' => $token,
            'refresh_token' => '',
            'expires_in' => now()->diffInSeconds(now()->addMonth()),
            'token_type' => 'Bearer',
            'user' => $user,
        ];
    }

    /**
     * Initiate a password reset email send.
     */
    public function requestPasswordReset(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // If user not found, still proceed (to avoid user enumeration)
        // Create a password reset request record
        PasswordRequest::create([
            'user_id' => $user->id ?? null,
            'user_email' => $user->email ?? '',
            'user_name' => $user->name ?? $user->full_name ?? '',
            'reset_token' => Str::random(60),
            'reset_expires_at' => now()->addHour(),
            'status' => 'pending',
        ]);

        return response()->json(['success' => true, 'message' => 'Password reset link sent to your email.']);
    }

    /**
     * Reset the user's password using a token.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|min:8',
        ]);

        $resetRequest = PasswordRequest::where('reset_token', $request->token)->first();

        if (!$resetRequest) {
            return response()->json(['success' => false, 'message' => 'Invalid token.'], 401);
        }

        if ($resetRequest->reset_expires_at->isPast() || $resetRequest->used_at !== null) {
            return response()->json(['success' => false, 'message' => 'Token expired or already used.'], 401);
        }

        // Update the user's password
        $user = User::findOrFail($resetRequest->user_id);
        $user->forceFill([
            'password' => Hash::make($request->password),
        ])->save();

        // Mark the reset request as used
        $resetRequest->update([
            'used_at' => now(),
            'status' => 'used',
        ]);

        return response()->json(['success' => true, 'message' => 'Password has been reset.']);
    }
}