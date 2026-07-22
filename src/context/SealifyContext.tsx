import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message, VerificationBadgeType } from '../types/sealify';
import { TRANSLATIONS, SupportedLanguage } from '@/translations/languages';
import { toast } from 'sonner';

export interface AppNotification {
  id: string;
  type: 'price_drop' | 'message' | 'offer' | 'alert_match' | 'system' | 'recommendation' | 'payment';
  title: string;
  description: string;
  time: string;
  read: boolean;
  linkUrl?: string;
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
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  categories: { id: string, name: string, iconName: string, count: number, color: string }[];
  addCategory: (cat: any) => void;
  deleteCategory: (id: string) => void;
  updateCategory: (id: string, name: string) => void;
  analytics: AnalyticsData;
  login: (email: string, role: 'buyer' | 'seller' | 'admin', isSignup?: boolean) => void;
  adminLogin: (email: string, pass: string) => boolean;
  logout: () => void;
  listings: Listing[];
  allUsers: UserProfile[];
  addUser: (newUser: Omit<UserProfile, 'id' | 'memberSince'> & { password?: string }) => void;
  updateUser: (id: string, updatedData: Partial<UserProfile>) => void;
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
  createListing: (data: any) => void;
  updateListing: (id: string, updatedData: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  markAsSold: (id: string) => void;
  promoteListing: (id: string, durationMonths: number, planName: string) => void;
  conversations: Conversation[];
  sendMessage: (listingId: string, receiverId: string, content: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
}

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
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('sealify_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('sealify_lang') as SupportedLanguage) || 'en';
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('sealify_categories');
    return saved ? JSON.parse(saved) : [
      { id: 'vehicles', name: 'Vehicles', iconName: 'Car', count: 120, color: 'bg-blue-500' },
      { id: 'electronics', name: 'Electronics', iconName: 'Smartphone', count: 340, color: 'bg-purple-500' },
      { id: 'real_estate', name: 'Real Estate', iconName: 'Home', count: 85, color: 'bg-teal-500' },
      { id: 'fashion', name: 'Fashion', iconName: 'Shirt', count: 210, color: 'bg-pink-500' },
      { id: 'furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 95, color: 'bg-amber-500' },
      { id: 'services', name: 'Services', iconName: 'Wrench', count: 140, color: 'bg-cyan-500' },
      { id: 'jobs', name: 'Jobs', iconName: 'Briefcase', count: 60, color: 'bg-indigo-500' },
      { id: 'beauty', name: 'Beauty & Health', iconName: 'Sparkles', count: 110, color: 'bg-rose-500' },
    ];
  });

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    visitors: 124,
    activeAds: 50,
    totalChats: 89,
    sessionsPerMinute: [12, 19, 15, 24, 18, 30, 22, 25, 28, 34],
  });

  const [listings, setListings] = useState<Listing[]>([]);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [compareListingIds, setCompareListingIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const t = useCallback((key: string) => {
    return TRANSLATIONS[language][key] || key;
  }, [language]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        visitors: prev.visitors + (Math.random() > 0.5 ? 1 : -1),
        sessionsPerMinute: [...prev.sessionsPerMinute.slice(1), Math.floor(Math.random() * 20) + 15]
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const login = (email: string, role: any) => {
    const newUser: UserProfile = { id: 'usr_' + Date.now(), email, fullName: email.split('@')[0], phoneNumber: '', avatarUrl: '', role, verified: false, memberSince: 'Just now', location: 'Ogbomoso' };
    setUser(newUser);
    localStorage.setItem('sealify_user', JSON.stringify(newUser));
    toast.success(`Welcome back!`);
  };

  const adminLogin = (email: string, pass: string) => {
    if (email === DEFAULT_ADMIN.email && pass === DEFAULT_ADMIN.password) {
      setUser(DEFAULT_ADMIN);
      localStorage.setItem('sealify_user', JSON.stringify(DEFAULT_ADMIN));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sealify_user');
  };

  const addCategory = (cat: any) => setCategories([...categories, { ...cat, id: 'cat_' + Date.now() }]);
  const deleteCategory = (id: string) => setCategories(categories.filter(c => c.id !== id));
  const updateCategory = (id: string, name: string) => setCategories(categories.map(c => c.id === id ? { ...c, name } : c));

  const addNotification = useCallback((notif: any) => {
    setNotifications(prev => [{ ...notif, id: 'notif_' + Date.now(), time: 'Just now', read: false }, ...prev]);
  }, []);

  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllNotificationsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const isSaved = (id: string) => savedListingIds.includes(id);
  const toggleSaveListing = (id: string) => setSavedListingIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const addRecentlyViewed = (id: string) => setRecentlyViewedIds(prev => [id, ...prev.filter(i => i !== id)].slice(0, 10));

  const toggleCompareListing = (id: string) => {
    setCompareListingIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) {
        toast.warning("You can only compare up to 3 items at a time.");
        return prev;
      }
      return [...prev, id];
    });
  };
  const isInCompare = (id: string) => compareListingIds.includes(id);
  const clearCompare = () => setCompareListingIds([]);

  return (
    <SealifyContext.Provider value={{
      user, setUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      language, setLanguage, t,
      categories, addCategory, deleteCategory, updateCategory,
      analytics, login, adminLogin, logout,
      listings, allUsers: [], addUser: () => {}, updateUser: () => {}, deleteUser: () => {},
      savedListingIds, recentlyViewedIds, addRecentlyViewed, toggleSaveListing, isSaved,
      filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
      activeCategory: filters.category,
      setActiveCategory: (cat) => setFilters(prev => ({ ...prev, category: cat })),
      compareListingIds, toggleCompareListing, isInCompare, clearCompare,
      createListing: () => {}, updateListing: () => {}, deleteListing: () => {}, markAsSold: () => {}, promoteListing: () => {},
      conversations, sendMessage: () => {},
      notifications, markNotificationRead, markAllNotificationsRead, clearNotification, addNotification
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