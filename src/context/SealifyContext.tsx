import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Listing, UserProfile, FilterState, Category, Conversation, Message } from '../types/sealify';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SealifyContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isAuthenticated: boolean;
  login: (email: string, role: 'buyer' | 'seller') => void;
  logout: () => void;
  listings: Listing[];
  savedListingIds: string[];
  recentlyViewedIds: string[];
  compareListingIds: string[];
  addRecentlyViewed: (id: string) => void;
  toggleSaveListing: (id: string) => void;
  isSaved: (id: string) => boolean;
  toggleCompareListing: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  createListing: (data: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'sellerPhone' | 'sellerAvatar' | 'sellerVerified' | 'status' | 'createdAt' | 'viewsCount'>) => void;
  updateListing: (id: string, updatedData: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  markAsSold: (id: string) => void;
  conversations: Conversation[];
  sendMessage: (listingId: string, receiverId: string, content: string) => void;
  getConversationByListing: (listingId: string) => Conversation | undefined;
  activeCategory: Category | 'All';
  setActiveCategory: (cat: Category | 'All') => void;
  loading: boolean;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  category: 'All',
  minPrice: null,
  maxPrice: null,
  condition: 'All',
  location: '',
  sortBy: 'newest',
};

const INITIAL_FALLBACK_LISTINGS: Listing[] = [
  {
    id: 'lst_101',
    sellerId: 'usr_1',
    sellerName: 'Adebowale Ogunleye',
    sellerPhone: '+234 803 123 4567',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    sellerVerified: true,
    title: 'Toyota Camry 2018 XSE (Unregistered Foreign Used)',
    description: 'Clean foreign used 2018 Toyota Camry XSE with panoramic roof, leather interior, custom alloy wheels, reverse camera, and duty paid. Location: Ogbomoso, Oyo State.',
    price: 18500000,
    originalPrice: 20000000,
    category: 'Vehicles',
    condition: 'Like New',
    location: 'Ogbomoso, Oyo State',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80'
    ],
    createdAt: '2 hours ago',
    viewsCount: 245,
    featured: true
  },
  {
    id: 'lst_102',
    sellerId: 'usr_2',
    sellerName: 'Blessing Okonjo',
    sellerPhone: '+234 812 987 6543',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    sellerVerified: true,
    title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
    description: 'Factory unlocked iPhone 15 Pro Max in pristine condition. Battery health 98%, comes with original USB-C braided cable, receipt, and protective silicon case.',
    price: 1450000,
    category: 'Electronics',
    condition: 'Like New',
    location: 'LAUTECH Area, Ogbomoso',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
    ],
    createdAt: '5 hours ago',
    viewsCount: 189
  },
  {
    id: 'lst_103',
    sellerId: 'usr_3',
    sellerName: 'Kemi & Associates Properties',
    sellerPhone: '+234 802 333 4455',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    sellerVerified: true,
    title: 'Newly Built 2 Bedroom Flat Self-Contain Apartment',
    description: 'Modern 2-bedroom apartment with ensuite bathrooms, POP ceiling, water heater, paved compound, secure gate, and prepaid meter near LAUTECH Under-G.',
    price: 450000,
    category: 'Real Estate',
    condition: 'Brand New',
    location: 'Under-G, Ogbomoso',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80'
    ],
    createdAt: '1 day ago',
    viewsCount: 310,
    featured: true
  },
  {
    id: 'lst_104',
    sellerId: 'usr_4',
    sellerName: 'Tunde Electronics Hub',
    sellerPhone: '+234 814 555 6677',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    sellerVerified: true,
    title: 'Apple MacBook Pro 16" M2 Pro 16GB RAM / 512GB SSD',
    description: 'Space Gray MacBook Pro M2 Pro 12-core CPU 19-core GPU. Excellent battery condition, clean keyboard and screen, ideal for software engineering and video editing.',
    price: 1850000,
    category: 'Electronics',
    condition: 'Like New',
    location: 'Ibadan, Oyo State',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
    ],
    createdAt: '2 days ago',
    viewsCount: 164
  },
  {
    id: 'lst_105',
    sellerId: 'usr_5',
    sellerName: 'Chief Salawu',
    sellerPhone: '+234 805 777 8899',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    sellerVerified: true,
    title: '2 Plot Commercial Land along Ogbomoso-Ilorin Expressway',
    description: 'Dry land with registered survey plan and C of O in process. Perfect for filling station, hotel, or warehouse development directly facing expressway.',
    price: 12000000,
    category: 'Real Estate',
    condition: 'Brand New',
    location: 'Ilorin Road, Ogbomoso',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'
    ],
    createdAt: '3 days ago',
    viewsCount: 412
  }
];

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('sealify_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [listings, setListings] = useState<Listing[]>(INITIAL_FALLBACK_LISTINGS);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [compareListingIds, setCompareListingIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize data from Supabase
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      // Get saved listings from localStorage
      const savedIds = localStorage.getItem('sealify_saved');
      if (savedIds) {
        setSavedListingIds(JSON.parse(savedIds));
      }

      // Get recently viewed from localStorage
      const recentIds = localStorage.getItem('sealify_recent');
      if (recentIds) {
        setRecentlyViewedIds(JSON.parse(recentIds));
      }

      // Get compare list from localStorage
      const compareIds = localStorage.getItem('sealify_compare');
      if (compareIds) {
        setCompareListingIds(JSON.parse(compareIds));
      }

      // Fetch listings from Supabase
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          *,
          seller:profiles!listings_seller_id_fkey(
            full_name,
            avatar_url,
            verified,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (!listingsError && listingsData && listingsData.length > 0) {
        const formattedListings: Listing[] = listingsData.map((item: any) => ({
          id: item.id,
          sellerId: item.seller_id,
          sellerName: item.seller?.full_name || 'Unknown Seller',
          sellerPhone: item.seller?.phone_number || '+234 800 000 0000',
          sellerAvatar: item.seller?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          sellerVerified: item.seller?.verified || false,
          title: item.title,
          description: item.description,
          price: item.price,
          category: item.category,
          condition: item.condition,
          location: item.seller?.location || item.location,
          status: item.status,
          images: item.images || ['https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100'],
          createdAt: item.created_at,
          viewsCount: item.views_count || 0,
        }));
        setListings(formattedListings);
      }

      setLoading(false);
    };

    initializeData();
  }, []);

  const login = useCallback((email: string, role: 'buyer' | 'seller') => {
    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 6),
      email,
      fullName: email.split('@')[0].replace('.', ' '),
      phoneNumber: '+234 803 000 1234',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role,
      verified: true,
      memberSince: 'Just now',
      location: 'Ogbomoso, Oyo State',
    };
    setUser(newUser);
    localStorage.setItem('sealify_user', JSON.stringify(newUser));
    toast.success(`Welcome back, ${newUser.fullName}!`);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sealify_user');
    toast.info('Logged out successfully');
  }, []);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const updated = [id, ...filtered].slice(0, 6);
      localStorage.setItem('sealify_recent', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleSaveListing = useCallback((id: string) => {
    setSavedListingIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('sealify_saved', JSON.stringify(updated));
      toast.success(exists ? 'Removed from saved items' : 'Saved to your favorites!');
      return updated;
    });
  }, []);

  const isSaved = useCallback((id: string) => savedListingIds.includes(id), [savedListingIds]);

  const toggleCompareListing = useCallback((id: string) => {
    setCompareListingIds((prev) => {
      if (prev.includes(id)) {
        toast.info('Removed from comparison');
        const updated = prev.filter((item) => item !== id);
        localStorage.setItem('sealify_compare', JSON.stringify(updated));
        return updated;
      } else {
        if (prev.length >= 3) {
          toast.error('You can compare a maximum of 3 items at once');
          return prev;
        }
        toast.success('Added item to comparison matrix!');
        const updated = [...prev, id];
        localStorage.setItem('sealify_compare', JSON.stringify(updated));
        return updated;
      }
    });
  }, []);

  const isInCompare = useCallback((id: string) => compareListingIds.includes(id), [compareListingIds]);

  const clearCompare = useCallback(() => {
    setCompareListingIds([]);
    localStorage.removeItem('sealify_compare');
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const setActiveCategory = useCallback((category: Category | 'All') => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const createListing = useCallback(async (
    data: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'sellerPhone' | 'sellerAvatar' | 'sellerVerified' | 'status' | 'createdAt' | 'viewsCount'>
  ) => {
    const currentSeller = user || {
      id: 'usr_guest',
      fullName: 'Verified Seller',
      phoneNumber: '+234 800 000 0000',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      verified: true
    };

    const formattedListing: Listing = {
      id: 'lst_' + Date.now(),
      sellerId: currentSeller.id,
      sellerName: currentSeller.fullName,
      sellerPhone: currentSeller.phoneNumber,
      sellerAvatar: currentSeller.avatarUrl,
      sellerVerified: currentSeller.verified || true,
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      condition: data.condition,
      location: data.location,
      status: 'active',
      images: data.images,
      createdAt: 'Just now',
      viewsCount: 1,
    };

    setListings((prev) => [formattedListing, ...prev]);
    toast.success('Your ad was posted successfully!');
  }, [user]);

  const updateListing = useCallback(async (id: string, updatedData: Partial<Listing>) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );
    toast.success('Listing details updated successfully!');
  }, []);

  const deleteListing = useCallback(async (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    toast.success('Listing deleted');
  }, []);

  const markAsSold = useCallback(async (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'sold' as const } : l))
    );
    toast.success('Listing marked as sold!');
  }, []);

  const sendMessage = useCallback(async (listingId: string, receiverId: string, content: string) => {
    const sender = user || {
      id: 'usr_me',
      fullName: 'You',
    };

    const listing = listings.find((l) => l.id === listingId);
    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      senderId: sender.id,
      receiverId,
      listingId,
      content,
      createdAt: 'Just now',
    };

    setConversations((prev) => {
      const existingIndex = prev.findIndex((c) => c.listingId === listingId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: content,
          lastMessageTime: 'Just now',
          messages: [...updated[existingIndex].messages, newMsg],
        };
        return updated;
      } else {
        const newConv: Conversation = {
          id: 'conv_' + Date.now(),
          listingId,
          listingTitle: listing?.title || 'Classified Ad',
          listingImage: listing?.images[0] || '',
          listingPrice: listing?.price || 0,
          otherUser: {
            id: receiverId,
            name: listing?.sellerName || 'Seller',
            avatar: listing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          },
          lastMessage: content,
          lastMessageTime: 'Just now',
          messages: [newMsg],
        };
        return [newConv, ...prev];
      }
    });

    toast.success('Message sent to seller!');
  }, [user, listings]);

  const getConversationByListing = useCallback((listingId: string) => {
    return conversations.find((c) => c.listingId === listingId);
  }, [conversations]);

  return (
    <SealifyContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        login,
        logout,
        listings,
        savedListingIds,
        recentlyViewedIds,
        compareListingIds,
        addRecentlyViewed,
        toggleSaveListing,
        isSaved,
        toggleCompareListing,
        isInCompare,
        clearCompare,
        filters,
        setFilters,
        resetFilters,
        createListing,
        updateListing,
        deleteListing,
        markAsSold,
        conversations,
        sendMessage,
        getConversationByListing,
        activeCategory: filters.category,
        setActiveCategory,
        loading,
      }}
    >
      {children}
    </SealifyContext.Provider>
  );
};

export const useSealify = () => {
  const context = useContext(SealifyContext);
  if (!context) throw new Error('useSealify must be used within SealifyProvider');
  return context;
};
</dyad-file>

<dyad-write path="src/components/Navbar.tsx" description="Update Navbar with user dropdown menu linking to Settings, My Ads, and Logout">
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import AuthModal from './AuthModal';
import SqlSchemaViewer from './SqlSchemaViewer';
import SafetyTipsModal from './SafetyTipsModal';
import CompareModal from './CompareModal';
import SavedAlertsModal from './SavedAlertsModal';
import NotificationCenter from './NotificationCenter';
import { 
  ShieldCheck, 
  PlusCircle, 
  Heart, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  Database,
  Search,
  Menu,
  X,
  HelpCircle,
  Scale,
  Bell,
  Info,
  Mail,
  BookOpen,
  Settings as SettingsIcon
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    logout, 
    savedListingIds, 
    conversations, 
    filters, 
    setFilters, 
    listings,
    compareListingIds
  } = useSealify();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0);

  const liveSearchResults = filters.searchQuery.trim()
    ? listings.filter((l) =>
        l.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        l.category.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(filters.searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
    setIsSearchFocused(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="bg-emerald-600 text-xs py-1 px-4 text-center font-medium flex justify-between items-center max-w-7xl mx-auto">
          <button 
            onClick={() => setIsSafetyModalOpen(true)}
            className="flex items-center gap-1 hover:underline text-white font-semibold cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sealify Safety Protocol — Read Buyer & Seller Tips</span>
          </button>

          <button 
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-1 hover:underline text-emerald-100 font-semibold cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>View DB Schema</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.png"
              alt="Sealify Logo"
              className="w-10 h-10 object-contain rounded-xl group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                Sealify
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold -mt-1">Verified Classifieds</p>
            </div>
          </Link>

          <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-lg relative">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search phones, cars, apartments..."
                value={filters.searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={handleSearchChange}
                className="w-full bg-slate-800 text-white pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {isSearchFocused && liveSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase px-3 py-1">Matching Listings</p>
                {liveSearchResults.map((item) => (
                  <Link
                    key={item.id}
                    to={`/listing/${item.id}`}
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-xl transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-xs text-white truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-400">{item.category} • {item.location}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-emerald-400 shrink-0">₦{item.price.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="relative p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Compare Listings Matrix"
            >
              <Scale className="w-5 h-5" />
              {compareListingIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {compareListingIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsSafetyModalOpen(true)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Safety Guidelines"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <Link
              to="/saved"
              className="relative p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Saved Ads"
            >
              <Heart className="w-5 h-5" />
              {savedListingIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {savedListingIds.length}
                </span>
              )}
            </Link>

            <Link
              to="/faq"
              className="relative p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="FAQ"
            >
              <Info className="w-5 h-5" />
              <span className="hidden sm:inline text-slate-300">FAQ</span>
            </Link>

            <Link
              to="/help-center"
              className="relative p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Help Center"
            >
              <BookOpen className="w-5 h-5" />
              <span className="hidden sm:inline text-slate-300">Help</span>
            </Link>

            <Link
              to="/contact"
              className="relative p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Contact Support"
            >
              <Mail className="w-5 h-5" />
              <span className="hidden sm:inline text-slate-300">Contact</span>
            </Link>

            <Link
              to="/messages"
              className="relative p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
              {totalUnreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-400 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalUnreadMessages}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                <Link
                  to="/my-ads"
                  className="flex items-center gap-2 hover:bg-slate-800 p-1.5 rounded-lg text-sm text-slate-200"
                >
                  <img
                    src={user?.avatarUrl}
                    alt={user?.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="font-semibold text-xs leading-none">{user?.fullName}</p>
                    <p className="text-[10px] text-emerald-400 font-medium capitalize">{user?.role}</p>
                  </div>
                </Link>

                <Link
                  to="/settings"
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Account Settings"
                >
                  <SettingsIcon className="w-4 h-4" />
                </Link>

                <button
                  onClick={logout}
                  className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 hover:text-emerald-400 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login / Sign Up</span>
              </button>
            )}

            <Link
              to="/post-ad"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>SELL NOW</span>
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search phone, cars, flats..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-slate-800 text-white pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-sm">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCompareModalOpen(true);
                }}
                className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg text-slate-200"
              >
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Compare Matrix ({compareListingIds.length})</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAlertsModalOpen(true);
                }}
                className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg text-slate-200"
              >
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Saved Alerts</span>
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex justify-between items-center bg-slate-800 p-3 rounded-xl">
                <Link
                  to="/my-ads"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <img src={user?.avatarUrl} className="w-8 h-8 rounded-full border border-emerald-400" />
                  <div>
                    <p className="font-bold text-sm">{user?.fullName}</p>
                    <p className="text-xs text-emerald-400">My Listings & Profile</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs text-slate-300 font-semibold"
                  >
                    Settings
                  </Link>
                  <button onClick={logout} className="text-xs text-red-400 font-semibold">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2 bg-slate-800 text-emerald-400 font-bold rounded-xl text-sm text-center"
              >
                Login / Register
              </button>
            )}

            <Link
              to="/post-ad"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full py-2.5 bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-center shadow"
            >
              + POST AN AD
            </Link>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <SafetyTipsModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
      <CompareModal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} />
      <SavedAlertsModal isOpen={isAlertsModalOpen} onClose={() => setIsAlertsModalOpen(false)} />
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

export default Navbar;