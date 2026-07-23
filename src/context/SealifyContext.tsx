import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message, VerificationBadgeType, PasswordChangeRequest, VerificationRequest, PromotionPaymentRequest, AdReport, AuditLog } from '../types/sealify';
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

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  active: boolean;
  createdAt: string;
}

export interface MarketplaceDeal {
  id: string;
  itemTitle: string;
  price: number;
  location: string;
  time: string;
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
  adminPin: string;
  updateAdminPin: (newPin: string) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  categories: { id: string, name: string, iconName: string, count: number, color: string }[];
  addCategory: (cat: any) => void;
  deleteCategory: (id: string) => void;
  updateCategory: (id: string, name: string) => void;
  analytics: AnalyticsData;
  login: (email: string, role: 'buyer' | 'seller' | 'admin', isSignup?: boolean) => void;
  adminLogin: (email: string, pass: string, pin?: string) => boolean;
  logout: () => void;
  listings: Listing[];
  allUsers: UserProfile[];
  updateUser: (id: string, updatedData: Partial<UserProfile>, suppressSecurityDispatch?: boolean) => void;
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
  announcements: SystemAnnouncement[];
  addAnnouncement: (ann: Omit<SystemAnnouncement, 'id' | 'createdAt'>) => void;
  toggleAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  reports: AdReport[];
  submitReport: (rep: Omit<AdReport, 'id' | 'status' | 'createdAt'>) => void;
  processReport: (id: string, action: 'dismiss' | 'resolve_delete_ad') => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, type: AuditLog['type']) => void;
  recentDeals: MarketplaceDeal[];
  sealDeal: (listingId: string, buyerName: string, price: number) => void;
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

const DEFAULT_ADMIN_PIN = '336699';

const INITIAL_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: 'ann_1',
    title: 'Safe Exchange Zones Update',
    message: 'New verified police safe exchange points added at Ogbomoso Divisional HQ & LAUTECH Main Gate.',
    type: 'success',
    active: true,
    createdAt: 'Today',
  },
];

const INITIAL_DEALS: MarketplaceDeal[] = [
  { id: 'd1', itemTitle: 'iPhone 13 Pro', price: 420000, location: 'Under G, Ogbomoso', time: '12m ago' },
  { id: 'd2', itemTitle: 'Toyota Camry 2012', price: 3800000, location: 'Takie Square', time: '45m ago' },
  { id: 'd3', itemTitle: '2 Bedroom Flat', price: 250000, location: 'Aroje Area', time: '2h ago' },
];

const INITIAL_REPORTS: AdReport[] = [
  {
    id: 'rep_1',
    listingId: 'lst_100',
    listingTitle: 'Toyota Camry 2018',
    reporterName: 'Anonymous Buyer',
    reason: 'Incorrect Price or Misleading Information',
    details: 'Seller listed NGN 4,500,000 in title but said NGN 5,200,000 in message.',
    status: 'pending',
    createdAt: '1 hour ago',
  },
];

const INITIAL_AUDITS: AuditLog[] = [
  {
    id: 'aud_1',
    action: 'Administrator Session Authenticated',
    details: 'Israel Olarotimi accessed Admin Command Terminal from Ogbomoso IP',
    type: 'security',
    createdAt: 'Today 09:15 AM',
  },
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
];

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('sealify_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('sealify_admin_pin') || DEFAULT_ADMIN_PIN;
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

  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(() => {
    const saved = localStorage.getItem('sealify_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [recentDeals, setRecentDeals] = useState<MarketplaceDeal[]>(() => {
    const saved = localStorage.getItem('sealify_recent_deals');
    return saved ? JSON.parse(saved) : INITIAL_DEALS;
  });

  const [reports, setReports] = useState<AdReport[]>(() => {
    const saved = localStorage.getItem('sealify_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('sealify_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
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

  const [analytics] = useState<AnalyticsData>({
    visitors: 184,
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
    localStorage.setItem('sealify_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('sealify_recent_deals', JSON.stringify(recentDeals));
  }, [recentDeals]);

  useEffect(() => {
    localStorage.setItem('sealify_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('sealify_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('sealify_password_requests', JSON.stringify(passwordRequests));
    localStorage.setItem('sealify_verification_requests', JSON.stringify(verificationRequests));
    localStorage.setItem('sealify_promotion_payment_requests', JSON.stringify(promotionPaymentRequests));
  }, [passwordRequests, verificationRequests, promotionPaymentRequests]);

  const updateAdminPin = useCallback((newPin: string) => {
    setAdminPin(newPin);
    localStorage.setItem('sealify_admin_pin', newPin);
    toast.success(`Admin Security PIN updated successfully!`);
  }, []);

  const addAuditLog = useCallback((action: string, details: string, type: AuditLog['type']) => {
    const log: AuditLog = {
      id: 'aud_' + Date.now(),
      action,
      details,
      type,
      createdAt: 'Just now'
    };
    setAuditLogs(prev => [log, ...prev]);
  }, []);

  const addNotification = useCallback((notif: any) => {
    setNotifications(prev => [{ ...notif, id: 'notif_' + Date.now(), time: 'Just now', read: false }, ...prev]);
  }, []);

  const dispatchSecurityWelcome = useCallback((userName: string, userEmail: string, phone: string) => {
    toast.info(`Security Dispatch: Login details sent to ${userEmail} and ${phone || 'SMS'}`);
    
    addNotification({
      type: 'security',
      title: 'Password Update Approved!',
      description: `Greetings ${userName}! Your password reset has been successfully approved by the Sealify Security Team. Please proceed to login and start selling/buying seamlessly.`,
      linkUrl: '/'
    });
  }, [addNotification]);

  const t = useCallback((key: string) => {
    return TRANSLATIONS[language][key] || key;
  }, [language]);

  const login = (email: string, role: any) => {
    const existing = allUsers.find(u => u.email === email);
    if (existing) {
      setUser(existing);
      localStorage.setItem('sealify_user', JSON.stringify(existing));
      addAuditLog('User Login', `${existing.fullName} (${existing.email}) logged in`, 'user');
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
      addAuditLog('New Registration', `Registered account for ${email}`, 'user');
      toast.success(`Account created successfully!`);
    }
  };

  const adminLogin = (email: string, pass: string, pin?: string) => {
    const isEmailValid = email.trim().toLowerCase() === DEFAULT_ADMIN.email.toLowerCase();
    const isPassValid = pass === DEFAULT_ADMIN.password;
    const isPinValid = !pin || pin === adminPin;

    if (isEmailValid && isPassValid && isPinValid) {
      setUser(DEFAULT_ADMIN);
      localStorage.setItem('sealify_user', JSON.stringify(DEFAULT_ADMIN));
      addAuditLog('Admin Authenticated', `Administrator logged in with verified PIN`, 'security');
      toast.success('Authenticated as Administrator');
      return true;
    }
    
    addAuditLog('Failed Admin Access Attempt', `Failed login attempt for email: ${email}`, 'security');
    return false;
  };

  const logout = () => {
    if (user) {
      addAuditLog('User Logout', `${user.fullName} logged out`, 'user');
    }
    setUser(null);
    localStorage.removeItem('sealify_user');
  };

  const updateUser = (id: string, updatedData: Partial<UserProfile>, suppressSecurityDispatch: boolean = false) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === id) {
        if (updatedData.password && !suppressSecurityDispatch) {
          dispatchSecurityWelcome(u.fullName, u.email, u.phoneNumber);
        }
        return { ...u, ...updatedData };
      }
      return u;
    }));
    if (user?.id === id) {
      setUser(prev => prev ? { ...prev, ...updatedData } : null);
    }
    addAuditLog('User Record Updated', `Updated fields for user ID: ${id}`, 'user');
  };

  const deleteUser = (id: string) => {
    const target = allUsers.find(u => u.id === id);
    setAllUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog('User Deleted', `Removed account ${target?.fullName || id}`, 'security');
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
      sellerPhone: user.phoneNumber || '+234 813 120 8468',
      sellerVerified: user.verified,
      sellerVerificationType: user.verificationType,
      status: 'active',
      viewsCount: 0,
      createdAt: 'Just now'
    };
    setListings(prev => [newListing, ...prev]);
    addAuditLog('New Listing Posted', `Published "${newListing.title}" by ${user.fullName}`, 'ad');
    toast.success('Your ad is now live!');
  };

  const deleteListing = (id: string) => {
    const target = listings.find(l => l.id === id);
    setListings(prev => prev.filter(l => l.id !== id));
    addAuditLog('Listing Deleted', `Removed ad "${target?.title || id}"`, 'ad');
    toast.success('Ad listing deleted');
  };

  const updateListing = (id: string, data: Partial<Listing>) => setListings(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  const markAsSold = (id: string) => setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
  
  const promoteListing = (id: string, months: number, plan: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, featured: true, promotionPlanName: plan, promotionDurationMonths: months } : l));
    if (user && user.verificationType !== 'premium') {
      updateUser(user.id, { verified: true, verificationType: 'premium' });
    }
    addAuditLog('Listing Promoted', `Promoted ad ID: ${id} with ${plan}`, 'ad');
  };

  const sealDeal = useCallback((listingId: string, buyerName: string, price: number) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    markAsSold(listingId);

    const deal: MarketplaceDeal = {
      id: 'deal_' + Date.now(),
      itemTitle: listing.title,
      price,
      location: listing.location,
      time: 'Just now'
    };

    setRecentDeals(prev => [deal, ...prev].slice(0, 15));
    addAuditLog('Deal Sealed', `Transaction complete for "${listing.title}" with buyer ${buyerName}`, 'ad');
    toast.success(`🎉 Deal Sealed! Transaction proof generated for ${listing.title}.`);
  }, [listings, markAsSold, addAuditLog]);

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

    toast.success('Message sent!');
  };

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

  const submitReport = (rep: Omit<AdReport, 'id' | 'status' | 'createdAt'>) => {
    const newReport: AdReport = {
      ...rep,
      id: 'rep_' + Date.now(),
      reporterName: user?.fullName || 'Anonymous Member',
      status: 'pending',
      createdAt: 'Just now'
    };
    setReports(prev => [newReport, ...prev]);
    addAuditLog('Ad Reported', `Report logged for "${rep.listingTitle}": ${rep.reason}`, 'security');
    toast.success('Report submitted to Sealify Trust & Safety moderators');
  };

  const processReport = (id: string, action: 'dismiss' | 'resolve_delete_ad') => {
    const rep = reports.find(r => r.id === id);
    if (!rep) return;

    if (action === 'resolve_delete_ad') {
      deleteListing(rep.listingId);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
      addAuditLog('Report Action: Deleted Ad', `Deleted offending ad "${rep.listingTitle}"`, 'security');
      toast.success(`Offending ad "${rep.listingTitle}" deleted and report marked as resolved.`);
    } else {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
      addAuditLog('Report Dismissed', `Dismissed flag for "${rep.listingTitle}"`, 'security');
      toast.info('Report dismissed.');
    }
  };

  const submitPasswordRequest = (req: any) => {
    const newReq: PasswordChangeRequest = {
      ...req,
      id: 'pwr_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };
    setPasswordRequests(prev => [newReq, ...prev]);
    addAuditLog('Password Reset Request', `Requested password reset with NIN for ${req.userEmail}`, 'security');
    toast.success('Password change request submitted to Admin.');
  };

  const processPasswordRequest = (id: string, status: 'approved' | 'declined') => {
    const req = passwordRequests.find(r => r.id === id);
    if (!req) return;

    if (status === 'approved') {
      updateUser(req.userId, { password: req.newPassword }, true);
      dispatchSecurityWelcome(req.userName, req.userEmail, '');
      addAuditLog('Password Reset Approved', `Approved password update for ${req.userEmail}`, 'security');
      toast.success(`Password reset for ${req.userEmail} approved!`);
    } else {
      addAuditLog('Password Reset Declined', `Declined password update for ${req.userEmail}`, 'security');
      toast.error(`Password reset for ${req.userEmail} declined.`);
    }

    setPasswordRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const submitVerificationRequest = (req: any) => {
    const newReq: VerificationRequest = {
      ...req,
      id: 'ver_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };
    setVerificationRequests(prev => [newReq, ...prev]);
    addAuditLog('Verification Request', `Submitted ${req.type} badge application for ${req.userName}`, 'verification');
    toast.success(`${req.type.toUpperCase()} Verification request submitted!`);
  };

  const processVerificationRequest = (id: string, status: 'approved' | 'rejected') => {
    const req = verificationRequests.find(r => r.id === id);
    if (!req) return;

    if (status === 'approved') {
      updateUser(req.userId, { verified: true, verificationType: req.type });
      addAuditLog('Badge Issued', `Granted ${req.type.toUpperCase()} badge to ${req.userName}`, 'verification');
      toast.success(`User ${req.userName} is now ${req.type.toUpperCase()} Verified!`);
    } else {
      addAuditLog('Verification Rejected', `Rejected ${req.type} badge for ${req.userName}`, 'verification');
      toast.error(`Verification request for ${req.userName} rejected.`);
    }

    setVerificationRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const submitPromotionPaymentRequest = (req: any) => {
    const newReq: PromotionPaymentRequest = {
      ...req,
      id: 'ppr_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };
    setPromotionPaymentRequests(prev => [newReq, ...prev]);
    addAuditLog('Promotion Payment Proof Uploaded', `Submitted payment proof for listing ID: ${req.listingId}`, 'ad');
    toast.success('Promotion payment submitted for admin review.');
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
      addAuditLog('Promotion Approved', `Verified payment and boosted listing ID: ${req.listingId}`, 'ad');
      toast.success(`Promotion payment approved for ${req.durationMonths} month(s).`);
    } else {
      setListings(prev => prev.map(l => 
        l.id === req.listingId 
          ? { ...l, paymentStatus: 'failed' } 
          : l
      ));
      toast.error(`Promotion payment rejected.`);
    }

    setPromotionPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addAnnouncement = (ann: Omit<SystemAnnouncement, 'id' | 'createdAt'>) => {
    const newAnn: SystemAnnouncement = {
      ...ann,
      id: 'ann_' + Date.now(),
      createdAt: 'Just now'
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    addAuditLog('System Broadcast Created', `Published announcement banner "${ann.title}"`, 'broadcast');
    toast.success('System Announcement published live!');
  };

  const toggleAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
    toast.info('Announcement status updated');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success('Announcement removed');
  };

  return (
    <SealifyContext.Provider value={{
      user, setUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      adminPin, updateAdminPin,
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
      announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
      reports, submitReport, processReport,
      auditLogs, addAuditLog,
      recentDeals, sealDeal
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