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
import DatabaseSchemaGenerator from '../components/DatabaseSchemaGenerator';
import DatabaseDiagramViewer from '../components/DatabaseDiagramViewer';
import MigrationExecutor from '../components/MigrationExecutor';
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
  KeyRound as KeyRoundIcon,
  GitBranch,
  Play,
  StopCircle,
  AlertTriangle,
  Server,
  HardDrive,
  Zap
} from 'lucide-react';
import { UserProfile, Listing, UserStatus } from '../types/sealify';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const { 
    allUsers, 
    listings, 
    reports, 
    disputeCases, 
    verificationRequests, 
    promotionPaymentRequests, 
    passwordRequests, 
    announcements, 
    systemConfig, 
    updateSystemConfig,
    siteSettings, 
    updateSiteSettings, 
    promotionPlans,
    updatePromotionPlanRate,
    safeSpots, 
    addSafeSpot, 
    deleteSafeSpot,
    auditLogs,
    intrusionLogs,
    analytics,
    marketStats,
    broadcastMassNotification,
    dispatchPromotionalEmailDigest,
    isAdmin,
    user,
    exportDatabaseBackup,
    addUser,
    deleteUser,
    updateUser,
    isSyncing,
    syncDatabase,
    loading,
    addAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    processVerificationRequest,
    processPromotionPaymentRequest,
    processPasswordRequest,
    processReport,
    processDisputeCase,
    recentDeals,
    sealDeal,
    searchAlerts,
    saveSearchAlert,
    deleteSearchAlert,
    reviews,
    addReview,
    deleteReview,
    buyerRequests,
    createBuyerRequest,
    deleteBuyerRequest,
    wallet,
    transactions,
    requestPayout,
    addNotification
  } = useSealify();

  const navigate = useNavigate();

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'moderation' | 'finance' | 'security' | 'database' | 'settings' | 'broadcast' | 'schema' | 'migration' | 'analytics'>('overview');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');
  const [filterRole, setFilterRole] = useState<'buyer' | 'seller' | 'admin' | 'all'>('all');
  const [filterVerified, setFilterVerified] = useState<boolean | 'all'>('all');

  const filteredUsers = allUsers.filter(u => {
    if (searchQuery && !u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterVerified !== 'all' && u.verified !== filterVerified) return false;
    return true;
  });

  const stats = {
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter(u => u.status === 'active').length,
    verifiedUsers: allUsers.filter(u => u.verified).length,
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'active').length,
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    totalDisputes: disputeCases.length,
    pendingDisputes: disputeCases.filter(d => d.status === 'pending').length,
    totalVerifications: verificationRequests.length,
    pendingVerifications: verificationRequests.filter(v => v.status === 'pending').length,
    totalPromotions: promotionPaymentRequests.length,
    pendingPromotions: promotionPaymentRequests.filter(p => p.status === 'pending').length,
    totalRevenue: promotionPaymentRequests.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0),
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'listings', label: 'Listings', icon: Package },
    { id: 'moderation', label: 'Moderation', icon: ShieldAlert },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
    { id: 'schema', label: 'Schema Viewer', icon: GitBranch },
    { id: 'migration', label: 'Migration Tool', icon: HardDrive },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      <SEO title="Admin Dashboard — Sealify Nigeria" />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black px-3.5 py-1 rounded-full shadow-sm animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>SEALIFY ADMIN TERMINAL — OGBOMOSO NODE</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Master Admin Dashboard</h1>
            <p className="text-slate-400 text-xs sm:text-sm">Full platform control: users, classifieds, moderation, finance, security, and database operations</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={exportDatabaseBackup} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold rounded-xl text-xs border border-slate-700 flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export DB Backup</span>
            </button>
            <button onClick={syncDatabase} disabled={isSyncing} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-2 transition-colors">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Force Sync</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="text-blue-400" />
          <StatCard label="Active" value={stats.activeUsers} icon={CheckCircle2} color="text-emerald-400" />
          <StatCard label="Verified" value={stats.verifiedUsers} icon={Shield} color="text-amber-400" />
          <StatCard label="Total Ads" value={stats.totalListings} icon={Package} color="text-purple-400" />
          <StatCard label="Active Ads" value={stats.activeListings} icon={CheckSquare} color="text-teal-400" />
          <StatCard label="Revenue" value={stats.totalRevenue >= 1000 ? `₦${(stats.totalRevenue/1000).toFixed(1)}k` : `₦${stats.totalRevenue}`} icon={CreditCard} color="text-rose-400" />
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 flex flex-wrap gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickStat title="Pending Verifications" value={stats.pendingVerifications} icon={Shield} color="text-amber-400" />
                <QuickStat title="Pending Reports" value={stats.pendingReports} icon={AlertOctagon} color="text-rose-400" />
                <QuickStat title="Pending Disputes" value={stats.pendingDisputes} icon={Gavel} color="text-orange-400" />
                <QuickStat title="Pending Promotions" value={stats.pendingPromotions} icon={Sparkles} color="text-purple-400" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-400" /> Live Activity Feed</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {auditLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{log.action}</p>
                          <p className="text-[10px] text-slate-400 truncate">{log.details}</p>
                          <span className="text-[9px] text-slate-500">{log.createdAt}</span>
                        </div>
                      </div>
                    ))}
                    {auditLogs.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No recent activity</p>}
                  </div>
                </div>

                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2"><Siren className="w-5 h-5 text-rose-400" /> Security Alerts</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {intrusionLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-rose-300 text-xs">{log.attemptedEmail}</p>
                            <p className="text-[10px] text-slate-400">{log.deviceInfo}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${log.status === 'flagged' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {log.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {intrusionLogs.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No intrusion attempts logged</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                    <option value="restricted">Restricted</option>
                  </select>
                  <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    <option value="all">All Roles</option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select value={filterVerified} onChange={(e) => setFilterVerified(e.target.value === 'all' ? 'all' : e.target.value === 'true')} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
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

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Verified</th>
                      <th className="text-left p-3">Ads</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {u.avatarUrl ? <img src={u.avatarUrl} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"><Users className="w-4 h-4 text-slate-500" /></div>}
                            <div>
                              <p className="font-bold text-white truncate max-w-xs">{u.fullName}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${u.role === 'admin' ? 'bg-rose-500/20 text-rose-400' : u.role === 'seller' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : u.status === 'suspended' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {u.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.verified ? <VerifiedBadge type={u.verificationType} /> : <span className="text-slate-500 text-[10px]">No</span>}
                        </td>
                        <td className="p-3 text-slate-400">{listings.filter(l => l.sellerId === u.id).length}</td>
                        <td className="p-3">
                          <button onClick={() => { setSelectedUser(u); setIsEditUserOpen(true); }} className="text-emerald-400 hover:underline text-[10px]">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-6">
              <h3 className="font-bold text-white">All Classified Listings ({listings.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {listings.slice(0, 12).map((item) => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <img src={item.images[0]} className="w-full h-32 object-cover rounded-xl" />
                    <h4 className="font-bold text-white truncate">{item.title}</h4>
                    <p className="text-emerald-400 font-black text-sm">₦{item.price.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">{item.status} • {item.viewsCount} views</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <QuickStat title="Ad Reports" value={reports.length} icon={AlertOctagon} color="text-rose-400" subtitle={`${reports.filter(r => r.status === 'pending').length} pending`} />
                <QuickStat title="Disputes" value={disputeCases.length} icon={Gavel} color="text-orange-400" subtitle={`${disputeCases.filter(d => d.status === 'pending').length} pending`} />
                <QuickStat title="Verifications" value={verificationRequests.length} icon={Shield} color="text-amber-400" subtitle={`${verificationRequests.filter(v => v.status === 'pending').length} pending`} />
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2"><AlertOctagon className="w-5 h-5 text-rose-400" /> Ad Reports</h4>
                  <div className="space-y-3">
                    {reports.slice(0, 10).map((r) => (
                      <div key={r.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-white">{r.listingTitle}</p>
                            <p className="text-[10px] text-slate-400">{r.reason}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${r.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {r.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Gavel className="w-5 h-5 text-orange-400" /> Dispute Cases</h4>
                  <div className="space-y-3">
                    {disputeCases.slice(0, 10).map((d) => (
                      <div key={d.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                        <p className="font-bold text-white">{d.itemTitle}</p>
                        <p className="text-xs text-slate-400">{d.counterparty} • {d.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-amber-400" /> Verification Requests</h4>
                  <div className="space-y-3">
                    {verificationRequests.slice(0, 10).map((v) => (
                      <div key={v.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white">{v.userName}</p>
                          <p className="text-xs text-slate-400">{v.type} • {v.docType}</p>
                        </div>
                        <button onClick={() => processVerificationRequest(v.id, 'approved')} className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs">Approve</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <QuickStat title="Total Revenue" value={stats.totalRevenue >= 1000 ? `₦${(stats.totalRevenue/1000).toFixed(1)}k` : `₦${stats.totalRevenue}`} icon={CreditCard} color="text-emerald-400" />
                <QuickStat title="Pending Promotions" value={stats.pendingPromotions} icon={Sparkles} color="text-purple-400" />
                <QuickStat title="Wallet Balance" value={wallet ? `₦${(wallet.balance/1000).toFixed(1)}k` : '₦0'} icon={Wallet} color="text-blue-400" />
                <QuickStat title="Escrow Pending" value={wallet ? `₦${(wallet.pendingBalance/1000).toFixed(1)}k` : '₦0'} icon={Shield} color="text-amber-400" />
              </div>

              <div>
                <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" /> Promotion Payment Requests</h4>
                <div className="space-y-3">
                  {promotionPaymentRequests.slice(0, 10).map((p) => (
                    <div key={p.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">₦{p.amount.toLocaleString()} • {p.planName}</p>
                        <p className="text-xs text-slate-400">User: {p.userId}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => processPromotionPaymentRequest(p.id, 'approved')} className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs">Approve</button>
                        <button onClick={() => processPromotionPaymentRequest(p.id, 'rejected')} className="px-3 py-1 bg-rose-500 text-white font-bold rounded-lg text-xs">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="font-bold text-white flex items-center gap-2"><Siren className="w-5 h-5 text-rose-400" /> Intrusion Detection Logs</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {intrusionLogs.slice(0, 20).map((log) => (
                  <div key={log.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-rose-300">{log.attemptedEmail}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{log.deviceInfo}</p>
                        <p className="text-[9px] text-slate-500">{log.timestamp}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${log.status === 'flagged' ? 'bg-rose-500/20 text-rose-400' : log.status === 'reported' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
                {intrusionLogs.length === 0 && <p className="text-xs text-slate-500 text-center py-8">No intrusion attempts recorded</p>}
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <QuickStat title="Users" value={allUsers.length} icon={Users} color="text-blue-400" />
                <QuickStat title="Listings" value={listings.length} icon={Package} color="text-purple-400" />
                <QuickStat title="Conversations" value={0} icon={Mail} color="text-teal-400" />
              </div>
              <DatabaseTest />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-4">
                <h3 className="font-bold text-rose-300 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Master Credentials Management</h3>
                <button onClick={() => setIsSettingsOpen(true)} className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center gap-2">
                  <KeyRoundIcon className="w-4 h-4" />
                  <span>Update Admin Email / Password / PIN</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-white">System Configuration</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Lock public marketplace access' },
                      { key: 'autoApproveAds', label: 'Auto-Approve Ads', desc: 'Bypass admin review for new ads' },
                      { key: 'requireIdForPosting', label: 'Require ID for Posting', desc: 'Force verification before listing' },
                      { key: 'aiSpamFilter', label: 'AI Spam Filter', desc: 'Enable automated fraud detection' },
                    ].map((cfg) => (
                      <div key={cfg.key} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                        <div>
                          <p className="font-bold text-white">{cfg.label}</p>
                          <p className="text-xs text-slate-400">{cfg.desc}</p>
                        </div>
                        <button
                          onClick={() => updateSystemConfig({ [cfg.key]: !systemConfig[cfg.key as keyof typeof systemConfig] })}
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${systemConfig[cfg.key as keyof typeof systemConfig] ? 'bg-emerald-500' : 'bg-slate-800'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${systemConfig[cfg.key as keyof typeof systemConfig] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-white">Site Settings</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase">Site Name</label>
                      <input value={siteSettings.siteName} onChange={(e) => updateSiteSettings({ siteName: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase">Contact Email</label>
                      <input value={siteSettings.contactEmail} onChange={(e) => updateSiteSettings({ contactEmail: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase">Contact Phone</label>
                      <input value={siteSettings.contactPhone} onChange={(e) => updateSiteSettings({ contactPhone: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div className="space-y-6">
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-4">
                <h3 className="font-bold text-emerald-300 flex items-center gap-2"><Megaphone className="w-5 h-5" /> Broadcast System</h3>
                <p className="text-xs text-slate-400">Send push notifications and email digests to all users or specific roles</p>
                <button onClick={() => broadcastMassNotification('System Update', 'Sealify platform has been updated with new features!', 'all')} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast to All Users</span>
                </button>
                <button onClick={dispatchPromotionalEmailDigest} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Dispatch Weekly Promotional Digest</span>
                </button>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">Announcements & Banners</h4>
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{a.title}</p>
                        <p className="text-xs text-slate-400">{a.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${a.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                          {a.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <button onClick={() => toggleAnnouncement(a.id)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px]">Toggle</button>
                        <button onClick={() => deleteAnnouncement(a.id)} className="px-3 py-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg text-[10px]">Delete</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addAnnouncement({ title: 'New Update', message: 'Platform maintenance scheduled...', type: 'info', active: true, targetRoles: ['buyer', 'seller'] })} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30">
                    <Plus className="w-4 h-4" />
                    <span>Add Announcement</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <DatabaseSchemaGenerator />
          )}

          {activeTab === 'migration' && (
            <MigrationExecutor />
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="font-bold text-white">Market Analytics</h3>
              <DatabaseDiagramViewer />
            </div>
          )}
        </div>

        {isEditUserOpen && selectedUser && (
          <AdminEditUserModal
            user={selectedUser}
            onClose={() => { setIsEditUserOpen(false); setSelectedUser(null); }}
            onSave={updateUser}
          />
        )}

        {isSettingsOpen && (
          <AdminSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
    </main>

    <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    <CompareModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />
    <SavedAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
    <AiShoppingAssistantModal isOpen={isAiCopilotOpen} onClose={() => setIsAiCopilotOpen(false)} />
    <Footer />
    <MobileNav />
    </>
  );
};

const StatCard: React.FC<{ label: string; value: number | string; icon: React.FC<{ className?: string }>; color: string }> = ({
  label, value, icon: Icon, color
}) => (
  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
    <div className="flex items-center justify-between">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="text-2xl font-black text-white">{value}</span>
    </div>
    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
  </div>
);

const QuickStat: React.FC<{ title: string; value: number; icon: React.FC<{ className?: string }>; color: string; subtitle?: string }> = ({
  title, value, icon: Icon, color, subtitle
}) => (
  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
    <div className="flex items-center justify-between">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="text-xl font-black text-white">{value}</span>
    </div>
    <p className="text-xs text-slate-400 font-medium">{title}</p>
    {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
  </div>
);

export default AdminDashboard;