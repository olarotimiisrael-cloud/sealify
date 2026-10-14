<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdPromotion;
use App\Models\AdPromotionReceipt;
use App\Models\User;
use App\Services\PromotionService;
use App\Services\UserSafetyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PromotionController extends Controller
{
    protected $promotionService;
    protected $userSafetyService;

    public function __construct(PromotionService $promotionService, UserSafetyService $userSafetyService)
    {
        $this->promotionService = $promotionService;
        $this->userSafetyService = $userSafetyService;
    }

    /**
     * Create ad promotion request
     */
    public function createPromotion(Request $request)
    {
        $request->validate([
            'ad_id' => 'required|exists:ads,id',
            'plan_name' => 'required|in:basic,standard,premium,enterprise',
            'duration_months' => 'required|integer|min:1|max:12',
        ]);

        $user = $request->user();

        // Check if user can promote this ad
        $canPromote = $this->promotionService->canUserPromoteAd($user->id, $request->input('ad_id'));
        if (!$canPromote['allowed']) {
            return response()->json([
                'error' => 'Cannot create promotion',
                'reason' => $canPromote['reason'],
            ], 403);
        }

        // Create promotion request
        try {
            $promotion = $this->promotionService->createPromotionRequest(
                $user->id,
                $request->input('ad_id'),
                $request->input('plan_name'),
                $request->input('duration_months')
            );

            // Initialize Flutterwave payment
            $paymentLink = $this->promotionService->initializePayment($promotion, $user);

            return response()->json([
                'promotion' => $promotion,
                'payment_link' => $paymentLink,
                'amount' => $promotion->amount,
                'currency' => 'NGN',
                'description' => 'Ad promotion: ' . $promotion->promotion_plan_name,
                'ad_title' => $promotion->ad->title,
                'ad_id' => $promotion->ad_id,
                'duration_months' => $promotion->duration_months,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create promotion', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Flutterwave payment callback
     */
    public function paymentCallback(Request $request)
    {
        // Handle callback from Flutterwave
        $data = $request->all();

        // Verify the transaction
        $verifiedData = $this->promotionService->verifyPayment($data['tx_ref'] ?? null);

        if (!$verifiedData) {
            return response()->json([
                'error' => 'Payment verification failed',
            ], 400);
        }

        // Process the payment
        try {
            $result = $this->promotionService->processSuccessfulPayment($verifiedData);

            $promotion = $result['promotion'];
            $receipt = $result['receipt'];

            return response()->json([
                'message' => 'Payment successful',
                'promotion' => $promotion->load(['ad', 'receipts']),
                'receipt' => $receipt,
                'redirect_url' => '/seller/dashboard',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to process promotion payment', [
                'error' => $e->getMessage(),
                'tx_ref' => $data['tx_ref'] ?? null,
            ]);

            return response()->json([
                'error' => 'Payment processing failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin approve promotion
     */
    public function adminApprovePromotion(Request $request, $promotionId)
    {
        $request->validate([
            'admin_user_id' => 'required|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        try {
            $promotion = $this->promotionService->approvePromotion(
                $promotionId,
                $request->input('admin_user_id'),
                $request->input('notes')
            );

            return response()->json([
                'message' => 'Promotion approved and activated',
                'promotion' => $promotion,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Admin terminate promotion
     */
    public function adminTerminatePromotion(Request $request, $promotionId)
    {
        $request->validate([
            'admin_user_id' => 'required|exists:users,id',
            'reason' => 'nullable|string',
        ]);

        try {
            $promotion = $this->promotionService->terminatePromotion(
                $promotionId,
                $request->input('admin_user_id'),
                $request->input('reason')
            );

            return response()->json([
                'message' => 'Promotion terminated',
                'promotion' => $promotion,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Upload payment receipt
     */
    public function uploadReceipt(Request $request, $receiptId)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,pdf|max:5120',
        ]);

        try {
            $receipt = $this->promotionService->uploadPaymentReceipt(
                $receiptId,
                $request->file('file'),
                $request->user()->id
            );

            return response()->json([
                'message' => 'Receipt uploaded successfully',
                'receipt' => $receipt,
                'receipt_image_url' => $receipt->receipt_image_url,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get user's promotions
     */
    public function userPromotions(Request $request)
    {
        $user = $request->user();

        $promotions = AdPromotion::whereHas('ad', function ($query) use ($user) {
            $query->where('seller_id', $user->id);
        })
        ->with(['ad', 'receipts'])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'promotions' => $promotions,
        ], 200);
    }

    /**
     * Get promotion receipt
     */
    public function getReceipt(Request $request, $receiptId)
    {
        $receipt = AdPromotionReceipt::with(['promotion.ad'])->findOrFail($receiptId);

        return response()->json([
            'receipt' => $receipt,
        ], 200);
    }
}