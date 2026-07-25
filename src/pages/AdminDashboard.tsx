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
  Crown
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
    user, isAdmin, logout, categories, addCategory, deleteCategory,
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
    reports, processReport, buyerRequests, deleteBuyerRequest, reviews, deleteReview, loading,
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

  // Form States (Superuser, Settings, etc.)
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminBusinessName, setAdminBusinessName] = useState('');
  const [adminAvatar, setAdminAvatar] = useState('');
  const [adminBanner, setAdminBanner] = useState('');
  const [adminBadge, setAdminBadge] = useState<VerificationBadgeType>('premium');
  const [adminPassword, setAdminPassword] = useState('');
  const [newPin, setNewPin] = useState('');

  const [metaSiteName, setMetaSiteName] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaOgImage, setMetaOgImage] = useState('');
  const [metaLogoUrl, setMetaLogoUrl] = useState('');
  const [metaContactEmail, setMetaContactEmail] = useState('');
  const [metaContactPhone, setMetaContactPhone] = useState('');

  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');

  const dropdownRef = useRef<HTMLDivElement>(null);

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
  }, [user, activeTab, siteSettings]);

  if (loading || !isAdmin || !user) return null;

  // Search Results
  const filteredUsers = allUsers.filter(u => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredListings = listings.filter(l => l.title.toLowerCase().includes(listingSearch.toLowerCase()) || l.sellerName.toLowerCase().includes(listingSearch.toLowerCase()));

  // Bulk Handler Definitions
  const handleToggleSelectAllUsers = () => {
    if (selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkUserStatus = (status: UserStatus) => {
    if (selectedUserIds.length === 0) return;
    bulkUpdateUsers(selectedUserIds, { status });
    toast.success(`Updated ${selectedUserIds.length} users to ${status}`);
    setSelectedUserIds([]);
  };

  const handleBulkDeleteUsersAction = () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`Delete ${selectedUserIds.length} accounts permanently?`)) {
      bulkDeleteUsers(selectedUserIds);
      toast.success(`Deleted ${selectedUserIds.length} users`);
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelectAllListings = () => {
    if (selectedListingIds.length === filteredListings.length && filteredListings.length > 0) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(filteredListings.map(l => l.id));
    }
  };

  const handleBulkListingFeature = (featured: boolean) => {
    if (selectedListingIds.length === 0) return;
    bulkUpdateListings(selectedListingIds, { featured });
    toast.success(`Boosted ${selectedListingIds.length} ads`);
    setSelectedListingIds([]);
  };

  const handleBulkDeleteListingsAction = () => {
    if (selectedListingIds.length === 0) return;
    if (window.confirm(`Delete ${selectedListingIds.length} ads?`)) {
      bulkDeleteListings(selectedListingIds);
      toast.success(`Deleted ${selectedListingIds.length} ads`);
      setSelectedListingIds([]);
    }
  };

  const handleUpdateSiteMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSiteSettings({ siteName: metaSiteName, siteDescription: metaDescription, ogImage: metaOgImage, logoUrl: metaLogoUrl, contactEmail: metaContactEmail, contactPhone: metaContactPhone });
    toast.success('🎉 Site metadata updated!');
  };

  const handleSaveSuperuserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser(user.id, { fullName: adminFullName, email: adminEmail, phoneNumber: adminPhone, businessName: adminBusinessName, avatarUrl: adminAvatar, storeBannerUrl: adminBanner, verified: true, verificationType: adminBadge, password: adminPassword || undefined });
    if (newPin.trim()) { updateAdminPin(newPin); setNewPin(''); }
    toast.success('🎉 Master Identity updated!');
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

  const activeModule = allModules.find(m => m.id === activeTab) || moduleGroups[0].items[0];
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
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Admin Dashboard Access</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSqlModalOpen(true)} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl border border-slate-700">SQL Schema</button>
            <button onClick={exportDatabaseBackup} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl border border-slate-700">Export DB</button>
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
            <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 max-h-[60vh] overflow-y-auto no-scrollbar">
              {moduleGroups.map(g => (
                <div key={g.groupName} className="py-2">
                  <p className="px-3 py-1 text-[8px] font-black text-emerald-400 uppercase tracking-widest">{g.groupName}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {g.items.map(m => (
                      <button key={m.id} onClick={() => { setActiveTab(m.id); setIsDropdownOpen(false); }} className={`p-3 rounded-2xl text-left flex items-start gap-3 ${activeTab === m.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300'}`}>
                        <m.icon className={`w-4 h-4 mt-0.5 ${activeTab === m.id ? 'text-slate-950' : m.color}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{m.label}</p>
                          {m.badge && <span className="text-[8px] font-black px-1.5 py-0.2 bg-slate-800 rounded">{m.badge}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in">
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white" />
              </div>
              <div className="flex items-center gap-2">
                {selectedUserIds.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
                    <button onClick={() => handleBulkUserStatus('active')} className="text-[10px] font-bold text-emerald-400">Activate</button>
                    <button onClick={() => handleBulkUserStatus('banned')} className="text-[10px] font-bold text-rose-400">Ban</button>
                    <button onClick={handleBulkDeleteUsersAction} className="text-[10px] font-bold text-rose-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                )}
                <button onClick={handleToggleSelectAllUsers} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg">{selectedUserIds.length === filteredUsers.length ? 'Deselect All' : 'Select All'}</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-[10px] uppercase text-slate-500 font-black">
                  <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="text-xs">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => setSelectedUserIds(prev => prev.includes(u.id) ? prev.filter(i => i !== u.id) : [...prev, u.id])} />
                        <div><p className="font-bold">{u.fullName}</p><p className="text-[10px] text-slate-500">{u.email}</p></div>
                      </td>
                      <td className="px-6 py-4 capitalize">{u.status}</td>
                      <td className="px-6 py-4 text-right"><button onClick={() => setEditingUser(u)} className="p-2 bg-slate-800 rounded-xl"><Edit3 className="w-3.5 h-3.5" /></button></td>
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
                <input type="text" placeholder="Search ads..." value={listingSearch} onChange={e => setListingSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white" />
              </div>
              <div className="flex items-center gap-2">
                {selectedListingIds.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
                    <button onClick={() => handleBulkListingFeature(true)} className="text-[10px] font-bold text-amber-400">Boost</button>
                    <button onClick={handleBulkDeleteListingsAction} className="text-[10px] font-bold text-rose-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                )}
                <button onClick={handleToggleSelectAllListings} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg">Select All</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-[10px] uppercase text-slate-500 font-black">
                  <tr><th className="px-6 py-4">Item</th><th className="px-6 py-4">Price</th><th className="px-6 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredListings.map(l => (
                    <tr key={l.id} className="text-xs">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <input type="checkbox" checked={selectedListingIds.includes(l.id)} onChange={() => setSelectedListingIds(prev => prev.includes(l.id) ? prev.filter(i => i !== l.id) : [...prev, l.id])} />
                        <div><p className="font-bold truncate max-w-xs">{l.title}</p><p className="text-[9px] text-slate-500 flex items-center gap-1">{l.featured && <Crown className="w-2.5 h-2.5 text-amber-500" />} {l.id}</p></div>
                      </td>
                      <td className="px-6 py-4">₦{l.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => toggleFeaturedListing(l.id)} className={`p-2 rounded-xl border ${l.featured ? 'bg-amber-500 text-slate-950' : 'bg-slate-800'}`}><Crown className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteListing(l.id)} className="p-2 bg-slate-800 hover:bg-rose-600/20 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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