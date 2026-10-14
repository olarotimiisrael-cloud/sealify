<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserVerification;
use App\Models\BusinessVerification;
use App\Services\VerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class VerificationController extends Controller
{
    protected $verificationService;

    public function __construct(VerificationService $verificationService)
    {
        $this->verificationService = $verificationService;
    }

    /**
     * Create ID verification request
     */
    public function createIdVerification(Request $request)
    {
        $request->validate([
            'id_type' => 'required|in:nin,bvn,voters_card,drivers_license,international_passport',
            'id_number' => 'required|string|min:6|max:50',
            'document' => 'required|file|max:10240', // 10MB max
        ]);

        $user = $request->user();

        try {
            $verification = $this->verificationService->createIdVerification(
                $user->id,
                $request->input('id_type'),
                $request->input('id_number'),
                $request->file('document')
            );

            return response()->json([
                'message' => 'ID verification submitted for review',
                'verification' => $verification,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create ID verification', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Create business verification request
     */
    public function createBusinessVerification(Request $request)
    {
        $request->validate([
            'business_name' => 'required|string|max:200',
            'business_registration_number' => 'required|string|min:6|max:50',
            'business_address' => 'nullable|string|max:500',
            'documents' => 'required|array',
            'documents.*' => 'required|file|max:10240',
        ]);

        $user = $request->user();

        try {
            $verification = $this->verificationService->createBusinessVerification(
                $user->id,
                $request->input('business_name'),
                $request->input('business_registration_number'),
                $request->input('business_address'),
                $request->file('documents')
            );

            return response()->json([
                'message' => 'Business verification submitted for review',
                'verification' => $verification,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create business verification', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Admin verify ID verification
     */
    public function adminVerifyIdVerification(Request $request, $verificationId)
    {
        $request->validate([
            'admin_user_id' => 'required|exists:users,id',
            'status' => 'required|in:verified,rejected',
            'notes' => 'nullable|string',
        ]);

        try {
            $verification = $this->verificationService->verifyIdVerification(
                $verificationId,
                $request->input('admin_user_id'),
                $request->input('status'),
                $request->input('notes'),
                $request->input('result', null)
            );

            return response()->json([
                'message' => 'ID verification ' . $request->input('status'),
                'verison' => $verification,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to verify ID verification', [
                'error' => $e->getMessage(),
                'verification_id' => $verificationId,
            ]);

            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Admin verify business verification
     */
    public function adminVerifyBusinessVerification(Request $request, $verificationId)
    {
        $request->validate([
            'admin_user_id' => 'required|exists:users,id',
            'status' => 'required|in:verified,rejected',
            'notes' => 'nullable|string',
        ]);

        try {
            $verification = $this->verificationService->verifyBusinessVerification(
                $verificationId,
                $request->input('admin_user_id'),
                $request->input('status'),
                $request->input('notes'),
                $request->input('result', null)
            );

            return response()->json([
                'message' => 'Business verification ' . $request->input('status'),
                'verification' => $verification,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to verify business verification', [
                'error' => $e->getMessage(),
                'verification_id' => $verificationId,
            ]);

            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get user's ID verifications
     */
    public function getUserVerifications(Request $request)
    {
        $user = $request->user();

        $verifications = $this->verificationService->getUserVerifications($user->id);

        return response()->json([
            'verifications' => $verifications,
        ], 200);
    }

    /**
     * Get user's business verifications
     */
    public function getUserBusinessVerifications(Request $request)
    {
        $user = $request->user();

        $verifications = $this->verificationService->getUserBusinessVerifications($user->id);

        return response()->json([
            'verifications' => $verifications,
        ], 200);
    }

    /**
     * Check verification status
     */
    public function verificationStatus(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'has_verified_identity' => $this->verificationService->hasVerifiedIdentity($user->id),
            'has_verified_business' => $this->verificationService->hasVerifiedBusiness($user->id),
        ], 200);
    }

    /**
     * Get verification document (for viewing)
     */
    public function getVerificationDocument(Request $request, $verificationId)
    {
        $verification = UserVerification::findOrFail($verificationId);

        if (!$verification->id_document_url) {
            return response()->json([
                'error' => 'No document found',
            ], 404);
        }

        // Redirect to the actual file
        return redirect(Storage::url($verification->id_document_url));
    }
}