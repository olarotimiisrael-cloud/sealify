export type Category =
  | 'Vehicles'
  | 'Real Estate'
  | 'Electronics'
  | 'Fashion'
  | 'Home & Furniture'
  | 'Services'
  | 'Jobs'
  | 'Beauty & Health'
  | 'Utility & Energy';

export type Condition = 'Brand New' | 'Like New' | 'Used - Good' | 'Used - Fair';

export type VerificationBadgeType = 'individual' | 'business' | 'premium' | 'none';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  role: 'buyer' | 'seller' | 'admin';
  verified: boolean;
  verificationType?: VerificationBadgeType;
  businessName?: string;
  memberSince: string;
  location: string;
  password?: string;
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
  idDocumentUrl: string;
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
  type: 'security' | 'user' | 'ad' | 'broadcast' | 'verification';
  createdAt: string;
}

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
  promotionStartDate?: string; // ISO string
  promotionEndDate?: string; // ISO string
  paymentStatus?: 'pending' | 'verified' | 'failed';
  paymentProofUrl?: string;
  amountPaid?: number;
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

export interface SearchAlert {
  id: string;
  query: string;
  category: string;
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