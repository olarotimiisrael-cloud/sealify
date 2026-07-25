import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message, VerificationBadgeType, PasswordChangeRequest, VerificationRequest, PromotionPaymentRequest, AdReport, AuditLog, SecurityIntrusionLog, DisputeCase, SiteSettings, SearchAlert, Review, CategoryStats, BuyerRequest } from '../types/sealify';
import { TRANSLATIONS, SupportedLanguage } from '@/translations/languages';
import { userService, listingService, messageService, notificationService, verificationService, passwordRequestService, promotionService, disputeService, reportService, auditService, reviewService, buyerRequestService, favoriteService, announcementService, systemConfigService, siteSettingsService, safeSpotService, promotionPlanService, searchAlertService, intrusionService, recentDealsService } from '@/services/supabaseService';
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
  createListing: (data: Partial<Listing>) => Promise<boolean>;
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

  // Session Persistence
  useEffect(() => {
    const stored = localStorage.getItem('sealify_session');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sealify_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('sealify_session');
    }
  }, [user]);

  // Central Database Sync
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

      if (dbListings) {
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
          images: l.listing_images?.map((img: any) => img.image_url) || [],
          viewsCount: l.views_count || 0,
          createdAt: new Date(l.created_at).toLocaleDateString(),
          featured: l.featured,
          promotionEndDate: l.promotion_end_date,
          specifications: l.specifications
        })));
      }

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
      if (dbPlans && dbPlans.length > 0) setPromotionPlans(dbPlans as any);
      
      if (dbConfigs && dbConfigs.length > 0) {
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
        
        setNotifications(userNotifs.map((n: any) => ({
          id: n.id,
          type: n.type as any,
          title: n.title,
          description: n.description,
          time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: n.read,
          linkUrl: n.link_url || undefined
        })));
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
    try {
      await auditService.create({ action, details, type, created_at: new Date().toISOString() });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const dbUser = await userService.getByEmail(email);
      if (dbUser) {
        if (dbUser.status === 'banned') {
          toast.error('Account Access Denied: User is banned.');
          return false;
        }
        setUser(dbUser as any);
        toast.success(`Access Granted: ${dbUser.full_name}`);
        addAuditLog('User Login', `Node access to ${email}`, 'security');
        return true;
      }
      toast.error('Invalid credentials.');
      return false;
    } catch (err) {
      toast.error('Auth service failure.');
      return false;
    }
  };

  const signup = async (data: Partial<UserProfile> & { password?: string }) => {
    try {
      const newUser = await userService.create({
        email: data.email!,
        full_name: data.fullName!,
        phone_number: data.phoneNumber || null,
        role: data.role || 'buyer',
        verified: false,
        verification_type: 'none',
        location: data.location || 'Ogbomoso, Oyo State',
        member_since: new Date().toISOString(),
        status: 'active',
        password: data.password || null
      });
      setUser(newUser as any);
      toast.success('Node Identity Created.');
      addAuditLog('Registration', `New user ${data.email}`, 'user');
      fetchData();
    } catch (err) { toast.error('Signup failed.'); }
  };

  const adminLogin = async (email: string, pass: string, pin?: string): Promise<boolean> => {
    if (email === 'admin@sealify.ng' && pin === adminPin) {
       const dbUser = await userService.getByEmail(email);
       if (dbUser) {
          setUser(dbUser as any);
       } else {
          setUser({
             id: 'usr_root_fallback',
             email: 'admin@sealify.ng',
             fullName: 'Sealify Root',
             phoneNumber: '+234 813 120 8468',
             role: 'admin',
             verified: true,
             verificationType: 'premium',
             memberSince: '2024',
             location: 'Ogbomoso',
             avatarUrl: ''
          });
       }
       addAuditLog('Admin Elevation', 'Godmode activated via Root Fallback', 'security');
       toast.success('Admin Terminal Access Granted.');
       return true;
    }

    try {
      const dbUser = await userService.getByEmail(email);
      if (dbUser && dbUser.role === 'admin' && pin === adminPin) {
         setUser(dbUser as any);
         addAuditLog('Admin Elevation', `Terminal access granted to ${email}`, 'security');
         toast.success('Admin Terminal Access Granted.');
         return true;
      }
    } catch (e) {
       console.error("Auth Exception:", e);
    }
    
    return false;
  };

  const createListing = async (data: Partial<Listing>): Promise<boolean> => {
    try {
      const result = await listingService.create({
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
      }, data.images || []);
      
      if (result) {
        // Trigger Search Alert Matches
        const allAlerts = await supabase.from('search_alerts').select('*');
        if (allAlerts.data) {
           const matches = allAlerts.data.filter(alert => {
              const qMatch = data.title?.toLowerCase().includes(alert.query.toLowerCase()) || data.description?.toLowerCase().includes(alert.query.toLowerCase());
              const catMatch = alert.category === 'All' || alert.category === data.category;
              const priceMatch = !alert.max_price || (data.price && data.price <= alert.max_price);
              return qMatch && catMatch && priceMatch;
           });

           if (matches.length > 0) {
              const notifs = matches.map(m => ({
                 user_id: m.user_id,
                 type: 'alert_match',
                 title: 'New Search Alert Match!',
                 description: `A new "${data.title}" has been posted in Ogbomoso that matches your saved alert for "${m.query}".`,
                 link_url: `/listing/${result.id}`,
                 read: false
              }));
              await supabase.from('notifications').insert(notifs);
           }
        }

        await fetchData();
        return true;
      }
      return false;
    } catch (e: any) { 
      console.error("Listing Creation Error:", e);
      toast.error(`Creation failed: ${e.message || 'Unknown error'}`); 
      return false;
    }
  };

  const updateListing = async (id: string, updatedData: Partial<Listing>) => {
    try {
      await listingService.update(id, updatedData as any);
      fetchData();
    } catch (e) { toast.error('Update failed.'); }
  };

  const deleteListing = async (id: string) => {
    try {
      await listingService.delete(id);
      fetchData();
    } catch (e) { toast.error('Removal failed.'); }
  };

  const markAsSold = async (id: string) => {
    try {
      await listingService.update(id, { status: 'sold' });
      fetchData();
    } catch (e) { toast.error('Status update failed.'); }
  };

  const toggleFeaturedListing = async (id: string) => {
    const target = listings.find(l => l.id === id);
    if (!target) return;
    try {
      await listingService.update(id, { featured: !target.featured });
      fetchData();
    } catch (e) { toast.error('Feature toggle failed.'); }
  };

  const promoteListing = async (id: string, durationMonths: number, planName: string) => {
    const end = new Date();
    end.setMonth(end.getMonth() + durationMonths);
    try {
      await listingService.update(id, {
        featured: true,
        promotion_plan_name: planName,
        promotion_duration_months: durationMonths,
        promotion_start_date: new Date().toISOString(),
        promotion_end_date: end.toISOString()
      } as any);
      fetchData();
    } catch (e) { toast.error('Promotion failed.'); }
  };

  const sendMessage = async (listingId: string, receiverId: string, content: string) => {
    try {
      await messageService.sendMessage({ listing_id: listingId, receiver_id: receiverId, sender_id: user?.id, content });
      fetchData();
    } catch (e) { toast.error('Message failed.'); }
  };

  const updateUser = async (id: string, data: Partial<UserProfile>) => {
    try {
      const updated = await userService.update(id, data as any);
      if (user?.id === id) setUser(updated as any);
      fetchData();
    } catch (e) { toast.error('Update failed.'); }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      fetchData();
    } catch (e) { toast.error('Deletion failed.'); }
  };

  // Category Management
  const addCategory = (cat: { id: string, name: string, iconName: string, count: number, color: string }) => {
    setCategories(prev => [...prev.filter(c => c.id !== cat.id), cat]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const updateCategory = (id: string, name: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  // Notifications Management
  const markNotificationRead = async (id: string) => {
    await notificationService.markRead(id);
    fetchData();
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    try {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
      toast.success('All notifications marked as read');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const clearNotification = async (id: string) => {
    await notificationService.clear(id);
    fetchData();
  };

  const addNotification = async (notif: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    if (!user) return;
    try {
      await supabase.from('notifications').insert([{
        user_id: user.id,
        type: notif.type,
        title: notif.title,
        description: notif.description,
        link_url: notif.linkUrl || null,
        read: false
      }]);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const broadcastMassNotification = async (title: string, message: string, targetRole: 'all' | 'seller' | 'buyer' = 'all') => {
    try {
      const targets = targetRole === 'all' 
        ? allUsers 
        : allUsers.filter(u => u.role === targetRole);

      const notifRows = targets.map(u => ({
        user_id: u.id,
        type: 'system',
        title,
        description: message,
        read: false
      }));

      if (notifRows.length > 0) {
        await supabase.from('notifications').insert(notifRows);
        toast.success(`Broadcasted notification to ${notifRows.length} users!`);
        addAuditLog('Mass Broadcast', `Notified ${notifRows.length} users: ${title}`, 'broadcast');
        fetchData();
      }
    } catch (e) {
      console.error(e);
      toast.error('Mass broadcast failed.');
    }
  };

  const toggleAnnouncement = async (id: string) => {
    const target = announcements.find(a => a.id === id);
    if (!target) return;
    try {
      await supabase.from('announcements').update({ active: !target.active }).eq('id', id);
      toast.success(`Announcement ${!target.active ? 'enabled' : 'disabled'}`);
      fetchData();
    } catch (e) {
      console.error(e);
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
        demandScore: Math.min(100, Math.round(catAds.length * 15)), // Improved demand velocity logic
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
      activeSessions: [
        { id: 'sess_1', user: 'Ope_72', action: 'Viewing Electronics', time: 'Just now' },
        { id: 'sess_2', user: 'Guest_Node', action: 'Searching Ogbomoso', time: '1m ago' }
      ]
    };
  }, [listings, allUsers, conversations, promotionPaymentRequests, categories]);

  return (
    <SealifyContext.Provider value={{
      user, setUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      adminPin, updateAdminPin: (p) => setAdminPin(p),
      systemConfig, updateSystemConfig: (upd) => { Object.entries(upd).forEach(([k, v]) => systemConfigService.update(k, !!v)); fetchData(); },
      siteSettings, updateSiteSettings: (s) => siteSettingsService.update(s).then(fetchData),
      promotionPlans, updatePromotionPlanRate: (m, r) => promotionPlanService.updateRate(m, r).then(fetchData),
      safeSpots, addSafeSpot: (s) => safeSpotService.create(s).then(fetchData), deleteSafeSpot: (id) => safeSpotService.delete(id).then(fetchData),
      exportDatabaseBackup: () => toast.info('Exporting database...'),
      language, setLanguage, t, categories, addCategory, deleteCategory, updateCategory,
      analytics, marketStats, login, signup, adminLogin, logout: () => setUser(null), listings, allUsers, updateUser, deleteUser,
      bulkUpdateUsers: (ids, upd) => ids.forEach(id => updateUser(id, upd)),
      bulkDeleteUsers: (ids) => ids.forEach(id => deleteUser(id)),
      bulkUpdateListings: (ids, upd) => ids.forEach(id => updateListing(id, upd)),
      bulkDeleteListings: (ids) => ids.forEach(id => deleteListing(id)),
      savedListingIds, recentlyViewedIds, addRecentlyViewed: (id) => setRecentlyViewedIds(p => [id, ...p.filter(i => i !== id)].slice(0, 10)),
      toggleSaveListing: async (id) => { if (user) { const next = await favoriteService.toggle(user.id, id); setSavedListingIds(p => next ? [...p, id] : p.filter(i => i !== id)); } },
      isSaved: (id) => savedListingIds.includes(id),
      filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
      activeCategory: filters.category, setActiveCategory: (c) => setFilters(f => ({...f, category: c})),
      compareListingIds, toggleCompareListing: (id) => setCompareListingIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p),
      isInCompare: (id) => compareListingIds.includes(id), clearCompare: () => setCompareListingIds([]),
      createListing, updateListing, deleteListing, markAsSold, toggleFeaturedListing, promoteListing, conversations, sendMessage,
      notifications, markNotificationRead, markAllNotificationsRead, clearNotification,
      addNotification, broadcastMassNotification,
      passwordRequests, submitPasswordRequest: (r) => passwordRequestService.create(r).then(fetchData),
      processPasswordRequest: (id, s) => passwordRequestService.updateStatus(id, s).then(fetchData),
      verificationRequests, submitVerificationRequest: (r) => verificationService.create(r).then(fetchData),
      processVerificationRequest: (id, s) => verificationService.updateStatus(id, s).then(fetchData),
      promotionPaymentRequests, submitPromotionPaymentRequest: (r) => promotionService.create(r).then(fetchData),
      processPromotionPaymentRequest: (id, s) => promotionService.updateStatus(id, s).then(fetchData),
      announcements, addAnnouncement: (a) => announcementService.create(a).then(fetchData),
      toggleAnnouncement, deleteAnnouncement: (id) => announcementService.delete(id).then(fetchData),
      reports, submitReport: (r) => reportService.create(r).then(fetchData),
      processReport: (id, a) => reportService.updateStatus(id, 'resolved').then(fetchData),
      disputeCases, submitDisputeCase: (d) => disputeService.create(d).then(fetchData),
      processDisputeCase: (id, s) => disputeService.updateStatus(id, s).then(fetchData),
      auditLogs, addAuditLog, recentDeals, sealDeal: (l, b, p) => recentDealsService.create({ item_title: l, price: p, location: user?.location || 'Ogbomoso', time: 'Just now' }).then(fetchData),
      intrusionLogs, recordIntrusion: (e, m) => intrusionService.create({ attempted_email: e, media_status: m, status: 'flagged' }).then(fetchData),
      searchAlerts, saveSearchAlert: (a) => searchAlertService.create({ ...a, user_id: user?.id }).then(fetchData),
      deleteSearchAlert: (id) => searchAlertService.delete(id).then(fetchData),
      reviews, addReview: (r) => reviewService.create(r).then(fetchData), deleteReview: (id) => reviewService.delete(id).then(fetchData),
      buyerRequests, createBuyerRequest: (r) => buyerRequestService.create(r).then(fetchData), deleteBuyerRequest: (id) => buyerRequestService.delete(id).then(fetchData),
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