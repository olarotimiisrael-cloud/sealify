import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import AdminEditUserModal from '../components/AdminEditUserModal';
import { UserProfile, Listing, UserStatus, VerificationBadgeType } from '../types/sealify';
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

type AdminTab = 'analytics' | 'finance' | 'users' | 'listings' | 'requests' | 'security' | 'settings' | 'superuser' | 'disputes' | 'buyer_requests' | 'reviews';

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
    user, isAdmin, logout, categories,
    listings, allUsers, updateUser, deleteUser, updateListing, deleteListing, toggleFeaturedListing, markAsSold,
    promotionPaymentRequests, processPromotionPaymentRequest, promotionPlans, updatePromotionPlanRate,
    safeSpots, addSafeSpot, deleteSafeSpot,
    verificationRequests, processVerificationRequest,
    passwordRequests, processPasswordRequest,
    auditLogs, analytics, exportDatabaseBackup,
    disputeCases, processDisputeCase, intrusionLogs,
    systemConfig, updateSystemConfig, siteSettings, updateSiteSettings,
    adminPin, updateAdminPin, announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
    reports, processReport, buyerRequests, deleteBuyerRequest, reviews, deleteReview, loading
  } = useSealify();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');

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

  // New Safe Spot Form State
  const [spotName, setSpotName] = useState('');
  const [spotZone, setSpotZone] = useState<'LAUTECH Area' | 'Takie / Center' | 'Sabo Market Zone' | 'Police HQ'>('LAUTECH Area');
  const [spotCategory, setSpotCategory] = useState<'Police Safe Zone' | 'Public Library' | 'Shopping Mall' | 'Café'>('Police Safe Zone');
  const [spotAddress, setSpotAddress] = useState('');

  // Treasury Rates
  const [customRates, setPlanRates] = useState<Record<number, number>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const superuserAvatarRef = useRef<HTMLInputElement>(null);
  const superuserBannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && (!isAdmin || !user)) {
      navigate('/admin/login');
    }
  }, [isAdmin, user, loading, navigate]);

  useEffect(() => {
    if (user && activeTab === 'superuser') {
       setAdminFullName(user.fullName || '');
       setAdminEmail(user.email || '');
       setAdminPhone(user.phoneNumber || '');
       setAdminBusinessName(user.businessName || '');
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
    if (promotionPlans) {
      const rateMap: Record<number, number> = {};
      promotionPlans.forEach(p => { rateMap[p.months] = p.rate; });
      setPlanRates(rateMap);
    }
  }, [user, activeTab, siteSettings, promotionPlans]);

  if (loading || !isAdmin || !user) return null;

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

  const handleAddSafeSpotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotName.trim() || !spotAddress.trim()) return;
    addSafeSpot({
      name: spotName.trim(),
      zone: spotZone,
      category: spotCategory,
      address: spotAddress.trim(),
      distance: '0.5 km',
      hours: '8:00 AM - 6:00 PM',
      cctvVerified: true,
    });
    setSpotName('');
    setSpotAddress('');
    toast.success('New Verified Safe Spot added!');
  };

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
      ]
    },
    {
      groupName: "Treasury & Security",
      items: [
        { id: 'finance', label: 'Treasury & Revenue', description: 'Ad promotion plans & payment receipts', icon: Wallet, badge: pendingPromoPay.length, color: 'text-emerald-400', badgeBg: 'bg-emerald-500 text-slate-950' },
        { id: 'security', label: 'Threat Logs', description: 'Forensic intrusion detection and device logs', icon: ShieldAlert, badge: intrusionLogs.length, color: 'text-rose-500', badgeBg: 'bg-rose-600 text-white' },
        { id: 'settings', label: 'Global Metadata & Link Previews', description: 'Social share preview cards, logo & site config', icon: SettingsIcon, color: 'text-cyan-400' },
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
            <div className="w-14 h-14 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-0.5 relative shadow-2xl overflow-hidden flex items-center justify-center">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover rounded-xl" alt="Root" />
              ) : (
                <User className="w-6 h-6 text-slate-500" />
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-slate-950 rounded-lg flex items-center justify-center border-2 border-slate-900 z-20">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase">{user.fullName} Admin Panel</h1>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Node: OGB-NPF-72 • Godmode Active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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
                            <div className="min-w-0">
                               <p className="text-xs font-bold truncate">{item.label}</p>
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

        {/* Dynamic Module Content Views */}
        <div className="space-y-6">
          
          {/* TAB 1: Analytics */}
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
                  <p className="text-3xl font-black text-blue-400">₦{analytics.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500">User Growth</span>
                  <p className="text-3xl font-black text-amber-400">{analytics.userGrowth}%</p>
                </div>
              </div>

              {/* Category distribution */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Category Breakdown</h3>
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

          {/* TAB 2: Superuser Master Identity */}
          {activeTab === 'superuser' && (
            <form onSubmit={handleSaveSuperuserProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-xs border-b border-slate-800 pb-4">
                <Fingerprint className="w-5 h-5" />
                <span>Configure Master Admin Profile & Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase">Admin Full Name *</label>
                  <input type="text" required value={adminFullName} onChange={e => setAdminFullName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-semibold" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase">Official Business / Brand Name</label>
                  <input type="text" value={adminBusinessName} onChange={e => setAdminBusinessName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-semibold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase">Admin Email *</label>
                  <input type="email" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase">Phone Number</label>
                  <input type="tel" value={adminPhone} onChange={e => setAdminPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase">Verification Badge</label>
                  <select value={adminBadge} onChange={e => setAdminBadge(e.target.value as VerificationBadgeType)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-emerald-500">
                    <option value="premium">Premium Verified</option>
                    <option value="business">Verified Business</option>
                    <option value="individual">Verified ID</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase">Update Admin PIN</label>
                  <input type="text" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder={`Current PIN: ${adminPin}`} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <button type="submit" className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/10 transition-all flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4" /> Save Admin Profile
              </button>
            </form>
          )}

          {/* TAB 3: Users */}
          {activeTab === 'users' && (
             <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-slate-800 bg-slate-950/30 flex justify-between items-center gap-4">
                  <h3 className="font-black text-white text-lg uppercase">Account Directory ({filteredUsers.length})</h3>
                  <div className="relative w-64">
                     <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                     <input type="text" placeholder="Filter users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none" />
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-xs text-left">
                   <thead className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase border-b border-slate-800">
                     <tr>
                        <th className="px-6 py-4">Identity</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                     {filteredUsers.map((u) => (
                       <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               {u.avatarUrl ? <img src={u.avatarUrl} className="w-8 h-8 rounded-xl object-cover" alt="" /> : <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center"><User className="w-4 h-4" /></div>}
                               <div><p className="font-bold text-white">{u.fullName}</p><p className="opacity-50 font-mono text-[9px]">{u.email}</p></div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] uppercase ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{u.status || 'active'}</span>
                         </td>
                         <td className="px-6 py-4 font-black uppercase text-[9px] text-slate-400">{u.role}</td>
                         <td className="px-6 py-4 text-right">
                            <button onClick={() => setEditingUser(u)} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}

          {/* TAB 4: Ad Inventory */}
          {activeTab === 'listings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800 bg-slate-950/30 flex justify-between items-center gap-4">
                <h3 className="font-black text-white text-lg uppercase">Ad Inventory ({filteredListings.length})</h3>
                <div className="relative w-64">
                   <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                   <input type="text" placeholder="Filter ads..." value={listingSearch} onChange={e => setListingSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Item Title</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Seller</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredListings.map((ad) => (
                      <tr key={ad.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                          <img src={ad.images[0]} className="w-10 h-10 rounded-xl object-cover bg-slate-950 shrink-0" alt="" />
                          <span className="truncate max-w-xs">{ad.title}</span>
                        </td>
                        <td className="px-6 py-4 font-black text-emerald-400">₦{ad.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-300">{ad.sellerName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] uppercase ${ad.featured ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>
                            {ad.featured ? 'Top Ad Boost' : 'Standard'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => toggleFeaturedListing(ad.id)} className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-400 rounded-lg" title="Toggle Boost"><Crown className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteListing(ad.id)} className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg" title="Delete Ad"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Buyer Want Board */}
          {activeTab === 'buyer_requests' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="font-black text-white text-lg uppercase">Buyer Want Board Requests ({buyerRequests.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buyerRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-sm">{req.title}</h4>
                      <button onClick={() => deleteBuyerRequest(req.id)} className="text-rose-400 hover:text-rose-300 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <p className="text-xs text-slate-400">{req.description}</p>
                    <p className="text-xs text-emerald-400 font-bold">Max Budget: ₦{req.maxBudget.toLocaleString()} • {req.userName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Reviews */}
          {activeTab === 'reviews' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="font-black text-white text-lg uppercase">Seller Reviews Moderation ({reviews.length})</h3>
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-white text-xs">{rev.buyerName} → Rated Seller ({rev.rating}/5 ⭐)</p>
                      <p className="text-xs text-slate-300 italic mt-1">"{rev.comment}"</p>
                    </div>
                    <button onClick={() => deleteReview(rev.id)} className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Action Queue (Requests) */}
          {activeTab === 'requests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-black text-white text-base uppercase flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-amber-400" /> Verification Submissions ({pendingVerifications.length})
                </h3>
                <div className="space-y-3">
                  {pendingVerifications.map((req) => (
                    <div key={req.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                      <p className="font-bold text-white">{req.userName} ({req.userEmail})</p>
                      <p className="text-slate-400">Type: <span className="text-emerald-400 font-bold uppercase">{req.type}</span> • Doc: {req.docNumber}</p>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => processVerificationRequest(req.id, 'approved')} className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-[10px]">Approve</button>
                        <button onClick={() => processVerificationRequest(req.id, 'rejected')} className="px-3 py-1.5 bg-rose-500 text-white font-black rounded-lg text-[10px]">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-black text-white text-base uppercase flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-400" /> Password Resets ({pendingPasswords.length})
                </h3>
                <div className="space-y-3">
                  {pendingPasswords.map((req) => (
                    <div key={req.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                      <p className="font-bold text-white">{req.userName} ({req.userEmail})</p>
                      <p className="text-slate-400">NIN: <span className="font-mono text-emerald-400">{req.nin}</span> • Reason: {req.reason}</p>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => processPasswordRequest(req.id, 'approved')} className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-[10px]">Approve</button>
                        <button onClick={() => processPasswordRequest(req.id, 'declined')} className="px-3 py-1.5 bg-rose-500 text-white font-black rounded-lg text-[10px]">Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Dispute & Safe Spot Center */}
          {activeTab === 'disputes' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-black text-white text-lg uppercase flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-rose-400" /> Active Trade Disputes ({disputeCases.length})
                </h3>
                <div className="space-y-3">
                  {disputeCases.map((disp) => (
                    <div key={disp.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                      <div className="flex justify-between">
                        <strong className="text-white text-sm">{disp.itemTitle}</strong>
                        <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded">{disp.status}</span>
                      </div>
                      <p className="text-slate-400">Claimant: {disp.userEmail} vs. {disp.counterparty}</p>
                      <p className="text-slate-300 italic">"{disp.details}"</p>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => processDisputeCase(disp.id, 'resolved')} className="px-3 py-1 bg-emerald-500 text-slate-950 font-black rounded-lg text-[10px]">Mark Resolved</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safe Spots Config */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-black text-white text-lg uppercase flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" /> Verified Safe Meetup Spots ({safeSpots.length})
                </h3>

                <form onSubmit={handleAddSafeSpotSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <input type="text" required placeholder="Spot Name" value={spotName} onChange={e => setSpotName(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                  <input type="text" required placeholder="Address" value={spotAddress} onChange={e => setSpotAddress(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                  <select value={spotZone} onChange={e => setSpotZone(e.target.value as any)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
                    <option value="LAUTECH Area">LAUTECH Area</option>
                    <option value="Takie / Center">Takie / Center</option>
                    <option value="Sabo Market Zone">Sabo Market Zone</option>
                    <option value="Police HQ">Police HQ</option>
                  </select>
                  <button type="submit" className="bg-emerald-500 text-slate-950 font-black rounded-xl text-xs py-2">Add Safe Spot</button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {safeSpots.map((spot) => (
                    <div key={spot.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white">{spot.name}</p>
                        <p className="text-[10px] text-slate-400">{spot.address} • {spot.zone}</p>
                      </div>
                      <button onClick={() => deleteSafeSpot(spot.id)} className="text-rose-400 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: Treasury & Finance */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-black text-white text-lg uppercase flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" /> Promotion Payments Queue ({promotionPaymentRequests.length})
                </h3>
                <div className="space-y-3">
                  {promotionPaymentRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center gap-4 text-xs">
                      <div>
                        <p className="font-bold text-white">₦{req.amount.toLocaleString()} ({req.planName})</p>
                        <p className="text-slate-400">User: {req.userId} • Ad: {req.listingId}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => processPromotionPaymentRequest(req.id, 'approved')} className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-[10px]">Approve</button>
                        <button onClick={() => processPromotionPaymentRequest(req.id, 'rejected')} className="px-3 py-1.5 bg-rose-500 text-white font-black rounded-lg text-[10px]">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: Threat Logs */}
          {activeTab === 'security' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="font-black text-white text-lg uppercase flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" /> Threat Logs & Intrusion Detection ({intrusionLogs.length})
              </h3>
              <div className="space-y-2">
                {intrusionLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs font-mono">
                    <div>
                      <p className="font-bold text-rose-400">{log.attemptedEmail}</p>
                      <p className="text-[10px] text-slate-500">{log.timestamp}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded text-[10px] font-bold uppercase">{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: Settings */}
          {activeTab === 'settings' && (
            <form onSubmit={handleUpdateSiteMetadata} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-xs border-b border-slate-800 pb-4">
                <Globe className="w-4 h-4" />
                <span>Marketplace Global Metadata & SEO Settings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <label className="font-bold text-slate-300 uppercase">Marketplace Instance Name</label>
                  <input type="text" value={metaSiteName} onChange={e => setMetaSiteName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-slate-300 uppercase">Support Contact Email</label>
                  <input type="email" value={metaContactEmail} onChange={e => setMetaContactEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-bold text-slate-300 uppercase">Global Social Description (SEO)</label>
                <textarea rows={3} value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <button type="submit" className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/10 transition-all flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4" /> Save Global Config
              </button>
            </form>
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