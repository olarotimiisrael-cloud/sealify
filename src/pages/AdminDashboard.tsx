"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import AdminEditUserModal from '../components/AdminEditUserModal';
import AdminSettingsModal from '../components/AdminSettingsModal';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import FilterDrawer from '../components/FilterDrawer';
import CompareModal from '../components/CompareModal';
import SavedAlertsModal from '../components/SavedAlertsModal';
import AiShoppingAssistantModal from '../components/AiShoppingAssistantModal';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import VerifiedBadge from '../components/VerifiedBadge';
import DatabaseTest from '../components/DatabaseTest';
import { 
  X, CheckCircle2, Plus, 
  Shield, 
  Users, 
  Package, 
  Check, 
  Edit3, 
  AlertOctagon, 
  Info, 
  Lock, 
  KeyRound, 
  Radio, 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  TrendingUp, 
  Siren, 
  Mail, 
  Download, 
  Square, 
  Send, 
  Filter, 
  BarChart3, 
  ShieldAlert, 
  Gavel, 
  Sparkles, 
  Terminal,
  Activity,
  Megaphone,
  Trash2,
  Crown,
  Clock,
  ExternalLink,
  RefreshCw,
  Award,
  CheckSquare,
  Database,
  Settings,
  KeyRound as KeyRoundIcon
} from 'lucide-react';
import { UserProfile, Listing, UserStatus } from '../types/sealify';
import { toast } from 'sonner';

type AdminTab = 
  | 'overview' 
  | 'listings' 
  | 'users' 
  | 'verifications' 
  | 'promotions' 
  | 'disputes' 
  | 'announcements' 
  | 'safespots' 
  | 'security'
  | 'dbtest';

export default function AdminDashboard() {
  const {
    user,
    isAdmin,
    allUsers,
    listings,
    deleteListing,
    updateListing,
    bulkDeleteListings,
    updateUser,
    addUser,
    deleteUser,
    verificationRequests,
    processVerificationRequest,
    passwordRequests,
    processPasswordRequest,
    promotionPaymentRequests,
    processPromotionPaymentRequest,
    reports,
    processReport,
    disputeCases,
    processDisputeCase,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    safeSpots,
    addSafeSpot,
    deleteSafeSpot,
    systemConfig,
    updateSystemConfig,
    siteSettings,
    updateSiteSettings,
    promotionPlans,
    updatePromotionPlanRate,
    auditLogs,
    intrusionLogs,
    analytics,
    exportDatabaseBackup,
    syncDatabase,
    isSyncing,
    lastSyncTime,
    dispatchPromotionalEmailDigest,
    broadcastMassNotification,
    updateAdminCredentials,
    adminEmail,
    adminPassword,
    adminPin
  } = useSealify();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlSchemaOpen, setIsSqlSchemaOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [listingSearch, setListingSearch] = useState('');
  const [listingFilterType, setListingFilter] = useState<'all' | 'sample' | 'live'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'buyer' | 'seller' | 'admin'>('all');
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');
  const [spotName, setSpotName] = useState('');
  const [spotZone, setSpotZone] = useState<'LAUTECH Area' | 'Takie / Center' | 'Sabo Market Zone' | 'Police HQ'>('Takie / Center');
  const [spotCategory, setSpotCategory] = useState<'Police Safe Zone' | 'Public Library' | 'Shopping Mall' | 'Café'>('Police Safe Zone');
  const [spotAddress, setSpotAddress] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMessage] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState(adminEmail);
  const [newAdminPass, setNewAdminPassword] = useState(adminPassword);
  const [newAdminPin, setNewAdminPin] = useState(adminPin);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">
        <SEO title="Admin Gatekeeper — Sealify" />
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border-2 border-rose-500/30 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl space-y-5">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">Access Denied</h2>
            <p className="text-xs text-slate-400">
              You must authenticate with Master Terminal credentials to access the Sealify Admin Panel.
            </p>
            <Link
              to="/admin/login"
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Terminal className="w-4 h-4" />
              <span>Authenticate Root Login</span>
            </Link>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  const filteredListings = listings.filter((l) => {
    const isSample = l.id.startsWith('lst_vehicles_') || l.id.startsWith('lst_electronics_') || l.id.startsWith('lst_real_estate_') || l.id.startsWith('lst_fashion_') || l.id.startsWith('lst_furniture_') || l.id.startsWith('lst_services_') || l.id.startsWith('lst_jobs_') || l.id.startsWith('lst_beauty_') || l.id.startsWith('lst_utility_');
    if (listingFilterType === 'sample' && !isSample) return false;
    if (listingFilterType === 'live' && isSample) return false;
    if (listingSearch.trim()) {
      const q = listingSearch.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q) || l.sellerName.toLowerCase().includes(q);
    }
    return true;
  });

  const sampleCount = listings.filter(l => l.id.startsWith('lst_vehicles_') || l.id.startsWith('lst_electronics_') || l.id.startsWith('lst_real_estate_') || l.id.startsWith('lst_fashion_') || l.id.startsWith('lst_furniture_') || l.id.startsWith('lst_services_') || l.id.startsWith('lst_jobs_') || l.id.startsWith('lst_beauty_') || l.id.startsWith('lst_utility_')).length;
  const liveUserCount = listings.length - sampleCount;

  const handleSelectAllListings = () => {
    if (selectedListingIds.length === filteredListings.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(filteredListings.map(l => l.id));
    }
  };

  const handleToggleListingSelection = (id: string) => {
    setSelectedListingIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkPurgeSelected = () => {
    if (selectedListingIds.length === 0) return;
    if (window.confirm(`🔥 Are you sure you want to permanently delete ${selectedListingIds.length} selected listings?`)) {
      bulkDeleteListings(selectedListingIds);
      toast.success(`Purged ${selectedListingIds.length} listings from database.`);
      setSelectedListingIds([]);
    }
  };

  const handlePurgeAllSamplePosts = () => {
    const sampleIds = listings
      .filter(l => l.id.startsWith('lst_vehicles_') || l.id.startsWith('lst_electronics_') || l.id.startsWith('lst_real_estate_') || l.id.startsWith('lst_fashion_') || l.id.startsWith('lst_furniture_') || l.id.startsWith('lst_services_') || l.id.startsWith('lst_jobs_') || l.id.startsWith('lst_beauty_') || l.id.startsWith('lst_utility_'))
      .map(l => l.id);
    if (sampleIds.length === 0) { toast.info('No sample posts remaining.'); return; }
    if (window.confirm(`⚠️ Delete ALL ${sampleIds.length} initial sample posts?`)) {
      bulkDeleteListings(sampleIds);
      toast.success(`🎉 Purged all ${sampleIds.length} sample posts!`);
    }
  };

  const filteredUsers = allUsers.filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.location.toLowerCase().includes(q);
    }
    return true;
  });

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    addAnnouncement({ title: annTitle.trim(), message: annMessage.trim(), type: annType, active: true });
    setAnnTitle(''); setAnnMessage('');
    toast.success('System broadcast announcement posted!');
  };

  const handleAddSafeSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotName.trim() || !spotAddress.trim()) return;
    addSafeSpot({ name: spotName.trim(), zone: spotZone, category: spotCategory, address: spotAddress.trim(), distance: 'Central Hub', hours: '8:00 AM - 6:00 PM', cctvVerified: true });
    setSpotName(''); setSpotAddress('');
    toast.success('New Verified Safe Exchange Spot registered!');
  };

  const handleSendMassBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;
    broadcastMassNotification(broadcastTitle.trim(), broadcastMsg.trim());
    setBroadcastTitle(''); setBroadcastMessage('');
  };

  const handleUpdateAdminPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminPass.trim() || !newAdminPin.trim()) { toast.error('All credential fields are required.'); return; }
    updateAdminCredentials(newAdminEmail.trim(), newAdminPass.trim(), newAdminPin.trim());
  };

  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPromotions = promotionPaymentRequests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-16 md:pb-0 font-sans selection:bg-rose-500 selection:text-white">
      <SEO title="Sealify Master Terminal — Real-Time Admin Hub" />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        <div className="bg-slate-900 border-2 border-rose-500/30 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow">
              <Terminal className="w-3.5 h-3.5" />
              <span>Root Administrative Access Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Sealify Command Center</h1>
            <p className="text-slate-400 text-xs leading-relaxed font-mono">Live Supabase State Sync • Node Ogbomoso • Master Cryptographic Control</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto shrink-0 z-10">
            <button onClick={() => syncDatabase()} disabled={isSyncing} className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-emerald-400 font-bold rounded-2xl text-xs border border-slate-800 flex items-center gap-1.5 transition-colors shadow">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync DB State'}</span>
            </button>
            <button onClick={dispatchPromotionalEmailDigest} className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-2xl text-xs border border-amber-500/30 flex items-center gap-1.5 transition-colors">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Dispatch Weekly Email Digest</span>
            </button>
            <button onClick={exportDatabaseBackup} className="px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold rounded-2xl text-xs border border-blue-500/30 flex items-center gap-1.5 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export DB Backup</span>
            </button>
            <button onClick={() => setIsAdminSettingsOpen(true)} className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-2xl text-xs border border-emerald-500/30 flex items-center gap-1.5 transition-colors">
              <Settings className="w-4 h-4" />
              <span>Admin Settings</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-lg">
          {[
            { id: 'overview', label: 'Overview & Analytics', icon: Activity, badge: null },
            { id: 'listings', label: 'Listings & Post Cleanup', icon: Package, badge: `${listings.length}` },
            { id: 'users', label: 'User Directory & Badges', icon: Users, badge: `${allUsers.length}` },
            { id: 'verifications', label: 'ID Verifications', icon: Award, badge: pendingVerifications.length > 0 ? `${pendingVerifications.length}` : null },
            { id: 'promotions', label: 'Top Ad Payments', icon: Crown, badge: pendingPromotions.length > 0 ? `${pendingPromotions.length}` : null },
            { id: 'disputes', label: 'Disputes & Reports', icon: Gavel, badge: disputeCases.length > 0 ? `${disputeCases.length}` : null },
            { id: 'announcements', label: 'System Notices', icon: Megaphone, badge: null },
            { id: 'safespots', label: 'Safe Spots Manager', icon: MapPin, badge: `${safeSpots.length}` },
            { id: 'security', label: 'Security & Root Config', icon: Lock, badge: intrusionLogs.length > 0 ? `!${intrusionLogs.length}` : null },
            { id: 'dbtest', label: 'Database Connection Test', icon: Database, badge: null },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id as AdminTab)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${isActive ? 'bg-rose-600 text-white font-black shadow-lg shadow-rose-950/50' : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.badge && <span className={`text-[9px] font-black px-2 py-0.2 rounded-full ${isActive ? 'bg-slate-950 text-white' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>{t.badge}</span>}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Real-time Visitors</span>
                <p className="text-3xl font-black text-emerald-400 flex items-baseline gap-2"><span>{analytics.visitors}</span><span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span></p>
                <p className="text-[10px] text-slate-400">Live Browser Sessions</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Total Classified Ads</span>
                <p className="text-3xl font-black text-blue-400">{listings.length}</p>
                <p className="text-[10px] text-slate-400">{liveUserCount} User Ads • {sampleCount} Samples</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Top Ad Revenue</span>
                <p className="text-3xl font-black text-amber-400">₦{analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">{promotionPaymentRequests.length} Transactions Logged</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Registered Profiles</span>
                <p className="text-3xl font-black text-purple-400">{allUsers.length}</p>
                <p className="text-[10px] text-slate-400">{allUsers.filter(u => u.verified).length} ID/CAC Verified</p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-950 border-2 border-rose-500/40 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-lg font-black text-white flex items-center justify-center sm:justify-start gap-2"><Trash2 className="w-5 h-5 text-rose-400" /><span>Launch Sample Post Purge Tool</span></h3>
                <p className="text-xs text-slate-300">There are currently <strong className="text-rose-400">{sampleCount} initial sample posts</strong> in the marketplace feed. You can purge them with 1-click once user content starts rolling in today!</p>
              </div>
              <button onClick={handlePurgeAllSamplePosts} className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 shrink-0">Purge All {sampleCount} Sample Posts</button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center"><h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /><span>Administrative Audit Trail</span></h3><span className="text-[10px] font-mono text-slate-500">{auditLogs.length} Events Logged</span></div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {auditLogs.length === 0 ? <p className="text-slate-500 text-xs italic py-4">No audit logs generated yet.</p> : auditLogs.slice(0, 10).map((log) => (<div key={log.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs gap-3"><div className="space-y-0.5 min-w-0"><span className="font-bold text-white block truncate">{log.action}</span><p className="text-[11px] text-slate-400 truncate">{log.details}</p></div><span className="text-[9px] font-mono text-slate-500 shrink-0">{log.createdAt}</span></div>))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full"><Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" /><input type="text" placeholder="Search listings by title, seller, or category..." value={listingSearch} onChange={(e) => setListingSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-medium" /></div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => setListingFilter('all')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${listingFilterType === 'all' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400'}`}>All ({listings.length})</button>
                  <button onClick={() => setListingFilter('sample')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${listingFilterType === 'sample' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400'}`}>Sample Mock Posts ({sampleCount})</button>
                  <button onClick={() => setListingFilter('live')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${listingFilterType === 'live' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400'}`}>User Live Content ({liveUserCount})</button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs flex-wrap gap-2">
                <button onClick={handleSelectAllListings} className="flex items-center gap-1.5 font-bold text-slate-300 hover:text-white">{selectedListingIds.length === filteredListings.length && filteredListings.length > 0 ? <CheckSquare className="w-4 h-4 text-rose-500" /> : <Square className="w-4 h-4 text-slate-600" />}<span>Select All Filtered ({selectedListingIds.length} Selected)</span></button>
                {selectedListingIds.length > 0 && <div className="flex items-center gap-2"><button onClick={handleBulkPurgeSelected} className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs uppercase shadow flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /><span>Delete {selectedListingIds.length} Selected</span></button></div>}
              </div>
            </div>
            <div className="space-y-2">
              {filteredListings.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">No listings found for this filter query.</div>
              ) : (
                filteredListings.map((ad) => {
                  const isSample = ad.id.startsWith('lst_vehicles_') || ad.id.startsWith('lst_electronics_') || ad.id.startsWith('lst_real_estate_') || ad.id.startsWith('lst_fashion_') || ad.id.startsWith('lst_furniture_') || ad.id.startsWith('lst_services_') || ad.id.startsWith('lst_jobs_') || ad.id.startsWith('lst_beauty_') || ad.id.startsWith('lst_utility_');
                  const isSelected = selectedListingIds.includes(ad.id);
                  return (
                    <div key={ad.id} className={`p-4 bg-slate-900 border rounded-2xl flex items-center justify-between gap-4 transition-all ${isSelected ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <button type="button" onClick={() => handleToggleListingSelection(ad.id)} className="text-slate-500 hover:text-rose-400">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-rose-500" /> : <Square className="w-4 h-4" />}
                        </button>
                        <img src={ad.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-950 shrink-0" />
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-white truncate">{ad.title}</h4>
                            {isSample ? (
                              <span className="text-[8px] font-black uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">SAMPLE</span>
                            ) : (
                              <span className="text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500">LIVE USER</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">₦{ad.price.toLocaleString()} • {ad.category} • Seller: <strong className="text-slate-200">{ad.sellerName}</strong></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => updateListing(ad.id, { featured: !listings.find(l => l.id === ad.id)?.featured })} className={`p-2 rounded-xl text-xs font-bold border transition-colors ${ad.featured ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-950 text-slate-500 border-slate-800'}`} title="Toggle Top Ad Boost">
                          <Crown className="w-4 h-4" />
                        </button>
                        <a href={`/listing/${ad.id}`} target="_blank" rel="noreferrer" className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800" title="Preview Listing">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button onClick={() => { if (window.confirm(`Delete listing "${ad.title}"?`)) { deleteListing(ad.id); toast.success('Listing deleted!'); } }} className="p-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl border border-rose-500/20 transition-all" title="Purge Ad">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="relative flex-1 w-full"><Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" /><input type="text" placeholder="Search user by name, email, or location..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-medium" /></div>
              <div className="flex items-center gap-1.5 shrink-0">{(['all', 'buyer', 'seller', 'admin'] as const).map(role => (<button key={role} onClick={() => setUserRoleFilter(role)} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${userRoleFilter === role ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400'}`}>{role}</button>))}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((u) => (<div key={u.id} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl relative group"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><img src={u.avatarUrl || '/logo.png'} alt="" className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-800 bg-slate-950" /><div><div className="flex items-center gap-1.5"><h4 className="font-extrabold text-sm text-white">{u.fullName}</h4><VerifiedBadge type={u.verificationType || 'none'} /></div><p className="text-xs text-slate-400 font-mono">{u.email}</p><p className="text-[10px] text-slate-500 mt-0.5">{u.location || 'Ogbomoso, Oyo State'}</p></div></div><span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-rose-600 text-white' : u.role === 'seller' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>{u.role}</span></div><div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${u.status === 'active' || !u.status ? 'bg-emerald-400' : 'bg-rose-500'}`}></span><span className="text-[11px] font-bold capitalize text-slate-300">{u.status || 'active'}</span></div><div className="flex items-center gap-2"><button onClick={() => setEditingUser(u)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs border border-slate-700 transition-colors">Edit Record / Permissions</button></div></div></div>))}
            </div>
            <div className="flex items-center gap-2 mt-4"><button onClick={() => setEditingUser({ id: '', fullName: '', email: '', phoneNumber: '', location: '', businessName: '', role: 'buyer', verified: false } as UserProfile)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow flex items-center gap-1.5"><Plus className="w-4 h-4" /><span className="hidden sm:inline">Add User</span></button></div>
            <AdminEditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(id, updated) => { if (id) { updateUser(id, updated); } else { addUser(updated); } }} />
          </div>
        )}

        {activeTab === 'verifications' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-black text-white flex items-center gap-2"><Award className="w-5 h-5 text-amber-400" /><span>Badge Verification Request Queue ({verificationRequests.length})</span></h3>
            {verificationRequests.length === 0 ? <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">No ID or CAC verification applications in queue.</div> : <div className="space-y-3">{verificationRequests.map((req) => (<div key={req.id} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl"><div className="flex justify-between items-start"><div><h4 className="font-extrabold text-sm text-white">{req.userName}</h4><p className="text-xs text-slate-400 font-mono">{req.userEmail} • ID Number: {req.docNumber}</p></div><span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${req.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-600/20 text-rose-400'}`}>{req.status}</span></div>{req.docUrl && <div className="p-2 bg-slate-950 rounded-2xl border border-slate-800 max-w-xs"><img src={req.docUrl} alt="Submitted Document" className="w-full h-32 object-cover rounded-xl" /></div>}{req.status === 'pending' && <div className="flex gap-2 pt-2 border-t border-slate-800"><button onClick={() => { processVerificationRequest(req.id, 'approved'); updateUser(req.userId, { verified: true, verificationType: req.type }); toast.success(`Badge "${req.type}" approved for ${req.userName}!`); }} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow">Approve Verification Badge</button><button onClick={() => { processVerificationRequest(req.id, 'rejected'); toast.error(`Verification rejected for ${req.userName}.`); }} className="px-5 py-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-colors">Decline Request</button></div>}</div>))}</div>}
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-black text-white flex items-center gap-2"><Crown className="w-5 h-5 text-amber-400" /><span>Top Ad Promotion Payment Receipts</span></h3>
            {promotionPaymentRequests.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">No promotion payment claims logged.</div>
            ) : (
              <div className="space-y-3">
                {promotionPaymentRequests.map((req) => (
                  <div key={req.id} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">{req.planName} ({req.durationMonths} Months)</span>
                        <p className="text-xl font-black text-emerald-400">₦{req.amount.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">Listing ID: <strong className="text-white font-mono">{req.listingId}</strong></p>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${req.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-600/20 text-rose-400'}`}>
                        {req.status}
                      </span>
                    </div>
                    {req.paymentProofUrl && (
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                        {req.paymentProofUrl.startsWith('data:image') || req.paymentProofUrl.startsWith('http') ? (
                          <img src={req.paymentProofUrl} alt="Receipt" className="max-h-40 rounded-xl" />
                        ) : (
                          <p className="font-mono text-xs text-emerald-400">{req.paymentProofUrl}</p>
                        )}
                      </div>
                    )}
                    {req.status === 'pending' && (
                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            processPromotionPaymentRequest(req.id, 'approved');
                            updateListing(req.listingId, { featured: true });
                            toast.success(`Top Ad Boost activated for Listing ID ${req.listingId}!`);
                          }}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow"
                        >
                          Approve Payment & Activate Top Ad
                        </button>
                        <button
                          onClick={() => {
                            processPromotionPaymentRequest(req.id, 'rejected');
                            toast.error('Payment claim rejected.');
                          }}
                          className="px-5 py-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Reject Payment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-black text-white flex items-center gap-2"><Gavel className="w-5 h-5 text-rose-400" /><span>Marketplace Trade Disputes & Ad Reports</span></h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"><h4 className="font-bold text-xs uppercase tracking-wider text-rose-400">Trade Disputes ({disputeCases.length})</h4><div className="space-y-3">{disputeCases.map((disp) => (<div key={disp.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2"><div className="flex justify-between items-start"><span className="font-bold text-xs text-white">{disp.itemTitle}</span><span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{disp.status}</span></div><p className="text-xs text-slate-400">Counterparty: {disp.counterparty}</p><p className="text-[11px] text-slate-300 leading-relaxed italic">"{disp.details}"</p><div className="pt-2 flex gap-2"><button onClick={() => processDisputeCase(disp.id, 'resolved')} className="px-3 py-1 bg-emerald-500 text-slate-950 font-extrabold rounded-lg text-[10px]">Mark Resolved</button></div></div>))}</div></div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"><h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">Ad Safety Reports ({reports.length})</h4><div className="space-y-3">{reports.map((rep) => (<div key={rep.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2"><div className="flex justify-between items-start"><span className="font-bold text-xs text-white">{rep.listingTitle}</span><span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">{rep.reason}</span></div><p className="text-[11px] text-slate-400">{rep.details}</p><div className="pt-2 flex gap-2"><button onClick={() => { deleteListing(rep.listingId); processReport(rep.id, 'resolve_delete_ad'); toast.success('Ad dropped and report resolved.'); }} className="px-3 py-1 bg-rose-600 text-white font-extrabold rounded-lg text-[10px]">Drop Reported Ad</button><button onClick={() => processReport(rep.id, 'dismiss')} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px]">Dismiss Report</button></div></div>))}</div></div>
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"><h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2"><Megaphone className="w-4 h-4 text-emerald-400" /><span>Post App Banner Announcement</span></h3><form onSubmit={handlePostAnnouncement} className="space-y-3 text-xs"><input type="text" required value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="Headline Title (e.g. LAUTECH Gate Safe Spot Live)" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500" /><textarea rows={3} required value={annMessage} onChange={(e) => setAnnMessage(e.target.value)} placeholder="Announcement message body..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500" /><select value={annType} onChange={(e) => setAnnType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"><option value="info">Info (Blue)</option><option value="warning">Warning (Amber)</option><option value="success">Success (Emerald)</option><option value="alert">Alert (Rose)</option></select><button type="submit" className="w-full py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow">Publish Banner Announcement</button></form></div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"><h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2"><Radio className="w-4 h-4 text-purple-400" /><span>Push Broadcast to All User Inboxes</span></h3><form onSubmit={handleSendMassBroadcast} className="space-y-3 text-xs"><input type="text" required value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} placeholder="Broadcast Subject Headline" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500" /><textarea rows={4} required value={broadcastMsg} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Enter broadcast message body..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500" /><button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl text-xs shadow">Send Mass Notification to {allUsers.length} Users</button></form></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3"><h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Active System Banners</h4><div className="space-y-2">{announcements.map((ann) => (<div key={ann.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"><div><span className="font-extrabold text-white">{ann.title}: </span><span className="text-slate-300">{ann.message}</span></div><button onClick={() => deleteAnnouncement(ann.id)} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button></div>))}</div></div>
          </div>
        )}

        {activeTab === 'safespots' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"><h3 className="font-black text-sm text-white uppercase tracking-wider">Register Safe Exchange Spot</h3><form onSubmit={handleAddSafeSpot} className="space-y-3 text-xs"><input type="text" required value={spotName} onChange={(e) => setSpotName(e.target.value)} placeholder="Spot Name (e.g. LAUTECH Library Gate)" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none" /><select value={spotZone} onChange={(e) => setSpotZone(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"><option value="LAUTECH Area">LAUTECH Area</option><option value="Takie / Center">Takie / Center</option><option value="Sabo Market Zone">Sabo Market Zone</option><option value="Police HQ">Police HQ</option></select><select value={spotCategory} onChange={(e) => setSpotCategory(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"><option value="Police Safe Zone">Police Safe Zone</option><option value="Public Library">Public Library</option><option value="Shopping Mall">Shopping Mall</option><option value="Café">Café</option></select><input type="text" required value={spotAddress} onChange={(e) => setSpotAddress(e.target.value)} placeholder="Full Address" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none" /><button type="submit" className="w-full py-3 bg-teal-500 text-slate-950 font-black rounded-xl text-xs shadow">Register Exchange Location</button></form></div>
              <div className="lg:col-span-7 space-y-3"><h3 className="font-black text-sm text-white uppercase tracking-wider">Active Verified Safe Spots ({safeSpots.length})</h3><div className="space-y-2 max-h-96 overflow-y-auto pr-1">{safeSpots.map((spot) => (<div key={spot.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs"><div><h4 className="font-extrabold text-white">{spot.name}</h4><p className="text-[11px] text-slate-400">{spot.zone} • {spot.address}</p></div><button onClick={() => deleteSafeSpot(spot.id)} className="p-2 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button></div>))}</div></div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-xl"><h3 className="font-black text-sm text-rose-400 uppercase tracking-widest flex items-center gap-2"><Lock className="w-4 h-4" /><span>Update Root Credentials & PIN</span></h3><form onSubmit={handleUpdateAdminPass} className="space-y-3 text-xs"><div className="space-y-1"><label className="text-slate-400 font-bold uppercase">Admin Login Email</label><input type="email" required value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none font-mono" /></div><div className="space-y-1"><label className="text-slate-400 font-bold uppercase">Admin Access Password</label><input type="text" required value={newAdminPass} onChange={(e) => setNewAdminPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono tracking-wider" /></div><div className="space-y-1"><label className="text-slate-400 font-bold uppercase">6-Digit Master Security PIN</label><input type="text" required maxLength={6} value={newAdminPin} onChange={(e) => setNewAdminPin(e.target.value)} className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-4 py-2.5 text-rose-400 font-black focus:outline-none font-mono tracking-widest" /></div><button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-lg uppercase tracking-wider">Save New Master Credentials</button></form></div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"><h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-emerald-400" /><span>Global Platform Switches</span></h3><div className="space-y-3 text-xs"><div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between"><div><p className="font-bold text-white">Maintenance Mode</p><p className="text-[10px] text-slate-500">Locks public marketplace feed for updates</p></div><button type="button" onClick={() => updateSystemConfig({ maintenanceMode: !systemConfig.maintenanceMode })} className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${systemConfig.maintenanceMode ? 'bg-rose-600' : 'bg-slate-800'}`}><div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${systemConfig.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`}></div></button></div><div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between"><div><p className="font-bold text-white">Auto-Approve Classified Ads</p><p className="text-[10px] text-slate-500">Post listings instantly without admin pre-review</p></div><button type="button" onClick={() => updateSystemConfig({ autoApproveAds: !systemConfig.autoApproveAds })} className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${systemConfig.autoApproveAds ? 'bg-emerald-500' : 'bg-slate-800'}`}><div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${systemConfig.autoApproveAds ? 'translate-x-5' : 'translate-x-0'}`}></div></button></div><button type="button" onClick={() => setIsSqlSchemaOpen(true)} className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-emerald-400 font-bold rounded-2xl text-xs border border-emerald-500/30 flex items-center justify-center gap-2 transition-colors"><Database className="w-4 h-4" /><span>View Supabase SQL Schema Migration Script</span></button></div></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"><h3 className="font-black text-sm text-rose-400 uppercase tracking-widest flex items-center gap-2"><Siren className="w-4 h-4" /><span>Unauthorized Intrusion & Wrong Password Attempts</span></h3><div className="space-y-2 max-h-56 overflow-y-auto pr-1">{intrusionLogs.length === 0 ? <p className="text-slate-500 text-xs italic py-4">No unauthorized access attempts recorded.</p> : intrusionLogs.map((log) => (<div key={log.id} className="p-3 bg-slate-950 border border-rose-500/20 rounded-2xl text-xs space-y-1"><div className="flex justify-between items-center"><span className="font-mono font-bold text-rose-400">{log.attemptedEmail}</span><span className="text-[9px] font-mono text-slate-500">{log.timestamp}</span></div><p className="text-[10px] text-slate-400 font-mono">{log.mediaStatus}</p></div>))}</div></div>
          </div>
        )}

        {activeTab === 'dbtest' && (
          <div className="animate-in fade-in duration-300">
            <DatabaseTest />
          </div>
        )}

      </main>

      <Footer />
      <MobileNav />
      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <CompareModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />
      <SavedAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
      <AiShoppingAssistantModal isOpen={isAiCopilotOpen} onClose={() => setIsAiCopilotOpen(false)} />
      <SqlSchemaViewer isOpen={isSqlSchemaOpen} onClose={() => setIsSqlSchemaOpen(false)} />
      <AdminSettingsModal isOpen={isAdminSettingsOpen} onClose={() => setIsAdminSettingsOpen(false)} />
    </div>
  );
}