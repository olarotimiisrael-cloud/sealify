import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message, VerificationBadgeType, PasswordChangeRequest, VerificationRequest, PromotionPaymentRequest, AdReport, AuditLog, SecurityIntrusionLog, DisputeCase, SiteSettings, SearchAlert, Review, CategoryStats, BuyerRequest } from '../types/sealify';
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
  marketStats: CategoryStats[];
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
  toggleFeaturedListing: (id: string) => void;
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
  processDisputeCase: (id: string, status: 'pending' | 'in_review' | 'resolved') => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, type: AuditLog['type']) => void;
  recentDeals: MarketplaceDeal[];
  sealDeal: (listingId: string, buyerName: string, price: number) => void;
  intrusionLogs: SecurityIntrusionLog[];
  recordIntrusion: (email: string, mediaStatus: string) => void;
  searchAlerts: SearchAlert[];
  saveSearchAlert: (alert: Omit<SearchAlert, 'id' | 'userId' | 'createdAt' | 'matchCount'>) => void;
  deleteSearchAlert: (id: string) => void;
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  deleteReview: (id: string) => void;
  buyerRequests: BuyerRequest[];
  createBuyerRequest: (req: Omit<BuyerRequest, 'id' | 'createdAt' | 'responsesCount'>) => void;
  deleteBuyerRequest: (id: string) => void;
}

const DEFAULT_ADMIN_PIN = '336699';
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
      siteName: 'Sealify Master ControlPanel',
      siteDescription: "Nigeria's Trusted Local Marketplace. Buy, sell, and connect locally in Ogbomosoland, Oyo State, and across Nigeria.",
      ogImage: '/og-image.png',
      contactEmail: 'support@sealify.ng',
      contactPhone: '+234 813 120 8468',
    };
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('sealify_all_users');
    const baseUsers = saved ? JSON.parse(saved) : ALL_MOCK_USERS;
    if (!baseUsers.find((u: any) => u.email === DEFAULT_ADMIN.email)) {
       return [DEFAULT_ADMIN, ...baseUsers];
    }
    return baseUsers;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('sealify_reviews');
    return saved ? JSON.parse(saved) : [
      {
        id: 'rev_1',
        sellerId: 'usr_1',
        buyerId: 'usr_2',
        buyerName: 'Tunde Bakare',
        buyerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 5,
        comment: 'Very polite seller! Inspected the item at Ogbomoso Police HQ safe zone. Smooth transaction.',
        createdAt: '3 days ago'
      }
    ];
  });

  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>(() => {
    const saved = localStorage.getItem('sealify_buyer_requests');
    return saved ? JSON.parse(saved) : [
      {
        id: 'req_1',
        userId: 'usr_buyer_1',
        userName: 'Sola Adebayo',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        title: 'Looking for 3.5kVA Elepaq Soundproof Generator',
        category: 'Utility & Energy',
        maxBudget: 120000,
        location: 'Under G Area, Ogbomoso',
        description: 'Need a clean working generator with low hours for my apartment. Willing to inspect at Takie Square or LAUTECH gate.',
        createdAt: '2 hours ago',
        responsesCount: 3
      },
      {
        id: 'req_2',
        userId: 'usr_buyer_2',
        userName: 'Aisha Bello',
        userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
        title: 'URGENT: Need 2-Bedroom Apartment / Self-Contain',
        category: 'Real Estate',
        maxBudget: 250000,
        location: 'LAUTECH Main Gate / Adenike',
        description: 'Looking for a clean self-contain with personal prepaid meter and running water. Ready to pay instantly upon physical inspection.',
        createdAt: '1 day ago',
        responsesCount: 5
      }
    ];
  });

  const [searchAlerts, setSearchAlerts] = useState<SearchAlert[]>(() => {
    const saved = localStorage.getItem('sealify_search_alerts');
    return saved ? JSON.parse(saved) : [];
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
    return saved ? JSON.parse(saved) : [];
  });

  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(() => {
    const saved = localStorage.getItem('sealify_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentDeals, setRecentDeals] = useState<MarketplaceDeal[]>(() => {
    const saved = localStorage.getItem('sealify_recent_deals');
    return saved ? JSON.parse(saved) : [
      { id: 'dl_1', itemTitle: 'Toyota Camry', price: 4200000, location: 'Takie', time: '5m ago' },
      { id: 'dl_2', itemTitle: 'iPhone 13 Pro', price: 650000, location: 'Under G', time: '12m ago' },
      { id: 'dl_3', itemTitle: 'Office Chair', price: 45000, location: 'Sabo', time: '18m ago' }
    ];
  });

  const [reports, setReports] = useState<AdReport[]>(() => {
    const saved = localStorage.getItem('sealify_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('sealify_audit_logs');
    return saved ? JSON.parse(saved) : [];
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
      { id: 'cat_1', name: 'Vehicles', iconName: 'Car', count: 120, color: 'bg-blue-500' },
      { id: 'cat_2', name: 'Electronics', iconName: 'Smartphone', count: 340, color: 'bg-purple-500' },
      { id: 'cat_3', name: 'Real Estate', iconName: 'Home', count: 85, color: 'bg-teal-500' },
      { id: 'cat_4', name: 'Fashion', iconName: 'Shirt', count: 210, color: 'bg-pink-500' },
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

  const marketStats: CategoryStats[] = useMemo(() => {
    const categoriesList: Category[] = ['Vehicles', 'Electronics', 'Real Estate', 'Fashion', 'Home & Furniture', 'Services', 'Jobs', 'Beauty & Health', 'Utility & Energy'];
    
    return categoriesList.map(cat => {
      const catAds = listings.filter(l => l.category === cat);
      const prices = catAds.map(l => l.price);
      
      return {
        category: cat,
        avgPrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        totalAds: catAds.length,
        demandScore: Math.floor(Math.random() * 40) + 40, 
        trend: Math.random() > 0.5 ? 'up' : 'down'
      };
    });
  }, [listings]);

  const [savedListingIds, setSavedListingIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('sealify_saved_ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [compareListingIds, setCompareListingIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    localStorage.setItem('sealify_all_users', JSON.stringify(allUsers));
    localStorage.setItem('sealify_listings', JSON.stringify(listings));
    localStorage.setItem('sealify_categories', JSON.stringify(categories));
    localStorage.setItem('sealify_recent_deals', JSON.stringify(recentDeals));
    localStorage.setItem('sealify_audit_logs', JSON.stringify(auditLogs));
    localStorage.setItem('sealify_password_requests', JSON.stringify(passwordRequests));
    localStorage.setItem('sealify_verification_requests', JSON.stringify(verificationRequests));
    localStorage.setItem('sealify_promotion_payment_requests', JSON.stringify(promotionPaymentRequests));
    localStorage.setItem('sealify_disputeCases', JSON.stringify(disputeCases));
    localStorage.setItem('sealify_saved_ids', JSON.stringify(savedListingIds));
    localStorage.setItem('sealify_reviews', JSON.stringify(reviews));
    localStorage.setItem('sealify_search_alerts', JSON.stringify(searchAlerts));
    localStorage.setItem('sealify_system_config', JSON.stringify(systemConfig));
    localStorage.setItem('sealify_site_settings', JSON.stringify(siteSettings));
    localStorage.setItem('sealify_buyer_requests', JSON.stringify(buyerRequests));
  }, [allUsers, listings, categories, recentDeals, auditLogs, passwordRequests, verificationRequests, promotionPaymentRequests, disputeCases, savedListingIds, reviews, searchAlerts, systemConfig, siteSettings, buyerRequests]);

  const addNotification = useCallback((notif: any) => {
    setNotifications(prev => [{ ...notif, id: 'notif_' + Date.now(), time: 'Just now', read: false }, ...prev]);
  }, []);

  const saveSearchAlert = useCallback((alert: any) => {
    if (!user) return;
    const newAlert: SearchAlert = {
      ...alert,
      id: 'alt_' + Date.now(),
      userId: user.id,
      createdAt: 'Just now',
      matchCount: 0
    };
    setSearchAlerts(prev => [newAlert, ...prev]);
    toast.success(`Search alert saved for "${newAlert.query}"!`);
  }, [user]);

  const deleteSearchAlert = (id: string) => setSearchAlerts(prev => prev.filter(a => a.id !== id));

  const addReview = useCallback((rev: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = { ...rev, id: 'rev_' + Date.now(), createdAt: 'Just now' };
    setReviews(prev => [newReview, ...prev]);
  }, []);

  const deleteReview = useCallback((id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    toast.success('Review removed from platform');
  }, []);

  const createBuyerRequest = useCallback((req: Omit<BuyerRequest, 'id' | 'createdAt' | 'responsesCount'>) => {
    const newReq: BuyerRequest = {
      ...req,
      id: 'req_' + Date.now(),
      createdAt: 'Just now',
      responsesCount: 0,
    };
    setBuyerRequests(prev => [newReq, ...prev]);
    toast.success('Your item request was posted to the board!');
  }, []);

  const deleteBuyerRequest = useCallback((id: string) => {
    setBuyerRequests(prev => prev.filter(r => r.id !== id));
    toast.success('Request deleted.');
  }, []);

  const updateAdminPin = useCallback((newPin: string) => {
    setAdminPin(newPin);
    localStorage.setItem('sealify_admin_pin', newPin);
    addAuditLog('PIN Update', 'Master Security Access PIN modified by Superuser', 'security');
  }, []);

  const updateSystemConfig = useCallback((updated: Partial<SystemConfig>) => {
    setSystemConfig((prev) => ({ ...prev, ...updated }));
    toast.success('System Configuration updated!');
  }, []);

  const updateSiteSettings = useCallback((updated: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...updated }));
    toast.success('Site settings updated!');
  }, []);

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

  const submitDisputeCase = useCallback((disp: Omit<DisputeCase, 'id' | 'status' | 'createdAt'>) => {
    const newCase: DisputeCase = {
      ...disp,
      id: `DISP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
      createdAt: 'Just now'
    };
    setDisputeCases(prev => [newCase, ...prev]);
    addAuditLog('Dispute Filed', `New dispute claim #${newCase.id}`, 'dispute');
  }, [addAuditLog]);

  const processDisputeCase = useCallback((id: string, status: 'pending' | 'in_review' | 'resolved') => {
    setDisputeCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast.success(`Dispute updated to ${status}`);
    addAuditLog('Dispute Updated', `Status of #${id} set to ${status}`, 'dispute');
  }, [addAuditLog]);

  const exportDatabaseBackup = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ allUsers, listings }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Sealify_Backup.json`);
    downloadAnchor.click();
    toast.success('Backup exported!');
  }, [allUsers, listings]);

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
    addAuditLog('Security Alert', `Intrusion detection log created for ${email}`, 'intrusion');
  }, [addAuditLog]);

  const broadcastMassNotification = useCallback((title: string, message: string, targetRole: 'all' | 'seller' | 'buyer') => {
    addNotification({ type: 'system', title: `📢 ${title}`, description: message });
    toast.success(`Broadcast sent!`);
    addAuditLog('Mass Broadcast', `Notification "${title}" sent to ${targetRole}`, 'broadcast');
  }, [addNotification, addAuditLog]);

  const t = useCallback((key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  }, [language]);

  const login = (email: string, role: 'buyer' | 'seller' | 'admin', isSignup?: boolean) => {
    const existing = allUsers.find(u => u.email === email);
    if (existing) {
      setUser(existing);
      localStorage.setItem('sealify_user', JSON.stringify(existing));
    } else {
      const newUser: UserProfile = { 
        id: 'usr_' + Date.now(), email, fullName: email.split('@')[0], phoneNumber: '', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', role, verified: false, memberSince: 'Just now', location: 'Ogbomoso' 
      };
      setAllUsers(prev => [...prev, newUser]);
      setUser(newUser);
      localStorage.setItem('sealify_user', JSON.stringify(newUser));
    }
  };

  const adminLogin = (email: string, pass: string, pin?: string) => {
    if (email === DEFAULT_ADMIN.email && pass === DEFAULT_ADMIN.password && (!pin || pin === adminPin)) {
      const latestAdmin = allUsers.find(u => u.email === DEFAULT_ADMIN.email) || DEFAULT_ADMIN;
      setUser(latestAdmin);
      localStorage.setItem('sealify_user', JSON.stringify(latestAdmin));
      addAuditLog('Admin Login', `Root session initialized for ${email}`, 'security');
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
    if (user?.id === id) setUser(prev => prev ? { ...prev, ...updatedData } : null);
    addAuditLog('User Update', `Modified record for UID: ${id}`, 'user');
  };

  const deleteUser = (id: string) => setAllUsers(prev => prev.filter(u => u.id !== id));

  const createListing = (data: any) => {
    if (!user) return;
    const isUserAdmin = user.role === 'admin';

    const newListing: Listing = {
      ...data, 
      id: 'lst_' + Date.now(), 
      sellerId: user.id, 
      sellerName: data.sellerName || user.fullName, 
      sellerAvatar: user.avatarUrl, 
      sellerPhone: user.phoneNumber || '+234 813 120 8468', 
      sellerVerified: isUserAdmin ? true : user.verified, 
      sellerVerificationType: isUserAdmin ? 'premium' : user.verificationType,
      status: 'active', 
      viewsCount: 0, 
      createdAt: 'Just now'
    };
    
    // Check Search Alerts
    searchAlerts.forEach(alert => {
      const matchQuery = newListing.title.toLowerCase().includes(alert.query.toLowerCase());
      const matchCategory = alert.category === 'All' || newListing.category === alert.category;
      const matchPrice = !alert.maxPrice || newListing.price <= alert.maxPrice;
      const matchLoc = !alert.location || alert.location === 'Any Location' || newListing.location.toLowerCase().includes(alert.location.toLowerCase());

      if (matchQuery && matchCategory && matchPrice && matchLoc) {
        if (alert.userId !== user.id) {
           addNotification({
             type: 'alert_match',
             title: `✨ Search Match: "${newListing.title}"`,
             description: `A new item matching your alert "${alert.query}" was just posted for ₦${newListing.price.toLocaleString()}.`,
             linkUrl: `/listing/${newListing.id}`
           });
        }
      }
    });

    setListings(prev => [newListing, ...prev]);
    addAuditLog('Ad Posted', `${isUserAdmin ? 'ADMIN OFFICIAL POST' : 'User ' + user.fullName} created "${data.title}"`, 'ad');
  };

  const updateListing = useCallback((id: string, data: Partial<Listing>) => {
    setListings(prev => {
      const listing = prev.find(l => l.id === id);
      if (listing && data.price && data.price < listing.price) {
        const dropPercent = Math.round(((listing.price - data.price) / listing.price) * 100);
        if (dropPercent >= 5) {
          addNotification({
            type: 'price_drop',
            title: `📉 Price Drop on "${listing.title}"`,
            description: `Good news! The price has dropped by ${dropPercent}%. It is now ₦${data.price.toLocaleString()}.`,
            linkUrl: `/listing/${id}`
          });
        }
      }
      return prev.map(l => l.id === id ? { ...l, ...data } : l);
    });
  }, [addNotification]);

  const toggleFeaturedListing = useCallback((id: string) => {
    setListings(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, featured: !l.featured } : l);
      return updated.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    });
    toast.success('Ad featured status updated!');
    addAuditLog('Admin Override', `Toggled Top Ad featured status for ${id}`, 'ad');
  }, [addAuditLog]);

  const deleteListing = (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
    addAuditLog('Ad Deleted', `Listing ID ${id} removed from global inventory`, 'ad');
  };

  const markAsSold = (id: string) => setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
  
  const promoteListing = useCallback((id: string, months: number, plan: string) => {
    setListings(prev => {
      const updated = prev.map(l => l.id === id ? { 
        ...l, 
        featured: true, 
        promotionPlanName: plan, 
        promotionDurationMonths: months,
        promotionStartDate: new Date().toISOString(),
        promotionEndDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString()
      } : l);

      // Re-sort listings to put all featured/promoted listings at the top
      return updated.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    });
  }, []);

  const processPromotionPaymentRequest = useCallback((id: string, status: 'approved' | 'rejected') => {
    const req = promotionPaymentRequests.find(r => r.id === id);
    if (status === 'approved' && req) {
       promoteListing(req.listingId, req.durationMonths, req.planName);

       const targetListing = listings.find(l => l.id === req.listingId);
       const adTitle = targetListing?.title || 'Featured Deal';
       const adPrice = targetListing?.price ? `₦${targetListing.price.toLocaleString()}` : '';

       // 1. Send in-app notification to all users
       addNotification({
         type: 'recommendation',
         title: `🔥 Featured Deal Alert: ${adTitle}`,
         description: `Special promoted offer now available on Sealify: "${adTitle}" (${adPrice}). Check it out today!`,
         linkUrl: `/listing/${req.listingId}`
       });

       // 2. Log mass email dispatch event
       addAuditLog(
         'Mass Email & App Push Sent', 
         `Promoted advert "${adTitle}" (Ref: ${id}) dispatched via email & in-app alerts to ${allUsers.length} registered users.`, 
         'finance'
       );

       toast.success(`🎉 Promotion Approved! Mass email & push notifications dispatched to all ${allUsers.length} users on Sealify.`);
    } else {
       toast.info(`Promotion payment request #${id} marked as ${status}`);
    }

    setPromotionPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }, [promotionPaymentRequests, promoteListing, listings, addNotification, addAuditLog, allUsers.length]);

  const sealDeal = useCallback((listingId: string, buyerName: string, price: number) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    markAsSold(listingId);
    
    const newDeal: MarketplaceDeal = {
      id: 'dl_' + Date.now(),
      itemTitle: listing.title,
      price,
      location: listing.location.split(',')[0],
      time: 'Just now'
    };
    setRecentDeals(prev => [newDeal, ...prev].slice(0, 10));
    addAuditLog('Deal Sealed', `Transaction complete for "${listing.title}" (₦${price.toLocaleString()})`, 'ad');
    toast.success(`Deal sealed! You've officially marked this item as sold.`);
  }, [listings, markAsSold, addAuditLog]);

  const sendMessage = (listingId: string, receiverId: string, content: string) => {
    if (!user) return;
    const newMsg: Message = { id: 'msg_' + Date.now(), senderId: user.id, receiverId, listingId, content, createdAt: 'Just now' };
    
    setConversations(prev => {
      const idx = prev.findIndex(c => c.listingId === listingId && (c.otherUser.id === receiverId || c.otherUser.id === user.id));
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], lastMessage: content, lastMessageTime: 'Just now', messages: [...updated[idx].messages, newMsg] };
        return updated;
      } else {
        const listing = listings.find(l => l.id === listingId);
        const otherUserObj = allUsers.find(u => u.id === receiverId);
        const newConv: Conversation = {
          id: 'conv_' + Date.now(),
          listingId,
          listingTitle: listing?.title || 'Classified Item',
          listingImage: listing?.images[0] || '',
          listingPrice: listing?.price || 0,
          otherUser: {
            id: receiverId,
            name: otherUserObj?.fullName || listing?.sellerName || 'Seller',
            avatar: otherUserObj?.avatarUrl || listing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          },
          lastMessage: content,
          lastMessageTime: 'Just now',
          messages: [newMsg],
        };
        return [newConv, ...prev];
      }
    });
  };

  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllNotificationsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const isSaved = (id: string) => savedListingIds.includes(id);
  const toggleSaveListing = (id: string) => setSavedListingIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const addRecentlyViewed = (id: string) => setRecentlyViewedIds(prev => [id, ...prev.filter(i => i !== id)].slice(0, 10));

  const toggleCompareListing = (id: string) => {
    setCompareListingIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(0, 3));
  };

  const submitReport = (rep: any) => setReports(prev => [{ ...rep, id: 'rep_' + Date.now(), status: 'pending', createdAt: 'Just now' }, ...prev]);

  const processReport = (id: string, action: 'dismiss' | 'resolve_delete_ad') => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: action === 'resolve_delete_ad' ? 'resolved' : 'dismissed' } : r));
  };

  const submitPasswordRequest = (req: any) => setPasswordRequests(prev => [{ ...req, id: 'pwr_' + Date.now(), status: 'pending', createdAt: new Date().toLocaleString() }, ...prev]);

  const processPasswordRequest = (id: string, status: 'approved' | 'declined') => {
    const req = passwordRequests.find(r => r.id === id);
    if (status === 'approved' && req) {
       updateUser(req.userId, { password: req.newPassword });
    }
    setPasswordRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Password request #${id} ${status}`);
    addAuditLog('Password Request Processed', `Status for #${id} set to ${status}`, 'verification');
  };

  const submitVerificationRequest = (req: any) => setVerificationRequests(prev => [{ ...req, id: 'ver_' + Date.now(), status: 'pending', createdAt: new Date().toLocaleString() }, ...prev]);

  const processVerificationRequest = (id: string, status: 'approved' | 'rejected') => {
    const req = verificationRequests.find(r => r.id === id);
    if (status === 'approved' && req) {
       updateUser(req.userId, { verified: true, verificationType: req.type });
    }
    setVerificationRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Verification #${id} ${status}`);
    addAuditLog('Verification Request Processed', `Status for #${id} set to ${status}`, 'verification');
  };

  const submitPromotionPaymentRequest = (req: any) => setPromotionPaymentRequests(prev => [{ ...req, id: 'ppr_' + Date.now(), status: 'pending', createdAt: new Date().toLocaleString() }, ...prev]);

  const addAnnouncement = (ann: any) => setAnnouncements(prev => [{ ...ann, id: 'ann_' + Date.now(), createdAt: 'Just now' }, ...prev]);
  const toggleAnnouncement = (id: string) => setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  const deleteAnnouncement = (id: string) => setAnnouncements(prev => prev.filter(a => a.id !== id));

  return (
    <SealifyContext.Provider value={{
      user, setUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      adminPin, updateAdminPin, systemConfig, updateSystemConfig, siteSettings, updateSiteSettings, exportDatabaseBackup,
      language, setLanguage, t,
      categories, 
      addCategory: (cat) => setCategories([...categories, { ...cat, id: 'cat_' + Date.now() }]), 
      deleteCategory: (id) => setCategories(categories.filter(c => c.id !== id)), 
      updateCategory: (id, name) => setCategories(categories.map(c => c.id === id ? { ...c, name } : c)),
      analytics, marketStats, login, adminLogin, logout,
      listings, allUsers, updateUser, deleteUser,
      savedListingIds, recentlyViewedIds, addRecentlyViewed, toggleSaveListing, isSaved,
      filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
      activeCategory: filters.category,
      setActiveCategory: (cat) => setFilters(prev => ({ ...prev, category: cat })),
      compareListingIds, toggleCompareListing, isInCompare: (id) => compareListingIds.includes(id), clearCompare: () => setCompareListingIds([]),
      createListing, updateListing, deleteListing, markAsSold, toggleFeaturedListing, promoteListing,
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
      intrusionLogs, recordIntrusion,
      searchAlerts, saveSearchAlert, deleteSearchAlert,
      reviews, addReview, deleteReview,
      buyerRequests, createBuyerRequest, deleteBuyerRequest
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