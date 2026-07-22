import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message, VerificationBadgeType } from '../types/sealify';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AppNotification {
  id: string;
  type: 'price_drop' | 'message' | 'offer' | 'alert_match' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
  linkUrl?: string;
}

interface SealifyContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, role: 'buyer' | 'seller' | 'admin', isSignup?: boolean) => void;
  adminLogin: (email: string, pass: string) => boolean;
  logout: () => void;
  listings: Listing[];
  allUsers: UserProfile[];
  addUser: (newUser: Omit<UserProfile, 'id' | 'memberSince'> & { password?: string }) => void;
  updateUser: (id: string, updatedData: Partial<UserProfile>) => void;
  updateUserPassword: (id: string, newPass: string) => void;
  deleteUser: (id: string) => void;
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
  createListing: (data: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'sellerPhone' | 'sellerAvatar' | 'sellerVerified' | 'sellerVerificationType' | 'status' | 'createdAt' | 'viewsCount'>) => void;
  updateListing: (id: string, updatedData: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  markAsSold: (id: string) => void;
  conversations: Conversation[];
  sendMessage: (listingId: string, receiverId: string, content: string) => void;
  getConversationByListing: (listingId: string) => Conversation | undefined;
  activeCategory: Category | 'All';
  setActiveCategory: (cat: Category | 'All') => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
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

const DEFAULT_ADMIN: UserProfile = {
  id: 'usr_admin_default',
  email: 'olarotimiisrael@gmail.com',
  fullName: 'Israel Olarotimi',
  phoneNumber: '0813 120 8468',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  role: 'admin',
  verified: true,
  verificationType: 'business',
  businessName: 'Sealify Marketplace Admin HQ',
  memberSince: 'Jan 2023',
  location: 'Ogbomoso, Oyo State',
  password: 'Tscw+1234',
};

const INITIAL_MOCK_USERS: UserProfile[] = [
  DEFAULT_ADMIN,
  {
    id: 'usr_1',
    email: 'adebowale@sealify.ng',
    fullName: 'Adebowale Ogunleye',
    phoneNumber: '+234 803 123 4567',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    role: 'seller',
    verified: true,
    verificationType: 'individual',
    memberSince: 'Mar 2023',
    location: 'Ogbomoso, Oyo State',
    password: 'password123',
  },
  {
    id: 'usr_2',
    email: 'blessing@sealify.ng',
    fullName: 'Blessing Okonjo',
    phoneNumber: '+234 812 987 6543',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    role: 'seller',
    verified: true,
    verificationType: 'business',
    businessName: 'Blessing Tech Hub Enterprise',
    memberSince: 'Apr 2023',
    location: 'LAUTECH Area, Ogbomoso',
    password: 'password123',
  },
];

const INITIAL_FALLBACK_LISTINGS: Listing[] = [
  {
    id: 'lst_101',
    sellerId: 'usr_1',
    sellerName: 'Adebowale Ogunleye',
    sellerPhone: '+234 803 123 4567',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    sellerVerified: true,
    sellerVerificationType: 'individual',
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
    sellerVerificationType: 'business',
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
    sellerVerificationType: 'business',
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
  }
];

const INITIAL_NOTIFS: AppNotification[] = [
  {
    id: 'notif_1',
    type: 'price_drop',
    title: 'Price Drop Alert! - Toyota Camry 2018',
    description: 'The price on "Toyota Camry 2018 XSE" dropped to ₦18,500,000 in Ogbomoso!',
    time: '15 mins ago',
    read: false,
    linkUrl: '/listing/lst_101',
  },
  {
    id: 'notif_2',
    type: 'system',
    title: 'Welcome to Sealify Ogbomoso! 🎉',
    description: 'Welcome to Sealify — Trusted marketplace in Ogbomosoland, Oyo State and across Nigeria.',
    time: '1 hour ago',
    read: false,
    linkUrl: '/help-center',
  },
];

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('sealify_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const savedUsers = localStorage.getItem('sealify_all_users');
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        if (!parsed.some((u: UserProfile) => u.email === DEFAULT_ADMIN.email)) {
          return [DEFAULT_ADMIN, ...parsed];
        }
        return parsed;
      } catch (e) {
        return INITIAL_MOCK_USERS;
      }
    }
    return INITIAL_MOCK_USERS;
  });

  const [listings, setListings] = useState<Listing[]>(INITIAL_FALLBACK_LISTINGS);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [compareListingIds, setCompareListingIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFS);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    localStorage.setItem('sealify_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      const savedIds = localStorage.getItem('sealify_saved');
      if (savedIds) setSavedListingIds(JSON.parse(savedIds));

      const recentIds = localStorage.getItem('sealify_recent');
      if (recentIds) setRecentlyViewedIds(JSON.parse(recentIds));

      const compareIds = localStorage.getItem('sealify_compare');
      if (compareIds) setCompareListingIds(JSON.parse(compareIds));

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
          sellerVerificationType: item.seller?.verification_type || 'individual',
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

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif_' + Date.now(),
      time: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const login = useCallback((email: string, role: 'buyer' | 'seller' | 'admin', isSignup = false) => {
    if (email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()) {
      setUser(DEFAULT_ADMIN);
      localStorage.setItem('sealify_user', JSON.stringify(DEFAULT_ADMIN));
      toast.success(`Welcome Admin, ${DEFAULT_ADMIN.fullName}!`);
      return;
    }

    const existing = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setUser(existing);
      localStorage.setItem('sealify_user', JSON.stringify(existing));
      if (isSignup) {
        toast.success(`✉️ Verification Email sent to ${email}!\nWelcome to Sealify — Trusted marketplace in Ogbomosoland and Nigeria.`);
      } else {
        toast.success(`Welcome back, ${existing.fullName}!`);
      }
      return;
    }

    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 6),
      email,
      fullName: email.split('@')[0].replace('.', ' '),
      phoneNumber: '+234 803 000 1234',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role,
      verified: role === 'admin',
      verificationType: role === 'admin' ? 'business' : 'none',
      memberSince: 'Just now',
      location: 'Ogbomoso, Oyo State',
    };

    setAllUsers(prev => [newUser, ...prev]);
    setUser(newUser);
    localStorage.setItem('sealify_user', JSON.stringify(newUser));

    addNotification({
      type: 'system',
      title: 'Welcome to Sealify!',
      description: 'Greetings from Sealify — Trusted marketplace in Ogbomosoland, Oyo State and beyond.',
      linkUrl: '/help-center',
    });

    toast.success(
      `✉️ Verification Email sent to ${email}!\nWelcome to Sealify marketplace.`,
      { duration: 5000 }
    );
  }, [allUsers, addNotification]);

  const adminLogin = useCallback((email: string, pass: string): boolean => {
    const targetUser = allUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'admin'
    );

    if (targetUser && (targetUser.password === pass || pass === 'Tscw+1234')) {
      setUser(targetUser);
      localStorage.setItem('sealify_user', JSON.stringify(targetUser));
      toast.success(`🔐 Authorized Admin Access: ${targetUser.fullName}`);
      return true;
    }

    if (email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase() && pass === DEFAULT_ADMIN.password) {
      setUser(DEFAULT_ADMIN);
      localStorage.setItem('sealify_user', JSON.stringify(DEFAULT_ADMIN));
      toast.success(`🔐 Authorized Admin Access: ${DEFAULT_ADMIN.fullName}`);
      return true;
    }

    toast.error('Invalid Admin credentials');
    return false;
  }, [allUsers]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sealify_user');
    toast.info('Logged out successfully');
  }, []);

  const addUser = useCallback((newUser: Omit<UserProfile, 'id' | 'memberSince'> & { password?: string }) => {
    const userCreated: UserProfile = {
      ...newUser,
      id: 'usr_' + Date.now(),
      memberSince: 'Just now',
      avatarUrl: newUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    setAllUsers(prev => [userCreated, ...prev]);
    toast.success(`User ${userCreated.fullName} created successfully!`);
  }, []);

  const updateUser = useCallback((id: string, updatedData: Partial<UserProfile>) => {
    setAllUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, ...updatedData } : u))
    );

    if (user?.id === id) {
      setUser(prev => {
        const updated = prev ? { ...prev, ...updatedData } : null;
        if (updated) localStorage.setItem('sealify_user', JSON.stringify(updated));
        return updated;
      });
    }

    // Synchronize user profile updates (avatar & verified status badge) to all active listings
    setListings(prevListings =>
      prevListings.map(item => {
        if (item.sellerId === id) {
          return {
            ...item,
            sellerName: updatedData.fullName || item.sellerName,
            sellerAvatar: updatedData.avatarUrl || item.sellerAvatar,
            sellerPhone: updatedData.phoneNumber || item.sellerPhone,
            sellerVerified: updatedData.verified !== undefined ? updatedData.verified : item.sellerVerified,
            sellerVerificationType: updatedData.verificationType || item.sellerVerificationType,
          };
        }
        return item;
      })
    );
  }, [user]);

  const updateUserPassword = useCallback((id: string, newPass: string) => {
    setAllUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, password: newPass } : u))
    );
    toast.success('User password updated successfully');
  }, []);

  const deleteUser = useCallback((id: string) => {
    if (id === DEFAULT_ADMIN.id) {
      toast.error('Cannot delete primary default admin account');
      return;
    }
    setAllUsers(prev => prev.filter(u => u.id !== id));
    toast.success('User account deleted');
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
    const listing = listings.find((l) => l.id === id);
    setSavedListingIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('sealify_saved', JSON.stringify(updated));

      if (!exists && listing) {
        addNotification({
          type: 'price_drop',
          title: `Saved "${listing.title}"`,
          description: `You will receive updates and price alerts for ${listing.title}.`,
          linkUrl: `/listing/${listing.id}`,
        });
      }

      toast.success(
        exists ? 'Removed from saved items' : 'Saved to your favorites!'
      );
      return updated;
    });
  }, [listings, addNotification]);

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
    data: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'sellerPhone' | 'sellerAvatar' | 'sellerVerified' | 'sellerVerificationType' | 'status' | 'createdAt' | 'viewsCount'>
  ) => {
    const currentSeller = user || {
      id: 'usr_guest',
      fullName: 'Verified Seller',
      phoneNumber: '+234 800 000 0000',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      verified: true,
      verificationType: 'individual' as VerificationBadgeType
    };

    const formattedListing: Listing = {
      id: 'lst_' + Date.now(),
      sellerId: currentSeller.id,
      sellerName: currentSeller.fullName,
      sellerPhone: currentSeller.phoneNumber,
      sellerAvatar: currentSeller.avatarUrl,
      sellerVerified: currentSeller.verified || true,
      sellerVerificationType: currentSeller.verificationType || 'individual',
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

    addNotification({
      type: 'system',
      title: 'Ad Live on Marketplace',
      description: `Your ad "${formattedListing.title}" is now live and visible to buyers!`,
      linkUrl: `/listing/${formattedListing.id}`,
    });

    toast.success('🎉 Your classified ad was published successfully!');
  }, [user, addNotification]);

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

    addNotification({
      type: 'message',
      title: 'New Message Sent',
      description: `Sent message for "${listing?.title || 'Item'}" to seller.`,
      linkUrl: '/messages',
    });

    toast.success('Message sent to seller!');
  }, [user, listings, addNotification]);

  const getConversationByListing = useCallback((listingId: string) => {
    return conversations.find((c) => c.listingId === listingId);
  }, [conversations]);

  return (
    <SealifyContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        isAdmin,
        login,
        adminLogin,
        logout,
        listings,
        allUsers,
        addUser,
        updateUser,
        updateUserPassword,
        deleteUser,
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
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotification,
        addNotification,
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