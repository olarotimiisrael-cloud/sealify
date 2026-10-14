<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserVerification;
use App\Models\BusinessVerification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class VerificationService
{
    /**
     * Create ID verification request (NIN, BVN, Voters Card, etc.)
     */
    public function createIdVerification($userId, $idType, $idNumber, $document = null)
    {
        $user = User::findOrFail($userId);

        // Validate ID type
        $validTypes = ['nin', 'bvn', 'voters_card', 'drivers_license', 'international_passport'];
        if (!in_array($idType, $validTypes)) {
            throw new \Exception('Invalid ID type');
        }

        // Check if user already has this type of verification
        $existing = UserVerification::where('user_id', $userId)
            ->where('id_type', $idType)
            ->where('verification_status', '!=', 'rejected')
            ->first();

        if ($existing) {
            throw new \Exception('User already has a pending or verified ' . $idType . ' verification');
        }

        $verification = UserVerification::create([
            'id' => Str::uuid(),
            'user_id' => $userId,
            'id_type' => $idType,
            'id_number' => $this->maskIdNumber($idNumber),
            'verification_status' => 'pending',
        ]);

        // Handle document upload if provided
        if ($document) {
            $this->handleVerificationDocument($verification, $document, $idType);
        }

        return $verification;
    }

    /**
     * Create business verification request
     */
    public function createBusinessVerification($userId, $businessName, $registrationNumber, $address = null, $documents = [])
    {
        $user = User::findOrFail($userId);

        // Check if user already has business verification
        $existing = BusinessVerification::where('user_id', $userId)
            ->where('verification_status', '!=', 'rejected')
            ->first();

        if ($existing) {
            throw new \Exception('User already has a pending or verified business verification');
        }

        $verification = BusinessVerification::create([
            'id' => Str::uuid(),
            'user_id' => $userId,
            'business_name' => $businessName,
            'business_registration_number' => $registrationNumber,
            'business_address' => $address,
            'verification_status' => 'pending',
        ]);

        // Handle document uploads
        foreach ($documents as $index => $document) {
            $this->handleBusinessDocument($verification, $document, $index);
        }

        return $verification;
    }

    /**
     * Admin verify ID verification
     */
    public function verifyIdVerification($verificationId, $adminUserId, $status = 'verified', $notes = null, $result = null)
    {
        $verification = UserVerification::findOrFail($verificationId);

        if (!in_array($status, ['verified', 'rejected'])) {
            throw new \Exception('Invalid verification status');
        }

        $updateData = [
            'verification_status' => $status,
            'verified_at' => $status === 'verified' ? now() : null,
            'verification_notes' => $notes,
            'verification_result' => $result,
            'verified_by' => $adminUserId,
        ];

        // Set expiration for certain ID types (example: drivers license expires)
        if ($status === 'verified') {
            $verification->update(array_merge($updateData, [
                'expires_at' => $this->getIdExpirationDate($verification->id_type),
            ]));
        } else {
            $verification->update($updateData);
        }

        // If verified, check if user should get verified badge
        if ($status === 'verified') {
            $this->awardVerifiedBadge($verification->user_id, 'identity');
        }

        return $verification;
    }

    /**
     * Admin verify business verification
     */
    public function verifyBusinessVerification($verificationId, $adminUserId, $status = 'verified', $notes = null, $result = null)
    {
        $verification = BusinessVerification::findOrFail($verificationId);

        if (!in_array($status, ['verified', 'rejected'])) {
            throw new \Exception('Invalid verification status');
        }

        $updateData = [
            'verification_status' => $status,
            'verified_at' => $status === 'verified' ? now() : null,
            'verification_notes' => $notes,
            'verification_result' => $result,
            'verified_by' => $adminUserId,
        ];

        // Business verifications typically don't expire quickly, but we can set a yearly check
        if ($status === 'verified') {
            $verification->update(array_merge($updateData, [
                'expires_at' => now()->addYear(),
                'is_active' => true,
            ]));
        } else {
            $verification->update($updateData);
        }

        // If verified, check if user should get business verified badge
        if ($status === 'verified') {
            $this->awardVerifiedBadge($verification->user_id, 'business');
        }

        return $verification;
    }

    /**
     * Handle document upload for ID verification
     */
    private function handleVerificationDocument($verification, $document, $idType)
    {
        $path = $document->store('id_verifications/' . $verification->id_type, 'public');
        $url = Storage::url($path);
        $thumbnailUrl = $this->generateThumbnail($path); // For images

        $verification->update([
            'id_document_url' => $url,
            'id_document_thumbnail_url' => $thumbnailUrl,
        ]);
    }

    /**
     * Handle document upload for business verification
     */
    private function handleBusinessDocument($verification, $document, $index)
    {
        $path = $document->store('business_verifications/' . $verification->id, 'public');
        $url = Storage::url($path);

        // For business, we might store multiple document types
        // For simplicity, we'll store the main registration certificate
        if ($index === 0) {
            $verification->update([
                'registration_certificate_url' => $url,
            ]);
        }
        // Could add more fields for tax documents, etc.
    }

    /**
     * Generate thumbnail for document preview
     */
    private function generateThumbnail($imagePath)
    {
        // This would use Intervention Image or similar in production
        // For now, we'll just return the original path
        return Storage::url($imagePath);
    }

    /**
     * Mask ID number for privacy (show only last 4 digits)
     */
    private function maskIdNumber($idNumber)
    {
        if (strlen($idNumber) <= 4) {
            return $idNumber;
        }
        return str_repeat('*', strlen($idNumber) - 4) . substr($idNumber, -4);
    }

    /**
     * Get expiration date for ID type
     */
    private function getIdExpirationDate($idType)
    {
        // Different ID types have different expiration periods
        $expirationPeriods = [
            'drivers_license' => '+4 years',
            'international_passport' => '+10 years',
            // NIN and BVN don't expire in Nigeria
            'voters_card' => '+5 years',
        ];

        if (array_key_exists($idType, $expirationPeriods)) {
            return now()->add($expirationPeriods[$idType]);
        }

        return null; // No expiration
    }

    /**
     * Award verified badge to user
     */
    private function awardVerifiedBadge($userId, $badgeType)
    {
        // This would integrate with your existing badge system
        // For now, we'll log it - actual implementation would create/update badge records
        Log::info("Awarding {$badgeType} verified badge to user {$userId}");

        // You could update user model or create a badge record here
        // Example: User::where('id', $userId)->update(['is_verified_identity' => true]);
    }

    /**
     * Get user's verifications
     */
    public function getUserVerifications($userId)
    {
        return UserVerification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get user's business verifications
     */
    public function getUserBusinessVerifications($userId)
    {
        return BusinessVerification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Check if user has verified identity
     */
    public function hasVerifiedIdentity($userId)
    {
        return UserVerification::where('user_id', $userId)
            ->where('verification_status', 'verified')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    /**
     * Check if user has verified business
     */
    public function hasVerifiedBusiness($userId)
    {
        return BusinessVerification::where('user_id', $userId)
            ->where('verification_status', 'verified')
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }
}