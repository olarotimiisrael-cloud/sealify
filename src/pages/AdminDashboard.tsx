import React, { useState, useMemo } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import { 
  Users, Shield, Database, Settings, ShieldCheck, AlertTriangle, 
  Plus, Search, Filter, Eye, Edit3, Trash2, Download, Copy, 
  TrendingUp, Bell, Key, Lock, Unlock, BarChart3, User,
  LogOut, RefreshCw, FileText, Server, Globe, Zap, Shield as ShieldIcon,
  ChevronDown, ChevronUp, MoreVertical, X, CheckCircle2, AlertCircle,
  Mail, Phone, MapPin, Crown, Award, Star, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile, UserStatus } from '../types/sealify';
import AdminEditUserModal from '../components/AdminEditUserModal';
import AdminSettingsModal from '../components/AdminSettingsModal';
import DatabaseTest from '../components/DatabaseTest';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import DatabaseSchemaGenerator from '../components/DatabaseSchemaGenerator';
import MigrationExecutor from '../components/MigrationExecutor';

const AdminDashboard: React.FC = () => {
  const { 
    user, 
    isAdmin, 
    allUsers, 
    listings, 
    marketStats,
    analytics,
    systemConfig,
    updateSystemConfig,
    siteSettings,
    updateSiteSettings,
    promotionPlans,
    updatePromotionPlanRate,
    safeSpots,
    addSafeSpot,
    deleteSafeSpot,
    exportDatabaseBackup,
    auditLogs,
    intrusionLogs,
    addAuditLog,
    addAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    announcements,
    reports,
    processReport,
    disputeCases,
    processDisputeCase,
    verificationRequests,
    processVerificationRequest,
    promotionPaymentRequests,
    processPromotionPaymentRequest,
    recentDeals,
    sealDeal,
    isSyncing,
    syncDatabase,
    lastSyncTime,
    notifications,
    broadcastMassNotification,
    dispatchPromotionalEmailDigest,
    passwordRequests,
    processPasswordRequest,
    addUser,
    deleteUser,
    updateUser,
    bulkUpdateUsers,
    bulkDeleteUsers,
    bulkUpdateListings,
    bulkDeleteListings,
    wallet,
    transactions,
    searchAlerts,
    reviews,
    buyerRequests,
    categories,
    addCategory,
    deleteCategory,
    updateCategory
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'finance' | 'security' | 'system' | 'database' | 'broadcast'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');
  const [filterRole, setFilterRole] = useState<'buyer' | 'seller' | 'admin' | 'all'>('all');
  const [filterVerified, setFilterVerified] = useState<'all' | 'true' | 'false'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSqlViewerOpen, setIsSqlViewerOpen] = useState(false);
  const [isSchemaGeneratorOpen, setIsSchemaGeneratorOpen] = useState(false);
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);
  const [isDatabaseTestOpen, setIsDatabaseTestOpen] = useState(false);

  // Filter users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      if (searchQuery && !user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !user.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !user.location?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterStatus !== 'all' && user.status !== filterStatus) return false;
      if (filterRole !== 'all' && user.role !== filterRole) return false;
      if (filterVerified !== 'all' && (user.verified ? 'true' : 'false') !== filterVerified) return false;
      return true;
    });
  }, [allUsers, searchQuery, filterStatus, filterRole, filterVerified]);

  // Stats calculations
  const stats = useMemo(() => ({
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter(u => u.status === 'active').length,
    verifiedUsers: allUsers.filter(u => u.verified).length,
    adminUsers: allUsers.filter(u => u.role === 'admin').length,
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'active').length,
    totalRevenue: promotionPlans.filter(p => p.isActive).reduce((sum, p) => sum + p.rate, 0),
    pendingReports: reports.filter(r => r.status === 'pending').length,
    openDisputes: disputeCases.filter(d => d.status === 'pending').length,
    pendingVerifications: verificationRequests.filter(v => v.status === 'pending').length,
    pendingPromotions: promotionPaymentRequests.filter(p => p.status === 'pending').length,
    pendingPasswords: passwordRequests.filter(p => p.status === 'pending').length,
  }), [allUsers, listings, promotionPlans, reports, disputeCases, verificationRequests, passwordRequests]);

  // Quick action handlers
  const handleBulkAction = (action: string) => {
    const selectedIds = filteredUsers.map(u => u.id);
    if (selectedIds.length === 0) {
      toast.error('No users selected');
      return;
    }
    
    switch (action) {
      case 'verify':
        bulkUpdateUsers(selectedIds, { verified: true, verificationType: 'individual' });
        toast.success(`Verified ${selectedIds.length} users`);
        break;
      case 'suspend':
        bulkUpdateUsers(selectedIds, { status: 'suspended' });
        toast.success(`Suspended ${selectedIds.length} users`);
        break;
      case 'ban':
        bulkUpdateUsers(selectedIds, { status: 'banned' });
        toast.success(`Banned ${selectedIds.length} users`);
        break;
      case 'delete':
        bulkDeleteUsers(selectedIds);
        toast.success(`Deleted ${selectedIds.length} users`);
        break;
      case 'makeAdmin':
        bulkUpdateUsers(selectedIds, { role: 'admin' });
        toast.success(`Promoted ${selectedIds.length} users to admin`);
        break;
    }
  };

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 max-w-md w-full mx-4 text-center space-y-6">
          <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white">Access Denied</h1>
          <p className="text-slate-400">You do not have permission to access the Admin Terminal.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content Moderation', icon: Shield },
    { id: 'finance', label: 'Finance & Revenue', icon: TrendingUp },
    { id: 'security', label: 'Security & Audit', icon: ShieldCheck },
    { id: 'system', label: 'System Controls', icon: Settings },
    { id: 'database', label: 'Database Tools', icon: Database },
    { id: 'broadcast', label: 'Broadcast Center', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">
      <SEO title="Admin Terminal — Sealify Nigeria" />
      <Navbar />
      
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Admin Terminal</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sealify Nigeria • Master Control Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Node: Ogbomoso</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 font-mono">
                <Server className="w-3.5 h-3.5" />
                <span>Synced: {lastSyncTime}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => setIsSettingsModalOpen(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold rounded-xl text-xs border border-slate-700 transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Root Config</span>
            </button>
            <button onClick={syncDatabase} disabled={isSyncing} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Force Sync</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Users</p>
            <p className="text-2xl font-black text-emerald-400">{stats.activeUsers}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verified</p>
            <p className="text-2xl font-black text-amber-400">{stats.verifiedUsers}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admins</p>
            <p className="text-2xl font-black text-rose-400">{stats.adminUsers}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Ads</p>
            <p className="text-2xl font-black text-white">{stats.totalListings}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Ads</p>
            <p className="text-2xl font-black text-blue-400">{stats.activeListings}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Revenue</p>
            <p className="text-2xl font-black text-emerald-400">{formatNGN(stats.totalRevenue)}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Items</p>
            <p className="text-2xl font-black text-amber-400">
              {stats.pendingReports + stats.openDisputes + stats.pendingVerifications + stats.pendingPromotions + stats.pendingPasswords}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const pendingCounts: Record<string, number> = {
              content: stats.pendingReports,
              finance: stats.pendingPromotions + stats.pendingPasswords,
              security: stats.openDisputes,
              system: 0,
              database: 0,
              broadcast: 0,
            };
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {(pendingCounts[tab.id] || 0) > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    {pendingCounts[tab.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-white">Platform Health</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Database Connection', status: 'healthy', detail: 'Supabase PostgreSQL • 12ms latency' },
                      { label: 'Authentication Service', status: 'healthy', detail: 'Supabase Auth • 99.9% uptime' },
                      { label: 'Real-time Engine', status: 'healthy', detail: 'WebSocket connections active' },
                      { label: 'Storage Buckets', status: 'healthy', detail: 'profile-media, ad-images, documents' },
                      { label: 'Edge Functions', status: 'healthy', detail: 'Cloudflare Workers • 0 cold starts' },
                      { label: 'AI Services', status: 'healthy', detail: 'OpenAI integration operational' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <div>
                            <p className="font-bold text-sm text-white">{item.label}</p>
                            <p className="text-xs text-slate-400">{item.detail}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          OPERATIONAL
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xl font-black text-white">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setActiveTab('users')} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all text-left group">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white">Manage Users</p>
                          <p className="text-xs text-slate-400">View, edit, verify, suspend accounts</p>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => setActiveTab('content')} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all text-left group">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white">Moderate Content</p>
                          <p className="text-xs text-slate-400">Review reports, disputes, verifications</p>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => setActiveTab('finance')} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all text-left group">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white">Finance Dashboard</p>
                          <p className="text-xs text-slate-400">Revenue, payouts, promotion revenue</p>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => setActiveTab('security')} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all text-left group">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl group-hover:scale-110 transition-transform">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white">Security Audit</p>
                          <p className="text-xs text-slate-400">Intrusion logs, audit trail, 2FA</p>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => setActiveTab('database')} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all text-left group">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white">Database Tools</p>
                          <p className="text-xs text-slate-400">Schema, migrations, backups, SQL</p>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => setActiveTab('broadcast')} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all text-left group">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl group-hover:scale-110 transition-transform">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white">Broadcast Center</p>
                          <p className="text-xs text-slate-400">Mass notifications, email digests</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="pt-4 border-t border-slate-800">
                <h2 className="text-xl font-black text-white mb-4">Recent Admin Activity</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {auditLogs.slice(0, 10).map((log, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{log.action}</p>
                          <p className="text-slate-400">{log.details}</p>
                        </div>
                      </div>
                      <span className="text-slate-500 font-mono">{log.createdAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-black text-white">User Management</h2>
                  <p className="text-xs text-slate-400">Manage all registered accounts on the platform</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'all')} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                    <option value="restricted">Restricted</option>
                  </select>
                  <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as 'buyer' | 'seller' | 'admin' | 'all')} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    <option value="all">All Roles</option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select value={filterVerified} onChange={(e) => setFilterVerified(e.target.value as 'all' | 'true' | 'false')} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    <option value="all">All</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                  </select>
                  <button onClick={() => { setSelectedUser({} as UserProfile); setIsEditUserOpen(true); }} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{filteredUsers.length} of {allUsers.length} users</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleBulkAction('verify')} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-500/20">Verify</button>
                    <button onClick={() => handleBulkAction('suspend')} className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-500/20">Suspend</button>
                    <button onClick={() => handleBulkAction('ban')} className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold hover:bg-rose-500/20">Ban</button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-800">
                      <th className="p-3 font-bold uppercase tracking-wider">User</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Role</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Status</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Verified</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Listings</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Location</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Joined</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img src={u.avatarUrl} className="w-8 h-8 rounded-xl object-cover" alt={u.fullName} />
                            <div>
                              <p className="font-bold text-white truncate max-w-xs">{u.fullName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            u.role === 'admin' ? 'bg-rose-500/20 text-rose-400' :
                            u.role === 'seller' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                            u.status === 'suspended' ? 'bg-amber-500/20 text-amber-400' :
                            u.status === 'banned' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {u.status?.toUpperCase() || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {u.verified ? (
                            <span className="flex items-center justify-center gap-1 text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-[10px] font-bold">YES</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">NO</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono text-white">
                          {listings.filter(l => l.sellerId === u.id).length}
                        </td>
                        <td className="p-3 text-slate-300 truncate max-w-xs">{u.location}</td>
                        <td className="p-3 text-slate-400 font-mono">{u.memberSince}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setSelectedUser(u); setIsEditUserOpen(true); }} className="p-2 bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 rounded-xl text-[10px] transition-colors" title="Edit">Edit</button>
                            <button onClick={() => updateUser(u.id, { status: u.status === 'active' ? 'suspended' : 'active' })} className="p-2 bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 rounded-xl text-[10px] transition-colors" title="Toggle Status">{u.status === 'active' ? 'Suspend' : 'Activate'}</button>
                            <button onClick={() => deleteUser(u.id)} className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-xl text-[10px] transition-colors" title="Delete">Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-white">Content Moderation Queue</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reports */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                        Ad Reports
                      </h3>
                      <span className="text-xs font-black bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">{reports.filter(r => r.status === 'pending').length} Pending</span>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {reports.slice(0, 10).map((r) => (
                        <div key={r.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                          <p className="font-bold text-xs text-white truncate">{r.listingTitle}</p>
                          <p className="text-[10px] text-slate-400">Reason: {r.reason}</p>
                          <p className="text-[10px] text-slate-500">By: {r.reporterName || 'Anonymous'}</p>
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => processReport(r.id, 'resolved')} className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px]">Resolve</button>
                            <button onClick={() => processReport(r.id, 'dismissed')} className="flex-1 py-1.5 bg-slate-800 text-rose-400 font-bold rounded-xl text-[10px] border border-slate-700">Dismiss</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Disputes */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                        Trade Disputes
                      </h3>
                      <span className="text-xs font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{disputeCases.filter(d => d.status === 'pending').length} Open</span>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {disputeCases.slice(0, 10).map((d) => (
                        <div key={d.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                          <p className="font-bold text-xs text-white truncate">{d.itemTitle}</p>
                          <p className="text-[10px] text-slate-400">vs {d.counterparty}</p>
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => processDisputeCase(d.id, 'in_review')} className="flex-1 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-[10px]">Review</button>
                            <button onClick={() => processDisputeCase(d.id, 'resolved')} className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px]">Resolve</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Verification & Promotions */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                      Verification Requests
                    </h3>
                    <div className="space-y-3">
                      {verificationRequests.slice(0, 10).map((v) => (
                        <div key={v.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                              <Award className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-bold text-white">{v.userName}</p>
                              <p className="text-xs text-slate-400">{v.type.toUpperCase()} • {v.docType}: {v.docNumber}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => processVerificationRequest(v.id, 'approved')} className="px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">Approve</button>
                            <button onClick={() => processVerificationRequest(v.id, 'rejected')} className="px-4 py-2 bg-rose-500 text-white font-black rounded-xl text-xs">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-400" />
                      Promotion Payment Reviews
                    </h3>
                    <div className="space-y-3">
                      {promotionPaymentRequests.slice(0, 10).map((p) => (
                        <div key={p.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white">{p.planName} • {formatNGN(p.amount)}</p>
                            <p className="text-xs text-slate-400">User: {p.userId} • Ad: {p.listingId}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => processPromotionPaymentRequest(p.id, 'approved')} className="px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">Approve</button>
                            <button onClick={() => processPromotionPaymentRequest(p.id, 'rejected')} className="px-4 py-2 bg-rose-500 text-white font-black rounded-xl text-xs">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-400" />
                      Password Reset Requests
                    </h3>
                    <div className="space-y-3">
                      {passwordRequests.slice(0, 10).map((pr) => (
                        <div key={pr.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white">{pr.userName}</p>
                            <p className="text-xs text-slate-400">NIN: {pr.nin} • Reason: {pr.reason}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => processPasswordRequest(pr.id, 'approved')} className="px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">Approve</button>
                            <button onClick={() => processPasswordRequest(pr.id, 'declined')} className="px-4 py-2 bg-rose-500 text-white font-black rounded-xl text-xs">Decline</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-white">Finance & Revenue Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl shadow-xl">
                  <p className="text-xs font-black text-emerald-100 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-black text-white mt-2">{formatNGN(stats.totalRevenue)}</p>
                  <p className="text-xs text-emerald-200 mt-1">From approved promotions</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Pending Payouts</p>
                  <p className="text-3xl font-black text-white mt-2">{formatNGN(wallet?.pendingBalance || 0)}</p>
                  <p className="text-xs text-slate-500 mt-1">Escrow held funds</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Withdrawn</p>
                  <p className="text-3xl font-black text-emerald-400 mt-2">{formatNGN(wallet?.totalWithdrawn || 0)}</p>
                  <p className="text-xs text-slate-500 mt-1">Lifetime processed</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Available Balance</p>
                  <p className="text-3xl font-black text-blue-400 mt-2">{formatNGN(wallet?.balance || 0)}</p>
                  <p className="text-xs text-slate-500 mt-1">Ready for payout</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="font-bold text-white mb-4">Promotion Plans & Revenue</h3>
                  <div className="space-y-3">
                    {promotionPlans.map((plan) => (
                      <div key={plan.months} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-black ${
                            plan.badge === 'POPULAR' ? 'bg-amber-500 text-slate-950' :
                            plan.badge === 'BEST VALUE' ? 'bg-emerald-500 text-slate-950' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {plan.badge}
                          </span>
                          <div>
                            <p className="font-bold text-white">{plan.label}</p>
                            <p className="text-xs text-slate-400">{formatNGN(plan.rate)}/month</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={plan.rate} 
                            onChange={(e) => updatePromotionPlanRate(plan.months, Number(e.target.value))} 
                            className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-xs text-slate-500">NGN/mo</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="font-bold text-white mb-4">Recent Transactions</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactions.slice(0, 15).map((tx) => (
                      <div key={tx.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${
                            tx.type === 'sale' ? 'bg-emerald-500/10 text-emerald-400' : 
                            tx.type === 'payout' ? 'bg-blue-500/10 text-blue-400' : 
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {tx.type === 'sale' ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-white">{tx.description}</p>
                            <p className="text-[10px] text-slate-500">{tx.createdAt} • {tx.status.toUpperCase()}</p>
                          </div>
                        </div>
                        <p className={`font-black text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {tx.amount > 0 ? '+' : ''}{formatNGN(tx.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-white">Security & Audit Center</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Intrusion Logs */}
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      Intrusion Attempts
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {intrusionLogs.slice(0, 15).map((log, i) => (
                        <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-xs text-white">{log.attemptedEmail}</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'flagged' ? 'bg-rose-500/20 text-rose-400' :
                              log.status === 'reported' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {log.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">{log.deviceInfo?.userAgent?.slice(0, 60)}...</p>
                          <p className="text-[10px] text-slate-500">{log.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audit Logs */}
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-400" />
                      System Audit Trail
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {auditLogs.slice(0, 15).map((log, i) => (
                        <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-xs text-white">{log.action}</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.type === 'security' ? 'bg-rose-500/20 text-rose-400' :
                              log.type === 'finance' ? 'bg-emerald-500/20 text-emerald-400' :
                              log.type === 'user' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {log.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">{log.details}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{log.createdAt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Root Credentials */}
              <div className="bg-slate-950 border-2 border-rose-500/30 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-rose-400" />
                  Root Admin Credentials
                </h3>
                <p className="text-xs text-rose-300 mb-4">Triple-factor authentication required for terminal access</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-rose-400 font-bold uppercase tracking-wider mb-1">Master Email</p>
                    <p className="font-mono text-white">{user?.email}</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-rose-400 font-bold uppercase tracking-wider mb-1">Access Password</p>
                    <p className="font-mono text-white">••••••••</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-rose-400 font-bold uppercase tracking-wider mb-1">6-Digit PIN</p>
                    <p className="font-mono text-white">••••••</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-white">System Controls & Configuration</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Toggles */}
                <div className="space-y-4">
                  <h3 className="font-bold text-white mb-4">Platform Feature Toggles</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Lock public marketplace access', icon: Settings },
                      { key: 'autoApproveAds', label: 'Auto-Approve Ads', desc: 'Skip admin review for new listings', icon: CheckCircle2 },
                      { key: 'requireIdForPosting', label: 'Require ID Verification', desc: 'Mandatory verification before posting', icon: Shield },
                      { key: 'aiSpamFilter', label: 'AI Spam Filter', desc: 'Auto-detect fraudulent listings', icon: Zap },
                    ].map((item) => (
                      <div key={item.key} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{item.label}</p>
                            <p className="text-xs text-slate-400">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => updateSystemConfig({ [item.key]: !systemConfig[item.key as keyof typeof systemConfig] })}
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${systemConfig[item.key as keyof typeof systemConfig] ? 'bg-emerald-500' : 'bg-slate-800'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${systemConfig[item.key as keyof typeof systemConfig] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Site Settings */}
                <div className="space-y-4">
                  <h3 className="font-bold text-white mb-4">Site Metadata</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Site Name</label>
                      <input
                        value={siteSettings.siteName}
                        onChange={(e) => updateSiteSettings({ siteName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Site Description</label>
                      <textarea
                        value={siteSettings.siteDescription}
                        onChange={(e) => updateSiteSettings({ siteDescription: e.target.value })}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Contact Email</label>
                      <input
                        value={siteSettings.contactEmail}
                        onChange={(e) => updateSiteSettings({ contactEmail: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</label>
                      <input
                        value={siteSettings.contactPhone}
                        onChange={(e) => updateSiteSettings({ contactPhone: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcements */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">System Announcements</h3>
                  <button onClick={() => addAnnouncement({ title: 'New Announcement', message: 'Content here', type: 'info', active: true })} className="px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">Add Announcement</button>
                </div>
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-black ${
                          a.type === 'alert' ? 'bg-rose-500/20 text-rose-400' :
                          a.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                          a.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {a.type.toUpperCase()}
                        </span>
                        <div>
                          <p className="font-bold text-white">{a.title}</p>
                          <p className="text-xs text-slate-400">{a.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleAnnouncement(a.id)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold ${
                          a.active ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {a.active ? 'Active' : 'Inactive'}
                        </button>
                        <button onClick={() => deleteAnnouncement(a.id)} className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl text-[10px] font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-white">Database Administration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DatabaseTest />
                
                <SqlSchemaViewer />
                
                <DatabaseSchemaGenerator />
                
                <MigrationExecutor />
              </div>

              <div className="pt-6 border-t border-slate-800">
                <h3 className="font-bold text-white mb-4">Database Backup & Export</h3>
                <div className="flex flex-wrap gap-4">
                  <button onClick={exportDatabaseBackup} className="px-6 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Export Full Backup (JSON)</span>
                  </button>
                  <button onClick={() => setIsSqlViewerOpen(true)} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>View SQL Migration Script</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-white">Broadcast & Notification Center</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mass Notification */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-6">
                  <h3 className="font-bold text-white">Send Mass Notification</h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Audience</label>
                      <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                        <option value="all">All Users</option>
                        <option value="buyer">Buyers Only</option>
                        <option value="seller">Sellers Only</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notification Title</label>
                      <input type="text" placeholder="e.g. New Feature Release" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message Content</label>
                      <textarea rows={4} placeholder="Broadcast message..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
                    </div>
                    <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg">SEND BROADCAST</button>
                  </div>
                </div>

                {/* Email Digest */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-6">
                  <h3 className="font-bold text-white">Promotional Email Digest</h3>
                  <p className="text-xs text-slate-400">Send weekly marketplace digest to all users featuring top ads</p>
                  <button onClick={dispatchPromotionalEmailDigest} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs shadow-lg flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>DISPATCH WEEKLY DIGEST</span>
                  </button>
                  
                  <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                    <p>• Includes top 3 featured/verified listings</p>
                    <p>• Sent to all {allUsers.length} registered users</p>
                    <p>• Tracks open rates via notification system</p>
                  </div>
                </div>
              </div>

              {/* Recent Broadcasts */}
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <h3 className="font-bold text-white mb-4">Recent Broadcast History</h3>
                <div className="space-y-3">
                  {auditLogs.filter(l => l.type === 'broadcast').slice(0, 10).map((log, i) => (
                    <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-white">{log.action}</p>
                        <p className="text-[10px] text-slate-400">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{log.createdAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <AdminEditUserModal
          user={selectedUser}
          onClose={() => { setIsEditUserOpen(false); setSelectedUser(null); }}
          onSave={updateUser}
        />

        <AdminSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />

        <SqlSchemaViewer
          isOpen={isSqlViewerOpen}
          onClose={() => setIsSqlViewerOpen(false)}
        />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;