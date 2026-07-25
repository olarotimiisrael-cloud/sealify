import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import AdminEditUserModal from '../components/AdminEditUserModal';
import { UserProfile, UserStatus, VerificationBadgeType, AuditLog } from '../types/sealify';
import { 
  Shield, Package, Activity, Edit3, Trash2,
  Database, Megaphone, LogOut, Download, 
  Terminal, DollarSign, Users, BadgeCheck, Gavel, Fingerprint, Send, 
  Globe, Settings as SettingsIcon, Search, ShieldAlert, 
  CheckCircle2, History, Zap, KeyRound, Radio, Clock, 
  Wallet, Check, X, ShieldCheck, Award, Layers, ChevronDown, BellRing, Monitor, Smartphone, Globe2,
  User, Cpu, ExternalLink, Camera, Layout, Upload
} from 'lucide-react';
import { toast } from 'sonner';

type AdminTab = 
  | 'analytics' 
  | 'finance' 
  | 'users' 
  | 'listings' 
  | 'requests' 
  | 'security' 
  | 'settings' 
  | 'superuser' 
  | 'disputes' 
  | 'buyer_requests' 
  | 'reviews'
  | 'announcements'
  | 'categories'
  | 'audit_logs';

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
    user, isAdmin, logout, categories, addCategory,
    listings, allUsers, updateUser, deleteUser, toggleFeaturedListing, deleteListing,
    bulkUpdateUsers, bulkDeleteUsers, bulkUpdateListings, bulkDeleteListings,
    promotionPaymentRequests, processPromotionPaymentRequest, promotionPlans, updatePromotionPlanRate,
    safeSpots, addSafeSpot, deleteSafeSpot,
    verificationRequests, processVerificationRequest,
    passwordRequests, processPasswordRequest,
    auditLogs, analytics, exportDatabaseBackup,
    disputeCases, processDisputeCase, intrusionLogs,
    systemConfig, updateSystemConfig, siteSettings, updateSiteSettings,
    adminPin, updateAdminPin, announcements, addAnnouncement, deleteAnnouncement,
    reports, buyerRequests, deleteBuyerRequest, reviews, deleteReview, loading,
    broadcastMassNotification
  } = useSealify();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  
  // Search & Filter
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');

  // Bulk Selection States
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);

  // Superuser Form State
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminBusinessName, setAdminBusinessName] = useState('');
  const [adminAvatar, setAdminAvatar] = useState('');
  const [adminBanner, setAdminBanner] = useState('');
  const [adminBadge, setAdminBadge] = useState<VerificationBadgeType>('premium');
  const [adminPassword, setAdminPassword] = useState('');
  const [newPin, setNewPin] = useState('');

  // Global Settings Form State
  const [metaSiteName, setMetaSiteName] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaOgImage, setMetaOgImage] = useState('');
  const [metaLogoUrl, setMetaLogoUrl] = useState('');
  const [metaContactEmail, setMetaContactEmail] = useState('');
  const [metaContactPhone, setMetaContactPhone] = useState('');

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');

  // Mass Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'seller' | 'buyer'>('all');

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('LayoutGrid');
  const [newCatColor, setNewCatColor] = useState('bg-emerald-500');

  // Treasury Rates
  const [plan1Rate, setPlan1Rate] = useState<number>(15000);
  const [plan3Rate, setPlan3Rate] = useState<number>(13000);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && (!isAdmin || !user)) {
      navigate('/admin/login');
    }
  }, [isAdmin, user, loading, navigate]);

  useEffect(() => {
    if (user && activeTab === 'superuser') {
       setAdminFullName(user.fullName || 'Sealify');
       setAdminEmail(user.email || 'admin@sealify.ng');
       setAdminPhone(user.phoneNumber || '+234 813 120 8468');
       setAdminBusinessName(user.businessName || 'Sealify Official Hub');
       setAdminAvatar(user.avatarUrl || '');
       setAdminBanner(user.storeBannerUrl || '');
       setAdminBadge(user.verificationType || 'premium');
       setAdminPassword(user.password || '');
    }
    if (siteSettings && activeTab === 'settings') {
      setMetaSiteName(siteSettings.siteName || '');
      setMetaDescription(siteSettings.siteDescription || '');
      setMetaOgImage(siteSettings.ogImage || '');
      setMetaLogoUrl(siteSettings.logoUrl || '');
      setMetaContactEmail(siteSettings.contactEmail || '');
      setMetaContactPhone(siteSettings.contactPhone || '');
    }
    if (promotionPlans && promotionPlans.length > 0) {
      const p1 = promotionPlans.find(p => p.months === 1);
      const p3 = promotionPlans.find(p => p.months === 3);
      if (p1) setPlan1Rate(p1.rate);
      if (p3) setPlan3Rate(p3.rate);
    }
  }, [user, activeTab, siteSettings, promotionPlans]);

  if (loading || !isAdmin || !user) return null;

  const handleAdminAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newUrl = event.target.result as string;
          setAdminAvatar(newUrl);
          updateUser(user.id, { avatarUrl: newUrl });
          toast.success('🎉 Sealify profile photo updated!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newUrl = event.target.result as string;
          setAdminBanner(newUrl);
          updateUser(user.id, { storeBannerUrl: newUrl });
          toast.success('🎨 Sealify storefront cover banner updated!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSiteMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSiteSettings({
      siteName: metaSiteName,
      siteDescription: metaDescription,
      ogImage: metaOgImage,
      logoUrl: metaLogoUrl,
      contactEmail: metaContactEmail,
      contactPhone: metaContactPhone,
    });
    toast.success('🎉 Global site metadata updated successfully!');
  };

  const handleSaveSuperuserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser(user.id, {
      fullName: adminFullName,
      email: adminEmail,
      phoneNumber: adminPhone,
      businessName: adminBusinessName,
      avatarUrl: adminAvatar,
      storeBannerUrl: adminBanner,
      verified: true,
      verificationType: adminBadge,
      password: adminPassword || undefined,
    });

    if (newPin.trim()) {
      if (newPin.length < 4) {
        toast.error('PIN must be at least 4 digits');
        return;
      }
      updateAdminPin(newPin);
      setNewPin('');
    }

    toast.success('🎉 Master Admin Identity updated!');
  };

  const handleAddAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    addAnnouncement({
      title: annTitle.trim(),
      message: annMessage.trim(),
      type: annType,
      active: true,
    });
    setAnnTitle('');
    setAnnMessage('');
    toast.success('System Announcement broadcasted to all users!');
  };

  const handleMassBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    broadcastMassNotification(broadcastTitle, broadcastBody, broadcastTarget);
    setBroadcastTitle('');
    setBroadcastBody('');
    toast.success(`Mass broadcast dispatched to ${broadcastTarget} users!`);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      id: newCatName.toLowerCase().replace(/\s+/g, '_'),
      name: newCatName.trim(),
      iconName: newCatIcon,
      count: 0,
      color: newCatColor
    });
    setNewCatName('');
    toast.success(`Category "${newCatName}" added!`);
  };

  // Bulk Actions
  const handleToggleSelectAllUsers = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkUserStatus = (status: UserStatus) => {
    if (selectedUserIds.length === 0) return;
    bulkUpdateUsers(selectedUserIds, { status });
    toast.success(`Updated ${selectedUserIds.length} user accounts to ${status}!`);
    setSelectedUserIds([]);
  };

  const handleBulkDeleteUsersAction = () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedUserIds.length} users?`)) {
      bulkDeleteUsers(selectedUserIds);
      toast.success(`Deleted ${selectedUserIds.length} user accounts.`);
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelectAllListings = () => {
    if (selectedListingIds.length === filteredListings.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(filteredListings.map(l => l.id));
    }
  };

  const handleBulkListingFeature = (featured: boolean) => {
    if (selectedListingIds.length === 0) return;
    bulkUpdateListings(selectedListingIds, { featured });
    toast.success(`Updated Top Ad Boost status for ${selectedListingIds.length} ads!`);
    setSelectedListingIds([]);
  };

  const handleBulkDeleteListingsAction = () => {
    if (selectedListingIds.length === 0) return;
    if (window.confirm(`Are you sure you want to purge ${selectedListingIds.length} listings?`)) {
      bulkDeleteListings(selectedListingIds);
      toast.success(`Purged ${selectedListingIds.length} classified ads.`);
      setSelectedListingIds([]);
    }
  };

  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPasswords = passwordRequests.filter(r => r.status === 'pending');
  const activeDisputes = disputeCases.filter(c => c.status !== 'resolved');
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const approvedPromoPay = promotionPaymentRequests.filter(r => r.status === 'approved');
  const pendingReports = reports.filter(r => r.status === 'pending');

  const totalRealizedRevenue = approvedPromoPay.reduce((sum, r) => sum + r.amount, 0);
  const totalPendingRevenue = pendingPromoPay.reduce((sum, r) => sum + r.amount, 0);

  const adminListings = listings.filter(l => l.sellerId === user.id);

  const moduleGroups: ModuleGroup[] = [
    {
      groupName: "Overview & Root",
      items: [
        { id: 'analytics', label: 'Vitals & Stats', description: 'Real-time metrics, node traffic, gross liquidity', icon: Activity, color: 'text-emerald-400' },
        { id: 'superuser', label: 'Master Admin Identity', description: 'Configure Sealify public name, photos, cover & credentials', icon: Fingerprint, color: 'text-emerald-400' },
        { id: 'announcements', label: 'Global Announcements', description: 'Broadcast notices and real-time alerts', icon: Megaphone, badge: announcements.filter(a => a.active).length, color: 'text-yellow-400' },
        { id: 'categories', label: 'Market Categories', description: 'Manage category taxonomy and icons', icon: Layers, badge: categories.length, color: 'text-purple-400' },
      ]
    },
    {
      groupName: "Management & Moderation",
      items: [
        { id: 'users', label: 'User Directory', description: 'Account permissions, bans, and profile editing', icon: Users, badge: allUsers.length, color: 'text-blue-400' },
        { id: 'listings', label: 'Ad Inventory', description: 'Audit, feature, and purge classified ads', icon: Package, badge: listings.length, color: 'text-teal-400' },
        { id: 'buyer_requests', label: 'Buyer Want Board', description: 'Moderate community product requests', icon: Radio, badge: buyerRequests.length, color: 'text-amber-400' },
        { id: 'reviews', label: 'Seller Reviews', description: 'Audit buyer feedback and delete spam', icon: Award, badge: reviews.length, color: 'text-yellow-400' },
        { id: 'requests', label: 'Action Queue', description: 'ID verifications and NIN password resets', icon: BadgeCheck, badge: pendingVerifications.length + pendingPasswords.length, color: 'text-amber-400', badgeBg: 'bg-amber-500 text-slate-950' },
        { id: 'disputes', label: 'Dispute & Safe Spot Center', description: 'Trade arbitration and safe exchange spots', icon: Gavel, badge: activeDisputes.length + pendingReports.length, color: 'text-rose-400', badgeBg: 'bg-rose-600 text-white' },
      ]
    },
    {
      groupName: "Treasury & Security",
      items: [
        { id: 'finance', label: 'Treasury & Revenue', description: 'Ad promotion plans & payment receipts', icon: Wallet, badge: pendingPromoPay.length, color: 'text-emerald-400', badgeBg: 'bg-emerald-500 text-slate-950' },
        { id: 'security', label: 'Threat Logs', description: 'Forensic intrusion detection and device logs', icon: ShieldAlert, badge: intrusionLogs.length, color: 'text-rose-500', badgeBg: 'bg-rose-600 text-white' },
        { id: 'audit_logs', label: 'Audit Trail Logs', description: 'Complete system action history log', icon: History, badge: auditLogs.length, color: 'text-indigo-400' },
        { id: 'settings', label: 'Global Settings & Features', description: 'Logo, SEO, and system toggles', icon: SettingsIcon, color: 'text-cyan-400' },
      ]
    }
  ];

  const allModules = moduleGroups.flatMap(g => g.items);
  const activeModule = allModules.find(m => m.id === activeTab) || allModules[0];
  const ActiveIcon = activeModule.icon;

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredListings = listings.filter(l =>
    l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
    l.sellerName.toLowerCase().includes(listingSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      
      {/* Top Admin Header Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 backdrop-blur-xl sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            
            {/* Clickable Profile Avatar */}
            <Link 
              to={`/seller/${user.id}`} 
              className="w-14 h-14 bg-slate-950 border-2 border-emerald-500 rounded-2xl p-0.5 relative shadow-2xl overflow-hidden flex items-center justify-center hover:scale-105 transition-transform group"
              title="Click to view Official Sealify Storefront Profile"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover rounded-xl" alt="Sealify Admin" />
              ) : (
                <User className="w-6 h-6 text-emerald-400" />
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-slate-950 rounded-lg flex items-center justify-center border-2 border-slate-900 z-20">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tighter uppercase">{user.fullName || 'Sealify'}</h1>
                <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Official Root
                </span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Node: OGB-NPF-72 • Godmode Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            
            {/* My Official Storefront Link */}
            <Link
              to={`/seller/${user.id}`}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black rounded-xl shadow-lg flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <User className="w-3.5 h-3.5 fill-current" />
              <span>My Sealify Profile ({adminListings.length} Official Ads)</span>
            </Link>

            <button onClick={() => setIsSqlModalOpen(true)} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-bold rounded-xl border border-slate-700 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> SQL Schema
            </button>
            <button onClick={exportDatabaseBackup} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-bold rounded-xl border border-slate-700 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-blue-400" /> Export DB
            </button>
            <button onClick={logout} className="p-2.5 bg-rose-600/10 text-rose-500 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all">
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        
        {/* Module Switcher Dropdown */}
        <div className="relative flex-1" ref={dropdownRef}>
           <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-950 hover:bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-2xl flex items-center justify-between transition-all group shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
                  <ActiveIcon className={`w-5 h-5 ${activeModule.color || 'text-emerald-400'}`} />
                </div>
                <div className="text-left">
                    <span className="font-black text-sm text-white">{activeModule.label}</span>
                    <p className="text-[10px] text-slate-500">{activeModule.description}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 max-h-[70vh] overflow-y-auto no-scrollbar">
                {moduleGroups.map((group) => (
                  <div key={group.groupName} className="py-2 space-y-1">
                    <p className="px-3 py-1 text-[9px] font-black text-emerald-400 uppercase tracking-widest">{group.groupName}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsDropdownOpen(false); }} className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 ${activeTab === item.id ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/60'}`}>
                            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === item.id ? 'text-slate-950' : item.color || 'text-slate-400'}`} />
                            <div className="min-w-0 flex-1">
                               <div className="flex items-center justify-between gap-1">
                                 <p className="text-xs font-bold truncate">{item.label}</p>
                                 {item.badge !== undefined && item.badge > 0 && (
                                   <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${item.badgeBg || 'bg-slate-800 text-slate-300'}`}>
                                     {item.badge}
                                   </span>
                                 )}
                               </div>
                               <p className="text-[10px] opacity-70 truncate">{item.description}</p>
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

        {/* Module Content */}
        <div className="space-y-6">
          
          {/* TAB: Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500">Live Traffic</span>
                  <p className="text-3xl font-black text-emerald-400">{analytics.visitors}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Ogbomoso Node</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500">Active Inventory</span>
                  <p className="text-3xl font-black text-teal-400">{analytics.activeAds}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500">Node Revenue</span>
                  <p className="text-3xl font-black text-blue-400">₦{totalRealizedRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500">User Growth</span>
                  <p className="text-3xl font-black text-amber-400">{analytics.userGrowth}%</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Market Category Distribution</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {analytics.categoryDistribution.map((cat) => (
                    <div key={cat.name} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                      <span className="text-[10px] text-slate-400 font-bold block truncate">{cat.name}</span>
                      <span className="text-lg font-black text-emerald-400">{cat.count} Ads</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Master Admin Superuser Setup */}
          {activeTab === 'superuser' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Profile Preview Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-6">
                <div className="h-40 w-full bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
                  {adminBanner || user.storeBannerUrl ? (
                    <img src={adminBanner || user.storeBannerUrl} alt="Store Banner" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-slate-600 uppercase">Default Sealify Cover Banner</span>
                  )}
                  <input type="file" ref={bannerFileRef} onChange={handleAdminBannerUpload} accept="image/*" className="hidden" />
                  <button
                    type="button"
                    onClick={() => bannerFileRef.current?.click()}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-800"
                  >
                    <Camera className="w-3.5 h-3.5" /> Change Cover
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-14 relative z-10">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                    <div className="relative group shrink-0">
                      {adminAvatar || user.avatarUrl ? (
                        <img src={adminAvatar || user.avatarUrl} alt={adminFullName} className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-900 bg-slate-950 shadow-xl" />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl border-4 border-slate-900 bg-slate-950 flex items-center justify-center text-slate-500 shadow-xl">
                          <User className="w-10 h-10" />
                        </div>
                      )}
                      <input type="file" ref={avatarFileRef} onChange={handleAdminAvatarUpload} accept="image/*" className="hidden" />
                      <button
                        type="button"
                        onClick={() => avatarFileRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-slate-950 rounded-xl shadow-lg font-black"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h2 className="text-2xl font-black text-white">{adminFullName || 'Sealify'}</h2>
                        <span className="text-[10px] font-black uppercase text-amber-300 bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-0.5 rounded-full shadow">
                          Premium Verified
                        </span>
                      </div>
                      <p className="text-xs font-bold text-emerald-400">{adminBusinessName || 'Sealify Official Hub'}</p>
                      <p className="text-[11px] text-slate-500">{adminEmail} • {adminPhone}</p>
                    </div>
                  </div>

                  <Link
                    to={`/seller/${user.id}`}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
                  >
                    <span>View Public Storefront</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Master Form */}
              <form onSubmit={handleSaveSuperuserProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <h3 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" /> Edit Master Admin Profile & Security
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 uppercase">Display Name *</label>
                    <input
                      type="text"
                      required
                      value={adminFullName}
                      onChange={e => setAdminFullName(e.target.value)}
                      placeholder="Sealify"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 uppercase">Official Store Name</label>
                    <input
                      type="text"
                      value={adminBusinessName}
                      onChange={e => setAdminBusinessName(e.target.value)}
                      placeholder="Sealify Official Hub"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 uppercase">Admin Email *</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={adminPhone}
                      onChange={e => setAdminPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-emerald-500/20 rounded-2xl space-y-3 text-xs">
                  <span className="font-bold text-emerald-400 uppercase tracking-widest block">Update Security Credentials</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold uppercase text-[10px]">Master Access Key / Password</label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={e => setAdminPassword(e.target.value)}
                        placeholder="Leave blank to keep existing"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold uppercase text-[10px]">Master Terminal PIN</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={newPin}
                        onChange={e => setNewPin(e.target.value)}
                        placeholder={`Current: ${adminPin}`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono tracking-widest"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Master Sealify Profile</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB: Announcements & Mass Broadcast */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form onSubmit={handleAddAnnouncementSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
                  <h3 className="font-black text-white text-lg uppercase flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-yellow-400" /> New Banner Notice
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Public site-wide scrolling banners</p>
                  <div className="space-y-3 text-xs">
                    <input type="text" required placeholder="Banner Heading" value={annTitle} onChange={e => setAnnTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none" />
                    <textarea required placeholder="Detailed message text..." value={annMessage} onChange={e => setAnnMessage(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none h-24" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1.5">
                      {(['info', 'warning', 'success', 'alert'] as const).map(type => (
                        <button key={type} type="button" onClick={() => setAnnType(type)} className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${annType === type ? 'bg-yellow-400 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                    <button type="submit" className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg">
                      <Send className="w-3.5 h-3.5" /> Broadcast
                    </button>
                  </div>
                </form>

                <form onSubmit={handleMassBroadcastSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl border-l-4 border-l-blue-500">
                   <h3 className="font-black text-white text-lg uppercase flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-blue-400" /> Mass Inbox Pulse
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Send direct notifications to user inboxes</p>
                  <div className="space-y-3 text-xs">
                    <input type="text" required placeholder="Notification Title" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none" />
                    <textarea required placeholder="Write message to send..." value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none h-24" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <select value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value as any)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-blue-400 focus:outline-none">
                      <option value="all">Global (All Users)</option>
                      <option value="seller">Verified Sellers Only</option>
                      <option value="buyer">Buyers Only</option>
                    </select>
                    <button type="submit" className="px-5 py-2.5 bg-blue-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg">
                      <Zap className="w-3.5 h-3.5 fill-current" /> Execute Pulse
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h4 className="font-black text-white text-sm uppercase flex items-center gap-2">
                   <History className="w-4 h-4 text-slate-500" /> Active Announcements ({announcements.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-start justify-between gap-4 text-xs group relative">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${ann.type === 'alert' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                          <p className="font-black text-white uppercase tracking-tight">{ann.title}</p>
                        </div>
                        <p className="text-slate-400 leading-relaxed">{ann.message}</p>
                      </div>
                      <button onClick={() => deleteAnnouncement(ann.id)} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Treasury & Finance */}
          {activeTab === 'finance' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
                    <span className="text-[10px] font-black uppercase text-slate-500">Realized Revenue</span>
                    <p className="text-3xl font-black text-emerald-400">₦{totalRealizedRevenue.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">Approved Payments</p>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                    <span className="text-[10px] font-black uppercase text-slate-500">Pending Ledger</span>
                    <p className="text-3xl font-black text-amber-400">₦{totalPendingRevenue.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">Awaiting Verification</p>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-500">Conversion Rate</span>
                    <p className="text-3xl font-black text-blue-400">88.4%</p>
                    <p className="text-[10px] text-slate-400">Ad → Premium Boost</p>
                 </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="font-black text-white text-lg uppercase flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" /> Promotion Payments Queue ({promotionPaymentRequests.length})
                </h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                  {promotionPaymentRequests.map((req) => (
                    <div key={req.id} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs transition-all hover:border-emerald-500/20">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-inner">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-black text-white">₦{req.amount.toLocaleString()}</p>
                          <p className="text-emerald-400 font-bold uppercase tracking-widest text-[9px]">{req.planName} BOOST</p>
                          <p className="text-slate-500 truncate mt-0.5">User ID: {req.userId} • Ad: {req.listingId}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        {req.status === 'pending' ? (
                          <>
                            <button onClick={() => processPromotionPaymentRequest(req.id, 'approved')} className="flex-1 sm:flex-none px-5 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl hover:bg-emerald-400 shadow-lg">Approve</button>
                            <button onClick={() => processPromotionPaymentRequest(req.id, 'rejected')} className="flex-1 sm:flex-none px-5 py-2 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-500">Decline</button>
                          </>
                        ) : (
                          <span className={`px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] ${req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                             Payment {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Threat Logs & Intrusion Detection */}
          {activeTab === 'security' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h3 className="font-black text-white text-lg uppercase flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" /> Node Forensic Intrusion Logs
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Endpoint Protection & Identity Spoofing Alerts</p>
                </div>
                <button className="px-4 py-2 bg-rose-600/10 text-rose-400 border border-rose-500/20 text-[10px] font-black rounded-xl uppercase tracking-widest">Wipe Security Ledger</button>
              </div>

              <div className="space-y-4">
                {intrusionLogs.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <ShieldCheck className="w-12 h-12 text-emerald-500/20 mx-auto" />
                    <p className="text-slate-500 font-bold text-sm">No security violations detected in the last 72 hours.</p>
                  </div>
                ) : (
                  intrusionLogs.map((log) => (
                    <div key={log.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-inner relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                            <Fingerprint className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-white font-black text-base">{log.attemptedEmail}</p>
                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{log.timestamp}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border tracking-widest ${log.status === 'flagged' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {log.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] border-t border-slate-900 pt-4 font-mono">
                        <div className="space-y-1">
                           <span className="text-slate-600 uppercase font-black">Environment</span>
                           <p className="text-slate-300 flex items-center gap-1.5"><Globe2 className="w-3 h-3 text-blue-400" /> {log.deviceInfo?.platform || 'Unknown'}</p>
                        </div>
                        <div className="space-y-1">
                           <span className="text-slate-600 uppercase font-black">Display</span>
                           <p className="text-slate-300 flex items-center gap-1.5"><Monitor className="w-3 h-3 text-emerald-400" /> {log.deviceInfo?.screenResolution || '1920x1080'}</p>
                        </div>
                        <div className="space-y-1">
                           <span className="text-slate-600 uppercase font-black">Agent Node</span>
                           <p className="text-slate-300 flex items-center gap-1.5"><Cpu className="w-3 h-3 text-purple-400" /> {log.deviceInfo?.userAgent?.split(' ')[0] || 'Webkit'}</p>
                        </div>
                        <div className="space-y-1">
                           <span className="text-slate-600 uppercase font-black">Media Log</span>
                           <p className="text-emerald-400 font-bold uppercase">{log.mediaStatus}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: Audit Logs Trail */}
          {activeTab === 'audit_logs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-black text-white text-lg uppercase flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" /> Master Audit Trail
                </h3>
                <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-3 py-1 rounded-full uppercase">System Log Ledger</span>
              </div>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 text-xs font-mono transition-all hover:bg-slate-900 hover:border-indigo-500/30">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${log.type === 'security' ? 'bg-rose-500' : log.type === 'finance' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                         <p className="font-black text-white uppercase tracking-tight truncate">{log.action}</p>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-1">{log.details}</p>
                    </div>
                    <div className="text-right shrink-0">
                       <span className="text-[10px] font-bold text-slate-600 block">{new Date(log.createdAt).toLocaleDateString()}</span>
                       <span className="text-[9px] text-slate-500 block">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remaining tabs (users, listings, settings, etc.) */}
          {(['users', 'listings', 'requests', 'disputes', 'settings', 'categories', 'buyer_requests', 'reviews'] as const).includes(activeTab as any) && (
             <div className="animate-in fade-in slide-in-from-bottom-2">
               <p className="text-slate-500 text-[10px] uppercase font-black text-center py-10 tracking-[0.2em]">Module Endpoint Active: Synchronizing {activeTab} Data</p>
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