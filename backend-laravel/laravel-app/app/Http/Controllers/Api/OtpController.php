<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailOtp;
use App\Models\PhoneOtp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OtpController extends Controller
{
    public function request(Request $request)
    {
        $data = $request->validate([
            'identifier' => 'required|string|min:3|max:254',
            'channel' => 'sometimes|in:email,phone',
        ]);

        $channel = $data['channel'] ?? 'email';
        $identifier = $this->normalizeIdentifier($data['identifier'], $channel);

        $user = $this->findUserByChannel($channel, $identifier);
        if (!$user) {
            return response()->json(['message' => 'No account found for this identifier'], 404);
        }

        $otp = $this->generateOtp(6);
        $otpHash = $this->hashOtp($otp);
        $expiresAt = now()->addMinutes(10);

        $otpRecord = $this->insertOtp($channel, $identifier, $otpHash, $expiresAt);

        $delivery = $this->sendOtpDelivery($user, $channel, $otp, $otpRecord);

        // Audit log
        DB::table('audit_logs')->insert([
            'user_id' => $user->id,
            'event' => 'OTP Requested',
            'details' => "Channel: {$channel}, identifier: {$identifier}, delivered: " . ($delivery['success'] ? 'true' : 'false'),
            'category' => 'verification',
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'otpId' => $otpRecord->id,
            'channel' => $channel,
            'message' => $delivery['success'] ? 'OTP sent successfully' : 'OTP generated, delivery pending',
        ]);
    }

    public function verify(Request $request)
    {
        $data = $request->validate([
            'identifier' => 'required|string|min:3|max:254',
            'otp' => 'required|string|regex:/^\d{6}$/',
            'otpId' => 'sometimes|string',
            'channel' => 'sometimes|in:email,phone',
        ]);

        $channel = $data['channel'] ?? 'email';
        $identifier = $this->normalizeIdentifier($data['identifier'], $channel);
        $otp = $data['otp'];
        $otpId = $data['otpId'] ?? null;

        $result = $this->verifyOtp($channel, $identifier, $otp, $otpId);

        DB::table('audit_logs')->insert([
            'user_id' => $result['userId'] ?? 'unknown',
            'event' => 'OTP Verified',
            'details' => "Channel: {$channel}",
            'category' => 'verification',
            'created_at' => now(),
        ]);

        return response()->json($result);
    }

    public function resend(Request $request)
    {
        $data = $request->validate([
            'identifier' => 'required|string|min:3|max:254',
            'channel' => 'sometimes|in:email,phone',
        ]);

        $channel = $data['channel'] ?? 'email';
        $identifier = $this->normalizeIdentifier($data['identifier'], $channel);

        $user = $this->findUserByChannel($channel, $identifier);
        if (!$user) {
            return response()->json(['message' => 'No account found for this identifier'], 404);
        }

        $otp = $this->generateOtp(6);
        $otpHash = $this->hashOtp($otp);
        $expiresAt = now()->addMinutes(10);
        $otpRecord = $this->insertOtp($channel, $identifier, $otpHash, $expiresAt);

        $delivery = $this->sendOtpDelivery($user, $channel, $otp, $otpRecord);

        DB::table('audit_logs')->insert([
            'user_id' => $user->id,
            'event' => 'OTP Resent',
            'details' => "Channel: {$channel}",
            'category' => 'verification',
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'otpId' => $otpRecord->id,
            'channel' => $channel,
            'message' => $delivery['success'] ? 'OTP resent successfully' : 'OTP generated, delivery pending',
        ]);
    }

    protected function findUserByChannel(string $channel, string $identifier): ?User
    {
        $column = $channel === 'email' ? 'email' : 'phone_number';
        return User::where($column, $identifier)->first(['id', 'full_name', 'email', 'phone_number']);
    }

    protected function normalizeIdentifier(string $identifier, string $channel): string
    {
        if ($channel === 'email') {
            return strtolower(trim($identifier));
        }
        return preg_replace('/\D/', '', $identifier);
    }

    protected function generateOtp(int $length = 6): string
    {
        $digits = '0123456789';
        $result = '';
        for ($i = 0; $i < $length; $i++) {
            $result .= $digits[random_int(0, strlen($digits) - 1)];
        }
        return $result;
    }

    protected function hashOtp(string $otp): string
    {
        return hash('sha256', $otp);
    }

    protected function insertOtp(string $channel, string $identifier, string $otpHash, $expiresAt): object
    {
        if ($channel === 'email') {
            // Delete old OTPs for this email from the last hour
            EmailOtp::where('email', $identifier)
                ->where('created_at', '>', now()->subHour())
                ->delete();

            $otpRecord = EmailOtp::create([
                'email' => $identifier,
                'otp_hash' => $otpHash,
                'expires_at' => $expiresAt,
                'sent_to_email' => $identifier,
                'delivered_via' => 'smtp',
                'attempts' => 0,
            ]);
        } else {
            PhoneOtp::where('phone_number', $identifier)
                ->where('created_at', '>', now()->subHour())
                ->delete();

            $otpRecord = PhoneOtp::create([
                'phone_number' => $identifier,
                'otp_hash' => $otpHash,
                'expires_at' => $expiresAt,
                'delivered_via' => 'sms',
                'attempts' => 0,
            ]);
        }

        return $otpRecord;
    }

    protected function verifyOtp(string $channel, string $identifier, string $otp, ?string $otpId = null): array
    {
        $inputHash = $this->hashOtp($otp);

        if ($channel === 'email') {
            $otpRecord = EmailOtp::where('email', $identifier)
                ->whereNull('used_at')
                ->latest('created_at')
                ->first();

            if (!$otpRecord) {
                return ['success' => false, 'message' => 'No OTP found for this email'];
            }
        } else {
            $otpRecord = PhoneOtp::where('phone_number', $identifier)
                ->whereNull('used_at')
                ->latest('created_at')
                ->first();

            if (!$otpRecord) {
                return ['success' => false, 'message' => 'No OTP found for this phone number'];
            }
        }

        if ($otpId && $otpRecord->id !== $otpId) {
            return ['success' => false, 'message' => 'OTP does not match the requested code'];
        }

        if (now()->gt($otpRecord->expires_at)) {
            return ['success' => false, 'message' => 'OTP has expired'];
        }

        if ($otpRecord->otp_hash !== $inputHash) {
            $attempts = ($otpRecord->attempts ?? 0) + 1;

            if ($channel === 'email') {
                EmailOtp::where('id', $otpRecord->id)->update(['attempts' => $attempts]);
            } else {
                PhoneOtp::where('id', $otpRecord->id)->update(['attempts' => $attempts]);
            }

            if ($attempts >= 5) {
                return ['success' => false, 'message' => 'Too many failed attempts. Please request a new OTP.'];
            }

            return ['success' => false, 'message' => 'Invalid OTP code'];
        }

        // Mark OTP as used
        if ($channel === 'email') {
            EmailOtp::where('id', $otpRecord->id)->update(['used_at' => now()]);
        } else {
            PhoneOtp::where('id', $otpRecord->id)->update(['used_at' => now()]);
        }

        // Update user verification status
        $user = $this->findUserByChannel($channel, $identifier);
        if ($user) {
            $updates = ['verified' => true];
            if ($channel === 'email') {
                $updates['email_confirmed_at'] = now();
            } else {
                $updates['phone_verified_at'] = now();
            }
            $user->update($updates);
        }

        return [
            'success' => true,
            'message' => $channel === 'email' ? 'Email verified' : 'Phone verified',
            'userId' => $user?->id,
        ];
    }

    protected function sendOtpDelivery(User $user, string $channel, string $otp, $otpRecord): array
    {
        if ($channel === 'email') {
            $origin = $request()->header('origin') ?? config('app.url') ?? 'http://localhost:5173';
            $emailHtml = "
                <html>
                    <body style=\"font-family: Arial, sans-serif; background: #f4f4f5; padding: 20px; color: #1e293b;\">
                        <div style=\"max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;\">
                            <h2 style=\"color: #059669;\">Sealify Email Verification</h2>
                             <p>Hello ' . ($user->full_name ?? 'Sealify User') . ',</p>
                            <p>Your one-time password (OTP) to verify your Sealify account is:</p>
                            <div style=\"text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #059669; padding: 20px; background: #ecfdf5; border-radius: 8px;\">{$otp}</div>
                            <p>This code expires in 10 minutes. If you did not request this code, please ignore this email.</p>
                            <p style=\"color: #64748b; font-size: 13px;\">Secure link: {$origin}/verify</p>
                            <hr style=\"border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;\">
                            <p style=\"color: #64748b; font-size: 12px;\">Sealify Security Team</p>
                        </div>
                    </body>
                </html>
            ";

            try {
                // Use Laravel's Mail facade - assuming SMTP is configured in .env
                \Mail::raw("Your Sealify email verification OTP is: {$otp}", function ($message) use ($user, $emailHtml) {
                    $message->to($user->email)
                        ->from(config('mail.from.address', 'admin@sealify.ng'), config('mail.from.name', 'Sealify'))
                        ->subject('Sealify Email Verification OTP')
                        ->html($emailHtml);
                });

                return ['success' => true, 'messageId' => 'mail_' . time()];
            } catch (\Exception $e) {
                Log::error('Email OTP delivery failed: ' . $e->getMessage());
                return ['success' => false, 'error' => $e->getMessage()];
            }
        } else {
            // SMS delivery - using a configured gateway
            $gatewayUrl = config('services.sms.gateway_url');
            $gatewayUsername = config('services.sms.username');
            $gatewayPassword = config('services.sms.password');

            if (!$gatewayUrl) {
                return ['success' => false, 'error' => 'SMS gateway URL not configured'];
            }

            try {
                $headers = ['Content-Type' => 'application/json'];
                $body = [
                    'to' => $user->phone_number ?? $identifier,
                    'message' => "Sealify OTP: {$otp}. Valid for 10 minutes. Do not share this code.",
                ];

                if ($gatewayUsername || $gatewayPassword) {
                    $headers['Authorization'] = 'Basic ' . base64_encode("{$gatewayUsername}:{$gatewayPassword}");
                }

                $response = \Http::withHeaders($headers)->post($gatewayUrl, $body);

                if (!$response->ok()) {
                    return ['success' => false, 'error' => 'SMS gateway error: ' . $response->status()];
                }

                $data = $response->json();
                return [
                    'success' => true,
                    'messageId' => $data['id'] ?? $data['message_id'] ?? $data['reference'] ?? 'sms_' . time(),
                ];
            } catch (\Exception $e) {
                Log::error('SMS OTP delivery failed: ' . $e->getMessage());
                return ['success' => false, 'error' => $e->getMessage()];
            }
        }
    }
}