import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import AdminEditUserModal from '../components/AdminEditUserModal';
import VerifiedBadge from '../components/VerifiedBadge';
import { UserProfile, UserStatus, VerificationBadgeType, AuditLog, Listing } from '../types/sealify';
import { 
  Shield, Package, Activity, Edit3, Trash2,
  Database, Megaphone, LogOut, Download, 
  Terminal, DollarSign, Users, BadgeCheck, Gavel, Fingerprint, Send, 
  Globe, Settings as SettingsIcon, Search, ShieldAlert, 
  CheckCircle2, History, Zap, KeyRound, Radio, Clock, 
  Wallet, Check, X, ShieldCheck, Award, Layers, ChevronDown, BellRing, Monitor, Smartphone, Globe2,
  User, Cpu, ExternalLink, Camera, Layout, Upload, MoreVertical, Filter, AlertTriangle, Eye,
  Crown, Plus, BarChart3
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
    user, isAdmin, logout, categories, addCategory, deleteCategory,
    listings, allUsers, updateUser, deleteUser, toggleFeaturedListing, deleteListing,
    bulkUpdateUsers, bulkDeleteUsers, bulkUpdateListings, bulkDeleteListings,
    promotionPaymentRequests, processPromotionPaymentRequest, promotionPlans, updatePromotionPlanRate,
    verificationRequests, processVerificationRequest,
    passwordRequests, processPasswordRequest,
    auditLogs, analytics, exportDatabaseBackup,
    disputeCases, processDisputeCase, intrusionLogs,
    systemConfig, updateSystemConfig, siteSettings, updateSiteSettings,
    adminPin, updateAdminPin, announcements, addAnnouncement, deleteAnnouncement, toggleAnnouncement,
    reports, processReport, loading
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

  // Form States
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');

  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('LayoutGrid');
  const [newCatColor, setNewCatColor] = useState('bg-emerald-500');

  // Superuser Form States
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminBusinessName, setAdminBusinessName] = useState('');
  const [adminAvatar, setAdminAvatar] = useState('');
  const [adminBadge, setAdminBadge] = useState<VerificationBadgeType>('premium');
  const [newPin, setNewPin] = useState('');

  // Site Settings Form States
  const [metaSiteName, setMetaSiteName] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaContactEmail, setMetaContactEmail] = useState('');

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
       setAdminBadge(user.verificationType || 'premium');
    }
    if (siteSettings && activeTab === 'settings') {
      setMetaSiteName(siteSettings.siteName || '');
      setMetaDescription(siteSettings.siteDescription || '');
      setMetaContactEmail(siteSettings.contactEmail || '');
    }
  }, [user, activeTab, siteSettings]);

  if (loading || !isAdmin || !user) return null;

  // Filtered Derived States
  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPasswords = passwordRequests.filter(r => r.status === 'pending');
  const activeDisputes = disputeCases.filter(c => c.status !== 'resolved');
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');

  const filteredUsers = allUsers.filter(u => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredListings = listings.filter(l => l.title.toLowerCase().includes(listingSearch.toLowerCase()) || l.sellerName.toLowerCase().includes(listingSearch.toLowerCase()));

  // Handlers
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    addAnnouncement({ title: annTitle, message: annMessage, type: annType, active: true });
    setAnnTitle(''); setAnnMessage('');
    toast.success('Announcement broadcasted!');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({ id: `cat_${Date.now()}`, name: newCatName, iconName: newCatIcon, color: newCatColor, count: 0 });
    setNewCatName('');
    toast.success(`Category "${newCatName}" added to marketplace`);
  };

  const handleBulkUserStatus = (status: UserStatus) => {
    if (selectedUserIds.length === 0) return;
    bulkUpdateUsers(selectedUserIds, { status });
    toast.success(`Updated ${selectedUserIds.length} users to ${status}`);
    setSelectedUserIds([]);
  };

  const handleBulkDeleteUsersAction = () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`Permanently delete ${selectedUserIds.length} accounts?`)) {
      bulkDeleteUsers(selectedUserIds);
      toast.success(`Purged ${selectedUserIds.length} users`);
      setSelectedUserIds([]);
    }
  };

  const handleBulkListingFeature = (featured: boolean) => {
    if (selectedListingIds.length === 0) return;
    bulkUpdateListings(selectedListingIds, { featured });
    toast.success(`${featured ? 'Boosted' : 'Unboosted'} ${selectedListingIds.length} ads`);
    setSelectedListingIds([]);
  };

  const handleBulkDeleteListingsAction = () => {
    if (selectedListingIds.length === 0) return;
    if (window.confirm(`Delete ${selectedListingIds.length} listings permanently?`)) {
      bulkDeleteListings(selectedListingIds);
      toast.success(`Deleted ${selectedListingIds.length} listings`);
      setSelectedListingIds([]);
    }
  };

  const handleSaveSuperuserProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(user.id, {
      fullName: adminFullName,
      email: adminEmail,
      phoneNumber: adminPhone,
      businessName: adminBusinessName,
      avatarUrl: adminAvatar,
      verificationType: adminBadge,
    });
    if (newPin.trim()) {
      updateAdminPin(newPin);
      setNewPin('');
    }
    toast.success('Admin identity updated');
  };

  const moduleGroups: ModuleGroup[] = [
    {
      groupName: "Overview & Root",
      items: [
        { id: 'analytics', label: 'Vitals & Stats', description: 'Metrics & growth', icon: Activity, color: 'text-emerald-400' },
        { id: 'superuser', label: 'Admin Identity', description: 'Sealify public profile', icon: Fingerprint, color: 'text-emerald-400' },
        { id: 'announcements', label: 'Announcements', description: 'Scrolling banners', icon: Megaphone, badge: announcements.filter(a => a.active).length, color: 'text-yellow-400' },
        { id: 'categories', label: 'Categories', description: 'Market taxonomy', icon: Layers, badge: categories.length, color: 'text-purple-400' },
      ]
    },
    {
      groupName: "Moderation",
      items: [
        { id: 'users', label: 'User Directory', description: 'Account control', icon: Users, badge: allUsers.length, color: 'text-blue-400' },
        { id: 'listings', label: 'Ad Inventory', description: 'Audit & feature', icon: Package, badge: listings.length, color: 'text-teal-400' },
        { id: 'requests', label: 'Action Queue', description: 'IDs & Resets', icon: BadgeCheck, badge: pendingVerifications.length + pendingPasswords.length, color: 'text-amber-400', badgeBg: 'bg-amber-500 text-slate-950' },
        { id: 'disputes', label: 'Disputes/Safety', description: 'Arbitration center', icon: Gavel, badge: activeDisputes.length + pendingReports.length, color: 'text-rose-400', badgeBg: 'bg-rose-600 text-white' },
      ]
    },
    {
      groupName: "Treasury & Security",
      items: [
        { id: 'finance', label: 'Treasury', description: 'Revenue & payments', icon: Wallet, badge: pendingPromoPay.length, color: 'text-emerald-400' },
        { id: 'security', label: 'Threat Logs', description: 'Intrusion detection', icon: ShieldAlert, badge: intrusionLogs.length, color: 'text-rose-500' },
        { id: 'audit_logs', label: 'Audit Trail', description: 'Action history', icon: History, badge: auditLogs.length, color: 'text-indigo-400' },
        { id: 'settings', label: 'Global Config', description: 'Logo & Metadata', icon: SettingsIcon, color: 'text-cyan-400' },
      ]
    }
  ];

  const allModules = moduleGroups.flatMap(g => g.items);
  const activeModule = allModules.find(m => m.id === activeTab) || allModules[0];
  const ActiveIcon = activeModule.icon;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      
      <div className="bg-slate-900/50 border-b border-slate-800 backdrop-blur-xl sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to={`/seller/${user.id}`} className="w-12 h-12 bg-slate-950 border-2 border-emerald-500 rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform">
              {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-emerald-400" />}
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white uppercase">{user.fullName || 'Sealify'}</h1>
                <span className="text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Official Root</span>
              </div>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Global Administrative Access</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSqlModalOpen(true)} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl border border-slate-700 hover:text-emerald-400 transition-colors">SQL Migration</button>
            <button onClick={exportDatabaseBackup} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl border border-slate-700">Backup JSON</button>
            <button onClick={logout} className="p-2 bg-rose-600/10 text-rose-500 rounded-xl border border-rose-500/20"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        <div className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <ActiveIcon className={`w-5 h-5 ${activeModule.color}`} />
              <div className="text-left">
                <span className="font-black text-sm text-white uppercase">{activeModule.label}</span>
                <p className="text-[10px] text-slate-500">{activeModule.description}</p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 max-h-[70vh] overflow-y-auto no-scrollbar">
              {moduleGroups.map(g => (
                <div key={g.groupName} className="py-2">
                  <p className="px-3 py-1 text-[8px] font-black text-emerald-400 uppercase tracking-widest border-b border-slate-800/50 mb-2">{g.groupName}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {g.items.map(m => (
                      <button key={m.id} onClick={() => { setActiveTab(m.id); setIsDropdownOpen(false); }} className={`p-3 rounded-2xl text-left flex items-start gap-3 transition-all ${activeTab === m.id ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300'}`}>
                        <m.icon className={`w-5 h-5 mt-0.5 ${activeTab === m.id ? 'text-slate-950' : m.color}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-black truncate uppercase">{m.label}</p>
                          <p className={`text-[9px] truncate ${activeTab === m.id ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>{m.description}</p>
                          {m.badge && (
                            <span className={`inline-block mt-1 text-[8px] font-black px-1.5 py-0.2 rounded-full ${m.badgeBg || 'bg-slate-800 text-slate-300'}`}>
                              {m.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500">Node Traffic</span>
                <p className="text-3xl font-black text-emerald-400">{analytics.visitors}</p>
                <p className="text-[10px] text-slate-500">Live Connections</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500">Inventory</span>
                <p className="text-3xl font-black text-teal-400">{analytics.activeAds}</p>
                <p className="text-[10px] text-slate-500">Active Ad Nodes</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500">Revenue</span>
                <p className="text-3xl font-black text-blue-400">₦{analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">Gross Liquidity</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500">Market Growth</span>
                <p className="text-3xl font-black text-amber-400">+{analytics.userGrowth}%</p>
                <p className="text-[10px] text-slate-500">W/W Comparison</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                   <h3 className="font-black text-white text-base uppercase flex items-center gap-2">
                     <Wallet className="w-5 h-5 text-emerald-400" /> Pending Promotion Payments ({pendingPromoPay.length})
                   </h3>
                   <div className="space-y-3">
                     {pendingPromoPay.length === 0 ? (
                       <p className="text-slate-500 text-xs py-10 text-center italic">No pending payment verification requests.</p>
                     ) : (
                       pendingPromoPay.map(r => (
                         <div key={r.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                           <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                <DollarSign className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-black text-white text-sm">₦{r.amount.toLocaleString()} — {r.planName}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Via {r.paymentMethod} • Ref: {r.id.slice(-6)}</p>
                              </div>
                           </div>
                           <div className="flex gap-2 w-full sm:w-auto">
                              <button onClick={() => processPromotionPaymentRequest(r.id, 'approved')} className="flex-1 px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg">Verify</button>
                              <button onClick={() => processPromotionPaymentRequest(r.id, 'rejected')} className="flex-1 px-4 py-2 bg-slate-800 text-rose-400 font-bold rounded-xl text-[10px] uppercase">Reject</button>
                           </div>
                         </div>
                       ))
                     )}
                   </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                   <h3 className="font-black text-white text-base uppercase flex items-center gap-2">
                     <SettingsIcon className="w-5 h-5 text-cyan-400" /> Promotion Rates
                   </h3>
                   <div className="space-y-4">
                      {promotionPlans.map(plan => (
                        <div key={plan.months} className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{plan.label} Rate (NGN)</label>
                           <div className="flex gap-2">
                              <input 
                                type="number" 
                                defaultValue={plan.rate} 
                                onBlur={(e) => updatePromotionPlanRate(plan.months, Number(e.target.value))}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 transition-colors" 
                              />
                              <div className="p-2 bg-slate-800 rounded-xl text-emerald-400"><Check className="w-4 h-4" /></div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in">
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex items-center gap-2">
                {selectedUserIds.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 animate-in slide-in-from-right-2">
                    <button onClick={() => handleBulkUserStatus('active')} className="text-[10px] font-bold text-emerald-400">Activate</button>
                    <button onClick={() => handleBulkUserStatus('banned')} className="text-[10px] font-bold text-rose-400">Ban</button>
                    <button onClick={handleBulkDeleteUsersAction} className="text-[10px] font-bold text-rose-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                )}
                <button onClick={() => setSelectedUserIds(selectedUserIds.length === filteredUsers.length ? [] : filteredUsers.map(u => u.id))} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg">{selectedUserIds.length === filteredUsers.length ? 'Deselect All' : 'Select All'}</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-[10px] uppercase text-slate-500 font-black border-b border-slate-800">
                  <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Role & Status</th><th className="px-6 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className={`text-xs hover:bg-slate-800/20 transition-colors ${selectedUserIds.includes(u.id) ? 'bg-emerald-500/5' : ''}`}>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => setSelectedUserIds(prev => prev.includes(u.id) ? prev.filter(i => i !== u.id) : [...prev, u.id])} className="rounded border-slate-700 bg-slate-900 text-emerald-500" />
                        <div><p className="font-bold text-white">{u.fullName}</p><p className="text-[10px] text-slate-500">{u.email}</p></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>{u.role}</span>
                          <span className={`block text-[9px] font-bold ${u.status === 'banned' ? 'text-rose-500' : 'text-emerald-400'}`}>{u.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right"><button onClick={() => setEditingUser(u)} className="p-2 bg-slate-800 rounded-xl text-slate-300 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in">
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Search ads..." value={listingSearch} onChange={e => setListingSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex items-center gap-2">
                {selectedListingIds.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
                    <button onClick={() => handleBulkListingFeature(true)} className="text-[10px] font-bold text-amber-400">Boost</button>
                    <button onClick={handleBulkDeleteListingsAction} className="text-[10px] font-bold text-rose-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                )}
                <button onClick={() => setSelectedListingIds(selectedListingIds.length === filteredListings.length ? [] : filteredListings.map(l => l.id))} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg">Select All</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-[10px] uppercase text-slate-500 font-black border-b border-slate-800">
                  <tr><th className="px-6 py-4">Item</th><th className="px-6 py-4">Price & Category</th><th className="px-6 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {filteredListings.map(l => (
                    <tr key={l.id} className={`text-xs hover:bg-slate-800/20 transition-colors ${selectedListingIds.includes(l.id) ? 'bg-emerald-500/5' : ''}`}>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <input type="checkbox" checked={selectedListingIds.includes(l.id)} onChange={() => setSelectedListingIds(prev => prev.includes(l.id) ? prev.filter(i => i !== l.id) : [...prev, l.id])} className="rounded border-slate-700 bg-slate-900 text-emerald-500" />
                        <img src={l.images[0]} className="w-12 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800" />
                        <div className="min-w-0"><p className="font-bold text-white truncate max-w-xs">{l.title}</p><p className="text-[9px] text-slate-500 flex items-center gap-1">{l.featured && <Crown className="w-2.5 h-2.5 text-amber-500" />} {l.id}</p></div>
                      </td>
                      <td className="px-6 py-4"><p className="font-black text-emerald-400">₦{l.price.toLocaleString()}</p><p className="text-[10px] text-slate-500 font-bold uppercase">{l.category}</p></td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => toggleFeaturedListing(l.id)} className={`p-2 rounded-xl border transition-all ${l.featured ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-500'}`}><Crown className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteListing(l.id)} className="p-2 bg-slate-800 hover:bg-rose-600/20 text-slate-500 hover:text-rose-400 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="font-black text-white text-base uppercase flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-400" /> ID Verifications ({pendingVerifications.length})
              </h3>
              <div className="space-y-3">
                {pendingVerifications.length === 0 ? (
                  <p className="text-slate-500 text-xs py-10 text-center italic">No pending identity verifications.</p>
                ) : (
                  pendingVerifications.map(r => (
                    <div key={r.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div><p className="font-bold text-sm text-white">{r.userName}</p><p className="text-[10px] text-slate-500">{r.userEmail}</p></div>
                        <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">{r.type}</span>
                      </div>
                      <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800"><img src={r.docUrl} className="w-full h-full object-contain" /></div>
                      <div className="flex gap-2">
                        <button onClick={() => processVerificationRequest(r.id, 'approved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg">Approve Badge</button>
                        <button onClick={() => processVerificationRequest(r.id, 'rejected')} className="flex-1 py-2 bg-slate-800 text-rose-500 font-bold rounded-xl text-[10px] uppercase">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="font-black text-white text-base uppercase flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" /> NIN Password Resets ({pendingPasswords.length})
              </h3>
              <div className="space-y-3">
                {pendingPasswords.length === 0 ? (
                  <p className="text-slate-500 text-xs py-10 text-center italic">No pending password reset requests.</p>
                ) : (
                  pendingPasswords.map(p => (
                    <div key={p.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <div><p className="font-bold text-sm text-white">{p.userName}</p><p className="text-[10px] text-slate-400">NIN: <span className="font-mono">{p.nin}</span></p></div>
                      <div className="p-3 bg-slate-900 rounded-xl text-[10px] text-slate-300 leading-relaxed italic border-l-2 border-amber-500">"{p.reason}"</div>
                      <div className="flex gap-2">
                        <button onClick={() => processPasswordRequest(p.id, 'approved')} className="flex-1 py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg">Overwrite Pass</button>
                        <button onClick={() => processPasswordRequest(p.id, 'declined')} className="flex-1 py-2 bg-slate-800 text-slate-400 font-bold rounded-xl text-[10px] uppercase">Ignore</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
               <h3 className="font-black text-white text-base uppercase flex items-center gap-2">
                 <Gavel className="w-5 h-5 text-rose-400" /> Trade Arbitration Queue ({activeDisputes.length})
               </h3>
               <div className="space-y-3">
                 {activeDisputes.map(d => (
                   <div key={d.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div><p className="font-black text-xs text-white">Item: {d.itemTitle}</p><p className="text-[10px] text-slate-500">Against: <strong className="text-emerald-400">{d.counterparty}</strong></p></div>
                        <span className="text-[9px] font-black uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">{d.status}</span>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => processDisputeCase(d.id, 'resolved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase">Mark Resolved</button>
                         <button onClick={() => processDisputeCase(d.id, 'in_review')} className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-[10px] uppercase">Under Review</button>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl border-l-4 border-l-rose-500">
               <h3 className="font-black text-white text-base uppercase flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5 text-rose-500" /> Safety Reports ({pendingReports.length})
               </h3>
               <div className="space-y-3">
                 {pendingReports.map(r => (
                   <div key={r.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start"><p className="font-bold text-xs text-white truncate max-w-[70%]">{r.listingTitle}</p><span className="text-[9px] font-black uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">Ad Report</span></div>
                      <div className="text-[10px] text-rose-300 font-black flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Reason: {r.reason}</div>
                      <div className="flex gap-2">
                        <button onClick={() => processReport(r.id, 'resolve_delete_ad')} className="flex-1 py-2 bg-rose-600 text-white font-black rounded-xl text-[10px] uppercase shadow-lg">Delete Ad Node</button>
                        <button onClick={() => processReport(r.id, 'dismiss')} className="flex-1 py-2 bg-slate-800 text-slate-500 font-bold rounded-xl text-[10px] uppercase">Dismiss</button>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
             <form onSubmit={handleAddAnnouncement} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl h-fit">
                <h3 className="font-black text-white text-base uppercase flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-400" /> New Broadcaster Banner</h3>
                <div className="space-y-1 text-xs"><label className="font-bold text-slate-400 uppercase">Banner Headline</label><input type="text" value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="e.g. Server Maintenance" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white" required /></div>
                <div className="space-y-1 text-xs"><label className="font-bold text-slate-400 uppercase">Message Content</label><textarea rows={3} value={annMessage} onChange={e => setAnnMessage(e.target.value)} placeholder="Enter banner text..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white" required /></div>
                <button type="submit" className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg">Activate Banner</button>
             </form>

             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="font-black text-white text-base uppercase flex items-center gap-2"><Activity className="w-5 h-5 text-amber-400" /> Live Banners ({announcements.length})</h3>
                <div className="space-y-3">
                   {announcements.map(ann => (
                     <div key={ann.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-opacity ${ann.active ? 'bg-slate-950 border-emerald-500/30' : 'bg-slate-950/40 border-slate-800 opacity-50'}`}>
                        <div className="min-w-0"><p className="font-bold text-xs text-white truncate">{ann.title}</p><p className="text-[10px] text-slate-500 truncate">{ann.message}</p></div>
                        <div className="flex items-center gap-1.5 shrink-0">
                           <button onClick={() => toggleAnnouncement(ann.id)} className={`p-2 rounded-lg ${ann.active ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'}`}><CheckCircle2 className="w-4 h-4" /></button>
                           <button onClick={() => deleteAnnouncement(ann.id)} className="p-2 text-rose-500 bg-rose-500/10 rounded-lg hover:bg-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           </div>
        )}

        {activeTab === 'superuser' && (
          <form onSubmit={handleSaveSuperuserProfile} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 space-y-6 shadow-2xl animate-in fade-in">
             <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
               <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30"><Fingerprint className="w-6 h-6" /></div>
               <div><h2 className="text-xl font-black text-white uppercase">Superuser Profile Identity</h2><p className="text-xs text-slate-400">Manage your administrative persona & secure terminal PIN</p></div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5"><label className="font-bold text-slate-400 uppercase">Master Display Name</label><input type="text" value={adminFullName} onChange={e => setAdminFullName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" /></div>
                <div className="space-y-1.5"><label className="font-bold text-slate-400 uppercase">Terminal Access PIN (6 Digits)</label><input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="••••••" maxLength={6} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono tracking-widest" /></div>
             </div>
             <button type="submit" className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"><Check className="w-4 h-4" /> Save Master record</button>
          </form>
        )}

        {activeTab === 'audit_logs' && (
           <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in">
              <div className="p-6 border-b border-slate-800 bg-slate-950/30"><h3 className="font-black text-white text-base uppercase flex items-center gap-2"><History className="w-5 h-5 text-indigo-400" /> Administrative Audit Trail ({auditLogs.length})</h3></div>
              <div className="overflow-x-auto no-scrollbar">
                 <table className="w-full text-left">
                    <thead className="bg-slate-950/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                       <tr><th className="px-6 py-4">Action</th><th className="px-6 py-4">Entity Details</th><th className="px-6 py-4 text-right">Timestamp</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30 text-xs">
                       {auditLogs.slice().reverse().map(log => (
                         <tr key={log.id} className="hover:bg-indigo-500/5 transition-colors">
                            <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0"><Terminal className="w-4 h-4" /></div><div><p className="font-bold text-white uppercase text-[10px]">{log.action}</p><span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${log.type === 'security' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>{log.type}</span></div></div></td>
                            <td className="px-6 py-4 text-slate-400 italic max-w-xs truncate">"{log.details}"</td>
                            <td className="px-6 py-4 text-right text-[10px] text-slate-500 font-mono">{log.createdAt}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {activeTab === 'categories' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
              <form onSubmit={handleAddCategory} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl h-fit">
                 <h3 className="font-black text-white text-base uppercase flex items-center gap-2"><Plus className="w-5 h-5 text-purple-400" /> New Taxonomy Entry</h3>
                 <div className="space-y-1 text-xs"><label className="font-bold text-slate-400 uppercase">Category Label *</label><input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Industrial Equipment" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500" required /></div>
                 <button type="submit" className="w-full py-2.5 bg-purple-600 text-white font-black rounded-xl text-[10px] uppercase shadow-lg">Inject Category</button>
              </form>
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                 <h3 className="font-black text-white text-base uppercase flex items-center gap-2"><Layers className="w-5 h-5 text-purple-400" /> Active Taxonomy ({categories.length})</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map(cat => (
                      <div key={cat.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group">
                         <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center text-white shadow-lg`}><Package className="w-4 h-4" /></div><div><p className="font-bold text-xs text-white">{cat.name}</p><p className="text-[10px] text-slate-500 uppercase font-black">{cat.count} Ads</p></div></div>
                         <button onClick={() => deleteCategory(cat.id)} className="p-2 opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'security' && (
           <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in">
              <div className="p-6 border-b border-slate-800 bg-slate-950/30"><h3 className="font-black text-white text-base uppercase flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-rose-500" /> Node Intrusion Log ({intrusionLogs.length})</h3></div>
              <div className="overflow-x-auto no-scrollbar">
                 <table className="w-full text-left">
                    <thead className="bg-slate-950/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                       <tr><th className="px-6 py-4">Threat Event</th><th className="px-6 py-4">Metadata</th><th className="px-6 py-4 text-right">Severity</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30 text-xs">
                       {intrusionLogs.length === 0 ? (
                         <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500 italic">No threat detections logged by security protocols.</td></tr>
                       ) : (
                         intrusionLogs.map(log => (
                           <tr key={log.id} className="hover:bg-rose-500/5 transition-colors">
                              <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0"><ShieldAlert className="w-4 h-4" /></div><div className="min-w-0"><p className="font-bold text-rose-300">Unauthorized Login Attempt</p><p className="text-[10px] text-slate-500 font-mono">{log.attemptedEmail}</p></div></div></td>
                              <td className="px-6 py-4"><div className="text-[10px] text-slate-400 space-y-0.5"><p>TS: {log.timestamp}</p><p>MEDIA: {log.mediaStatus}</p></div></td>
                              <td className="px-6 py-4 text-right"><span className="px-2 py-0.5 bg-rose-500 text-white font-black uppercase text-[8px] rounded-full">HIGH</span></td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {activeTab === 'settings' && (
           <div className="space-y-6 animate-in fade-in">
             <form onSubmit={async (e) => { e.preventDefault(); await updateSiteSettings({ siteName: metaSiteName, siteDescription: metaDescription, contactEmail: metaContactEmail }); toast.success('Platform metadata updated!'); }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <h3 className="font-black text-white text-base uppercase flex items-center gap-2"><Globe className="w-5 h-5 text-cyan-400" /> Global Platform Metadata</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                   <div className="space-y-1.5"><label className="font-bold text-slate-400 uppercase">Site Name</label><input type="text" value={metaSiteName} onChange={e => setMetaSiteName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none" /></div>
                   <div className="space-y-1.5"><label className="font-bold text-slate-400 uppercase">Contact Email</label><input type="email" value={metaContactEmail} onChange={e => setMetaContactEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none" /></div>
                </div>
                <div className="space-y-1.5 text-xs"><label className="font-bold text-slate-400 uppercase">Platform Meta Description</label><textarea rows={3} value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none" /></div>
                <button type="submit" className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"><Check className="w-4 h-4" /> Save Global Configuration</button>
             </form>

             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
                <h3 className="font-black text-white text-base uppercase flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-400" /> System Access & Toggles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'maintenanceMode', label: 'Maintenance Mode', icon: Monitor },
                    { key: 'autoApproveAds', label: 'Auto-Approve Ads', icon: CheckCircle2 },
                    { key: 'requireIdForPosting', label: 'Require ID for Posting', icon: ShieldCheck },
                    { key: 'aiSpamFilter', label: 'AI Spam Filter', icon: Cpu },
                  ].map(toggle => (
                    <div key={toggle.key} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                       <div className="flex items-center gap-3"><toggle.icon className="w-4 h-4 text-emerald-400" /><span className="text-xs font-bold text-white">{toggle.label}</span></div>
                       <button onClick={() => updateSystemConfig({ [toggle.key]: !systemConfig[toggle.key as keyof typeof systemConfig] })} className={`w-10 h-5 rounded-full transition-all relative p-1 ${systemConfig[toggle.key as keyof typeof systemConfig] ? 'bg-emerald-500' : 'bg-slate-800'}`}><div className={`w-3 h-3 rounded-full bg-white transition-transform ${systemConfig[toggle.key as keyof typeof systemConfig] ? 'translate-x-5' : 'translate-x-0'}`}></div></button>
                    </div>
                  ))}
                </div>
             </div>
           </div>
        )}

      </main>

      <AdminEditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(id, updated) => updateUser(id, updated)} />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;