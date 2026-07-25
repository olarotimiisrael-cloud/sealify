import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message, VerificationBadgeType, PasswordChangeRequest, VerificationRequest, PromotionPaymentRequest, AdReport, AuditLog, SecurityIntrusionLog, DisputeCase, SiteSettings, SearchAlert, Review, CategoryStats, BuyerRequest, Wallet, Transaction } from '../types/sealify';
import { TRANSLATIONS, SupportedLanguage } from '@/translations/languages';
import { userService, listingService, messageService, notificationService, verificationService, passwordRequestService, promotionService, disputeService, reportService, auditService, reviewService, buyerRequestService, favoriteService, announcementService, systemConfigService, siteSettingsService, safeSpotService, promotionPlanService, searchAlertService, intrusionService, recentDealsService, storageService } from '@/services/supabaseService';
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
  
  // Wallet State
  wallet: Wallet | null;
  transactions: Transaction[];
  requestPayout: (amount: number) => Promise<void>;
  
  loading: boolean;
  error: string | null;
}

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminPin, setAdminPin] = useState<string>('336699');
  
  // App Data State
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
    { id: 'services', name: 'Services', iconName: 'Wrench', count: 0, color: 'bg-cyan-500' },
    { id: 'jobs', name: 'Jobs', iconName: 'Briefcase', count: 0, color: 'bg-indigo-500' },
    { id: 'beauty', name: 'Beauty & Health', iconName: 'Sparkles', count: 0, color: 'bg-rose-500' },
    { id: 'utility', name: 'Utility & Energy', iconName: 'Zap', count: 0, color: 'bg-yellow-500' },
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

  // Wallet and Transactions
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      // Mock wallet initialization
      setWallet({
        id: 'wal_1',
        userId: user.id,
        balance: user.totalValueTraded || 0,
        pendingBalance: 25000,
        totalWithdrawn: 145000,
        currency: 'NGN',
        updatedAt: new Date().toISOString()
      });

      setTransactions([
        { id: 'tr_1', walletId: 'wal_1', type: 'sale', amount: 45000, status: 'completed', description: 'Sale of iPhone 11 Pro', createdAt: '2 days ago' },
        { id: 'tr_2', walletId: 'wal_1', type: 'payout', amount: -30000, status: 'completed', description: 'Bank Withdrawal to GTB', createdAt: '5 days ago' },
        { id: 'tr_3', walletId: 'wal_1', type: 'promotion', amount: -15000, status: 'completed', description: 'Top Ad Boost: Toyota Corolla', createdAt: '1 week ago' }
      ]);
    }
  }, [user]);

  const requestPayout = async (amount: number) => {
    if (!wallet || amount > wallet.balance) {
      toast.error('Insufficient funds for payout');
      return;
    }
    setWallet(prev => prev ? { ...prev, balance: prev.balance - amount, totalWithdrawn: prev.totalWithdrawn + amount } : null);
    setTransactions(prev => [{ id: `tr_${Date.now()}`, walletId: wallet.id, type: 'payout', amount: -amount, status: 'pending', description: 'Requested Withdrawal', createdAt: 'Just now' }, ...prev]);
    toast.success('Payout request submitted to admin!');
  };

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await userService.getProfile(session.user.id);
        if (profile) {
          setUser(profile as any);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            phoneNumber: session.user.user_metadata?.phone || '',
            avatarUrl: session.user.user_metadata?.avatar_url || '',
            role: 'buyer',
            verified: false,
            memberSince: new Date().toISOString(),
            location: 'Ogbomoso, Oyo State'
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchData = useCallback(async () => {
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

      if (dbUsers.status === 'fulfilled' && dbUsers.value) setAllUsers(dbUsers.value as any);

      if (dbListings.status === 'fulfilled' && dbListings.value) {
        setListings(dbListings.value.map((l: any) => ({
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
          category: l.category,
          condition: l.condition,
          location: l.location,
          status: l.status || 'active',
          images: l.listing_images?.map((img: any) => img.image_url) || (l.images ? l.images : []),
          viewsCount: l.views_count || 0,
          createdAt: new Date(l.created_at || Date.now()).toLocaleDateString(),
          featured: l.featured || false,
          promotionEndDate: l.promotion_end_date,
          specifications: l.specifications
        })));
      }

      if (dbVerifications.status === 'fulfilled' && dbVerifications.value) setVerificationRequests(dbVerifications.value as any);
      if (dbPasswords.status === 'fulfilled' && dbPasswords.value) setPasswordRequests(dbPasswords.value as any);
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
      
      if (dbConfigs.status === 'fulfilled' && dbConfigs.value && dbConfigs.value.length > 0) {
        const configMap: Partial<SystemConfig> = {};
        dbConfigs.value.forEach((c: any) => configMap[c.key as keyof SystemConfig] = c.value);
        setSystemConfig(prev => ({ ...prev, ...configMap }));
      }

      if (user) {
        const results = await Promise.allSettled([
          notificationService.getAll(user.id),
          favoriteService.getByUserId(user.id),
          messageService.getConversations(user.id),
          searchAlertService.getAll(user.id)
        ]);
        
        if (results[0].status === 'fulfilled' && results[0].value) {
          setNotifications(results[0].value.map((n: any) => ({
            id: n.id,
            type: n.type as any,
            title: n.title,
            description: n.description,
            time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: n.read,
            linkUrl: n.link_url || undefined
          })));
        }
        if (results[1].status === 'fulfilled' && results[1].value) setSavedListingIds(results[1].value);
        if (results[3].status === 'fulfilled' && results[3].value) setSearchAlerts(results[3].value as any);

        if (results[2].status === 'fulfilled' && results[2].value) {
          const grouped: Record<string, Conversation> = {};
          results[2].value.forEach((m: any) => {
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
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || 'password123' });
      if (error) { 
        toast.error(error.message); 
        return false; 
      }
      const profile = await userService.getProfile(data.user.id);
      if (profile) {
        setUser(profile as any);
      }
      toast.success('Access Granted.');
      fetchData();
      return true;
    } catch (err) {
      toast.error('Authentication failure.');
      return false;
    }
  };

  const signup = async (data: Partial<UserProfile> & { password?: string }) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({ 
        email: data.email!, 
        password: data.password!,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phoneNumber,
          }
        }
      });
      if (error) throw error;
      if (authData.user) {
        await userService.create({ 
          id: authData.user.id, 
          email: data.email, 
          full_name: data.fullName, 
          phone_number: data.phoneNumber,
          role: data.role || 'buyer' 
        });
        toast.success('Account Identity Created.');
        fetchData();
      }
    } catch (err: any) { 
      toast.error(err.message || "Signup failed."); 
    }
  };

  const adminLogin = async (email: string, pass: string, pin?: string): Promise<boolean> => {
    const success = await login(email, pass);
    if (success && pin === adminPin) return true;
    return false;
  };

  const logout = () => { 
    setUser(null); 
    supabase.auth.signOut(); 
    toast.info('Disconnected.'); 
  };

  const updateUser = async (id: string, data: Partial<UserProfile>) => {
    const updated = await userService.update(id, data);
    if (user?.id === id && updated) setUser(updated as any);
    fetchData();
  };

  const deleteUser = async (id: string) => { 
    await userService.delete(id); 
    fetchData(); 
  };

  const createListing = async (data: Partial<Listing>, files?: File[]): Promise<boolean> => {
    try {
      let uploadedUrls: string[] = data.images || [];

      if (files && files.length > 0) {
        const fileUploadPromises = files.map(file => storageService.uploadFile('listing-photos', `lst_${Date.now()}`, file));
        const newUrls = await Promise.all(fileUploadPromises);
        uploadedUrls = [...uploadedUrls, ...newUrls.filter(Boolean)];
      }

      const newListingData = {
        seller_id: user?.id || 'usr_guest',
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        location: data.location || 'Ogbomoso, Oyo State',
        status: 'active',
        featured: data.featured || false,
        specifications: data.specifications || {}
      };

      await listingService.create(newListingData, uploadedUrls);
      toast.success('Listing created successfully!');
      fetchData();
      return true;
    } catch (e: any) {
      toast.error(e.message || 'Failed to publish listing.');
      return false; 
    }
  };

  const updateListing = async (id: string, updatedData: Partial<Listing>) => { 
    await listingService.update(id, updatedData); 
    fetchData(); 
  };

  const deleteListing = async (id: string) => { 
    await listingService.delete(id); 
    fetchData(); 
  };

  const markAsSold = async (id: string) => { 
    await listingService.update(id, { status: 'sold' }); 
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
        demandScore: Math.min(100, Math.round(catAds.length * 15)),
        trend: 'up'
      };
    });
  }, [listings, categories]);

  const analytics = useMemo((): AnalyticsData => {
    return {
      visitors: 142 + Math.floor(Math.random() * 20),
      activeAds: listings.filter(l => l.status === 'active').length,
      totalChats: conversations.length,
      totalRevenue: promotionPaymentRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0),
      userGrowth: Math.round((allUsers.length / 10) * 100) / 10,
      categoryDistribution: categories.map(c => ({ name: c.name, count: listings.filter(l => l.category === c.name).length, color: c.color })),
      activeSessions: [{ id: 'sess_1', user: 'Guest_Node', action: 'Searching', time: 'Just now' }]
    };
  }, [listings, allUsers, conversations, promotionPaymentRequests, categories]);

  return (
    <SealifyContext.Provider value={{
      user, setUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      adminPin, updateAdminPin: (p) => setAdminPin(p),
      systemConfig, updateSystemConfig: (upd) => {
        setSystemConfig(p => ({...p, ...upd}));
        Object.entries(upd).forEach(([k, v]) => systemConfigService.update(k, v));
      },
      siteSettings, updateSiteSettings: (s) => {
        setSiteSettings(p => ({...p, ...s}));
        siteSettingsService.update(s);
      },
      promotionPlans, updatePromotionPlanRate: (m, r) => setPromotionPlans(p => p.map(plan => plan.months === m ? {...plan, rate: r} : plan)),
      safeSpots, addSafeSpot: (s) => safeSpotService.create(s).then(() => fetchData()), deleteSafeSpot: (id) => safeSpotService.delete(id).then(() => fetchData()),
      exportDatabaseBackup: () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ listings, allUsers, reviews, siteSettings }, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `Sealify_DB_Backup_${Date.now()}.json`);
        dlAnchorElem.click();
        toast.success("Database Backup Exported!");
      },
      language, setLanguage, t, categories, 
      addCategory: (c) => setCategories(prev => [...prev, c]), 
      deleteCategory: (id) => setCategories(p => p.filter(c => c.id !== id)), 
      updateCategory: (id, name) => setCategories(p => p.map(c => c.id === id ? {...c, name} : c)),
      analytics, marketStats, login, signup, 
      sendPhoneOtp: async () => Math.floor(100000 + Math.random() * 900000).toString(), 
      verifyPhoneOtp: async () => true, 
      adminLogin, logout, listings, allUsers, updateUser, deleteUser,
      bulkUpdateUsers: (ids, upd) => ids.forEach(id => updateUser(id, upd)),
      bulkDeleteUsers: (ids) => ids.forEach(id => deleteUser(id)),
      bulkUpdateListings: (ids, upd) => ids.forEach(id => updateListing(id, upd)),
      bulkDeleteListings: (ids) => ids.forEach(id => deleteListing(id)),
      savedListingIds, recentlyViewedIds, addRecentlyViewed: (id) => setRecentlyViewedIds(p => [id, ...p.filter(i => i !== id)].slice(0, 10)),
      toggleSaveListing: async (id) => { 
        if (user) { 
          const exists = savedListingIds.includes(id);
          await favoriteService.toggle(user.id, id, exists);
          setSavedListingIds(p => exists ? p.filter(i => i !== id) : [...p, id]); 
        } 
      },
      isSaved: (id) => savedListingIds.includes(id),
      filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
      activeCategory: filters.category, setActiveCategory: (c) => setFilters(f => ({...f, category: c})),
      compareListingIds, toggleCompareListing: (id) => setCompareListingIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p),
      isInCompare: (id) => compareListingIds.includes(id), clearCompare: () => setCompareListingIds([]),
      createListing, updateListing, deleteListing, markAsSold, 
      toggleFeaturedListing: async (id) => updateListing(id, { featured: !listings.find(l => l.id === id)?.featured }), 
      promoteListing: async (id, dur, plan) => updateListing(id, { featured: true, promotionPlanName: plan, promotionDurationMonths: dur }), 
      conversations, 
      sendMessage: async (lId, rId, content) => {
        await messageService.sendMessage({ sender_id: user?.id, receiver_id: rId, listing_id: lId, content });
        fetchData();
      },
      notifications, markNotificationRead: (id) => notificationService.markRead(id).then(() => fetchData()), 
      markAllNotificationsRead: () => Promise.all(notifications.map(n => notificationService.markRead(n.id))).then(() => fetchData()), 
      clearNotification: (id) => notificationService.clear(id).then(() => fetchData()),
      addNotification: (n) => {
        if (user) notificationService.create({ user_id: user.id, ...n }).then(() => fetchData());
      }, 
      broadcastMassNotification: (title, message) => {
        allUsers.forEach(u => notificationService.create({ user_id: u.id, type: 'system', title, description: message }));
        toast.success(`Broadcasted: ${title}`);
      },
      passwordRequests, submitPasswordRequest: (r) => passwordRequestService.create(r).then(() => fetchData()),
      processPasswordRequest: (id, s) => passwordRequestService.updateStatus(id, s).then(() => fetchData()),
      verificationRequests, submitVerificationRequest: (r) => verificationService.create(r).then(() => fetchData()),
      processVerificationRequest: (id, s) => verificationService.updateStatus(id, s).then(() => fetchData()),
      promotionPaymentRequests, submitPromotionPaymentRequest: (r) => promotionService.create(r).then(() => fetchData()),
      processPromotionPaymentRequest: (id, s) => promotionService.updateStatus(id, s).then(() => fetchData()),
      announcements, 
      addAnnouncement: (a) => announcementService.create(a).then(() => fetchData()),
      toggleAnnouncement: (id) => announcementService.delete(id).then(() => fetchData()), 
      deleteAnnouncement: (id) => announcementService.delete(id).then(() => fetchData()),
      reports, 
      submitReport: (r) => reportService.create(r).then(() => fetchData()),
      processReport: (id) => reportService.updateStatus(id, 'resolved').then(() => fetchData()),
      disputeCases, 
      submitDisputeCase: (d) => disputeService.create(d).then(() => fetchData()),
      processDisputeCase: (id, s) => disputeService.updateStatus(id, s).then(() => fetchData()),
      auditLogs, addAuditLog: (a, d, t) => auditService.create({ action: a, details: d, type: t }).then(() => fetchData()),
      recentDeals, 
      sealDeal: (l, b, p) => recentDealsService.create({ item_title: l, price: p, location: user?.location || 'Ogbomoso', time: 'Just now' }).then(() => fetchData()),
      intrusionLogs, recordIntrusion: (e, m) => intrusionService.create({ attempted_email: e, media_status: m, timestamp: new Date().toISOString() }).then(() => fetchData()),
      searchAlerts, 
      saveSearchAlert: (a) => searchAlertService.create({ ...a, user_id: user?.id }).then(() => fetchData()),
      deleteSearchAlert: (id) => searchAlertService.delete(id).then(() => fetchData()),
      reviews, addReview: (r) => reviewService.create(r).then(() => fetchData()), 
      deleteReview: (id) => reviewService.delete(id).then(() => fetchData()),
      buyerRequests, 
      createBuyerRequest: (r) => buyerRequestService.create(r).then(() => fetchData()), 
      deleteBuyerRequest: (id) => buyerRequestService.delete(id).then(() => fetchData()),
      
      // Wallet State & Logic
      wallet, transactions, requestPayout,
      
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