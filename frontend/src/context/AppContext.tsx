import React, { createContext, useContext, useState, useEffect } from 'react';
import { Listing, UserProfile, SearchFilter, Message } from '@/types';
import { MOCK_LISTINGS, MOCK_USER, MOCK_MESSAGES } from '@/data/mockData';
import { toast } from 'sonner';

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  listings: Listing[];
  savedIds: string[];
  toggleSaveListing: (listingId: string) => void;
  addListing: (newListing: Omit<Listing, 'id' | 'created_at' | 'views_count' | 'seller_id' | 'status'>) => void;
  deleteListing: (id: string) => void;
  markAsSold: (id: string) => void;
  messages: Message[];
  sendMessage: (listingId: string, receiverId: string, content: string) => void;
  searchFilter: SearchFilter;
  setSearchFilter: React.Dispatch<React.SetStateAction<SearchFilter>>;
  resetFilters: () => void;
  activeChatListing: Listing | null;
  setActiveChatListing: (listing: Listing | null) => void;
}

const initialFilter: SearchFilter = {
  query: '',
  category: 'all',
  minPrice: null,
  maxPrice: null,
  condition: 'all',
  location: '',
  sortBy: 'newest',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(MOCK_USER as any);
  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('sealify_listings');
    return saved ? JSON.parse(saved) : MOCK_LISTINGS;
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('sealify_saved');
    return saved ? JSON.parse(saved) : ['lst_2'];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('sealify_messages');
    return saved ? JSON.parse(saved) : MOCK_MESSAGES;
  });

  const [searchFilter, setSearchFilter] = useState<SearchFilter>(initialFilter);
  const [activeChatListing, setActiveChatListing] = useState<Listing | null>(null);

  useEffect(() => {
    localStorage.setItem('sealify_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('sealify_saved', JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    localStorage.setItem('sealify_messages', JSON.stringify(messages));
  }, [messages]);

  const toggleSaveListing = (listingId: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(listingId);
      const updated = exists ? prev.filter((id) => id !== listingId) : [...prev, listingId];
      toast.success(exists ? 'Removed from saved items' : 'Saved to your favorites!');
      return updated;
    });
  };

  const addListing = (
    data: Omit<Listing, 'id' | 'created_at' | 'views_count' | 'seller_id' | 'status'>
  ) => {
    if (!currentUser) {
      toast.error('Please login to post an ad');
      return;
    }

    const newListing: Listing = {
      ...data,
      id: `lst_${Date.now()}`,
      seller_id: currentUser.id,
      seller: currentUser,
      status: 'active',
      views_count: 1,
      created_at: new Date().toISOString(),
    };

    setListings((prev) => [newListing, ...prev]);
    toast.success('Your ad was posted successfully!');
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    toast.success('Listing deleted');
  };

  const markAsSold = (id: string) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'sold' as const } : item))
    );
    toast.success('Listing marked as sold!');
  };

  const sendMessage = (listingId: string, receiverId: string, content: string) => {
    if (!currentUser) {
      toast.error('Please login to message sellers');
      return;
    }

    const listing = listings.find((l) => l.id === listingId);
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      listing_id: listingId,
      listing_title: listing?.title || 'Listing',
      listing_image: listing?.images[0],
      content,
      read: false,
      created_at: new Date().toISOString(),
      sender_name: currentUser.fullName,
      sender_avatar: currentUser.avatarUrl,
    };

    setMessages((prev) => [...prev, newMsg]);
    toast.success('Message sent to seller!');
  };

  const resetFilters = () => {
    setSearchFilter(initialFilter);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        listings,
        savedIds,
        toggleSaveListing,
        addListing,
        deleteListing,
        markAsSold,
        messages,
        sendMessage,
        searchFilter,
        setSearchFilter,
        resetFilters,
        activeChatListing,
        setActiveChatListing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};