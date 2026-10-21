// API Types for Cloudflare Workers

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
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
}

export interface AdListing {
  id: string;
  seller_id: string;
  category_id: string | null;
  subcategory_id: string | null;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  condition: 'Brand New' | 'Like New' | 'Used - Good' | 'Used - Fair';
  location: string;
  status: 'active' | 'sold' | 'draft' | 'pending_review';
  images: string[];
  video_url: string | null;
  specifications: Record<string, string>;
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
  seller_name?: string;
  seller_phone?: string;
  seller_avatar?: string;
  seller_verified?: boolean;
  seller_verification_type?: string;
}

export interface Conversation {
  id: string;
  ad_id: string;
  participant_1: string;
  participant_2: string;
  last_message: string | null;
  last_message_time: string | null;
  unread_count_1: number;
  unread_count_2: number;
  created_at: string;
  updated_at: string;
  ad_title?: string;
  ad_images?: string[];
  ad_price?: number;
  other_user_name?: string;
  other_user_avatar?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  ad_id: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'price_drop' | 'message' | 'offer' | 'alert_match' | 'system' | 'recommendation' | 'payment' | 'security' | 'verification' | 'promotion';
  title: string;
  description: string | null;
  link_url: string | null;
  read: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  pending_balance: number;
  total_withdrawn: number;
  currency: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: 'sale' | 'payout' | 'promotion' | 'refund' | 'escrow_hold' | 'escrow_release';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  description: string;
  reference: string | null;
  related_ad_id: string | null;
  related_user_id: string | null;
  created_at: string;
  ad_title?: string;
}

export interface EscrowOrder {
  id: string;
  ad_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: 'created' | 'funded' | 'inspection' | 'released' | 'disputed' | 'refunded';
  handover_code: string;
  qr_code_url: string | null;
  inspection_location: string | null;
  inspection_completed_at: string | null;
  released_at: string | null;
  disputed_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon_name: string;
  color: string;
  description: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  listing_type: 'product' | 'service';
  spec_fields: any;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  type: 'individual' | 'business' | 'premium' | 'student';
  doc_type: string;
  doc_number: string;
  doc_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  ad_id: string;
  ad_title: string;
  reporter_id: string | null;
  reporter_name: string | null;
  reason: string;
  details: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dispute {
  id: string;
  user_id: string;
  user_email: string;
  receipt_ref: string | null;
  item_title: string;
  counterparty: string;
  category: string;
  reason: string;
  details: string;
  evidence_url: string | null;
  status: 'pending' | 'in_review' | 'resolved';
  admin_notes: string | null;
  assigned_moderator: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchAlert {
  id: string;
  user_id: string;
  query: string;
  category_id: string | null;
  max_price: number | null;
  location: string;
  match_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  seller_id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_avatar: string | null;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface BuyerRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  title: string;
  category_id: string | null;
  max_budget: number;
  location: string;
  description: string;
  responses_count: number;
  status: 'open' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface BuyerRequestResponse {
  id: string;
  request_id: string;
  seller_id: string;
  seller_name: string;
  seller_avatar: string | null;
  proposed_price: number;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface SafeSpot {
  id: string;
  name: string;
  zone: 'LAUTECH Area' | 'Takie / Center' | 'Sabo Market Zone' | 'Police HQ';
  category: 'Police Safe Zone' | 'Public Library' | 'Shopping Mall' | 'Café';
  address: string;
  distance: string;
  hours: string;
  cctv_verified: boolean;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  active: boolean;
  target_roles: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: boolean;
  description: string | null;
  updated_at: string;
}

export interface PromotionPlan {
  id: string;
  months: number;
  label: string;
  rate: number;
  badge: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  query: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  condition: string;
  location: string;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}

export interface AnalyticsEvent {
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  url: string;
  referrer: string;
  userAgent: string;
  viewport: string;
  timestamp: string;
}

export interface PerformanceMetric {
  sessionId: string;
  metricName: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: string;
}