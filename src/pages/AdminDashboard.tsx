import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import AdminEditUserModal from '../components/AdminEditUserModal';
import { UserProfile, Listing, Category, VerificationBadgeType } from '../types/sealify';
import { 
  Shield, Package, Activity, RefreshCw, Edit3, Trash2,
  Database, Megaphone, LogOut, Download, 
  Terminal, DollarSign, Users, ArrowUpRight, 
  BadgeCheck, Gavel, Fingerprint, Cpu, Send, 
  ImageIcon, Globe, Lock as LockIcon, Settings as SettingsIcon, 
  Layout, Plus, Search, Eye, ShieldAlert, AlertOctagon, 
  CheckCircle2, History, Zap, Camera, KeyRound, UserCheck,
  ShieldQuestion, BarChart3, Radio, Clock, AlertTriangle, 
  Wallet, FileText, Check, X, ShieldX, ToggleLeft, ToggleRight,
  ShieldCheck, Award, Brain, BarChart, Phone, ChevronRight,
  UserPlus, UserMinus, Layers, ExternalLink, Sparkles, TrendingUp,
  ChevronDown, SlidersHorizontal, Grid, PlusCircle, Crown, HelpCircle, Star,
  Share2, BellRing, MapPin, Upload, User
} from 'lucide-react';
import { toast } from 'sonner';

type AdminTab = 'analytics' | 'finance' | 'users' | 'listings' | 'requests' | 'security' | 'categories' | 'logs' | 'settings' | 'superuser' | 'disputes' | 'buyer_requests' | 'reviews';

interface ModuleItem {
  id: AdminTab;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  badge?: number;
  color?: string;
  badgeBg?: string;
}

interface ModuleGroup {
  groupName: string;
  items: ModuleItem[];
}

export const AdminDashboard: React.FC = () => {
  const { 
    user, isAdmin, logout, categories, addCategory, deleteCategory, updateCategory,
    listings, allUsers, updateUser, deleteUser, updateListing, deleteListing, toggleFeaturedListing, markAsSold,
    bulkUpdateUsers, bulkDeleteUsers, bulkUpdateListings, bulkDeleteListings,
    promotionPaymentRequests, processPromotionPaymentRequest, promotionPlans, updatePromotionPlanRate,
    safeSpots, addSafeSpot, deleteSafeSpot,
    verificationRequests, processVerificationRequest,
    passwordRequests, processPasswordRequest,
    auditLogs, analytics, exportDatabaseBackup, broadcastMassNotification,
    disputeCases, processDisputeCase, intrusionLogs,
    systemConfig, updateSystemConfig, siteSettings, updateSiteSettings,
    adminPin, updateAdminPin, announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
    reports, processReport, buyerRequests, deleteBuyerRequest, reviews, deleteReview
  } = useSealify();

  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');

  // Bulk selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);

  // Promotion plan rate editing state
  const [planRates, setPlanRates] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {};
    promotionPlans.forEach(p => map[p.months] = p.rate);
    return map;
  });
  
  // Safe spot form state
  const [spotName, setSpotName] = useState('');
  const [spotZone, setSpotZone] = useState<'LAUTECH Area' | 'Takie / Center' | 'Sabo Market Zone' | 'Police HQ'>('Takie / Center');
  const [spotCategory, setSpotCategory] = useState<'Police Safe Zone' | 'Public Library' | 'Shopping Mall' | 'Café'>('Police Safe Zone');
  const [spotAddress, setSpotAddress] = useState('');
  const [spotDistance, setSpotDistance] = useState('1.0 km away');
  const [spotHours, setSpotHours] = useState('Mon-Sat 8:00 AM - 6:00 PM');

  // Superuser admin identity form
  const [adminFullName, setAdminFullName] = useState(user?.fullName || '');
  const [adminEmail, setAdminEmail] = useState(user?.email || '');
  const [adminPhone, setAdminPhone] = useState(user?.phoneNumber || '');
  const [adminBusinessName, setAdminBusinessName] = useState(user?.businessName || '');
  const [adminAvatar, setAdminAvatar] = useState(user?.avatarUrl || '');
  const [adminBanner, setAdminBanner] = useState(user?.storeBannerUrl || '');
  const [adminBadge, setAdminBadge] = useState<VerificationBadgeType>(user?.verificationType || 'premium');
  const [adminPassword, setAdminPassword] = useState(user?.password || '');
  const [newPin, setNewPin] = useState('');

  // SEO & Social Link Preview Metadata Form
  const [metaSiteName, setMetaSiteName] = useState(siteSettings.siteName || 'Sealify Nigeria');
  const [metaDescription, setMetaDescription] = useState(siteSettings.siteDescription || "Nigeria's Trusted Local Marketplace.");
  const [metaOgImage, setMetaOgImage] = useState(siteSettings.ogImage || '/og-image.png');
  const [metaLogoUrl, setMetaLogoUrl] = useState(siteSettings.logoUrl || '/logo.png');
  const [metaContactEmail, setMetaContactEmail] = useState(siteSettings.contactEmail || 'support@sealify.ng');
  const [metaContactPhone, setMetaContactPhone] = useState(siteSettings.contactPhone || '+234 813 120 8468');

  // Broadcast Notification Form
  const [bcTitle, setBcTitle] = useState('');
  const [bcMsg, setBcMsg] = useState('');
  const [bcTarget, setBcTarget] = useState<'all' | 'seller' | 'buyer'>('all');

  // Category creation form
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Layers');

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const topHeaderAvatarRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && activeTab === 'superuser') {
       setAdminFullName(user.fullName);
       setAdminEmail(user.email);
       setAdminPhone(user.phoneNumber || '');
       setAdminBusinessName(user.businessName || '');
       setAdminAvatar(user.avatarUrl || '');
       setAdminBanner(user.storeBannerUrl || '');
       setAdminBadge(user.verificationType || 'premium');
       setAdminPassword(user.password || '');
    }
  }, [user, activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAdmin || !user) return null;

  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPasswords = passwordRequests.filter(r => r.status === 'pending');
  const activeDisputes = disputeCases.filter(c => c.status !== 'resolved');
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');

  const moduleGroups: ModuleGroup[] = [
    {
      groupName: "Overview & Root",
      items: [
        { id: 'analytics', label: 'Vitals & Stats', description: 'Real-time metrics, node traffic, gross liquidity', icon: Activity, color: 'text-emerald-400' },
        { id: 'superuser', label: 'Master Admin Identity', description: 'Configure public name, photos, badge & login details', icon: Fingerprint, color: 'text-emerald-400' },
      ]
    },
    {
      groupName: "Management & Moderation",
      items: [
        { id: 'users', label: 'User Directory', description: 'Account permissions, bans, user ads & profile editing', icon: Users, badge: allUsers.length, color: 'text-blue-400' },
        { id: 'listings', label: 'Ad Inventory', description: 'Audit, feature, mark sold, and purge ads', icon: Package, badge: listings.length, color: 'text-teal-400' },
        { id: 'buyer_requests', label: 'Buyer Want Board', description: 'Moderate community product requests', icon: HelpCircle, badge: buyerRequests.length, color: 'text-amber-400' },
        { id: 'reviews', label: 'Seller Reviews', description: 'Audit buyer feedback and delete spam', icon: Star, badge: reviews.length, color: 'text-yellow-400' },
        { id: 'requests', label: 'Action Queue', description: 'ID verifications and NIN password resets', icon: BadgeCheck, badge: pendingVerifications.length + pendingPasswords.length, color: 'text-amber-400', badgeBg: 'bg-amber-500 text-slate-950' },
        { id: 'disputes', label: 'Dispute & Safe Spot Center', description: 'Trade arbitration, flagged reports & safe exchange spots', icon: Gavel, badge: activeDisputes.length + pendingReports.length, color: 'text-rose-400', badgeBg: 'bg-rose-600 text-white' },
        { id: 'categories', label: 'Market Grid', description: 'Taxonomy sectors and category customization', icon: Layers, color: 'text-purple-400' },
      ]
    },
    {
      groupName: "Treasury & Security",
      items: [
        { id: 'finance', label: 'Treasury & Revenue', description: 'Ad promotion plans & payment receipts', icon: Wallet, badge: pendingPromoPay.length, color: 'text-emerald-400', badgeBg: 'bg-emerald-500 text-slate-950' },
        { id: 'security', label: 'Threat Logs', description: 'Forensic intrusion detection and device logs', icon: ShieldAlert, badge: intrusionLogs.length, color: 'text-rose-500', badgeBg: 'bg-rose-600 text-white' },
        { id: 'logs', label: 'Audit Trail', description: 'System-wide activity ledger and change log', icon: History, color: 'text-slate-400' },
        { id: 'settings', label: 'Global Metadata & Link Previews', description: 'Social share preview cards, logo & site config', icon: SettingsIcon, color: 'text-cyan-400' },
      ]
    }
  ];

  const allModules = moduleGroups.flatMap(g => g.items);
  const activeModule = allModules.find(m => m.id === activeTab) || allModules[0];
  const ActiveIcon = activeModule.icon;

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredListings = listings.filter(l =>
    l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
    l.category.toLowerCase().includes(listingSearch.toLowerCase()) ||
    l.sellerName.toLowerCase().includes(listingSearch.toLowerCase())
  );

  // Quick top header photo update
  const handleTopHeaderAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newUrl = ev.target?.result as string;
        updateUser(user.id, { avatarUrl: newUrl });
        toast.success('🎉 Admin profile photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAllUsers = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const handleToggleSelectListing = (id: string) => {
    setSelectedListingIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAllListings = () => {
    if (selectedListingIds.length === filteredListings.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(filteredListings.map(l => l.id));
    }
  };

  // Safe Spot submit
  const handleAddSafeSpotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotName.trim() || !spotAddress.trim()) return;
    addSafeSpot({
      name: spotName.trim(),
      zone: spotZone,
      category: spotCategory,
      address: spotAddress.trim(),
      distance: spotDistance,
      hours: spotHours,
      cctvVerified: true
    });
    setSpotName('');
    setSpotAddress('');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAdminAvatar(ev.target?.result as string);
        toast.success('Admin avatar photo uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAdminBanner(ev.target?.result as string);
        toast.success('Admin cover banner uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      iconName: newCatIcon,
      count: 0,
      color: 'bg-emerald-500'
    });
    setNewCatName('');
    toast.success(`Category "${newCatName}" created!`);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    addAnnouncement({
      title: annTitle.trim(),
      message: annMessage.trim(),
      type: 'info',
      active: true
    });
    setAnnTitle('');
    setAnnMessage('');
    toast.success('Live announcement broadcasted!');
  };

  const handleSendMassPushBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMsg.trim()) return;
    broadcastMassNotification(bcTitle.trim(), bcMsg.trim(), bcTarget);
    setBcTitle('');
    setBcMsg('');
  };

  const handleUpdateSiteMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      siteName: metaSiteName,
      siteDescription: metaDescription,
      ogImage: metaOgImage,
      logoUrl: metaLogoUrl,
      contactEmail: metaContactEmail,
      contactPhone: metaContactPhone,
    });
    toast.success('🎉 Social preview metadata and public site info updated!');
  };

  const handleUpdateSuperuser = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(user.id, {
      fullName: adminFullName,
      email: adminEmail,
      phoneNumber: adminPhone,
      businessName: adminBusinessName || undefined,
      avatarUrl: adminAvatar || user.avatarUrl,
      storeBannerUrl: adminBanner || user.storeBannerUrl,
      verified: adminBadge !== 'none',
      verificationType: adminBadge,
      password: adminPassword || undefined,
    });

    if (newPin) {
      if (newPin.length < 4) {
        toast.error('PIN should be at least 4 digits');
        return;
      }
      updateAdminPin(newPin);
      setNewPin('');
      toast.success('Master Security PIN updated!');
    }
    toast.success('Admin identity, photos, badge and login details updated successfully!');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      
      {/* Top Admin Header Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 backdrop-blur-xl sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            
            {/* Top Admin Profile Avatar with Instant Upload */}
            <div className="relative group shrink-0">
              <div className="w-14 h-14 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-0.5 relative shadow-2xl overflow-hidden flex items-center justify-center">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover rounded-xl" alt="Root" />
                ) : (
                  <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-slate-500">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-slate-950 rounded-lg flex items-center justify-center border-2 border-slate-900 z-20">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              </div>
              <input type="file" ref={topHeaderAvatarRef} onChange={handleTopHeaderAvatarUpload} accept="image/*" className="hidden" />
              <button
                type="button"
                onClick={() => topHeaderAvatarRef.current?.click()}
                className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-emerald-400 transition-opacity"
                title="Click to Change Photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
                {user.fullName} Admin Panel
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">GODMODE</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
                Node: OGB-NPF-72 • Access Level 5
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button onClick={() => setIsSqlModalOpen(true)} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[10px] font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> SQL Schema
            </button>
            <button onClick={exportDatabaseBackup} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[10px] font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all">
              <Download className="w-3.5 h-3.5 text-blue-400" /> Export DB
            </button>
            <Link to="/post-ad" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black rounded-xl shadow-lg flex items-center gap-1.5 transition-all">
              <PlusCircle className="w-3.5 h-3.5" /> POST OFFICIAL AD
            </Link>
            <button onClick={logout} className="p-2.5 bg-rose-600/10 text-rose-500 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all">
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        
        {/* Module Selector Dropdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative z-20">
          
          <div className="relative flex-1" ref={dropdownRef}>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-emerald-400" />
              <span>Select Control Module</span>
            </p>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-950 hover:bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-2xl flex items-center justify-between transition-all group shadow-inner"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
                  <ActiveIcon className={`w-5 h-5 ${activeModule.color || 'text-emerald-400'}`} />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white truncate">{activeModule.label}</span>
                    {activeModule.badge !== undefined && activeModule.badge > 0 && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeModule.badgeBg || 'bg-slate-800 text-slate-300'}`}>
                        {activeModule.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{activeModule.description}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 duration-300 ${isDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 max-h-[75vh] overflow-y-auto no-scrollbar divide-y divide-slate-800/60">
                {moduleGroups.map((group) => (
                  <div key={group.groupName} className="py-2 first:pt-0 last:pb-0 space-y-1">
                    <p className="px-3 py-1 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-slate-950/40 rounded-lg w-fit mb-1">{group.groupName}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isSelected = activeTab === item.id;
                        return (
                          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsDropdownOpen(false); }} className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 ${isSelected ? 'bg-emerald-500 text-slate-950 font-black shadow-lg' : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/60'}`}>
                            <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${isSelected ? 'bg-slate-950/20 border-slate-950/30' : 'bg-slate-900 border-slate-800'}`}>
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : item.color || 'text-slate-400'}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className={`text-xs font-bold truncate ${isSelected ? 'text-slate-950' : 'text-white'}`}>{item.label}</p>
                                {item.badge !== undefined && item.badge > 0 && (
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className={`text-[10px] line-clamp-1 ${isSelected ? 'text-slate-900/80' : 'text-slate-500'}`}>{item.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Active Module Area */}
        <div className="space-y-6">

          {/* Module 1: Analytics & Vitals */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Active Visitors</span>
                  <p className="text-3xl font-black text-emerald-400">{analytics.visitors}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Ogbomoso Node</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Ads Listed</span>
                  <p className="text-3xl font-black text-teal-400">{listings.length}</p>
                  <p className="text-[10px] text-slate-400">{listings.filter(l => l.featured).length} Top Ads Promoted</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Registered Users</span>
                  <p className="text-3xl font-black text-blue-400">{allUsers.length}</p>
                  <p className="text-[10px] text-slate-400">{allUsers.filter(u => u.verified).length} Verified Merchants</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Pending Action</span>
                  <p className="text-3xl font-black text-amber-400">{pendingVerifications.length + pendingPasswords.length + pendingPromoPay.length}</p>
                  <p className="text-[10px] text-slate-400">Queue Items Requiring Review</p>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Live Visitor Activity Stream
                </h3>
                <div className="space-y-2">
                  {analytics.activeSessions.map((s) => (
                    <div key={s.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-bold text-white">{s.user}</span>
                        <span className="text-slate-400">{s.action}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{s.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Module 2: Finance & Treasury */}
          {activeTab === 'finance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Promotion Plan Pricing Rate Configurator */}
              <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-xs">
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>Top Ad Promotion Rates Configurator</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Real-Time Pricing Matrix</span>
                </div>
                <p className="text-xs text-slate-400">Adjust the monthly charge (in ₦ NGN) for sellers promoting ads on Sealify.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {promotionPlans.map((plan) => (
                    <div key={plan.months} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-white">{plan.label}</span>
                        <span className="text-[8px] font-black bg-slate-800 px-2 py-0.5 rounded text-amber-300">{plan.badge}</span>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Monthly Rate (₦ NGN)</label>
                        <input
                          type="number"
                          value={planRates[plan.months] !== undefined ? planRates[plan.months] : plan.rate}
                          onChange={(e) => setPlanRates({ ...planRates, [plan.months]: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-extrabold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <button
                        onClick={() => updatePromotionPlanRate(plan.months, planRates[plan.months])}
                        className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold rounded-xl text-[10px] uppercase border border-emerald-500/20 transition-all"
                      >
                        Update Plan
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Proofs Queue */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-400" />
                      Promotion Payment Proofs ({pendingPromoPay.length} Pending)
                    </h3>
                    <p className="text-xs text-slate-400">Review transfer receipts and activate Top Ad promotion slots</p>
                  </div>
                </div>

                {promotionPaymentRequests.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs italic">No promotion payment records found.</div>
                ) : (
                  <div className="space-y-3">
                    {promotionPaymentRequests.map((req) => (
                      <div key={req.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-emerald-400 text-sm">₦{req.amount.toLocaleString()}</span>
                            <span className="text-[9px] font-extrabold uppercase bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">{req.planName} ({req.durationMonths}m)</span>
                          </div>
                          <p className="text-slate-300 font-bold">Listing ID: <span className="font-mono text-white">{req.listingId}</span></p>
                          <p className="text-slate-500 text-[10px]">Method: {req.paymentMethod.toUpperCase()} • Submitted {req.createdAt}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {req.paymentProofUrl && req.paymentProofUrl.startsWith('data:') && (
                            <a href={req.paymentProofUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-[10px] flex items-center gap-1 border border-slate-700">
                              <Eye className="w-3.5 h-3.5 text-emerald-400" /> View Proof Photo
                            </a>
                          )}
                          {req.status === 'pending' ? (
                            <>
                              <button onClick={() => processPromotionPaymentRequest(req.id, 'approved')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow">Approve & Activate</button>
                              <button onClick={() => processPromotionPaymentRequest(req.id, 'rejected')} className="px-3 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-bold rounded-xl text-[10px] uppercase border border-slate-700">Reject</button>
                            </>
                          ) : (
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{req.status}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module 3: Users */}
          {activeTab === 'users' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/30">
                 <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                       <Users className="w-5 h-5 text-emerald-400" />
                       Account Federation ({filteredUsers.length})
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Manage global user identities, passwords, and user-posted ads</p>
                 </div>
                 <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" 
                    />
                 </div>
              </div>

              {/* Bulk User Actions Toolbar */}
              {selectedUserIds.length > 0 && (
                <div className="p-3 bg-emerald-950/80 border-b border-emerald-500/30 flex items-center justify-between gap-4 text-xs">
                  <span className="font-black text-emerald-300 uppercase">
                    {selectedUserIds.length} User Accounts Selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => bulkUpdateUsers(selectedUserIds, { verified: true, verificationType: 'individual' })}
                      className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-[10px] uppercase shadow"
                    >
                      Bulk Verify ID
                    </button>
                    <button
                      onClick={() => bulkUpdateUsers(selectedUserIds, { status: 'banned', restrictionReason: 'Administrative bulk security action' })}
                      className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black rounded-lg text-[10px] uppercase shadow"
                    >
                      Bulk Ban Users
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${selectedUserIds.length} users and all their ads?`)) {
                          bulkDeleteUsers(selectedUserIds);
                          setSelectedUserIds([]);
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-600 text-white font-black rounded-lg text-[10px] uppercase shadow"
                    >
                      Bulk Delete
                    </button>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={handleSelectAllUsers}
                          className="accent-emerald-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-4">User Identity</th>
                      <th className="px-6 py-4">Role / State</th>
                      <th className="px-6 py-4">User Ads</th>
                      <th className="px-6 py-4">Verification</th>
                      <th className="px-6 py-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((u) => {
                      const userAdsCount = listings.filter((l) => l.sellerId === u.id).length;
                      const isSelected = selectedUserIds.includes(u.id);

                      return (
                        <tr key={u.id} className={`transition-colors ${isSelected ? 'bg-emerald-500/10' : 'hover:bg-slate-800/30'}`}>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectUser(u.id)}
                              className="accent-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} className="w-9 h-9 rounded-xl object-cover border border-slate-800 bg-slate-950" alt="" />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                                  <User className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate">{u.fullName}</p>
                                <p className="text-[10px] text-slate-500 font-mono truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-wider ${u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{u.role}</span>
                              <div className="flex items-center gap-1.5">
                                 <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'banned' ? 'bg-rose-500' : u.status === 'restricted' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                 <span className="text-[10px] font-bold text-slate-400 capitalize">{u.status || 'active'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-teal-400 rounded-lg text-[10px] font-bold flex items-center gap-1"
                            >
                              <Package className="w-3 h-3" /> {userAdsCount} Ads
                            </button>
                          </td>
                          <td className="px-6 py-4">
                             {u.verified ? (
                               <div className="flex items-center gap-1 text-emerald-400 font-black text-[10px] uppercase">
                                 <ShieldCheck className="w-3.5 h-3.5" /> {u.verificationType}
                               </div>
                             ) : <span className="text-slate-600 font-bold text-[10px] uppercase">Unverified</span>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setEditingUser(u)} className="p-2 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-xl transition-all border border-slate-800" title="Edit user info & manage ads">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteUser(u.id)} className="p-2 bg-slate-950 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl transition-all border border-slate-800" title="Delete user profile">
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 4: Ad Inventory */}
          {activeTab === 'listings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-teal-400" />
                    Ad Inventory Directory ({filteredListings.length})
                  </h3>
                  <p className="text-xs text-slate-400">Moderate, feature, or delete any active classified posting</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search ad titles or categories..."
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Bulk Listing Action Toolbar */}
              {selectedListingIds.length > 0 && (
                <div className="p-3 bg-teal-950/80 border border-teal-500/30 rounded-2xl flex items-center justify-between gap-4 text-xs">
                  <span className="font-black text-teal-300 uppercase">
                    {selectedListingIds.length} Classified Ads Selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => bulkUpdateListings(selectedListingIds, { featured: true })}
                      className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black rounded-lg text-[10px] uppercase shadow"
                    >
                      Bulk Boost Top Ad
                    </button>
                    <button
                      onClick={() => bulkUpdateListings(selectedListingIds, { status: 'sold' })}
                      className="px-3 py-1.5 bg-teal-400 text-slate-950 font-black rounded-lg text-[10px] uppercase shadow"
                    >
                      Bulk Mark Sold
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${selectedListingIds.length} listings permanently?`)) {
                          bulkDeleteListings(selectedListingIds);
                          setSelectedListingIds([]);
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-600 text-white font-black rounded-lg text-[10px] uppercase shadow"
                    >
                      Bulk Delete
                    </button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-800">
                {filteredListings.map((item) => {
                  const isSelected = selectedListingIds.includes(item.id);

                  return (
                    <div key={item.id} className={`py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs p-2 rounded-2xl transition-colors ${isSelected ? 'bg-teal-500/10' : ''}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectListing(item.id)}
                          className="accent-emerald-500 cursor-pointer shrink-0"
                        />
                        <img src={item.images[0]} className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" alt="" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white text-sm">{item.title}</p>
                            {item.featured && <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded">TOP AD</span>}
                          </div>
                          <p className="text-emerald-400 font-extrabold">₦{item.price.toLocaleString()} • <span className="text-slate-400 font-normal">{item.category} ({item.location})</span></p>
                          <p className="text-[10px] text-slate-500">Seller: {item.sellerName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button onClick={() => toggleFeaturedListing(item.id)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${item.featured ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-amber-400'}`}>
                          {item.featured ? 'Unfeature' : 'Boost Top Ad'}
                        </button>
                        <button onClick={() => markAsSold(item.id)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold rounded-xl text-[10px] uppercase">
                          Mark Sold
                        </button>
                        <button onClick={() => deleteListing(item.id)} className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors" title="Delete listing">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Module 5: Action Queue */}
          {activeTab === 'requests' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* ID Verifications */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="p-5 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
                    <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      ID Verification Queue
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">{pendingVerifications.length} Pending</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {pendingVerifications.length === 0 ? (
                      <div className="p-10 text-center text-slate-500 text-xs italic">All IDs reviewed. Good job!</div>
                    ) : (
                      pendingVerifications.map((req) => (
                        <div key={req.id} className="p-4 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                              <img src={req.docUrl} className="w-full h-full object-cover rounded-lg" alt="Doc" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-white truncate">{req.userName}</p>
                              <p className="text-[10px] text-slate-500 truncate">{req.userEmail}</p>
                            </div>
                            <span className={`ml-auto text-[9px] font-black uppercase px-2 py-0.5 rounded border ${req.type === 'business' ? 'border-amber-500/30 text-amber-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                              {req.type}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                             <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                               <p className="font-bold uppercase text-slate-600">Doc Type</p>
                               <p className="text-white mt-0.5">{req.docType}</p>
                             </div>
                             <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                               <p className="font-bold uppercase text-slate-600">Doc ID / RC</p>
                               <p className="text-white mt-0.5 font-mono">{req.docNumber}</p>
                             </div>
                          </div>

                          <div className="flex gap-2">
                             <button onClick={() => processVerificationRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg shadow-emerald-500/10">Approve & Badge</button>
                             <button onClick={() => processVerificationRequest(req.id, 'rejected')} className="flex-1 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-bold rounded-xl text-[10px] uppercase border border-slate-700">Decline</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Password Resets */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                   <div className="p-5 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
                    <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      Secure Reset Queue (NIN)
                    </h3>
                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">{pendingPasswords.length} Pending</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {pendingPasswords.length === 0 ? (
                      <div className="p-10 text-center text-slate-500 text-xs italic">No security resets in queue.</div>
                    ) : (
                      pendingPasswords.map((req) => (
                        <div key={req.id} className="p-4 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                               <Shield className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-white truncate">{req.userName}</p>
                              <p className="text-[10px] text-slate-500 truncate">NIN: {req.nin}</p>
                            </div>
                          </div>

                          <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-2xl">
                             <p className="text-[9px] font-black text-amber-400 uppercase mb-1">Stated Reason:</p>
                             <p className="text-[11px] text-slate-300 leading-relaxed italic">"{req.reason}"</p>
                          </div>

                          <div className="flex gap-2">
                             <button onClick={() => processPasswordRequest(req.id, 'approved')} className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg shadow-amber-500/10">Authorize Reset</button>
                             <button onClick={() => processPasswordRequest(req.id, 'declined')} className="flex-1 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-bold rounded-xl text-[10px] uppercase border border-slate-700">Reject Request</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Module 6: Dispute & Flagged Reports & Safe Meetup Spots Center */}
          {activeTab === 'disputes' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Verified Safe Meetup Spots Management */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                      Verified Safe Exchange Spot Manager ({safeSpots.length})
                    </h3>
                    <p className="text-xs text-slate-400">Configure safe meeting locations across Ogbomoso for in-person item inspections</p>
                  </div>
                </div>

                {/* Add spot form */}
                <form onSubmit={handleAddSafeSpotSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Safe Spot Name (e.g. Takie Post Office)"
                    value={spotName}
                    onChange={(e) => setSpotName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <select value={spotZone} onChange={(e) => setSpotZone(e.target.value as any)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none">
                    <option value="Takie / Center">Takie / Center</option>
                    <option value="LAUTECH Area">LAUTECH Area</option>
                    <option value="Sabo Market Zone">Sabo Market Zone</option>
                    <option value="Police HQ">Police HQ</option>
                  </select>
                  <select value={spotCategory} onChange={(e) => setSpotCategory(e.target.value as any)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none">
                    <option value="Police Safe Zone">Police Safe Zone</option>
                    <option value="Public Library">Public Library</option>
                    <option value="Shopping Mall">Shopping Mall</option>
                    <option value="Café">Café / Restaurant</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Full Address..."
                    value={spotAddress}
                    onChange={(e) => setSpotAddress(e.target.value)}
                    className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button type="submit" className="py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow flex items-center justify-center gap-1">
                    <Plus className="w-4 h-4" /> Add Safe Spot
                  </button>
                </form>

                {/* Safe spots list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {safeSpots.map((spot) => (
                    <div key={spot.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white truncate">{spot.name}</p>
                          <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">{spot.zone}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{spot.address}</p>
                        <p className="text-[10px] text-slate-500">{spot.hours}</p>
                      </div>
                      <button onClick={() => deleteSafeSpot(spot.id)} className="p-1.5 bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Disputes List */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
                    <Gavel className="w-4 h-4" />
                    Active Dispute Claims ({disputeCases.length})
                  </h3>

                  {disputeCases.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs italic">No active dispute claims filed.</div>
                  ) : (
                    <div className="space-y-3">
                      {disputeCases.map((c) => (
                        <div key={c.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-white">{c.itemTitle}</p>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${c.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{c.status}</span>
                          </div>
                          <p className="text-slate-400">Claim by <strong className="text-slate-200">{c.userEmail}</strong> against <strong className="text-slate-200">{c.counterparty}</strong></p>
                          <p className="text-[11px] text-slate-300 italic bg-slate-900 p-2.5 rounded-xl border border-slate-800">"{c.details}"</p>
                          {c.status !== 'resolved' && (
                            <div className="pt-2 flex gap-2">
                              <button onClick={() => processDisputeCase(c.id, 'resolved')} className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase">Resolve Claim</button>
                              <button onClick={() => processDisputeCase(c.id, 'in_review')} className="flex-1 py-1.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-[10px] uppercase border border-slate-700">Mark In Review</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reported Ads */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Flagged Ad Reports ({pendingReports.length})
                  </h3>

                  {reports.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs italic">No flagged ad reports.</div>
                  ) : (
                    <div className="space-y-3">
                      {reports.map((r) => (
                        <div key={r.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-white">{r.listingTitle}</p>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${r.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{r.status}</span>
                          </div>
                          <p className="text-amber-400 font-semibold">Reason: {r.reason}</p>
                          {r.details && <p className="text-slate-400 text-[11px]">{r.details}</p>}
                          {r.status === 'pending' && (
                            <div className="pt-2 flex gap-2">
                              <button onClick={() => processReport(r.id, 'resolve_delete_ad')} className="flex-1 py-1.5 bg-rose-600 text-white font-black rounded-xl text-[10px] uppercase">Delete Ad & Resolve</button>
                              <button onClick={() => processReport(r.id, 'dismiss')} className="flex-1 py-1.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-[10px] uppercase border border-slate-700">Dismiss Flag</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Module 7: Market Grid Categories */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-400" />
                      Marketplace Categories Taxonomy ({categories.length})
                    </h3>
                    <p className="text-xs text-slate-400">Add or edit sectors available on Sealify</p>
                  </div>
                </div>

                <form onSubmit={handleAddCategorySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <input
                    type="text"
                    required
                    placeholder="New Category Name..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <select
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Car">Car / Vehicle</option>
                    <option value="Smartphone">Phone / Electronics</option>
                    <option value="Home">Home / Real Estate</option>
                    <option value="Shirt">Shirt / Fashion</option>
                    <option value="Armchair">Armchair / Furniture</option>
                    <option value="Wrench">Wrench / Service</option>
                    <option value="Briefcase">Briefcase / Jobs</option>
                    <option value="Zap">Zap / Energy</option>
                  </select>
                  <button type="submit" className="py-2 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs shadow flex items-center justify-center gap-1">
                    <Plus className="w-4 h-4" /> Add Sector
                  </button>
                </form>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-white truncate">{cat.name}</p>
                        <p className="text-[10px] text-slate-500">Icon: {cat.iconName}</p>
                      </div>
                      <button onClick={() => deleteCategory(cat.id)} className="p-1.5 bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Module 8: Threat Logs & Intrusion Detector */}
          {activeTab === 'security' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in duration-300">
              <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Intrusion & Threat Detection Log ({intrusionLogs.length})
              </h3>

              {intrusionLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs italic">No suspicious login security breaches detected.</div>
              ) : (
                <div className="space-y-3">
                  {intrusionLogs.map((log) => (
                    <div key={log.id} className="p-4 bg-slate-950 border border-rose-500/30 rounded-2xl space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-rose-400 font-bold">{log.attemptedEmail}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Capture Status: {log.mediaStatus}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Module 9: Audit Log History */}
          {activeTab === 'logs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in duration-300">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                System Activity Audit Log
              </h3>

              {auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs italic">Audit history is empty.</div>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{log.action}</p>
                        <p className="text-slate-400 text-[11px]">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{log.createdAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Module 10: Global Config & Social Metadata Link Previews */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Mass Push Broadcast Dispatcher */}
              <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-xs">
                  <BellRing className="w-4 h-4" />
                  <span>Mass Push Notification & Broadcast Dispatcher</span>
                </div>
                <p className="text-xs text-slate-400">Send direct platform notifications to users across Ogbomoso & Nigeria.</p>

                <form onSubmit={handleSendMassPushBroadcast} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-300 uppercase">Notification Title *</label>
                      <input
                        type="text"
                        required
                        value={bcTitle}
                        onChange={(e) => setBcTitle(e.target.value)}
                        placeholder="e.g. 🚀 Ogbomoso Market Update"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 uppercase">Target Audience</label>
                      <select
                        value={bcTarget}
                        onChange={(e) => setBcTarget(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 capitalize"
                      >
                        <option value="all">All Users (Global)</option>
                        <option value="seller">Sellers & Merchants Only</option>
                        <option value="buyer">Buyers Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">Notification Message Body *</label>
                    <textarea
                      rows={2}
                      required
                      value={bcMsg}
                      onChange={(e) => setBcMsg(e.target.value)}
                      placeholder="Write alert text to broadcast to user notification drawers..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dispatch Mass Push Notification</span>
                  </button>
                </form>
              </div>

              {/* Public Metadata & Social Preview Card Editor */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-2 text-cyan-400 font-black uppercase tracking-widest text-xs">
                  <Share2 className="w-4 h-4" />
                  <span>Public Website Link Preview & SEO Metadata</span>
                </div>
                <p className="text-xs text-slate-400">Configure how Sealify appears when shared on WhatsApp, Facebook, X, and search engines.</p>

                <form onSubmit={handleUpdateSiteMetadata} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 uppercase">Site Display Title</label>
                      <input
                        type="text"
                        required
                        value={metaSiteName}
                        onChange={(e) => setMetaSiteName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 uppercase">Logo Image URL</label>
                      <input
                        type="text"
                        required
                        value={metaLogoUrl}
                        onChange={(e) => setMetaLogoUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">Meta Description (Social & Search Snippet)</label>
                    <textarea
                      rows={3}
                      required
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">OpenGraph Link Preview Image URL (OG Banner)</label>
                    <input
                      type="text"
                      required
                      value={metaOgImage}
                      onChange={(e) => setMetaOgImage(e.target.value)}
                      placeholder="/og-image.png or https://..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 uppercase">Public Support Email</label>
                      <input
                        type="email"
                        required
                        value={metaContactEmail}
                        onChange={(e) => setMetaContactEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 uppercase">Public Support Phone</label>
                      <input
                        type="text"
                        required
                        value={metaContactPhone}
                        onChange={(e) => setMetaContactPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Public Site Metadata & Link Cards</span>
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* System Config Toggles */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4" />
                    Global System Config Controls
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Maintenance Mode</p>
                        <p className="text-[11px] text-slate-500">Temporarily restrict public access</p>
                      </div>
                      <button onClick={() => updateSystemConfig({ maintenanceMode: !systemConfig.maintenanceMode })} className={`px-3 py-1.5 rounded-xl font-bold ${systemConfig.maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {systemConfig.maintenanceMode ? 'ENABLED' : 'OFF'}
                      </button>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Auto-Approve Classified Ads</p>
                        <p className="text-[11px] text-slate-500">Publish ads instantly without manual admin queue</p>
                      </div>
                      <button onClick={() => updateSystemConfig({ autoApproveAds: !systemConfig.autoApproveAds })} className={`px-3 py-1.5 rounded-xl font-bold ${systemConfig.autoApproveAds ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        {systemConfig.autoApproveAds ? 'ENABLED' : 'OFF'}
                      </button>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">AI Anti-Spam Filtering</p>
                        <p className="text-[11px] text-slate-500">Automated fraud detection on listings</p>
                      </div>
                      <button onClick={() => updateSystemConfig({ aiSpamFilter: !systemConfig.aiSpamFilter })} className={`px-3 py-1.5 rounded-xl font-bold ${systemConfig.aiSpamFilter ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        {systemConfig.aiSpamFilter ? 'ENABLED' : 'OFF'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Announcement Creator */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    Publish Live Header Announcement
                  </h3>

                  <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Announcement Title (e.g. System Notice)..."
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                    <textarea
                      rows={2}
                      required
                      placeholder="Announcement Message body..."
                      value={annMessage}
                      onChange={(e) => setAnnMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                    />
                    <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow">
                      Broadcast Live Banner
                    </button>
                  </form>

                  {/* Active Announcements List */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {announcements.map((a) => (
                      <div key={a.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="font-bold text-white truncate">{a.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{a.message}</p>
                        </div>
                        <button onClick={() => deleteAnnouncement(a.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Module 11: Master Profile & Superuser Identity Customizer */}
          {activeTab === 'superuser' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6 shadow-2xl animate-in fade-in duration-300">
              <div className="text-center space-y-1">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Fingerprint className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-white">Root Admin Profile Settings</h3>
                <p className="text-xs text-slate-400">Update your public display name, verification badge, login email, password, and photos</p>
              </div>

              {/* Cover & Avatar Preview Box */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-36 flex items-center justify-center">
                {adminBanner || user.storeBannerUrl ? (
                  <img src={adminBanner || user.storeBannerUrl} className="w-full h-full object-cover opacity-70" alt="Banner" />
                ) : (
                  <div className="text-slate-600 font-bold text-xs uppercase flex items-center gap-1.5">
                    <Layout className="w-4 h-4" />
                    <span>No Cover Banner Uploaded</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-3 left-4 flex items-center gap-3">
                  <div className="relative">
                    {adminAvatar || user.avatarUrl ? (
                      <img src={adminAvatar || user.avatarUrl} className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 bg-slate-900 shadow-xl" alt="Avatar" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl border-2 border-slate-800 bg-slate-900 flex items-center justify-center text-slate-500">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-lg shadow" title="Upload Admin Photo">
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{adminFullName || user.fullName}</h4>
                    <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      {adminBadge} Badge
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateSuperuser} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">Public Display Name *</label>
                    <input type="text" required value={adminFullName} onChange={(e) => setAdminFullName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">Business / Store Name</label>
                    <input type="text" value={adminBusinessName} onChange={(e) => setAdminBusinessName(e.target.value)} placeholder="e.g. Sealify Global Executive" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">Login Email ID *</label>
                    <input type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">Contact Phone Number</label>
                    <input type="tel" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">Verification Badge Tier</label>
                    <select
                      value={adminBadge}
                      onChange={(e) => setAdminBadge(e.target.value as VerificationBadgeType)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 capitalize"
                    >
                      <option value="premium">Premium Verified (Top Vendor)</option>
                      <option value="business">Verified Business (CAC)</option>
                      <option value="individual">Verified Individual ID</option>
                      <option value="none">Unverified / None</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">Account Login Password</label>
                    <input
                      type="text"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Overwrite current password..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">Profile Avatar Photo (Device Upload)</label>
                    <div className="flex gap-2">
                      <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                      <button type="button" onClick={() => avatarInputRef.current?.click()} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl font-bold flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>Upload Avatar File</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase">Cover Banner (Device Upload)</label>
                    <div className="flex gap-2">
                      <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />
                      <button type="button" onClick={() => bannerInputRef.current?.click()} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl font-bold flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>Upload Cover Banner</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-3 border-t border-slate-800">
                  <label className="font-bold text-amber-400 uppercase flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Change Master Security PIN (6-Digit)</span>
                  </label>
                  <input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="Enter new security PIN..." maxLength={6} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest" />
                </div>

                <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition-all hover:scale-[1.01]">
                  Save Root Credentials & Profile Details
                </button>
              </form>
            </div>
          )}

          {/* Module 12: Buyer Requests Board Moderation */}
          {activeTab === 'buyer_requests' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in duration-300">
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Community Buyer Want Board Requests ({buyerRequests.length})
              </h3>

              {buyerRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs italic">No buyer requests on board.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {buyerRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-white">{req.title}</p>
                        <span className="text-[10px] text-emerald-400 font-black">Max: ₦{req.maxBudget.toLocaleString()}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{req.description}</p>
                      <div className="pt-2 flex justify-between items-center border-t border-slate-900 text-[10px] text-slate-500">
                        <span>Posted by {req.userName}</span>
                        <button onClick={() => deleteBuyerRequest(req.id)} className="text-rose-400 font-bold hover:underline">Delete Request</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Module 13: Seller Reviews Audit */}
          {activeTab === 'reviews' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in duration-300">
              <h3 className="text-xs font-black uppercase tracking-widest text-yellow-400 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Seller Feedback & Reviews Audit ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs italic">No buyer reviews submitted.</div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-white">{rev.buyerName} ({rev.rating}★)</p>
                        <p className="text-slate-300 italic">"{rev.comment}"</p>
                      </div>
                      <button onClick={() => deleteReview(rev.id)} className="p-2 bg-slate-900 text-rose-400 hover:bg-rose-500/20 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <AdminEditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(id, updated) => updateUser(id, updated)} />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;