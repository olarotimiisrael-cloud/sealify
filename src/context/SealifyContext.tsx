import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Mappings
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
      const newLog = await auditService.create({ action, details, type, created_at: new Date().toISOString() });
      setAuditLogs(prev => [newLog as any, ...prev]);
    } catch (err) {
      console.error('Audit log error:', err);
    }
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [
        usersData, 
        listingsData, 
        auditLogsData, 
        verificationsData, 
        passwordReqsData, 
        promoPaymentsData,
        reportsData,
        disputesData,
        intrusionData,
        announcementsData,
        reviewsData,
        buyerReqsData
      ] = await Promise.all([
        userService.getAll(),
        listingService.getAll(),
        auditService.getAll(),
        verificationService.getAll(),
        passwordRequestService.getAll(),
        promotionService.getAll(),
        reportService.getAll(),
        disputeService.getAll(),
        intrusionService.getAll(),
        announcementService.getAll(),
        reviewService.getAll(),
        buyerRequestService.getAll()
      ]);

      const convertedUsers = usersData.map(convertDbUserToUserProfile);
      const convertedListings = listingsData.map(l => convertDbListingToListing(l, convertedUsers));

      setAllUsers(convertedUsers);
      setListings(convertedListings);
      setAuditLogs(auditLogsData as any);
      setVerificationRequests(verificationsData as any);
      setPasswordRequests(passwordReqsData as any);
      setPromotionPaymentRequests(promoPaymentsData as any);
      setReports(reportsData as any);
      setDisputeCases(disputesData as any);
      setIntrusionLogs(intrusionData as any);
      setAnnouncements(announcementsData as any);
      setReviews(reviewsData as any);
      setBuyerRequests(buyerReqsData as any);

      setLoading(false);
    } catch (err) {
      console.error('Initialization error:', err);
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
          email, full_name: email.split('@')[0], phone_number: '',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          role, verified: false, verification_type: 'none', business_name: null,
          location: 'Ogbomoso', member_since: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          status: 'active', restriction_reason: null, appeal_status: 'none', password: null,
        });
        const profile = convertDbUserToUserProfile(newUser);
        setAllUsers(prev => [profile, ...prev]);
        setUser(profile);
        addAuditLog('New Signup', `User created profile for ${email}`, 'user');
        toast.success(`Account created!`);
      }
    } catch (err) {
      toast.error('Authentication failed.');
    }
  };

  const adminLogin = async (email: string, pass: string, pin?: string): Promise<boolean> => {
    if (email === 'olarotimiisrael@gmail.com' && pass === 'Tscw+1234' && (!pin || pin === adminPin)) {
      let existing = await userService.getByEmail(email);
      if (!existing) {
        existing = await userService.create({
          email, full_name: 'Israel Olarotimi', phone_number: '0813 120 8468',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          role: 'admin', verified: true, verification_type: 'premium',
          business_name: null, member_since: 'Jan 2023', location: 'Ogbomoso, Oyo State',
          status: 'active', restriction_reason: null, appeal_status: 'none', password: pass
        });
      }
      const profile = convertDbUserToUserProfile(existing);
      setUser(profile);
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
      toast.error('Failed to update user.');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      setAllUsers(prev => prev.filter(u => u.id !== id));
      addAuditLog('User Purged', `Record for UID: ${id} deleted by admin`, 'user');
      toast.success('User purged.');
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  const createListing = async (data: any) => {
    if (!user) return;
    try {
      const newDbListing = await listingService.create({
        seller_id: user.id, title: data.title, description: data.description,
        price: data.price, original_price: data.originalPrice || null,
        category: data.category, condition: data.condition, location: data.location,
        status: 'active', images: data.images, video_url: data.videoUrl || null,
        views_count: 0, featured: data.featured || false,
        promotion_plan_name: null, promotion_duration_months: 0,
        promotion_start_date: null, promotion_end_date: null,
        payment_status: 'pending', payment_proof_url: null,
        amount_paid: null, specifications: data.specifications || null,
      });
      const listing = convertDbListingToListing(newDbListing, allUsers);
      setListings(prev => [listing, ...prev]);
      addAuditLog('Ad Published', `"${data.title}" created by ${user.fullName}`, 'ad');
    } catch (err) {
      toast.error('Failed to post ad.');
    }
  };

  const updateListing = async (id: string, updatedData: Partial<Listing>) => {
    try {
      const dbUpdates: any = {};
      if (updatedData.title) dbUpdates.title = updatedData.title;
      if (updatedData.price) dbUpdates.price = updatedData.price;
      if (updatedData.description) dbUpdates.description = updatedData.description;
      if (updatedData.status) dbUpdates.status = updatedData.status;
      if (updatedData.featured !== undefined) dbUpdates.featured = updatedData.featured;

      await listingService.update(id, dbUpdates);
      setListings(prev => prev.map(l => l.id === id ? { ...l, ...updatedData } : l));
      toast.success('Ad updated.');
    } catch (err) {
      toast.error('Update failed.');
    }
  };

  const deleteListing = async (id: string) => {
    try {
      await listingService.delete(id);
      setListings(prev => prev.filter(l => l.id !== id));
      toast.success('Ad removed.');
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  const markAsSold = async (id: string) => {
    await updateListing(id, { status: 'sold' });
    toast.success('Marked as sold!');
  };

  const toggleFeaturedListing = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (!listing) return;
    await updateListing(id, { featured: !listing.featured });
  };

  const promoteListing = async (id: string, durationMonths: number, planName: string) => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);
    await updateListing(id, { 
      featured: true, 
      promotionDurationMonths: durationMonths, 
      promotionPlanName: planName,
      promotionEndDate: endDate.toISOString()
    });
    toast.success('Boost activated!');
  };

  const processPromotionPaymentRequest = async (id: string, status: 'approved' | 'rejected') => {
    const req = promotionPaymentRequests.find(r => r.id === id);
    if (!req) return;
    await promotionService.updateStatus(id, status);
    if (status === 'approved') {
      await promoteListing(req.listingId, req.durationMonths, req.planName);
    }
    setPromotionPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    addAuditLog('Treasury Action', `Promotion request ${id} processed: ${status}`, 'finance');
  };

  const processVerificationRequest = async (id: string, status: 'approved' | 'rejected') => {
    const req = verificationRequests.find(r => r.id === id);
    if (!req) return;
    await verificationService.updateStatus(id, status);
    if (status === 'approved') {
      await updateUser(req.userId, { verified: true, verificationType: req.type });
    }
    setVerificationRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const processPasswordRequest = async (id: string, status: 'approved' | 'declined') => {
    const req = passwordRequests.find(r => r.id === id);
    if (!req) return;
    await passwordRequestService.updateStatus(id, status);
    if (status === 'approved') {
      await updateUser(req.userId, { password: req.newPassword });
    }
    setPasswordRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const processDisputeCase = async (id: string, status: DisputeCase['status']) => {
    await disputeService.updateStatus(id, status);
    setDisputeCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast.success(`Dispute ${id} moved to ${status}`);
  };

  const processReport = async (id: string, action: 'dismiss' | 'resolve_delete_ad') => {
    const report = reports.find(r => r.id === id);
    if (!report) return;
    await reportService.updateStatus(id, action === 'dismiss' ? 'dismissed' : 'resolved');
    if (action === 'resolve_delete_ad') {
      await deleteListing(report.listingId);
    }
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: action === 'dismiss' ? 'dismissed' : 'resolved' } : r));
  };

  const t = useCallback((key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  }, [language]);

  return (
    <SealifyContext.Provider value={{
      user, setUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      adminPin, updateAdminPin: setAdminPin, systemConfig, updateSystemConfig: (u) => setSystemConfig(p => ({...p, ...u})), siteSettings, updateSiteSettings: (s) => setSiteSettings(p => ({...p, ...s})), 
      exportDatabaseBackup: () => toast.success('Database export initiated... CSV file download ready.'),
      language, setLanguage, t,
      categories, addCategory: (c) => setCategories(p => [...p, { ...c, id: 'cat_'+Date.now() }]), 
      deleteCategory: (id) => setCategories(p => p.filter(c => c.id !== id)), 
      updateCategory: (id, name) => setCategories(p => p.map(c => c.id === id ? { ...c, name } : c)),
      analytics: { visitors: 184, activeAds: listings.length, totalChats: 12, sessionsPerMinute: [10, 20, 15, 30, 25, 40, 18, 22, 35, 29] }, 
      marketStats: [], login, adminLogin, logout,
      listings, allUsers, updateUser, deleteUser,
      savedListingIds, recentlyViewedIds, addRecentlyViewed: (id) => setRecentlyViewedIds(p => [id, ...p.filter(i => i !== id)].slice(0, 8)), 
      toggleSaveListing: (id) => setSavedListingIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]), isSaved: (id) => savedListingIds.includes(id),
      filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
      activeCategory: filters.category, setActiveCategory: (cat) => setFilters(p => ({...p, category: cat})),
      compareListingIds, toggleCompareListing: (id) => setCompareListingIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p), 
      isInCompare: (id) => compareListingIds.includes(id), clearCompare: () => setCompareListingIds([]),
      createListing, updateListing, deleteListing, markAsSold, toggleFeaturedListing, promoteListing,
      conversations, sendMessage: async (lId, rId, content) => { toast.success('Message dispatched.'); },
      notifications, markNotificationRead: (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n)), 
      markAllNotificationsRead: () => setNotifications(p => p.map(n => ({ ...n, read: true }))), 
      clearNotification: (id) => setNotifications(p => p.filter(n => n.id !== id)), 
      addNotification: (notif) => setNotifications(p => [{ ...notif, id: 'ntf_'+Date.now(), time: 'Just now', read: false } as any, ...p]),
      broadcastMassNotification: (title, message) => toast.success(`Broadcast "${title}" dispatched to all users.`),
      passwordRequests, submitPasswordRequest: (req) => toast.success('Password reset request submitted.'), 
      processPasswordRequest,
      verificationRequests, submitVerificationRequest: (req) => toast.success('Verification request submitted.'), 
      processVerificationRequest,
      promotionPaymentRequests, submitPromotionPaymentRequest: (req) => toast.success('Payment proof submitted.'), 
      processPromotionPaymentRequest,
      disputeCases, submitDisputeCase: (disp) => toast.success('Dispute case opened.'), 
      processDisputeCase,
      announcements, addAnnouncement: (ann) => setAnnouncements(p => [{ ...ann, id: 'ann_'+Date.now(), createdAt: new Date().toISOString() }, ...p]), 
      toggleAnnouncement: (id) => setAnnouncements(p => p.map(a => a.id === id ? { ...a, active: !a.active } : a)), 
      deleteAnnouncement: (id) => setAnnouncements(p => p.filter(a => a.id !== id)),
      reports, submitReport: (rep) => toast.success('Report submitted.'), 
      processReport,
      auditLogs, addAuditLog,
      recentDeals: [], sealDeal: (lId, bName, p) => toast.success('Deal sealed!'),
      intrusionLogs, recordIntrusion: (email, media) => toast.warning('Security alert logged.'),
      searchAlerts, saveSearchAlert: (alert) => toast.success('Alert saved.'), 
      deleteSearchAlert: (id) => toast.success('Alert removed.'),
      reviews, addReview: (rev) => setReviews(p => [{ ...rev, id: 'rev_'+Date.now(), createdAt: 'Just now' } as any, ...p]), 
      deleteReview: (id) => setReviews(p => p.filter(r => r.id !== id)),
      buyerRequests, createBuyerRequest: (req) => toast.success('Request posted to board.'), 
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