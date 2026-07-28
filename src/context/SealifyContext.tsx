import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Listing, 
  UserProfile, 
  FilterState, 
  Category, 
  Conversation, 
  Message, 
  VerificationBadgeType, 
  PasswordChangeRequest, 
  VerificationRequest, 
  PromotionPaymentRequest, 
  AdReport, 
  AuditLog, 
  SecurityIntrusionLog, 
  DisputeCase, 
  SiteSettings, 
  SearchAlert, 
  Review, 
  CategoryStats, 
  BuyerRequest, 
  Wallet, 
  Transaction,
  UserStatus,
  SystemAnnouncement,
  MarketplaceDeal,
  SafeMeetupSpotConfig
} from '../types/sealify';
import { TRANSLATIONS, SupportedLanguage } from '@/translations/languages';
import { 
  userService, 
  listingService, 
  categoryService,
  subcategoryService,
  messageService, 
  notificationService, 
  verificationService, 
  passwordRequestService, 
  promotionService, 
  disputeService, 
  reportService, 
  auditService, 
  reviewService, 
  buyerRequestService, 
  favoriteService, 
  announcementService, 
  systemConfigService, 
  siteSettingsService, 
  safeSpotService, 
  promotionPlanService, 
  searchAlertService, 
  intrusionService, 
  recentDealsService, 
  storageService 
} from '@/services/supabaseService';
import { ALL_MOCK_USERS, MOCK_LISTINGS, MOCK_CONVERSATIONS } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
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

interface AnalyticsData {
  visitors: number;
  activeAds: number;
  totalChats: number;
  totalRevenue: number;
  userGrowth: number;
  categoryDistribution: { name: string; count: number; color: string }[];
  activeSessions: { id: string, user: string, action: string, time: string }[];
}

interface SealifyContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminEmail: string;
  adminPassword: string;
  adminPin: string;
  updateAdminCredentials: (newEmail: string, newPassword: string, newPin: string) => void;
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
  subcategories: { id: string, categoryId: string, name: string, description: string, iconName: string, listingType: 'product' | 'service', specFields: any }[];
  addCategory: (cat: { id: string, name: string, iconName: string, count: number, color: string }) => void;
  deleteCategory: (id: string) => void;
  updateCategory: (id: string, name: string) => void;
  analytics: AnalyticsData;
  marketStats: CategoryStats[];
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (data: Partial<UserProfile> & { password?: string }) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<string | null>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<boolean>;
  adminLogin: (email: string, pass: string, pin?: string) => Promise<boolean>;
  logout: () => void;
  listings: Listing[];
  allUsers: UserProfile[];
  updateUser: (id: string, updatedData: Partial<UserProfile>) => Promise<void>;
  addUser: (data: Partial<UserProfile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  bulkUpdateUsers: (userIds: string[], updates: Partial<UserProfile>) => void;
  bulkDeleteUsers: (userIds: string[]) => void;
  bulkUpdateListings: (listingIds: string[], updates: Partial<Listing>) => void;
  bulkDeleteListings: (listingIds: string[]) => void;
  savedListingIds: string[];
  recentlyViewedIds: string[];
  userInterests: Record<string, number>;
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
  createListing: (data: Partial<Listing>, files?: File[]) => Promise<boolean>;
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
  dispatchPromotionalEmailDigest: () => void;
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
  
  wallet: Wallet | null;
  transactions: Transaction[];
  requestPayout: (amount: number) => Promise<void>;
  
  loading: boolean;
  isSyncing: boolean;
  lastSyncTime: string;
  syncDatabase: () => Promise<void>();
  error: string | null;
}

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

const generateAdminSessionToken = (email: string) => {
  const salt = 'SEALIFY_HARDENED_ROOT_KEY_2024';
  return btoa(`${email.toLowerCase()}:${salt}:${new Date().toDateString()}`);
};

const getStoredCustomListings = (): Listing[] => {
  try {
    const saved = localStorage.getItem('sealify_custom_listings');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveStoredCustomListings = (customListings: Listing[]) => {
  try {
    localStorage.setItem('sealify_custom_listings', JSON.stringify(customListings));
  } catch (e) {
    console.error('Failed to write custom listings to localStorage:', e);
  }
};

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [error, setError] = useState<string | null>(null);

  const [adminEmail, setAdminEmail] = useState<string>(() => localStorage.getItem('sealify_admin_email') || 'admin@sealify.ng');
  const [adminPassword, setAdminPassword] = useState<string>(() => localStorage.getItem('sealify_admin_password') || 'Admin1234');
  const [adminPin, setAdminPin] = useState<string>(() => localStorage.getItem('sealify_admin_pin') || '336699');

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sealify_active_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin') {
          const sessionToken = sessionStorage.getItem('sealify_admin_session_token');
          const expectedToken = generateAdminSessionToken(adminEmail);
          if (!sessionToken || sessionToken !== expectedToken) {
            console.warn('🚨 SECURITY ALERT: Unverified or tampered admin session token detected.');
            return { ...parsed, role: 'buyer', status: 'active' };
          }
        }
        return { ...parsed, status: 'active' };
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const isAdmin = useMemo(() => {
    if (!user || user.role !== 'admin') return false;
    const sessionToken = sessionStorage.getItem('sealify_admin_session_token');
    const expectedToken = generateAdminSessionToken(adminEmail);
    return sessionToken === expectedToken;
  }, [user, adminEmail]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sealify_active_user', JSON.stringify({ ...user, status: 'active' }));
    } else {
      localStorage.removeItem('sealify_active_user');
      sessionStorage.removeItem('sealify_admin_session_token');
    }
  }, [user]);

  const [userInterests, setUserInterests] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('sealify_interests');
    return saved ? JSON.parse(saved) : {};
  });

  const updateAdminCredentials = (newEmail: string, newPassword: string, newPin: string) => {
    setAdminEmail(newEmail);
    setAdminPassword(newPassword);
    setAdminPin(newPin);
    localStorage.setItem('sealify_admin_email', newEmail);
    localStorage.setItem('sealify_admin_password', newPassword);
    localStorage.setItem('sealify_admin_pin', newPin);

    if (user?.role === 'admin') {
      const newToken = generateAdminSessionToken(newEmail);
      sessionStorage.setItem('sealify_admin_session_token', newToken);
    }

    toast.success('🔒 Official Admin Credentials updated successfully!');
  };

  const [listings, setListings] = useState<Listing[]>(() => {
    const localCustom = getStoredCustomListings();
    const mockIds = new Set(MOCK_LISTINGS.map(l => l.id));
    const customOnly = localCustom.filter(l => !mockIds.has(l.id));
    return [...customOnly, ...MOCK_LISTINGS];
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(ALL_MOCK_USERS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordChangeRequest[]>([]);
  const [promotionPaymentRequests, setPromotionPaymentRequests] = useState<PromotionPaymentRequest[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [reports, setReports] = useState<AdReport[]>([]);
  const [disputeCases, setDisputeCases] = useState<DisputeCase[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [compareListingIds, setCompareListingIds] = useState<string[]>([]);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [filters, setFilters] = useState<FilterState>({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' });
  const [categories, setCategories] = useState([
    { id: 'vehicles', name: 'Vehicles', iconName: 'Car', count: 0, color: 'bg-blue-500' },
    { id: 'electronics', name: 'Electronics', iconName: 'Smartphone', count: 0, color: 'bg-purple-500' },
    { id: 'real_estate', name: 'Real Estate', iconName: 'Home', count: 0, color: 'bg-teal-500' },
    { id: 'fashion', name: 'Fashion', iconName: 'Shirt', count: 0, color: 'bg-pink-500' },
    { id: 'home_furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 0, color: 'bg-amber-500' },
    { id: 'services', name: 'Services', iconName: 'Wrench', count: 0, color: 'bg-cyan-500' },
    { id: 'jobs', name: 'Jobs', iconName: 'Briefcase', count: 0, color: 'bg-indigo-500' },
    { id: 'beauty_health', name: 'Beauty & Health', iconName: 'Sparkles', count: 0, color: 'bg-rose-500' },
    { id: 'utility_energy', name: 'Utility & Energy', iconName: 'Zap', count: 0, color: 'bg-yellow-500' },
    { id: 'solar_clean_energy', name: 'Solar & Clean Energy', iconName: 'Sun', count: 0, color: 'bg-yellow-500' },
  ]);
  
  const [subcategories, setSubcategories] = useState<{ id: string, categoryId: string, name: string, description: string, iconName: string, listingType: 'product' | 'service', specFields: any }[]>([]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [intrusionLogs, setIntrusionLogs] = useState<SecurityIntrusionLog[]>([]);
  const [safeSpots, setSafeSpots] = useState<SafeMeetupSpotConfig[]>([]);
  const [searchAlerts, setSearchAlerts] = useState<SearchAlert[]>([]);
  const [recentDeals, setRecentDeals] = useState<MarketplaceDeal[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({ maintenanceMode: false, autoApproveAds: true, requireIdForPosting: false, aiSpamFilter: true });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ siteName: 'Sealify Nigeria', siteDescription: "Nigeria's Trusted Local Marketplace.", ogImage: '/og-image.png', logoUrl: '/logo.png', contactEmail: 'support@sealify.ng', contactPhone: '+234 813 120 8468' });
  const [promotionPlans, setPromotionPlans] = useState<PromotionPlanConfig[]>([
    { months: 1, label: '1 Month', rate: 15000, badge: 'STARTER' },
    { months: 3, label: '3 Months', rate: 13000, badge: 'POPULAR' },
  ]);

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    localStorage.setItem('sealify_interests', JSON.stringify(userInterests));
  }, [userInterests]);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    if (user) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        ...n,
        time: 'Just now',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      notificationService.create({ user_id: user.id, ...n }).catch(() => {});
    }
  }, [user]);

  const addAuditLog = useCallback((action: string, details: string, type: AuditLog['type']) => {
    auditService.create({ action, details, type, created_at: new Date().toISOString() }).then(() => fetchData());
  }, []);

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const [
        dbUsers, 
        dbListings, 
        dbCategories,
        dbSubcategories,
        dbVerifications, 
        dbPasswords, 
        dbPromoPay, 
        dbBuyerReqs, 
        dbReviews, 
        dbAnnouncements, 
        dbReports, 
        dbDisputes, 
        dbLogs, 
        dbThreats, 
        dbSpots, 
        dbConfigs, 
        dbMeta, 
        dbPlans, 
        dbDeals, 
        dbAlerts
      ] = await Promise.allSettled([
        userService.getAll(),
        listingService.getAll(),
        categoryService.getAll(),
        subcategoryService.getAll(),
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
        recentDealsService.getAll(),
        user ? searchAlertService.getAll(user.id) : Promise.resolve([])
      ]);

      if (dbUsers.status === 'fulfilled' && dbUsers.value && dbUsers.value.length > 0) {
        setAllUsers(dbUsers.value as any);
      }

      const localCustom = getStoredCustomListings();

      if (dbListings.status === 'fulfilled' && dbListings.value && dbListings.value.length > 0) {
        const fetchedFromDb = dbListings.value.map((l: any) => ({
          id: l.id,
          sellerId: l.seller_id,
          sellerName: l.users?.full_name || 'Verified Seller',
          sellerPhone: l.users?.phone_number || '',
          sellerAvatar: l.users?.avatar_url || '',
          sellerVerified: l.users?.verified || false,
          sellerVerificationType: l.users?.verification_type || 'none',
          title: l.title,
          description: l.description,
          price: Number(l.price) || 0,
          category: l.category_id || 'Electronics',
          condition: l.condition,
          location: l.location,
          status: l.status || 'active',
          images: l.listing_images?.map((img: any) => img.image_url) || (l.images ? l.images : []),
          viewsCount: l.views_count || 0,
          createdAt: new Date(l.created_at || Date.now()).toLocaleDateString(),
          featured: l.featured || false,
          promotionEndDate: l.promotion_end_date,
          specifications: l.specifications
        }));

        const dbIds = new Set(fetchedFromDb.map(item => item.id));
        const uniqueLocal = localCustom.filter(item => !dbIds.has(item.id));
        setListings([...uniqueLocal, ...fetchedFromDb]);
      } else {
        const mockIds = new Set(MOCK_LISTINGS.map(item => item.id));
        const uniqueLocal = localCustom.filter(item => !mockIds.has(item.id));
        setListings([...uniqueLocal, ...MOCK_LISTINGS]);
      }

      if (dbCategories.status === 'fulfilled' && dbCategories.value) {
        setCategories(dbCategories.value.map((c: any) => ({
          id: c.id,
          name: c.name,
          iconName: c.icon_name,
          count: 0,
          color: c.color
        })));
      }

      if (dbSubcategories.status === 'fulfilled' && dbSubcategories.value) {
        setSubcategories(dbSubcategories.value.map((s: any) => ({
          id: s.id,
          categoryId: s.category_id,
          name: s.name,
          description: s.description,
          iconName: s.icon_name,
          listingType: s.listing_type,
          specFields: s.spec_fields
        })));
      }

      if (dbVerifications.status === 'fulfilled' && dbVerifications.value) setVerificationRequests(dbVerifications.value as any);
      if (dbPromoPay.status === 'fulfilled' && dbPromoPay.value) setPromotionPaymentRequests(dbPromoPay.value as any);
      if (dbBuyerReqs.status === 'fulfilled' && dbBuyerReqs.value) setBuyerRequests(dbBuyerReqs.value as any);
      if (dbReviews.status === 'fulfilled' && dbReviews.value) setReviews(dbReviews.value as any);
      if (dbAnnouncements.status === 'fulfilled' && dbAnnouncements.value) setAnnouncements(dbAnnouncements.value as any);
      if (dbReports.status === 'fulfilled' && dbReports.value) setReports(dbReports.value as any);
      if (dbDisputes.status === 'fulfilled' && dbDisputes.value) setDisputeCases(dbDisputes.value as any);
      if (dbLogs.status === 'fulfilled' && dbLogs.value) setAuditLogs(dbLogs.value as any);
      if (dbThreats.status === 'fulfilled' && dbThreats.value) setIntrusionLogs(dbThreats.value as any);
      if (dbSpots.status === 'fulfilled' && dbSpots.value && dbSpots.value.length > 0) setSafeSpots(dbSpots.value as any);
      if (dbDeals.status === 'fulfilled' && dbDeals.value) setRecentDeals(dbDeals.value.map((d: any) => ({ id: d.id, itemTitle: d.item_title, price: d.price, location: d.location, time: d.time })));
      if (dbMeta.status === 'fulfilled' && dbMeta.value) setSiteSettings(dbMeta.value as any);
      if (dbAlerts.status === 'fulfilled' && dbAlerts.value) setSearchAlerts(dbAlerts.value as any);

      setLastSyncTime(new Date().toLocaleTimeString());
      setLoading(false);
      setIsSyncing(false);
    } catch (err) {
      console.error('fetchData error:', err);
      setError('Failed to sync with database');
      setLoading(false);
      setIsSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewedIds(p => [id, ...p.filter(i => i !== id)].slice(0, 10));
    const item = listings.find(l => l.id === id);
    if (item) {
      setUserInterests(prev => ({
        ...prev,
        [item.category]: (prev[item.category] || 0) + 1
      }));
    }
  }, [listings]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password: password || 'password123' 
      });
      
      if (error) { 
        toast.error(error.message); 
        return false; 
      }
      
      if (!data.user) {
        toast.error('Authentication failed - no user returned');
        return false;
      }

      const profile = await userService.getProfile(data.user.id);
      
      if (profile) {
        setUser({ ...profile, status: 'active' } as any);
      } else {
        console.log('Profile not found in DB, creating...');
        const newProfile = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || email.split('@')[0],
          phoneNumber: data.user.user_metadata?.phone || '',
          avatarUrl: data.user.user_metadata?.avatar_url || '/logo.png',
          role: 'buyer' as const,
          status: 'active' as UserStatus,
          verified: false,
          memberSince: new Date().toISOString(),
          location: 'Ogbomoso, Oyo State'
        };
        
        const created = await userService.create(newProfile);
        if (created) {
          setUser(created);
        } else {
          setUser(newProfile);
        }
      }
      
      toast.success('Welcome back to Sealify!');
      fetchData();
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || 'Authentication failure.');
      return false;
    }
  };

  const dispatchWelcomeGreetingEmail = (userId: string, userEmail: string, userName: string) => {
    const welcomeNotif: AppNotification = {
      id: `notif_welcome_${Date.now()}`,
      type: 'system',
      title: '🎉 Welcome to Sealify Nigeria!',
      description: `Welcome to Sealify, ${userName}! Your account is 100% active and unrestricted. Explore local deals in Ogbomoso, post free ads, or chat directly with verified sellers.`,
      time: 'Just now',
      read: false,
      linkUrl: '/how-it-works'
    };

    setNotifications(prev => [welcomeNotif, ...prev]);

    notificationService.create({
      user_id: userId,
      type: 'system',
      title: '🎉 Welcome to Sealify Nigeria!',
      description: `Welcome to Sealify, ${userName}! Your account is 100% active and unrestricted. Explore local deals in Ogbomoso, post free ads, or chat directly with verified sellers.`,
      link_url: '/how-it-works'
    }).catch(() => {});

    addAuditLog('Welcome Onboarding Dispatched', `Welcome message & Sealify onboarding dispatched to ${userEmail} (${userName})`, 'user');
  };

  const dispatchPromotionalEmailDigest = useCallback(() => {
    const featuredPromos = listings.filter(l => l.featured || l.viewsCount > 100).slice(0, 3);
    const promoTitles = featuredPromos.map(l => `• ${l.title} (₦${l.price.toLocaleString()})`).join('\n');
    
    allUsers.forEach(u => {
      notificationService.create({
        user_id: u.id,
        type: 'recommendation',
        title: '🔥 Sealify Weekly Digest: Admin Approved Deals',
        description: `Check out the latest verified listings in Ogbomosoland:\n${promoTitles}`,
        link_url: '/'
      });
    });

    addAuditLog('Promotional Digest Dispatched', `Periodic promotional email digest broadcasted to ${allUsers.length} user accounts.`, 'broadcast');
    toast.success(`📧 Promotional digest dispatched to all ${allUsers.length} user accounts!`);
  }, [listings, allUsers, addAuditLog]);

  const signup = async (data: Partial<UserProfile> & { password?: string }) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({ 
        email: data.email!, 
        password: data.password!,
        options: { 
          data: { 
            full_name: data.fullName, 
            phone: data.phoneNumber,
            site_name: 'Sealify Nigeria',
            site_url: window.location.origin
          } 
        }
      });
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      const newUserId = authData?.user?.id || `usr_${Date.now()}`;

      const newProfile = {
        id: newUserId,
        email: data.email!,
        fullName: data.fullName!,
        phoneNumber: data.phoneNumber!,
        avatarUrl: '/logo.png',
        role: 'buyer' as const,
        status: 'active' as UserStatus,
        verified: false,
        memberSince: new Date().toISOString(),
        location: 'Ogbomoso, Oyo State'
      };

      const created = await userService.create(newProfile);
      if (!created) {
        toast.error('Failed to create user profile in database. Please contact support.');
        return;
      }

      setUser(created);
      dispatchWelcomeGreetingEmail(newUserId, data.email!, data.fullName!);
      toast.success(`🎉 Welcome to Sealify, ${data.fullName}! Your account is active and unrestricted.`, { duration: 6000 });
      fetchData();
    } catch (err: any) { 
      console.error('Signup error:', err);
      toast.error(err.message || "Signup failed."); 
    }
  };

  const adminLogin = async (email: string, pass: string, pin?: string): Promise<boolean> => {
    if (email.toLowerCase().trim() === adminEmail.toLowerCase().trim() && pass === adminPassword && pin === adminPin) {
      const adminProfile: UserProfile = { 
        id: 'usr_admin_default', 
        email: adminEmail, 
        fullName: 'Sealify Official', 
        phoneNumber: '+234 813 120 8468', 
        avatarUrl: '/logo.png', 
        role: 'admin', 
        status: 'active', 
        verified: true, 
        verificationType: 'premium', 
        memberSince: new Date().toISOString(), 
        location: 'Ogbomoso, Oyo State' 
      };
      
      const sessionToken = generateAdminSessionToken(adminEmail);
      sessionStorage.setItem('sealify_admin_session_token', sessionToken);

      setUser(adminProfile);
      addAuditLog('Admin Login', 'Master root access granted to official terminal', 'security');
      toast.success('🔑 Master Sealify Root Access Granted');
      return true;
    }
    return false;
  };

  const logout = () => { 
    setUser(null); 
    localStorage.removeItem('sealify_active_user');
    sessionStorage.removeItem('sealify_admin_session_token');
    supabase.auth.signOut(); 
    toast.info('Logged out successfully.'); 
  };

  const updateUser = async (id: string, data: Partial<UserProfile>) => {
    setAllUsers(prev =>
      prev.map(user =>
        user.id === id ? { ...user, ...data } : user
      )
    );
    
    if (user?.id === id) {
      setUser(prev => prev ? ({ ...prev, ...data }) : null);
    }
    
    const updated = await userService.update(id, data);
    if (updated === null) {
      toast.error('Failed to update user. Please try again.');
      fetchData();
      return;
    }
    
    addAuditLog('User Record Updated', `Modified profile for user ID ${id}`, 'user');
    toast.success('User updated successfully');
    fetchData(); 
  };

  const deleteUser = async (id: string) => {
    if (user?.id === id) logout();
    await userService.delete(id);
    addAuditLog('User Purged', `Deleted account for user ID ${id}`, 'user');
    fetchData();
  };
    
  const addUser = async (data: Partial<UserProfile>) => {
      const newUserId = `usr_${Date.now()}`;
      const newUser = {
        id: newUserId,
        email: data.email!,
        full_name: data.fullName!,
        phone_number: data.phoneNumber ?? '',
        role: data.role ?? 'buyer',
        status: 'active' as UserStatus,
        location: data.location ?? 'Ogbomoso, Oyo State',
        verified: false,
        verification_type: 'none' as VerificationBadgeType
      };
      
      try {
        const created = await userService.create(newUser);
        if (created === null) {
          throw new Error('Failed to create user');
        }
        
        const newUserProfile: UserProfile = {
          id: newUserId,
          email: newUser.email,
          fullName: newUser.full_name,
          phoneNumber: newUser.phone_number,
          avatarUrl: '/logo.png',
          role: newUser.role as any,
          status: newUser.status,
          verified: newUser.verified,
          memberSince: new Date().toISOString(),
          location: newUser.location
        };
        
        setAllUsers(prev => [...prev, newUserProfile]);
        
        if (user?.id === newUserId) {
          setUser(newUserProfile);
        }
        
        addAuditLog('User Created', `Created new user ${newUser.email}`, 'user');
        toast.success('User created successfully');
        fetchData();
      } catch (err: any) {
        toast.error(`Failed to create user: ${err.message ?? 'Unknown error'}`);
        fetchData();
      }
    };

  const checkSearchAlertsForListing = useCallback((listing: Listing) => {
    searchAlerts.forEach(alert => {
      if ((listing.title.toLowerCase().includes(alert.query.toLowerCase()) || listing.category.toLowerCase().includes(alert.query.toLowerCase())) && (alert.category === 'All' || alert.category === listing.category) && (!alert.maxPrice || listing.price <= alert.maxPrice)) {
        addNotification({ type: 'alert_match', title: 'Search Alert Match!', description: `A new item matching your alert "${alert.query}" was just posted: "${listing.title}"`, linkUrl: `/listing/${listing.id}` });
      }
    });
  }, [searchAlerts, addNotification]);

  const createListing = async (data: Partial<Listing>, files?: File[]): Promise<boolean> => {
    try {
      let uploadedUrls: string[] = data.images || [];
      if (files && files.length > 0) {
        try {
          const newUrls = await Promise.all(
            files.map(file => storageService.uploadFile('listing-photos', `lst_${Date.now()}`, file))
          );
          const validUrls = newUrls.filter(Boolean);
          if (validUrls.length > 0) {
            uploadedUrls = [...uploadedUrls, ...validUrls];
          }
        } catch (e) {
          console.warn('Storage upload error, using local image representations:', e);
        }
      }

      if (uploadedUrls.length === 0) {
        uploadedUrls = ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'];
      }

      const sellerId = user?.id || 'usr_1';
      const sellerName = data.sellerName || user?.fullName || 'Verified Seller';
      const sellerPhone = user?.phoneNumber || '+234 813 120 8468';
      const sellerAvatar = user?.avatarUrl || '/logo.png';
      const sellerVerified = user?.verified || false;
      const sellerVerificationType = user?.verificationType || 'none';

      let dbResult: any = null;
      try {
        dbResult = await listingService.create({
          seller_id: sellerId,
          title: data.title,
          description: data.description,
          price: data.price,
          category_id: data.category,
          condition: data.condition,
          location: data.location || 'Ogbomoso, Oyo State',
          status: 'active',
          featured: data.featured || false,
          specifications: data.specifications || {},
          sellerName,
          sellerEmail: user?.email,
          sellerPhone,
          sellerAvatar,
          sellerVerified,
          sellerVerificationType
        }, uploadedUrls);
      } catch (e) {
        console.warn('Listing DB insert notice:', e);
      }

      const newListing: Listing = {
        id: dbResult?.id || `lst_user_${Date.now()}`,
        sellerId,
        sellerName,
        sellerPhone,
        sellerAvatar,
        sellerVerified,
        sellerVerificationType,
        title: data.title || 'Untitled Ad',
        description: data.description || '',
        price: Number(data.price) || 0,
        category: (data.category as Category) || 'Electronics',
        condition: (data.condition as any) || 'Brand New',
        location: data.location || 'Ogbomoso, Oyo State',
        status: 'active',
        images: uploadedUrls,
        videoUrl: data.videoUrl,
        viewsCount: 1,
        createdAt: 'Just now',
        featured: data.featured || false,
        specifications: data.specifications
      };

      const currentStored = getStoredCustomListings();
      saveStoredCustomListings([newListing, ...currentStored]);

      setListings(prev => [newListing, ...prev]);
      checkSearchAlertsForListing(newListing);
      addAuditLog('Listing Created', `Published new ad: "${newListing.title}"`, 'ad');

      return true;
    } catch (e: any) { 
      toast.error(e.message || 'Failed to publish listing.'); 
      return false; 
    }
  };

  const updateListing = async (id: string, updatedData: Partial<Listing>) => { 
    setListings(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
    
    const currentStored = getStoredCustomListings();
    const updatedStored = currentStored.map(item => item.id === id ? { ...item, ...updatedData } : item);
    saveStoredCustomListings(updatedStored);

    await listingService.update(id, updatedData); 
    addAuditLog('Listing Modified', `Updated ad details for ID ${id}`, 'ad'); 
    fetchData(); 
  };

  const deleteListing = async (id: string) => { 
    setListings(prev => prev.filter(item => item.id !== id));
    
    const currentStored = getStoredCustomListings();
    const updatedStored = currentStored.filter(item => item.id !== id);
    saveStoredCustomListings(updatedStored);

    await listingService.delete(id); 
    addAuditLog('Listing Deleted', `Dropped ad from feed ID ${id}`, 'ad'); 
    fetchData(); 
  };

  const markAsSold = async (id: string) => { 
    setListings(prev => prev.map(item => item.id === id ? { ...item, status: 'sold' as const } : item));
    
    const currentStored = getStoredCustomListings();
    const updatedStored = currentStored.map(item => item.id === id ? { ...item, status: 'sold' as const } : item);
    saveStoredCustomListings(updatedStored);

    await listingService.update(id, { status: 'sold' }); 
    fetchData(); 
  };

  const t = useCallback((key: string) => TRANSLATIONS[language]?.[key] || key, [language]);

  const sendMessage = async (lId: string, rId: string, content: string) => {
    const targetListing = listings.find(l => l.id === lId);
    const recipientUser = allUsers.find(u => u.id === rId);

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || 'usr_guest',
      receiverId: rId,
      listingId: lId,
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => {
      const existingConvIndex = prev.findIndex(c => c.listingId === lId && (c.otherUser.id === rId || c.otherUser.id === user?.id));

      if (existingConvIndex !== -1) {
        const updated = [...prev];
        const conv = updated[existingConvIndex];
        updated[existingConvIndex] = {
          ...conv,
          lastMessage: content,
          lastMessageTime: 'Just now',
          messages: [...conv.messages, newMsg]
        };
        return updated;
      } else {
        const newConv: Conversation = {
          id: `conv_${Date.now()}`,
          listingId: lId,
          listingTitle: targetListing?.title || 'Classified Ad Inquiry',
          listingImage: targetListing?.images[0] || '/logo.png',
          listingPrice: targetListing?.price || 0,
          otherUser: {
            id: rId,
            name: recipientUser?.fullName || targetListing?.sellerName || 'Verified Merchant',
            avatar: recipientUser?.avatarUrl || targetListing?.sellerAvatar || '/logo.png'
          },
          lastMessage: content,
          lastMessageTime: 'Just now',
          messages: [newMsg]
        };
        return [newConv, ...prev];
      }
    });

    await messageService.sendMessage({ sender_id: user?.id || 'usr_guest', receiver_id: rId, listing_id: lId, content });
  };

  const marketStats: CategoryStats[] = useMemo(() => {
    return categories.map(cat => {
      const catAds = listings.filter(l => l.category === cat.name);
      const prices = catAds.map(l => l.price);
      return { category: cat.name as Category, avgPrice: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0, minPrice: prices.length ? Math.min(...prices) : 0, maxPrice: prices.length ? Math.max(...prices) : 0, totalAds: catAds.length, demandScore: Math.min(100, Math.round(catAds.length * 15)), trend: 'up' };
    });
  }, [listings, categories]);

  const analytics = useMemo((): AnalyticsData => {
    return { visitors: 142 + Math.floor(Math.random() * 20), activeAds: listings.filter(l => l.status === 'active').length, totalChats: conversations.length, totalRevenue: promotionPaymentRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0), userGrowth: Math.round((allUsers.length / 10) * 100) / 10, categoryDistribution: categories.map(c => ({ name: c.name, count: listings.filter(l => l.category === c.name).length, color: c.color })), activeSessions: [{ id: 'sess_1', user: 'Guest_Node', action: 'Searching', time: 'Just now' }] };
  }, [listings, allUsers, conversations, promotionPaymentRequests, categories]);

  const contextValue = useMemo(() => ({
    user, setUser, isAuthenticated: !!user, isAdmin,
    adminEmail, adminPassword, adminPin, updateAdminCredentials,
    systemConfig, updateSystemConfig: (upd) => { setSystemConfig(p => ({...p, ...upd})); Object.entries(upd).forEach(([k, v]) => systemConfigService.update(k, v)); },
    siteSettings, updateSiteSettings: (s) => { setSiteSettings(p => ({...p, ...s})); siteSettingsService.update(s); addAuditLog('Site Meta Updated', 'Modified global site description/contact', 'broadcast'); },
    promotionPlans, updatePromotionPlanRate: (m, r) => setPromotionPlans(p => p.map(plan => plan.months === m ? {...plan, rate: r} : plan)),
    safeSpots, addSafeSpot: (s) => safeSpotService.create(s).then(() => fetchData()), deleteSafeSpot: (id) => safeSpotService.delete(id).then(() => fetchData()),
    exportDatabaseBackup: () => { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ listings, allUsers, reviews, siteSettings }, null, 2)); const dlAnchorElem = document.createElement('a'); dlAnchorElem.setAttribute("href", dataStr); dlAnchorElem.setAttribute("download", `Sealify_DB_Backup_${Date.now()}.json`); dlAnchorElem.click(); toast.success("Database Backup Exported!"); },
    language, setLanguage, t, categories, subcategories, 
    addCategory: (c) => { setCategories(prev => [...prev, c]); categoryService.create(c).then(() => fetchData()); }, 
    deleteCategory: (id) => { setCategories(p => p.filter(c => c.id !== id)); categoryService.delete(id).then(() => fetchData()); }, 
    updateCategory: (id, name) => { setCategories(p => p.map(c => c.id === id ? {...c, name} : c)); categoryService.update(id, { name }).then(() => fetchData()); },
    analytics, marketStats, login, signup, sendPhoneOtp: async () => Math.floor(100000 + Math.random() * 900000).toString(), verifyPhoneOtp: async () => true, 
    adminLogin, logout, listings, allUsers, updateUser, addUser, deleteUser,
    bulkUpdateUsers: (ids, upd) => ids.forEach(id => updateUser(id, upd)), bulkDeleteUsers: (ids) => ids.forEach(id => deleteUser(id)),
    bulkUpdateListings: (ids, upd) => ids.forEach(id => updateListing(id, upd)), bulkDeleteListings: (ids) => ids.forEach(id => deleteListing(id)),
    savedListingIds, recentlyViewedIds, userInterests, addRecentlyViewed,
    toggleSaveListing: async (id) => { if (user) { const exists = savedListingIds.includes(id); await favoriteService.toggle(user.id, id, exists); setSavedListingIds(p => exists ? p.filter(i => i !== id) : [...p, id]); } },
    isSaved: (id) => savedListingIds.includes(id), filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
    activeCategory: filters.category, setActiveCategory: (c) => setFilters(f => ({...f, category: c})),
    compareListingIds, toggleCompareListing: (id) => setCompareListingIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p),
    isInCompare: (id) => compareListingIds.includes(id), clearCompare: () => setCompareListingIds([]),
    createListing, updateListing, deleteListing, markAsSold, toggleFeaturedListing: async (id) => updateListing(id, { featured: !listings.find(l => l.id === id)?.featured }), promoteListing: async (id, dur, plan) => updateListing(id, { featured: true, promotionPlanName: plan, promotionDurationMonths: dur }), 
    conversations, sendMessage,
    notifications, markNotificationRead: (id) => notificationService.markRead(id).then(() => fetchData()), 
    markAllNotificationsRead: () => Promise.all(notifications.map(n => notificationService.markRead(n.id))).then(() => fetchData()), 
    clearNotification: (id) => notificationService.clear(id).then(() => fetchData()),
    addNotification,
    broadcastMassNotification: (title, message, targetRole = 'all') => { 
      allUsers.forEach(u => {
        if (targetRole === 'all' || u.role === targetRole) {
          notificationService.create({ 
            user_id: u.id, 
            type: 'system', 
            title, 
            description: message 
          });
        }
      });
      addAuditLog('Mass Broadcast', `Headline: ${title}`, 'broadcast'); 
      toast.success(`Broadcasted: ${title}`); 
    },
    dispatchPromotionalEmailDigest,
    passwordRequests, submitPasswordRequest: (r) => passwordRequestService.create(r).then(() => fetchData()),
    processPasswordRequest: (id, s) => passwordRequestService.updateStatus(id, s).then(() => fetchData()),
    verificationRequests, submitVerificationRequest: (r) => verificationService.create(r).then(() => fetchData()),
    processVerificationRequest: (id, s) => verificationService.updateStatus(id, s).then(() => { addAuditLog('Verification Processed', `Request ID ${id} set to ${s}`, 'verification'); fetchData(); }),
    promotionPaymentRequests, submitPromotionPaymentRequest: (r) => promotionService.create(r).then(() => fetchData()),
    processPromotionPaymentRequest: (id, s) => promotionService.updateStatus(id, s).then(() => { addAuditLog('Finance Approval', `Promotion Payment ID ${id} ${s}`, 'finance'); fetchData(); }),
    announcements, addAnnouncement: (a) => announcementService.create(a).then(() => fetchData()), toggleAnnouncement: (id) => announcementService.delete(id).then(() => fetchData()), deleteAnnouncement: (id) => announcementService.delete(id).then(() => fetchData()),
    reports, submitReport: (r) => reportService.create(r).then(() => fetchData()), processReport: (id) => reportService.updateStatus(id, 'resolved').then(() => fetchData()),
    disputeCases, submitDisputeCase: (d) => disputeService.create(d).then(() => fetchData()),
    processDisputeCase: (id, s) => disputeService.updateStatus(id, s).then(() => { addAuditLog('Dispute Mediated', `Dispute ID ${id} set to ${s}`, 'dispute'); fetchData(); }),
    auditLogs, addAuditLog,
    recentDeals, sealDeal: (l, b, p) => recentDealsService.create({ item_title: l, price: p, location: user?.location || 'Ogbomoso', time: 'Just now' }).then(() => fetchData()),
    intrusionLogs, recordIntrusion: (e, m) => intrusionService.create({ attempted_email: e, media_status: m, timestamp: new Date().toISOString() }).then(() => { addAuditLog('Unauthorized Access Attempt', `Email: ${e} | Payload: ${m}`, 'intrusion'); fetchData(); }),
    searchAlerts, saveSearchAlert: (a) => searchAlertService.create({ ...a, user_id: user?.id }).then(() => fetchData()),
    deleteSearchAlert: (id) => searchAlertService.delete(id).then(() => fetchData()),
    reviews, addReview: (r) => reviewService.create(r).then(() => fetchData()), deleteReview: (id) => reviewService.delete(id).then(() => fetchData()),
    buyerRequests, createBuyerRequest: (r) => buyerRequestService.create(r).then(() => fetchData()), deleteBuyerRequest: (id) => buyerRequestService.delete(id).then(() => fetchData()),
    wallet, transactions, requestPayout: async (amount: number) => {
      if (!wallet || wallet.balance < amount) {
        toast.error('Insufficient balance');
        return;
      }
      setWallet(prev => prev ? { ...prev, balance: prev.balance - amount, pendingBalance: prev.pendingBalance + amount } : null);
      setTransactions(prev => [{ id: `txn_${Date.now()}`, walletId: wallet?.id || '', type: 'payout', amount: -amount, status: 'pending', description: 'Withdrawal to bank', createdAt: new Date().toISOString() }, ...prev]);
      toast.success(`Payout of ₦${amount.toLocaleString()} requested`);
    },
    loading, isSyncing, lastSyncTime, syncDatabase: fetchData, error
  }), [
    user, isAdmin, adminEmail, adminPassword, adminPin, systemConfig, siteSettings, promotionPlans, safeSpots,
    language, categories, subcategories, analytics, marketStats, listings, allUsers, savedListingIds,
    recentlyViewedIds, userInterests, filters, activeCategory, compareListingIds, conversations,
    notifications, passwordRequests, verificationRequests, promotionPaymentRequests, announcements,
    reports, disputeCases, auditLogs, recentDeals, intrusionLogs, searchAlerts, reviews, buyerRequests,
    wallet, transactions, loading, isSyncing, lastSyncTime, error
  ]);

  return (
    <SealifyContext.Provider value={contextValue}>
      {children}
    </SealifyContext.Provider>
  );
};

export const useSealify = () => {
  const context = useContext(SealifyContext);
  if (!context) throw new Error('useSealify must be used within SealifyProvider');
  return context;
};