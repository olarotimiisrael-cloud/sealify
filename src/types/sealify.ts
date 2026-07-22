export type Category = 
  | 'Vehicles'
  | 'Real Estate'
  | 'Electronics'
  | 'Fashion'
  | 'Home & Furniture'
  | 'Services'
  | 'Jobs'
  | 'Beauty & Health';

export type Condition = 'Brand New' | 'Like New' | 'Used - Good' | 'Used - Fair';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  role: 'buyer' | 'seller' | 'admin';
  verified: boolean;
  memberSince: string;
  location: string;
  password?: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerAvatar: string;
  sellerVerified: boolean;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  condition: Condition;
  location: string;
  status: 'active' | 'sold';
  images: string[];
  createdAt: string;
  viewsCount: number;
  featured?: boolean;
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