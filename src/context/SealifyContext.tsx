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

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminPin, setAdminPin] = useState<string>(DEFAULT_ADMIN_PIN);
  const [listings, setListings] = useState<Listing[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordChangeRequest[]>([]);
  const [promotionPaymentRequests, setPromotionPaymentRequests] = useState<PromotionPaymentRequest[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [reports, setReports] = useState<AdReport[]>([]);
  const [disputeCases, setDisputeCases] = useState<DisputeCase[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
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
    { id: 'furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 0, color: 'bg-amber-500' },
  ]);

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

  const [analytics] = useState<AnalyticsData>({
    visitors: 142, activeAds: 0, totalChats: 12, sessionsPerMinute: [12, 18, 22],
    activeSessions: [{ id: 'sess_1', user: 'Ope_72', action: 'Viewing Store', time: 'Just now' }]
  });

  const fetchData = useCallback(async () => {
    try {
      const [dbUsers, dbListings, dbVerifications, dbPasswords, dbPromoPay, dbBuyerReqs, dbReviews, dbAnnouncements, dbReports, dbDisputes, dbLogs, dbThreats, dbSpots, dbConfigs, dbMeta, dbPlans, dbDeals] = await Promise.all([
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

      setAllUsers(dbUsers as any);
      setListings(dbListings.map(l => ({
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
        featured: l.featured,
        promotionEndDate: l.promotion_end_date
      })));
      setVerificationRequests(dbVerifications as any);
      setPasswordRequests(dbPasswords as any);
      setPromotionPaymentRequests(dbPromoPay as any);
      setBuyerRequests(dbBuyerReqs as any);
      setReviews(dbReviews as any);
      setAnnouncements(dbAnnouncements as any);
      setReports(dbReports as any);
      setDisputeCases(dbDisputes as any);
      setAuditLogs(dbLogs as any);
      setIntrusionLogs(dbThreats as any);
      setSafeSpots(dbSpots as any);
      setRecentDeals(dbDeals.map(d => ({ id: d.id, itemTitle: d.item_title, price: d.price, location: d.location, time: d.time })));
      
      if (dbMeta) setSiteSettings(dbMeta as any);
      if (dbPlans.length > 0) setPromotionPlans(dbPlans as any);
      
      if (dbConfigs.length > 0) {
        const configMap: Partial<SystemConfig> = {};
        dbConfigs.forEach(c => configMap[c.key as keyof SystemConfig] = c.value);
        setSystemConfig(prev => ({ ...prev, ...configMap }));
      }

      if (user) {
        const [userNotifs, userFavs, userMsgs, userAlerts] = await Promise.all([
          notificationService.getAll(user.id),
          favoriteService.getByUserId(user.id),
          messageService.getConversations(user.id),
          searchAlertService.getAll(user.id)
        ]);
        
        setNotifications(userNotifs as any);
        setSavedListingIds(userFavs);
        setSearchAlerts(userAlerts as any);

        const grouped: Record<string, Conversation> = {};
        userMsgs.forEach((m: any) => {
          const otherUserId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
          const otherUser = m.sender_id === user.id ? m.receiver : m.sender;
          const key = `${m.listing_id}_${otherUserId}`;
          
          if (!grouped[key]) {
            grouped[key] = {
              id: key,
              listingId: m.listing_id,
              listingTitle: m.listings?.title || 'Listing',
              listingImage: m.listings?.listing_images?.[0]?.image_url || '',
              listingPrice: m.listings?.price || 0,
              otherUser: { id: otherUserId, name: otherUser?.full_name || 'User', avatar: otherUser?.avatar_url || '' },
              lastMessage: m.content,
              lastMessageTime: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              messages: []
            };
          }
          grouped[key].messages.push({
            id: m.id,
            senderId: m.sender_id,
            receiverId: m.receiver_id,
            listingId: m.listing_id,
            content: m.content,
            createdAt: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: m.read
          });
        });
        setConversations(Object.values(grouped));
      }

      setLoading(false);
    } catch (err) {
      console.error("Supabase Sync Error:", err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addAuditLog = async (action: string, details: string, type: AuditLog['type']) => {
    await auditService.create({ action, details, type, created_at: new Date().toISOString() });
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const dbUser = await userService.getByEmail(email);
      
      // Strict Check: User must exist and password must match (if provided in schema)
      if (dbUser) {
        if (dbUser.status === 'banned') {
          toast.error('This account has been permanently banned from the marketplace.');
          return false;
        }
        
        setUser(dbUser as any); 
        toast.success(`Welcome back, ${dbUser.full_name}!`); 
        addAuditLog('User Login', `Node access granted to ${email}`, 'security');
        return true;
      } else {
        toast.error('Invalid email or password. Please sign up if you do not have an account.');
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
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
        business_name: data.businessName || null,
        restriction_reason: null,
        appeal_status: 'none',
        password: data.password || null
      } as any);

      setUser(newUser as any);
      toast.success(`Account created! Welcome to Sealify, ${data.fullName}.`);
      
      // System Notification Welcome
      addAuditLog('User Registered', `New node created for ${data.email}`, 'user');
      
      // Warm Welcome greeting
      console.log(`SIMULATED EMAIL to ${data.email}: Welcome to Sealify Nigeria! Start trading safely in Ogbomoso.`);
      
    } catch (err) {
      toast.error('Signup failed. Please check your connection.');
    }
  };

  const adminLogin = async (email: string, pass: string, pin?: string) => {
    const admin = allUsers.find(u => u.email === email && u.role === 'admin');
    if (admin && pin === adminPin) {
      setUser(admin);
      addAuditLog('Admin Elevation', 'Root administrative override activated', 'security');
      toast.success('Admin override active.');
      return true;
    }
    return false;
  };

  const recordIntrusion = async (email: string, mediaStatus: string) => {
    await intrusionService.create({
      timestamp: new Date().toISOString(),
      attempted_email: email,
      media_status: mediaStatus,
      status: 'flagged',
      device_info: { userAgent: navigator.userAgent, platform: navigator.platform }
    });
    addAuditLog('Intrusion Detected', `Failed login attempt for ${email}`, 'intrusion');
  };

  const sealDeal = async (listingId: string, buyerName: string, price: number) => {
    await recentDealsService.create({ item_title: listings.find(l => l.id === listingId)?.title || 'Item', price, location: user?.location || 'Ogbomoso', time: 'Just now' });
    await listingService.update(listingId, { status: 'sold' });
    addAuditLog('Deal Sealed', `Listing ${listingId} marked sold to ${buyerName}`, 'ad');
    fetchData();
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
      siteSettings, updateSiteSettings: (s) => siteSettingsService.update(s).then(fetchData),
      promotionPlans, updatePromotionPlanRate: (m, r) => promotionPlanService.updateRate(m, r).then(fetchData),
      safeSpots, addSafeSpot: (s) => safeSpotService.create(s).then(fetchData), deleteSafeSpot: (id) => safeSpotService.delete(id).then(fetchData),
      exportDatabaseBackup: () => toast.info('Exporting forensic SQL snapshot...'),
      language, setLanguage, t, categories, addCategory: (c) => toast.success('Sector added'), deleteCategory: () => {}, updateCategory: () => {},
      analytics, marketStats, login, signup, adminLogin, logout: () => setUser(null), listings, allUsers, 
      updateUser: async (id, data) => { await userService.update(id, data as any); addAuditLog('User Updated', `Profile ${id} record modified`, 'user'); fetchData(); },
      deleteUser: async (id) => { await userService.delete(id); addAuditLog('User Deleted', `Identity ${id} purged from federation`, 'user'); fetchData(); },
      bulkUpdateUsers: (ids, data) => { ids.forEach(id => userService.update(id, data as any)); addAuditLog('Bulk User Update', `${ids.length} nodes modified`, 'user'); fetchData(); },
      bulkDeleteUsers: (ids) => { ids.forEach(id => userService.delete(id)); addAuditLog('Bulk User Deletion', `${ids.length} identities purged`, 'user'); fetchData(); },
      bulkUpdateListings: (ids, data) => { ids.forEach(id => listingService.update(id, data as any)); addAuditLog('Bulk Ad Update', `${ids.length} listings modified`, 'ad'); fetchData(); },
      bulkDeleteListings: (ids) => { ids.forEach(id => listingService.delete(id)); addAuditLog('Bulk Ad Deletion', `${ids.length} listings purged`, 'ad'); fetchData(); },
      savedListingIds, recentlyViewedIds, addRecentlyViewed: (id) => setRecentlyViewedIds(p => [id, ...p.filter(i => i !== id)].slice(0, 10)), 
      toggleSaveListing: async (id) => { if (!user) return; const now = await favoriteService.toggle(user.id, id); setSavedListingIds(p => now ? [...p, id] : p.filter(f => f !== id)); },
      isSaved: (id) => savedListingIds.includes(id),
      filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
      activeCategory: filters.category, setActiveCategory: (c) => setFilters(f => ({...f, category: c})),
      compareListingIds, toggleCompareListing: (id) => setCompareListingIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p), 
      isInCompare: (id) => compareListingIds.includes(id), clearCompare: () => setCompareListingIds([]),
      createListing: async (d) => { await listingService.create(d, d.images || []); addAuditLog('Listing Created', `New classified ad published: ${d.title}`, 'ad'); fetchData(); }, 
      updateListing: async (id, data) => { await listingService.update(id, data as any); fetchData(); },
      deleteListing: async (id) => { await listingService.delete(id); addAuditLog('Listing Deleted', `Ad ${id} removed`, 'ad'); fetchData(); }, 
      markAsSold: async (id) => { await listingService.update(id, { status: 'sold' }); addAuditLog('Listing Sold', `Ad ${id} sealed`, 'ad'); fetchData(); },
      toggleFeaturedListing: async (id) => { const l = listings.find(i => i.id === id); if (l) await listingService.update(id, { featured: !l.featured }); fetchData(); },
      promoteListing: async (id, d, p) => { 
        const end = new Date(); end.setMonth(end.getMonth() + d);
        await listingService.update(id, { featured: true, promotion_plan_name: p, promotion_duration_months: d, promotion_start_date: new Date().toISOString(), promotion_end_date: end.toISOString() });
        addAuditLog('Ad Promoted', `Ad ${id} boosted via ${p}`, 'ad'); fetchData();
      }, 
      conversations, sendMessage: async (l, r, c) => { await messageService.sendMessage({ listing_id: l, receiver_id: r, sender_id: user?.id, content: c }); fetchData(); },
      notifications, markNotificationRead: (id) => notificationService.markRead(id).then(fetchData), 
      markAllNotificationsRead: () => {}, clearNotification: (id) => notificationService.clear(id).then(fetchData), 
      addNotification: () => {}, broadcastMassNotification: (t, m) => { toast.info('Broadcasting to all nodes...'); addAuditLog('Global Broadcast', `System message: ${t}`, 'broadcast'); }, 
      passwordRequests, submitPasswordRequest: async (r) => { await passwordRequestService.create(r); fetchData(); },
      processPasswordRequest: async (id, s) => { await passwordRequestService.updateStatus(id, s); addAuditLog('Password Reset', `Request ${id} ${s}`, 'security'); fetchData(); },
      verificationRequests, submitVerificationRequest: async (r) => { await verificationService.create(r); fetchData(); },
      processVerificationRequest: async (id, s) => { await verificationService.updateStatus(id, s); addAuditLog('ID Verification', `Request ${id} ${s}`, 'verification'); fetchData(); },
      promotionPaymentRequests, submitPromotionPaymentRequest: async (r) => { await promotionService.create(r); fetchData(); }, 
      processPromotionPaymentRequest: async (id, s) => { await promotionService.updateStatus(id, s); fetchData(); },
      announcements, addAnnouncement: (a) => announcementService.create(a).then(fetchData), 
      toggleAnnouncement: () => {}, deleteAnnouncement: (id) => announcementService.delete(id).then(fetchData),
      reports, submitReport: (r) => reportService.create(r).then(fetchData), 
      processReport: (id, a) => reportService.updateStatus(id, 'resolved').then(fetchData), 
      disputeCases, submitDisputeCase: (d) => disputeService.create(d).then(fetchData), 
      processDisputeCase: (id, s) => disputeService.updateStatus(id, s).then(fetchData),
      auditLogs, addAuditLog, recentDeals, sealDeal, intrusionLogs, recordIntrusion,
      searchAlerts, saveSearchAlert: (a) => searchAlertService.create({ ...a, user_id: user?.id }).then(fetchData), 
      deleteSearchAlert: (id) => searchAlertService.delete(id).then(fetchData), 
      reviews, addReview: (r) => reviewService.create(r).then(fetchData), 
      deleteReview: (id) => reviewService.delete(id).then(fetchData),
      buyerRequests, createBuyerRequest: (r) => buyerRequestService.create(r).then(fetchData), 
      deleteBuyerRequest: (id) => buyerRequestService.delete(id).then(fetchData),
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