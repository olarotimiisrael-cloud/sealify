import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message } from '../types/sealify';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SealifyContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isAuthenticated: boolean;
  login: (email: string, role: 'buyer' | 'seller') => void;
  logout: () => void;
  listings: Listing[];
  savedListingIds: string[];
  recentlyViewedIds: string[];
  compareListingIds: string[];
  addRecentlyViewed: (id: string) => void;
  toggleSaveListing: (id: string) => void;
  isSaved: (id: string) => boolean;
  toggleCompareListing: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  createListing: (data: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'sellerPhone' | 'sellerAvatar' | 'sellerVerified' | 'status' | 'createdAt' | 'viewsCount'>) => void;
  updateListing: (id: string, updatedData: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  markAsSold: (id: string) => void;
  conversations: Conversation[];
  sendMessage: (listingId: string, receiverId: string, content: string) => void;
  getConversationByListing: (listingId: string) => Conversation | undefined;
  activeCategory: Category | 'All';
  setActiveCategory: (cat: Category | 'All') => void;
  loading: boolean;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  category: 'All',
  minPrice: null,
  maxPrice: null,
  condition: 'All',
  location: '',
  sortBy: 'newest',
};

const INITIAL_FALLBACK_LISTINGS: Listing[] = [
  {
    id: 'lst_101',
    sellerId: 'usr_1',
    sellerName: 'Adebowale Ogunleye',
    sellerPhone: '+234 803 123 4567',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    sellerVerified: true,
    title: 'Toyota Camry 2018 XSE (Unregistered Foreign Used)',
    description: 'Clean foreign used 2018 Toyota Camry XSE with panoramic roof, leather interior, custom alloy wheels, reverse camera, and duty paid. Location: Ogbomoso, Oyo State.',
    price: 18500000,
    originalPrice: 20000000,
    category: 'Vehicles',
    condition: 'Like New',
    location: 'Ogbomoso, Oyo State',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80'
    ],
    createdAt: '2 hours ago',
    viewsCount: 245,
    featured: true
  },
  {
    id: 'lst_102',
    sellerId: 'usr_2',
    sellerName: 'Blessing Okonjo',
    sellerPhone: '+234 812 987 6543',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    sellerVerified: true,
    title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
    description: 'Factory unlocked iPhone 15 Pro Max in pristine condition. Battery health 98%, comes with original USB-C braided cable, receipt, and protective silicon case.',
    price: 1450000,
    category: 'Electronics',
    condition: 'Like New',
    location: 'LAUTECH Area, Ogbomoso',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
    ],
    createdAt: '5 hours ago',
    viewsCount: 189
  },
  {
    id: 'lst_103',
    sellerId: 'usr_3',
    sellerName: 'Kemi & Associates Properties',
    sellerPhone: '+234 802 333 4455',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    sellerVerified: true,
    title: 'Newly Built 2 Bedroom Flat Self-Contain Apartment',
    description: 'Modern 2-bedroom apartment with ensuite bathrooms, POP ceiling, water heater, paved compound, secure gate, and prepaid meter near LAUTECH Under-G.',
    price: 450000,
    category: 'Real Estate',
    condition: 'Brand New',
    location: 'Under-G, Ogbomoso',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80'
    ],
    createdAt: '1 day ago',
    viewsCount: 310,
    featured: true
  },
  {
    id: 'lst_104',
    sellerId: 'usr_4',
    sellerName: 'Tunde Electronics Hub',
    sellerPhone: '+234 814 555 6677',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    sellerVerified: true,
    title: 'Apple MacBook Pro 16" M2 Pro 16GB RAM / 512GB SSD',
    description: 'Space Gray MacBook Pro M2 Pro 12-core CPU 19-core GPU. Excellent battery condition, clean keyboard and screen, ideal for software engineering and video editing.',
    price: 1850000,
    category: 'Electronics',
    condition: 'Like New',
    location: 'Ibadan, Oyo State',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
    ],
    createdAt: '2 days ago',
    viewsCount: 164
  },
  {
    id: 'lst_105',
    sellerId: 'usr_5',
    sellerName: 'Chief Salawu',
    sellerPhone: '+234 805 777 8899',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    sellerVerified: true,
    title: '2 Plot Commercial Land along Ogbomoso-Ilorin Expressway',
    description: 'Dry land with registered survey plan and C of O in process. Perfect for filling station, hotel, or warehouse development directly facing expressway.',
    price: 12000000,
    category: 'Real Estate',
    condition: 'Brand New',
    location: 'Ilorin Road, Ogbomoso',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'
    ],
    createdAt: '3 days ago',
    viewsCount: 412
  }
];

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('sealify_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [listings, setListings] = useState<Listing[]>(INITIAL_FALLBACK_LISTINGS);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [compareListingIds, setCompareListingIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize data from Supabase
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      // Get saved listings from localStorage
      const savedIds = localStorage.getItem('sealify_saved');
      if (savedIds) {
        setSavedListingIds(JSON.parse(savedIds));
      }

      // Get recently viewed from localStorage
      const recentIds = localStorage.getItem('sealify_recent');
      if (recentIds) {
        setRecentlyViewedIds(JSON.parse(recentIds));
      }

      // Get compare list from localStorage
      const compareIds = localStorage.getItem('sealify_compare');
      if (compareIds) {
        setCompareListingIds(JSON.parse(compareIds));
      }

      // Fetch listings from Supabase
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          *,
          seller:profiles!listings_seller_id_fkey(
            full_name,
            avatar_url,
            verified,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (!listingsError && listingsData && listingsData.length > 0) {
        const formattedListings: Listing[] = listingsData.map((item: any) => ({
          id: item.id,
          sellerId: item.seller_id,
          sellerName: item.seller?.full_name || 'Unknown Seller',
          sellerPhone: item.seller?.phone_number || '+234 800 000 0000',
          sellerAvatar: item.seller?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          sellerVerified: item.seller?.verified || false,
          title: item.title,
          description: item.description,
          price: item.price,
          category: item.category,
          condition: item.condition,
          location: item.seller?.location || item.location,
          status: item.status,
          images: item.images || ['https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100'],
          createdAt: item.created_at,
          viewsCount: item.views_count || 0,
        }));
        setListings(formattedListings);
      }

      setLoading(false);
    };

    initializeData();
  }, []);

  const login = useCallback((email: string, role: 'buyer' | 'seller') => {
    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 6),
      email,
      fullName: email.split('@')[0].replace('.', ' '),
      phoneNumber: '+234 803 000 1234',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role,
      verified: true,
      memberSince: 'Just now',
      location: 'Ogbomoso, Oyo State',
    };
    setUser(newUser);
    localStorage.setItem('sealify_user', JSON.stringify(newUser));
    toast.success(`Welcome back, ${newUser.fullName}!`);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sealify_user');
    toast.info('Logged out successfully');
  }, []);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const updated = [id, ...filtered].slice(0, 6);
      localStorage.setItem('sealify_recent', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleSaveListing = useCallback((id: string) => {
    setSavedListingIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('sealify_saved', JSON.stringify(updated));
      toast.success(exists ? 'Removed from saved items' : 'Saved to your favorites!');
      return updated;
    });
  }, []);

  const isSaved = useCallback((id: string) => savedListingIds.includes(id), [savedListingIds]);

  const toggleCompareListing = useCallback((id: string) => {
    setCompareListingIds((prev) => {
      if (prev.includes(id)) {
        toast.info('Removed from comparison');
        const updated = prev.filter((item) => item !== id);
        localStorage.setItem('sealify_compare', JSON.stringify(updated));
        return updated;
      } else {
        if (prev.length >= 3) {
          toast.error('You can compare a maximum of 3 items at once');
          return prev;
        }
        toast.success('Added item to comparison matrix!');
        const updated = [...prev, id];
        localStorage.setItem('sealify_compare', JSON.stringify(updated));
        return updated;
      }
    });
  }, []);

  const isInCompare = useCallback((id: string) => compareListingIds.includes(id), [compareListingIds]);

  const clearCompare = useCallback(() => {
    setCompareListingIds([]);
    localStorage.removeItem('sealify_compare');
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const setActiveCategory = useCallback((category: Category | 'All') => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const createListing = useCallback(async (
    data: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'sellerPhone' | 'sellerAvatar' | 'sellerVerified' | 'status' | 'createdAt' | 'viewsCount'>
  ) => {
    const currentSeller = user || {
      id: 'usr_guest',
      fullName: 'Verified Seller',
      phoneNumber: '+234 800 000 0000',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      verified: true
    };

    const formattedListing: Listing = {
      id: 'lst_' + Date.now(),
      sellerId: currentSeller.id,
      sellerName: currentSeller.fullName,
      sellerPhone: currentSeller.phoneNumber,
      sellerAvatar: currentSeller.avatarUrl,
      sellerVerified: currentSeller.verified || true,
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      condition: data.condition,
      location: data.location,
      status: 'active',
      images: data.images,
      createdAt: 'Just now',
      viewsCount: 1,
    };

    setListings((prev) => [formattedListing, ...prev]);
    toast.success('Your ad was posted successfully!');
  }, [user]);

  const updateListing = useCallback(async (id: string, updatedData: Partial<Listing>) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );
    toast.success('Listing details updated successfully!');
  }, []);

  const deleteListing = useCallback(async (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    toast.success('Listing deleted');
  }, []);

  const markAsSold = useCallback(async (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'sold' as const } : l))
    );
    toast.success('Listing marked as sold!');
  }, []);

  const sendMessage = useCallback(async (listingId: string, receiverId: string, content: string) => {
    const sender = user || {
      id: 'usr_me',
      fullName: 'You',
    };

    const listing = listings.find((l) => l.id === listingId);
    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      senderId: sender.id,
      receiverId,
      listingId,
      content,
      createdAt: 'Just now',
    };

    setConversations((prev) => {
      const existingIndex = prev.findIndex((c) => c.listingId === listingId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: content,
          lastMessageTime: 'Just now',
          messages: [...updated[existingIndex].messages, newMsg],
        };
        return updated;
      } else {
        const newConv: Conversation = {
          id: 'conv_' + Date.now(),
          listingId,
          listingTitle: listing?.title || 'Classified Ad',
          listingImage: listing?.images[0] || '',
          listingPrice: listing?.price || 0,
          otherUser: {
            id: receiverId,
            name: listing?.sellerName || 'Seller',
            avatar: listing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          },
          lastMessage: content,
          lastMessageTime: 'Just now',
          messages: [newMsg],
        };
        return [newConv, ...prev];
      }
    });

    toast.success('Message sent to seller!');
  }, [user, listings]);

  const getConversationByListing = useCallback((listingId: string) => {
    return conversations.find((c) => c.listingId === listingId);
  }, [conversations]);

  return (
    <SealifyContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        login,
        logout,
        listings,
        savedListingIds,
        recentlyViewedIds,
        compareListingIds,
        addRecentlyViewed,
        toggleSaveListing,
        isSaved,
        toggleCompareListing,
        isInCompare,
        clearCompare,
        filters,
        setFilters,
        resetFilters,
        createListing,
        updateListing,
        deleteListing,
        markAsSold,
        conversations,
        sendMessage,
        getConversationByListing,
        activeCategory: filters.category,
        setActiveCategory,
        loading,
      }}
    >
      {children}
    </SealifyContext.Provider>
  );
};

export const useSealify = () => {
  const context = useContext(SealifyContext);
  if (!context) throw new Error('useSealify must be used within SealifyProvider');
  return context;
};