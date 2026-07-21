export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  role: 'buyer' | 'seller' | 'both';
  location: string;
  verified?: boolean;
  member_since?: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  seller?: UserProfile;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'Brand New' | 'Like New' | 'Refurbished' | 'Used - Good' | 'Used - Fair';
  location: string;
  status: 'active' | 'sold' | 'draft';
  images: string[];
  views_count: number;
  created_at: string;
  is_saved?: boolean;
  is_featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  count: number;
  color: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  listing_title?: string;
  listing_image?: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export interface SearchFilter {
  query: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  condition: string;
  location: string;
  sortBy: 'newest' | 'price_low' | 'price_high' | 'popular';
}