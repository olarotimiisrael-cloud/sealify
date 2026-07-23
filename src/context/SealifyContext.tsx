import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message, VerificationBadgeType, PasswordChangeRequest, VerificationRequest, PromotionPaymentRequest } from '../types/sealify';
import { TRANSLATIONS, SupportedLanguage } from '@/translations/languages';
import { MOCK_LISTINGS, ALL_MOCK_USERS } from '@/data/mockData';
import { toast } from 'sonner';

export interface AppNotification {
  id: string;
  type: 'price_drop' | 'message' | 'offer' | 'alert_match' | 'system' | 'recommendation' | 'payment' | 'security' | 'verification';
  title: string;
  description: string;
  time: string;
  read: boolean;
  linkUrl?: string;
}

export interface SellerReview {
  id: string;
  sellerId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface AnalyticsData {
  visitors: number;
  activeAds: number;
  totalChats: number;
  sessionsPerMinute: number[];
}

interface SealifyContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  categories: { id: string, name: string, iconName: string, count: number, color: string }[];
  addCategory: (cat: any) => void;
  deleteCategory: (id: string) => void;
  updateCategory: (id: string, name: string) => void;
  analytics: AnalyticsData;
  login: (email: string, role: 'buyer' | 'seller' | 'admin', isSignup?: boolean) => void;
  adminLogin: (email: string, pass: string) => boolean;
  logout: () => void;
  listings: Listing[];
  allUsers: UserProfile[];
  updateUser: (id: string, updatedData: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  savedListingIds: string[];
  recentlyViewedIds: string[];
  addRecentlyViewed: (id: string) => void;
  toggleSaveListing: (id: string) => void;
  isSaved: (id: string) => boolean;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  activeCategory: Category | 'All';
  setActiveCategory: (cat: Category | 'All') => void;
  compareListingIds: string[];
  toggleCompareListing: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  createListing: (data: Partial<Listing>) => void;
  updateListing: (id: string, updatedData: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  markAsSold: (id: string) => void;
  promoteListing: (id: string, durationMonths: number, planName: string) => void;
  conversations: Conversation[];
  sendMessage: (listingId: string, receiverId: string, content: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
  passwordRequests: PasswordChangeRequest[];
  submitPasswordRequest: (req: Omit<PasswordChangeRequest, 'id' | 'status' | 'createdAt'>) => void;
  processPasswordRequest: (id: string, status: 'approved' | 'declined') => void;
  verificationRequests: VerificationRequest[];
  submitVerificationRequest: (req: Omit<VerificationRequest, 'id' | 'status' | 'createdAt'>) => void;
  processVerificationRequest: (id: string, status: 'approved' | 'rejected') => void;
  promotionPaymentRequests: PromotionPaymentRequest[];
  submitPromotionPaymentRequest: (req: Omit<PromotionPaymentRequest, 'id' | 'status' | 'createdAt'>) => void;
  processPromotionPaymentRequest: (id: string, status: 'approved' | 'rejected') => void;
  reviews: SellerReview[];
  addReview: (sellerId: string, rating: number, comment: string) => void;
}

const DEFAULT_ADMIN: UserProfile = {
  id: 'usr_admin_default',
  email: 'olarotimiisrael@gmail.com',
  fullName: 'Israel Olarotimi',
  phoneNumber: '0813 120 8468',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  role: 'admin',
  verified: true,
  verificationType: 'premium',
  memberSince: 'Jan 2023',
  location: 'Ogbomoso, Oyo State',
  password: 'Tscw+1234',
};

const INITIAL_REVIEWS: SellerReview[] = [
  {
    id: 'rev_1',
    sellerId: 'usr_1',
    reviewerId: 'usr_2',
    reviewerName: 'Blessing Okonjo',
    reviewerAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100',
    rating: 5,
    comment: 'Great seller! The car was in perfect condition and the paperwork was handled smoothly.',
    createdAt: '2 weeks ago'
  },
  {
    id: 'rev_2',
    sellerId: 'usr_2',
    reviewerId: 'usr_1',
    reviewerName: 'Adebowale Ogunleye',
    reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    rating: 4,
    comment: 'Fast response and very professional. Recommended for electronics.',
    createdAt: '1 month ago'
  }
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    listingId: 'lst_100',
    listingTitle: 'Toyota Camry 2018',
    listingImage: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format',
    listingPrice: 4500000,
    otherUser: {
      id: 'usr_1',
      name: 'Adebowale Ogunleye',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    },
    lastMessage: 'Is the price slightly negotiable for cash pickup?',
    lastMessageTime: '10m ago',
    messages: [
      {
        id: 'm1',
        senderId: 'usr_1',
        receiverId: 'usr_admin_default',
        listingId: 'lst_100',
        content: 'Hello! Thanks for inspecting the Toyota Camry listing.',
        createdAt: '15m ago',
      },
      {
        id: 'm2',
        senderId: 'usr_admin_default',
        receiverId: 'usr_1',
        listingId: 'lst_100',
        content: 'Is the price slightly negotiable for cash pickup?',
        createdAt: '10m ago',
      },
    ],
  },
  {
    id: 'conv_2',
    listingId: 'lst_200',
    listingTitle: 'iPhone 15 Pro Max',
    listingImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format',
    listingPrice: 1200000,
    otherUser: {
      id: 'usr_2',
      name: 'Blessing Okonjo',
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300',
    },
    lastMessage: 'Can we meet at Ogbomoso Divisional Police HQ Safe Zone?',
    lastMessageTime: '1h ago',
    messages: [
      {
        id: 'm3',
        senderId: 'usr_2',
        receiverId: 'usr_admin_default',
        listingId: 'lst_200',
        content: 'Hi! Yes, the iPhone is brand new sealed in box.',
        createdAt: '2h ago',
      },
      {
        id: 'm4',
        senderId: 'usr_admin_default',
        receiverId: 'usr_2',
        listingId: 'lst_200',
        content: 'Can we meet at Ogbomoso Divisional Police HQ Safe Zone?',
        createdAt: '1h ago',
      },
    ],
  },
];

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('sealify_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('sealify_all_users');
    return saved ? JSON.parse(saved) : ALL_MOCK_USERS;
  });

  const [passwordRequests, setPasswordRequests] = useState<PasswordChangeRequest[]>(() => {
    const saved = localStorage.getItem('sealify_password_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem('sealify_verification_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [promotionPaymentRequests, setPromotionPaymentRequests] = useState<PromotionPaymentRequest[]>(() => {
    const saved = localStorage.getItem('sealify_promotion_payment_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<SellerReview[]>(() => {
    const saved = localStorage.getItem('sealify_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('sealify_lang') as SupportedLanguage) || 'en';
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('sealify_categories');
    return saved ? JSON.parse(saved) : [
      { id: 'vehicles', name: 'Vehicles', iconName: 'Car', count: 120, color: 'bg-blue-500' },
      { id: 'electronics', name: 'Electronics', iconName: 'Smartphone', count: 340, color: 'bg-purple-500' },
      { id: 'real_estate', name: 'Real Estate', iconName: 'Home', count: 85, color: 'bg-teal-500' },
      { id: 'fashion', name: 'Fashion', iconName: 'Shirt', count: 210, color: 'bg-pink-500' },
      { id: 'furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 95, color: 'bg-amber-500' },
      { id: 'services', name: 'Services', iconName: 'Wrench', count: 140, color: 'bg-cyan-500' },
      { id: 'jobs', name: 'Jobs', iconName: 'Briefcase', count: 60, color: 'bg-indigo-500' },
      { id: 'beauty', name: 'Beauty & Health', iconName: 'Sparkles', count: 110, color: 'bg-rose-500' },
      { id: 'utility', name: 'Utility & Energy', iconName: 'Zap', count: 15, color: 'bg-yellow-500' },
    ];
  });

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    visitors: 148,
    activeAds: MOCK_LISTINGS.length,
    totalChats: 92,
    sessionsPerMinute: [15, 22, 18, 28, 24, 35, 26, 30, 32, 40],
  });

  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('sealify_listings');
    return saved ? JSON.parse(saved) : MOCK_LISTINGS;
  });

  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [compareListingIds, setCompareListingIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' });
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('sealify_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    localStorage.setItem('sealify_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('sealify_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('sealify_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('sealify_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('sealify_password_requests', JSON.stringify(passwordRequests));
    localStorage.setItem('sealify_verification_requests', JSON.stringify(verificationRequests));
    localStorage.setItem('sealify_promotion_payment_requests', JSON.stringify(promotionPaymentRequests));
  }, [passwordRequests, verificationRequests, promotionPaymentRequests]);

  const t = useCallback((key: string) => {
    return TRANSLATIONS[language][key] || key;
  }, [language]);

  const login = (email: string, role: any) => {
    const existing = allUsers.find(u => u.email === email);
    if (existing) {
      setUser(existing);
      localStorage.setItem('sealify_user', JSON.stringify(existing));
      toast.success(`Welcome back, ${existing.fullName}!`);
    } else {
      const newUser: UserProfile = { 
        id: 'usr_' + Date.now(), 
        email, 
        fullName: email.split('@')[0], 
        phoneNumber: '', 
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', 
        role, 
        verified: false, 
        verificationType: 'none',
        memberSince: 'Just now', 
        location: 'Ogbomoso' 
      };
      setAllUsers(prev => [...prev, newUser]);
      setUser(newUser);
      localStorage.setItem('sealify_user', JSON.stringify(newUser));
      toast.success(`Account created successfully!`);
    }
  };

  const adminLogin = (email: string, pass: string) => {
    if (email === DEFAULT_ADMIN.email && pass === DEFAULT_ADMIN.password) {
      setUser(DEFAULT_ADMIN);
      localStorage.setItem('sealify_user', JSON.stringify(DEFAULT_ADMIN));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sealify_user');
  };

  const updateUser = (id: string, updatedData: Partial<UserProfile>) => {
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
    if (user?.id === id) {
      setUser(prev => prev ? { ...prev, ...updatedData } : null);
    }
  };

  const deleteUser = (id: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== id));
    toast.success('User removed from system');
  };

  const createListing = (data: any) => {
    if (!user) return;
    const newListing: Listing = {
      ...data,
      id: 'lst_' + Date.now(),
      sellerId: user.id,
      sellerName: user.fullName,
      sellerAvatar: user.avatarUrl,
      sellerPhone: user.phoneNumber || '+234 000 000 0000',
      sellerVerified: user.verified,
      sellerVerificationType: user.verificationType,
      status: 'active',
      viewsCount: 0,
      createdAt: 'Just now'
    };
    setListings(prev => [newListing, ...prev]);
    toast.success('Your ad is now live!');
  };

  const deleteListing = (id: string) => setListings(prev => prev.filter(l => l.id !== id));
  const updateListing = (id: string, data: Partial<Listing>) => setListings(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  const markAsSold = (id: string) => setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
  
  const promoteListing = (id: string, months: number, plan: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, featured: true, promotionPlanName: plan, promotionDurationMonths: months } : l));
    if (user && user.verificationType !== 'premium') {
      updateUser(user.id, { verified: true, verificationType: 'premium' });
    }
  };

  const sendMessage = (listingId: string, receiverId: string, content: string) => {
    if (!user) {
      toast.error('Please log in to send messages');
      return;
    }

    const listing = listings.find((l) => l.id === listingId);
    const receiverUser = allUsers.find((u) => u.id === receiverId) || {
      id: receiverId,
      fullName: listing?.sellerName || 'Marketplace Member',
      avatarUrl: listing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    };

    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      senderId: user.id,
      receiverId: receiverId,
      listingId: listingId,
      content,
      createdAt: 'Just now',
    };

    setConversations((prev) => {
      const existingIdx = prev.findIndex((c) => c.listingId === listingId && c.otherUser.id === receiverId);

      if (existingIdx !== -1) {
        const updated = [...prev];
        const conv = updated[existingIdx];
        updated[existingIdx] = {
          ...conv,
          lastMessage: content,
          lastMessageTime: 'Just now',
          messages: [...conv.messages, newMsg],
        };
        return updated;
      } else {
        const newConv: Conversation = {
          id: 'conv_' + Date.now(),
          listingId: listingId,
          listingTitle: listing?.title || 'Classified Item',
          listingImage: listing?.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300',
          listingPrice: listing?.price || 0,
          otherUser: {
            id: receiverUser.id,
            name: receiverUser.fullName,
            avatar: receiverUser.avatarUrl,
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

  const addNotification = useCallback((notif: any) => {
    setNotifications(prev => [{ ...notif, id: 'notif_' + Date.now(), time: 'Just now', read: false }, ...prev]);
  }, []);

  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllNotificationsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const isSaved = (id: string) => savedListingIds.includes(id);
  const toggleSaveListing = (id: string) => setSavedListingIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const addRecentlyViewed = (id: string) => setRecentlyViewedIds(prev => [id, ...prev.filter(i => i !== id)].slice(0, 10));

  const toggleCompareListing = (id: string) => {
    setCompareListingIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) {
        toast.warning("You can only compare up to 3 items at a time.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const addReview = (sellerId: string, rating: number, comment: string) => {
    if (!user) {
      toast.error('Log in to leave a review');
      return;
    }
    const newReview: SellerReview = {
      id: 'rev_' + Date.now(),
      sellerId,
      reviewerId: user.id,
      reviewerName: user.fullName,
      reviewerAvatar: user.avatarUrl,
      rating,
      comment,
      createdAt: 'Just now'
    };
    setReviews(prev => [newReview, ...prev]);
    toast.success('Review submitted successfully!');
  };

  // Password Change Logic
  const submitPasswordRequest = (req: any) => {
    const newReq: PasswordChangeRequest = {
      ...req,
      id: 'pwr_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };
    setPasswordRequests(prev => [newReq, ...prev]);
    toast.success('Password change request submitted to Admin for verification.');
  };

  const processPasswordRequest = (id: string, status: 'approved' | 'declined') => {
    const req = passwordRequests.find(r => r.id === id);
    if (!req) return;

    if (status === 'approved') {
      updateUser(req.userId, { password: req.newPassword });
      toast.success(`Email sent to ${req.userEmail}: Password change approved.`);
    } else {
      toast.error(`Email sent to ${req.userEmail}: Password reset declined.`);
    }

    setPasswordRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  // Verification Logic
  const submitVerificationRequest = (req: any) => {
    const newReq: VerificationRequest = {
      ...req,
      id: 'ver_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };
    setVerificationRequests(prev => [newReq, ...prev]);
    toast.success(`${req.type.toUpperCase()} Verification submitted to Admin!`);
  };

  const processVerificationRequest = (id: string, status: 'approved' | 'rejected') => {
    const req = verificationRequests.find(r => r.id === id);
    if (!req) return;

    if (status === 'approved') {
      updateUser(req.userId, { verified: true, verificationType: req.type });
      toast.success(`User ${req.userName} is now ${req.type.toUpperCase()} Verified!`);
    } else {
      toast.error(`Verification request for ${req.userName} rejected.`);
    }

    setVerificationRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  // Promotion Payment Logic
  const submitPromotionPaymentRequest = (req: any) => {
    const newReq: PromotionPaymentRequest = {
      ...req,
      id: 'ppr_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };
    setPromotionPaymentRequests(prev => [newReq, ...prev]);
    toast.success('Promotion payment proof submitted. Awaiting admin verification.');
  };

  const processPromotionPaymentRequest = (id: string, status: 'approved' | 'rejected') => {
    const req = promotionPaymentRequests.find(r => r.id === id);
    if (!req) return;

    if (status === 'approved') {
      const now = new Date();
      const startDate = now.toISOString();
      const endDate = new Date(now.getFullYear(), now.getMonth() + req.durationMonths, now.getDate()).toISOString();

      setListings(prev => prev.map(l => 
        l.id === req.listingId 
          ? { 
              ...l, 
              featured: true, 
              promotionPlanName: req.planName, 
              promotionDurationMonths: req.durationMonths,
              promotionStartDate: startDate,
              promotionEndDate: endDate,
              paymentStatus: 'verified',
              paymentProofUrl: req.paymentProofUrl,
              amountPaid: req.amount
            } 
          : l
      ));
      toast.success(`Promotion payment approved. Ad is now featured for ${req.durationMonths} months.`);
    } else {
      setListings(prev => prev.map(l => 
        l.id === req.listingId 
          ? { 
              ...l, 
              paymentStatus: 'failed',
              paymentProofUrl: req.paymentProofUrl
            } 
          : l
      ));
      toast.error(`Promotion payment rejected.`);
    }

    setPromotionPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <SealifyContext.Provider value={{
      user, setUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      language, setLanguage, t,
      categories, addCategory: (cat) => setCategories([...categories, { ...cat, id: 'cat_' + Date.now() }]), 
      deleteCategory: (id) => setCategories(categories.filter(c => c.id !== id)), 
      updateCategory: (id, name) => setCategories(categories.map(c => c.id === id ? { ...c, name } : c)),
      analytics, login, adminLogin, logout,
      listings, allUsers, updateUser, deleteUser,
      savedListingIds, recentlyViewedIds, addRecentlyViewed, toggleSaveListing, isSaved,
      filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
      activeCategory: filters.category,
      setActiveCategory: (cat) => setFilters(prev => ({ ...prev, category: cat })),
      compareListingIds, toggleCompareListing, isInCompare: (id) => compareListingIds.includes(id), clearCompare: () => setCompareListingIds([]),
      createListing, updateListing, deleteListing, markAsSold, promoteListing,
      conversations, sendMessage,
      notifications, markNotificationRead, markAllNotificationsRead, clearNotification, addNotification,
      passwordRequests, submitPasswordRequest, processPasswordRequest,
      verificationRequests, submitVerificationRequest, processVerificationRequest,
      promotionPaymentRequests, submitPromotionPaymentRequest, processPromotionPaymentRequest,
      reviews, addReview
    }}>
      {children}
    </SealifyContext.Provider>
  );
};

export const useSealify = () => {
  const context = useContext(SealifyContext);
  if (!context) throw new Error('useSealify must be used within SealifyProvider');
  return context;
};