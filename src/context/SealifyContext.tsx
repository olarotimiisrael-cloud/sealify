import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message } from '../types/sealify';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SealifyContextType {
  user: UserProfile | null;
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

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
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
      
      // Get user from localStorage if exists
      const savedUser = localStorage.getItem('sealify_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

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

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        toast.error('Failed to load listings');
      } else if (listingsData) {
        const formattedListings: Listing[] = listingsData.map((item: any) => ({
          id: item.id,
          sellerId: item.seller_id,
          sellerName: item.seller?.full_name || 'Unknown Seller',
          sellerPhone: item.seller?.phone_number || '',
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

      // Fetch conversations
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      } else if (messagesData) {
        // Group messages by listing
        const convMap = new Map<string, Conversation>();
        messagesData.forEach((msg: any) => {
          if (!convMap.has(msg.listing_id)) {
            convMap.set(msg.listing_id, {
              id: `conv_${msg.listing_id}`,
              listingId: msg.listing_id,
              listingTitle: '',
              listingImage: '',
              listingPrice: 0,
              otherUser: {
                id: msg.receiver_id,
                name: '',
                avatar: '',
              },
              lastMessage: msg.content,
              lastMessageTime: msg.created_at,
              messages: [],
            });
          }
          const conv = convMap.get(msg.listing_id)!;
          conv.messages.push({
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            listingId: msg.listing_id,
            content: msg.content,
            createdAt: msg.created_at,
          });
        });
        setConversations(Array.from(convMap.values()));
      }

      setLoading(false);
    };

    initializeData();

    // Set up real-time listener for new messages
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const newMsg = payload.new as any;
        setConversations(prev => {
          const existing = prev.find(c => c.listingId === newMsg.listing_id);
          if (existing) {
            return prev.map(c => 
              c.listingId === newMsg.listing_id
                ? {
                    ...c,
                    lastMessage: newMsg.content,
                    lastMessageTime: newMsg.created_at,
                    messages: [...c.messages, {
                      id: newMsg.id,
                      senderId: newMsg.sender_id,
                      receiverId: newMsg.receiver_id,
                      listingId: newMsg.listing_id,
                      content: newMsg.content,
                      createdAt: newMsg.created_at,
                    }]
                  }
                : c
            );
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const login = useCallback((email: string, role: 'buyer' | 'seller') => {
    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 6),
      email,
      fullName: email.split('@')[0].replace('.', ' '),
      phoneNumber: '+1 (555) 019-2831',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role,
      verified: true,
      memberSince: 'Just now',
      location: 'New York, NY',
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
    if (!user) {
      toast.error('Please login to post an ad');
      return;
    }

    try {
      const { data: newListing, error } = await supabase
        .from('listings')
        .insert({
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          condition: data.condition,
          location: data.location,
          images: data.images,
          seller_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const formattedListing: Listing = {
        id: newListing.id,
        sellerId: user.id,
        sellerName: user.fullName,
        sellerPhone: user.phoneNumber,
        sellerAvatar: user.avatarUrl,
        sellerVerified: user.verified,
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        location: data.location,
        status: 'active',
        images: data.images,
        createdAt: new Date().toISOString(),
        viewsCount: 1,
      };

      setListings((prev) => [formattedListing, ...prev]);
      toast.success('Your ad was posted successfully!');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing');
    }
  }, [user]);

  const updateListing = useCallback(async (id: string, updatedData: Partial<Listing>) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          title: updatedData.title,
          description: updatedData.description,
          price: updatedData.price,
          condition: updatedData.condition,
          location: updatedData.location,
        })
        .eq('id', id);

      if (error) throw error;

      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
      );
      toast.success('Listing details updated successfully!');
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing');
    }
  }, []);

  const deleteListing = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setListings((prev) => prev.filter((item) => item.id !== id));
      toast.success('Listing deleted');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  }, []);

  const markAsSold = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', id);

      if (error) throw error;

      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'sold' as const } : l))
      );
      toast.success('Listing marked as sold!');
    } catch (error) {
      console.error('Error marking as sold:', error);
      toast.error('Failed to update listing status');
    }
  }, []);

  const sendMessage = useCallback(async (listingId: string, receiverId: string, content: string) => {
    if (!user) {
      toast.error('Please log in to send a message');
      return;
    }

    try {
      const { error } = await supabase.from('messages').insert({
        listing_id: listingId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: content,
      });

      if (error) throw error;

      const listing = listings.find((l) => l.id === listingId);
      const newMsg: Message = {
        id: 'msg_' + Date.now(),
        senderId: user.id,
        receiverId,
        listingId,
        content,
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) => {
        const existingIndex = prev.findIndex((c) => c.listingId === listingId);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: content,
            lastMessageTime: new Date().toISOString(),
            messages: [...updated[existingIndex].messages, newMsg],
          };
          return updated;
        } else {
          const newConv: Conversation = {
            id: 'conv_' + Date.now(),
            listingId,
            listingTitle: listing?.title || 'Listing',
            listingImage: listing?.images[0] || '',
            listingPrice: listing?.price || 0,
            otherUser: {
              id: receiverId,
              name: listing?.sellerName || 'Seller',
              avatar: listing?.sellerAvatar || '',
            },
            lastMessage: content,
            lastMessageTime: new Date().toISOString(),
            messages: [newMsg],
          };
          return [newConv, ...prev];
        }
      });

      toast.success('Message sent to seller!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }, [user, listings]);

  const getConversationByListing = useCallback((listingId: string) => {
    return conversations.find((c) => c.listingId === listingId);
  }, [conversations]);

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