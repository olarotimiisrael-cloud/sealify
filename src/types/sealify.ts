export type Category =
  | 'Vehicles'
  | 'Real Estate'
  | 'Electronics'
  | 'Fashion'
  | 'Home & Furniture'
  | 'Services'
  | 'Jobs'
  | 'Beauty & Health'
  | 'Utility & Energy'
  | 'Solar & Clean Energy';

export type Condition = 'Brand New' | 'Like New' | 'Used - Good' | 'Used - Fair';

export type VerificationBadgeType = 'individual' | 'business' | 'premium' | 'student' | 'none';

export type UserStatus = 'active' | 'suspended' | 'banned' | 'restricted';

export interface CategoryConfig {
  id: string;
  name: Category;
  iconName: string;
  color: string;
  count?: number;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  currency: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'sale' | 'payout' | 'promotion' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  reference?: string;
  createdAt: string;
}

export interface CategoryStats {
  category: Category;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalAds: number;
  demandScore: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SiteSettings {
  logoUrl: string;
  siteName: string;
  siteDescription: string;
  ogImage: string;
  contactEmail: string;
  contactPhone: string;
}

export interface Review {
  id: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BuyerRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  category: Category;
  maxBudget: number;
  location: string;
  description: string;
  createdAt: string;
  responsesCount: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  storeBannerUrl?: string;
  bio?: string;
  role: 'buyer' | 'seller' | 'admin';
  verified: boolean;
  verificationType?: VerificationBadgeType;
  businessName?: string;
  cacNumber?: string;
  businessHours?: string;
  neighborhoods?: string[];
  portfolioUrl?: string;
  
  // Bank Settlement Details
  bankName?: string;
  accountNumber?: string;
  accountName?: string;

  // Socials & Web
  websiteUrl?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  whatsappNumber?: string;

  // Communication & Privacy Preferences
  emailNotifications?: boolean;
  whatsappNotifications?: boolean;
  hidePhonePublicly?: boolean;
  hideLocationPublicly?: boolean;

  memberSince: string;
  location: string;
  password?: string;
  status?: UserStatus;
  restrictionReason?: string;
  appealStatus?: 'none' | 'pending' | 'resolved';
  totalValueTraded?: number;
  completedDeals?: number;
  
  // Added for AdminSettingsModal and EditProfileModal
  businessCategory?: string;
  businessAddress?: string;
}

export interface SecurityIntrusionLog {
  id: string;
  timestamp: string;
  attemptedEmail: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenResolution: string;
    language: string;
    cores: number;
    timezone: string;
  };
  mediaCaptured: boolean;
  mediaStatus: string;
  status: 'flagged' | 'reported' | 'dismissed';
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: VerificationBadgeType;
  docType: string;
  docNumber: string;
  docUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface PasswordChangeRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  nin: string;
  id_document_url: string;
  newPassword: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

export interface PromotionPaymentRequest {
  id: string;
  userId: string;
  listingId: string;
  amount: number;
  paymentMethod: 'opay' | 'card' | 'transfer' | 'ussd' | 'paystack';
  paymentProofUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  planName: string;
  durationMonths: number;
}

export interface AdReport {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterName?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  type: 'security' | 'user' | 'listing' | 'broadcast' | 'verification' | 'intrusion' | 'dispute' | 'finance';
  createdAt: string;
}

export interface DisputeCase {
  id: string;
  userId: string;
  userEmail: string;
  receiptRef: string;
  itemTitle: string;
  counterparty: string;
  category: string;
  reason: string;
  details: string;
  evidenceUrl?: string;
  status: 'pending' | 'in_review' | 'resolved';
  createdAt: string;
}

export interface SearchAlert {
  id: string;
  userId userId: string;
  query: string;
  category: Category | 'All';
  maxPrice: number | null;
  location: string;
  createdAt: string;
  matchCount: number;
}

export interface FilterState {
  searchQuery: string;
  category: Category | 'All';
  minPrice: number | null;
  maxPrice: number | null;
  condition: Condition | 'All';
  location: string;
  sortBy: 'newest' | 'price-asc' | 'price-desc';
}

export interface SafeMeetupSpotConfig {
  id: string;
  name: string;
  zone: 'LAUTECH Area' | 'Takie / Center' | 'Sabo Market Zone' | 'Police HQ';
  category: 'Police Safe Zone' | 'Public Library' | 'Shopping Mall' | 'Café';
  address: string;
  distance: string;
  hours: string;
  cctvVerified: boolean;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  active: boolean;
  targetRoles?: ('buyer' | 'seller')[];
  createdAt: string;
}

export interface MarketplaceDeal {
  id: string;
  itemTitle: string;
  price: number;
  location: string;
  time: string;
}

// Alias types for supabaseService.ts compatibility
export type DbUser = UserProfile;
export type DbListing = Listing;
export type DbVerificationRequest = VerificationRequest;
export type DbPasswordRequest = PasswordChangeRequest;
export type DbPromotionPayment = PromotionPaymentRequest;
export type DbReport = AdReport;
export type DbAuditLog = AuditLog;
export type DbDisputeCase = DisputeCase;
export type DbSiteSettings = SiteSettings;
export type DbSearchAlert = SearchAlert;
export type DbReview = Review;
export type DbCategoryStats = CategoryStats;
export type DbBuyerRequest = BuyerRequest;
export type DbWallet = Wallet;
export type DbTransaction = Transaction;
export type DbSafeSpot = SafeMeetupSpotConfig;
export type DbSystemAnnouncement = SystemAnnouncement;
export type DbMarketplaceDeal = MarketplaceDeal;
export type DbCategory = { id: string; name: string; icon_name: string; color: string; description?: string; parent_id?: string; sort_order: number; is_active: boolean; created_at: string; updated_at: string };
export type DbSubcategory = { id: string; category_id: string; name: string; description?: string; icon_name?: string; listing_type: 'product' | 'service'; spec_fields: any; sort_order: number; is_active: boolean; created_at: string; updated_at: string };
export type DbSystemConfig = { id: string; key: string; value: boolean; description?: string; updated_at: string };
export type DbPromotionPlan = { id: string; months: number; label: string; rate: number; badge?: string; is_active: boolean; created_at: string; updated_at: string };
export type DbIntrusionLog = SecurityIntrusionLog;

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerAvatar: string;
  sellerVerified: boolean;
  sellerVerificationType?: VerificationBadgeType;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  condition: Condition;
  location: string;
  status: 'active' | 'sold';
  images: string[];
  videoUrl?: string;
  createdAt: string;
  viewsCount: number;
  featured?: boolean;
  promotionDurationMonths?: number;
  promotionPlanName?: string;
  promotionStartDate?: string;
  promotionEndDate?: string;
  paymentStatus?: 'pending' | 'verified' | 'failed';
  paymentProofUrl?: string;
  amountPaid?: number;
  specifications?: Record<string, string>;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  listingPrice: number;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
}

export interface AppNotification {
  id: string;
  type: 'price_drop' | 'message' | 'offer' | 'alert_match' | 'system' | 'recommendation' | 'payment' | 'security' | 'verification' | 'promotion';
  title: string;
  description: string;
  time: string;
  read: boolean;
  linkUrl?: string;
}

export interface SearchFilter {
  query: string;
  category: Category | 'All';
  minPrice: number | null;
  maxPrice: number | null;
  condition: Condition | 'All';
  location: string;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}