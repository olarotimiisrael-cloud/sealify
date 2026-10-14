<?php

namespace App\Services;

use App\Models\AdPromotion;
use App\Models\AdPromotionReceipt;
use App\Models\Listing;
use App\Models\User;
use App\Models\UserVerification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class PromotionService
{
    protected $flutterwavePublicKey;
    protected $flutterwaveSecretKey;
    protected $flutterwaveBaseUrl;

    public function __construct()
    {
        $this->flutterwavePublicKey = config('services.flutterwave.public_key');
        $this->flutterwaveSecretKey = config('services.flutterwave.secret_key');
        $this->flutterwaveBaseUrl = 'https://api.flutterwave.com/v3';
    }

    /**
     * Create a new ad promotion request
     */
    public function createPromotionRequest($userId, $adId, $planName, $durationMonths = 1)
    {
        $user = User::findOrFail($userId);
        $ad = Listing::where('id', $adId)
            ->where('seller_id', $userId)
            ->firstOrFail();

        // Verify user has accepted terms
        $kycAcceptance = $user->kycAcceptance;
        if (!$kycAcceptance || !$kycAcceptance->agreed_no_advance_payment) {
            throw new \Exception('User must accept terms of service (no advance payment policy)');
        }

        // Check if user has verified email
        if (!$user->email_verified_at) {
            throw new \Exception('User must have verified email to create promotion');
        }

        // Get promotion plan details
        $plan = $this->getPromotionPlan($planName);
        if (!$plan) {
            throw new \Exception('Invalid promotion plan');
        }

        // Calculate amount
        $amount = $plan['rate'] * $durationMonths;

        // Create promotion record
        $promotion = AdPromotion::create([
            'id' => Str::uuid(),
            'ad_id' => $adId,
            'promotion_plan_name' => $planName,
            'duration_months' => $durationMonths,
            'amount' => $amount,
            'status' => 'pending',
        ]);

        return $promotion;
    }

    /**
     * Initialize Flutterwave payment
     */
    public function initializePayment(AdPromotion $promotion, $user)
    {
        // Generate transaction reference
        $txRef = 'SEALIFY_' . $promotion->id . '_' . time() . '_' . Str::random(8);

        $data = [
            'tx_ref' => $txRef,
            'amount' => $promotion->amount,
            'currency' => 'NGN',
            'redirect_url' => config('app.url') . '/payment/callback',
            'payment_options' => 'card,ussd,banktransfer',
            'customer' => [
                'email' => $user->email,
                'phonenumber' => $user->phone_number ?? '',
                'name' => $user->full_name ?? $user->name,
            ],
            'customizations' => [
                'title' => 'Sealify Ad Promotion',
                'description' => 'Payment for promoting ad: ' . $promotion->ad->title,
                'logo' => config('app.url') . '/logo.png',
            ],
            'meta' => [
                'promotion_id' => $promotion->id,
                'ad_id' => $promotion->ad_id,
                'user_id' => $user->id,
            ]
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->flutterwaveSecretKey,
            'Content-Type' => 'application/json',
        ])->post($this->flutterwaveBaseUrl . '/payments', $data);

        if ($response->successful() && $response->json()['status'] === 'success') {
            $paymentData = $response->json()['data'];
            
            // Update promotion with transaction reference
            $promotion->update([
                'flutterwave_tx_ref' => $txRef,
            ]);

            return $paymentData['link']; // Return payment link
        }

        Log::error('Flutterwave payment initialization failed', [
            'response' => $response->json(),
            'promotion_id' => $promotion->id,
        ]);

        throw new \Exception('Payment initialization failed');
    }

    /**
     * Verify Flutterwave payment
     */
    public function verifyPayment($transactionId)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->flutterwaveSecretKey,
        ])->get($this->flutterwaveBaseUrl . '/transactions/' . $transactionId . '/verify');

        if ($response->successful() && $response->json()['status'] === 'success') {
            return $response->json()['data'];
        }

        return null;
    }

    /**
     * Process successful payment
     */
    public function processSuccessfulPayment($flutterwaveData)
    {
        // Extract metadata
        $meta = $flutterwaveData['meta'] ?? [];
        $promotionId = $meta['promotion_id'] ?? null;

        if (!$promotionId) {
            throw new \Exception('Invalid payment metadata');
        }

        $promotion = AdPromotion::find($promotionId);
        if (!$promotion) {
            throw new \Exception('Promotion not found');
        }

        // Begin database transaction
        return \DB::transaction(function () use ($promotion, $flutterwaveData) {
            // Create receipt
            $receipt = AdPromotionReceipt::create([
                'id' => \Illuminate\Support\Str::uuid(),
                'promotion_id' => $promotion->id,
                'receipt_number' => 'RCP_' . time() . '_' . \Illuminate\Support\Str::random(6),
                'invoice_number' => $flutterwaveData['id'] ?? null,
                'payment_method' => 'flutterwave',
                'amount_paid' => $flutterwaveData['amount'],
                'payment_provider' => 'flutterwave',
                'flutterwave_transaction_id' => $flutterwaveData['id'] ?? null,
                'receipt_pdf_url' => null, // Will be generated later
                'payment_details' => json_encode($flutterwaveData),
            ]);

            // Update promotion status to approved (awaiting admin approval)
            $promotion->update([
                'status' => 'approved',
                'amount' => $flutterwaveData['amount'],
            ]);

            return [
                'promotion' => $promotion,
                'receipt' => $receipt,
            ];
        });
    }

    /**
     * Admin approve promotion
     */
    public function approvePromotion($promotionId, $adminUserId, $notes = null)
    {
        $promotion = AdPromotion::findOrFail($promotionId);
        
        if ($promotion->status !== 'approved') {
            throw new \Exception('Promotion must be in approved status to be activated');
        }

        $now = now();
        $promotion->update([
            'status' => 'active',
            'approved_at' => $now,
            'started_at' => $now,
            'expires_at' => $now->addMonths($promotion->duration_months),
            'admin_approved_by' => $adminUserId,
            'admin_approval_notes' => $notes,
        ]);

        // Trigger job to handle expiration
        dispatch(new \App\Jobs\ExpirePromotion($promotion->id))
            ->delay($promotion->expires_at);

        return $promotion;
    }

    /**
     * Admin terminate promotion early
     */
    public function terminatePromotion($promotionId, $adminUserId, $reason = null)
    {
        $promotion = AdPromotion::findOrFail($promotionId);
        
        if (!in_array($promotion->status, ['active', 'approved'])) {
            throw new \Exception('Promotion can only be terminated if active or approved');
        }

        $promotion->update([
            'status' => 'terminated',
            'terminated_at' => now(),
            'admin_terminated_by' => $adminUserId,
            'admin_termination_reason' => $reason,
        ]);

        return $promotion;
    }

    /**
     * Upload payment receipt
     */
    public function uploadPaymentReceipt($receiptId, $file, $uploadedByUserId = null)
    {
        $receipt = AdPromotionReceipt::findOrFail($receiptId);
        
        // Store file
        $path = $file->store('promotion_receipts', 'public');
        $url = Storage::url($path);

        // Update receipt
        $receipt->update([
            'receipt_image_url' => $url,
            'uploaded_by' => $uploadedByUserId,
            'uploaded_at' => now(),
        ]);

        return $receipt;
    }

    /**
     * Get promotion plans
     */
    private function getPromotionPlan($planName)
    {
        $plans = [
            'basic' => [
                'label' => 'Basic Promotion',
                'rate' => 5000, // ₦5,000 per month
                'badge' => 'basic',
            ],
            'standard' => [
                'label' => 'Standard Promotion',
                'rate' => 10000, // ₦10,000 per month
                'badge' => 'standard',
            ],
            'premium' => [
                'label' => 'Premium Promotion',
                'rate' => 20000, // ₦20,000 per month
                'badge' => 'premium',
            ],
            'enterprise' => [
                'label' => 'Enterprise Promotion',
                'rate' => 50000, // ₦50,000 per month
                'badge' => 'enterprise',
            ],
        ];

        return $plans[$planName] ?? null;
    }

    /**
     * Check if user can promote this ad (verification requirements)
     */
    public function canUserPromoteAd($userId, $adId)
    {
        $user = User::find($userId);
        $ad = Listing::find($adId);

        if (!$user || !$ad) {
            return ['allowed' => false, 'reason' => 'User or ad not found'];
        }

        if ($ad->seller_id !== $userId) {
            return ['allowed' => false, 'reason' => 'User is not the seller of this ad'];
        }

        // Check if user has verified identity (NIN/BVN)
        $hasIdVerification = $user->verifications()
            ->whereIn('id_type', ['nin', 'bvn'])
            ->where('verification_status', 'verified')
            ->exists();

        if (!$hasIdVerification) {
            return ['allowed' => false, 'reason' => 'User must have verified identity (NIN or BVN) to promote ads'];
        }

        // Check if user has accepted terms
        $kycAcceptance = $user->kycAcceptance;
        if (!$kycAcceptance || !$kycAcceptance->agreed_no_advance_payment) {
            return ['allowed' => false, 'reason' => 'User must accept terms of service'];
        }

        return ['allowed' => true];
    }
}