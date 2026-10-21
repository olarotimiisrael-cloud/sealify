<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'full_name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'avatar_url' => $this->avatar_url,
            'location' => $this->location,
            'bio' => $this->bio,
            'is_verified_seller' => $this->is_verified_seller,
            'is_kyc_verified' => $this->isKycVerified(),
            'kyc_verified_at' => $this->kyc_verified_at,
            'kyc_type' => $this->kyc_type,
            'balance' => $this->balance,
            'has_used_free_promotion' => $this->has_used_free_promotion,
            'email_verified_at' => $this->email_verified_at,
            'phone_verified_at' => $this->phone_verified_at,
            'created_at' => $this->created_at,
            'role' => $this->role,
            'cover_url' => $this->cover_url,
            'business_name' => $this->business_name,
            'business_category' => $this->business_category,
            'business_address' => $this->business_address,
            'cac_number' => $this->cac_number,
            'business_hours' => $this->business_hours,
            'website_url' => $this->website_url,
            'instagram_handle' => $this->instagram_handle,
            'twitter_handle' => $this->twitter_handle,
            'whatsapp_number' => $this->whatsapp_number,
            'email_notifications' => $this->email_notifications,
            'whatsapp_notifications' => $this->whatsapp_notifications,
            'hide_phone_publicly' => $this->hide_phone_publicly,
            'hide_location_publicly' => $this->hide_location_publicly,
            'total_value_traded' => $this->total_value_traded,
            'completed_deals' => $this->completed_deals,
            'verified_credentials' => $this->verified_credentials,
            'trust_score' => $this->trust_score,
            'credential_expiry_warning_date' => $this->credential_expiry_warning_date,
            'verification_preferences' => $this->verification_preferences,
            'referral_code' => $this->referral_code,
        ];
    }
}
