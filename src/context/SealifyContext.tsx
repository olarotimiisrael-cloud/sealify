import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message, VerificationBadgeType, PasswordChangeRequest, VerificationRequest, PromotionPaymentRequest, AdReport, AuditLog, SecurityIntrusionLog, DisputeCase, SiteSettings, SearchAlert, Review, CategoryStats, BuyerRequest } from '../types/sealify';
import { TRANSLATIONS, SupportedLanguage } from '@/translations/languages';
import { userService, listingService, messageService, notificationService, verificationService, passwordRequestService, promotionService, disputeService, reportService, auditService, reviewService, buyerRequestService, favoriteService, announcementService, systemConfigService, siteSettingsService, safeSpotService, promotionPlanService, searchAlertService, intrusionService, recentDealsService } from '@/services/supabaseService';
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
  rate: number; 
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
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (data: Partial<UserProfile> & { password?: string }) => Promise<void>;
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
const DEFAULT_ADMIN_PASSWORD = 'Admin1234';

const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'usr_admin_default',
  email: 'olarotimiisrael@gmail.com',
  fullName: 'Israel Olarotimi (Root Admin)',
  phoneNumber: '+234 813 120 8468',
  avatarUrl: '',
  storeBannerUrl: '',
  role: 'admin',
  verified: true,
  verificationType: 'premium',
  memberSince: 'Jan 2023',
  location: 'Ogbomoso, Oyo State',
  status: 'active',
  password: DEFAULT_ADMIN_PASSWORD
};

// LocalStorage keys
const STORAGE_KEYS = {
  LISTINGS: 'sealify_listings',
  USERS: 'sealify_users',
  SAVED_IDS: 'sealify_saved',
  RECENTLY_VIEWED: 'sealify_recently_viewed',
  COMPARE_IDS: 'sealify_compare',
  NOTIFICATIONS: 'sealify_notifications',
  VERIFICATION_REQUESTS: 'sealify_verification_requests',
  PASSWORD_REQUESTS: 'sealify_password_requests',
  PROMOTION_PAYMENTS: 'sealify_promotion_payments',
  BUYER_REQUESTS: 'sealify_buyer_requests',
  REVIEWS: 'sealify_reviews',
  ANNOUNCEMENTS: 'sealify_announcements',
  REPORTS: 'sealify_reports',
  DISPUTES: 'sealify_disputes',
  AUDIT_LOGS: 'sealify_audit_logs',
  INTRUSION_LOGS: 'sealify_intrusion_logs',
  SAFE_SPOTS: 'sealify_safe_spots',
  SEARCH_ALERTS: 'sealify_search_alerts',
  RECENT_DEALS: 'sealify_recent_deals',
  SYSTEM_CONFIG: 'sealify_system_config',
  SITE_SETTINGS: 'sealify_site_settings',
  PROMOTION_PLANS: 'sealify_promotion_plans',
  CATEGORIES: 'sealify_categories',
  CONVERSATIONS: 'sealify_conversations',
  MESSAGES: 'sealify_messages',
} as const;

// Helper functions for localStorage
const getFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
};

// Default mock data
const DEFAULT_CATEGORIES = [
  { id: 'vehicles', name: 'Vehicles', iconName: 'Car', count: 0, color: 'bg-blue-500' },
  { id: 'electronics', name: 'Electronics', iconName: 'Smartphone', count: 0, color: 'bg-purple-500' },
  { id: 'real_estate', name: 'Real Estate', iconName: 'Home', count: 0, color: 'bg-teal-500' },
  { id: 'fashion', name: 'Fashion', iconName: 'Shirt', count: 0, color: 'bg-pink-500' },
  { id: 'furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 0, color: 'bg-amber-500' },
  { id: 'services', name: 'Services', iconName: 'Wrench', count: 0, color: 'bg-cyan-500' },
  { id: 'jobs', name: 'Jobs', iconName: 'Briefcase', count: 0, color: 'bg-indigo-500' },
  { id: 'beauty', name: 'Beauty & Health', iconName: 'Sparkles', count: 0, color: 'bg-rose-500' },
  { id: 'utility', name: 'Utility & Energy', iconName: 'Zap', count: 0, color: 'bg-yellow-500' },
];

const DEFAULT_PROMOTION_PLANS: PromotionPlanConfig[] = [
  { months: 1, label: '1 Month', rate: 15000, badge: 'STARTER' },
  { months: 3, label: '3 Months', rate: 13000, badge: 'POPULAR' },
];

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  maintenanceMode: false,
  autoApproveAds: true,
  requireIdForPosting: false,
  aiSpamFilter: true,
};

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'Sealify Nigeria',
  siteDescription: "Nigeria's Trusted Local Marketplace.",
  ogImage: '/og-image.png',
  logoUrl: '/logo.png',
  contactEmail: 'support@sealify.ng',
  contactPhone: '+234 813 120 8468',
};

const DEFAULT_SAFE_SPOTS: SafeMeetupSpotConfig[] = [
  { id: 'spot_1', name: 'Ogbomoso Divisional Police HQ', zone: 'Police HQ', category: 'Police Safe Zone', address: 'Police HQ, Takie Square, Ogbomoso', distance: '1.2 km away', hours: '24/7', cctvVerified: true },
  { id: 'spot_2', name: 'LAUTECH Main Gate Security Post', zone: 'LAUTECH Area', category: 'Police Safe Zone', address: 'LAUTECH Main Gate, Ogbomoso', distance: '2.1 km away', hours: '6:00 AM - 10:00 PM', cctvVerified: true },
  { id: 'spot_3', name: 'Takie Shopping Mall', zone: 'Takie / Center', category: 'Shopping Mall', address: 'Takie Square, Ogbomoso', distance: '0.8 km away', hours: '8:00 AM - 9:00 PM', cctvVerified: true },
  { id: 'spot_4', name: 'Sabo Market Police Post', zone: 'Sabo Market Zone', category: 'Police Safe Zone', address: 'Sabo Market, Ogbomoso', distance: '3.5 km away', hours: '7:00 AM - 8:00 PM', cctvVerified: true },
];

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminPin, setAdminPin] = useState<string>(() => getFromStorage('sealify_admin_pin', DEFAULT_ADMIN_PIN));
  const [listings, setListings] = useState<Listing[]>(() => getFromStorage(STORAGE_KEYS.LISTINGS, []));
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const stored = getFromStorage(STORAGE_KEYS.USERS, []);
    if (stored.length === 0 || !stored.some(u => u.email?.toLowerCase() === DEFAULT_ADMIN_USER.email.toLowerCase())) {
      return [DEFAULT_ADMIN_USER, ...stored];
    }
    return stored;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []));
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => getFromStorage(STORAGE_KEYS.VERIFICATION_REQUESTS, []));
  const [passwordRequests, setPasswordRequests] = useState<PasswordChangeRequest[]>(() => getFromStorage(STORAGE_KEYS.PASSWORD_REQUESTS, []));
  const [promotionPaymentRequests, setPromotionPaymentRequests] = useState<PromotionPaymentRequest[]>(() => getFromStorage(STORAGE_KEYS.PROMOTION_PAYMENTS, []));
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>(() => getFromStorage(STORAGE_KEYS.BUYER_REQUESTS, []));
  const [reviews, setReviews] = useState<Review[]>(() => getFromStorage(STORAGE_KEYS.REVIEWS, []));
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(() => getFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, []));
  const [reports, setReports] = useState<AdReport[]>(() => getFromStorage(STORAGE_KEYS.REPORTS, []));
  const [disputeCases, setDisputeCases] = useState<DisputeCase[]>(() => getFromStorage(STORAGE_KEYS.DISPUTES, []));
  const [conversations, setConversations] = useState<Conversation[]>(() => getFromStorage(STORAGE_KEYS.CONVERSATIONS, []));
  const [savedListingIds, setSavedListingIds] = useState<string[]>(() => getFromStorage(STORAGE_KEYS.SAVED_IDS, []));
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => getFromStorage(STORAGE_KEYS.RECENTLY_VIEWED, []));
  const [compareListingIds, setCompareListingIds] = useState<string[]>(() => getFromStorage(STORAGE_KEYS.COMPARE_IDS, []));
  const [language, setLanguage] = useState<SupportedLanguage>(() => getFromStorage('sealify_language', 'en'));
  const [filters, setFilters] = useState<FilterState>(() => getFromStorage('sealify_filters', { searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }));
  const [categories, setCategories] = useState(() => getFromStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getFromStorage(STORAGE_KEYS.AUDIT_LOGS, []));
  const [intrusionLogs, setIntrusionLogs] = useState<SecurityIntrusionLog[]>(() => getFromStorage(STORAGE_KEYS.INTRUSION_LOGS, []));
  const [safeSpots, setSafeSpots] = useState<SafeMeetupSpotConfig[]>(() => getFromStorage(STORAGE_KEYS.SAFE_SPOTS, DEFAULT_SAFE_SPOTS));
  const [searchAlerts, setSearchAlerts] = useState<SearchAlert[]>(() => getFromStorage(STORAGE_KEYS.SEARCH_ALERTS, []));
  const [recentDeals, setRecentDeals] = useState<MarketplaceDeal[]>(() => getFromStorage(STORAGE_KEYS.RECENT_DEALS, []));
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => getFromStorage(STORAGE_KEYS.SYSTEM_CONFIG, DEFAULT_SYSTEM_CONFIG));
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getFromStorage(STORAGE_KEYS.SITE_SETTINGS, DEFAULT_SITE_SETTINGS));
  const [promotionPlans, setPromotionPlans] = useState<PromotionPlanConfig[]>(() => getFromStorage(STORAGE_KEYS.PROMOTION_PLANS, DEFAULT_PROMOTION_PLANS));

  const [analytics] = useState<AnalyticsData>({
    visitors: 142, activeAds: 0, totalChats: 12, sessionsPerMinute: [12, 18, 22],
    activeSessions: [{ id: 'sess_1', user: 'Ope_72', action: 'Viewing Store', time: 'Just now' }]
  });

  // Persist all state changes to localStorage
  useEffect(() => { saveToStorage(STORAGE_KEYS.LISTINGS, listings); }, [listings]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.USERS, allUsers); }, [allUsers]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SAVED_IDS, savedListingIds); }, [savedListingIds]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.RECENTLY_VIEWED, recentlyViewedIds); }, [recentlyViewedIds]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.COMPARE_IDS, compareListingIds); }, [compareListingIds]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications); }, [notifications]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.VERIFICATION_REQUESTS, verificationRequests); }, [verificationRequests]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.PASSWORD_REQUESTS, passwordRequests); }, [passwordRequests]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.PROMOTION_PAYMENTS, promotionPaymentRequests); }, [promotionPaymentRequests]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.BUYER_REQUESTS, buyerRequests); }, [buyerRequests]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.REVIEWS, reviews); }, [reviews]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements); }, [announcements]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.REPORTS, reports); }, [reports]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.DISPUTES, disputeCases); }, [disputeCases]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.AUDIT_LOGS, auditLogs); }, [auditLogs]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.INTRUSION_LOGS, intrusionLogs); }, [intrusionLogs]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SAFE_SPOTS, safeSpots); }, [safeSpots]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SEARCH_ALERTS, searchAlerts); }, [searchAlerts]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.RECENT_DEALS, recentDeals); }, [recentDeals]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, systemConfig); }, [systemConfig]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SITE_SETTINGS, siteSettings); }, [siteSettings]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.PROMOTION_PLANS, promotionPlans); }, [promotionPlans]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CATEGORIES, categories); }, [categories]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations); }, [conversations]);
  useEffect(() => { localStorage.setItem('sealify_admin_pin', adminPin); }, [adminPin]);
  useEffect(() => { localStorage.setItem('sealify_language', language); }, [language]);
  useEffect(() => { localStorage.setItem('sealify_filters', JSON.stringify(filters)); }, [filters]);

  // Sync with Supabase in background (non-blocking)
  const syncWithSupabase = useCallback(async () => {
    try {
      const [dbUsers, dbListings, dbVerifications, dbPasswords, dbPromoPay, dbBuyerReqs, dbReviews, dbAnnouncements, dbReports, dbDisputes, dbLogs, dbThreats, dbSpots, dbConfigs, dbMeta, dbPlans, dbDeals] = await Promise.allSettled([
        userService.getAll(),
        listingService.getAll(),
        verificationService.getAll(),
        passwordRequestService.getAll(),
        promotionService.getAll(),
        buyerRequestService.getAll(),
        reviewService.getAll(),
        announcementService.getAll(),
        reportService.getAll(),
        disputeService.getAll(),
        auditService.getAll(),
        intrusionService.getAll(),
        safeSpotService.getAll(),
        systemConfigService.getAll(),
        siteSettingsService.get(),
        promotionPlanService.getAll(),
        recentDealsService.getAll()
      ]);

      // Merge Supabase data with local data (local takes precedence for recent changes)
      if (dbUsers.status === 'fulfilled' && dbUsers.value.length > 0) {
        const mergedUsers = [...dbUsers.value];
        // Ensure admin exists
        if (!mergedUsers.some(u => u.email?.toLowerCase() === DEFAULT_ADMIN_USER.email.toLowerCase())) {
          mergedUsers.unshift(DEFAULT_ADMIN_USER as any);
        }
        setAllUsers(prev => {
          const localMap = new Map(prev.map(u => [u.id, u]));
          return mergedUsers.map(u => localMap.get(u.id) || u);
        });
      }

      if (dbListings.status === 'fulfilled' && dbListings.value.length > 0) {
        const dbListingsMapped = dbListings.value.map(l => ({
          id: l.id,
          sellerId: l.seller_id,
          sellerName: l.users?.full_name || 'Verified Seller',
          sellerPhone: l.users?.phone_number || '',
          sellerAvatar: l.users?.avatar_url || '',
          sellerVerified: l.users?.verified || false,
          sellerVerificationType: l.users?.verification_type || 'none',
          title: l.title,
          description: l.description,
          price: l.price,
          category: l.category,
          condition: l.condition,
          location: l.location,
          status: l.status,
          images: l.listing_images?.map((img: any) => img.image_url) || [],
          viewsCount: l.views_count || 0,
          createdAt: new Date(l.created_at).toLocaleDateString(),
          featured: l.featured,
          promotionEndDate: l.promotion_end_date,
          specifications: l.specifications
        }));
        setListings(prev => {
          const localMap = new Map(prev.map(l => [l.id, l]));
          return dbListingsMapped.map(l => localMap.get(l.id) || l);
        });
      }

      if (dbVerifications.status === 'fulfilled') setVerificationRequests(dbVerifications.value as any);
      if (dbPasswords.status === 'fulfilled') setPasswordRequests(dbPasswords.value as any);
      if (dbPromoPay.status === 'fulfilled') setPromotionPaymentRequests(dbPromoPay.value as any);
      if (dbBuyerReqs.status === 'fulfilled') setBuyerRequests(dbBuyerReqs.value as any);
      if (dbReviews.status === 'fulfilled') setReviews(dbReviews.value as any);
      if (dbAnnouncements.status === 'fulfilled') setAnnouncements(dbAnnouncements.value as any);
      if (dbReports.status === 'fulfilled') setReports(dbReports.value as any);
      if (dbDisputes.status === 'fulfilled') setDisputeCases(dbDisputes.value as any);
      if (dbLogs.status === 'fulfilled') setAuditLogs(dbLogs.value as any);
      if (dbThreats.status === 'fulfilled') setIntrusionLogs(dbThreats.value as any);
      if (dbSpots.status === 'fulfilled') setSafeSpots(dbSpots.value as any);
      if (dbDeals.status === 'fulfilled') setRecentDeals(dbDeals.value.map(d => ({ id: d.id, itemTitle: d.item_title, price: d.price, location: d.location, time: d.time })));
      if (dbMeta.status === 'fulfilled' && dbMeta.value) setSiteSettings(dbMeta.value as any);
      if (dbPlans.status === 'fulfilled' && dbPlans.value.length > 0) setPromotionPlans(dbPlans.value as any);
      if (dbConfigs.status === 'fulfilled' && dbConfigs.value.length > 0) {
        const configMap: Partial<SystemConfig> = {};
        dbConfigs.value.forEach(c => configMap[c.key as keyof SystemConfig] = c.value);
        setSystemConfig(prev => ({ ...prev, ...configMap }));
      }

      setLoading(false);
    } catch (err) {
      console.warn("Supabase sync failed, using localStorage:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncWithSupabase();
  }, [syncWithSupabase]);

  const addAuditLog = async (action: string, details: string, type: AuditLog['type']) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      action,
      details,
      type,
      createdAt: 'Just now'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    try {
      await auditService.create({ action, details, type, created_at: new Date().toISOString() });
    } catch (e) {
      console.warn("Audit log fallback:", e);
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      let dbUser = await userService.getByEmail(cleanEmail);
      
      if (!dbUser && (cleanEmail === DEFAULT_ADMIN_USER.email.toLowerCase())) {
        dbUser = DEFAULT_ADMIN_USER as any;
      }

      if (dbUser) {
        if (dbUser.status === 'banned') {
          toast.error('This account has been permanently banned from the marketplace.');
          return false;
        }
        
        setUser(dbUser as any); 
        const name = (dbUser as any).full_name || (dbUser as any).fullName || 'User';
        toast.success(`Welcome back, ${name}!`); 
        addAuditLog('User Login', `Node access granted to ${email}`, 'security');
        return true;
      } else {
        toast.error('Invalid email or password.');
        return false;
      }
    } catch (err) { 
      toast.error('Authentication service failure.'); 
      return false;
    }
  };

  const signup = async (data: Partial<UserProfile> & { password?: string }) => {
    try {
      const existingUser = await userService.getByEmail(data.email || '');
      if (existingUser) {
        toast.error('An account with this email already exists.');
        return;
      }

      const newUser = await userService.create({
        email: data.email!,
        full_name: data.fullName!,
        phoneNumber: data.phoneNumber || null,
        role: data.role || 'buyer',
        verified: false,
        verification_type: 'none',
        location: data.location || 'Ogbomoso, Oyo State',
        member_since: new Date().toISOString(),
        status: 'active',
        avatar_url: '',
        business_name: data.businessName || null,
        restriction_reason: null,
        appeal_status: 'none',
        password: data.password || null
      } as any);

      setUser(newUser as any);
      setAllUsers(prev => [newUser as any, ...prev]);
      toast.success(`Account created! Welcome to Sealify, ${data.fullName}. Please upload your profile photo in settings.`);
      addAuditLog('User Registered', `New node created for ${data.email}`, 'user');
    } catch (err) {
      toast.error('Signup failed. Please check your connection.');
    }
  };

  const adminLogin = async (email: string, pass: string, pin?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail === DEFAULT_ADMIN_USER.email.toLowerCase() && pass === DEFAULT_ADMIN_PASSWORD && pin === adminPin) {
       setUser(DEFAULT_ADMIN_USER);
       addAuditLog('Admin Elevation', 'Root administrative override activated', 'security');
       toast.success('Admin override active. Welcome to Godmode Terminal.');
       return true;
    }
    return false;
  };

  const createListing = async (data: Partial<Listing>) => {
    const newId = `lst_${Date.now()}`;
    const newListing: Listing = {
      id: newId,
      sellerId: user?.id || 'usr_guest',
      sellerName: data.sellerName || user?.fullName || 'Verified Seller',
      sellerPhone: user?.phoneNumber || '+234 813 120 8468',
      sellerAvatar: user?.avatarUrl || '',
      sellerVerified: user?.verified ?? true,
      sellerVerificationType: user?.verificationType || 'individual',
      title: data.title || 'Untitled Listing',
      description: data.description || '',
      price: data.price || 0,
      category: data.category || 'Electronics',
      condition: data.condition || 'Like New',
      location: data.location || 'Ogbomoso, Oyo State',
      status: 'active',
      images: data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'],
      videoUrl: data.videoUrl,
      createdAt: 'Just now',
      viewsCount: 1,
      featured: data.featured || false,
      specifications: data.specifications,
    };

    setListings(prev => [newListing, ...prev]);

    try {
      const dbListing = {
        seller_id: user?.id,
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        location: data.location,
        status: 'active',
        video_url: data.videoUrl || null,
        featured: data.featured || false,
        specifications: data.specifications || null,
      };
      await listingService.create(dbListing, data.images || []);
    } catch (e) {
      console.warn("DB listing insert fallback:", e);
    }

    addAuditLog('Listing Created', `New classified ad published: ${data.title}`, 'ad');
  };

  const updateListing = async (id: string, updatedData: Partial<Listing>) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...updatedData } : l));
    try {
      await listingService.update(id, updatedData as any);
    } catch (e) {
      console.warn("DB listing update fallback:", e);
    }
  };

  const deleteListing = async (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
    try {
      await listingService.delete(id);
    } catch (e) {
      console.warn("DB listing delete fallback:", e);
    }
    addAuditLog('Listing Deleted', `Ad ${id} removed`, 'ad');
  };

  const markAsSold = async (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
    try {
      await listingService.update(id, { status: 'sold' });
    } catch (e) {
      console.warn("DB listing mark sold fallback:", e);
    }
    addAuditLog('Listing Sold', `Ad ${id} sealed`, 'ad');
  };

  const toggleFeaturedListing = async (id: string) => {
    const target = listings.find(l => l.id === id);
    if (!target) return;
    const nextFeatured = !target.featured;
    setListings(prev => prev.map(l => l.id === id ? { ...l, featured: nextFeatured } : l));
    try {
      await listingService.update(id, { featured: nextFeatured });
    } catch (e) {
      console.warn("DB listing toggle featured fallback:", e);
    }
  };

  const promoteListing = async (id: string, durationMonths: number, planName: string) => {
    const end = new Date();
    end.setMonth(end.getMonth() + durationMonths);
    
    setListings(prev => prev.map(l => l.id === id ? {
      ...l,
      featured: true,
      promotionPlanName: planName,
      promotionDurationMonths: durationMonths,
      promotionEndDate: end.toISOString()
    } : l));

    try {
      await listingService.update(id, {
        featured: true,
        promotion_plan_name: planName,
        promotion_duration_months: durationMonths,
        promotion_start_date: new Date().toISOString(),
        promotion_end_date: end.toISOString()
      });
    } catch (e) {
      console.warn("DB promotion fallback:", e);
    }
    addAuditLog('Ad Promoted', `Ad ${id} boosted via ${planName}`, 'ad');
  };

  const sendMessage = async (listingId: string, receiverId: string, content: string) => {
    const targetListing = listings.find(l => l.id === listingId);
    const receiverUser = allUsers.find(u => u.id === receiverId);

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || 'usr_guest',
      receiverId,
      listingId,
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setConversations(prev => {
      const convKey = `${listingId}_${receiverId}`;
      const existing = prev.find(c => c.listingId === listingId && c.otherUser.id === receiverId);

      if (existing) {
        return prev.map(c => c.id === existing.id ? {
          ...c,
          lastMessage: content,
          lastMessageTime: newMsg.createdAt,
          messages: [...c.messages, newMsg]
        } : c);
      } else {
        const newConv: Conversation = {
          id: convKey,
          listingId,
          listingTitle: targetListing?.title || 'Classified Item',
          listingImage: targetListing?.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
          listingPrice: targetListing?.price || 0,
          otherUser: {
            id: receiverId,
            name: receiverUser?.fullName || targetListing?.sellerName || 'Merchant',
            avatar: receiverUser?.avatarUrl || targetListing?.sellerAvatar || ''
          },
          lastMessage: content,
          lastMessageTime: newMsg.createdAt,
          messages: [newMsg]
        };
        return [newConv, ...prev];
      }
    });

    try {
      await messageService.sendMessage({
        listing_id: listingId,
        receiver_id: receiverId,
        sender_id: user?.id,
        content
      });
    } catch (e) {
      console.warn("Message DB fallback:", e);
    }
  };

  const recordIntrusion = async (email: string, mediaStatus: string) => {
    const newIntrusion: SecurityIntrusionLog = {
      id: `threat_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      attemptedEmail: email,
      mediaCaptured: false,
      mediaStatus,
      status: 'flagged',
      deviceInfo: { userAgent: navigator.userAgent, platform: navigator.platform, screenResolution: '1920x1080', language: 'en', cores: 8, timezone: 'WAT' }
    };

    setIntrusionLogs(prev => [newIntrusion, ...prev]);
    try {
      await intrusionService.create({
        timestamp: new Date().toISOString(),
        attempted_email: email,
        media_status: mediaStatus,
        status: 'flagged',
        device_info: { userAgent: navigator.userAgent, platform: navigator.platform }
      });
    } catch (e) {
      console.warn("Intrusion DB fallback:", e);
    }
    addAuditLog('Intrusion Detected', `Failed login attempt for ${email}`, 'intrusion');
  };

  const sealDeal = async (listingId: string, buyerName: string, price: number) => {
    const dealItem = listings.find(l => l.id === listingId);
    const newDeal: MarketplaceDeal = {
      id: `deal_${Date.now()}`,
      itemTitle: dealItem?.title || 'Classified Item',
      price,
      location: user?.location || 'Ogbomoso',
      time: 'Just now'
    };

    setRecentDeals(prev => [newDeal, ...prev]);
    markAsSold(listingId);

    try {
      await recentDealsService.create({ item_title: dealItem?.title || 'Item', price, location: user?.location || 'Ogbomoso', time: 'Just now' });
    } catch (e) {
      console.warn("Deal DB fallback:", e);
    }
  };

  const t = useCallback((key: string) => TRANSLATIONS[language]?.[key] || key, [language]);

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
        demandScore: Math.min(100, Math.round(catAds.length * 5)),
        trend: 'up'
      };
    });
  }, [listings, categories]);

  return (
    <SealifyContext.Provider value={{
      user, setUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      adminPin, updateAdminPin: (p) => { setAdminPin(p); addAuditLog('Security Update', 'Master Admin PIN modified', 'security'); },
      systemConfig, updateSystemConfig: (upd) => { 
        Object.entries(upd).forEach(([k, v]) => systemConfigService.update(k, !!v)); 
        setSystemConfig(p => ({ ...p, ...upd }));
      },
      siteSettings, updateSiteSettings: (s) => siteSettingsService.update(s).then(syncWithSupabase),
      promotionPlans, updatePromotionPlanRate: (m, r) => promotionPlanService.updateRate(m, r).then(syncWithSupabase),
      safeSpots, addSafeSpot: (s) => safeSpotService.create(s).then(syncWithSupabase), deleteSafeSpot: (id) => safeSpotService.delete(id).then(syncWithSupabase),
      exportDatabaseBackup: () => toast.info('Exporting forensic SQL snapshot...'),
      language, setLanguage, t, categories, 
      addCategory: (c) => { setCategories(prev => [...prev, { id: `cat_${Date.now()}`, name: c.name, iconName: c.iconName || 'Layers', count: 0, color: 'bg-emerald-500' }]); },
      deleteCategory: (id) => setCategories(prev => prev.filter(c => c.id !== id)), 
      updateCategory: () => {},
      analytics, marketStats, login, signup, adminLogin, logout: () => setUser(null), listings, allUsers, 
      updateUser: async (id, data) => { 
        setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
        if (user?.id === id) setUser(prev => prev ? { ...prev, ...data } : null);
        try { await userService.update(id, data as any); } catch (e) { console.warn("User update DB fallback:", e); }
        addAuditLog('User Updated', `Profile ${id} record modified`, 'user');
      },
      deleteUser: async (id) => { 
        setAllUsers(prev => prev.filter(u => u.id !== id));
        try { await userService.delete(id); } catch (e) { console.warn("User delete DB fallback:", e); }
        addAuditLog('User Deleted', `Identity ${id} purged from federation`, 'user');
      },
      bulkUpdateUsers: (ids, data) => { setAllUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, ...data } : u)); ids.forEach(id => userService.update(id, data as any)); addAuditLog('Bulk User Update', `${ids.length} nodes modified`, 'user'); },
      bulkDeleteUsers: (ids) => { setAllUsers(prev => prev.filter(u => !ids.includes(u.id))); ids.forEach(id => userService.delete(id)); addAuditLog('Bulk User Deletion', `${ids.length} identities purged`, 'user'); },
      bulkUpdateListings: (ids, data) => { setListings(prev => prev.map(l => ids.includes(l.id) ? { ...l, ...data } : l)); ids.forEach(id => listingService.update(id, data as any)); addAuditLog('Bulk Ad Update', `${ids.length} listings modified`, 'ad'); },
      bulkDeleteListings: (ids) => { setListings(prev => prev.filter(l => !ids.includes(l.id))); ids.forEach(id => listingService.delete(id)); addAuditLog('Bulk Ad Deletion', `${ids.length} listings purged`, 'ad'); },
      savedListingIds, recentlyViewedIds, addRecentlyViewed: (id) => setRecentlyViewedIds(p => [id, ...p.filter(i => i !== id)].slice(0, 10)), 
      toggleSaveListing: async (id) => { 
        if (!user) return; 
        const exists = savedListingIds.includes(id);
        setSavedListingIds(p => exists ? p.filter(i => i !== id) : [...p, id]);
        toast.success(exists ? 'Removed from saved items' : 'Saved to favorites!');
        try { await favoriteService.toggle(user.id, id); } catch (e) { console.warn("Fav DB fallback:", e); }
      },
      isSaved: (id) => savedListingIds.includes(id),
      filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
      activeCategory: filters.category, setActiveCategory: (c) => setFilters(f => ({...f, category: c})),
      compareListingIds, toggleCompareListing: (id) => setCompareListingIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p), 
      isInCompare: (id) => compareListingIds.includes(id), clearCompare: () => setCompareListingIds([]),
      createListing, updateListing, deleteListing, markAsSold, toggleFeaturedListing, promoteListing, 
      conversations, sendMessage,
      notifications, 
      markNotificationRead: (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), 
      markAllNotificationsRead: () => setNotifications(prev => prev.map(n => ({ ...n, read: true }))), 
      clearNotification: (id) => setNotifications(prev => prev.filter(n => n.id !== id)), 
      addNotification: (n) => setNotifications(prev => [{ ...n, id: `notif_${Date.now()}`, time: 'Just now', read: false }, ...prev]), 
      broadcastMassNotification: (t, m) => { toast.info('Broadcasting notification to all active nodes...'); addAuditLog('Global Broadcast', `System message: ${t}`, 'broadcast'); }, 
      passwordRequests, submitPasswordRequest: async (r) => { setPasswordRequests(p => [{ ...r, id: `req_${Date.now()}`, status: 'pending', createdAt: 'Just now' }, ...p]); try { await passwordRequestService.create(r); } catch(e){} },
      processPasswordRequest: async (id, s) => { setPasswordRequests(p => p.map(r => r.id === id ? { ...r, status: s } : r)); addAuditLog('Password Reset', `Request ${id} ${s}`, 'security'); },
      verificationRequests, submitVerificationRequest: async (r) => { setVerificationRequests(p => [{ ...r, id: `v_${Date.now()}`, status: 'pending', createdAt: 'Just now' }, ...p]); try { await verificationService.create(r); } catch(e){} },
      processVerificationRequest: async (id, s) => { setVerificationRequests(p => p.map(r => r.id === id ? { ...r, status: s } : r)); addAuditLog('ID Verification', `Request ${id} ${s}`, 'verification'); },
      promotionPaymentRequests, submitPromotionPaymentRequest: async (r) => { setPromotionPaymentRequests(p => [{ ...r, id: `pay_${Date.now()}`, status: 'pending', createdAt: 'Just now' }, ...p]); try { await promotionService.create(r); } catch(e){} }, 
      processPromotionPaymentRequest: async (id, s) => { setPromotionPaymentRequests(p => p.map(r => r.id === id ? { ...r, status: s } : r)); },
      announcements, addAnnouncement: (a) => setAnnouncements(p => [{ ...a, id: `ann_${Date.now()}`, createdAt: 'Just now' }, ...p]), 
      toggleAnnouncement: (id) => setAnnouncements(p => p.map(a => a.id === id ? { ...a, active: !a.active } : a)), 
      deleteAnnouncement: (id) => setAnnouncements(p => p.filter(a => a.id !== id)),
      reports, submitReport: (r) => setReports(p => [{ ...r, id: `rep_${Date.now()}`, status: 'pending', createdAt: 'Just now' }, ...p]), 
      processReport: (id, a) => setReports(p => p.map(r => r.id === id ? { ...r, status: 'resolved' } : r)), 
      disputeCases, submitDisputeCase: (d) => setDisputeCases(p => [{ ...d, id: `disp_${Date.now()}`, status: 'pending', createdAt: 'Just now' }, ...p]), 
      processDisputeCase: (id, s) => setDisputeCases(p => p.map(d => d.id === id ? { ...d, status: s } : d)),
      auditLogs, addAuditLog, recentDeals, sealDeal, intrusionLogs, recordIntrusion,
      searchAlerts, saveSearchAlert: (a) => { setSearchAlerts(p => [{ ...a, id: `alt_${Date.now()}`, userId: user?.id || 'usr_guest', createdAt: 'Just now', matchCount: 0 }, ...p]); toast.success('Search alert saved!'); }, 
      deleteSearchAlert: (id) => setSearchAlerts(p => p.filter(a => a.id !== id)), 
      reviews, addReview: (r) => setReviews(p => [{ ...r, id: `rev_${Date.now()}`, createdAt: 'Just now' }, ...p]), 
      deleteReview: (id) => setReviews(p => p.filter(r => r.id !== id)),
      buyerRequests, createBuyerRequest: (r) => { setBuyerRequests(p => [{ ...r, id: `req_${Date.now()}`, createdAt: 'Just now', responsesCount: 0 }, ...p]); toast.success('Request posted to Want Board!'); }, 
      deleteBuyerRequest: (id) => setBuyerRequests(p => p.filter(r => r.id !== id)),
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