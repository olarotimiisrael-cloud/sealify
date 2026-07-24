import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message, VerificationBadgeType, PasswordChangeRequest, VerificationRequest, PromotionPaymentRequest, AdReport, AuditLog, SecurityIntrusionLog, DisputeCase, SiteSettings, SearchAlert, Review, CategoryStats, BuyerRequest } from '../types/sealify';
import { TRANSLATIONS, SupportedLanguage } from '@/translations/languages';
import { userService, listingService, messageService, notificationService, verificationService, passwordRequestService, auditService } from '@/services/supabaseService';
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

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [filters, setFilters] = useState<FilterState>({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' });
  const [categories, setCategories] = useState([
    { id: 'vehicles', name: 'Vehicles', iconName: 'Car', count: 0, color: 'bg-blue-500' },
    { id: 'electronics', name: 'Electronics', iconName: 'Smartphone', count: 0, color: 'bg-purple-500' },
    { id: 'real_estate', name: 'Real Estate', iconName: 'Home', count: 0, color: 'bg-teal-500' },
    { id: 'fashion', name: 'Fashion', iconName: 'Shirt', count: 0, color: 'bg-pink-500' },
    { id: 'furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 0, color: 'bg-amber-500' },
  ]);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordChangeRequest[]>([]);

  // Analytics Simulation (Keep dynamic for UI life)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    visitors: 142, activeAds: 0, totalChats: 12, sessionsPerMinute: [12, 18, 22],
    activeSessions: [{ id: 'sess_1', user: 'Ope_72', action: 'Viewing Store', time: 'Just now' }]
  });

  const fetchData = useCallback(async () => {
    try {
      const [dbUsers, dbListings, dbVerifications, dbPasswords] = await Promise.all([
        userService.getAll(),
        listingService.getAll(),
        verificationService.getAll(),
        passwordRequestService.getAll()
      ]);

      setAllUsers(dbUsers as any);
      
      // Transform listings to include joined image array and user info
      const transformedListings = dbListings.map(l => ({
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
        images: l.listing_images.map((img: any) => img.image_url),
        viewsCount: l.views_count || 0,
        createdAt: new Date(l.created_at).toLocaleDateString(),
        featured: l.featured
      }));
      
      setListings(transformedListings);
      setVerificationRequests(dbVerifications as any);
      setPasswordRequests(dbPasswords as any);
      setLoading(false);
    } catch (err) {
      console.error("Data Fetch Error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const login = async (email: string, role: 'buyer' | 'seller' | 'admin', isSignup: boolean = false) => {
    try {
      let dbUser = await userService.getByEmail(email);
      
      if (!dbUser && isSignup) {
        dbUser = await userService.create({
          email,
          full_name: email.split('@')[0],
          role,
          verified: false,
          verification_type: 'none',
          location: 'Ogbomoso, Oyo State',
          member_since: new Date().toISOString(),
          status: 'active',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          phone_number: null,
          business_name: null,
          restriction_reason: null,
          appeal_status: 'none',
          password: null
        });
      }

      if (dbUser) {
        setUser(dbUser as any);
        toast.success(`Access granted. Welcome to Sealify, ${dbUser.full_name}`);
      } else {
        toast.error('Identity not found in node database.');
      }
    } catch (err) {
      toast.error('Authentication node failure.');
    }
  };

  const createListing = async (data: Partial<Listing>) => {
    if (!user) return;
    try {
      const dbListing = {
        seller_id: user.id,
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        location: data.location || user.location,
        status: 'active',
        featured: data.featured || false,
        views_count: 0
      };

      await listingService.create(dbListing, data.images || []);
      toast.success('Listing synchronized with global ledger.');
      fetchData();
    } catch (err) {
      toast.error('Failed to publish listing.');
    }
  };

  const deleteListing = async (id: string) => {
    try {
      await listingService.delete(id);
      setListings(prev => prev.filter(l => l.id !== id));
      toast.success('Listing purged from database.');
    } catch (err) {
      toast.error('Purge failed.');
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
      adminPin: '336699', updateAdminPin: () => {}, systemConfig: { maintenanceMode: false, autoApproveAds: true, requireIdForPosting: false, aiSpamFilter: true },
      updateSystemConfig: () => {}, siteSettings: { siteName: 'Sealify', siteDescription: '', ogImage: '', logoUrl: '', contactEmail: '', contactPhone: '' },
      updateSiteSettings: () => {}, promotionPlans: [], updatePromotionPlanRate: () => {}, safeSpots: [], addSafeSpot: () => {}, deleteSafeSpot: () => {},
      exportDatabaseBackup: () => {}, language, setLanguage, t, categories, addCategory: () => {}, deleteCategory: () => {}, updateCategory: () => {},
      analytics, marketStats, login, adminLogin: async () => true, logout: () => setUser(null), listings, allUsers, 
      updateUser: async (id, data) => { await userService.update(id, data as any); fetchData(); },
      deleteUser: async (id) => { await userService.delete(id); fetchData(); },
      bulkUpdateUsers: () => {}, bulkDeleteUsers: () => {}, bulkUpdateListings: () => {}, bulkDeleteListings: () => {},
      savedListingIds: [], recentlyViewedIds: [], addRecentlyViewed: () => {}, toggleSaveListing: () => {}, isSaved: () => false,
      filters, setFilters, resetFilters: () => {}, activeCategory: filters.category, setActiveCategory: (c) => setFilters(f => ({...f, category: c})),
      compareListingIds: [], toggleCompareListing: () => {}, isInCompare: () => false, clearCompare: () => {},
      createListing, updateListing: async (id, data) => { await listingService.update(id, data as any); fetchData(); },
      deleteListing, markAsSold: async (id) => { await listingService.update(id, { status: 'sold' }); fetchData(); },
      toggleFeaturedListing: async (id) => { const l = listings.find(i => i.id === id); if (l) await listingService.update(id, { featured: !l.featured }); fetchData(); },
      promoteListing: async () => {}, conversations: [], sendMessage: async (l, r, c) => { await messageService.sendMessage({ listing_id: l, receiver_id: r, sender_id: user?.id, content: c }); },
      notifications, markNotificationRead: () => {}, markAllNotificationsRead: () => {}, clearNotification: () => {}, addNotification: () => {},
      broadcastMassNotification: () => {}, passwordRequests, submitPasswordRequest: async (r) => { await passwordRequestService.create(r); fetchData(); },
      processPasswordRequest: async (id, s) => { await passwordRequestService.updateStatus(id, s); fetchData(); },
      verificationRequests, submitVerificationRequest: async (r) => { await verificationService.create(r); fetchData(); },
      processVerificationRequest: async (id, s) => { await verificationService.updateStatus(id, s); fetchData(); },
      promotionPaymentRequests: [], submitPromotionPaymentRequest: () => {}, processPromotionPaymentRequest: () => {},
      announcements: [], addAnnouncement: () => {}, toggleAnnouncement: () => {}, deleteAnnouncement: () => {},
      reports: [], submitReport: () => {}, processReport: () => {}, disputeCases: [], submitDisputeCase: () => {}, processDisputeCase: () => {},
      auditLogs: [], addAuditLog: () => {}, recentDeals: [], sealDeal: () => {}, intrusionLogs: [], recordIntrusion: () => {},
      searchAlerts: [], saveSearchAlert: () => {}, deleteSearchAlert: () => {}, reviews: [], addReview: () => {}, deleteReview: () => {},
      buyerRequests: [], createBuyerRequest: () => {}, deleteBuyerRequest: () => {}, loading, error: null
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