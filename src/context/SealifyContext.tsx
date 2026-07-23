import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message, VerificationBadgeType, PasswordChangeRequest, VerificationRequest, PromotionPaymentRequest, AdReport, AuditLog, SecurityIntrusionLog, DisputeCase, SiteSettings } from '../types/sealify';
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

export interface SystemConfig {
  maintenanceMode: boolean;
  autoApproveAds: boolean;
  requireIdForPosting: boolean;
  aiSpamFilter: boolean;
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
  systemConfig: SystemConfig;
  updateSystemConfig: (updated: Partial<SystemConfig>) => void;
  siteSettings: SiteSettings;
  updateSiteSettings: (updated: Partial<SiteSettings>) => void;
  exportDatabaseBackup: () => void;
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
  broadcastMassNotification: (title: string, message: string, targetRole: 'all' | 'seller' | 'buyer') => void;
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
  disputeCases: DisputeCase[];
  submitDisputeCase: (disp: Omit<DisputeCase, 'id' | 'status' | 'createdAt'>) => void;
  processDisputeCase: (id: string, status: 'in_review' | 'resolved') => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, type: AuditLog['type']) => void;
  recentDeals: MarketplaceDeal[];
  sealDeal: (listingId: string, buyerName: string, price: number) => void;
  intrusionLogs: SecurityIntrusionLog[];
  recordIntrusion: (email: string, mediaStatus: string) => void;
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

const INITIAL_DISPUTES: DisputeCase[] = [
  {
    id: 'DISP-2024-8841',
    userId: 'usr_2',
    userEmail: 'chioma@gmail.com',
    receiptRef: 'RCP-2024-100293',
    itemTitle: 'iPhone 13 Pro 256GB',
    counterparty: 'Adebowale Ogunleye',
    category: 'Electronics',
    reason: 'Item Condition Misrepresentation (Undisclosed Faults)',
    details: 'The camera glass had a crack not disclosed in the listing photos.',
    status: 'in_review',
    createdAt: '2 days ago',
  },
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

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('sealify_system_config');
    return saved ? JSON.parse(saved) : {
      maintenanceMode: false,
      autoApproveAds: true,
      requireIdForPosting: false,
      aiSpamFilter: true,
    };
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('sealify_site_settings');
    return saved ? JSON.parse(saved) : {
      logoUrl: '/logo.png',
      siteName: 'Sealify Nigeria',
      siteDescription: "Nigeria's Trusted Local Marketplace. Buy, sell, and connect locally in Ogbomosoland, Oyo State, and across Nigeria.",
      ogImage: '/og-image.png',
      contactEmail: 'support@sealify.ng',
      contactPhone: '+234 813 120 8468',
    };
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

  const [disputeCases, setDisputeCases] = useState<DisputeCase[]>(() => {
    const saved = localStorage.getItem('sealify_dispute_cases');
    return saved ? JSON.parse(saved) : INITIAL_DISPUTES;
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

  const [intrusionLogs, setIntrusionLogs] = useState<SecurityIntrusionLog[]>(() => {
    const saved = localStorage.getItem('sealify_intrusion_logs');
    return saved ? JSON.parse(saved) : [];
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
    localStorage.setItem('sealify_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem('sealify_lang', language);
  }, [language]);

  const updateAdminPin = useCallback((newPin: string) => {
    setAdminPin(newPin);
    localStorage.setItem('sealify_admin_pin', newPin);
    toast.success(`Admin Security Master PIN updated to "${newPin}"!`);
  }, []);

  const updateSystemConfig = useCallback((updated: Partial<SystemConfig>) => {
    setSystemConfig((prev) => ({ ...prev, ...updated }));
    toast.success('System Configuration updated live!');
  }, []);

  const updateSiteSettings = useCallback((updated: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...updated }));
    toast.success('Site Branding & SEO Metadata updated successfully!');
  }, []);

  const exportDatabaseBackup = useCallback(() => {
    const backupData = {
      exportTimestamp: new Date().toISOString(),
      allUsers,
      listings,
      disputeCases,
      auditLogs,
      reports,
      announcements,
      siteSettings,
      systemConfig
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Sealify_Full_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Full Database Backup exported!');
  }, [allUsers, listings, disputeCases, auditLogs, reports, announcements, siteSettings, systemConfig]);

  const addAuditLog = useCallback((action: string, details: string, type: AuditLog['type']) => {
    const log: AuditLog = {
      id: 'aud_' + Date.now(),
      action,
      details,
      type,
      createdAt: new Date().toLocaleString()
    };
    setAuditLogs(prev => [log, ...prev]);
  }, []);

  const recordIntrusion = useCallback((email: string, mediaStatus: string) => {
    const intrusion: SecurityIntrusionLog = {
      id: 'INT-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      attemptedEmail: email,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        cores: navigator.hardwareConcurrency || 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      mediaCaptured: mediaStatus.includes('Captured'),
      mediaStatus,
      status: 'flagged'
    };

    setIntrusionLogs(prev => [intrusion, ...prev]);
    addAuditLog('Critical: Admin Intrusion Attempt', `Unauthorized access attempt on ${email}`, 'intrusion');
  }, [addAuditLog]);

  const addNotification = useCallback((notif: any) => {
    setNotifications(prev => [{ ...notif, id: 'notif_' + Date.now(), time: 'Just now', read: false }, ...prev]);
  }, []);

  const broadcastMassNotification = useCallback((title: string, message: string, targetRole: 'all' | 'seller' | 'buyer') => {
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now(),
      type: 'system',
      title: `📢 ${title}`,
      description: message,
      time: 'Just now',
      read: false,
      linkUrl: '/',
    };

    setNotifications(prev => [newNotif, ...prev]);
    addAuditLog('Mass Push Broadcast', `Dispatched broadcast "${title}" to members`, 'broadcast');
    toast.success(`Mass push broadcast sent!`);
  }, [addAuditLog]);

  const t = useCallback((key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  }, [language]);

  const login = (email: string, role: any, isSignup: boolean = false) => {
    const existing = allUsers.find(u => u.email === email);
    if (existing) {
      setUser(existing);
      localStorage.setItem('sealify_user', JSON.stringify(existing));
      addAuditLog('User Login', `${existing.fullName} logged in`, 'user');
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
      sellerPhone: user.phoneNumber || '+234 813 120 8468',
      sellerVerified: user.verified,
      sellerVerificationType: user.verificationType,
      status: 'active',
      viewsCount: 0,
      createdAt: 'Just now'
    };
    setListings(prev => [newListing, ...prev]);
    toast.success('Your ad is now live!');
  };

  const updateListing = (id: string, data: Partial<Listing>) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  };

  const deleteListing = (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
    toast.success('Ad listing deleted');
  };

  const markAsSold = (id: string) => setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
  
  const promoteListing = (id: string, months: number, plan: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, featured: true, promotionPlanName: plan, promotionDurationMonths: months } : l));
    toast.success('Ad promoted successfully!');
  };

  const sealDeal = useCallback((listingId: string, buyerName: string, price: number) => {
    markAsSold(listingId);
    toast.success(`Deal sealed for ₦${price.toLocaleString()}`);
  }, [markAsSold]);

  const sendMessage = (listingId: string, receiverId: string, content: string) => {
    if (!user) return;
    const listing = listings.find((l) => l.id === listingId);
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
            id: receiverId,
            name: listing?.sellerName || 'Marketplace Member',
            avatar: listing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
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
        toast.warning("You can only compare up to 3 items.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const submitReport = (rep: any) => {
    const newReport: AdReport = { ...rep, id: 'rep_' + Date.now(), status: 'pending', createdAt: 'Just now' };
    setReports(prev => [newReport, ...prev]);
    toast.success('Report submitted');
  };

  const processReport = (id: string, action: 'dismiss' | 'resolve_delete_ad') => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: action === 'resolve_delete_ad' ? 'resolved' : 'dismissed' } : r));
  };

  const submitPasswordRequest = (req: any) => {
    setPasswordRequests(prev => [...prev, { ...req, id: 'pwr_' + Date.now(), status: 'pending', createdAt: new Date().toLocaleString() }]);
    toast.success('Request submitted');
  };

  const processPasswordRequest = (id: string, status: 'approved' | 'declined') => {
    setPasswordRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const submitVerificationRequest = (req: any) => {
    setVerificationRequests(prev => [...prev, { ...req, id: 'ver_' + Date.now(), status: 'pending', createdAt: new Date().toLocaleString() }]);
    toast.success('Request submitted');
  };

  const processVerificationRequest = (id: string, status: 'approved' | 'rejected') => {
    setVerificationRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const submitPromotionPaymentRequest = (req: any) => {
    setPromotionPaymentRequests(prev => [...prev, { ...req, id: 'ppr_' + Date.now(), status: 'pending', createdAt: new Date().toLocaleString() }]);
    toast.success('Payment submitted');
  };

  const processPromotionPaymentRequest = (id: string, status: 'approved' | 'rejected') => {
    setPromotionPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addAnnouncement = (ann: any) => {
    setAnnouncements(prev => [...prev, { ...ann, id: 'ann_' + Date.now(), createdAt: 'Just now' }]);
  };

  const toggleAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  return (
    <SealifyContext.Provider value={{
      user, setUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      adminPin, updateAdminPin, systemConfig, updateSystemConfig, siteSettings, updateSiteSettings, exportDatabaseBackup,
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
      broadcastMassNotification,
      passwordRequests, submitPasswordRequest, processPasswordRequest,
      verificationRequests, submitVerificationRequest, processVerificationRequest,
      promotionPaymentRequests, submitPromotionPaymentRequest, processPromotionPaymentRequest,
      disputeCases, submitDisputeCase, processDisputeCase,
      announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
      reports, submitReport, processReport,
      auditLogs, addAuditLog,
      recentDeals, sealDeal,
      intrusionLogs, recordIntrusion
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