import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message, VerificationBadgeType, PasswordChangeRequest, VerificationRequest, PromotionPaymentRequest, AdReport, AuditLog, SecurityIntrusionLog, DisputeCase, SiteSettings, SearchAlert, Review, CategoryStats, BuyerRequest } from '../types/sealify';
import { TRANSLATIONS, SupportedLanguage } from '@/translations/languages';
import { MOCK_LISTINGS, ALL_MOCK_USERS } from '@/data/mockData';
import { toast } from 'sonner';
import { 
  userService, listingService, messageService, notificationService,
  verificationService, passwordRequestService, promotionService,
  disputeService, reportService, auditService, reviewService,
  buyerRequestService, searchAlertService, announcementService,
  systemConfigService, siteSettingsService, intrusionService,
  recentDealsService, adminStatsService
} from '@/services/supabaseService';
import { supabase } from '@/lib/supabase';

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
  login: (email: string, role: 'buyer' | 'seller' | 'admin', isSignup?: boolean) => Promise<void>;
  adminLogin: (email: string, pass: string, pin?: string) => Promise<boolean>;
  logout: () => void;
  listings: Listing[];
  allUsers: UserProfile[];
  updateUser: (id: string, updatedData: Partial<UserProfile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
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
  loading: boolean;
  error: string | null;
}

const DEFAULT_ADMIN_PIN = '336699';

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminPin, setAdminPin] = useState<string>(DEFAULT_ADMIN_PIN);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    maintenanceMode: false,
    autoApproveAds: true,
    requireIdForPosting: false,
    aiSpamFilter: true,
  });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    logoUrl: '/logo.png',
    siteName: 'Sealify Nigeria',
    siteDescription: "Nigeria's Trusted Local Marketplace.",
    ogImage: '/og-image.png',
    contactEmail: 'support@sealify.ng',
    contactPhone: '+234 813 120 8468',
  });
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<{ id: string, name: string, iconName: string, count: number, color: string }[]>([]);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [compareListingIds, setCompareListingIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordChangeRequest[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [promotionPaymentRequests, setPromotionPaymentRequests] = useState<PromotionPaymentRequest[]>([]);
  const [disputeCases, setDisputeCases] = useState<DisputeCase[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [recentDeals, setRecentDeals] = useState<MarketplaceDeal[]>([]);
  const [reports, setReports] = useState<AdReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [intrusionLogs, setIntrusionLogs] = useState<SecurityIntrusionLog[]>([]);
  const [searchAlerts, setSearchAlerts] = useState<SearchAlert[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper conversion functions
  const convertDbUserToUserProfile = (dbUser: any): UserProfile => ({
    id: dbUser.id,
    email: dbUser.email,
    fullName: dbUser.full_name,
    phoneNumber: dbUser.phone_number || '',
    avatarUrl: dbUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    role: dbUser.role,
    verified: dbUser.verified,
    verificationType: dbUser.verification_type,
    businessName: dbUser.business_name || undefined,
    memberSince: dbUser.member_since,
    location: dbUser.location,
    password: dbUser.password,
    status: dbUser.status,
    restrictionReason: dbUser.restriction_reason,
    appealStatus: dbUser.appeal_status,
  });

  const convertDbListingToListing = useCallback((dbListing: any, currentUsers: UserProfile[]): Listing => {
    const seller = currentUsers.find(u => u.id === dbListing.seller_id);
    return {
      id: dbListing.id,
      sellerId: dbListing.seller_id,
      sellerName: seller?.fullName || 'Verified Seller',
      sellerPhone: seller?.phoneNumber || '',
      sellerAvatar: seller?.avatarUrl || '',
      sellerVerified: seller?.verified || false,
      sellerVerificationType: seller?.verificationType || 'individual',
      title: dbListing.title,
      description: dbListing.description,
      price: dbListing.price,
      originalPrice: dbListing.original_price,
      category: dbListing.category as Category,
      condition: dbListing.condition as any,
      location: dbListing.location,
      status: dbListing.status,
      images: dbListing.images,
      videoUrl: dbListing.video_url,
      createdAt: dbListing.created_at,
      viewsCount: dbListing.views_count,
      featured: dbListing.featured,
      promotionDurationMonths: dbListing.promotion_duration_months,
      promotionPlanName: dbListing.promotion_plan_name,
      promotionStartDate: dbListing.promotion_start_date,
      promotionEndDate: dbListing.promotion_end_date,
      paymentStatus: dbListing.payment_status,
      paymentProofUrl: dbListing.payment_proof_url,
      amountPaid: dbListing.amount_paid,
      specifications: dbListing.specifications,
    };
  }, []);

  const addAuditLog = useCallback(async (action: string, details: string, type: AuditLog['type']) => {
    try {
      await auditService.create({ action, details, type });
    } catch (err) {
      console.error('Audit log error:', err);
    }
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [usersData, listingsData, categoriesData] = await Promise.all([
        userService.getAll(),
        listingService.getAll(),
        Promise.resolve([
          { id: 'cat_1', name: 'Vehicles', iconName: 'Car', count: 0, color: 'bg-blue-500' },
          { id: 'cat_2', name: 'Electronics', iconName: 'Smartphone', count: 0, color: 'bg-purple-500' },
          { id: 'cat_3', name: 'Real Estate', iconName: 'Home', count: 0, color: 'bg-teal-500' },
          { id: 'cat_4', name: 'Fashion', iconName: 'Shirt', count: 0, color: 'bg-pink-500' },
          { id: 'cat_5', name: 'Home & Furniture', iconName: 'Armchair', count: 0, color: 'bg-amber-500' },
          { id: 'cat_6', name: 'Services', iconName: 'Wrench', count: 0, color: 'bg-cyan-500' },
          { id: 'cat_7', name: 'Jobs', iconName: 'Briefcase', count: 0, color: 'bg-indigo-500' },
          { id: 'cat_8', name: 'Beauty & Health', iconName: 'Sparkles', count: 0, color: 'bg-rose-500' },
          { id: 'cat_9', name: 'Utility & Energy', iconName: 'Zap', count: 0, color: 'bg-yellow-500' },
        ])
      ]);

      const convertedUsers = usersData.map(convertDbUserToUserProfile);
      const convertedListings = listingsData.map(l => convertDbListingToListing(l, convertedUsers));

      const catsWithCounts = categoriesData.map(cat => ({
        ...cat,
        count: convertedListings.filter(l => l.category === cat.name).length
      }));

      setAllUsers(convertedUsers);
      setListings(convertedListings);
      setCategories(catsWithCounts);
      setLoading(false);
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Database connection error. Admin features limited.');
      setAllUsers(ALL_MOCK_USERS);
      setListings(MOCK_LISTINGS);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [convertDbListingToListing]);

  const login = async (email: string, role: 'buyer' | 'seller' | 'admin', isSignup?: boolean) => {
    try {
      let existingUser = await userService.getByEmail(email);
      
      if (existingUser) {
        const profile = convertDbUserToUserProfile(existingUser);
        setUser(profile);
        localStorage.setItem('sealify_user', JSON.stringify(profile));
        toast.success(`Welcome back, ${profile.fullName}!`);
      } else if (isSignup) {
        const newUser = await userService.create({
          email,
          full_name: email.split('@')[0],
          phone_number: '',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          role,
          verified: false,
          verification_type: 'none',
          business_name: null,
          location: 'Ogbomoso',
          member_since: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          status: 'active',
          restriction_reason: null,
          appeal_status: 'none',
          password: null,
        });
        const profile = convertDbUserToUserProfile(newUser);
        setAllUsers(prev => [profile, ...prev]);
        setUser(profile);
        localStorage.setItem('sealify_user', JSON.stringify(profile));
        addAuditLog('New Signup', `User created profile for ${email}`, 'user');
        toast.success(`Account created! Welcome to Sealify, ${profile.fullName}.`);
      } else {
        toast.error('User not found. Please sign up.');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Authentication failed.');
    }
  };

  const adminLogin = async (email: string, pass: string, pin?: string): Promise<boolean> => {
    if (email === 'olarotimiisrael@gmail.com' && pass === 'Tscw+1234' && (!pin || pin === adminPin)) {
      let existing = await userService.getByEmail(email);
      if (!existing) {
        // Create root admin if not exists
        existing = await userService.create({
          email,
          full_name: 'Israel Olarotimi',
          phone_number: '0813 120 8468',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          role: 'admin',
          verified: true,
          verification_type: 'premium',
          business_name: null,
          member_since: 'Jan 2023',
          location: 'Ogbomoso, Oyo State',
          status: 'active',
          restriction_reason: null,
          appeal_status: 'none',
          password: pass
        });
      }
      const profile = convertDbUserToUserProfile(existing);
      setUser(profile);
      localStorage.setItem('sealify_user', JSON.stringify(profile));
      addAuditLog('Admin Access', `Root terminal session started by ${email}`, 'security');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sealify_user');
    toast.success('Logged out successfully.');
  };

  const updateUser = async (id: string, updatedData: Partial<UserProfile>) => {
    try {
      const dbUpdates: any = {};
      if (updatedData.fullName) dbUpdates.full_name = updatedData.fullName;
      if (updatedData.email) dbUpdates.email = updatedData.email;
      if (updatedData.phoneNumber) dbUpdates.phone_number = updatedData.phoneNumber;
      if (updatedData.location) dbUpdates.location = updatedData.location;
      if (updatedData.businessName) dbUpdates.business_name = updatedData.businessName;
      if (updatedData.role) dbUpdates.role = updatedData.role;
      if (updatedData.verified !== undefined) dbUpdates.verified = updatedData.verified;
      if (updatedData.verificationType) dbUpdates.verification_type = updatedData.verificationType;
      if (updatedData.avatarUrl) dbUpdates.avatar_url = updatedData.avatarUrl;
      if (updatedData.status) dbUpdates.status = updatedData.status;
      if (updatedData.restrictionReason) dbUpdates.restriction_reason = updatedData.restrictionReason;
      if (updatedData.password) dbUpdates.password = updatedData.password;

      await userService.update(id, dbUpdates);
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
      if (user?.id === id) setUser(prev => prev ? { ...prev, ...updatedData } : null);
      addAuditLog('Record Updated', `Modified user profile for UID: ${id}`, 'user');
    } catch (err) {
      console.error('Update user error:', err);
      toast.error('Failed to update user record.');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      setAllUsers(prev => prev.filter(u => u.id !== id));
      addAuditLog('User Purged', `Record for UID: ${id} deleted by admin`, 'user');
      toast.success('User record deleted.');
    } catch (err) {
      console.error('Delete user error:', err);
      toast.error('Failed to delete user.');
    }
  };

  const createListing = async (data: any) => {
    if (!user) return;
    try {
      const newDbListing = await listingService.create({
        seller_id: user.id,
        title: data.title,
        description: data.description,
        price: data.price,
        original_price: data.originalPrice || null,
        category: data.category,
        condition: data.condition,
        location: data.location,
        status: 'active',
        images: data.images,
        video_url: data.videoUrl || null,
        views_count: 0,
        featured: data.featured || false,
        promotion_plan_name: null,
        promotion_duration_months: 0,
        promotion_start_date: null,
        promotion_end_date: null,
        payment_status: 'pending',
        payment_proof_url: null,
        amount_paid: null,
        specifications: data.specifications || null,
      });
      
      const listing = convertDbListingToListing(newDbListing, allUsers);
      setListings(prev => [listing, ...prev]);
      addAuditLog('Ad Published', `"${data.title}" created by ${user.fullName}`, 'ad');
    } catch (err) {
      console.error('Create ad error:', err);
      toast.error('Failed to post advertisement.');
    }
  };

  const markAsSold = async (id: string) => {
    try {
      await listingService.update(id, { status: 'sold' });
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
      toast.success('Ad marked as sold!');
    } catch (err) {
      console.error('Sold update error:', err);
    }
  };

  const deleteListing = async (id: string) => {
    try {
      await listingService.delete(id);
      setListings(prev => prev.filter(l => l.id !== id));
      toast.success('Ad removed from marketplace.');
    } catch (err) {
      console.error('Delete ad error:', err);
    }
  };

  const t = useCallback((key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  }, [language]);

  return (
    <SealifyContext.Provider value={{
      user, setUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      adminPin, updateAdminPin: setAdminPin, systemConfig, updateSystemConfig: (u) => setSystemConfig(p => ({...p, ...u})), siteSettings, updateSiteSettings: (s) => setSiteSettings(p => ({...p, ...s})), exportDatabaseBackup: () => {},
      language, setLanguage, t,
      categories, addCategory: (c) => {}, deleteCategory: () => {}, updateCategory: () => {},
      analytics: { visitors: 184, activeAds: listings.length, totalChats: 12, sessionsPerMinute: [10, 20, 15, 30] }, 
      marketStats: [], login, adminLogin, logout,
      listings, allUsers, updateUser, deleteUser,
      savedListingIds, recentlyViewedIds, addRecentlyViewed: (id) => {}, toggleSaveListing: (id) => setSavedListingIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]), isSaved: (id) => savedListingIds.includes(id),
      filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
      activeCategory: filters.category,
      setActiveCategory: (cat) => setFilters(p => ({...p, category: cat})),
      compareListingIds, toggleCompareListing: (id) => {}, isInCompare: () => false, clearCompare: () => {},
      createListing, updateListing: async (id, data) => {}, deleteListing, markAsSold, toggleFeaturedListing: async () => {}, promoteListing: async () => {},
      conversations, sendMessage: async () => {},
      notifications, markNotificationRead: () => {}, markAllNotificationsRead: () => {}, clearNotification: () => {}, addNotification: () => {},
      broadcastMassNotification: () => {},
      passwordRequests, submitPasswordRequest: () => {}, processPasswordRequest: () => {},
      verificationRequests, submitVerificationRequest: () => {}, processVerificationRequest: () => {},
      promotionPaymentRequests, submitPromotionPaymentRequest: () => {}, processPromotionPaymentRequest: () => {},
      disputeCases, submitDisputeCase: () => {}, processDisputeCase: () => {},
      announcements, addAnnouncement: () => {}, toggleAnnouncement: () => {}, deleteAnnouncement: () => {},
      reports, submitReport: () => {}, processReport: () => {},
      auditLogs, addAuditLog,
      recentDeals: [], sealDeal: () => {},
      intrusionLogs, recordIntrusion: () => {},
      searchAlerts, saveSearchAlert: () => {}, deleteSearchAlert: () => {},
      reviews, addReview: () => {}, deleteReview: () => {},
      buyerRequests, createBuyerRequest: () => {}, deleteBuyerRequest: () => {},
      loading, error
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