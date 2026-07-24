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
  recentDealsService
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
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({ maintenanceMode: false, autoApproveAds: true, requireIdForPosting: false, aiSpamFilter: true });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ logoUrl: '/logo.png', siteName: 'Sealify Nigeria', siteDescription: "Nigeria's Trusted Local Marketplace.", ogImage: '/og-image.png', contactEmail: 'support@sealify.ng', contactPhone: '+234 813 120 8468' });
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

  const addAuditLog = useCallback(async (action: string, details: string, type: AuditLog['type']) => {
    try {
      const newLog = await auditService.create({ action, details, type, created_at: new Date().toISOString() });
      setAuditLogs(prev => [newLog as any, ...prev]);
    } catch (err) {
      console.error('Audit log error:', err);
    }
  }, []);

  const marketStats: CategoryStats[] = useMemo(() => {
    const stats: CategoryStats[] = categories.map(cat => {
      const catAds = listings.filter(l => l.category === cat.name);
      const prices = catAds.map(l => l.price);
      return {
        category: cat.name as Category,
        avgPrice: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        totalAds: catAds.length,
        demandScore: Math.min(100, catAds.length * 12),
        trend: 'up'
      };
    });
    return stats;
  }, [listings, categories]);

  const sendMessage = async (listingId: string, receiverId: string, content: string) => {
    if (!user) return;
    try {
      await messageService.sendMessage({
        sender_id: user.id, receiver_id: receiverId,
        listing_id: listingId, content, conversation_id: null
      });
      toast.success('Message sent to seller!');
      addAuditLog('Message Sent', `New inquiry from ${user.fullName} for listing ${listingId}`, 'user');
    } catch (err) {
      toast.error('Failed to send message.');
    }
  };

  const addNotification = async (notif: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    if (!user) return;
    await notificationService.create({ ...notif, user_id: user.id } as any);
  };

  const submitDisputeCase = async (disp: any) => {
    await disputeService.create({ ...disp, status: 'pending', created_at: new Date().toISOString() });
    addAuditLog('Dispute Opened', `New case filed by ${disp.userEmail}`, 'dispute');
  };

  const submitReport = async (rep: any) => {
    await reportService.create({ ...rep, status: 'pending', created_at: new Date().toISOString() });
    addAuditLog('Ad Reported', `Report for listing ${rep.listingId}`, 'security');
  };

  const t = useCallback((key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  }, [language]);

  return (
    <SealifyContext.Provider value={{
      user, setUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      adminPin, updateAdminPin: setAdminPin, systemConfig, updateSystemConfig: (u) => setSystemConfig(p => ({...p, ...u})), siteSettings, updateSiteSettings: (s) => setSiteSettings(p => ({...p, ...s})), 
      exportDatabaseBackup: () => toast.success('Database export ready.'),
      language, setLanguage, t,
      categories, addCategory: (c) => setCategories(p => [...p, { ...c, id: 'cat_'+Date.now() }]), 
      deleteCategory: (id) => setCategories(p => p.filter(c => c.id !== id)), 
      updateCategory: (id, name) => setCategories(p => p.map(c => c.id === id ? { ...c, name } : c)),
      analytics: { visitors: 184, activeAds: listings.length, totalChats: 12, sessionsPerMinute: [10, 20, 15, 30, 25, 40, 18, 22, 35, 29] }, 
      marketStats, login: async () => {}, adminLogin: async () => true, logout: () => {},
      listings, allUsers, updateUser: async () => {}, deleteUser: async () => {},
      savedListingIds, recentlyViewedIds, addRecentlyViewed: (id) => setRecentlyViewedIds(p => [id, ...p.filter(i => i !== id)].slice(0, 8)), 
      toggleSaveListing: (id) => setSavedListingIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]), isSaved: (id) => savedListingIds.includes(id),
      filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
      activeCategory: filters.category, setActiveCategory: (cat) => setFilters(p => ({...p, category: cat})),
      compareListingIds, toggleCompareListing: (id) => setCompareListingIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p), 
      isInCompare: (id) => compareListingIds.includes(id), clearCompare: () => setCompareListingIds([]),
      createListing: async () => {}, updateListing: async () => {}, deleteListing: async () => {}, markAsSold: async () => {}, toggleFeaturedListing: async () => {}, promoteListing: async () => {},
      conversations, sendMessage,
      notifications, markNotificationRead: (id) => {}, 
      markAllNotificationsRead: () => {}, 
      clearNotification: (id) => {}, 
      addNotification,
      broadcastMassNotification: (title, message) => toast.success(`Broadcast "${title}" dispatched.`),
      passwordRequests, submitPasswordRequest: (req) => toast.success('Password reset request submitted.'), 
      processPasswordRequest: async () => {},
      verificationRequests, submitVerificationRequest: (req) => toast.success('Verification request submitted.'), 
      processVerificationRequest: async () => {},
      promotionPaymentRequests, submitPromotionPaymentRequest: (req) => toast.success('Payment proof submitted.'), 
      processPromotionPaymentRequest: async () => {},
      disputeCases, submitDisputeCase, 
      processDisputeCase: async () => {},
      announcements, addAnnouncement: (ann) => setAnnouncements(p => [{ ...ann, id: 'ann_'+Date.now(), createdAt: new Date().toISOString() }, ...p]), 
      toggleAnnouncement: (id) => setAnnouncements(p => p.map(a => a.id === id ? { ...a, active: !a.active } : a)), 
      deleteAnnouncement: (id) => setAnnouncements(p => p.filter(a => a.id !== id)),
      reports, submitReport, 
      processReport: async () => {},
      auditLogs, addAuditLog,
      recentDeals: [], sealDeal: (lId, bName, p) => toast.success('Deal sealed!'),
      intrusionLogs, recordIntrusion: (email, media) => toast.warning('Security alert logged.'),
      searchAlerts, saveSearchAlert: (alert) => toast.success('Alert saved.'), 
      deleteSearchAlert: (id) => toast.success('Alert removed.'),
      reviews, addReview: (rev) => setReviews(p => [{ ...rev, id: 'rev_'+Date.now(), createdAt: 'Just now' } as any, ...p]), 
      deleteReview: (id) => setReviews(p => p.filter(r => r.id !== id)),
      buyerRequests, createBuyerRequest: (req) => toast.success('Request posted.'), 
      deleteBuyerRequest: (id) => setBuyerRequests(p => p.filter(r => r.id !== id)),
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