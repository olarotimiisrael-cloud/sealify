"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import AdminEditUserModal from '../components/AdminEditUserModal';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import FilterDrawer from '../components/FilterDrawer';
import CompareModal from '../components/CompareModal';
import SavedAlertsModal from '../components/SavedAlertsModal';
import AiShoppingAssistantModal from '../components/AiShoppingAssistantModal';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
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
  RefreshCw
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
  | 'security';

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

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Modal Controls
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlSchemaOpen, setIsSqlSchemaOpen] = useState(false);

  // Listing Selection State for Sample Cleanup Tools
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [listingSearch, setListingSearch] = useState('');
  const [listingFilterType, setListingFilter] = useState<'all' | 'sample' | 'live'>('all');

  // User Search State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'buyer' | 'seller' | 'admin'>('all');

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');

  // Safe Spot Form State
  const [spotName, setSpotName] = useState('');
  const [spotZone, setSpotZone] = useState<'LAUTECH Area' | 'Takie / Center' | 'Sabo Market Zone' | 'Police HQ'>('Takie / Center');
  const [spotCategory, setSpotCategory] = useState<'Police Safe Zone' | 'Public Library' | 'Shopping Mall' | 'Cafe'>('Police Safe Zone');
  const [spotAddress, setSpotAddress] = useState('');

  // Mass Broadcast Modal
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMessage] = useState('');

  // Credentials Updater
  const [newAdminEmail, setNewAdminEmail] = useState(adminEmail);
  const [newAdminPass, setNewAdminPassword] = useState(adminPassword);
  const [newAdminPin, setNewAdminPin] = useState(adminPin);

  // Modals
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

  // Listing filter computation
  const filteredListings = listings.filter((l) => {
    const isSample = l.id.startsWith('lst_vehicles_') || l.id.startsWith('lst_electronics_') || l.id.startsWith('lst_real_estate_') || l.id.startsWith('lst_fashion_') || l.id.startsWith('lst_furniture_') || l.id.startsWith('lst_services_') || l.id.startsWith('lst_jobs_') || l.id.startsWith('lst_beauty_') || l.id.startsWith('lst_utility_');

    if (listingFilterType === 'sample' && !isSample) return false;
    if (listingFilterType === 'live' && isSample) return false;

    if (listingSearch.trim()) {
      const q = listingSearch.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.sellerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sampleCount = listings.filter(l => l.id.startsWith('lst_vehicles_') || l.id.startsWith('lst_electronics_') || l.id.startsWith('lst_real_estate_') || l.id.startsWith('lst_fashion_') || l.id.startsWith('lst_furniture_') || l.id.startsWith('lst_services_') || l.id.startsWith('lst_jobs_') || l.id.startsWith('lst_beauty_') || l.id.startsWith('lst_utility_')).length;
  const liveUserCount = listings.length - sampleCount;

  // Selection handlers
  const handleSelectAllListings = () => {
    if (selectedListingIds.length === filteredListings.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(filteredListings.map(l => l.id));
    }
  };

  const handleToggleListingSelection = (id: string) => {
    setSelectedListingIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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

    if (sampleIds.length === 0) {
      toast.info('No sample posts remaining in database feed.');
      return;
    }

    if (window.confirm(`⚠️ LAUNCH CLEANUP PROTOCOL: Delete ALL ${sampleIds.length} initial sample posts to leave only real user content?`)) {
      bulkDeleteListings(sampleIds);
      toast.success(`🎉 Purged all ${sampleIds.length} initial sample posts! Marketplace feed is now 100% user-generated.`);
    }
  };

  // User Filter
  const filteredUsers = allUsers.filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.location.toLowerCase().includes(q);
    }
    return true;
  });

  // Forms Submit Handlers
  const handlePostAnnouncement = (e: React.FormEvent) => {
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
    toast.success('System broadcast announcement posted!');
  };

  const handleAddSafeSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotName.trim() || !spotAddress.trim()) return;

    addSafeSpot({
      name: spotName.trim(),
      zone: spotZone,
      category: spotCategory,
      address: spotAddress.trim(),
      distance: 'Central Hub',
      hours: '8:00 AM - 6:00 PM',
      cctvVerified: true
    });

    setSpotName('');
    setSpotAddress('');
    toast.success('New Verified Safe Exchange Spot registered!');
  };

  const handleSendMassBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;

    broadcastMassNotification(broadcastTitle.trim(), broadcastMsg.trim());
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const handleUpdateAdminPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminPass.trim() || !newAdminPin.trim()) {
      toast.error('All credential fields are required.');
      return;
    }

    updateAdminCredentials(newAdminEmail.trim(), newAdminPass.trim(), newAdminPin.trim());
  };

  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPromotions = promotionPaymentRequests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-16 md:pb-0 font-sans selection:bg-rose-500 selection:text-white">
      <SEO title="Sealify Master Terminal — Real-Time Admin Hub" />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        
        {/* Terminal Header */}
        <div className="bg-slate-900 border-2 border-rose-500/30 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow">
              <Terminal className="w-3.5 h-3.5" />
              <span>Root Administrative Access Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sealify Command Center
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed font-mono">
              Live Supabase State Sync • Node Ogbomoso • Master Cryptographic Control
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto shrink-0 z-10">
            <button
              onClick={() => syncDatabase()}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-emerald-400 font-bold rounded-2xl text-xs border border-slate-800 flex items-center gap-1.5 transition-colors shadow"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync DB State'}</span>
            </button>

            <button
              onClick={dispatchPromotionalEmailDigest}
              className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-2xl text-xs border border-amber-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Dispatch Weekly Email Digest</span>
            </button>

            <button
              onClick={exportDatabaseBackup}
              className="px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold rounded-2xl text-xs border border-blue-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export DB Backup</span>
            </button>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-lg">
          {[\n            { id: 'overview', label: 'Overview & Analytics', icon: Activity, badge: null },\n            { id: 'listings', label: 'Listings & Post Cleanup', icon: Package, badge: `${listings.length}` },\n            { id: 'users', label: 'User Directory & Badges', icon: Users, badge: `${allUsers.length}` },\n            { id: 'verifications', label: 'ID Verifications', icon: Award, badge: pendingVerifications.length > 0 ? `${pendingVerifications.length}` : null },\n            { id: 'promotions', label: 'Top Ad Payments', icon: Crown, badge: pendingPromotions.length > 0 ? `${pendingPromotions.length}` : null },\n            { id: 'disputes', label: 'Disputes & Reports', icon: Gavel, badge: disputeCases.length > 0 ? `${disputeCases.length}` : null },\n            { id: 'announcements', label: 'System Notices', icon: Megaphone, badge: null },\n            { id: 'safespots', label: 'Safe Spots Manager', icon: MapPin, badge: `${safeSpots.length}` },\n            { id: 'security', label: 'Security & Root Config', icon: Lock, badge: intrusionLogs.length > 0 ? `!${intrusionLogs.length}` : null },\n          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as AdminTab)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-rose-600 text-white font-black shadow-lg shadow-rose-950/50'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.badge && (
                  <span className={`text-[9px] font-black px-2 py-0.2 rounded-full ${isActive ? 'bg-slate-950 text-white' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & REAL-TIME ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Real-time Visitors</span>
                <p className="text-3xl font-black text-emerald-400 flex items-baseline gap-2">
                  <span>{analytics.visitors}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </p>
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

            {/* Quick Action Banner for Sample Cleanup */}
            <div className="p-6 bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-950 border-2 border-rose-500/40 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-lg font-black text-white flex items-center justify-center sm:justify-start gap-2">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                  <span>Launch Sample Post Purge Tool</span>
                </h3>
                <p className="text-xs text-slate-300">
                  There are currently <strong className="text-rose-400">{sampleCount} initial sample posts</strong> in the marketplace feed. You can purge them with 1-click once user content starts rolling in today!
                </p>
              </div>

              <button
                onClick={handlePurgeAllSamplePosts}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 shrink-0"
              >
                Purge All {sampleCount} Sample Posts
              </button>
            </div>

            {/* Audit Trail Log */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Administrative Audit Trail</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">{auditLogs.length} Events Logged</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <p className="text-slate-500 text-xs italic py-4">No audit logs generated yet.</p>
                ) : (
                  auditLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-bold text-white block truncate">{log.action}</span>
                        <p className="text-[11px] text-slate-400 truncate">{log.details}</p>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0">{log.createdAt}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LISTINGS & SAMPLE POST CLEANUP */}
        {activeTab === 'listings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search listings by title, seller, or category..."
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setListingFilter('all')}\n                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${listingFilterType === 'all' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400'}`}\n                  >\n                    All ({listings.length})\n                  </button>\n                  <button\n                    onClick={() => setListingFilter('sample')}\n                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${listingFilterType === 'sample' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400'}`}\n                  >\n                    Sample Mock Posts ({sampleCount})\n                  </button>\n                  <button\n                    onClick={() => setListingFilter('live')}\n                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${listingFilterType === 'live' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400'}`}\n                  >\n                    User Live Content ({liveUserCount})\n                  </button>\n                </div>\n              </div>\n\n              {/* Bulk Action Controls */}\n              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs flex-wrap gap-2\">\n                <button\n                  onClick={handleSelectAllListings}\n                  className="flex items-center gap-1.5 font-bold text-slate-300 hover:text-white"\n                >\n                  {selectedListingIds.length === filteredListings.length && filteredListings.length > 0 ? (\n                    <CheckSquare className="w-4 h-4 text-rose-500" />\n                  ) : (\n                    <Square className="w-4 h-4 text-slate-600" />\n                  )}\n                  <span>Select All Filtered ({selectedListingIds.length} Selected)</span>\n                </button>\n\n                {selectedListingIds.length > 0 && (\n                  <div className="flex items-center gap-2\">\n                    <button\n                      onClick={handleBulkPurgeSelected}\n                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs uppercase shadow flex items-center gap-1"\n                    >\n                      <Trash2 className="w-3.5 h-3.5" />\n                      <span>Delete {selectedListingIds.length} Selected</span>\n                    </button>\n                  </div>\n                )}\n              </div>\n            </div>\n\n            {/* Listings Grid / Table */}\n            <div className="space-y-2\">\n              {filteredListings.length === 0 ? (\n                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs\">\n                  No listings found for this filter query.\n                </div>\n              ) : (\n                filteredListings.map((ad) => {\n                  const isSample = ad.id.startsWith('lst_vehicles_') || ad.id.startsWith('lst_electronics_') || ad.id.startsWith('lst_real_estate_') || ad.id.startsWith('lst_fashion_') || ad.id.startsWith('lst_furniture_') || ad.id.startsWith('lst_services_') || ad.id.startsWith('lst_jobs_') || ad.id.startsWith('lst_beauty_') || ad.id.startsWith('lst_utility_');\n                  const isSelected = selectedListingIds.includes(ad.id);\n\n                  return (\n                    <div\n                      key={ad.id}\n                      className={`p-4 bg-slate-900 border rounded-2xl flex items-center justify-between gap-4 transition-all ${\n                        isSelected ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800'\n                      }`}\n                    >\n                      <div className="flex items-center gap-3 min-w-0\">\n                        <button\n                          type=\"button\"\n                          onClick={() => handleToggleListingSelection(ad.id)}\n                          className="text-slate-500 hover:text-rose-400"\n                        >\n                          {isSelected ? <CheckSquare className="w-4 h-4 text-rose-500" /> : <Square className="w-4 h-4" />}\n                        </button>\n\n                        <img\n                          src={ad.images[0]}\n                          alt=\"\"\n                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-950 shrink-0"\n                        />\n\n                        <div className="min-w-0 space-y-0.5\">\n                          <div className="flex items-center gap-2\">\n                            <h4 className="font-bold text-xs text-white truncate">{ad.title}</h4>\n                            {isSample ? (\n                              <span className="text-[8px] font-black uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">\n                                SAMPLE\n                              </span>\n                            ) : (\n                              <span className="text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">\n                                LIVE USER\n                              </span>\n                            )}\n                          </div>\n                          <p className="text-[11px] text-slate-400\">\n                            ₦{ad.price.toLocaleString()} • {ad.category} • Seller: <strong className="text-slate-200">{ad.sellerName}</strong>\n                          </p>\n                        </div>\n                      </div>\n\n                      <div className="flex items-center gap-2 shrink-0\">\n                        <button\n                          onClick={() => updateListing(ad.id, { featured: !listings.find(l => l.id === ad.id)?.featured })}\n                          className={`p-2 rounded-xl text-xs font-bold border transition-colors ${\n                            ad.featured ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-950 text-slate-500 border-slate-800'\n                          }`}\n                          title=\"Toggle Top Ad Boost\"\n                        >\n                          <Crown className="w-4 h-4" />\n                        </button>\n\n                        <a\n                          href={`/listing/${ad.id}`}\n                          target=\"_blank\"\n                          rel=\"noreferrer\"\n                          className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800\"\n                          title=\"Preview Listing\"\n                        >\n                          <ExternalLink className="w-4 h-4" />\n                        </a>\n\n                        <button\n                          onClick={() => {\n                            if (window.confirm(`Delete listing \"${ad.title}\"?`)) {\n                              deleteListing(ad.id);\n                              toast.success('Listing deleted!');\n                            }\n                          }}\n                          className="p-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl border border-rose-500/20 transition-all\"\n                          title=\"Purge Ad\"\n                        >\n                          <Trash2 className="w-4 h-4" />\n                        </button>\n                      </div>\n                    </div>\n                  );\n                })\n              )}\n            </div>\n          </div>\n        )}\n\n        {/* TAB 3: USER DIRECTORY & BADGES */}\n        {activeTab === 'users' && (\n          <div className="space-y-6 animate-in fade-in duration-300">\n            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl\">\n              <div className="relative flex-1 w-full">\n                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />\n                <input\n                  type="text"\n                  placeholder="Search user by name, email, or location..."\n                  value={userSearch}\n                  onChange={(e) => setUserSearch(e.target.value)}\n                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"\n                />\n              </div>\n\n              <div className="flex items-center gap-1.5 shrink-0">\n                {(['all', 'buyer', 'seller', 'admin'] as const).map(role => (\n                  <button\n                    key={role}\n                    onClick={() => setUserRoleFilter(role)}\n                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${userRoleFilter === role ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400'}`}\n                  >\n                    {role}\n                  </button>\n                ))}\n              </div>\n            </div>\n\n            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n              {filteredUsers.map((u) => (\n                <div key={u.id} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl relative group\">\n                  <div className="flex items-start justify-between gap-3">\n                    <div className="flex items-center gap-3">\n                      <img\n                        src={u.avatarUrl || '/logo.png'}\n                        alt=\"\"\n                        className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-800 bg-slate-950"\n                      />\n                      <div>\n                        <div className="flex items-center gap-1.5">\n                          <h4 className="font-extrabold text-sm text-white">{u.fullName}</h4>\n                          <VerifiedBadge type={u.verificationType || 'none'} />\n                        </div>\n                        <p className="text-xs text-slate-400 font-mono">{u.email}</p>\n                        <p className="text-[10px] text-slate-500 mt-0.5">{u.location || 'Ogbomoso, Oyo State'}</p>\n                      </div>\n                    </div>\n\n                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-rose-600 text-white' : u.role === 'seller' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>\n                      {u.role}\n                    </span>\n                  </div>\n\n                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">\n                    <div className="flex items-center gap-2">\n                      <span className={`w-2 h-2 rounded-full ${u.status === 'active' || !u.status ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>\n                      <span className="text-[11px] font-bold capitalize text-slate-300">{u.status || 'active'}</span>\n                    </div>\n\n                    <div className="flex items-center gap-2">\n                      <button\n                        onClick={() => setEditingUser(u)}\n                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs border border-slate-700 transition-colors"\n                      >\n                        Edit Record / Permissions\n                      </button>\n                    </div>\n                  </div>\n                </div>\n              ))}\n            </div>\n\n            {/* Add New User Button */}\n            <div className="flex items-center gap-2 mt-4">\n              <button\n                onClick={() => setEditingUser({ id: '', fullName: '', email: '', phoneNumber: '', location: '', businessName: '', role: 'buyer', verified: false } as UserProfile)}\n                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow flex items-center gap-1.5"\n              >\n                <Plus className="w-4 h-4" />\n                <span className="hidden sm:inline">Add User</span>\n              </button>\n            </div>\n\n            <AdminEditUserModal\n              user={editingUser}\n              onClose={() => setEditingUser(null)}\n              onSave={(id, updated) => {\n                if (id) {\n                  updateUser(id, updated);\n                } else {\n                  addUser(updated);\n                }\n              }}\n            />\n          </div>\n        )}\n\n        {/* TAB 4: VERIFICATIONS APPROVAL QUEUE */}\n        {activeTab === 'verifications' && (\n          <div className="space-y-6 animate-in fade-in duration-300">\n            <h3 className="text-lg font-black text-white flex items-center gap-2">\n              <Award className="w-5 h-5 text-amber-400" />\n              <span>Badge Verification Request Queue ({verificationRequests.length})</span>\n            </h3>\n\n            {verificationRequests.length === 0 ? (\n              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs\">\n                No ID or CAC verification applications in queue.\n              </div>\n            ) : (\n              <div className="space-y-3\">\n                {verificationRequests.map((req) => (\n                  <div key={req.id} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl\">\n                    <div className="flex justify-between items-start">\n                      <div>\n                        <h4 className="font-extrabold text-sm text-white">{req.userName}</h4>\n                        <p className="text-xs text-slate-400 font-mono">{req.userEmail} • ID Number: {req.docNumber}</p>\n                      </div>\n\n                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${req.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-600/20 text-rose-400'}`}>\n                        {req.status}\n                      </span>\n                    </div>\n\n                    {req.docUrl && (\n                      <div className="p-2 bg-slate-950 rounded-2xl border border-slate-800 max-w-xs\">\n                        <img src={req.docUrl} alt=\"Submitted Document\" className="w-full h-32 object-cover rounded-xl" />\n                      </div>\n                    )}\n\n                    {req.status === 'pending' && (\n                      <div className="flex gap-2 pt-2 border-t border-slate-800\">\n                        <button\n                          onClick={() => {\n                            processVerificationRequest(req.id, 'approved');\n                            updateUser(req.userId, { verified: true, verificationType: req.type });\n                            toast.success(`Badge \"${req.type}\" approved for ${req.userName}!`);\n                          }}\n                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow\"\n                        >\n                          Approve Verification Badge\n                        </button>\n                        <button\n                          onClick={() => {\n                            processVerificationRequest(req.id, 'rejected');\n                            toast.error(`Verification rejected for ${req.userName}.`);\n                          }}\n                          className="px-5 py-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-colors\"\n                        >\n                          Decline Request\n                        </button>\n                      </div>\n                    )}\n                  </div>\n                ))}\n              </div>\n            )}\n          </div>\n        )}\n\n        {/* TAB 5: PROMOTIONS & TOP AD PAYMENTS */}\n        {activeTab === 'promotions' && (\n          <div className="space-y-6 animate-in fade-in duration-300">\n            <h3 className="text-lg font-black text-white flex items-center gap-2">\n              <Crown className="w-5 h-5 text-amber-400" />\n              <span>Top Ad Promotion Payment Receipts</span>\n            </h3>\n\n            {promotionPaymentRequests.length === 0 ? (\n              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs\">\n                No promotion payment claims logged.\n              </div>\n            ) : (\n              <div className="space-y-3\">\n                {promotionPaymentRequests.map((req) => (\n                  <div key={req.id} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl\">\n                    <div className="flex justify-between items-start"> \n                      <div>\n                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">{req.planName} ({req.durationMonths} Months)</span>\n                        <p className="text-xl font-black text-emerald-400">₦{req.amount.toLocaleString()}</p>\n                        <p className="text-xs text-slate-400">Listing ID: <strong className="text-white font-mono">{req.listingId}</strong></p>\n                      </div>\n\n                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${req.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-600/20 text-rose-400'}`}>\n                        {req.status}\n                      </span>\n                    </div>\n\n                    {req.paymentProofUrl && (\n                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800\">\n                        {req.paymentProofUrl.startsWith('data:image') || req.paymentProofUrl.startsWith('http') ? (\n                          <img src={req.paymentProofUrl} alt=\"Receipt\" className="max-h-40 rounded-xl" />\n                        ) : (\n                          <p className="font-mono text-xs text-emerald-400">{req.paymentProofUrl}</p>\n                        )}\n                      </div>\n                    )}\n\n                    {req.status === 'pending' && (\n                      <div className="flex gap-2 pt-2 border-t border-slate-800\">\n                        <button\n                          onClick={() => {\n                            processPromotionPaymentRequest(req.id, 'approved');\n                            updateListing(req.listingId, { featured: true });\n                            toast.success(`Top Ad Boost activated for Listing ID ${req.listingId}!`);\n                          }}\n                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow\"\n                        >\n                          Approve Payment & Activate Top Ad\n                        </button>\n                        <button\n                          onClick={() => {\n                            processPromotionPaymentRequest(req.id, 'rejected');\n                            toast.error('Payment claim rejected.');\n                          }}\n                          className="px-5 py-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-colors\"\n                        >\n                          Reject Payment\n                        </button>\n                      </div>\n                    )}\n                  </div>\n                ))}\n              </div>\n            )}\n          </div>\n        )}\n\n        {/* TAB 6: DISPUTES & SAFETY REPORTS */}\n        {activeTab === 'disputes' && (\n          <div className="space-y-6 animate-in fade-in duration-300"> \n            <h3 className="text-lg font-black text-white flex items-center gap-2">\n              <Gavel className="w-5 h-5 text-rose-400" />\n              <span>Marketplace Trade Disputes & Ad Reports</span>\n            </h3>\n\n            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">\n              {/* Disputes List */}\n              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">\n                <h4 className="font-bold text-xs uppercase tracking-wider text-rose-400">Trade Disputes ({disputeCases.length})</h4>\n                <div className="space-y-3">\n                  {disputeCases.map((disp) => (\n                    <div key={disp.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2\">\n                      <div className="flex justify-between items-start">\n                        <span className="font-bold text-xs text-white">{disp.itemTitle}</span>\n                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{disp.status}</span>\n                      </div>\n                      <p className="text-xs text-slate-400">Counterparty: {disp.counterparty}</p>\n                      <p className="text-[11px] text-slate-300 leading-relaxed italic\">\"{disp.details}\"</p>\n\n                      <div className="pt-2 flex gap-2">\n                        <button\n                          onClick={() => processDisputeCase(disp.id, 'resolved')}\n                          className="px-3 py-1 bg-emerald-500 text-slate-950 font-extrabold rounded-lg text-[10px]"\n                        >\n                          Mark Resolved\n                        </button>\n                      </div>\n                    </div>\n                  ))}\n                </div>\n              </div>\n\n              {/* Safety Reports */}\n              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">\n                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">Ad Safety Reports ({reports.length})</h4>\n                <div className="space-y-3">\n                  {reports.map((rep) => (\n                    <div key={rep.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2\">\n                      <div className="flex justify-between items-start">\n                        <span className="font-bold text-xs text-white">{rep.listingTitle}</span>\n                        <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">{rep.reason}</span>\n                      </div>\n                      <p className="text-[11px] text-slate-400">{rep.details}</p>\n\n                      <div className="pt-2 flex gap-2">\n                        <button\n                          onClick={() => {\n                            deleteListing(rep.listingId);\n                            processReport(rep.id, 'resolve_delete_ad');\n                            toast.success('Ad dropped and report resolved.');\n                          }}\n                          className="px-3 py-1 bg-rose-600 text-white font-extrabold rounded-lg text-[10px]"\n                        >\n                          Drop Reported Ad\n                        </button>\n                        <button\n                          onClick={() => processReport(rep.id, 'dismiss')}\n                          className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px]"\n                        >\n                          Dismiss Report\n                        </button>\n                      </div>\n                    </div>\n                  ))}\n                </div>\n              </div>\n            </div>\n          </div>\n        )}\n\n        {/* TAB 7: ANNOUNCEMENTS & MASS BROADCAST */}\n        {activeTab === 'announcements' && (\n          <div className="space-y-6 animate-in fade-in duration-300\">\n            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">\n              \n              {/* Form 1: System Notice */}\n              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">\n                <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">\n                  <Megaphone className="w-4 h-4 text-emerald-400" />\n                  <span>Post App Banner Announcement</span>\n                </h3>\n\n                <form onSubmit={handlePostAnnouncement} className="space-y-3 text-xs\">\n                  <input\n                    type=\"text\"\n                    required\n                    value={annTitle}\n                    onChange={(e) => setAnnTitle(e.target.value)}\n                    placeholder=\"Headline Title (e.g. LAUTECH Gate Safe Spot Live)\"\n                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"\n                  />\n                  <textarea\n                    rows={3}\n                    required\n                    value={annMessage}\n                    onChange={(e) => setAnnMessage(e.target.value)}\n                    placeholder=\"Announcement message body...\"\n                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"\n                  />\n                  <select\n                    value={annType}\n                    onChange={(e) => setAnnType(e.target.value as any)}\n                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"\n                  >\n                    <option value=\"info\">Info (Blue)</option>\n                    <option value=\"warning\">Warning (Amber)</option>\n                    <option value=\"success\">Success (Emerald)</option>\n                    <option value=\"alert\">Alert (Rose)</option>\n                  </select>\n                  <button type=\"submit\" className="w-full py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow\">\n                    Publish Banner Announcement\n                  </button>\n                </form>\n              </div>\n\n              {/* Form 2: Mass Broadcast */}\n              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">\n                <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">\n                  <Radio className="w-4 h-4 text-purple-400" />\n                  <span>Push Broadcast to All User Inboxes</span>\n                </h3>\n\n                <form onSubmit={handleSendMassBroadcast} className="space-y-3 text-xs\">\n                  <input\n                    type=\"text\"\n                    required\n                    value={broadcastTitle}\n                    onChange={(e) => setBroadcastTitle(e.target.value)}\n                    placeholder=\"Broadcast Subject Headline\"\n                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"\n                  />\n                  <textarea\n                    rows={4}\n                    required\n                    value={broadcastMsg}\n                    onChange={(e) => setBroadcastMessage(e.target.value)}\n                    placeholder=\"Enter broadcast message body...\"\n                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"\n                  />\n                  <button type=\"submit\" className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl text-xs shadow\">\n                    Send Mass Notification to {allUsers.length} Users\n                  </button>\n                </form>\n              </div>\n\n            </div>\n\n            {/* Active Announcements */}\n            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">\n              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Active System Banners</h4>\n              <div className="space-y-2">\n                {announcements.map((ann) => (\n                  <div key={ann.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">\n                    <div>\n                      <span className="font-extrabold text-white">{ann.title}: </span>\n                      <span className="text-slate-300">{ann.message}</span>\n                    </div>\n                    <button onClick={() => deleteAnnouncement(ann.id)} className="p-1 text-slate-500 hover:text-rose-400">\n                      <Trash2 className="w-4 h-4" />\n                    </button>\n                  </div>\n                ))}\n              </div>\n            </div>\n          </div>\n        )}\n\n        {/* TAB 8: SAFE SPOTS MANAGER */}\n        {activeTab === 'safespots' && (\n          <div className="space-y-6 animate-in fade-in duration-300">\n            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">\n              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">\n                <h3 className="font-black text-sm text-white uppercase tracking-wider">Register Safe Exchange Spot</h3>\n                <form onSubmit={handleAddSafeSpot} className="space-y-3 text-xs\">\n                  <input\n                    type=\"text\"\n                    required\n                    value={spotName}\n                    onChange={(e) => setSpotName(e.target.value)}\n                    placeholder=\"Spot Name (e.g. LAUTECH Library Gate)\"\n                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"\n                  />\n                  <select\n                    value={spotZone}\n                    onChange={(e) => setSpotZone(e.target.value as any)}\n                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"\n                  >\n                    <option value="LAUTECH Area">LAUTECH Area</option>\n                    <option value="Takie / Center">Takie / Center</option>\n                    <option value="Sabo Market Zone">Sabo Market Zone</option>\n                    <option value="Police HQ">Police HQ</option>\n                  </select>\n                  <select\n                    value={spotCategory}\n                    onChange={(e) => setSpotCategory(e.target.value as any)}\n                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"\n                  >\n                    <option value="Police Safe Zone">Police Safe Zone</option>\n                    <option value="Public Library">Public Library</option>\n                    <option value="Shopping Mall">Shopping Mall</option>\n                    <option value="Cafe">Cafe</option>\n                  </select>\n                  <input\n                    type=\"text\"\n                    required\n                    value={spotAddress}\n                    onChange={(e) => setSpotAddress(e.target.value)}\n                    placeholder="Full Address"\n                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"\n                  />\n                  <button type=\"submit\" className="w-full py-3 bg-teal-500 text-slate-950 font-black rounded-xl text-xs shadow">\n                    Register Exchange Location\n                  </button>\n                </form>\n              </div>\n\n              <div className="lg:col-span-7 space-y-3">\n                <h3 className="font-black text-sm text-white uppercase tracking-wider">Active Verified Safe Spots ({safeSpots.length})</h3>\n                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">\n                  {safeSpots.map((spot) => (\n                    <div key={spot.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">\n                      <div>\n                        <h4 className="font-extrabold text-white">{spot.name}</h4>\n                        <p className="text-[11px] text-slate-400">{spot.zone} • {spot.address}</p>\n                      </div>\n                      <button onClick={() => deleteSafeSpot(spot.id)} className="p-2 text-slate-500 hover:text-rose-400">\n                        <Trash2 className="w-4 h-4" />\n                      </button>\n                    </div>\n                  ))}\n                </div>\n              </div>\n            </div>\n          </div>\n        )}\n\n        {/* TAB 9: SECURITY & ROOT CONFIG */}\n        {activeTab === 'security' && (\n          <div className="space-y-6 animate-in fade-in duration-300">\n            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">\n              \n              {/* Terminal Credentials Update */}\n              <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-xl">\n                <h3 className="font-black text-sm text-rose-400 uppercase tracking-widest flex items-center gap-2">\n                  <Lock className="w-4 h-4" />\n                  <span>Update Root Credentials & PIN</span>\n                </h3>\n\n                <form onSubmit={handleUpdateAdminPass} className="space-y-3 text-xs">\n                  <div className="space-y-1">\n                    <label className="text-slate-400 font-bold uppercase">Admin Login Email</label>\n                    <input\n                      type="email"\n                      required\n                      value={newAdminEmail}\n                      onChange={(e) => setNewAdminEmail(e.target.value)}\n                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none font-mono"\n                    />\n                  </div>\n\n                  <div className="space-y-1">\n                    <label className="text-slate-400 font-bold uppercase">Admin Access Password</label>\n                    <input\n                      type="text"\n                      required\n                      value={newAdminPass}\n                      onChange={(e) => setNewAdminPassword(e.target.value)}\n                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono tracking-wider"\n                    />\n                  </div>\n\n                  <div className="space-y-1">\n                    <label className="text-slate-400 font-bold uppercase">6-Digit Master Security PIN</label>\n                    <input\n                      type="text"\n                      required\n                      maxLength={6}\n                      value={newAdminPin}\n                      onChange={(e) => setNewAdminPin(e.target.value)}\n                      className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-4 py-2.5 text-rose-400 font-black focus:outline-none font-mono tracking-widest"\n                    />\n                  </div>\n\n                  <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-lg uppercase tracking-wider">\n                    Save New Master Credentials\n                  </button>\n                </form>\n              </div>\n\n              {/* System Config Toggles */}\n              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">\n                <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">\n                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />\n                  <span>Global Platform Switches</span>\n                </h3>\n\n                <div className="space-y-3 text-xs">\n                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">\n                    <div>\n                      <p className="font-bold text-white">Maintenance Mode</p>\n                      <p className="text-[10px] text-slate-500">Locks public marketplace feed for updates</p>\n                    </div>\n                    <button\n                      type="button"\n                      onClick={() => updateSystemConfig({ maintenanceMode: !systemConfig.maintenanceMode })}\n                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${systemConfig.maintenanceMode ? 'bg-rose-600' : 'bg-slate-800'}`}\n                    >\n                      <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${systemConfig.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`}></div>\n                    </button>\n                  </div>\n\n                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">\n                    <div>\n                      <p className="font-bold text-white">Auto-Approve Classified Ads</p>\n                      <p className="text-[10px] text-slate-500">Post listings instantly without admin pre-review</p>\n                    </div>\n                    <button\n                      type="button"\n                      onClick={() => updateSystemConfig({ autoApproveAds: !systemConfig.autoApproveAds })}\n                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${systemConfig.autoApproveAds ? 'bg-emerald-500' : 'bg-slate-800'}`}\n                    >\n                      <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${systemConfig.autoApproveAds ? 'translate-x-5' : 'translate-x-0'}`}></div>\n                    </button>
                  </div>\n\n                  <button\n                    type="button"\n                    onClick={() => setIsSqlSchemaOpen(true)}\n                    className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-emerald-400 font-bold rounded-2xl text-xs border border-emerald-500/30 flex items-center justify-center gap-2 transition-colors"\n                  >\n                    <Database className="w-4 h-4" />\n                    <span>View Supabase SQL Schema Migration Script</span>\n                  </button>\n                </div>\n              </div>\n\n            </div>\n\n            {/* Security Intrusion Log */}\n            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">\n              <h3 className="font-black text-sm text-rose-400 uppercase tracking-widest flex items-center gap-2">\n                <Siren className="w-4 h-4" />\n                <span>Unauthorized Intrusion & Wrong Password Attempts</span>\n              </h3>\n\n              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">\n                {intrusionLogs.length === 0 ? (\n                  <p className="text-slate-500 text-xs italic py-4">No unauthorized access attempts recorded.</p>\n                ) : (\n                  intrusionLogs.map((log) => (\n                    <div key={log.id} className="p-3 bg-slate-950 border border-rose-500/20 rounded-2xl text-xs space-y-1\">\n                      <div className="flex justify-between items-center">\n                        <span className="font-mono font-bold text-rose-400">{log.attemptedEmail}</span>\n                        <span className="text-[9px] font-mono text-slate-500">{log.timestamp}</span>\n                      </div>\n                      <p className="text-[10px] text-slate-400 font-mono">{log.mediaStatus}</p>\n                    </div>\n                  ))\n                )}\n              </div>\n            </div>\n          </div>\n        )}\n\n      </main>\n\n      <Footer />\n      <MobileNav />\n      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />\n      <CompareModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />\n      <SavedAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />\n      <AiShoppingAssistantModal isOpen={isAiCopilotOpen} onClose={() => setIsAiCopilotOpen(false)} />\n      <SqlSchemaViewer isOpen={isSqlSchemaOpen} onClose={() => setIsSqlSchemaOpen(false)} />\n    </div>\n  );\n}\n