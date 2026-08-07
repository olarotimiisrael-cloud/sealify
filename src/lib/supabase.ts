import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing! Check environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'sealify-nigeria-web',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Type-safe database types
export type Tables = {
  profiles: {
    Row: {
      id: string;
      email: string;
      full_name: string | null;
      phone_number: string | null;
      avatar_url: string | null;
      cover_url: string | null;
      bio: string | null;
      role: 'buyer' | 'seller' | 'admin';
      verified: boolean;
      verification_type: 'individual' | 'business' | 'premium' | 'student' | 'none';
      business_name: string | null;
      business_category: string | null;
      business_address: string | null;
      cac_number: string | null;
      business_hours: string | null;
      bank_name: string | null;
      account_number: string | null;
      account_name: string | null;
      website_url: string | null;
      instagram_handle: string | null;
      twitter_handle: string | null;
      whatsapp_number: string | null;
      email_notifications: boolean;
      whatsapp_notifications: boolean;
      hide_phone_publicly: boolean;
      hide_location_publicly: boolean;
      location: string;
      member_since: string;
      status: 'active' | 'suspended' | 'banned' | 'restricted';
      restriction_reason: string | null;
      appeal_status: 'none' | 'pending' | 'resolved';
      total_value_traded: number;
      completed_deals: number;
      created_at: string;
      updated_at: string;
    };
  };
  ads: {
    Row: {
      id: string;
      seller_id: string;
      category_id: string | null;
      subcategory_id: string | null;
      title: string;
      description: string;
      price: number;
      original_price: number | null;
      condition: string;
      location: string;
      status: 'active' | 'sold' | 'draft' | 'pending_review';
      images: string[];
      video_url: string | null;
      specifications: Record<string, string> | null;
      views_count: number;
      featured: boolean;
      promotion_plan_name: string | null;
      promotion_duration_months: number;
      promotion_start_date: string | null;
      promotion_end_date: string | null;
      payment_status: 'pending' | 'verified' | 'failed';
      payment_proof_url: string | null;
      amount_paid: number | null;
      created_at: string;
      updated_at: string;
    };
  };
};

export default supabase;