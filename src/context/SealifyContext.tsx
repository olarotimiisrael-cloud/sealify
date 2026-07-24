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
  login: (email: string, role: 'buyer' | 'seller' | 'admin', isSignup?: boolean) => void;
  adminLogin: (email: string, pass: string, pin?: string) => Promise<boolean>;
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
  loading: boolean;
  error: string | null;
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
    siteName: 'Sealify Master ControlPanel',
    siteDescription: "Nigeria's Trusted Local Marketplace. Buy, sell, and connect locally in Ogbomosoland, Oyo State, and across Nigeria.",
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

  // Helper conversion functions (defined early to avoid hoisting issues)
  const convertDbListingToListing = (dbListing: any): Listing => {
    const seller = allUsers.find(u => u.id === dbListing.seller_id);
    return {
      id: dbListing.id,
      sellerId: dbListing.seller_id,
      sellerName: seller?.fullName || '',
      sellerPhone: seller?.phoneNumber || '',
      sellerAvatar: seller?.avatarUrl || '',
      sellerVerified: seller?.verified || false,
      sellerVerificationType: seller?.verificationType || 'individual',
      title: dbListing.title,
      description: dbListing.description,
      price: dbListing.price,
      originalPrice: dbListing.original_price,
      category: dbListing.category,
      condition: dbListing.condition,
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
  };

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

  const convertDbVerificationRequest = (db: any): VerificationRequest => ({
    id: db.id,
    userId: db.user_id,
    userName: db.user_name,
    userEmail: db.user_email,
    type: db.type,
    docType: db.doc_type,
    docNumber: db.doc_number,
    docUrl: db.doc_url,
    status: db.status,
    createdAt: db.created_at,
  });

  const convertDbPasswordRequest = (db: any): PasswordChangeRequest => ({
    id: db.id,
    userId: db.user_id,
    userEmail: db.user_email,
    userName: db.user_name,
    nin: db.nin,
    id_document_url: db.id_document_url,
    newPassword: db.new_password,
    reason: db.reason,
    status: db.status,
    createdAt: db.created_at,
  });

  const convertDbPromotionPayment = (db: any): PromotionPaymentRequest => ({
    id: db.id,
    userId: db.user_id,
    listingId: db.listing_id,
    amount: db.amount,
    paymentMethod: db.payment_method,
    paymentProofUrl: db.payment_proof_url,
    status: db.status,
    createdAt: db.created_at,
    planName: db.plan_name,
    durationMonths: db.duration_months,
  });

  const convertDbDisputeCase = (db: any): DisputeCase => ({
    id: db.id,
    userId: db.user_id,
    userEmail: db.user_email,
    receiptRef: db.receipt_ref,
    itemTitle: db.item_title,
    counterparty: db.counterparty,
    category: db.category,
    reason: db.reason,
    details: db.details,
    evidenceUrl: db.evidence_url,
    status: db.status,
    createdAt: db.created_at,
  });

  const convertDbReport = (db: any): AdReport => ({
    id: db.id,
    listingId: db.listing_id,
    listingTitle: db.listing_title,
    reporterName: db.reporter_name,
    reason: db.reason,
    details: db.details,
    status: db.status,
    createdAt: db.created_at,
  });

  const convertDbAuditLog = (db: any): AuditLog => ({
    id: db.id,
    action: db.action,
    details: db.details,
    type: db.type,
    createdAt: db.created_at,
  });

  const convertDbIntrusionLog = (db: any): SecurityIntrusionLog => ({
    id: db.id,
    timestamp: db.timestamp,
    attemptedEmail: db.attempted_email,
    deviceInfo: db.device_info,
    mediaCaptured: db.media_captured,
    mediaStatus: db.media_status,
    status: db.status,
  });

  const convertDbAnnouncement = (db: any): SystemAnnouncement => ({
    id: db.id,
    title: db.title,
    message: db.message,
    type: db.type,
    active: db.active,
    createdAt: db.created_at,
  });

  const convertDbReview = (db: any): Review => ({
    id: db.id,
    sellerId: db.seller_id,
    buyerId: db.buyer_id,
    buyerName: db.buyer_name,
    buyerAvatar: db.buyer_avatar,
    rating: db.rating,
    comment: db.comment,
    createdAt: db.created_at,
  });

  const convertDbBuyerRequest = (db: any): BuyerRequest => ({
    id: db.id,
    userId: db.user_id,
    userName: db.user_name,
    userAvatar: db.user_avatar,
    title: db.title,
    category: db.category,
    maxBudget: db.max_budget,
    location: db.location,
    description: db.description,
    createdAt: db.created_at,
    responsesCount: db.responses_count,
  });

  // Initialize data from Supabase
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [
          usersData,
          listingsData,
          categoriesData,
          passwordReqsData,
          verificationReqsData,
          promotionReqsData,
          disputeData,
          announcementData,
          recentDealsData,
          reportsData,
          auditData,
          intrusionData,
          searchAlertsData,
          reviewsData,
          buyerReqsData,
          systemConfigData,
          siteSettingsData
        ] = await Promise.all([
          userService.getAll(),
          listingService.getAll(),
          // Categories would come from a categories table or be derived
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
          ]),
          passwordRequestService.getAll(),
          verificationService.getAll(),
          promotionService.getAll(),
          disputeService.getAll(),
          announcementService.getAll(),
          recentDealsService.getAll(),
          reportService.getAll(),
          auditService.getAll(),
          intrusionService.getAll(),
          Promise.resolve([]), // search alerts - would need user context
          reviewService.getAll(),
          buyerRequestService.getAll(),
          systemConfigService.getAll(),
          siteSettingsService.get()
        ]);

        // Convert DB users to UserProfile format
        const convertedUsers: UserProfile[] = usersData.map(u => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          phoneNumber: u.phone_number || '',
          avatarUrl: u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          role: u.role,
          verified: u.verified,
          verificationType: u.verification_type,
          businessName: u.business_name || undefined,
          memberSince: u.member_since,
          location: u.location,
          password: u.password,
          status: u.status,
          restrictionReason: u.restriction_reason,
          appealStatus: u.appeal_status,
        }));

        // Convert DB listings to Listing format
        const convertedListings: Listing[] = listingsData.map(l => ({
          id: l.id,
          sellerId: l.seller_id,
          sellerName: '', // Will be populated from user data
          sellerPhone: '',
          sellerAvatar: '',
          sellerVerified: false,
          sellerVerificationType: 'individual',
          title: l.title,
          description: l.description,
          price: l.price,
          originalPrice: l.original_price || undefined,
          category: l.category as Category,
          condition: l.condition as any,
          location: l.location,
          status: l.status,
          images: l.images,
          videoUrl: l.video_url || undefined,
          createdAt: l.created_at,
          viewsCount: l.views_count,
          featured: l.featured,
          promotionDurationMonths: l.promotion_duration_months,
          promotionPlanName: l.promotion_plan_name || undefined,
          promotionStartDate: l.promotion_start_date || undefined,
          promotionEndDate: l.promotion_end_date || undefined,
          paymentStatus: l.payment_status,
          paymentProofUrl: l.payment_proof_url || undefined,
          amountPaid: l.amount_paid || undefined,
          specifications: l.specifications || undefined,
        }));

        // Populate seller info on listings
        const userMap = new Map(convertedUsers.map(u => [u.id, u]));
        const populatedListings = convertedListings.map(l => {
          const seller = userMap.get(l.sellerId);
          if (seller) {
            return {
              ...l,
              sellerName: seller.fullName,
              sellerPhone: seller.phoneNumber,
              sellerAvatar: seller.avatarUrl,
              sellerVerified: seller.verified,
              sellerVerificationType: seller.verificationType || 'individual',
            };
          }
          return l;
        });

        // Update category counts
        const categoriesWithCounts = categoriesData.map(cat => ({
          ...cat,
          count: populatedListings.filter(l => l.category === cat.name).length
        }));

        setAllUsers(convertedUsers);
        setListings(populatedListings);
        setCategories(categoriesWithCounts);
        setPasswordRequests(passwordReqsData.map(p => ({
          id: p.id,
          userId: p.user_id,
          userEmail: p.user_email,
          userName: p.user_name,
          nin: p.nin,
          id_document_url: p.id_document_url,
          newPassword: p.new_password,
          reason: p.reason,
          status: p.status,
          createdAt: p.created_at,
        })));
        setVerificationRequests(verificationReqsData.map(v => ({
          id: v.id,
          userId: v.user_id,
          userName: v.user_name,
          userEmail: v.user_email,
          type: v.type as any,
          docType: v.doc_type,
          docNumber: v.doc_number,
          docUrl: v.doc_url,
          status: v.status,
          createdAt: v.created_at,
        })));
        setPromotionPaymentRequests(promotionReqsData.map(p => ({
          id: p.id,
          userId: p.user_id,
          listingId: p.listing_id,
          amount: p.amount,
          paymentMethod: p.payment_method as any,
          paymentProofUrl: p.payment_proof_url || undefined,
          status: p.status,
          createdAt: p.created_at,
          planName: p.plan_name,
          durationMonths: p.duration_months,
        })));
        setDisputeCases(disputeData.map(d => ({
          id: d.id,
          userId: d.user_id,
          userEmail: d.user_email,
          receiptRef: d.receipt_ref,
          itemTitle: d.item_title,
          counterparty: d.counterparty,
          category: d.category,
          reason: d.reason,
          details: d.details,
          evidenceUrl: d.evidence_url || undefined,
          status: d.status,
          createdAt: d.created_at,
        })));
        setAnnouncements(announcementData.map(a => ({
          id: a.id,
          title: a.title,
          message: a.message,
          type: a.type,
          active: a.active,
          createdAt: a.created_at,
        })));
        setRecentDeals(recentDealsData.map(d => ({
          id: d.id,
          itemTitle: d.item_title,
          price: d.price,
          location: d.location,
          time: d.time,
        })));
        setReports(reportsData.map(r => ({
          id: r.id,
          listingId: r.listing_id,
          listingTitle: r.listing_title,
          reporterName: r.reporter_name || undefined,
          reason: r.reason,
          details: r.details || undefined,
          status: r.status,
          createdAt: r.created_at,
        })));
        setAuditLogs(auditData.map(a => ({
          id: a.id,
          action: a.action,
          details: a.details,
          type: a.type as any,
          createdAt: a.created_at,
        })));
        setIntrusionLogs(intrusionData.map(i => ({
          id: i.id,
          timestamp: i.timestamp,
          attemptedEmail: i.attempted_email,
          deviceInfo: i.device_info,
          mediaCaptured: i.media_captured,
          mediaStatus: i.media_status,
          status: i.status,
        })));
        setReviews(reviewsData.map(r => ({
          id: r.id,
          sellerId: r.seller_id,
          buyerId: r.buyer_id,
          buyerName: r.buyer_name,
          buyerAvatar: r.buyer_avatar,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.created_at,
        })));
        setBuyerRequests(buyerReqsData.map(b => ({
          id: b.id,
          userId: b.user_id,
          userName: b.user_name,
          userAvatar: b.user_avatar,
          title: b.title,
          category: b.category as Category,
          maxBudget: b.max_budget,
          location: b.location,
          description: b.description,
          createdAt: b.created_at,
          responsesCount: b.responses_count,
        })));

        // Load system config
        const configMap = new Map(systemConfigData.map(c => [c.key, c.value]));
        setSystemConfig({
          maintenanceMode: Boolean(configMap.get('maintenanceMode')) || false,
          autoApproveAds: configMap.get('autoApproveAds') !== false,
          requireIdForPosting: Boolean(configMap.get('requireIdForPosting')) || false,
          aiSpamFilter: configMap.get('aiSpamFilter') !== false,
        });

        // Load site settings
        if (siteSettingsData) {
          setSiteSettings({
            logoUrl: siteSettingsData.logo_url,
            siteName: siteSettingsData.site_name,
            siteDescription: siteSettingsData.site_description,
            ogImage: siteSettingsData.og_image,
            contactEmail: siteSettingsData.contact_email,
            contactPhone: siteSettingsData.contact_phone,
          });
        }

        // Set up real-time subscriptions
        setupRealtimeSubscriptions();

        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to load data from server. Using offline mode.');
        // Fallback to mock data
        setAllUsers(ALL_MOCK_USERS);
        setListings(MOCK_LISTINGS);
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const setupRealtimeSubscriptions = () => {
    // Subscribe to listings changes
    const listingsChannel = listingService.subscribeToChanges((payload) => {
      console.log('Listing change:', payload);
      if (payload.eventType === 'INSERT') {
        // Convert and add new listing
        const newListing = convertDbListingToListing(payload.new);
        setListings(prev => [newListing, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        const updatedListing = convertDbListingToListing(payload.new);
        setListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
      } else if (payload.eventType === 'DELETE') {
        setListings(prev => prev.filter(l => l.id !== payload.old.id));
      }
    });

    // Subscribe to users changes
    const usersChannel = userService.subscribeToChanges((payload) => {
      console.log('User change:', payload);
      if (payload.eventType === 'INSERT') {
        const newUser = convertDbUserToUserProfile(payload.new);
        setAllUsers(prev => [newUser, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        const updatedUser = convertDbUserToUserProfile(payload.new);
        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (user?.id === updatedUser.id) {
          setUser(updatedUser);
        }
      } else if (payload.eventType === 'DELETE') {
        setAllUsers(prev => prev.filter(u => u.id !== payload.old.id));
      }
    });

    // Subscribe to verification requests
    const verificationChannel = verificationService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setVerificationRequests(prev => [convertDbVerificationRequest(payload.new), ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setVerificationRequests(prev => prev.map(v => v.id === payload.new.id ? convertDbVerificationRequest(payload.new) : v));
      }
    });

    // Subscribe to password requests
    const passwordChannel = passwordRequestService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setPasswordRequests(prev => [convertDbPasswordRequest(payload.new), ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setPasswordRequests(prev => prev.map(p => p.id === payload.new.id ? convertDbPasswordRequest(payload.new) : p));
      }
    });

    // Subscribe to promotion payments
    const promotionChannel = promotionService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setPromotionPaymentRequests(prev => [convertDbPromotionPayment(payload.new), ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setPromotionPaymentRequests(prev => prev.map(p => p.id === payload.new.id ? convertDbPromotionPayment(payload.new) : p));
      }
    });

    // Subscribe to disputes
    const disputeChannel = disputeService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setDisputeCases(prev => [convertDbDisputeCase(payload.new), ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setDisputeCases(prev => prev.map(d => d.id === payload.new.id ? convertDbDisputeCase(payload.new) : d));
      }
    });

    // Subscribe to reports
    const reportChannel = reportService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setReports(prev => [convertDbReport(payload.new), ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setReports(prev => prev.map(r => r.id === payload.new.id ? convertDbReport(payload.new) : r));
      }
    });

    // Subscribe to audit logs
    const auditChannel = auditService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setAuditLogs(prev => [convertDbAuditLog(payload.new), ...prev]);
      }
    });

    // Subscribe to intrusion logs
    const intrusionChannel = intrusionService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setIntrusionLogs(prev => [convertDbIntrusionLog(payload.new), ...prev]);
      }
    });

    // Subscribe to announcements
    const announcementChannel = announcementService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setAnnouncements(prev => [convertDbAnnouncement(payload.new), ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setAnnouncements(prev => prev.map(a => a.id === payload.new.id ? convertDbAnnouncement(payload.new) : a));
      } else if (payload.eventType === 'DELETE') {
        setAnnouncements(prev => prev.filter(a => a.id !== payload.old.id));
      }
    });

    // Subscribe to reviews
    const reviewChannel = reviewService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setReviews(prev => [convertDbReview(payload.new), ...prev]);
      } else if (payload.eventType === 'DELETE') {
        setReviews(prev => prev.filter(r => r.id !== payload.old.id));
      }
    });

    // Subscribe to buyer requests
    const buyerRequestChannel = buyerRequestService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setBuyerRequests(prev => [convertDbBuyerRequest(payload.new), ...prev]);
      } else if (payload.eventType === 'DELETE') {
        setBuyerRequests(prev => prev.filter(r => r.id !== payload.old.id));
      }
    });

    // Subscribe to system config
    const systemConfigChannel = systemConfigService.subscribeToChanges((payload) => {
      if (payload.eventType === 'UPDATE') {
        setSystemConfig(prev => ({
          ...prev,
          [payload.new.key]: payload.new.value
        }));
      }
    });

    // Cleanup function
    return () => {
      supabase.removeChannel(listingsChannel);
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(verificationChannel);
      supabase.removeChannel(passwordChannel);
      supabase.removeChannel(promotionChannel);
      supabase.removeChannel(disputeChannel);
      supabase.removeChannel(reportChannel);
      supabase.removeChannel(auditChannel);
      supabase.removeChannel(intrusionChannel);
      supabase.removeChannel(announcementChannel);
      supabase.removeChannel(reviewChannel);
      supabase.removeChannel(buyerRequestChannel);
      supabase.removeChannel(systemConfigChannel);
    };
  };

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
    // Also save to Supabase
    reviewService.create({
      seller_id: rev.sellerId,
      buyer_id: rev.buyerId,
      buyer_name: rev.buyerName,
      buyer_avatar: rev.buyerAvatar,
      rating: rev.rating,
      comment: rev.comment,
      created_at: new Date().toISOString(),
    }).catch(console.error);
  }, []);

  const deleteReview = useCallback((id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    reviewService.delete(id).catch(console.error);
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
    // Also save to Supabase
    buyerRequestService.create({
      user_id: req.userId,
      user_name: req.userName,
      user_avatar: req.userAvatar,
      title: req.title,
      category: req.category,
      max_budget: req.maxBudget,
      location: req.location,
      description: req.description,
      created_at: new Date().toISOString(),
    }).catch(console.error);
  }, []);

  const deleteBuyerRequest = useCallback((id: string) => {
    setBuyerRequests(prev => prev.filter(r => r.id !== id));
    toast.success('Request deleted.');
    buyerRequestService.delete(id).catch(console.error);
  }, []);

  const updateAdminPin = useCallback((newPin: string) => {
    setAdminPin(newPin);
    localStorage.setItem('sealify_admin_pin', newPin);
    addAuditLog('PIN Update', 'Master Security Access PIN modified by Superuser', 'security');
  }, []);

  const updateSystemConfig = useCallback((updated: Partial<SystemConfig>) => {
    setSystemConfig((prev) => ({ ...prev, ...updated }));
    toast.success('System Configuration updated!');
    // Save to Supabase
    Object.entries(updated).forEach(([key, value]) => {
      systemConfigService.update(key, value).catch(console.error);
    });
  }, []);

  const updateSiteSettings = useCallback((updated: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...updated }));
    toast.success('Site settings updated!');
    siteSettingsService.update(updated).catch(console.error);
  }, []);

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
    intrusionService.create({
      timestamp: new Date().toISOString(),
      attempted_email: email,
      device_info: intrusion.deviceInfo,
      media_captured: intrusion.mediaCaptured,
      media_status: mediaStatus,
      status: 'flagged',
    }).catch(console.error);
  }, [addAuditLog]);

  const broadcastMassNotification = useCallback((title: string, message: string, targetRole: 'all' | 'seller' | 'buyer') => {
    addNotification({ type: 'system', title: `📢 ${title}`, description: message });
    toast.success(`Broadcast sent!`);
    addAuditLog('Mass Broadcast', `Notification "${title}" sent to ${targetRole}`, 'broadcast');
    // Save announcement to Supabase
    announcementService.create({
      title,
      message,
      type: 'info',
      active: true,
      created_at: new Date().toISOString(),
    }).catch(console.error);
  }, [addNotification, addAuditLog]);

  const t = useCallback((key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  }, [language]);

  const login = async (email: string, role: 'buyer' | 'seller' | 'admin', isSignup?: boolean) => {
    try {
      let existingUser = await userService.getByEmail(email);
      
      if (existingUser) {
        const userProfile = convertDbUserToUserProfile(existingUser);
        setUser(userProfile);
        localStorage.setItem('sealify_user', JSON.stringify(userProfile));
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
        const userProfile = convertDbUserToUserProfile(newUser);
        setAllUsers(prev => [...prev, userProfile]);
        setUser(userProfile);
        localStorage.setItem('sealify_user', JSON.stringify(userProfile));
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Failed to login. Please try again.');
    }
  };

  const adminLogin = async (email: string, pass: string, pin?: string): Promise<boolean> => {
    try {
      if (email === DEFAULT_ADMIN.email && pass === DEFAULT_ADMIN.password && (!pin || pin === adminPin)) {
        const adminUser = await userService.getByEmail(DEFAULT_ADMIN.email) || DEFAULT_ADMIN;
        const userProfile = 'id' in adminUser ? convertDbUserToUserProfile(adminUser) : adminUser;
        setUser(userProfile);
        localStorage.setItem('sealify_user', JSON.stringify(userProfile));
        addAuditLog('Admin Login', `Root session initialized for ${email}`, 'security');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Admin login error:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sealify_user');
  };

  const updateUser = async (id: string, updatedData: Partial<UserProfile>) => {
    try {
      // Convert to DB format
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
      if (updatedData.storeBannerUrl) dbUpdates.store_banner_url = updatedData.storeBannerUrl;
      if (updatedData.status) dbUpdates.status = updatedData.status;
      if (updatedData.restrictionReason) dbUpdates.restriction_reason = updatedData.restrictionReason;
      if (updatedData.appealStatus) dbUpdates.appeal_status = updatedData.appealStatus;
      if (updatedData.password) dbUpdates.password = updatedData.password;

      await userService.update(id, dbUpdates);
      
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
      if (user?.id === id) setUser(prev => prev ? { ...prev, ...updatedData } : null);
      addAuditLog('User Update', `Modified record for UID: ${id}`, 'user');
    } catch (err) {
      console.error('Update user error:', err);
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      setAllUsers(prev => prev.filter(u => u.id !== id));
      addAuditLog('User Deleted', `User ${id} deleted by admin`, 'user');
    } catch (err) {
      console.error('Delete user error:', err);
      toast.error('Failed to delete user');
    }
  };

  const createListing = async (data: any) => {
    if (!user) return;
    const isUserAdmin = user.role === 'admin';

    try {
      const newListing = await listingService.create({
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
        promotion_plan_name: data.promotionPlanName || null,
        promotion_duration_months: data.promotionDurationMonths || 0,
        promotion_start_date: data.promotionStartDate || null,
        promotion_end_date: data.promotionEndDate || null,
        payment_status: 'pending',
        payment_proof_url: data.paymentProofUrl || null,
        amount_paid: data.amountPaid || null,
        specifications: data.specifications || null,
      });

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

      setListings(prev => [convertDbListingToListing(newListing), ...prev]);
      addAuditLog('Ad Posted', `${isUserAdmin ? 'ADMIN OFFICIAL POST' : 'User ' + user.fullName} created "${data.title}"`, 'ad');
    } catch (err) {
      console.error('Create listing error:', err);
      toast.error('Failed to create listing');
    }
  };

  const updateListing = useCallback(async (id: string, data: Partial<Listing>) => {
    try {
      const listing = listings.find(l => l.id === id);
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

      const dbUpdates: any = {};
      if (data.title) dbUpdates.title = data.title;
      if (data.description) dbUpdates.description = data.description;
      if (data.price) dbUpdates.price = data.price;
      if (data.originalPrice) dbUpdates.original_price = data.originalPrice;
      if (data.category) dbUpdates.category = data.category;
      if (data.condition) dbUpdates.condition = data.condition;
      if (data.location) dbUpdates.location = data.location;
      if (data.status) dbUpdates.status = data.status;
      if (data.images) dbUpdates.images = data.images;
      if (data.videoUrl) dbUpdates.video_url = data.videoUrl;
      if (data.featured !== undefined) dbUpdates.featured = data.featured;
      if (data.promotionPlanName) dbUpdates.promotion_plan_name = data.promotionPlanName;
      if (data.promotionDurationMonths) dbUpdates.promotion_duration_months = data.promotionDurationMonths;
      if (data.promotionStartDate) dbUpdates.promotion_start_date = data.promotionStartDate;
      if (data.promotionEndDate) dbUpdates.promotion_end_date = data.promotionEndDate;
      if (data.paymentStatus) dbUpdates.payment_status = data.paymentStatus;
      if (data.paymentProofUrl) dbUpdates.payment_proof_url = data.paymentProofUrl;
      if (data.amountPaid) dbUpdates.amount_paid = data.amountPaid;
      if (data.specifications) dbUpdates.specifications = data.specifications;

      await listingService.update(id, dbUpdates);
      setListings(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    } catch (err) {
      console.error('Update listing error:', err);
      toast.error('Failed to update listing');
    }
  }, [listings, addNotification]);

  const toggleFeaturedListing = useCallback(async (id: string) => {
    try {
      const listing = listings.find(l => l.id === id);
      if (!listing) return;

      await listingService.update(id, { featured: !listing.featured });
      setListings(prev => {
        const updated = prev.map(l => l.id === id ? { ...l, featured: !l.featured } : l);
        return updated.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      });
      toast.success('Ad featured status updated!');
      addAuditLog('Admin Override', `Toggled Top Ad featured status for ${id}`, 'ad');
    } catch (err) {
      console.error('Toggle featured error:', err);
      toast.error('Failed to update featured status');
    }
  }, [listings, addAuditLog]);

  const deleteListing = async (id: string) => {
    try {
      await listingService.delete(id);
      setListings(prev => prev.filter(l => l.id !== id));
      addAuditLog('Ad Deleted', `Listing ID ${id} removed from global inventory`, 'ad');
    } catch (err) {
      console.error('Delete listing error:', err);
      toast.error('Failed to delete listing');
    }
  };

  const markAsSold = async (id: string) => {
    try {
      await listingService.update(id, { status: 'sold' });
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
    } catch (err) {
      console.error('Mark sold error:', err);
      toast.error('Failed to mark as sold');
    }
  };

  const promoteListing = useCallback(async (id: string, months: number, plan: string) => {
    try {
      const listing = listings.find(l => l.id === id);
      if (!listing) return;

      const endDate = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
      
      await listingService.update(id, { 
        featured: true, 
        promotionPlanName: plan, 
        promotionDurationMonths: months,
        promotionStartDate: new Date().toISOString(),
        promotionEndDate: endDate
      });

      setListings(prev => {
        const updated = prev.map(l => l.id === id ? { 
          ...l, 
          featured: true, 
          promotionPlanName: plan, 
          promotionDurationMonths: months,
          promotionStartDate: new Date().toISOString(),
          promotionEndDate: endDate
        } : l);
        return updated.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      });
    } catch (err) {
      console.error('Promote listing error:', err);
      toast.error('Failed to promote listing');
    }
  }, [listings]);

  const processPromotionPaymentRequest = useCallback(async (id: string, status: 'approved' | 'rejected') => {
    try {
      const req = promotionPaymentRequests.find(r => r.id === id);
      if (status === 'approved' && req) {
        await promoteListing(req.listingId, req.durationMonths, req.planName);

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

      await promotionService.updateStatus(id, status);
      setPromotionPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      console.error('Process promotion error:', err);
      toast.error('Failed to process promotion request');
    }
  }, [promotionPaymentRequests, promoteListing, listings, addNotification, addAuditLog, allUsers.length]);

  const sealDeal = useCallback(async (listingId: string, buyerName: string, price: number) => {
    try {
      const listing = listings.find(l => l.id === listingId);
      if (!listing) return;

      await markAsSold(listingId);
      
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
      
      // Save to Supabase
      recentDealsService.create({
        item_title: listing.title,
        price,
        location: listing.location.split(',')[0],
        time: 'Just now',
      }).catch(console.error);
    } catch (err) {
      console.error('Seal deal error:', err);
      toast.error('Failed to seal deal');
    }
  }, [listings, markAsSold, addAuditLog]);

  const sendMessage = async (listingId: string, receiverId: string, content: string) => {
    if (!user) return;
    try {
      const newMsg = await messageService.sendMessage({
        sender_id: user.id,
        receiver_id: receiverId,
        listing_id: listingId,
        content,
        conversation_id: '', // Would need to find or create conversation
      });
      
      // Update local conversations state
      setConversations(prev => {
        const idx = prev.findIndex(c => c.listingId === listingId && (c.otherUser.id === receiverId || c.otherUser.id === user.id));
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { 
            ...updated[idx], 
            lastMessage: content, 
            lastMessageTime: 'Just now', 
            messages: [...updated[idx].messages, { 
              id: newMsg.id, 
              senderId: user.id, 
              receiverId, 
              listingId, 
              content, 
              createdAt: 'Just now',
              isRead: false
            }] 
          };
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
            messages: [{ 
              id: newMsg.id, 
              senderId: user.id, 
              receiverId, 
              listingId, 
              content, 
              createdAt: 'Just now',
              isRead: false
            }],
          };
          return [newConv, ...prev];
        }
      });
    } catch (err) {
      console.error('Send message error:', err);
      toast.error('Failed to send message');
    }
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

  const submitReport = async (rep: any) => {
    try {
      const newReport = await reportService.create({
        listing_id: rep.listingId,
        listing_title: rep.listingTitle,
        reporter_name: rep.reporterName,
        reason: rep.reason,
        details: rep.details,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      setReports(prev => [convertDbReport(newReport), ...prev]);
    } catch (err) {
      console.error('Submit report error:', err);
      toast.error('Failed to submit report');
    }
  };

  const processReport = async (id: string, action: 'dismiss' | 'resolve_delete_ad') => {
    try {
      await reportService.updateStatus(id, action === 'resolve_delete_ad' ? 'resolved' : 'dismissed');
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: action === 'resolve_delete_ad' ? 'resolved' : 'dismissed' } : r));
    } catch (err) {
      console.error('Process report error:', err);
      toast.error('Failed to process report');
    }
  };

  const submitDisputeCase = async (disp: any) => {
    try {
      const newCase = await disputeService.create({
        user_id: disp.userId,
        user_email: disp.userEmail,
        receipt_ref: disp.receiptRef,
        item_title: disp.itemTitle,
        counterparty: disp.counterparty,
        category: disp.category,
        reason: disp.reason,
        details: disp.details,
        evidence_url: disp.evidenceUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      setDisputeCases(prev => [convertDbDisputeCase(newCase), ...prev]);
      addAuditLog('Dispute Filed', `New dispute claim #${newCase.id}`, 'dispute');
    } catch (err) {
      console.error('Submit dispute error:', err);
      toast.error('Failed to submit dispute');
    }
  };

  const processDisputeCase = async (id: string, status: 'pending' | 'in_review' | 'resolved') => {
    try {
      await disputeService.updateStatus(id, status);
      setDisputeCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast.success(`Dispute updated to ${status}`);
      addAuditLog('Dispute Updated', `Status of #${id} set to ${status}`, 'dispute');
    } catch (err) {
      console.error('Process dispute error:', err);
      toast.error('Failed to process dispute');
    }
  };

  const submitPasswordRequest = async (req: any) => {
    try {
      const newReq = await passwordRequestService.create({
        user_id: req.userId,
        user_email: req.userEmail,
        user_name: req.userName,
        nin: req.nin,
        id_document_url: req.id_document_url,
        new_password: req.newPassword,
        reason: req.reason,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      setPasswordRequests(prev => [convertDbPasswordRequest(newReq), ...prev]);
    } catch (err) {
      console.error('Submit password request error:', err);
      toast.error('Failed to submit password request');
    }
  };

  const processPasswordRequest = async (id: string, status: 'approved' | 'declined') => {
    try {
      const req = passwordRequests.find(r => r.id === id);
      if (status === 'approved' && req) {
        await updateUser(req.userId, { password: req.newPassword });
      }
      await passwordRequestService.updateStatus(id, status);
      setPasswordRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Password request #${id} ${status}`);
      addAuditLog('Password Request Processed', `Status for #${id} set to ${status}`, 'verification');
    } catch (err) {
      console.error('Process password request error:', err);
      toast.error('Failed to process password request');
    }
  };

  const submitVerificationRequest = async (req: any) => {
    try {
      const newReq = await verificationService.create({
        user_id: req.userId,
        user_name: req.userName,
        user_email: req.userEmail,
        type: req.type,
        doc_type: req.docType,
        doc_number: req.docNumber,
        doc_url: req.docUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      setVerificationRequests(prev => [convertDbVerificationRequest(newReq), ...prev]);
    } catch (err) {
      console.error('Submit verification error:', err);
      toast.error('Failed to submit verification request');
    }
  };

  const processVerificationRequest = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const req = verificationRequests.find(r => r.id === id);
      if (status === 'approved' && req) {
        await updateUser(req.userId, { verified: true, verificationType: req.type });
      }
      await verificationService.updateStatus(id, status);
      setVerificationRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Verification #${id} ${status}`);
      addAuditLog('Verification Request Processed', `Status for #${id} set to ${status}`, 'verification');
    } catch (err) {
      console.error('Process verification error:', err);
      toast.error('Failed to process verification request');
    }
  };

  const submitPromotionPaymentRequest = async (req: any) => {
    try {
      const newReq = await promotionService.create({
        user_id: req.userId,
        listing_id: req.listingId,
        amount: req.amount,
        payment_method: req.paymentMethod,
        payment_proof_url: req.paymentProofUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
        plan_name: req.planName,
        duration_months: req.durationMonths,
      });
      setPromotionPaymentRequests(prev => [convertDbPromotionPayment(newReq), ...prev]);
    } catch (err) {
      console.error('Submit promotion payment error:', err);
      toast.error('Failed to submit promotion payment');
    }
  };

  const addAnnouncement = async (ann: any) => {
    try {
      const newAnn = await announcementService.create({
        title: ann.title,
        message: ann.message,
        type: ann.type,
        active: ann.active,
        created_at: new Date().toISOString(),
      });
      setAnnouncements(prev => [convertDbAnnouncement(newAnn), ...prev]);
    } catch (err) {
      console.error('Add announcement error:', err);
      toast.error('Failed to add announcement');
    }
  };

  const toggleAnnouncement = async (id: string) => {
    try {
      const ann = announcements.find(a => a.id === id);
      if (!ann) return;
      await announcementService.update(id, { active: !ann.active });
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
    } catch (err) {
      console.error('Toggle announcement error:', err);
      toast.error('Failed to toggle announcement');
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await announcementService.delete(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Delete announcement error:', err);
      toast.error('Failed to delete announcement');
    }
  };

  const addAuditLog = async (action: string, details: string, type: AuditLog['type']) => {
    try {
      const log = await auditService.create({
        action,
        details,
        type,
        created_at: new Date().toISOString(),
      });
      setAuditLogs(prev => [convertDbAuditLog(log), ...prev]);
    } catch (err) {
      console.error('Add audit log error:', err);
    }
  };

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

  const analytics: AnalyticsData = useMemo(() => ({
    visitors: 184,
    activeAds: listings.filter(l => l.status === 'active').length,
    totalChats: conversations.length,
    sessionsPerMinute: [15, 22, 18, 28, 24, 35, 26, 30, 32, 40],
  }), [listings, conversations]);

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
      buyerRequests, createBuyerRequest, deleteBuyerRequest,
      loading,
      error
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