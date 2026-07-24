import { createClient } from '@supabase/supabase-js';

// Using the environment variables configured in Cloudflare Pages
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qldwkoapgenmohuqnidr.supabase.co';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZHdrb2FwZ2VubW9odXFuaWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDc4MDUsImV4cCI6MjEwMDIyMzgwNX0.sHM7fxGLqDgGFe6QwjSCv-U1YcZgWq_EUlP5gSdHwfg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types matching our schema
export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  role: 'buyer' | 'seller' | 'admin';
  verified: boolean;
  verification_type: 'individual' | 'business' | 'premium' | 'none';
  business_name: string | null;
  location: string;
  member_since: string;
  status: 'active' | 'suspended' | 'banned' | 'restricted';
  restriction_reason: string | null;
  appeal_status: 'none' | 'pending' | 'resolved';
  password: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbListing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  category: string;
  condition: string;
  location: string;
  status: 'active' | 'sold';
  images: string[];
  video_url: string | null;
  views_count: number;
  featured: boolean;
  promotion_plan_name: string | null;
  promotion_duration_months: number;
  promotion_start_date: string | null;
  promotion_end_date: string | null;
  payment_status: 'pending' | 'verified' | 'failed';
  payment_proof_url: string | null;
  amount_paid: number | null;
  specifications: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  conversation_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
}

export interface DbConversation {
  id: string;
  listing_id: string;
  participant_1: string;
  participant_2: string;
  last_message: string;
  last_message_time: string;
  updated_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  read: boolean;
  link_url: string | null;
  created_at: string;
}

export interface DbVerificationRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  type: string;
  doc_type: string;
  doc_number: string;
  doc_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface DbPasswordRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  nin: string;
  id_document_url: string;
  new_password: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
}

export interface DbPromotionPayment {
  id: string;
  user_id: string;
  listing_id: string;
  amount: number;
  payment_method: string;
  payment_proof_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  plan_name: string;
  duration_months: number;
  created_at: string;
}

export interface DbDisputeCase {
  id: string;
  user_id: string;
  user_email: string;
  receipt_ref: string;
  item_title: string;
  counterparty: string;
  category: string;
  reason: string;
  details: string;
  evidence_url: string | null;
  status: 'pending' | 'in_review' | 'resolved';
  created_at: string;
}

export interface DbReport {
  id: string;
  listing_id: string;
  listing_title: string;
  reporter_name: string | null;
  reason: string;
  details: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface DbAuditLog {
  id: string;
  action: string;
  details: string;
  type: string;
  created_at: string;
}

export interface DbReview {
  id: string;
  seller_id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_avatar: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface DbBuyerRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  title: string;
  category: string;
  max_budget: number;
  location: string;
  description: string;
  responses_count: number;
  created_at: string;
}

export interface DbSearchAlert {
  id: string;
  user_id: string;
  query: string;
  category: string;
  max_price: number | null;
  location: string;
  match_count: number;
  created_at: string;
}

export interface DbAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  active: boolean;
  created_at: string;
}

export interface DbSystemConfig {
  id: string;
  key: string;
  value: boolean;
  updated_at: string;
}

export interface DbSiteSettings {
  id: string;
  logo_url: string;
  site_name: string;
  site_description: string;
  og_image: string;
  contact_email: string;
  contact_phone: string;
  updated_at: string;
}

export interface DbIntrusionLog {
  id: string;
  timestamp: string;
  attempted_email: string;
  device_info: any;
  media_captured: boolean;
  media_status: string;
  status: 'flagged' | 'reported' | 'dismissed';
}

export interface DbRecentDeal {
  id: string;
  item_title: string;
  price: number;
  location: string;
  time: string;
}