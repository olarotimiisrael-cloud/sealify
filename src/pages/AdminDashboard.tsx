import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import AdminEditUserModal from '../components/AdminEditUserModal';
import { UserProfile, VerificationBadgeType, Listing } from '../types/sealify';
import { 
  Shield, Package, Activity, Layers, RefreshCw, Edit3, Trash2,
  Search, ShieldCheck, Award, Check, X, Eye,
  KeyRound, Zap, Crown, Database, Plus, Sparkles, Upload,
  AlertTriangle, LogOut, Megaphone, Bell, Radio, ShieldAlert,
  Download, FileSpreadsheet, Terminal, Clock, Server
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, user, logout, categories, addCategory, deleteCategory, updateCategory, analytics, listings, allUsers, updateUser, deleteUser, updateListing, deleteListing, t,
    passwordRequests, processPasswordRequest, verificationRequests, processVerificationRequest,
    promotionPaymentRequests, processPromotionPaymentRequest,
    announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
    reports, processReport, auditLogs
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'categories' | 'listings' | 'approvals' | 'promotionPayments' | 'broadcasts' | 'reports' | 'audit'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [adSearch, setAdSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Announcement State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');

  // New Category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');
  const [newCatColor, setNewCatColor] = useState('bg-emerald-500');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAds = listings.filter(l => 
    l.title.toLowerCase().includes(adSearch.toLowerCase()) || 
    l.sellerName.toLowerCase().includes(adSearch.toLowerCase())
  );

  const pendingPW = passwordRequests.filter(r => r.status === 'pending');
  const pendingVerif = verificationRequests.filter(r => r.status === 'pending');
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');
  const promotedAds = listings.filter(l => l.featured);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      toast.error('Title and message are required for broadcasts');
      return;
    }
    addAnnouncement({
      title: annTitle.trim(),
      message: annMessage.trim(),
      type: annType,
      active: true,
    });
    setAnnTitle('');
    setAnnMessage('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    addCategory({
      name: newCatName.trim(),
      iconName: newCatIcon,
      count: 0,
      color: newCatColor,
    });
    setNewCatName('');
    toast.success(`Category "${newCatName.trim()}" added successfully!`);
  };

  const handleSaveCatName = (id: string) => {
    if (!editingCatName.trim()) return;
    updateCategory(id, editingCatName.trim());
    setEditingCatId(null);
    toast.success('Category updated');
  };

  // CSV Export functions
  const exportUsersCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Role', 'Verified', 'Location', 'Member Since'];
    const rows = allUsers.map(u => [
      u.id,
      `"${u.fullName.replace(/"/g, '""')}"`,
      u.email,
      u.role,
      u.verified ? 'Yes' : 'No',
      `"${u.location.replace(/"/g, '""')}"`,
      u.memberSince
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sealify_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('User records exported to CSV!');
  };

  const exportAdsCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Price (NGN)', 'Seller', 'Location', 'Views', 'Status', 'Featured'];
    const rows = listings.map(l => [
      l.id,
      `"${l.title.replace(/"/g, '""')}"`,
      l.category,
      l.price,
      `"${l.sellerName.replace(/"/g, '""')}"`,
      `"${l.location.replace(/"/g, '""')}"`,
      l.viewsCount,
      l.status,
      l.featured ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sealify_classified_ads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Classified ads exported to CSV!');
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <Shield className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-black">Restricted Access</h2>
        <p className="text-slate-400 text-xs mt-2">Only administrators can access this terminal.</p>
        <Link to="/" className="mt-6 px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs">Back Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black">Admin Command Dashboard</h1>
                <button
                  onClick={() => setIsSqlModalOpen(true)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-emerald-400 text-[10px] font-black rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Database className="w-3 h-3" />
                  <span>SQL Schema</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">Monitoring {listings.length} live ads & {allUsers.length} user profiles</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportUsersCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Export registered users to CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Users CSV</span>
            </button>

            <button
              onClick={exportAdsCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Export all ads to CSV"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Ads CSV</span>
            </button>

            {user && (
              <div className="flex items-center gap-3 ml-2 border-l border-slate-800 pl-3">
                <img 
                  src={user?.avatarUrl} 
                  className="w-9 h-9 rounded-full border border-emerald-500" 
                  alt={user?.fullName}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                  }}
                />
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>ANALYTICS</button>
          <button onClick={() => setActiveTab('broadcasts')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all relative flex items-center gap-1 ${activeTab === 'broadcasts' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            <Megaphone className="w-3.5 h-3.5" />
            <span>BROADCASTS</span>
            {announcements.filter(a => a.active).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'users' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>USERS ({allUsers.length})</button>
          <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'categories' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>CATEGORIES ({categories.length})</button>
          <button onClick={() => setActiveTab('listings')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'listings' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>ADS ({listings.length})</button>
          <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all relative flex items-center gap-1 ${activeTab === 'reports' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>REPORTS</span>
            {pendingReports.length > 0 && (
              <span className="bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full">
                {pendingReports.length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('approvals')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all relative ${activeTab === 'approvals' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            APPROVALS
            {(pendingPW.length + pendingVerif.length) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {pendingPW.length + pendingVerif.length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('promotionPayments')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all relative ${activeTab === 'promotionPayments' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            PAYMENTS
            {pendingPromoPay.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {pendingPromoPay.length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all relative flex items-center gap-1 ${activeTab === 'audit' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            <Terminal className="w-3.5 h-3.5" />
            <span>LOGS & EXPORTS</span>
          </button>
        </div>

        {/* Tab Content: System Audit Logs & Data Exports */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">System Security & Audit Logs</h2>
                    <p className="text-xs text-slate-400">Track key platform events and administrator operations</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportUsersCSV}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl shadow flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Users CSV</span>
                  </button>
                  <button
                    onClick={exportAdsCSV}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Ads CSV</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 max-h-[500px] overflow-y-auto space-y-2 font-mono text-xs">
                {auditLogs.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No security logs generated yet.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            log.type === 'security' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            log.type === 'verification' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            log.type === 'broadcast' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {log.type}
                          </span>
                          <span className="font-bold text-white truncate">{log.action}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{log.details}</p>
                      </div>

                      <span className="text-[10px] text-slate-500 shrink-0 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        {log.createdAt}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Reports & Moderation Queue */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Ad Reports & Safety Moderation</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  {pendingReports.length} pending user flags
                </p>
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
                No flags or reports submitted yet. Marketplace operating safely!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((rep) => {
                  const targetListing = listings.find((l) => l.id === rep.listingId);

                  return (
                    <div
                      key={rep.id}
                      className={`p-5 rounded-3xl border space-y-4 shadow-xl ${
                        rep.status === 'pending'
                          ? 'bg-slate-900 border-rose-500/30'
                          : 'bg-slate-950/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            rep.status === 'pending' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {rep.status}
                          </span>
                          <h4 className="font-bold text-sm text-white">{rep.listingTitle}</h4>
                          <p className="text-[10px] text-slate-400">Reporter: {rep.reporterName} • {rep.createdAt}</p>
                        </div>

                        {targetListing && (
                          <Link
                            to={`/listing/${targetListing.id}`}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs flex items-center gap-1 shrink-0"
                            title="Inspect reported listing"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        )}
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1">
                        <p className="font-bold text-rose-400">Reason: {rep.reason}</p>
                        {rep.details && (
                          <p className="text-slate-300 text-[11px] leading-relaxed italic">
                            "{rep.details}"
                          </p>
                        )}
                      </div>

                      {rep.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => processReport(rep.id, 'dismiss')}
                            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                          >
                            Dismiss Flag
                          </button>
                          <button
                            onClick={() => processReport(rep.id, 'resolve_delete_ad')}
                            className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition-colors shadow flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Reported Ad</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Broadcasts & Announcements */}
        {activeTab === 'broadcasts' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateAnnouncement} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-base">
                <Radio className="w-5 h-5 animate-pulse" />
                <span>Publish Live Platform Announcement</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase">Banner Headline / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Safe Meetup Spot added at Sabo Market!"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Banner Type</label>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="success">Success / Feature (Green)</option>
                    <option value="warning">Warning / Notice (Amber)</option>
                    <option value="alert">Critical Alert (Red)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Announcement Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detailed broadcast message to show on top of user feeds..."
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow transition-colors"
              >
                <Megaphone className="w-4 h-4" />
                <span>Broadcast Announcement Nationwide</span>
              </button>
            </form>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-extrabold text-white">Active System Announcements</h3>

              {announcements.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No broadcast messages currently active.</p>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                        ann.active
                          ? 'bg-slate-950 border-emerald-500/30 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            ann.type === 'alert' ? 'bg-rose-500 text-white' :
                            ann.type === 'warning' ? 'bg-amber-500 text-slate-950' :
                            ann.type === 'success' ? 'bg-emerald-500 text-slate-950' :
                            'bg-blue-500 text-white'
                          }`}>
                            {ann.type}
                          </span>
                          <h4 className="font-bold text-xs text-white truncate">{ann.title}</h4>
                        </div>
                        <p className="text-xs text-slate-300">{ann.message}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleAnnouncement(ann.id)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border ${
                            ann.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {ann.active ? 'ACTIVE' : 'PAUSED'}
                        </button>

                        <button
                          onClick={() => deleteAnnouncement(ann.id)}
                          className="p-1.5 bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Categories Management */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <form onSubmit={handleAddCategory} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-base">
                <Layers className="w-5 h-5" />
                <span>Create New Category</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solar & Energy"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Icon Class</label>
                  <select
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Sparkles">Sparkles</option>
                    <option value="Car">Car / Transport</option>
                    <option value="Smartphone">Electronics / Phone</option>
                    <option value="Home">Home / Property</option>
                    <option value="Wrench">Services / Tools</option>
                    <option value="Briefcase">Jobs / Work</option>
                    <option value="Armchair">Furniture</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Theme Accent</label>
                  <select
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="bg-emerald-500">Emerald Green</option>
                    <option value="bg-blue-500">Blue Accent</option>
                    <option value="bg-purple-500">Purple Accent</option>
                    <option value="bg-amber-500">Amber / Gold</option>
                    <option value="bg-rose-500">Rose / Pink</option>
                    <option value="bg-cyan-500">Cyan Teal</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category to Marketplace</span>
              </button>
            </form>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-extrabold text-white">Active Categories ({categories.length})</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => {
                  const isEditing = editingCatId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${cat.color} text-white flex items-center justify-center shrink-0`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingCatName}
                              onChange={(e) => setEditingCatName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                            />
                          ) : (
                            <h4 className="font-bold text-xs text-white truncate">{cat.name}</h4>
                          )}
                          <p className="text-[10px] text-slate-500">{cat.count || 0} active listings</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveCatName(cat.id)}
                            className="p-1.5 bg-emerald-500 text-slate-950 rounded-lg text-[10px] font-bold"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditingCatName(cat.name);
                            }}
                            className="p-1.5 bg-slate-900 text-slate-400 hover:text-white rounded-lg"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            deleteCategory(cat.id);
                            toast.info(`Category "${cat.name}" deleted`);
                          }}
                          className="p-1.5 bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Users Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="text-xs text-slate-400 font-semibold">
                Total Registered Users: <strong className="text-emerald-400">{allUsers.length}</strong>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">User Profile</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Contact Details</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Role</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatarUrl} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                            <div>
                              <p className="font-bold text-white flex items-center gap-1.5">
                                {u.fullName}
                                {u.verified && <VerifiedBadge type={u.verificationType || 'individual'} />}
                              </p>
                              <p className="text-[10px] text-slate-500">Member since {u.memberSince || '2023'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 space-y-0.5">
                          <p className="text-slate-300 font-mono text-[11px]">{u.email}</p>
                          <p className="text-slate-500 text-[10px]">{u.phoneNumber || 'No phone set'} • {u.location}</p>
                        </td>

                        <td className="px-6 py-4 space-y-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            u.role === 'admin' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            u.role === 'seller' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-[10px] border border-slate-700 transition-all flex items-center gap-1"
                              title="Modify all user record fields"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit Record</span>
                            </button>

                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Approvals */}
        {activeTab === 'approvals' && (
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black">Verification Badge Requests</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{pendingVerif.length} identity reviews pending</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verificationRequests.map((req) => (
                  <div key={req.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={req.docUrl} className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                        <div>
                          <h4 className="font-bold text-sm text-white">{req.userName}</h4>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                            {req.type} Apply
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase text-amber-400">{req.status}</span>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-2xl text-[11px] space-y-1.5">
                      <p className="text-slate-400 truncate">Doc: <strong className="text-white">{req.docType}</strong></p>
                      <p className="text-slate-400">ID: <strong className="text-emerald-400 font-mono">{req.docNumber}</strong></p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => processVerificationRequest(req.id, 'rejected')} className="flex-1 py-2 bg-slate-800 text-slate-400 font-bold rounded-xl text-[10px]">REJECT</button>
                        <button onClick={() => processVerificationRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px]">ISSUE BADGE</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black">Secure Password Resets</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{pendingPW.length} pending NIN authentication</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {passwordRequests.map((req) => (
                  <div key={req.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                       <img src={req.idDocumentUrl} className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                       <div className="min-w-0">
                         <h4 className="font-bold text-sm text-white truncate">{req.userName}</h4>
                         <p className="text-[10px] text-slate-500 truncate">{req.userEmail}</p>
                       </div>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-2xl text-[11px] space-y-1.5">
                      <p className="text-slate-400">NIN: <strong className="text-emerald-400 font-mono">{req.nin}</strong></p>
                      <p className="text-slate-400">Reason: <strong className="text-white italic">"{req.reason}"</strong></p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => processPasswordRequest(req.id, 'declined')} className="flex-1 py-2 bg-slate-800 text-slate-400 font-bold rounded-xl text-[10px]">DECLINE</button>
                        <button onClick={() => processPasswordRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px]">APPROVE NEW PW</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Promotion Payments */}
        {activeTab === 'promotionPayments' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black">Promotion Payment Requests</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{pendingPromoPay.length} pending payment proofs</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Promotion Request</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">User / Seller</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Details</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {promotionPaymentRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {req.paymentProofUrl ? (
                              <img src={req.paymentProofUrl} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                <Upload className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">Promotion: {req.planName} ({req.durationMonths} months)</p>
                              <p className="text-[10px] text-emerald-400 font-bold">Amount: {formatNGN(req.amount)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-300">{allUsers.find(u => u.id === req.userId)?.fullName || 'Unknown User'}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">{allUsers.find(u => u.id === req.userId)?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-slate-400">{req.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => processPromotionPaymentRequest(req.id, 'rejected')} className="p-2 bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                            <button onClick={() => processPromotionPaymentRequest(req.id, 'approved')} className="p-2 bg-emerald-500 text-slate-950 font-black rounded-xl"><Check className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Analytics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400"><Activity className="w-4 h-4" /><span className="text-[10px] font-black uppercase">{t('visitors')}</span></div>
                  <p className="text-3xl font-black text-white">{analytics.visitors}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400"><Package className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Active Ads</span></div>
                  <p className="text-3xl font-black text-white">{listings.length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-purple-400"><Layers className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Categories</span></div>
                  <p className="text-3xl font-black text-white">{categories.length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400"><RefreshCw className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Uptime</span></div>
                  <p className="text-3xl font-black text-white">99.9%</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.sessionsPerMinute.map((v, i) => ({ t: i, v }))}>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={3} fillOpacity={0.1} fill="#10b981" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Platform Integrity</h3>
              <div className="space-y-3">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
                    <div><p className="font-bold text-white">Identity Lock</p><p className="text-[10px] text-slate-500">2FA Active</p></div>
                  </div>
                  <div className="w-8 h-4 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Listings & Promotions */}
        {activeTab === 'listings' && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Active Promoted Ads ({promotedAds.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {promotedAds.map(ad => (
                  <div key={ad.id} className="bg-slate-950 border border-amber-500/30 p-4 rounded-2xl space-y-3 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                      <img src={ad.images[0]} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{ad.title}</p>
                        <p className="text-[9px] text-amber-400 font-black uppercase">{ad.promotionPlanName || 'TOP AD'}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-800">
                      <span>Featured</span>
                      <button onClick={() => updateListing(ad.id, { featured: false })} className="text-red-400 hover:underline">REVOKE</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Classified Ad</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Seller / Vendor</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Metrics</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredAds.map((ad) => (
                      <tr key={ad.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={ad.images[0]} className="w-12 h-10 rounded-lg object-cover border border-slate-700" />
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">{ad.title}</p>
                              <p className="text-[10px] text-emerald-400 font-black">{formatNGN(ad.price)} • {ad.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-300">{ad.sellerName}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">{ad.location}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-slate-400" /><span className="font-bold">{ad.viewsCount}</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/listing/${ad.id}`} className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl"><Eye className="w-4 h-4" /></Link>
                            <button onClick={() => deleteListing(ad.id)} className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Full User Record Editing Modal */}
        {editingUser && (
          <AdminEditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={(id, updated) => updateUser(id, updated)}
          />
        )}
      </main>

      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;