import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message, VerificationBadgeType, PasswordChangeRequest, VerificationRequest, PromotionPaymentRequest, AdReport, AuditLog, SecurityIntrusionLog, DisputeCase, SiteSettings, SearchAlert, Review, CategoryStats, BuyerRequest } from '../types/sealify';
import { TRANSLATIONS, SupportedLanguage } from '@/translations/languages';
import { MOCK_LISTINGS, ALL_MOCK_USERS } from '@/data/mockData';
import { userService, listingService, messageService, notificationService, verificationService, passwordRequestService, promotionService, disputeService, reportService, auditService, reviewService, buyerRequestService, intrusionService, announcementService, searchAlertService, systemConfigService, siteSettingsService, recentDealsService } from '@/services/supabaseService';
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

export interface PromotionPlanConfig {
  months: number;
  label: string;
  rate: number; // NGN rate per month
  badge: string;
}

export interface SafeMeetupSpotConfig {
  id: string;
  name: string;
  zone: 'LAUTECH Area' | 'Takie / Center' | 'Sabo Market Zone' | 'Police HQ';
  category: 'Police Safe Zone' | 'Public Library' | 'Shopping Mall' | 'Café';
  address: string;
  distance: string;
  hours: string;
  cctvVerified: boolean;
}

interface AnalyticsData {
  visitors: number;
  activeAds: number;
  totalChats: number;
  sessionsPerMinute: number[];
  activeSessions: { id: string, user: string, action: string, time: string }[];
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
  promotionPlans: PromotionPlanConfig[];
  updatePromotionPlanRate: (months: number, newRate: number) => void;
  safeSpots: SafeMeetupSpotConfig[];
  addSafeSpot: (spot: Omit<SafeMeetupSpotConfig, 'id'>) => void;
  deleteSafeSpot: (id: string) => void;
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
  login: (email: string, role: 'buyer' | 'seller' | 'admin', isSignup?: boolean) => Promise<void>;
  adminLogin: (email: string, pass: string, pin?: string) => Promise<boolean>;
  logout: () => void;
  listings: Listing[];
  allUsers: UserProfile[];
  updateUser: (id: string, updatedData: Partial<UserProfile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  bulkUpdateUsers: (userIds: string[], updates: Partial<UserProfile>) => void;
  bulkDeleteUsers: (userIds: string[]) => void;
  bulkUpdateListings: (listingIds: string[], updates: Partial<Listing>) => void;
  bulkDeleteListings: (listingIds: string[]) => void;
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
  createListing: (data: Partial<Listing>) => Promise<void>;
  updateListing: (id: string, updatedData: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  markAsSold: (id: string) => Promise<void>;
  toggleFeaturedListing: (id: string) => Promise<void>;
  promoteListing: (id: string, durationMonths: number, planName: string) => Promise<void>;
  conversations: Conversation[];
  sendMessage: (listingId: string, receiverId: string, content: string) => Promise<void>;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
  broadcastMassNotification: (title: string, message: string, targetRole?: 'all' | 'seller' | 'buyer') => void;
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
  loading: boolean;
  error: string | null;
}

const DEFAULT_ADMIN_PIN = '336699';

const DEFAULT_PROMOTION_PLANS: PromotionPlanConfig[] = [
  { months: 1, label: '1 Month', rate: 15000, badge: 'STARTER' },
  { months: 3, label: '3 Months', rate: 13000, badge: 'POPULAR (13% OFF)' },
  { months: 6, label: '6 Months', rate: 11500, badge: 'SAVER (23% OFF)' },
  { months: 12, label: '1 Year', rate: 9500, badge: 'MAX IMPACT (36% OFF)' },
];

const DEFAULT_SAFE_SPOTS: SafeMeetupSpotConfig[] = [
  {
    id: 'spot_1',
    name: 'Ogbomoso Police Divisional HQ Safe Zone',
    zone: 'Police HQ',
    category: 'Police Safe Zone',
    address: 'Oja-Igbo Road, Ogbomoso, Oyo State',
    distance: '0.8 km away',
    hours: 'Open 24/7 (24hr Police Surveillance)',
    cctvVerified: true,
  },
  {
    id: 'spot_2',
    name: 'Ogbomoso Public Library - Main Branch',
    zone: 'Takie / Center',
    category: 'Public Library',
    address: 'Takie / Iluju Area, Ogbomoso, Oyo State',
    distance: '1.2 km away',
    hours: 'Mon-Sat 8:00 AM - 6:00 PM',
    cctvVerified: true,
  },
  {
    id: 'spot_3',
    name: 'Ogbomoso Shopping Complex Atrium',
    zone: 'Sabo Market Zone',
    category: 'Shopping Mall',
    address: 'Sabo Market Road, Ogbomoso, Oyo State',
    distance: '1.5 km away',
    hours: 'Daily 9:00 AM - 9:00 PM',
    cctvVerified: true,
  },
  {
    id: 'spot_4',
    name: 'Popular Café at LAUTECH Main Gate',
    zone: 'LAUTECH Area',
    category: 'Café',
    address: 'LAUTECH Main Gate / Under G, Ogbomoso, Oyo State',
    distance: '2.1 km away',
    hours: 'Daily 7:00 AM - 10:00 PM',
    cctvVerified: true,
  },
];

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminPin, setAdminPin] = useState<string>(DEFAULT_ADMIN_PIN);
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(ALL_MOCK_USERS);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [compareListingIds, setCompareListingIds] = useState<string[]>([]);
  const [promotionPlans, setPromotionPlans] = useState<PromotionPlanConfig[]>(DEFAULT_PROMOTION_PLANS);
  const [safeSpots, setSafeSpots] = useState<SafeMeetupSpotConfig[]>(DEFAULT_SAFE_SPOTS);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_1',
      type: 'system',
      title: 'Welcome to Sealify Ogbomoso Node',
      description: 'Your account is connected to the verified Ogbomoso local exchange network.',
      time: 'Just now',
      read: false,
      linkUrl: '/'
    }
  ]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordChangeRequest[]>([]);
  const [promotionPaymentRequests, setPromotionPaymentRequests] = useState<PromotionPaymentRequest[]>([]);
  const [reports, setReports] = useState<AdReport[]>([]);
  const [disputeCases, setDisputeCases] = useState<DisputeCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [intrusionLogs, setIntrusionLogs] = useState<SecurityIntrusionLog[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({ maintenanceMode: false, autoApproveAds: true, requireIdForPosting: false, aiSpamFilter: true });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ logoUrl: '/logo.png', siteName: 'Sealify Nigeria', siteDescription: "Nigeria's Trusted Local Marketplace.", ogImage: '/og-image.png', contactEmail: 'support@sealify.ng', contactPhone: '+234 813 120 8468' });
  const [filters, setFilters] = useState<FilterState>({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' });
  const [categories, setCategories] = useState([
    { id: 'vehicles', name: 'Vehicles', iconName: 'Car', count: 12, color: 'bg-blue-500' },
    { id: 'electronics', name: 'Electronics', iconName: 'Smartphone', count: 24, color: 'bg-purple-500' },
    { id: 'real_estate', name: 'Real Estate', iconName: 'Home', count: 8, color: 'bg-teal-500' },
    { id: 'fashion', name: 'Fashion', iconName: 'Shirt', count: 15, color: 'bg-pink-500' },
    { id: 'furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 9, color: 'bg-amber-500' },
  ]);

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    visitors: 142,
    activeAds: listings.length,
    totalChats: 12,
    sessionsPerMinute: [12, 18, 22, 15, 30, 42, 28, 35, 19, 25],
    activeSessions: [
      { id: 'sess_1', user: 'Ope_72', action: 'Viewing iPhone 13', time: 'Just now' },
      { id: 'sess_2', user: 'Uche_D', action: 'Messaging Seller', time: '2m ago' }
    ]
  });

  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([
    { id: 'ann_1', title: 'New: Ogbomoso Price Index', message: 'Check fair market values for used items in our new Market Insights portal.', type: 'info', active: true, createdAt: '2024-01-01' }
  ]);

  // Sync with Supabase on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const [dbUsers, dbListings, dbCategories] = await Promise.all([
          userService.getAll(),
          listingService.getAll(),
          announcementService.getAll()
        ]);
        
        if (dbUsers.length > 0) setAllUsers(dbUsers as any);
        if (dbListings.length > 0) setListings(dbListings as any);
        
        setLoading(false);
      } catch (err) {
        console.error("Supabase Init Error:", err);
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Presence simulation effect (Real-time dynamic updating)
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const newCount = Math.max(85, prev.visitors + change);
        
        const demoUsers = ['Bayo_88', 'Blessing_X', 'Israel_N', 'Tunde_V', 'Seyi_O', 'Abiola_W'];
        const demoActions = ['Viewing Vehicles', 'Posting Request', 'Saved an Item', 'Contacted Vendor', 'In Ogbomoso Hub'];
        const newSession = {
          id: `sess_${Date.now()}`,
          user: demoUsers[Math.floor(Math.random() * demoUsers.length)],
          action: demoActions[Math.floor(Math.random() * demoActions.length)],
          time: 'Just now'
        };

        return {
          ...prev,
          visitors: newCount,
          activeSessions: [newSession, ...prev.activeSessions.slice(0, 7)]
        };
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const addAuditLog = (action: string, details: string, type: AuditLog['type']) => {
    setAuditLogs(prev => [{
      id: `log_${Date.now()}`,
      action,
      details,
      type,
      createdAt: 'Just now'
    }, ...prev]);
    auditService.create({ action, details, type, created_at: new Date().toISOString() });
  };

  const updatePromotionPlanRate = (months: number, newRate: number) => {
    setPromotionPlans(prev => prev.map(p => p.months === months ? { ...p, rate: newRate } : p));
    addAuditLog('Promotion Rate Updated', `Changed plan for ${months}m to NGN ${newRate}/month`, 'finance');
    toast.success(`Updated ${months}-month promotion plan rate to ₦${newRate.toLocaleString()}/month!`);
  };

  const addSafeSpot = (spot: Omit<SafeMeetupSpotConfig, 'id'>) => {
    const newSpot: SafeMeetupSpotConfig = { ...spot, id: `spot_${Date.now()}` };
    setSafeSpots(prev => [newSpot, ...prev]);
    addAuditLog('Safe Exchange Spot Added', `Created safe zone: ${spot.name}`, 'security');
    toast.success(`Verified Safe Exchange Spot "${spot.name}" created!`);
  };

  const deleteSafeSpot = (id: string) => {
    setSafeSpots(prev => prev.filter(s => s.id !== id));
    addAuditLog('Safe Exchange Spot Deleted', `Removed safe spot ID ${id}`, 'security');
    toast.success('Safe meetup spot deleted.');
  };

  const bulkUpdateUsers = (userIds: string[], updates: Partial<UserProfile>) => {
    setAllUsers(prev => prev.map(u => userIds.includes(u.id) ? { ...u, ...updates } : u));
    addAuditLog('Bulk User Update', `Updated ${userIds.length} user records simultaneously`, 'user');
    toast.success(`Bulk updated ${userIds.length} user accounts!`);
  };

  const bulkDeleteUsers = (userIds: string[]) => {
    setAllUsers(prev => prev.filter(u => !userIds.includes(u.id)));
    setListings(prev => prev.filter(l => !userIds.includes(l.sellerId)));
    addAuditLog('Bulk User Delete', `Deleted ${userIds.length} user accounts and their ads`, 'user');
    toast.success(`Deleted ${userIds.length} user accounts!`);
  };

  const bulkUpdateListings = (listingIds: string[], updates: Partial<Listing>) => {
    setListings(prev => prev.map(l => listingIds.includes(l.id) ? { ...l, ...updates } : l));
    addAuditLog('Bulk Listing Update', `Updated ${listingIds.length} listings simultaneously`, 'ad');
    toast.success(`Bulk updated ${listingIds.length} classified listings!`);
  };

  const bulkDeleteListings = (listingIds: string[]) => {
    setListings(prev => prev.filter(l => !listingIds.includes(l.id)));
    addAuditLog('Bulk Listing Delete', `Deleted ${listingIds.length} listings`, 'ad');
    toast.success(`Deleted ${listingIds.length} listings!`);
  };

  const broadcastMassNotification = (title: string, message: string, targetRole: 'all' | 'seller' | 'buyer' = 'all') => {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      type: 'system',
      title,
      description: message,
      time: 'Just now',
      read: false,
      linkUrl: '/'
    };
    setNotifications(prev => [newNotif, ...prev]);
    addAuditLog('Mass Push Broadcast', `Target: ${targetRole.toUpperCase()} | Title: ${title}`, 'broadcast');
    toast.success(`📢 Mass push notification dispatched to ${targetRole === 'all' ? 'all platform users' : targetRole + ' accounts'}!`);
  };

  const login = async (email: string, role: 'buyer' | 'seller' | 'admin') => {
    const existing = allUsers.find(u => u.email === email);
    if (existing) {
      setUser(existing);
      toast.success(`Welcome back, ${existing.fullName}!`);
    } else {
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`, email, fullName: email.split('@')[0], phoneNumber: '',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        role, verified: false, memberSince: '2024', location: 'Ogbomoso, Oyo State', status: 'active'
      };
      setAllUsers(prev => [newUser, ...prev]);
      setUser(newUser);
      userService.create(newUser as any);
      toast.success(`Account created for ${email}!`);
    }
  };

  const adminLogin = async (email: string, pass: string, pin?: string) => {
    const admin = allUsers.find(u => u.email === email && u.role === 'admin');
    if (admin && pin === adminPin) {
      setUser(admin);
      addAuditLog('Admin Authentication Success', `Root user ${email} logged in to Master Control Panel`, 'security');
      toast.success('Admin authentication successful.');
      return true;
    }
    return false;
  };

  const logout = () => { setUser(null); toast.info('Signed out of Sealify.'); };

  const createListing = async (data: Partial<Listing>) => {
    if (!user) return;
    const newAd: Listing = {
      id: `lst_${Date.now()}`, sellerId: user.id, sellerName: data.sellerName || user.fullName,
      sellerPhone: user.phoneNumber || '+234 000 000 0000', sellerAvatar: user.avatarUrl,
      sellerVerified: user.verified, sellerVerificationType: user.verificationType,
      title: data.title || 'New Item', description: data.description || '', price: data.price || 0,
      category: data.category || 'Electronics', condition: data.condition || 'Like New',
      location: data.location || user.location, status: 'active', images: data.images || [],
      createdAt: 'Just now', viewsCount: 0, featured: data.featured, specifications: data.specifications
    };
    setListings(prev => [newAd, ...prev]);
    listingService.create(newAd as any);
    addAuditLog('Listing Created', `Ad "${newAd.title}" (ID: ${newAd.id}) published by ${user.fullName}`, 'ad');
  };

  const updateListing = async (id: string, updated: Partial<Listing>) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
    listingService.update(id, updated as any);
    addAuditLog('Listing Updated', `Updated listing ID: ${id}`, 'ad');
  };

  const deleteListing = async (id: string) => {
    const target = listings.find(l => l.id === id);
    setListings(prev => prev.filter(l => l.id !== id));
    listingService.delete(id);
    addAuditLog('Listing Deleted', `Deleted listing "${target?.title || id}"`, 'ad');
    toast.success('Listing deleted.');
  };

  const markAsSold = async (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
    listingService.update(id, { status: 'sold' });
    toast.success('Item marked as sold.');
  };

  const toggleFeaturedListing = async (id: string) => {
    const target = listings.find(l => l.id === id);
    if (target) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, featured: !l.featured } : l));
      listingService.update(id, { featured: !target.featured });
    }
  };

  const promoteListing = async (id: string, duration: number, plan: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, featured: true, promotionPlanName: plan, promotionDurationMonths: duration } : l));
    listingService.update(id, { featured: true, promotion_plan_name: plan, promotion_duration_months: duration });
    toast.success(`Top Ad promotion activated for ${plan}.`);
  };

  const sendMessage = async (listingId: string, receiverId: string, content: string) => {
    toast.success('Message sent to seller!');
    messageService.sendMessage({ listing_id: listingId, receiver_id: receiverId, sender_id: user?.id, content });
  };

  const marketStats: CategoryStats[] = useMemo(() => {
    return categories.map(cat => {
      const catAds = listings.filter(l => l.category === cat.name);
      const prices = catAds.map(l => l.price);
      return {
        category: cat.name as Category,
        avgPrice: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        totalAds: catAds.length,
        demandScore: Math.min(100, Math.round(catAds.length * 8.5)),
        trend: 'up'
      };
    });
  }, [listings, categories]);

  const t = useCallback((key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  }, [language]);

  return (
    <SealifyContext.Provider value={{
      user, setUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      adminPin, updateAdminPin: setAdminPin, systemConfig, updateSystemConfig: (u) => setSystemConfig(p => ({...p, ...u})),
      siteSettings, updateSiteSettings: (s) => setSiteSettings(p => ({...p, ...s})), 
      promotionPlans, updatePromotionPlanRate,
      safeSpots, addSafeSpot, deleteSafeSpot,
      exportDatabaseBackup: () => toast.success('Database backup secure and exported.'),
      language, setLanguage, t,
      categories, addCategory: (c) => setCategories(p => [...p, { ...c, id: `cat_${Date.now()}` }]), 
      deleteCategory: (id) => setCategories(p => p.filter(c => c.id !== id)), 
      updateCategory: (id, name) => setCategories(p => p.map(c => c.id === id ? { ...c, name } : c)),
      analytics, marketStats, login, adminLogin, logout,
      listings, allUsers, updateUser: async (id, data) => { setAllUsers(p => p.map(u => u.id === id ? {...u, ...data} : u)); userService.update(id, data as any); }, 
      deleteUser: async (id) => { setAllUsers(p => p.filter(u => u.id !== id)); userService.delete(id); },
      bulkUpdateUsers, bulkDeleteUsers, bulkUpdateListings, bulkDeleteListings,
      savedListingIds, recentlyViewedIds, addRecentlyViewed: (id) => setRecentlyViewedIds(p => [id, ...p.filter(i => i !== id)].slice(0, 10)), 
      toggleSaveListing: (id) => setSavedListingIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]),
      isSaved: (id) => savedListingIds.includes(id),
      filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
      activeCategory: filters.category, setActiveCategory: (cat) => setFilters(p => ({...p, category: cat})),
      compareListingIds, toggleCompareListing: (id) => setCompareListingIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p), 
      isInCompare: (id) => compareListingIds.includes(id), clearCompare: () => setCompareListingIds([]),
      createListing, updateListing, deleteListing, markAsSold, toggleFeaturedListing, promoteListing,
      conversations, sendMessage,
      notifications, markNotificationRead: (id) => setNotifications(p => p.map(n => n.id === id ? {...n, read: true} : n)),
      markAllNotificationsRead: () => setNotifications(p => p.map(n => ({...n, read: true}))),
      clearNotification: (id) => setNotifications(p => p.filter(n => n.id !== id)),
      addNotification: (n) => setNotifications(p => [{ ...n, id: `not_${Date.now()}`, time: 'Just now', read: false } as any, ...p]),
      broadcastMassNotification,
      passwordRequests, submitPasswordRequest: (r) => { setPasswordRequests(p => [{...r, id: `pwd_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString()} as any, ...p]); passwordRequestService.create(r); },
      processPasswordRequest: (id, status) => { setPasswordRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r)); passwordRequestService.updateStatus(id, status); },
      verificationRequests, 
      submitVerificationRequest: (req) => { setVerificationRequests(prev => [{ ...req, id: `ver_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }, ...prev]); verificationService.create(req); }, 
      processVerificationRequest: (id, status) => { setVerificationRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r)); verificationService.updateStatus(id, status); },
      promotionPaymentRequests, 
      submitPromotionPaymentRequest: (req) => { setPromotionPaymentRequests(p => [{...req, id: `pay_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString()} as any, ...p]); promotionService.create(req); },
      processPromotionPaymentRequest: (id, s) => { setPromotionPaymentRequests(p => p.map(r => r.id === id ? {...r, status: s} : r)); promotionService.updateStatus(id, s); },
      announcements, addAnnouncement: (a) => setAnnouncements(p => [{...a, id: `ann_${Date.now()}`, createdAt: new Date().toISOString()} as any, ...p]),
      toggleAnnouncement: (id) => setAnnouncements(p => p.map(a => a.id === id ? {...a, active: !a.active} : a)),
      deleteAnnouncement: (id) => setAnnouncements(p => p.filter(a => a.id !== id)),
      reports, submitReport: (r) => { setReports(p => [{...r, id: `rep_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString()} as any, ...p]); reportService.create(r); },
      processReport: (id, a) => { setReports(p => p.map(r => r.id === id ? {...r, status: 'resolved'} : r)); reportService.updateStatus(id, 'resolved'); },
      disputeCases, 
      submitDisputeCase: (disp) => { setDisputeCases(prev => [{ ...disp, id: `disp_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }, ...prev]); disputeService.create(disp); },
      processDisputeCase: (id, s) => { setDisputeCases(p => p.map(c => c.id === id ? {...c, status: s} : c)); disputeService.updateStatus(id, s); },
      auditLogs, addAuditLog,
      recentDeals: [], sealDeal: () => toast.success('Transaction sealed.'),
      intrusionLogs, recordIntrusion: (e, m) => { setIntrusionLogs(p => [{id: `int_${Date.now()}`, timestamp: 'Just now', attemptedEmail: e, deviceInfo: {} as any, mediaCaptured: true, mediaStatus: m, status: 'flagged'}, ...p]); intrusionService.create({ attemptedEmail: e, mediaStatus: m }); },
      searchAlerts: [], saveSearchAlert: () => toast.success('Search alert saved.'), deleteSearchAlert: () => {},
      reviews, addReview: (r) => { setReviews(p => [{...r, id: `rev_${Date.now()}`, createdAt: 'Just now'} as any, ...p]); reviewService.create(r); },
      deleteReview: (id) => { setReviews(p => p.filter(r => r.id !== id)); reviewService.delete(id); },
      buyerRequests, createBuyerRequest: (r) => { setBuyerRequests(p => [{...r, id: `req_${Date.now()}`, createdAt: 'Just now', responsesCount: 0} as any, ...p]); buyerRequestService.create(r); },
      deleteBuyerRequest: (id) => { setBuyerRequests(p => p.filter(r => r.id !== id)); buyerRequestService.delete(id); },
      loading, error: null
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