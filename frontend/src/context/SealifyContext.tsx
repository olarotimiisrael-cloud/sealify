import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { TRANSLATIONS as SealifyTRANSLATIONS } from '@/translations/languages';
import { Listing, UserProfile, SearchFilter, Message, Conversation, Category, CategoryStats, SystemAnnouncement, SearchAlert, Review, BuyerRequest, SafeMeetupSpotConfig, VerificationBadgeType, UserStatus, AppNotification, CategoryConfig } from '@/types/sealify';
import { toast } from 'sonner';
import { mapListingToListing, mapProfileToUser } from '@/services/supabaseService';
import { adminFetch } from '@/lib/admin-api';
import { apiUrl } from '@/lib/env';
import { api } from '@/lib/api-client';
import { laravelApi } from '@/lib/laravel-api';

// Service imports
import * as favoriteService from '@/services/supabaseService';
import * as categoryService from '@/services/supabaseService';
import * as subcategoryService from '@/services/supabaseService';
import * as messageService from '@/services/supabaseService';
import * as notificationService from '@/services/supabaseService';
import * as verificationService from '@/services/supabaseService';
import * as passwordRequestService from '@/services/supabaseService';
import * as promotionService from '@/services/supabaseService';
import * as disputeService from '@/services/supabaseService';
import * as reportService from '@/services/supabaseService';
import * as auditService from '@/services/supabaseService';
import * as reviewService from '@/services/supabaseService';
import * as buyerRequestService from '@/services/supabaseService';
import * as announcementService from '@/services/supabaseService';
import * as siteSettingsService from '@/services/supabaseService';
import * as safeSpotService from '@/services/supabaseService';
import * as promotionPlanService from '@/services/supabaseService';
import * as searchAlertService from '@/services/supabaseService';
import * as intrusionService from '@/services/supabaseService';
import * as recentDealsService from '@/services/supabaseService';
import * as storageService from '@/services/supabaseService';

const laravelData = laravelApi.data;

const laravelDataList = async (resource: string, params: Record<string, any> = {}) => {
  try {
    const query: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query[key] = String(value);
    });

    return await laravelData.list<any>(resource, query);
  } catch {
    return [];
  }
};

const laravelDataSingle = async (resource: string, params: Record<string, any> = {}) => {
  const rows = await laravelDataList(resource, params);

  return rows[0] || null;
};


const mapCategoryRow = (row: any): CategoryConfig => ({
  id: row.id,
  name: row.name as Category,
  iconName: row.icon_name || 'Tag',
  color: row.color || 'bg-slate-500',
  count: 0,
});

const mapAnnouncementRow = (row: any): SystemAnnouncement => ({
  id: row.id,
  title: row.title,
  message: row.message,
  type: row.type || 'info',
  active: row.active !== false,
  targetRoles: row.target_roles || ['buyer', 'seller'],
  createdAt: row.created_at || new Date().toISOString(),
});

const dedupeAnnouncements = (rows: Array<any> = []): SystemAnnouncement[] => {
  const deduped = new Map<string, SystemAnnouncement>();

  rows.forEach((row) => {
    const mapped = mapAnnouncementRow(row);
    const contentKey = `${mapped.type}|${(mapped.title || '').trim().toLowerCase()}|${(mapped.message || '').trim().toLowerCase()}`;
    const existing = deduped.get(contentKey);

    if (!existing || new Date(mapped.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
      deduped.set(contentKey, mapped);
    }
  });

  return Array.from(deduped.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

const mapSafeSpotRow = (row: any): SafeMeetupSpotConfig => ({
  id: row.id,
  name: row.name,
  zone: row.zone,
  category: row.category,
  address: row.address,
  distance: row.distance,
  hours: row.hours,
  cctvVerified: Boolean(row.cctv_verified),
});

const mapPromotionPlanRow = (row: any) => ({
  months: Number(row.months),
  label: row.label,
  rate: Number(row.rate),
  badge: row.badge || undefined,
  isActive: row.is_active !== false,
});

const mapNotificationRow = (row: any): AppNotification => ({
  id: row.id,
  type: row.type || 'system',
  title: row.title || 'Sealify notification',
  description: row.description || '',
  time: row.created_at || new Date().toISOString(),
  read: Boolean(row.read),
  linkUrl: row.link_url || undefined,
  createdAt: row.created_at || new Date().toISOString(),
});

const mapSearchAlertRow = (row: any): SearchAlert => ({
  id: row.id,
  userId: row.user_id,
  query: row.query || '',
  category: row.category_id || 'All',
  maxPrice: row.max_price == null ? null : Number(row.max_price),
  location: row.location || '',
  createdAt: row.created_at || new Date().toISOString(),
  matchCount: Number(row.match_count || 0),
});

const mapReviewRow = (row: any): Review => ({
  id: row.id,
  sellerId: row.seller_id,
  buyerId: row.buyer_id,
  buyerName: row.buyer_name || 'Sealify buyer',
  buyerAvatar: row.buyer_avatar || '',
  rating: Number(row.rating || 0),
  comment: row.comment || '',
  createdAt: row.created_at || new Date().toISOString(),
});

const mapBuyerRequestRow = (row: any): BuyerRequest => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name || '',
  userAvatar: row.user_avatar || '',
  title: row.title,
  category: row.category_id as Category,
  maxBudget: Number(row.max_budget || 0),
  location: row.location || '',
  description: row.description || '',
  createdAt: row.created_at || new Date().toISOString(),
  responsesCount: Number(row.responses_count || 0),
});

// Result of an admin login attempt. `stage` identifies which part of the flow
// failed so the UI can report the real cause instead of a single generic error.
// Messages are pre-sanitized: no backend detail, credentials or tokens are exposed.
export type AdminLoginStage = 'validation' | 'api' | 'session' | 'profile';

export interface AdminLoginResult {
  success: boolean;
  stage?: AdminLoginStage;
  status?: number;
  message?: string;
}

interface SealifyContextType {
  // Auth
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isAuthenticated: boolean;
  isAdmin: boolean;

  // System config
  systemConfig: Record<string, boolean | number>;
  updateSystemConfig: (updates: Record<string, boolean | number>) => void;
  
  // Site settings
  siteSettings: { logoUrl: string; siteName: string; siteDescription: string; ogImage: string; contactEmail: string; contactPhone: string } | null;
  updateSiteSettings: (settings: Partial<{ logoUrl: string; siteName: string; siteDescription: string; ogImage: string; contactEmail: string; contactPhone: string }>) => void;
  
  // Promotion plans
  promotionPlans: { months: number; label: string; rate: number; badge?: string; isActive: boolean }[];
  updatePromotionPlanRate: (months: number, rate: number) => void;
  
  // Safe spots
  safeSpots: SafeMeetupSpotConfig[];
  addSafeSpot: (spot: SafeMeetupSpotConfig) => Promise<void>;
  deleteSafeSpot: (id: string) => Promise<void>;
  
  // Database
  exportDatabaseBackup: () => void;
  
  // Language
  language: 'en' | 'yo' | 'ha' | 'ig' | 'zh';
  setLanguage: (lang: 'en' | 'yo' | 'ha' | 'ig' | 'zh') => void;
  t: (key: string) => string;
  
  // Categories
  categories: CategoryConfig[];
  subcategories: any[];
  addCategory: (category: CategoryConfig) => void;
  deleteCategory: (id: string) => void;
  updateCategory: (id: string, name: string) => void;
  
  // Analytics
  analytics: { visitors: number; totalAds: number; soldAds: number; revenue: number; userGrowth: number; categoryDistribution: { name: string; count: number }[] };
  marketStats: CategoryStats[];
  
// Auth functions
   login: (email: string, password: string) => Promise<boolean>;
    signup: (data: { email: string; password: string; fullName: string; phoneNumber: string; referralCode?: string }) => Promise<void>;
   signInWithOAuth: (provider: 'google' | 'apple' | 'samsung') => Promise<boolean>;
   sendPhoneOtp: (phone: string, channel?: string) => Promise<{ otpId: string; otp: string | null }>;
   verifyPhoneOtp: (phone: string, code: string, otpId?: string) => Promise<boolean>;
    adminLogin: (email: string, password: string, accessKey?: string) => Promise<AdminLoginResult>;
    clearError: () => void;
    logout: () => void;
   resetPassword: (email: string) => Promise<void>;
   completeProfile: (data: { fullName: string; phoneNumber: string }) => Promise<boolean>;

   // Listings
  listings: Listing[];
  allUsers: UserProfile[];
  createUser: (newUser: Partial<UserProfile>) => Promise<UserProfile | null>;
  updateUser: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  addUser: (user: UserProfile) => void;
  deleteUser: (id: string) => void;
bulkUpdateUsers: (ids: string[], updates: Partial<UserProfile>) => void;
 bulkDeleteUsers: (ids: string[]) => void;
 reloadUsers: () => Promise<void>;
 bulkUpdateListings: (ids: string[], updates: Partial<Listing>) => void;
 bulkDeleteListings: (ids: string[]) => void;
  
  // Favorites
  savedListingIds: string[];
  recentlyViewedIds: string[];
  userInterests: Record<string, number>;
  addRecentlyViewed: (id: string) => void;
  toggleSaveListing: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  
  // Filters
  filters: SearchFilter;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilter>>;
  resetFilters: () => void;
  activeCategory: Category | 'All';
  setActiveCategory: (category: Category | 'All') => void;
  
  // Compare
  compareListingIds: string[];
  toggleCompareListing: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  
  // Listing CRUD
  createListing: (data: Omit<Listing, 'id' | 'sellerId' | 'createdAt' | 'viewsCount' | 'status'>, files?: File[]) => Promise<boolean>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => void;
  markAsSold: (id: string) => void;
  toggleFeaturedListing: (id: string) => Promise<void>;
  promoteListing: (id: string, durationMonths: number, planName: string) => Promise<void>;
  
  // Messages
  conversations: Conversation[];
  sendMessage: (listingId: string, receiverId: string, content: string, replyToId?: string) => void;
  
  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  broadcastMassNotification: (data: { target: string; title: string; message: string }) => void;
  dispatchPromotionalEmailDigest: () => void;
  
  // Email broadcast & composer
  broadcastEmail: (data: { target: 'all' | 'buyer' | 'seller' | 'individual'; subject: string; html: string; text?: string; template?: string; userIds?: string[] }) => Promise<boolean>;
  sendMultiChannelPasswordReset: (email: string, fullName?: string, phoneNumber?: string, whatsappNumber?: string) => Promise<boolean>;
  broadcastSMS: (data: { target: 'all' | 'buyer' | 'seller' | 'individual'; message: string; userIds?: string[] }) => Promise<boolean>;
  broadcastWhatsApp: (data: { target: 'all' | 'buyer' | 'seller' | 'individual'; message: string; userIds?: string[] }) => Promise<boolean>;
  uploadAttachment: (data: { filename: string; content: string; type?: string }) => Promise<{ success: boolean; attachment: { filename: string; content: string; type: string; size: number } }>;
  
  // Admin moderation
  passwordRequests: any[];
  submitPasswordRequest: (request: any) => Promise<void>;
  processPasswordRequest: (id: string, status: string) => Promise<void>;
  verificationRequests: any[];
  submitVerificationRequest: (request: any) => Promise<void>;
  processVerificationRequest: (id: string, status: string) => Promise<void>;
  promotionPaymentRequests: any[];
  submitPromotionPaymentRequest: (request: any) => Promise<void>;
  processPromotionPaymentRequest: (id: string, status: string) => Promise<void>;
  announcements: SystemAnnouncement[];
  addAnnouncement: (announcement: Omit<SystemAnnouncement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  toggleAnnouncement: (id: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  reports: any[];
  submitReport: (report: any) => Promise<void>;
  processReport: (id: string, status: string) => Promise<void>;
  disputeCases: any[];
  submitDisputeCase: (dispute: any) => Promise<void>;
  processDisputeCase: (id: string, status: string) => Promise<void>;
  auditLogs: any[];
  addAuditLog: (action: string, details: string, type: string) => void;
  recentDeals: any[];
  sealDeal: (listingTitle: string, buyerName: string, price: number) => void;
  intrusionLogs: any[];
  recordIntrusion: (attemptedEmail: string, metadata: string) => void;

  // New-user signup alerts (admin follow-up queue)
  signupAlerts: any[];
  loadSignupAlerts: (status?: string) => Promise<any[]>;
  updateSignupAlert: (id: string, status: string, note?: string) => Promise<any | null>;

  // Administrator login audit sessions
  loginSessions: any[];
  activeLoginSessions: number;
  loadLoginSessions: (params?: { status?: string; adminId?: string; limit?: number; offset?: number }) => Promise<{ sessions: any[]; active: number }>;
  updateLoginSession: (id: string, status: string) => Promise<any | null>;
  
  // Search alerts
  searchAlerts: SearchAlert[];
  saveSearchAlert: (alert: Omit<SearchAlert, 'id' | 'userId' | 'createdAt' | 'matchCount' | 'isActive'>) => Promise<void>;
  deleteSearchAlert: (id: string) => Promise<void>;
  
  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  
  // Buyer requests
  buyerRequests: BuyerRequest[];
  createBuyerRequest: (request: Omit<BuyerRequest, 'id' | 'createdAt' | 'responsesCount'>) => Promise<void>;
  deleteBuyerRequest: (id: string) => Promise<void>;
  
  // State
  loading: boolean;
  isSyncing: boolean;
  lastSyncTime: string;
  syncDatabase: () => Promise<void>;
  error: string | null;
}

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

// Mock data for initial state
const MOCK_CATEGORIES: CategoryConfig[] = [
  { id: 'vehicles', name: 'Vehicles', iconName: 'Car', count: 3, color: 'bg-blue-500' },
  { id: 'electronics', name: 'Electronics', iconName: 'Smartphone', count: 3, color: 'bg-purple-500' },
  { id: 'real_estate', name: 'Real Estate', iconName: 'Home', count: 3, color: 'bg-teal-500' },
  { id: 'fashion', name: 'Fashion', iconName: 'Shirt', count: 3, color: 'bg-pink-500' },
  { id: 'furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 3, color: 'bg-amber-500' },
  { id: 'services', name: 'Services', iconName: 'Wrench', count: 3, color: 'bg-cyan-500' },
  { id: 'jobs', name: 'Jobs', iconName: 'Briefcase', count: 3, color: 'bg-indigo-500' },
  { id: 'beauty', name: 'Beauty & Health', iconName: 'Sparkles', count: 3, color: 'bg-rose-500' },
  { id: 'utility', name: 'Utility & Energy', iconName: 'Zap', count: 3, color: 'bg-yellow-500' },
  { id: 'solar', name: 'Solar & Clean Energy', iconName: 'Sun', count: 3, color: 'bg-yellow-500' },
];

const MOCK_MARKET_STATS: CategoryStats[] = [
  { category: 'Vehicles', avgPrice: 2500000, minPrice: 500000, maxPrice: 10000000, totalAds: 15, demandScore: 78, trend: 'up' },
  { category: 'Electronics', avgPrice: 180000, minPrice: 25000, maxPrice: 1200000, totalAds: 42, demandScore: 92, trend: 'up' },
  { category: 'Real Estate', avgPrice: 450000, minPrice: 150000, maxPrice: 5000000, totalAds: 28, demandScore: 65, trend: 'stable' },
  { category: 'Fashion', avgPrice: 35000, minPrice: 5000, maxPrice: 200000, totalAds: 35, demandScore: 58, trend: 'down' },
  { category: 'Home & Furniture', avgPrice: 120000, minPrice: 20000, maxPrice: 800000, totalAds: 22, demandScore: 71, trend: 'up' },
  { category: 'Services', avgPrice: 50000, minPrice: 5000, maxPrice: 300000, totalAds: 18, demandScore: 60, trend: 'stable' },
  { category: 'Jobs', avgPrice: 50000, minPrice: 20000, maxPrice: 200000, totalAds: 12, demandScore: 85, trend: 'up' },
  { category: 'Beauty & Health', avgPrice: 15000, minPrice: 2000, maxPrice: 100000, totalAds: 25, demandScore: 75, trend: 'up' },
  { category: 'Utility & Energy', avgPrice: 150000, minPrice: 20000, maxPrice: 600000, totalAds: 20, demandScore: 68, trend: 'stable' },
  { category: 'Solar & Clean Energy', avgPrice: 350000, minPrice: 50000, maxPrice: 3000000, totalAds: 10, demandScore: 88, trend: 'up' },
];

const MOCK_SAFE_SPOTS: SafeMeetupSpotConfig[] = [
  { id: '1', name: 'Ogbomoso Divisional Police HQ', zone: 'Police HQ', category: 'Police Safe Zone', address: 'Police Headquarters, Ogbomoso, Oyo State', distance: 'Central Hub', hours: '24/7', cctvVerified: true },
  { id: '2', name: 'LAUTECH Main Gate Security Post', zone: 'LAUTECH Area', category: 'Police Safe Zone', address: 'LAUTECH Main Gate, Ogbomoso, Oyo State', distance: 'Campus Entry', hours: '24/7', cctvVerified: true },
  { id: '3', name: 'Under G Shopping Complex', zone: 'LAUTECH Area', category: 'Shopping Mall', address: 'Under G Market, Ogbomoso, Oyo State', distance: 'Student Hub', hours: '8:00 AM - 8:00 PM', cctvVerified: true },
  { id: '4', name: 'Takie Square Mall', zone: 'Takie / Center', category: 'Shopping Mall', address: 'Takie Square, Ogbomoso, Oyo State', distance: 'City Center', hours: '9:00 AM - 7:00 PM', cctvVerified: true },
  { id: '5', name: 'Sabo Market Security Post', zone: 'Sabo Market Zone', category: 'Police Safe Zone', address: 'Sabo Market, Ogbomoso, Oyo State', distance: 'Market Center', hours: '7:00 AM - 6:00 PM', cctvVerified: true },
  { id: '6', name: 'Ogbomoso Public Library', zone: 'Takie / Center', category: 'Public Library', address: 'Public Library, Ogbomoso, Oyo State', distance: 'Quiet Zone', hours: '8:00 AM - 6:00 PM', cctvVerified: true },
  { id: '7', name: 'Adenike Area Café Hub', zone: 'LAUTECH Area', category: 'Café', address: 'Adenike Junction, Ogbomoso, Oyo State', distance: 'Student Area', hours: '7:00 AM - 10:00 PM', cctvVerified: true },
  { id: '8', name: 'General Hospital Security Post', zone: 'Police HQ', category: 'Police Safe Zone', address: 'LAUTECH Teaching Hospital, Ogbomoso', distance: 'Hospital Zone', hours: '24/7', cctvVerified: true },
  { id: '9', name: 'Oja Oba Market Security', zone: 'Sabo Market Zone', category: 'Police Safe Zone', address: 'Oja Oba Market, Ogbomoso', distance: 'Market Center', hours: '7:00 AM - 6:00 PM', cctvVerified: true },
  { id: '10', name: 'Ilorin Garage Park Office', zone: 'Takie / Center', category: 'Café', address: 'Ilorin Garage, Takie, Ogbomoso', distance: 'Transport Hub', hours: '6:00 AM - 8:00 PM', cctvVerified: true },
];

const MOCK_PROMOTION_PLANS = [
  { months: 1, label: '1 Month', rate: 15000, badge: 'STARTER', isActive: true },
  { months: 3, label: '3 Months', rate: 39000, badge: 'POPULAR', isActive: true },
  { months: 6, label: '6 Months', rate: 66000, badge: 'BEST VALUE', isActive: true },
  { months: 12, label: '12 Months', rate: 108000, badge: 'ENTERPRISE', isActive: true },
];

const MOCK_SYSTEM_CONFIG = {
  maintenanceMode: false,
  autoApproveAds: true,
  requireIdForPosting: false,
  aiSpamFilter: true,
  maxImagesPerAd: 10,
  maxFileSizeMb: 20,
};

const MOCK_SITE_SETTINGS = {
  logoUrl: '/logo.svg',
  siteName: 'Sealify Nigeria',
  siteDescription: 'Nigeria\'s Trusted Local Marketplace for Ogbomosoland & Oyo State.',
  ogImage: '/logo.png',
  contactEmail: 'support@sealify.ng',
  contactPhone: '+234 813 120 8468',
};


export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [systemConfig, setSystemConfig] = useState<Record<string, boolean | number>>(MOCK_SYSTEM_CONFIG);
  const [siteSettings, setSiteSettings] = useState(MOCK_SITE_SETTINGS);
  const [promotionPlans, setPromotionPlans] = useState(MOCK_PROMOTION_PLANS);
  const [safeSpots, setSafeSpots] = useState(MOCK_SAFE_SPOTS);
  const [language, setLanguage] = useState<'en' | 'yo' | 'ha' | 'ig' | 'zh'>('en');
  const [categories, setCategories] = useState<CategoryConfig[]>(MOCK_CATEGORIES);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    visitors: 12450,
    totalAds: 247,
    soldAds: 89,
    revenue: 2850000,
    userGrowth: 12.5,
    categoryDistribution: [
      { name: 'Vehicles', count: 15 },
      { name: 'Electronics', count: 42 },
      { name: 'Real Estate', count: 28 },
      { name: 'Fashion', count: 35 },
      { name: 'Home & Furniture', count: 22 },
      { name: 'Services', count: 18 },
      { name: 'Jobs', count: 12 },
      { name: 'Beauty & Health', count: 25 },
      { name: 'Utility & Energy', count: 20 },
      { name: 'Solar & Clean Energy', count: 10 },
    ]
  });
  const [marketStats, setMarketStats] = useState<CategoryStats[]>(MOCK_MARKET_STATS);
  const [listings, setListings] = useState<Listing[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [userInterests, setUserInterests] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState<SearchFilter>({
    query: '',
    category: 'All',
    minPrice: null,
    maxPrice: null,
    condition: 'All',
    location: '',
    sortBy: 'newest'
  });
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [compareListingIds, setCompareListingIds] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [promotionPaymentRequests, setPromotionPaymentRequests] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [disputeCases, setDisputeCases] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [recentDeals, setRecentDeals] = useState<any[]>([]);
  const [intrusionLogs, setIntrusionLogs] = useState<any[]>([]);
  const [signupAlerts, setSignupAlerts] = useState<any[]>([]);
  const [loginSessions, setLoginSessions] = useState<any[]>([]);
  const [activeLoginSessions, setActiveLoginSessions] = useState<number>(0);
  const [searchAlerts, setSearchAlerts] = useState<SearchAlert[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

   const t = (key: string) => SealifyTRANSLATIONS[language]?.[key] || SealifyTRANSLATIONS.en?.[key] || key;

  const loadProfileForAuthUser = async (authUser: any): Promise<UserProfile | null> => {
    if (!authUser?.id) return null;

    const data = await laravelDataSingle('profiles', { id: authUser.id });

    return data ? mapProfileToUser({ ...data, email: data.email || authUser.email }) : null;
  };

  const applyAuthenticatedUser = (profile: UserProfile | null) => {
    setUser(profile);
    setIsAdmin(profile?.role === 'admin');
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await api.signIn(email, password);
      if (!data?.user) return false;

      const profile = await loadProfileForAuthUser(data.user);
      if (!profile) {
        await api.signOut();
        toast.error('Your account profile is not ready yet. Please try again shortly.');
        return false;
      }

      applyAuthenticatedUser(profile);

      if (!profile.fullName || !profile.phoneNumber) {
        navigate('/profile-complete');
      }
      return true;
    } catch (authError: any) {
      setError(authError?.message || 'Unable to sign in');
      return false;
    }
  };
      
const adminLogin = async (email: string, password: string): Promise<AdminLoginResult> => {
  const report = (stage: AdminLoginStage, status: number | undefined, message: string): AdminLoginResult => {
    console.warn(`[AdminLogin] stage=${stage} status=${status ?? 'n/a'} reason="${message}"`);
    setError(message);
    return { success: false, stage, status, message };
  };

  try {
    if (!email.trim() || !password.trim()) return report('validation', undefined, 'Email and password are required.');

    const data = await api.signIn(email, password);
    if (!data?.user) return report('api', 401, 'Unable to authenticate administrator. Please verify your credentials and try again.');

    const profile = await loadProfileForAuthUser(data.user);
    if (!profile) {
      await api.signOut();
      return report('profile', 404, 'Authentication succeeded, but your administrator profile could not be loaded. Please try again.');
    }

    if (profile.role !== 'admin') {
      await api.signOut();
      return report('profile', 403, 'Administrator access is not enabled for this account.');
    }

    applyAuthenticatedUser(profile);
    return { success: true };
  } catch {
    return report('api', undefined, 'Unable to reach the authentication service. Please check your connection and try again.');
  }
};

        const clearError = () => {
          setError(null);
        };
      
         const signup = async (data: { email: string; password: string; fullName: string; phoneNumber: string; referralCode?: string }) => {
           try {
             const result = await api.signUp(data.email, data.password, data.fullName, data.phoneNumber);
             const session = result?.session;

             if (!session?.access_token) {
               toast.success('Account created. You can now sign in.');
               return;
             }

             const profile = await loadProfileForAuthUser(session.user || result?.user);
             if (!profile) {
               await api.signOut();
               toast.error('Your account profile is not ready yet. Please try again shortly.');
               return;
             }

             applyAuthenticatedUser(profile);

             if (!profile.fullName || !profile.phoneNumber) {
               navigate('/profile-complete');
             }
           } catch (error: any) {
             toast.error(error?.message || 'Unable to create your account');
           }
         };

const sendPhoneOtp = async (phone: string, channel?: string) => {
      void phone;
      void channel;
      throw new Error('Phone OTP is not available on the Laravel backend. Use email and password.');
    };

   const verifyPhoneOtp = async (phone: string, code: string, otpId?: string) => {
     void phone;
     void code;
     void otpId;
     throw new Error('Phone OTP is not available on the Laravel backend. Use email and password.');
   };

  const signInWithOAuth = async (provider: 'google' | 'apple' | 'samsung'): Promise<boolean> => {
    try {
      void provider;
      throw new Error('OAuth is not configured for the Laravel backend. Use email and password authentication.');
    } catch {
      return false;
    }
  };

  const completeProfile = async (data: { fullName: string; phoneNumber: string }): Promise<boolean> => {
    try {
      const updated = await api.put<any>('/auth/profile', {
        full_name: data.fullName,
        phone_number: data.phoneNumber,
      });
      const profile = updated ? mapProfileToUser(updated) : null;
      applyAuthenticatedUser(profile);
      return Boolean(profile);
    } catch (error: any) {
      setError(error?.message || 'Unable to complete profile');
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await api.resetPassword(email);
    } catch (error: any) {
      throw new Error(error?.message || 'Unable to request password reset');
    }
  };

  const logout = () => {
    void api.signOut().catch(() => {});
    setUser(null);
    setIsAdmin(false);
    setSavedListingIds([]);
    setNotifications([]);
    setConversations([]);
  };

  const addRecentlyViewed = (id: string) => {
    setRecentlyViewedIds(prev => {
      const filtered = prev.filter(i => i !== id);
      return [id, ...filtered].slice(0, 20);
    });
  };

  const toggleSaveListing = async (id: string) => {
    if (!user) return;
    const exists = savedListingIds.includes(id);
    const success = await favoriteService.toggleFavorite(user.id, id, exists);
    if (!success) return;
    setSavedListingIds(p => exists ? p.filter(i => i !== id) : [...p, id]);
  };

  const isSaved = (id: string) => savedListingIds.includes(id);

  const resetFilters = () => setFilters({ query: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' });

  const toggleCompareListing = (id: string) => {
    setCompareListingIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p);
  };

  const isInCompare = (id: string) => compareListingIds.includes(id);

  const clearCompare = () => setCompareListingIds([]);

  const createListing = async (data: Omit<Listing, 'id' | 'sellerId' | 'createdAt' | 'viewsCount' | 'status'>, files?: File[]) => {
    if (!user) return false;
    try {
      let imageUrls = data.images || [];
      if (files?.length) {
        const uploadedImages = await Promise.all(files.map((file, index) => storageService.uploadFile(
          'ad-images',
          `${user.id}/${Date.now()}-${index}-${file.name}`,
          file,
        )));
        imageUrls = [...imageUrls, ...uploadedImages.filter(Boolean)];
      }

      const categoryId = categories.find(category => category.name === data.category)?.id || data.category;
      const createdAd = await laravelData.create<any>('ads', {
        seller_id: user.id,
        category_id: categoryId,
        title: data.title,
        description: data.description,
        price: data.price,
        original_price: data.originalPrice ?? null,
        condition: data.condition,
        location: data.location,
        status: 'active',
        images: imageUrls,
        video_url: data.videoUrl || null,
        specifications: data.specifications || {},
      });

      const newListing = mapListingToListing({
        ...createdAd,
        seller_name: user.fullName,
        seller_phone: user.phoneNumber,
        seller_avatar: user.avatarUrl,
        seller_verified: user.verified,
        seller_verification_type: user.verificationType,
      });
      newListing.category = data.category as any;
      setListings(prev => [newListing, ...prev]);
      toast.success('Your ad was posted successfully!');
      return true;
    } catch (createError: any) {
      toast.error(createError?.message || 'Unable to post your ad');
      return false;
    }
  };

  const updateListing = async (id: string, updates: Partial<Listing>) => {
    if (!user) return;
    const databaseUpdates: Record<string, any> = {};
    if (updates.title !== undefined) databaseUpdates.title = updates.title;
    if (updates.description !== undefined) databaseUpdates.description = updates.description;
    if (updates.price !== undefined) databaseUpdates.price = updates.price;
    if (updates.originalPrice !== undefined) databaseUpdates.original_price = updates.originalPrice;
    if (updates.condition !== undefined) databaseUpdates.condition = updates.condition;
    if (updates.location !== undefined) databaseUpdates.location = updates.location;
    // Sellers may mark their own listing sold, but moderation and promotion
    // state is controlled only by the admin/payment workflow.
    if (updates.status === 'sold') databaseUpdates.status = updates.status;
    if (updates.images !== undefined) databaseUpdates.images = updates.images;
    if (updates.videoUrl !== undefined) databaseUpdates.video_url = updates.videoUrl;
    if (updates.specifications !== undefined) databaseUpdates.specifications = updates.specifications;

    const updatedAd = await laravelData.update<any>('ads', id, databaseUpdates);
    const listing = listings.find(item => item.id === id);
    setListings(prev => prev.map(item => item.id === id ? mapListingToListing({ ...updatedAd, seller_name: listing?.sellerName || user.fullName, seller_phone: listing?.sellerPhone || user.phoneNumber, seller_avatar: listing?.sellerAvatar || user.avatarUrl, seller_verified: listing?.sellerVerified ?? user.verified, seller_verification_type: listing?.sellerVerificationType || user.verificationType }) : item));
  };

  const deleteListing = async (id: string) => {
    if (!user) return;
    await laravelData.destroy('ads', id);
    setListings(prev => prev.filter(item => item.id !== id));
  };

  const markAsSold = async (id: string) => {
    await updateListing(id, { status: 'sold' });
  };

  const toggleFeaturedListing = async (id: string) => {
    void id;
    toast.error('Featured status is applied after promotion payment approval.');
  };

  const promoteListing = async (id: string, durationMonths: number, planName: string) => {
    const plan = promotionPlans.find(item => item.months === durationMonths && item.label === planName)
      || promotionPlans.find(item => item.months === durationMonths);
    if (!plan) throw new Error('Promotion plan is unavailable');
    await submitPromotionPaymentRequest({
      listingId: id,
      amount: plan.rate,
      paymentMethod: 'transfer',
      planName: plan.label,
      durationMonths: plan.months,
    });
  };

  const refreshConversations = async (userId: string) => {
    const [participantOneRows, participantTwoRows] = await Promise.all([
      laravelDataList('conversations', { participant_1: userId, sort_by: 'last_message_time', sort_dir: 'desc' }),
      laravelDataList('conversations', { participant_2: userId, sort_by: 'last_message_time', sort_dir: 'desc' }),
    ]);
    const conversationRows = [...participantOneRows, ...participantTwoRows]
      .sort((a: any, b: any) => new Date(b.last_message_time || b.created_at || 0).getTime() - new Date(a.last_message_time || a.created_at || 0).getTime());

    const mappedConversations = await Promise.all((conversationRows || []).map(async (row: any): Promise<Conversation> => {
      const otherUserId = row.participant_1 === userId ? row.participant_2 : row.participant_1;
      const [adRow, profileRow, messageRows] = await Promise.all([
        laravelDataSingle('ads', { id: row.ad_id }),
        laravelDataSingle('profiles', { id: otherUserId }),
        laravelDataList('messages', { conversation_id: row.id, sort_by: 'created_at', sort_dir: 'asc' }),
      ]);

      return {
        id: row.id,
        listingId: row.ad_id,
        listingTitle: adRow?.title || 'Marketplace ad',
        listingImage: adRow?.images?.[0] || '',
        listingPrice: Number(adRow?.price || 0),
        otherUser: {
          id: otherUserId,
          name: profileRow?.full_name || 'Sealify user',
          avatar: profileRow?.avatar_url || '',
        },
        lastMessage: row.last_message || '',
        lastMessageTime: row.last_message_time || row.created_at,
        unreadCount: (messageRows || []).filter((m: any) => m.receiver_id === userId && !m.read).length,
        messages: (messageRows || []).map((message: any) => ({
          id: message.id,
          senderId: message.sender_id,
          receiverId: message.receiver_id,
          listingId: message.ad_id,
          content: message.content,
          createdAt: message.created_at,
          isRead: Boolean(message.read),
        })),
      };
    }));

    setConversations(mappedConversations);
  };

  const sendMessage = async (listingId: string, receiverId: string, content: string, replyToId?: string) => {
    if (!user || !content.trim()) return;

    let conversation: any = null;
    const firstConversation = await laravelDataSingle('conversations', {
      ad_id: listingId,
      participant_1: user.id,
      participant_2: receiverId,
    });
    conversation = firstConversation;

    if (!conversation) {
      const secondConversation = await laravelDataSingle('conversations', {
        ad_id: listingId,
        participant_1: receiverId,
        participant_2: user.id,
      });
      conversation = secondConversation;
    }

    if (!conversation) {
      conversation = await laravelData.create<any>('conversations', {
        ad_id: listingId,
        participant_1: user.id,
        participant_2: receiverId,
      });
    }

    await laravelData.create<any>('messages', {
      conversation_id: conversation.id,
      sender_id: user.id,
      receiver_id: receiverId,
      ad_id: listingId,
      content: content.trim(),
      status: 'sent',
      read: false,
      ...(replyToId ? { reply_to_id: replyToId } : {}),
    });

    const unreadUpdate = conversation.participant_1 === receiverId
      ? { last_message: content.trim(), last_message_time: new Date().toISOString(), unread_count_1: Number(conversation.unread_count_1 || 0) + 1 }
      : { last_message: content.trim(), last_message_time: new Date().toISOString(), unread_count_2: Number(conversation.unread_count_2 || 0) + 1 };
    await laravelData.update<any>('conversations', conversation.id, unreadUpdate);

    await refreshConversations(user.id);
  };

  const addNotification = (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    if (!user) return;
    void notificationService.create({
      user_id: user.id,
      type: notification.type,
      title: notification.title,
      description: notification.description,
      link_url: notification.linkUrl || null,
      read: false,
    }).then((row: any) => {
      if (row) setNotifications(prev => [mapNotificationRow(row), ...prev]);
    });
  };

  const markNotificationRead = async (id: string) => {
    if (!user) return;
    const success = await notificationService.notificationService.markNotificationRead(id);
    if (success) setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    const unreadNotifications = await laravelDataList('notifications', { user_id: user.id });
    await Promise.all((unreadNotifications || []).map((row: any) => laravelData.update('notifications', row.id, { read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = async (id: string) => {
    const success = await notificationService.notificationService.clearNotification(id);
    if (success) setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const broadcastMassNotification = async (data: { target: string; title: string; message: string }) => {
    try {
      const response = await adminFetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({})) as Record<string, any>;
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Broadcast failed');
      }

      toast.success(`Broadcast sent to ${data.target} (${result.sent ?? 0} recipients)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Broadcast failed');
    }
  };

  const dispatchPromotionalEmailDigest = async () => {
    try {
      const response = await adminFetch('/api/admin/email-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience: 'all', includeTopListings: true }),
      });

      const result = await response.json().catch(() => ({})) as Record<string, any>;
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Digest dispatch failed');
      }

      toast.success(result.message || 'Weekly digest queue started');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Digest dispatch failed');
    }
  };

  const broadcastEmail = async (data: {
    target: 'all' | 'buyer' | 'seller' | 'individual';
    subject: string;
    html: string;
    text?: string;
    template?: string;
    userIds?: string[];
  }): Promise<boolean> => {
    try {
      const response = await adminFetch('/api/email/admin/send', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({})) as Record<string, any>;
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Email broadcast failed');
      }

      toast.success(`Email broadcast sent to ${result.target}: ${result.successful} successful, ${result.failed} failed`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Email broadcast failed');
      return false;
    }
  };

  const sendMultiChannelPasswordReset = async (
    email: string,
    fullName?: string,
    phoneNumber?: string,
    whatsappNumber?: string
  ): Promise<boolean> => {
    try {
      const resetUrl = `${window.location.origin}/reset-password`;
      const response = await adminFetch('/api/email/password-reset', {
        method: 'POST',
        body: JSON.stringify({
          email,
          fullName,
          resetUrl,
          phoneNumber,
          whatsappNumber,
          channels: ['email', 'sms', 'whatsapp'],
        }),
      });

      const result = await response.json().catch(() => ({})) as Record<string, any>;
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Password reset dispatch failed');
      }

      toast.success(`Password reset sent via: ${result.channels?.join(', ') || 'email'}`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Password reset dispatch failed');
      return false;
    }
  };

  const broadcastSMS = async (data: { target: 'all' | 'buyer' | 'seller' | 'individual'; message: string; userIds?: string[] }): Promise<boolean> => {
    try {
      const response = await adminFetch('/api/email/admin/sms', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({})) as Record<string, any>;
      if (!response.ok) {
        throw new Error(result.error || result.message || 'SMS broadcast failed');
      }

      toast.success(`SMS broadcast sent to ${result.target}: ${result.successful} successful, ${result.failed} failed`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'SMS broadcast failed');
      return false;
    }
  };

  const broadcastWhatsApp = async (data: { target: 'all' | 'buyer' | 'seller' | 'individual'; message: string; userIds?: string[] }): Promise<boolean> => {
    try {
      const response = await adminFetch('/api/email/admin/whatsapp', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({})) as Record<string, any>;
      if (!response.ok) {
        throw new Error(result.error || result.message || 'WhatsApp broadcast failed');
      }

      toast.success(`WhatsApp broadcast sent to ${result.target}: ${result.successful} successful, ${result.failed} failed`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'WhatsApp broadcast failed');
      return false;
    }
  };

  const uploadAttachment = async (data: { filename: string; content: string; type?: string }): Promise<{ success: boolean; attachment: { filename: string; content: string; type: string; size: number } }> => {
    const response = await adminFetch('/api/email/admin/upload-attachment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  };

  const submitPasswordRequest = async (request: any) => {
    if (!user) return;
    const created = await passwordRequestService.create({
      user_id: user.id,
      user_email: user.email,
      user_name: user.fullName,
      nin: request.nin,
      id_document_url: request.id_document_url || request.idDocumentUrl,
      new_password_hash: 'SECURE_RESET_REQUIRED',
      reason: request.reason,
    });
    if (created) setPasswordRequests(prev => [created, ...prev]);
  };

  const processPasswordRequest = async (id: string, status: string) => {
    const success = await passwordRequestService.passwordRequestService.updateStatus(id, status);
    if (success) setPasswordRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const submitVerificationRequest = async (request: any) => {
    if (!user) return;
    const created = await verificationService.create({
      user_id: user.id,
      user_name: user.fullName,
      user_email: user.email,
      type: request.type || 'individual',
      doc_type: request.docType,
      doc_number: request.docNumber,
      doc_url: request.docUrl,
    });
    if (created) setVerificationRequests(prev => [created, ...prev]);
  };

  const processVerificationRequest = async (id: string, status: string) => {
    const response = await adminFetch(`/api/admin/verifications/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    if (!response.ok) throw new Error('Unable to process verification request');
    setVerificationRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const submitPromotionPaymentRequest = async (request: any) => {
    if (!user) return;
    const created = await promotionService.create({
      user_id: user.id,
      ad_id: request.listingId,
      amount: request.amount,
      payment_method: request.paymentMethod,
      payment_proof_url: request.paymentProofUrl || null,
      plan_name: request.planName || 'Featured ad',
      duration_months: request.durationMonths || 1,
    });
    if (created) setPromotionPaymentRequests(prev => [created, ...prev]);
  };

  const processPromotionPaymentRequest = async (id: string, status: string) => {
    const response = await adminFetch(`/api/admin/promotions/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    if (!response.ok) throw new Error('Unable to process promotion payment');
    setPromotionPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addAnnouncement = async (announcement: Omit<SystemAnnouncement, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !isAdmin) return;
    const created = await announcementService.create({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      active: announcement.active,
      target_roles: announcement.targetRoles || ['buyer', 'seller'],
      created_by: user.id,
    });
    if (created) setAnnouncements(prev => dedupeAnnouncements([mapAnnouncementRow(created), ...prev]));
  };

  const toggleAnnouncement = async (id: string) => {
    const announcement = announcements.find(item => item.id === id);
    if (!announcement) return;
    const data = await laravelData.update<any>('announcements', id, { active: !announcement.active });
    setAnnouncements(prev => dedupeAnnouncements(prev.map(item => item.id === id ? mapAnnouncementRow(data) : item)));
  };

  const deleteAnnouncement = async (id: string) => {
    const success = await announcementService.announcementService.delete(id);
    if (success) setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const submitReport = async (report: any) => {
    if (!user) return;
    const created = await reportService.create({
      ad_id: report.listingId,
      ad_title: report.listingTitle,
      reporter_id: user.id,
      reporter_name: user.fullName,
      reason: report.reason,
      details: report.details || null,
    });
    if (created) setReports(prev => [created, ...prev]);
  };

  const processReport = async (id: string, status: string) => {
    const response = await adminFetch(`/api/admin/reports/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    if (!response.ok) throw new Error('Unable to process report');
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const submitDisputeCase = async (dispute: any) => {
    if (!user) return;
    const created = await disputeService.create({
      user_id: user.id,
      user_email: user.email,
      receipt_ref: dispute.receiptRef || null,
      item_title: dispute.itemTitle,
      counterparty: dispute.counterparty,
      category: dispute.category,
      reason: dispute.reason,
      details: dispute.details,
      evidence_url: dispute.evidenceUrl || null,
    });
    if (created) setDisputeCases(prev => [created, ...prev]);
  };

  const processDisputeCase = async (id: string, status: string) => {
    const response = await adminFetch(`/api/admin/disputes/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    if (!response.ok) throw new Error('Unable to process dispute');
    setDisputeCases(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  const addAuditLog = (action: string, details: string, type: string) => {
    if (!user) return;
    void auditService.create({ action, details, type, user_id: user.id }).then((created: any) => {
      if (created) setAuditLogs(prev => [created, ...prev]);
    });
  };

  const sealDeal = (listingTitle: string, buyerName: string, price: number) => {
    void buyerName;
    void recentDealsService.create({ item_title: listingTitle, price, location: user?.location || 'Ogbomoso', time: 'Just now' }).then((created: any) => {
      if (created) setRecentDeals(prev => [created, ...prev]);
    });
  };

  const recordIntrusion = (attemptedEmail: string, metadata: string) => {
    void intrusionService.create({ attempted_email: attemptedEmail, device_info: { metadata }, media_captured: false, media_status: 'N/A', status: 'flagged', user_agent: metadata }).then((created: any) => {
      if (created) setIntrusionLogs(prev => [created, ...prev]);
    });
  };

  // ---- New-user signup alerts ---------------------------------------------
  const loadSignupAlerts = async (status?: string): Promise<any[]> => {
    const params = new URLSearchParams({ limit: '200', offset: '0' });
    if (status) params.set('status', status);
    const response = await adminFetch(`/api/admin/signup-alerts?${params}`);
    if (!response.ok) throw new Error('Unable to load signup alerts');
    const data = await response.json();
    const alerts = data?.alerts || [];
    setSignupAlerts(alerts);
    return alerts;
  };

  const updateSignupAlert = async (id: string, status: string, note?: string): Promise<any | null> => {
    const response = await adminFetch(`/api/admin/signup-alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error || 'Unable to update signup alert');
    }
    const data = await response.json();
    const alert = data?.alert;
    if (alert) {
      setSignupAlerts(prev => prev.map(item => item.id === id ? alert : item));
    }
    return alert || null;
  };

  // ---- Administrator login audit sessions ---------------------------------
  const loadLoginSessions = async (params?: { status?: string; adminId?: string; limit?: number; offset?: number }): Promise<{ sessions: any[]; active: number }> => {
    const search = new URLSearchParams();
    search.set('limit', String(params?.limit ?? 200));
    search.set('offset', String(params?.offset ?? 0));
    if (params?.status) search.set('status', params.status);
    if (params?.adminId) search.set('adminId', params.adminId);
    const response = await adminFetch(`/api/admin/login-sessions?${search}`);
    if (!response.ok) throw new Error('Unable to load login sessions');
    const data = await response.json();
    const sessions = data?.sessions || [];
    const active = Number(data?.active || 0);
    setLoginSessions(sessions);
    setActiveLoginSessions(active);
    return { sessions, active };
  };

  const updateLoginSession = async (id: string, status: string): Promise<any | null> => {
    const response = await adminFetch(`/api/admin/login-sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error || 'Unable to update login session');
    }
    const data = await response.json();
    const session = data?.session;
    if (session) {
      setLoginSessions(prev => prev.map(item => item.id === id ? session : item));
      if (session.status === 'logged_in') {
        setActiveLoginSessions(prev => prev + 1);
      } else if (session.status === 'logged_out' || session.status === 'expired' || session.status === 'force_terminated') {
        setActiveLoginSessions(prev => Math.max(0, prev - 1));
      }
    }
    return session || null;
  };

  const saveSearchAlert = async (alert: Omit<SearchAlert, 'id' | 'userId' | 'createdAt' | 'matchCount' | 'isActive'>) => {
    if (!user) return;
    const categoryId = alert.category === 'All'
      ? null
      : categories.find(category => category.name === alert.category)?.id || alert.category;
    const created = await searchAlertService.create({
      user_id: user.id,
      query: alert.query,
      category_id: categoryId,
      max_price: alert.maxPrice,
      location: alert.location,
    });
    if (created) setSearchAlerts(prev => [mapSearchAlertRow(created), ...prev]);
  };

  const deleteSearchAlert = async (id: string) => {
    const success = await searchAlertService.searchAlertService.delete(id);
    if (success) setSearchAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const addReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
    const created = await reviewService.create({
      seller_id: review.sellerId,
      buyer_id: review.buyerId,
      buyer_name: review.buyerName,
      buyer_avatar: review.buyerAvatar || null,
      rating: review.rating,
      comment: review.comment,
    });
    if (created) setReviews(prev => [mapReviewRow(created), ...prev]);
  };

  const deleteReview = async (id: string) => {
    const success = await reviewService.reviewService.delete(id);
    if (success) setReviews(prev => prev.filter(review => review.id !== id));
  };

  const createBuyerRequest = async (request: Omit<BuyerRequest, 'id' | 'createdAt' | 'responsesCount'>) => {
    const categoryId = categories.find(category => category.name === request.category)?.id || request.category;
    const created = await buyerRequestService.create({
      user_id: request.userId,
      user_name: request.userName,
      user_avatar: request.userAvatar || null,
      title: request.title,
      category_id: categoryId,
      max_budget: request.maxBudget,
      location: request.location,
      description: request.description,
    });
    if (created) setBuyerRequests(prev => [mapBuyerRequestRow(created), ...prev]);
  };

  const deleteBuyerRequest = async (id: string) => {
    const success = await buyerRequestService.buyerRequestService.delete(id);
    if (success) setBuyerRequests(prev => prev.filter(request => request.id !== id));
  };


  const syncDatabase = async () => {
    setIsSyncing(true);
    try {
      await loadDatabaseState(user ? { id: user.id, role: user.role } : null);
      setLastSyncTime(new Date().toLocaleTimeString());
      toast.success('Database synchronized');
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchData = async () => {
    await syncDatabase();
  };

  const createUser = async (newUser: Partial<UserProfile>): Promise<UserProfile | null> => {
    const response = await adminFetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email: newUser.email }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('[AdminCreateUser] Failed:', details);
      throw new Error('User creation is disabled: Secure Auth user creation not available');
    }

    const result = await response.json();
    const created = result?.user ? mapProfileToUser(result.user) : null;
    if (!created) return null;

    setAllUsers(prev => [created, ...prev]);
    return created;
  };

  const addUser = (newUser: UserProfile) => {
    setAllUsers(prev => [newUser, ...prev]);
  };

  const deleteUser = async (id: string) => {
    if (id === user?.id) {
      toast.error('Cannot delete your own account');
      return;
    }
    const response = await adminFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const details = await response.text();
      console.error('[AdminDeleteUser] Failed:', details);
      toast.error('Failed to restrict user');
      return;
    }
    await reloadUsers();
    toast.success('User restricted successfully');
  };

  const updateUser = async (id: string, updates: Partial<UserProfile>) => {
    const fieldMap: Record<string, string> = {
      fullName: 'full_name', phoneNumber: 'phone_number', avatarUrl: 'avatar_url', storeBannerUrl: 'store_banner_url',
      bio: 'bio', verified: 'verified', verificationType: 'verification_type', businessName: 'business_name',
      businessCategory: 'business_category', businessAddress: 'business_address', cacNumber: 'cac_number', businessHours: 'business_hours',
      bankName: 'bank_name', accountNumber: 'account_number', accountName: 'account_name', websiteUrl: 'website_url',
      instagramHandle: 'instagram_handle', twitterHandle: 'twitter_handle', whatsappNumber: 'whatsapp_number',
      emailNotifications: 'email_notifications', whatsappNotifications: 'whatsapp_notifications', hidePhonePublicly: 'hide_phone_publicly',
      hideLocationPublicly: 'hide_location_publicly', location: 'location', status: 'status', restrictionReason: 'restriction_reason',
      appealStatus: 'appeal_status', totalValueTraded: 'total_value_traded', completedDeals: 'completed_deals',
    };
    const databaseUpdates = Object.entries(updates).reduce((mapped: Record<string, any>, [key, value]) => {
      if (fieldMap[key]) mapped[fieldMap[key]] = value;
      return mapped;
    }, {});
    if (isAdmin && updates.role !== undefined) databaseUpdates.role = updates.role;
    databaseUpdates.updated_at = new Date().toISOString();

    const response = await adminFetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(databaseUpdates),
    });
    if (!response.ok) {
      const details = await response.text();
      console.error('[AdminUpdateUser] Failed:', details);
      throw new Error('Failed to update user via admin API');
    }
    const result = await response.json();
    const updated = result?.user ? mapProfileToUser(result.user) : null;
    if (!updated) return;
    setAllUsers(prev => prev.map(existingUser => existingUser.id === id ? updated : existingUser));
    if (user?.id === id) applyAuthenticatedUser(updated);
  };

  const bulkUpdateUsers = async (ids: string[], updates: Partial<UserProfile>) => {
    const fieldMap: Record<string, string> = {
      fullName: 'full_name', phoneNumber: 'phone_number', avatarUrl: 'avatar_url', storeBannerUrl: 'store_banner_url',
      bio: 'bio', verified: 'verified', verificationType: 'verification_type', businessName: 'business_name',
      businessCategory: 'business_category', businessAddress: 'business_address', cacNumber: 'cac_number', businessHours: 'business_hours',
      bankName: 'bank_name', accountNumber: 'account_number', accountName: 'account_name', websiteUrl: 'website_url',
      instagramHandle: 'instagram_handle', twitterHandle: 'twitter_handle', whatsappNumber: 'whatsapp_number',
      emailNotifications: 'email_notifications', whatsappNotifications: 'whatsapp_notifications', hidePhonePublicly: 'hide_phone_publicly',
      hideLocationPublicly: 'hide_location_publicly', location: 'location', status: 'status', restrictionReason: 'restriction_reason',
      appealStatus: 'appeal_status', totalValueTraded: 'total_value_traded', completedDeals: 'completed_deals',
    };
    const databaseUpdates = Object.entries(updates).reduce((mapped: Record<string, any>, [key, value]) => {
      if (fieldMap[key]) mapped[fieldMap[key]] = value;
      return mapped;
    }, {});
    if (isAdmin && updates.role !== undefined) databaseUpdates.role = updates.role;
    databaseUpdates.updated_at = new Date().toISOString();

    const response = await adminFetch('/api/admin/users/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids, data: databaseUpdates }),
    });
    if (!response.ok) {
      const details = await response.text();
      console.error('[AdminBulkUpdateUsers] Failed:', details);
      throw new Error('Failed to bulk update users via admin API');
    }
    await reloadUsers();
  };

const bulkDeleteUsers = async (ids: string[]) => {
    const safeIds = ids.filter(id => id !== user?.id);
    if (safeIds.length === 0) {
      toast.error('Cannot perform this operation on the selected users');
      return;
    }
    const response = await adminFetch('/api/admin/users/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids: safeIds, data: { status: 'banned', updated_at: new Date().toISOString() } }),
    });
    if (!response.ok) {
      const details = await response.text();
      console.error('[AdminBulkDeleteUsers] Failed:', details);
      throw new Error('Failed to bulk restrict users via admin API');
    }
    await reloadUsers();
    toast.success(`Restricted ${safeIds.length} users`);
  };

   const reloadUsers = async () => {
     if (user?.role === 'admin') {
       try {
const response = await adminFetch('/api/admin/users');
          if (response.ok) {
            const data = await response.json();
            setAllUsers((data?.users || []).map(mapProfileToUser));
          } else {
            // Previously silent: the dashboard showed zeros with no clue that
            // the admin API had refused the request.
            console.warn(`[AdminUsers] /api/admin/users returned ${response.status}; user lists and counters are unavailable`);
          }
       } catch { /* ignore */ }
     }
   };

   const bulkUpdateListings = (ids: string[], updates: Partial<Listing>) => {
    void Promise.all(ids.map(id => updateListing(id, updates)));
  };

  const bulkDeleteListings = (ids: string[]) => {
    void Promise.all(ids.map(id => deleteListing(id)));
  };

  const exportDatabaseBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ listings, allUsers, reviews, siteSettings }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `Sealify_DB_Backup_${Date.now()}.json`);
    dlAnchorElem.click();
    toast.success("Database Backup Exported!");
  };

  const addSafeSpot = async (spot: SafeMeetupSpotConfig) => {
    const created = await safeSpotService.create({
      name: spot.name,
      zone: spot.zone,
      category: spot.category,
      address: spot.address,
      distance: spot.distance,
      hours: spot.hours,
      cctv_verified: spot.cctvVerified,
    } as any);
    if (created) setSafeSpots(prev => [...prev, mapSafeSpotRow(created)]);
  };

  const deleteSafeSpot = async (id: string) => {
    const success = await safeSpotService.safeSpotService.delete(id);
    if (success) setSafeSpots(prev => prev.filter(spot => spot.id !== id));
  };

  const updatePromotionPlanRate = (months: number, rate: number) => {
    void (async () => {
      try {
        const rows = await laravelDataList('promotion_plans', { months });
        const targetRow = rows[0];
        if (targetRow?.id) {
          await laravelData.update('promotion_plans', targetRow.id, { rate });
          setPromotionPlans(prev => prev.map(plan => plan.months === months ? { ...plan, rate } : plan));
        }
      } catch (error) {
        console.error('updatePromotionPlanRate failed:', error);
      }
    })();
  };

  const addCategory = (category: CategoryConfig) => {
    void categoryService.categoryService.create({
      id: category.id,
      name: category.name,
      icon_name: category.iconName,
      color: category.color,
      sort_order: categories.length,
      is_active: true,
    }).then((created: any) => {
      if (created) setCategories(prev => [...prev, mapCategoryRow(created)]);
    });
  };

  const deleteCategory = (id: string) => {
    void categoryService.categoryService.delete(id).then(success => {
      if (success) setCategories(prev => prev.filter(category => category.id !== id));
    });
  };

  const updateCategory = (id: string, name: string) => {
    void categoryService.categoryService.update(id, { name }).then((updated: any) => {
      if (updated) setCategories(prev => prev.map(category => category.id === id ? mapCategoryRow(updated) : category));
    });
  };

  const updateSystemConfig = (updates: Record<string, boolean | number>) => {
    setSystemConfig(prev => ({ ...prev, ...updates }));
    if (!isAdmin) return;
    void adminFetch('/api/admin/system-config', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }).then(async response => {
      if (!response.ok) throw new Error('Unable to update system configuration');
    }).catch(error => {
      console.error('updateSystemConfig failed:', error);
      toast.error('System configuration could not be updated');
    });
  };

  const updateSiteSettings = (settings: Partial<typeof siteSettings>) => {
    setSiteSettings(prev => ({ ...prev, ...settings }));
    void (async () => {
      const databaseSettings = {
        logo_url: settings.logoUrl ?? siteSettings?.logoUrl ?? MOCK_SITE_SETTINGS.logoUrl,
        site_name: settings.siteName ?? siteSettings?.siteName ?? MOCK_SITE_SETTINGS.siteName,
        site_description: settings.siteDescription ?? siteSettings?.siteDescription ?? MOCK_SITE_SETTINGS.siteDescription,
        og_image: settings.ogImage ?? siteSettings?.ogImage ?? MOCK_SITE_SETTINGS.ogImage,
        contact_email: settings.contactEmail ?? siteSettings?.contactEmail ?? MOCK_SITE_SETTINGS.contactEmail,
        contact_phone: settings.contactPhone ?? siteSettings?.contactPhone ?? MOCK_SITE_SETTINGS.contactPhone,
        updated_at: new Date().toISOString(),
      };

      await siteSettingsService.updateSettings(databaseSettings as any);
    })().catch((error) => {
      console.error('updateSiteSettings failed:', error);
    });
  };

  const loadDatabaseState = async (authUser: any | null) => {
    const listingResultPromise = api.getPublic<{ listings: any[] }>('/listings', { limit: '100' });
    const configRowsPromise = authUser?.role === 'admin'
      ? adminFetch('/api/admin/system-config').then(async response => {
          if (!response.ok) throw new Error('Unable to load system configuration');
          const payload = await response.json();
          return payload.configs || [];
        })
      : Promise.resolve([]);
    const [listingResult, categoryRows, subcategoryRows, announcementRows, safeSpotRows, promotionPlanRows, configRows, siteSettingsRow, reviewRows, buyerRequestRows, recentDealRows] = await Promise.all([
      listingResultPromise,
      categoryService.getAll(),
      subcategoryService.getAll(),
      announcementService.getAll(),
      safeSpotService.getAll(),
      promotionPlanService.getAll(),
      configRowsPromise,
      siteSettingsService.get(),
      reviewService.getAll(),
      buyerRequestService.getAll(),
      recentDealsService.getAll(),
    ]);

    const mappedListings = (listingResult.listings || []).map(mapListingToListing);
    setListings(mappedListings);

    const mappedCategories = (categoryRows || []).map(mapCategoryRow);
    setCategories(mappedCategories.length ? mappedCategories : MOCK_CATEGORIES);
    setSubcategories(subcategoryRows || []);
    setAnnouncements(dedupeAnnouncements(announcementRows || []));
    setSafeSpots((safeSpotRows || []).map(mapSafeSpotRow));
    setPromotionPlans((promotionPlanRows || []).map(mapPromotionPlanRow));
    if (configRows.length > 0) {
      setSystemConfig(configRows.reduce((config: Record<string, boolean | number>, row: any) => {
        config[row.key] = row.value;
        return config;
      }, {}));
    }

    if (siteSettingsRow) {
      const dbRow = siteSettingsRow as any;
      setSiteSettings({
        logoUrl: dbRow.logo_url || MOCK_SITE_SETTINGS.logoUrl,
        siteName: dbRow.site_name || MOCK_SITE_SETTINGS.siteName,
        siteDescription: dbRow.site_description || MOCK_SITE_SETTINGS.siteDescription,
        ogImage: dbRow.og_image || MOCK_SITE_SETTINGS.ogImage,
        contactEmail: dbRow.contact_email || MOCK_SITE_SETTINGS.contactEmail,
        contactPhone: dbRow.contact_phone || MOCK_SITE_SETTINGS.contactPhone,
      });
    }

    setReviews((reviewRows || []).map(mapReviewRow));
    setBuyerRequests((buyerRequestRows || []).map(mapBuyerRequestRow));
    setRecentDeals(recentDealRows || []);
    setAnalytics(prev => ({
      ...prev,
      totalAds: mappedListings.length,
      soldAds: mappedListings.filter(listing => listing.status === 'sold').length,
      categoryDistribution: mappedCategories.map(category => ({
        name: category.name,
        count: mappedListings.filter(listing => listing.category === category.name).length,
      })),
    }));

    if (!authUser) {
      applyAuthenticatedUser(null);
      setSavedListingIds([]);
      setNotifications([]);
      setConversations([]);
      setSearchAlerts([]);
      return;
    }

    const [favoriteIds, notificationRows, searchAlertRows] = await Promise.all([
      favoriteService.getByUserId(authUser.id),
      notificationService.getAll(authUser.id),
      searchAlertService.getAll(authUser.id),
    ]);

    setSavedListingIds(favoriteIds);
    setNotifications((notificationRows || []).map(mapNotificationRow));
    setSearchAlerts((searchAlertRows || []).map(mapSearchAlertRow));
    await refreshConversations(authUser.id);

if (authUser.role === 'admin') {
       const [adminUsers, verificationRows, passwordRows, promotionRows, reportRows, disputeRows, auditRows, intrusionRows, signupAlertRows, loginSessionRows] = await Promise.all([
         adminFetch('/api/admin/users').then(async (response) => {
           if (!response.ok) throw new Error('Unable to load users');
           const data = await response.json();
           return (data?.users || []).map(mapProfileToUser);
         }),
         verificationService.getAll(),
         passwordRequestService.getAll(),
         promotionService.getAll(),
         reportService.getAll(),
         disputeService.getAll(),
         auditService.getAll(),
         intrusionService.getAll(),
         adminFetch('/api/admin/signup-alerts').then(async (response) => {
           if (!response.ok) return [];
           const data = await response.json();
           return data?.alerts || [];
         }),
         adminFetch('/api/admin/login-sessions').then(async (response) => {
           if (!response.ok) return { sessions: [], active: 0 };
           const data = await response.json();
           return { sessions: data?.sessions || [], active: Number(data?.active || 0) };
         }),
       ]);
       setVerificationRequests(verificationRows || []);
       setPasswordRequests(passwordRows || []);
       setPromotionPaymentRequests(promotionRows || []);
       setReports(reportRows || []);
       setDisputeCases(disputeRows || []);
       setAuditLogs(auditRows || []);
       setIntrusionLogs(intrusionRows || []);
       setSignupAlerts(signupAlertRows || []);
       setLoginSessions(loginSessionRows.sessions || []);
       setActiveLoginSessions(loginSessionRows.active || 0);
     }
  };

  useEffect(() => {
    let mounted = true;

    const hydrate = async (sessionOverride?: any) => {
      setLoading(true);
      setError(null);
      try {
        const currentSession = sessionOverride ?? (await api.getSession()).data.session;
        const session = currentSession;
        const profile = session?.user ? await loadProfileForAuthUser(session.user) : null;
        if (profile) applyAuthenticatedUser(profile);
        await loadDatabaseState(profile ? { ...session.user, role: profile.role } : null);
        if (mounted && profile?.role === 'admin') {
          await reloadUsers();
        }
      } catch (loadError: any) {
        console.error('Laravel hydration failed:', loadError);
        if (mounted) setError(loadError?.message || 'Unable to load marketplace data');
      } finally {
        if (mounted) {
          setLastSyncTime(new Date().toLocaleTimeString());
          setLoading(false);
        }
      }
    };

    void hydrate();
    const handleAuthStorage = (event: StorageEvent) => {
      if (event.key && event.key !== 'sealify_access_token') return;
      void hydrate();
    };

    window.addEventListener('storage', handleAuthStorage);

    return () => {
      mounted = false;
      window.removeEventListener('storage', handleAuthStorage);
    };
  }, []);

  const contextValue = useMemo(() => ({
    user,
    setUser,
    isAuthenticated: !!user,
     isAdmin,
     systemConfig,
    updateSystemConfig,
    siteSettings,
    updateSiteSettings,
    promotionPlans,
    updatePromotionPlanRate,
    safeSpots,
    addSafeSpot,
    deleteSafeSpot,
    exportDatabaseBackup,
    language,
    setLanguage,
    t,
    categories,
    subcategories,
    addCategory,
    deleteCategory,
    updateCategory,
    analytics,
    marketStats,
    login,
    signup,
    signInWithOAuth,
    sendPhoneOtp,
    verifyPhoneOtp,
    adminLogin,
    logout,
resetPassword,
     completeProfile,
     listings,
    allUsers,
    createUser,
    updateUser,
    addUser,
    deleteUser,
    bulkUpdateUsers,
bulkDeleteUsers,
     reloadUsers,
     bulkUpdateListings,
     bulkDeleteListings,
    savedListingIds,
    recentlyViewedIds,
    userInterests,
    addRecentlyViewed,
    toggleSaveListing,
    isSaved,
    filters,
    setFilters,
    resetFilters,
    activeCategory,
    setActiveCategory,
    compareListingIds,
    toggleCompareListing,
    isInCompare,
    clearCompare,
    createListing,
    updateListing,
    deleteListing,
    markAsSold,
    toggleFeaturedListing,
    promoteListing,
    conversations,
    sendMessage,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
    addNotification,
    broadcastMassNotification,
    dispatchPromotionalEmailDigest,
    broadcastEmail,
    sendMultiChannelPasswordReset,
    broadcastSMS,
    broadcastWhatsApp,
    uploadAttachment,
    passwordRequests,
    submitPasswordRequest,
    processPasswordRequest,
    verificationRequests,
    submitVerificationRequest,
    processVerificationRequest,
    promotionPaymentRequests,
    submitPromotionPaymentRequest,
    processPromotionPaymentRequest,
    announcements,
    addAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    reports,
    submitReport,
    processReport,
    disputeCases,
    submitDisputeCase,
    processDisputeCase,
    auditLogs,
    addAuditLog,
    recentDeals,
    sealDeal,
    intrusionLogs,
    recordIntrusion,
    signupAlerts,
    loadSignupAlerts,
    updateSignupAlert,
    loginSessions,
    activeLoginSessions,
    loadLoginSessions,
    updateLoginSession,
    searchAlerts,
    saveSearchAlert,
    deleteSearchAlert,
    reviews,
    addReview,
    deleteReview,
    buyerRequests,
    createBuyerRequest,
    deleteBuyerRequest,
    loading,
    isSyncing,
    lastSyncTime,
    syncDatabase,
    error,
    clearError
  }), [
    user, isAdmin, systemConfig, siteSettings, promotionPlans, safeSpots,
    listings, allUsers, createUser, updateUser, addUser, deleteUser, reloadUsers, savedListingIds, recentlyViewedIds, userInterests,
    addRecentlyViewed, toggleSaveListing, isSaved, filters, setFilters, resetFilters,
    activeCategory, setActiveCategory, compareListingIds, toggleCompareListing, isInCompare, clearCompare,
    createListing, updateListing, deleteListing, markAsSold, conversations, sendMessage,
    notifications, markNotificationRead, markAllNotificationsRead, clearNotification,
    addNotification, broadcastMassNotification, dispatchPromotionalEmailDigest, broadcastEmail, sendMultiChannelPasswordReset, broadcastSMS, broadcastWhatsApp, uploadAttachment,
    passwordRequests, submitPasswordRequest, processPasswordRequest, verificationRequests, submitVerificationRequest, processVerificationRequest,
    promotionPaymentRequests, submitPromotionPaymentRequest, processPromotionPaymentRequest, announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
    reports, submitReport, processReport, disputeCases, submitDisputeCase, processDisputeCase, auditLogs, addAuditLog,
    recentDeals, sealDeal, intrusionLogs, recordIntrusion, signupAlerts, loadSignupAlerts, updateSignupAlert, loginSessions, activeLoginSessions, loadLoginSessions, updateLoginSession, searchAlerts, saveSearchAlert, deleteSearchAlert,
    reviews, addReview, deleteReview, buyerRequests, createBuyerRequest, deleteBuyerRequest,
    loading, isSyncing, lastSyncTime, syncDatabase, error, signInWithOAuth, completeProfile
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
