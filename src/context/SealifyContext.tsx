import React, { createContext, useContext, useState, useEffect } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message } from '../types/sealify';
import { INITIAL_LISTINGS, CURRENT_USER, INITIAL_CONVERSATIONS } from '../data/mockData';
import { toast } from 'sonner';

interface SealifyContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, role: 'buyer' | 'seller') => void;
  logout: () => void;
  listings: Listing[];
  savedListingIds: string[];
  recentlyViewedIds: string[];
  addRecentlyViewed: (id: string) => void;
  toggleSaveListing: (id: string) => void;
  isSaved: (id: string) => boolean;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  createListing: (data: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'sellerPhone' | 'sellerAvatar' | 'sellerVerified' | 'status' | 'createdAt' | 'viewsCount'>) => void;
  deleteListing: (id: string) => void;
  markAsSold: (id: string) => void;
  conversations: Conversation[];
  sendMessage: (listingId: string, receiverId: string, content: string) => void;
  getConversationByListing: (listingId: string) => Conversation | undefined;
  activeCategory: Category | 'All';
  setActiveCategory: (cat: Category | 'All') => void;
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

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(CURRENT_USER);
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [savedListingIds, setSavedListingIds] = useState<string[]>(['lst_101', 'lst_104']);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(['lst_102', 'lst_105']);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);

  const isAuthenticated = !!user;

  const login = (email: string, role: 'buyer' | 'seller') => {
    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 6),
      email,
      fullName: email.split('@')[0].replace('.', ' '),
      phoneNumber: '+1 (555) 019-2831',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      role,
      verified: true,
      memberSince: 'Just now',
      location: 'New York, NY',
    };
    setUser(newUser);
    toast.success(`Welcome back, ${newUser.fullName}!`);
  };

  const logout = () => {
    setUser(null);
    toast.info('Logged out successfully');
  };

  const addRecentlyViewed = (id: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      return [id, ...filtered].slice(0, 6);
    });
  };

  const toggleSaveListing = (id: string) => {
    setSavedListingIds((prev) => {
      if (prev.includes(id)) {
        toast.info('Removed from saved items');
        return prev.filter((item) => item !== id);
      } else {
        toast.success('Ad saved to your favorites!');
        return [...prev, id];
      }
    });
  };

  const isSaved = (id: string) => savedListingIds.includes(id);

  const resetFilters = () => setFilters(defaultFilters);

  const setActiveCategory = (category: Category | 'All') => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const createListing = (data: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'sellerPhone' | 'sellerAvatar' | 'sellerVerified' | 'status' | 'createdAt' | 'viewsCount'>) => {
    if (!user) {
      toast.error('Please login to post an ad');
      return;
    }

    const newListing: Listing = {
      ...data,
      id: 'lst_' + Math.random().toString(36).substr(2, 6),
      sellerId: user.id,
      sellerName: user.fullName,
      sellerPhone: user.phoneNumber,
      sellerAvatar: user.avatarUrl,
      sellerVerified: user.verified,
      status: 'active',
      createdAt: 'Just now',
      viewsCount: 1,
    };

    setListings((prev) => [newListing, ...prev]);
    toast.success('🎉 Your ad has been published successfully!');
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    toast.success('Listing deleted');
  };

  const markAsSold = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'sold' as const } : l))
    );
    toast.success('Listing status updated to Sold');
  };

  const getConversationByListing = (listingId: string) => {
    return conversations.find((c) => c.listingId === listingId);
  };

  const sendMessage = (listingId: string, receiverId: string, content: string) => {
    if (!user) {
      toast.error('Please log in to send a message');
      return;
    }

    const targetListing = listings.find((l) => l.id === listingId);
    if (!targetListing) return;

    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      senderId: user.id,
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
          listingTitle: targetListing.title,
          listingImage: targetListing.images[0] || '',
          listingPrice: targetListing.price,
          otherUser: {
            id: receiverId,
            name: targetListing.sellerName,
            avatar: targetListing.sellerAvatar,
          },
          lastMessage: content,
          lastMessageTime: 'Just now',
          messages: [newMsg],
        };
        return [newConv, ...prev];
      }
    });

    toast.success('Message sent to seller!');
  };

  return (
    <SealifyContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        listings,
        savedListingIds,
        recentlyViewedIds,
        addRecentlyViewed,
        toggleSaveListing,
        isSaved,
        filters,
        setFilters,
        resetFilters,
        createListing,
        deleteListing,
        markAsSold,
        conversations,
        sendMessage,
        getConversationByListing,
        activeCategory: filters.category,
        setActiveCategory,
      }}
    >
      {children}
    </SealifyContext.Provider>
  );
};

export const useSealify = () => {
  const context = useContext(SealifyContext);
  if (!context) {
    throw new Error('useSealify must be used within SealifyProvider');
  }
  return context;
};