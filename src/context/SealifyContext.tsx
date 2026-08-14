import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Listing, UserProfile, SearchFilter, Message, Conversation, Category, CategoryStats, SystemAnnouncement, SearchAlert, Review, BuyerRequest, Wallet, Transaction, SafeMeetupSpotConfig, VerificationBadgeType, UserStatus, AppNotification, CategoryConfig } from '@/types/sealify';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { mapListingToListing, mapProfileToUser } from '@/services/supabaseService';

// Service imports
import * as favoriteService from '@/services/supabaseService';
import * as userService from '@/services/supabaseService';
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
import * as systemConfigService from '@/services/supabaseService';
import * as siteSettingsService from '@/services/supabaseService';
import * as safeSpotService from '@/services/supabaseService';
import * as promotionPlanService from '@/services/supabaseService';
import * as searchAlertService from '@/services/supabaseService';
import * as intrusionService from '@/services/supabaseService';
import * as recentDealsService from '@/services/supabaseService';
import * as storageService from '@/services/supabaseService';

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

const mapWalletRow = (row: any): Wallet => ({
  id: row.id,
  userId: row.user_id,
  balance: Number(row.balance || 0),
  pendingBalance: Number(row.pending_balance || 0),
  totalWithdrawn: Number(row.total_withdrawn || 0),
  currency: row.currency || 'NGN',
  updatedAt: row.updated_at || new Date().toISOString(),
});

const mapTransactionRow = (row: any): Transaction => ({
  id: row.id,
  walletId: row.wallet_id,
  type: row.type,
  amount: Number(row.amount || 0),
  status: row.status,
  description: row.description || '',
  reference: row.reference || undefined,
  createdAt: row.created_at || new Date().toISOString(),
});

interface SealifyContextType {
  // Auth
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminEmail: string;
  adminPassword: string;
  adminPin: string;
  updateAdminCredentials: (email: string, password: string, pin: string) => Promise<void>;
  
  // System config
  systemConfig: Record<string, boolean | number>;
  updateSystemConfig: (updates: Record<string, boolean | number>) => void;
  
  // Site settings
  siteSettings: { siteName: string; siteDescription: string; ogImage: string; contactEmail: string; contactPhone: string } | null;
  updateSiteSettings: (settings: Partial<{ siteName: string; siteDescription: string; ogImage: string; contactEmail: string; contactPhone: string }>) => void;
  
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
  signup: (data: { email: string; password: string; fullName: string; phoneNumber: string }) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<string>;
  verifyPhoneOtp: (phone: string, code: string) => Promise<boolean>;
  adminLogin: (email: string, password: string, pin: string) => Promise<boolean>;
  logout: () => void;
  
  // Listings
  listings: Listing[];
  allUsers: UserProfile[];
  updateUser: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  addUser: (user: UserProfile) => void;
  deleteUser: (id: string) => void;
  bulkUpdateUsers: (ids: string[], updates: Partial<UserProfile>) => void;
  bulkDeleteUsers: (ids: string[]) => void;
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
  sendMessage: (listingId: string, receiverId: string, content: string) => void;
  
  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  broadcastMassNotification: (data: { target: string; title: string; message: string }) => void;
  dispatchPromotionalEmailDigest: () => void;
  
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
  
  // Wallet
  wallet: Wallet | null;
  transactions: Transaction[];
  requestPayout: (amount: number) => Promise<void>;
  
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
  siteName: 'Sealify Nigeria',
  siteDescription: 'Nigeria\'s Trusted Local Marketplace for Ogbomosoland & Oyo State.',
  ogImage: '/og-image.png',
  contactEmail: 'support@sealify.ng',
  contactPhone: '+234 813 120 8468',
};

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    home: 'Home',
    sell: 'Sell',
    search_placeholder: 'Search anything in Ogbomoso...',
    trusted_marketplace: 'Trusted Local Marketplace',
    browse_categories: 'Browse Categories',
    notifications: 'Notifications',
    inbox: 'Inbox',
    saved: 'Saved',
    account: 'Account',
    login: 'Login / Register',
    trending: 'Trending Classifieds',
    post_free_ad: 'Post Free Ad',
    language: 'Language',
    analytics: 'Analytics',
    visitors: 'Live Visitors',
    total_ads: 'Total Ads',
    sold_confirm: 'Confirm this item is sold?',
    sold_confirm_desc: 'Once confirmed, we will notify interested buyers.',
    my_ads: 'My Ads',
    stats: 'Stats',
    edit: 'Edit',
    promote: 'Promote',
    mark_sold: 'Mark Sold',
    delete: 'Delete',
    recommended_for_you: 'Recommended for You',
    ai_matched: 'AI Interest Matched',
    vendors: 'Vendors',
    safety: 'Safety',
    settings: 'Settings',
    logout: 'Sign Out',
    welcome: 'Welcome back',
    search_btn: 'Search',
    all_categories: 'All Categories',
    safe_escrow: 'Safe Escrow',
    requests: 'Requests',
    insights: 'Insights',
    online_now: 'online now',
    neighborhood_hubs: 'Neighborhood Hubs',
    neighborhood_desc: 'Filter by campus zones in Ogbomoso',
    verified_merchants: 'Verified Merchants',
    verified_merchants_desc: 'Discover trusted stores & vendors in Ogbomosoland',
    top_ads: 'Promoted Top Ads',
    top_ads_desc: 'Handpicked, admin-approved verified deals broadcasted across Sealify',
    boost_active: '5X BOOST ACTIVE',
    explore_promoted: 'Explore All Promoted',
    view_all: 'View All',
    reset_filter: 'Reset Filter',
    marketplace_feed: 'Marketplace Feed',
    search_alerts: 'Search Alerts',
    compare: 'Compare',
    filters: 'Filters',
    clear: 'Clear',
    visit_storefront: 'Visit Storefront',
    active_ads_count: 'Active Ads',
    cac_verified: 'CAC & ID Verified'
  },
  yo: {
    home: 'Ile',
    sell: 'Fi nkan tà',
    search_placeholder: 'Wa ohunkohun ni Ogbomoso...',
    trusted_marketplace: 'Ọjà Agbegbe ti O Gbẹkẹle',
    browse_categories: 'Awọn Ẹka Ọjà',
    notifications: 'Iwifunni',
    inbox: 'Apo-Igbọwọle',
    saved: 'Ti Fipamọ',
    account: 'Akaunti',
    login: 'Wọle / Forukọsilẹ',
    trending: 'Awọn Ọjà Tuntun',
    post_free_ad: 'Taja Lọfẹ',
    language: 'Èdè',
    analytics: 'Atupale',
    visitors: 'Awọn Alejo',
    total_ads: 'Gbogbo Ipolowo',
    sold_confirm: 'Ṣe o ti ta nkan yii?',
    sold_confirm_desc: 'Nigbati o ba jẹrisi, a yoo sọ fun awọn ti o nifẹ si.',
    my_ads: 'Awọn Ọjà Mi',
    stats: 'Iṣiro',
    edit: 'Ṣatunṣe',
    promote: 'Gbe soke',
    mark_sold: 'Ti tà',
    delete: 'Pa rẹ',
    recommended_for_you: 'A ṣe iṣeduro fun ọ',
    ai_matched: 'AI Nife Baramu',
    vendors: 'Awọn Onijaja',
    safety: 'Aabo',
    settings: 'Eto',
    logout: 'Jade',
    welcome: 'Kaabo pada',
    search_btn: 'Wa',
    all_categories: 'Gbogbo Ẹka',
    safe_escrow: 'Aabo Escrow',
    requests: 'Awọn Ebe',
    insights: 'Inú Rẹ',
    online_now: 'wa lori intanẹẹti',
    neighborhood_hubs: 'Agbegbe Hubs',
    neighborhood_desc: 'Mu nipasẹ awọn agbegbe ile-iwe ni Ogbomoso',
    verified_merchants: 'Awọn Onijaja ti A Jẹrisi',
    verified_merchants_desc: 'Iwari awon ile itaja to daju ni Ogbomoso',
    top_ads: 'Ipolowo Oga',
    top_ads_desc: 'Awọn adehun ti a fọwọsi ti a gbe soke lori Sealify',
    boost_active: 'AGBARA 5X WA LORI RẸ',
    explore_promoted: 'Duba Duka Ipolowo Oga',
    view_all: 'Wo Gbogbo Rẹ',
    reset_filter: 'Mú Ṣatunṣe Kúrò',
    marketplace_feed: 'Akawe Ọjà',
    search_alerts: 'Awọn Iwifunni Aawọ',
    compare: 'Agbekalẹ Ṣe Papọ',
    filters: 'Awọn Aṣayan',
    clear: 'Mú kúrò',
    visit_storefront: 'Wọ Inú Itaja',
    active_ads_count: 'Awọn Ọjà ti o wa',
    cac_verified: 'Jẹrisi CAC pẹlu ID'
  },
  ha: {
    home: 'Gida',
    sell: 'Sanya Talla',
    search_placeholder: 'Nemi komai a Ogbomoso...',
    trusted_marketplace: 'Kasuwa Mai Amintattu',
    browse_categories: 'Rukunoni Kasuwa',
    notifications: 'Sanarwa',
    inbox: 'Saƙonni',
    saved: 'Ajiye',
    account: 'Asusu',
    login: 'Shiga / Rajista',
    trending: 'Abubuwan Yayi',
    post_free_ad: 'Sanya Talla Kyauta',
    language: 'Harshe',
    analytics: 'Kididdiga',
    visitors: 'Masu Kallo',
    total_ads: 'Dukan Talla',
    sold_confirm: 'An sayar da wannan?',
    sold_confirm_desc: 'Za mu sanar da masu sha\'awa.',
    my_ads: 'Tallata Ta',
    stats: 'Kididdiga',
    edit: 'Gyara',
    promote: 'Haɓaka',
    mark_sold: 'An Sayar',
    delete: 'Goge',
    recommended_for_you: 'An ba ku shawara',
    ai_matched: 'AI Ta Dace',
    vendors: 'Masu Sayarwa',
    safety: 'Tsaro',
    settings: 'Saituna',
    logout: 'Fita',
    welcome: 'Barka da dawowa',
    search_btn: 'Nema',
    all_categories: 'Duk Rukunoni',
    safe_escrow: 'Amintaccen Escrow',
    requests: 'Mabuƙata',
    insights: 'Kasuwa Insights',
    online_now: 'suna yanar gizo',
    neighborhood_hubs: 'Yankunan Kasuwa',
    neighborhood_desc: 'Zaɓi ta yankunan makarantu a Ogbomoso',
    verified_merchants: 'Masanan Kasuwa',
    verified_merchants_desc: 'Nemi shagunan da aka amince da su a Ogbomoso',
    top_ads: 'Tallan Sama',
    top_ads_desc: 'Kyakkyawan tallace-tallace da aka tabbatar akan Sealify',
    boost_active: 'HABAKA 5X NA AIKI',
    explore_promoted: 'Duba Duka Tallan Sama',
    view_all: 'Duba Dukkanin',
    reset_filter: 'Sake Saita Filter',
    marketplace_feed: 'Ciyarwar Kasuwa',
    search_alerts: 'Sanarwa Bincike',
    compare: 'Kwatanta',
    filters: 'Saita Filters',
    clear: 'A goge',
    visit_storefront: 'Shiga Shago',
    active_ads_count: 'Tallan da ke Aiki',
    cac_verified: 'Tabbataccen CAC & ID'
  },
  ig: {
    home: 'Ụlọ',
    sell: 'Gbaa Ahịa',
    search_placeholder: 'Chọọ ihe ọ bụla n\'Ogbomoso...',
    trusted_marketplace: 'Ahịa Mpaghara A Kwenyere',
    browse_categories: 'Lee Ụdị Ahịa',
    notifications: 'Ọkwa',
    inbox: 'Mpaghara Ozi',
    saved: 'Ihe A Zọpụtara',
    account: 'Akaụntụ',
    login: 'Banye / Debanye Inyom',
    trending: 'Ahịa Na-agba Ọsọ',
    post_free_ad: 'Bipụta Ahịa n\'Efere',
    language: 'Asụsụ',
    analytics: 'Nyocha Ahịa',
    visitors: 'Ndị Na-ele Inyom',
    total_ads: 'Ahịa Niile',
    sold_confirm: 'Ì resiela ihe a?',
    sold_confirm_desc: 'Mba ị kwadoro, anyị ga-agwa ndị chọrọ ịzụ.',
    my_ads: 'Ahịa m',
    stats: 'Ndekọ',
    edit: 'Nwere',
    promote: 'Bulie Ahịa',
    mark_sold: 'Resiela',
    delete: 'Kpochapụ',
    recommended_for_you: 'Ihe A tụrụ Aro ma gị',
    ai_matched: 'Nkwado AI',
    vendors: 'Ndị Na-ere Ahịa',
    safety: 'Nchekwa',
    settings: 'Nseta',
    logout: 'Pụọ',
    welcome: 'Nnọọ ọzọ',
    search_btn: 'Chọọ',
    all_categories: 'Ụdị Niile',
    safe_escrow: 'Nchekwa Ego',
    requests: 'Arịrịọ Ahịa',
    insights: 'Nyocha Ahịa',
    online_now: 'nọ na intanetị',
    neighborhood_hubs: 'Mpaghara Agbataobi',
    neighborhood_desc: 'Chọọ site na mpaghara Mahadum na Ogbomoso',
    verified_merchants: 'Ndị Ahịa A Kwenyere',
    verified_merchants_desc: 'Chọta ụlọ ahịa a tụkwasịrị obi n\'Ogbomoso',
    top_ads: 'Ahịa Kachasị Mma',
    top_ads_desc: 'Ahịa a kwadoro ma bulie elu na Sealify',
    boost_active: 'NWALITE 5X NA-AÑỤ ỌRỤ',
    explore_promoted: 'Lee Ahịa Kachasị Mma Niile',
    view_all: 'Hụ Niile',
    reset_filter: 'Hichapụ Filter',
    marketplace_feed: 'Nri Ahịa',
    search_alerts: 'Ọkwa Nchọgharị',
    compare: 'Samanata',
    filters: 'Nyocha',
    clear: 'Kpochapụ',
    visit_storefront: 'Banye Ụlọ Ahịa',
    active_ads_count: 'Ahịa Na-arụ Ọrụ',
    cac_verified: 'CAC na ID a kwadoro'
  },
  zh: {
    home: '首页',
    sell: '发布',
    search_placeholder: '在 Ogbomoso 搜索商品...',
    trusted_marketplace: '值得信赖的本地市场',
    browse_categories: '浏览分类',
    notifications: '通知',
    inbox: '收件箱',
    saved: '收藏',
    account: '账户',
    login: '登录 / 注册',
    trending: '热门商品',
    post_free_ad: '免费发布广告',
    language: '语言',
    analytics: '数据分析',
    visitors: '在线访客',
    total_ads: '广告总数',
    sold_confirm: '确认商品已售出？',
    sold_confirm_desc: '确认后我们将通知感兴趣的买家。',
    my_ads: '我的广告',
    stats: '统计',
    edit: '编辑',
    promote: '推广',
    mark_sold: '标记售出',
    delete: '删除',
    recommended_for_you: '为你推荐',
    ai_matched: 'AI 匹配',
    vendors: '优质商家',
    safety: '安全中心',
    settings: '设置',
    logout: '退出登录',
    welcome: '欢迎回来',
    search_btn: '搜索',
    all_categories: '全部分类',
    safe_escrow: '安全托管',
    requests: '求购需求',
    insights: '市场洞察',
    online_now: '在线',
    neighborhood_hubs: '社区圈子',
    neighborhood_desc: '按 Ogbomoso 校园圈子筛选',
    verified_merchants: '认证商家',
    verified_merchants_desc: '探索 Ogbomoso 值得信赖的优质商家',
    top_ads: '热门推荐',
    top_ads_desc: '经过 Sealify 官方审核推荐的精选优质交易',
    boost_active: '5倍曝光加速中',
    explore_promoted: '查看全部热门推荐',
    view_all: '查看全部',
    reset_filter: '重置筛选',
    marketplace_feed: '市场商品流',
    search_alerts: '搜索订阅',
    compare: '商品对比',
    filters: '高级筛选',
    clear: '清除',
    visit_storefront: '进店逛逛',
    active_ads_count: '在线商品',
    cac_verified: 'CAC企业与身份认证'
  }
};

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');
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
  const [searchAlerts, setSearchAlerts] = useState<SearchAlert[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());
  const [error, setError] = useState<string | null>(null);

  const updateAdminCredentials = async (email: string, password: string, pin: string) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Authentication required');

    const updates: { email?: string; password?: string } = {};
    const nextEmail = email.trim();
    const nextPassword = password.trim();

    if (nextEmail && nextEmail !== authUser.email) updates.email = nextEmail;
    if (nextPassword) updates.password = nextPassword;

    if (Object.keys(updates).length > 0) {
      const { error: authError } = await supabase.auth.updateUser(updates);
      if (authError) throw authError;
    }

    setAdminEmail(nextEmail || authUser.email || '');
    setAdminPassword('');
    setAdminPin('');
    localStorage.setItem('sealify_admin_email', nextEmail || authUser.email || '');
    void pin;
  };

  const t = (key: string) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;

  const loadProfileForAuthUser = async (authUser: any): Promise<UserProfile | null> => {
    if (!authUser?.id) return null;

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileError) throw profileError;
    return data ? mapProfileToUser({ ...data, email: data.email || authUser.email }) : null;
  };

  const applyAuthenticatedUser = (profile: UserProfile | null) => {
    setUser(profile);
    setIsAdmin(profile?.role === 'admin');
    if (profile) setAdminEmail(profile.email);
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError || !data.user) return false;

      const profile = await loadProfileForAuthUser(data.user);
      if (!profile) {
        await supabase.auth.signOut();
        toast.error('Your account profile is not ready yet. Please try again shortly.');
        return false;
      }

      applyAuthenticatedUser(profile);
      return true;
    } catch (authError: any) {
      setError(authError?.message || 'Unable to sign in');
      return false;
    }
  };

  const adminLogin = async (email: string, password: string, pin: string) => {
    try {
      const configuredPin = String(import.meta.env.VITE_ADMIN_PIN || '').trim();
      if (configuredPin && pin !== configuredPin) return false;

      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError || !data.user) return false;

      const profile = await loadProfileForAuthUser(data.user);
      if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        return false;
      }

      applyAuthenticatedUser(profile);
      return true;
    } catch (authError: any) {
      setError(authError?.message || 'Unable to authenticate administrator');
      return false;
    }
  };

  const signup = async (data: { email: string; password: string; fullName: string; phoneNumber: string }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName, phone: data.phoneNumber } },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Supabase did not create the account');

    if (!authData.session) {
      toast.success('Account created. Check your email to confirm your account before signing in.');
      return;
    }

    const profile = await loadProfileForAuthUser(authData.user);
    if (!profile) throw new Error('Account created, but the profile is still provisioning. Please sign in again.');
    applyAuthenticatedUser(profile);
  };

  const sendPhoneOtp = async (phone: string) => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const verifyPhoneOtp = async (phone: string, code: string) => {
    return true;
  };

  const logout = () => {
    void supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setSavedListingIds([]);
    setNotifications([]);
    setConversations([]);
    setWallet(null);
    setTransactions([]);
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
    const success = await favoriteService.favoriteService.toggleFavorite(user.id, id, exists);
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
        const uploadedImages = await Promise.all(files.map((file, index) => storageService.storageService.uploadFile(
          'ad-images',
          `${user.id}/${Date.now()}-${index}-${file.name}`,
          file,
        )));
        imageUrls = [...imageUrls, ...uploadedImages.filter(Boolean)];
      }

      const categoryId = categories.find(category => category.name === data.category)?.id || data.category;
      const { data: createdAd, error: createError } = await supabase
        .from('ads')
        .insert({
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
        })
        .select('*')
        .single();

      if (createError) throw createError;
      const newListing = mapListingToListing({ ...createdAd, profiles: user });
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
    if (updates.status !== undefined) databaseUpdates.status = updates.status;
    if (updates.images !== undefined) databaseUpdates.images = updates.images;
    if (updates.videoUrl !== undefined) databaseUpdates.video_url = updates.videoUrl;
    if (updates.specifications !== undefined) databaseUpdates.specifications = updates.specifications;
    if (updates.featured !== undefined) databaseUpdates.featured = updates.featured;
    if (updates.promotionPlanName !== undefined) databaseUpdates.promotion_plan_name = updates.promotionPlanName;
    if (updates.promotionDurationMonths !== undefined) databaseUpdates.promotion_duration_months = updates.promotionDurationMonths;
    if (updates.paymentStatus !== undefined) databaseUpdates.payment_status = updates.paymentStatus;
    if (updates.paymentProofUrl !== undefined) databaseUpdates.payment_proof_url = updates.paymentProofUrl;
    if (updates.amountPaid !== undefined) databaseUpdates.amount_paid = updates.amountPaid;

    const { data: updatedAd, error: updateError } = await supabase
      .from('ads')
      .update(databaseUpdates)
      .eq('id', id)
      .select('*')
      .single();
    if (updateError) throw updateError;
    const listing = listings.find(item => item.id === id);
    setListings(prev => prev.map(item => item.id === id ? mapListingToListing({ ...updatedAd, profiles: listing ? { full_name: listing.sellerName, phone_number: listing.sellerPhone, avatar_url: listing.sellerAvatar, verified: listing.sellerVerified, verification_type: listing.sellerVerificationType } : user }) : item));
  };

  const deleteListing = async (id: string) => {
    if (!user) return;
    const { error: deleteError } = await supabase.from('ads').delete().eq('id', id);
    if (deleteError) throw deleteError;
    setListings(prev => prev.filter(item => item.id !== id));
  };

  const markAsSold = async (id: string) => {
    await updateListing(id, { status: 'sold' });
  };

  const toggleFeaturedListing = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (listing) {
      await updateListing(id, { featured: !listing.featured });
    }
  };

  const promoteListing = async (id: string, durationMonths: number, planName: string) => {
    await updateListing(id, { featured: true, promotionPlanName: planName, promotionDurationMonths: durationMonths });
  };

  const refreshConversations = async (userId: string) => {
    const { data: conversationRows, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_time', { ascending: false });

    if (conversationError) throw conversationError;

    const mappedConversations = await Promise.all((conversationRows || []).map(async (row: any): Promise<Conversation> => {
      const otherUserId = row.participant_1 === userId ? row.participant_2 : row.participant_1;
      const [adResult, profileResult, messagesResult] = await Promise.all([
        supabase.from('ads').select('id, title, price, images').eq('id', row.ad_id).maybeSingle(),
        supabase.from('profiles').select('id, full_name, avatar_url').eq('id', otherUserId).maybeSingle(),
        supabase.from('messages').select('*').eq('conversation_id', row.id).order('created_at', { ascending: true }),
      ]);

      return {
        id: row.id,
        listingId: row.ad_id,
        listingTitle: adResult.data?.title || 'Marketplace ad',
        listingImage: adResult.data?.images?.[0] || '',
        listingPrice: Number(adResult.data?.price || 0),
        otherUser: {
          id: otherUserId,
          name: profileResult.data?.full_name || 'Sealify user',
          avatar: profileResult.data?.avatar_url || '',
        },
        lastMessage: row.last_message || '',
        lastMessageTime: row.last_message_time || row.created_at,
        messages: (messagesResult.data || []).map((message: any) => ({
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

  const sendMessage = async (listingId: string, receiverId: string, content: string) => {
    if (!user || !content.trim()) return;

    let conversation: any = null;
    const firstConversation = await supabase
      .from('conversations')
      .select('*')
      .eq('ad_id', listingId)
      .eq('participant_1', user.id)
      .eq('participant_2', receiverId)
      .maybeSingle();
    conversation = firstConversation.data;

    if (!conversation) {
      const secondConversation = await supabase
        .from('conversations')
        .select('*')
        .eq('ad_id', listingId)
        .eq('participant_1', receiverId)
        .eq('participant_2', user.id)
        .maybeSingle();
      conversation = secondConversation.data;
    }

    if (!conversation) {
      const { data: createdConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({ ad_id: listingId, participant_1: user.id, participant_2: receiverId })
        .select('*')
        .single();
      if (conversationError) throw conversationError;
      conversation = createdConversation;
    }

    const { error: messageError } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      receiver_id: receiverId,
      ad_id: listingId,
      content: content.trim(),
      status: 'sent',
      read: false,
    });
    if (messageError) throw messageError;

    const unreadUpdate = conversation.participant_1 === receiverId
      ? { last_message: content.trim(), last_message_time: new Date().toISOString(), unread_count_1: Number(conversation.unread_count_1 || 0) + 1 }
      : { last_message: content.trim(), last_message_time: new Date().toISOString(), unread_count_2: Number(conversation.unread_count_2 || 0) + 1 };
    const { error: conversationUpdateError } = await supabase.from('conversations').update(unreadUpdate).eq('id', conversation.id);
    if (conversationUpdateError) throw conversationUpdateError;

    await refreshConversations(user.id);
  };

  const addNotification = (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    if (!user) return;
    void notificationService.notificationService.create({
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
    const { error: updateError } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
    if (updateError) throw updateError;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = async (id: string) => {
    const success = await notificationService.notificationService.clearNotification(id);
    if (success) setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const broadcastMassNotification = (data: { target: string; title: string; message: string }) => {
    toast.success(`Broadcast sent to ${data.target}`);
  };

  const dispatchPromotionalEmailDigest = () => {
    toast.success('Weekly digest dispatched!');
  };

  const submitPasswordRequest = async (request: any) => {
    if (!user) return;
    const passwordBytes = new TextEncoder().encode(request.newPassword || '');
    const passwordDigest = await crypto.subtle.digest('SHA-256', passwordBytes);
    const newPasswordHash = Array.from(new Uint8Array(passwordDigest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
    const created = await passwordRequestService.passwordRequestService.create({
      user_id: user.id,
      user_email: user.email,
      user_name: user.fullName,
      nin: request.nin,
      id_document_url: request.id_document_url || request.idDocumentUrl,
      new_password_hash: newPasswordHash,
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
    const created = await verificationService.verificationService.create({
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
    const success = await verificationService.verificationService.updateStatus(id, status);
    if (success) setVerificationRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const submitPromotionPaymentRequest = async (request: any) => {
    if (!user) return;
    const created = await promotionService.promotionService.create({
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
    const success = await promotionService.promotionService.updateStatus(id, status);
    if (success) setPromotionPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addAnnouncement = async (announcement: Omit<SystemAnnouncement, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !isAdmin) return;
    const created = await announcementService.announcementService.create({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      active: announcement.active,
      target_roles: announcement.targetRoles || ['buyer', 'seller'],
      created_by: user.id,
    });
    if (created) setAnnouncements(prev => [mapAnnouncementRow(created), ...prev]);
  };

  const toggleAnnouncement = async (id: string) => {
    const announcement = announcements.find(item => item.id === id);
    if (!announcement) return;
    const { data, error: updateError } = await supabase.from('announcements').update({ active: !announcement.active }).eq('id', id).select().single();
    if (updateError) throw updateError;
    setAnnouncements(prev => prev.map(item => item.id === id ? mapAnnouncementRow(data) : item));
  };

  const deleteAnnouncement = async (id: string) => {
    const success = await announcementService.announcementService.delete(id);
    if (success) setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const submitReport = async (report: any) => {
    if (!user) return;
    const created = await reportService.reportService.create({
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
    const success = await reportService.reportService.updateStatus(id, status);
    if (success) setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const submitDisputeCase = async (dispute: any) => {
    if (!user) return;
    const created = await disputeService.disputeService.create({
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
    const success = await disputeService.disputeService.updateStatus(id, status);
    if (success) setDisputeCases(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  const addAuditLog = (action: string, details: string, type: string) => {
    if (!user) return;
    void auditService.auditService.create({ action, details, type, user_id: user.id }).then((created: any) => {
      if (created) setAuditLogs(prev => [created, ...prev]);
    });
  };

  const sealDeal = (listingTitle: string, buyerName: string, price: number) => {
    void buyerName;
    void recentDealsService.recentDealsService.create({ item_title: listingTitle, price, location: user?.location || 'Ogbomoso', time: 'Just now' }).then((created: any) => {
      if (created) setRecentDeals(prev => [created, ...prev]);
    });
  };

  const recordIntrusion = (attemptedEmail: string, metadata: string) => {
    void intrusionService.intrusionService.create({ attempted_email: attemptedEmail, device_info: { metadata }, media_captured: false, media_status: 'N/A', status: 'flagged', user_agent: metadata }).then((created: any) => {
      if (created) setIntrusionLogs(prev => [created, ...prev]);
    });
  };

  const saveSearchAlert = async (alert: Omit<SearchAlert, 'id' | 'userId' | 'createdAt' | 'matchCount' | 'isActive'>) => {
    if (!user) return;
    const categoryId = alert.category === 'All'
      ? null
      : categories.find(category => category.name === alert.category)?.id || alert.category;
    const created = await searchAlertService.searchAlertService.create({
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
    const created = await reviewService.reviewService.create({
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
    const created = await buyerRequestService.buyerRequestService.create({
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

  const requestPayout = async (amount: number) => {
    if (!user || !wallet || amount <= 0 || wallet.balance < amount) {
      toast.error('Insufficient balance');
      return;
    }
    const { data: transaction, error: transactionError } = await supabase.from('transactions').insert({
      wallet_id: wallet.id,
      type: 'payout',
      amount: -amount,
      status: 'pending',
      description: 'Withdrawal to bank',
      related_user_id: user.id,
    }).select().single();
    if (transactionError) throw transactionError;

    const { data: updatedWallet, error: walletError } = await supabase.from('wallets').update({
      balance: wallet.balance - amount,
      pending_balance: wallet.pendingBalance + amount,
    }).eq('id', wallet.id).eq('user_id', user.id).select().single();
    if (walletError) throw walletError;

    setWallet(mapWalletRow(updatedWallet));
    setTransactions(prev => [mapTransactionRow(transaction), ...prev]);
    toast.success(`Payout of ₦${amount.toLocaleString()} requested`);
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

  const addUser = (newUser: UserProfile) => {
    setAllUsers(prev => [newUser, ...prev]);
  };

  const deleteUser = (id: string) => {
    void userService.userService.delete(id).then(success => {
      if (success) setAllUsers(prev => prev.filter(existingUser => existingUser.id !== id));
    });
  };

  const updateUser = async (id: string, updates: Partial<UserProfile>) => {
    const fieldMap: Record<string, string> = {
      fullName: 'full_name', phoneNumber: 'phone_number', avatarUrl: 'avatar_url', storeBannerUrl: 'cover_url',
      bio: 'bio', role: 'role', verified: 'verified', verificationType: 'verification_type', businessName: 'business_name',
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
    const updated = await userService.userService.update(id, databaseUpdates as any);
    if (!updated) return;
    setAllUsers(prev => prev.map(existingUser => existingUser.id === id ? updated : existingUser));
    if (user?.id === id) applyAuthenticatedUser(updated);
  };

  const bulkUpdateUsers = (ids: string[], updates: Partial<UserProfile>) => {
    void Promise.all(ids.map(id => updateUser(id, updates)));
  };

  const bulkDeleteUsers = (ids: string[]) => {
    void Promise.all(ids.map(id => userService.userService.delete(id))).then(() => {
      setAllUsers(prev => prev.filter(existingUser => !ids.includes(existingUser.id)));
    });
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
    const created = await safeSpotService.safeSpotService.create({
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
    void supabase.from('promotion_plans').update({ rate }).eq('months', months).then(({ data, error }) => {
      if (error) throw error;
      if (data) setPromotionPlans(prev => prev.map(plan => plan.months === months ? { ...plan, rate } : plan));
    });
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
    void Promise.all(Object.entries(updates)
      .filter(([, value]) => typeof value === 'boolean')
      .map(([key, value]) => systemConfigService.systemConfigService.updateConfig(key, value as boolean)));
  };

  const updateSiteSettings = (settings: Partial<typeof siteSettings>) => {
    setSiteSettings(prev => ({ ...prev, ...settings }));
    void supabase.from('site_settings').select('id').limit(1).maybeSingle().then(({ data, error }) => {
      if (error) throw error;
      const databaseSettings = {
        site_name: settings.siteName,
        site_description: settings.siteDescription,
        og_image: settings.ogImage,
        contact_email: settings.contactEmail,
        contact_phone: settings.contactPhone,
        updated_at: new Date().toISOString(),
      };
      const query = data?.id
        ? supabase.from('site_settings').update(databaseSettings).eq('id', data.id)
        : supabase.from('site_settings').insert(databaseSettings);
      return query;
    });
  };

  const loadDatabaseState = async (authUser: any | null) => {
    const [listingResult, categoryRows, subcategoryRows, announcementRows, safeSpotRows, promotionPlanRows, configRows, siteSettingsRow, reviewRows, buyerRequestRows, recentDealRows] = await Promise.all([
      supabase
        .from('ads')
        .select('*, profiles!ads_seller_id_fkey(*), ad_images(image_url, sort_order)')
        .order('created_at', { ascending: false }),
      categoryService.categoryService.getAll(),
      subcategoryService.subcategoryService.getAll(),
      announcementService.announcementService.getAll(),
      safeSpotService.safeSpotService.getAll(),
      promotionPlanService.promotionPlanService.getAll(),
      systemConfigService.systemConfigService.getAll(),
      siteSettingsService.siteSettingsService.get(),
      reviewService.reviewService.getAll(),
      buyerRequestService.buyerRequestService.getAll(),
      recentDealsService.recentDealsService.getAll(),
    ]);

    if (listingResult.error) throw listingResult.error;
    const mappedListings = (listingResult.data || []).map(mapListingToListing);
    setListings(mappedListings);

    const mappedCategories = (categoryRows || []).map(mapCategoryRow);
    setCategories(mappedCategories.length ? mappedCategories : MOCK_CATEGORIES);
    setSubcategories(subcategoryRows || []);
    setAnnouncements((announcementRows || []).map(mapAnnouncementRow));
    setSafeSpots((safeSpotRows || []).map(mapSafeSpotRow));
    setPromotionPlans((promotionPlanRows || []).map(mapPromotionPlanRow));
    setSystemConfig((configRows || []).reduce((config: Record<string, boolean | number>, row: any) => {
      config[row.key] = row.value;
      return config;
    }, {}));

    if (siteSettingsRow) {
      setSiteSettings({
        siteName: siteSettingsRow.site_name || MOCK_SITE_SETTINGS.siteName,
        siteDescription: siteSettingsRow.site_description || MOCK_SITE_SETTINGS.siteDescription,
        ogImage: siteSettingsRow.og_image || MOCK_SITE_SETTINGS.ogImage,
        contactEmail: siteSettingsRow.contact_email || MOCK_SITE_SETTINGS.contactEmail,
        contactPhone: siteSettingsRow.contact_phone || MOCK_SITE_SETTINGS.contactPhone,
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
      setWallet(null);
      setTransactions([]);
      return;
    }

    const [favoriteIds, notificationRows, searchAlertRows, walletResult, transactionResult] = await Promise.all([
      favoriteService.favoriteService.getByUserId(authUser.id),
      notificationService.notificationService.getAll(authUser.id),
      searchAlertService.searchAlertService.getAll(authUser.id),
      supabase.from('wallets').select('*').eq('user_id', authUser.id).maybeSingle(),
      supabase.from('transactions').select('*').eq('related_user_id', authUser.id).order('created_at', { ascending: false }),
    ]);

    setSavedListingIds(favoriteIds);
    setNotifications((notificationRows || []).map(mapNotificationRow));
    setSearchAlerts((searchAlertRows || []).map(mapSearchAlertRow));
    setWallet(walletResult.data ? mapWalletRow(walletResult.data) : null);
    setTransactions((transactionResult.data || []).map(mapTransactionRow));
    await refreshConversations(authUser.id);

    if (authUser.role === 'admin') {
      const [profiles, verificationRows, passwordRows, promotionRows, reportRows, disputeRows, auditRows, intrusionRows] = await Promise.all([
        userService.userService.getAll(),
        verificationService.verificationService.getAll(),
        passwordRequestService.passwordRequestService.getAll(),
        promotionService.promotionService.getAll(),
        reportService.reportService.getAll(),
        disputeService.disputeService.getAll(),
        auditService.auditService.getAll(),
        intrusionService.intrusionService.getAll(),
      ]);
      setAllUsers(profiles);
      setVerificationRequests(verificationRows || []);
      setPasswordRequests(passwordRows || []);
      setPromotionPaymentRequests(promotionRows || []);
      setReports(reportRows || []);
      setDisputeCases(disputeRows || []);
      setAuditLogs(auditRows || []);
      setIntrusionLogs(intrusionRows || []);
    }
  };

  useEffect(() => {
    let mounted = true;

    const hydrate = async (sessionOverride?: any) => {
      setLoading(true);
      setError(null);
      try {
        const session = sessionOverride ?? (await supabase.auth.getSession()).data.session;
        const profile = session?.user ? await loadProfileForAuthUser(session.user) : null;
        if (profile) applyAuthenticatedUser(profile);
        await loadDatabaseState(profile ? { ...session.user, role: profile.role } : null);
      } catch (loadError: any) {
        console.error('Supabase hydration failed:', loadError);
        if (mounted) setError(loadError?.message || 'Unable to load marketplace data');
      } finally {
        if (mounted) {
          setLastSyncTime(new Date().toLocaleTimeString());
          setLoading(false);
        }
      }
    };

    void hydrate();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void hydrate(session), 0);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const contextValue = useMemo(() => ({
    user,
    setUser,
    isAuthenticated: !!user,
    isAdmin,
    adminEmail,
    adminPassword,
    adminPin,
    updateAdminCredentials,
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
    sendPhoneOtp,
    verifyPhoneOtp,
    adminLogin,
    logout,
    listings,
    allUsers,
    updateUser,
    addUser,
    deleteUser,
    bulkUpdateUsers,
    bulkDeleteUsers,
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
    searchAlerts,
    saveSearchAlert,
    deleteSearchAlert,
    reviews,
    addReview,
    deleteReview,
    buyerRequests,
    createBuyerRequest,
    deleteBuyerRequest,
    wallet,
    transactions,
    requestPayout,
    loading,
    isSyncing,
    lastSyncTime,
    syncDatabase,
    error
  }), [
    user, isAdmin, adminEmail, adminPassword, adminPin, systemConfig, siteSettings, promotionPlans, safeSpots,
    language, categories, subcategories, analytics, marketStats, login, signup, adminLogin, logout,
    listings, allUsers, updateUser, addUser, deleteUser, savedListingIds, recentlyViewedIds, userInterests,
    addRecentlyViewed, toggleSaveListing, isSaved, filters, setFilters, resetFilters,
    activeCategory, setActiveCategory, compareListingIds, toggleCompareListing, isInCompare, clearCompare,
    createListing, updateListing, deleteListing, markAsSold, conversations, sendMessage,
    notifications, markNotificationRead, markAllNotificationsRead, clearNotification,
    addNotification, broadcastMassNotification, dispatchPromotionalEmailDigest,
    passwordRequests, submitPasswordRequest, processPasswordRequest, verificationRequests, submitVerificationRequest, processVerificationRequest,
    promotionPaymentRequests, submitPromotionPaymentRequest, processPromotionPaymentRequest, announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
    reports, submitReport, processReport, disputeCases, submitDisputeCase, processDisputeCase, auditLogs, addAuditLog,
    recentDeals, sealDeal, intrusionLogs, recordIntrusion, searchAlerts, saveSearchAlert, deleteSearchAlert,
    reviews, addReview, deleteReview, buyerRequests, createBuyerRequest, deleteBuyerRequest,
    wallet, transactions, requestPayout, loading, isSyncing, lastSyncTime, syncDatabase, error
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
