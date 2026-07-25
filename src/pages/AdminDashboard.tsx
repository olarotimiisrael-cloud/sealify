import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { usePwaInstall } from '../hooks/usePwaInstall';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import AdminEditUserModal from '../components/AdminEditUserModal';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import { 
  Download, 
  Users, 
  Package, 
  Activity, 
  Share2, 
  ShieldCheck, 
  Database, 
  BellRing,
  Send,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Lock,
  Search,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  Check,
  ShieldAlert,
  CreditCard,
  MapPin,
  Clock,
  Plus,
  XCircle,
  FileText,
  UserCheck,
  Siren,
  Terminal,
  ExternalLink,
  Gavel,
  Flag
} from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile, Listing, SafeMeetupSpotConfig } from '../types/sealify';

const AdminDashboard: React.FC = () => {
  const { 
    user, 
    isAdmin, 
    listings, 
    allUsers, 
    updateUser, 
    deleteUser, 
    deleteListing, 
    broadcastMassNotification,
    exportDatabaseBackup,
    systemConfig,
    updateSystemConfig,
    adminEmail,
    adminPassword,
    adminPin,
    updateAdminCredentials,
    verificationRequests,
    processVerificationRequest,
    passwordRequests,
    processPasswordRequest,
    promotionPaymentRequests,
    processPromotionPaymentRequest,
    intrusionLogs,
    safeSpots,
    addSafeSpot,
    deleteSafeSpot,
    disputeCases,
    processDisputeCase,
    reports,
    processReport
  } = useSealify();
  
  const { isInstallable, install } = usePwaInstall();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'requests' | 'disputes' | 'security' | 'spots' | 'broadcast' | 'credentials'>('overview');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  
  // Search state
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  
  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Credentials state
  const [newEmail, setNewEmail] = useState(adminEmail);
  const [newPassword, setNewPassword] = useState(adminPassword);
  const [newPin, setNewPin] = useState(adminPin);
  const [showPass, setShowPass] = useState(false);

  // Safe Spot Form State
  const [spotName, setSpotName] = useState('');
  const [spotAddress, setSpotAddress] = useState('');
  const [spotZone, setSpotZone] = useState<'LAUTECH Area' | 'Takie / Center' | 'Sabo Market Zone' | 'Police HQ'>('LAUTECH Area');
  const [spotCategory, setSpotCategory] = useState<'Police Safe Zone' | 'Public Library' | 'Shopping Mall' | 'Café'>('Police Safe Zone');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <SEO title="Unauthorized — Sealify" />
        <Navbar />
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-4 max-w-md my-auto">
          <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-white">Access Denied</h2>
          <p className="text-xs text-slate-400">You must hold Administrator credentials to open this terminal.</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(listingSearch.toLowerCase()) || 
    l.category.toLowerCase().includes(listingSearch.toLowerCase())
  );

  const pendingVerifications = verificationRequests.filter(v => v.status === 'pending');
  const pendingPromotions = promotionPaymentRequests.filter(p => p.status === 'pending');
  const pendingDisputes = disputeCases.filter(d => d.status !== 'resolved');
  const pendingReports = reports.filter(r => r.status === 'pending');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error('Please fill both title and message for broadcast');
      return;
    }
    broadcastMassNotification(broadcastTitle.trim(), broadcastMessage.trim());
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword.trim() || !newPin.trim()) {
      toast.error('Email, Password, and Master PIN cannot be empty');
      return;
    }
    if (newPin.length < 6) {
      toast.error('Master PIN must be 6 digits');
      return;
    }
    updateAdminCredentials(newEmail.trim(), newPassword.trim(), newPin.trim());
  };

  const handleAddSafeSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotName.trim() || !spotAddress.trim()) {
      toast.error('Please provide spot name and physical address');
      return;
    }
    addSafeSpot({
      name: spotName.trim(),
      address: spotAddress.trim(),
      zone: spotZone,
      category: spotCategory,
      distance: 'Local Hub',
      hours: '8:00 AM - 6:00 PM',
      cctvVerified: true
    });
    setSpotName('');
    setSpotAddress('');
    toast.success('New Verified Safe Meetup Spot added!');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-20 font-sans">
      <SEO title="Admin Terminal — Sealify Master Control" />
      <Navbar />
      
      <main className="max-w-7xl mx-auto w-full px-4 py-8 space-y-8 flex-1">
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Sealify Master Control</h1>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Ogbomoso Node Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">AUTHENTICATED_SESSION: {user?.email}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => setIsSqlModalOpen(true)} 
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-emerald-400 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Database className="w-4 h-4" />
              <span>SQL Schema</span>
            </button>

            <button 
              onClick={exportDatabaseBackup} 
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export DB Backup</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'overview' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'users' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            User Records ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'listings' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Listings Feed ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'requests' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-amber-400 hover:text-amber-300'
            }`}
          >
            <span>Pending Approvals</span>
            {(pendingVerifications.length > 0 || pendingPromotions.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'disputes' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-900 text-purple-300 hover:text-white'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Disputes & Reports ({pendingDisputes.length + pendingReports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'security' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-900 text-rose-400 hover:text-rose-300'
            }`}
          >
            <Siren className="w-3.5 h-3.5" />
            <span>Intrusion Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('spots')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'spots' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Safe Meetup Spots
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'broadcast' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Broadcast Push
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'credentials' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-900 text-rose-400 hover:text-rose-300'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Admin Credentials</span>
          </button>
        </div>

        {/* Tab 1: System Health & App Distro */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 shadow-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registered Merchants</span>
                <p className="text-3xl font-black text-white">{allUsers.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 shadow-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Ads in Feed</span>
                <p className="text-3xl font-black text-emerald-400">{listings.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 shadow-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending Approvals</span>
                <p className="text-3xl font-black text-amber-400">{pendingVerifications.length + pendingPromotions.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 shadow-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Trade Claims</span>
                <p className="text-3xl font-black text-purple-400">{pendingDisputes.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* App Distribution Utility */}
              <section className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                    <Download className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">PWA App Distribution Utility</h2>
                    <p className="text-xs text-slate-400">Promote app installation across community groups</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Easily install Sealify on your test device or copy the direct distribution link to post in official WhatsApp community groups.
                </p>
                
                <div className="space-y-3">
                  {isInstallable && (
                    <button 
                      onClick={install} 
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl transition-transform active:scale-95 text-xs"
                    >
                      INSTALL ON THIS DEVICE
                    </button>
                  )}
                  
                  <button 
                    onClick={() => { 
                      navigator.clipboard.writeText(window.location.origin); 
                      toast.success('PWA App Link copied to clipboard!'); 
                    }} 
                    className="w-full py-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-black rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>COPY SHAREABLE APP LINK FOR WHATSAPP</span>
                  </button>
                </div>
              </section>

              {/* System Config Toggles */}
              <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                    <Layers className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">System Config Controls</h2>
                    <p className="text-xs text-slate-400">Toggle node policies in real-time</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div>
                      <p className="text-xs font-black text-white">Auto Approve Classified Ads</p>
                      <p className="text-[10px] text-slate-500">Post listings instantly without queueing</p>
                    </div>
                    <button
                      onClick={() => updateSystemConfig({ autoApproveAds: !systemConfig.autoApproveAds })}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        systemConfig.autoApproveAds ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {systemConfig.autoApproveAds ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div>
                      <p className="text-xs font-black text-white">AI Spam & Scam Shield</p>
                      <p className="text-[10px] text-slate-500">Filter suspected spam descriptions</p>
                    </div>
                    <button
                      onClick={() => updateSystemConfig({ aiSpamFilter: !systemConfig.aiSpamFilter })}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        systemConfig.aiSpamFilter ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {systemConfig.aiSpamFilter ? 'ENABLED' : 'OFF'}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-3">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.fullName} className="w-10 h-10 rounded-xl object-cover border border-emerald-500" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                        <Users className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-white">{u.fullName}</h4>
                        {u.verified && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.2 rounded font-black">VERIFIED</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">{u.email} • {u.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Record</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete user ${u.fullName}?`)) deleteUser(u.id);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Listings Management */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search listings by title..."
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800">
              {filteredListings.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-3">
                    <img src={item.images[0]} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-950" />
                    <div>
                      <h4 className="font-bold text-xs text-white truncate max-w-xs">{item.title}</h4>
                      <p className="text-[11px] text-emerald-400 font-black">₦{item.price.toLocaleString()} • {item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/listing/${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:text-white"
                    >
                      View Ad
                    </a>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ad "${item.title}"?`)) deleteListing(item.id);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Pending Approval Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-8">
            {/* ID Verification Submissions */}
            <div className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <span>Pending ID & CAC Verification Queue ({pendingVerifications.length})</span>
              </h3>

              {pendingVerifications.length === 0 ? (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500 italic">
                  No pending verification applications right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingVerifications.map((req) => (
                    <div key={req.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-white">{req.userName}</h4>
                          <p className="text-xs text-slate-400">{req.userEmail}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          {req.type}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-mono">
                        Doc Number: <strong className="text-emerald-400">{req.docNumber}</strong> ({req.docType})
                      </p>

                      {req.docUrl && (
                        <a href={req.docUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline">
                          <span>Inspect Document Photo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => processVerificationRequest(req.id, 'approved')}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs"
                        >
                          Approve Badge
                        </button>
                        <button
                          onClick={() => processVerificationRequest(req.id, 'rejected')}
                          className="flex-1 py-2 bg-slate-800 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Ad Promotion Payment Requests */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Pending Top Ad Payment Proofs ({pendingPromotions.length})</span>
              </h3>

              {pendingPromotions.length === 0 ? (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500 italic">
                  No pending promotion payments.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingPromotions.map((pay) => (
                    <div key={pay.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-slate-400 font-mono">Ad ID: {pay.listingId}</p>
                          <p className="text-lg font-black text-emerald-400">₦{pay.amount.toLocaleString()}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                          {pay.planName}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">Method: {pay.paymentMethod}</p>

                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => processPromotionPaymentRequest(pay.id, 'approved')}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs"
                        >
                          Approve Promotion
                        </button>
                        <button
                          onClick={() => processPromotionPaymentRequest(pay.id, 'rejected')}
                          className="flex-1 py-2 bg-slate-800 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl text-xs"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Trade Disputes & Safety Reports */}
        {activeTab === 'disputes' && (
          <div className="space-y-8">
            {/* Trade Disputes Section */}
            <div className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Gavel className="w-5 h-5 text-rose-400" />
                <span>Submitted Trade Dispute Claims ({disputeCases.length})</span>
              </h3>

              {disputeCases.length === 0 ? (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500 italic">
                  No trade dispute cases logged.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {disputeCases.map((disp) => (
                    <div key={disp.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-[10px] text-emerald-400 font-bold">{disp.id}</span>
                          <h4 className="font-bold text-sm text-white">{disp.itemTitle}</h4>
                          <p className="text-xs text-slate-400">Claimant: {disp.userEmail}</p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          disp.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                          disp.status === 'in_review' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {disp.status}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl text-xs space-y-1">
                        <p className="text-slate-300">Target Party: <strong className="text-white">{disp.counterparty}</strong></p>
                        <p className="text-slate-400 italic">"{disp.details}"</p>
                      </div>

                      {disp.evidenceUrl && (
                        <a href={disp.evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline">
                          <span>Inspect Evidence File</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => processDisputeCase(disp.id, 'in_review')}
                          className="flex-1 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-bold rounded-xl text-xs transition-all"
                        >
                          Assign Review
                        </button>
                        <button
                          onClick={() => processDisputeCase(disp.id, 'resolved')}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all"
                        >
                          Resolve & Close
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Flagged Ad Reports Section */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-400" />
                <span>Flagged Ad Reports Queue ({reports.length})</span>
              </h3>

              {reports.length === 0 ? (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500 italic">
                  No flagged listings reported.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reports.map((rep) => (
                    <div key={rep.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-white">{rep.listingTitle}</h4>
                          <p className="text-xs text-slate-400">Reporter: {rep.reporterName || 'Anonymous'}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                          {rep.reason}
                        </span>
                      </div>

                      {rep.details && (
                        <p className="text-xs text-slate-300 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          "{rep.details}"
                        </p>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => processReport(rep.id, 'dismiss')}
                          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                        >
                          Dismiss Report
                        </button>
                        <button
                          onClick={() => processReport(rep.id, 'resolve_delete_ad')}
                          className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-lg"
                        >
                          Delete Reported Ad
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Security & Intrusion Logs */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-rose-950/80 border border-rose-500/30 p-6 rounded-3xl space-y-2">
              <h3 className="text-lg font-black text-rose-200 uppercase flex items-center gap-2">
                <Siren className="w-5 h-5 text-rose-400" />
                <span>Forensic Threat Intelligence & Intrusion Logs</span>
              </h3>
              <p className="text-xs text-rose-300">
                Automated security logs captured whenever an unauthorized login attempt is registered at the admin terminal.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800">
              {intrusionLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs italic">
                  No intrusion incidents recorded. System terminal is secure.
                </div>
              ) : (
                intrusionLogs.map((log) => (
                  <div key={log.id} className="p-4 font-mono text-xs space-y-1 hover:bg-slate-800/40">
                    <div className="flex justify-between items-center text-rose-400 font-bold">
                      <span>ATTEMPTED EMAIL: {log.attemptedEmail}</span>
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{log.mediaStatus}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Safe Meetup Spots Config */}
        {activeTab === 'spots' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>Add Verified Safe Exchange Spot</span>
              </h3>

              <form onSubmit={handleAddSafeSpot} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Spot Name *</label>
                  <input
                    type="text"
                    required
                    value={spotName}
                    onChange={(e) => setSpotName(e.target.value)}
                    placeholder="e.g. LAUTECH Library Gate Spot"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Address *</label>
                  <input
                    type="text"
                    required
                    value={spotAddress}
                    onChange={(e) => setSpotAddress(e.target.value)}
                    placeholder="e.g. Under G Main Road, Ogbomoso"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Zone Area</label>
                  <select
                    value={spotZone}
                    onChange={(e) => setSpotZone(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LAUTECH Area">LAUTECH Area</option>
                    <option value="Takie / Center">Takie / Center</option>
                    <option value="Sabo Market Zone">Sabo Market Zone</option>
                    <option value="Police HQ">Police HQ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Spot Type</label>
                  <select
                    value={spotCategory}
                    onChange={(e) => setSpotCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Police Safe Zone">Police Safe Zone</option>
                    <option value="Public Library">Public Library</option>
                    <option value="Shopping Mall">Shopping Mall</option>
                    <option value="Café">Café</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="sm:col-span-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Safe Meetup Location</span>
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Configured Exchange Spots ({safeSpots.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {safeSpots.map((spot) => (
                  <div key={spot.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-white">{spot.name}</p>
                      <p className="text-[11px] text-slate-400">{spot.address}</p>
                      <span className="inline-block text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {spot.zone}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteSafeSpot(spot.id)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Mass Push Broadcast */}
        {activeTab === 'broadcast' && (
          <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                <BellRing className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">System Broadcast Dispatcher</h2>
                <p className="text-xs text-slate-400">Send an instant alert to all registered users on Sealify</p>
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-300">Alert Headline *</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. 🚀 Security Notice: New Safe Spots Added in Ogbomoso"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-300">Message Content *</label>
                <textarea
                  rows={4}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter details of the system announcement..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl text-xs shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>DISPATCH MASS BROADCAST TO ALL USERS</span>
              </button>
            </form>
          </section>
        )}

        {/* Tab 9: Admin Credentials & Security Setup */}
        {activeTab === 'credentials' && (
          <section className="bg-slate-900 border-2 border-rose-500/30 p-8 rounded-[2.5rem] space-y-6 shadow-2xl max-w-2xl mx-auto font-mono">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/30">
                <KeyRound className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase">Official Admin Credentials Manager</h2>
                <p className="text-xs text-slate-400">Update root login details and bypass security keys</p>
              </div>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-5 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-300 font-mono text-[10px]">
                  Official Terminal Email ID *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="admin@sealify.ng"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-300 font-mono text-[10px]">
                  Access Key (Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Admin1234"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-300 font-mono text-[10px]">
                  Master PIN (6 Digits) *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-rose-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="336699"
                    className="w-full bg-slate-950 border border-rose-500/40 rounded-xl pl-10 pr-4 py-2.5 text-rose-400 font-black font-mono tracking-widest focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1 text-[11px] text-slate-400">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Current Active Record
                </p>
                <p>Email: <span className="text-emerald-400 font-mono">{adminEmail}</span></p>
                <p>Access Key: <span className="text-emerald-400 font-mono">{adminPassword}</span></p>
                <p>Master PIN: <span className="text-emerald-400 font-mono">{adminPin}</span></p>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 uppercase tracking-widest font-mono"
              >
                <Check className="w-4 h-4" />
                <span>Save & Overwrite Official Credentials</span>
              </button>
            </form>
          </section>
        )}
      </main>

      <AdminEditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={(id, updated) => updateUser(id, updated)}
      />

      <SqlSchemaViewer
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      <MobileNav />
    </div>
  );
};

export default AdminDashboard;