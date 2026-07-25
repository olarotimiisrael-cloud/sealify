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
    user, isAdmin, logout, categories,
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
    reports, processReport, buyerRequests, deleteBuyerRequest, reviews, deleteReview, loading
  } = useSealify();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');

  // Form states
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminBusinessName, setAdminBusinessName] = useState('');
  const [adminAvatar, setAdminAvatar] = useState('');
  const [adminBanner, setAdminBanner] = useState('');
  const [adminBadge, setAdminBadge] = useState<VerificationBadgeType>('premium');
  const [adminPassword, setAdminPassword] = useState('');

  // Social Metadata Form
  const [metaSiteName, setMetaSiteName] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaOgImage, setMetaOgImage] = useState('');
  const [metaLogoUrl, setMetaLogoUrl] = useState('');
  const [metaContactEmail, setMetaContactEmail] = useState('');
  const [metaContactPhone, setMetaContactPhone] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && (!isAdmin || !user)) {
      navigate('/admin/login');
    }
  }, [isAdmin, user, loading, navigate]);

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
    if (siteSettings && activeTab === 'settings') {
      setMetaSiteName(siteSettings.siteName);
      setMetaDescription(siteSettings.siteDescription);
      setMetaOgImage(siteSettings.ogImage);
      setMetaLogoUrl(siteSettings.logoUrl);
      setMetaContactEmail(siteSettings.contactEmail);
      setMetaContactPhone(siteSettings.contactPhone);
    }
  }, [user, activeTab, siteSettings]);

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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      
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
        <div className="relative flex-1" ref={dropdownRef}>
           <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-950 hover:bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-2xl flex items-center justify-between transition-all group shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
                  <ActiveIcon className={`w-5 h-5 \${activeModule.color || 'text-emerald-400'}`} />
                </div>
                <div className="text-left">
                    <span className="font-black text-sm text-white">{activeModule.label}</span>
                    <p className="text-[10px] text-slate-500">{activeModule.description}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform \${isDropdownOpen ? 'rotate-180' : ''}`} />
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
                          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsDropdownOpen(false); }} className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 \${activeTab === item.id ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/60'}`}>
                            <Icon className={`w-4 h-4 shrink-0 mt-0.5 \${activeTab === item.id ? 'text-slate-950' : item.color || 'text-slate-400'}`} />
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

        <div className="space-y-6">
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in">
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
          )}

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
                               {u.avatarUrl ? <img src={u.avatarUrl} className="w-8 h-8 rounded-xl object-cover" /> : <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center"><User className="w-4 h-4" /></div>}
                               <div><p className="font-bold text-white">{u.fullName}</p><p className="opacity-50 font-mono text-[9px]">{u.email}</p></div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] uppercase \${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{u.status || 'active'}</span>
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