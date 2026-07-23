import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import AdminEditUserModal from '../components/AdminEditUserModal';
import { UserProfile, Listing } from '../types/sealify';
import { 
  Shield, Package, Activity, Layers, RefreshCw, Edit3, Trash2,
  Search, ShieldCheck, Award, Check, X, Eye, KeyRound, Zap, Crown, 
  Database, Plus, Sparkles, Upload, AlertTriangle, LogOut, Megaphone, 
  Bell, Radio, ShieldAlert, Download, FileSpreadsheet, Terminal, 
  Clock, Server, DollarSign, Image, User, Users, FileText, CheckCircle2,
  AlertOctagon, Gavel, Filter, ArrowUpRight, Key, Fingerprint, Monitor, Cpu, Globe,
  Sliders, Lock, Unlock, ToggleLeft, ToggleRight, Send
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, user, logout, categories, addCategory, deleteCategory, updateCategory, 
    listings, allUsers, updateUser, deleteUser, updateListing, deleteListing, t,
    passwordRequests, processPasswordRequest, verificationRequests, processVerificationRequest,
    promotionPaymentRequests, processPromotionPaymentRequest, announcements, addAnnouncement, 
    toggleAnnouncement, deleteAnnouncement, reports, processReport, auditLogs, analytics,
    adminPin, updateAdminPin, intrusionLogs, systemConfig, updateSystemConfig, exportDatabaseBackup,
    broadcastMassNotification
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'finance' | 'users' | 'categories' | 'listings' | 'broadcasts' | 'moderation' | 'settings' | 'audit' | 'intrusions'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');
  const [newCatColor, setNewCatColor] = useState('bg-emerald-500');

  // New Broadcast State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');

  // Mass Push Broadcast State
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushRole, setPushRole] = useState<'all' | 'seller' | 'buyer'>('all');

  const filteredUsers = allUsers.filter(u => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPasswordRequests = passwordRequests.filter(r => r.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');
  const expiredAds = listings.filter(l => l.featured && l.promotionEndDate && new Date(l.promotionEndDate) < new Date());

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName.trim(), iconName: newCatIcon, count: 0, color: newCatColor });
    setNewCatName('');
    toast.success('Category added to marketplace UI!');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      toast.error('Please enter title and message for broadcast');
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
    toast.success('Global broadcast published live to header banner!');
  };

  const handleSendMassPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushMessage.trim()) {
      toast.error('Please enter push title and message');
      return;
    }
    broadcastMassNotification(pushTitle.trim(), pushMessage.trim(), pushRole);
    setPushTitle('');
    setPushMessage('');
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinInput || newPinInput.trim().length < 4) {
      toast.error('Please enter a valid PIN (at least 4-6 digits)');
      return;
    }
    updateAdminPin(newPinInput.trim());
    setIsPinModalOpen(false);
    setNewPinInput('');
  };

  const handleToggleRestriction = (u: UserProfile) => {
    const isCurrentlyRestricted = u.status === 'restricted' || u.status === 'banned';
    const newStatus = isCurrentlyRestricted ? 'active' : 'restricted';
    const reason = isCurrentlyRestricted ? '' : 'Account restricted by Administrator via Command Terminal';
    
    updateUser(u.id, { status: newStatus, restrictionReason: reason });
    toast.success(`User ${u.fullName} is now ${newStatus.toUpperCase()}`);
  };

  const formatNGN = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

  if (!isAdmin) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
      <Shield className="w-16 h-16 text-rose-500 mb-4" />
      <h2 className="text-2xl font-black text-white">Access Denied</h2>
      <p className="text-slate-400 text-xs mt-1">Authorized Administrator Credentials Required</p>
      <Link to="/" className="mt-6 px-6 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">Return to Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 md:pb-8 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 flex-1 space-y-6">
        
        {/* Top Header Terminal Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl gap-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Sealify Sovereign Terminal</h1>
              <p className="text-[11px] text-slate-400">Master Key & Security Control • Ogbomoso Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 flex-wrap w-full sm:w-auto">
            <button 
              onClick={() => setIsPinModalOpen(true)} 
              className="flex-1 sm:flex-initial px-3 py-2 bg-slate-800 hover:bg-slate-750 text-amber-400 text-[10px] font-black rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>MASTER PIN ({adminPin})</span>
            </button>

            <button 
              onClick={exportDatabaseBackup} 
              className="flex-1 sm:flex-initial px-3 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 text-[10px] font-black rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>BACKUP DB</span>
            </button>

            <button 
              onClick={() => setIsSqlModalOpen(true)} 
              className="p-2 bg-slate-800 hover:bg-slate-750 text-teal-400 text-[10px] font-black rounded-xl border border-slate-700"
              title="View SQL Migration Script"
            >
              <Database className="w-4 h-4" />
            </button>

            <button 
              onClick={logout} 
              className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/30"
              title="End Admin Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('analytics')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>ANALYTICS</button>
          <button onClick={() => setActiveTab('finance')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 relative ${activeTab === 'finance' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            FINANCE {pendingPromoPay.length > 0 && <span className="ml-1 bg-red-500 text-white text-[8px] px-1.5 py-0.2 rounded-full font-bold">{pendingPromoPay.length}</span>}
          </button>
          <button onClick={() => setActiveTab('users')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 relative ${activeTab === 'users' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            USERS & BADGES {(pendingVerifications.length > 0 || pendingPasswordRequests.length > 0) && <span className="ml-1 bg-amber-500 text-slate-950 text-[8px] px-1.5 py-0.2 rounded-full font-extrabold">{pendingVerifications.length + pendingPasswordRequests.length}</span>}
          </button>
          <button onClick={() => setActiveTab('categories')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 ${activeTab === 'categories' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>CATEGORIES</button>
          <button onClick={() => setActiveTab('listings')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 relative ${activeTab === 'listings' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            INVENTORY {expiredAds.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1 animate-pulse"></span>}
          </button>
          <button onClick={() => setActiveTab('moderation')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 relative ${activeTab === 'moderation' ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/20' : 'text-slate-400 hover:text-white'}`}>
            MODERATION {pendingReports.length > 0 && <span className="ml-1 bg-red-500 text-white text-[8px] px-1.5 py-0.2 rounded-full font-bold">{pendingReports.length}</span>}
          </button>
          <button onClick={() => setActiveTab('settings')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 ${activeTab === 'settings' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>SYSTEM CONFIG</button>
          <button onClick={() => setActiveTab('broadcasts')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 ${activeTab === 'broadcasts' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>BROADCASTS</button>
          <button onClick={() => setActiveTab('intrusions')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 relative ${activeTab === 'intrusions' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-slate-400 hover:text-white'}`}>
            INTRUSIONS {intrusionLogs.length > 0 && <span className="ml-1 bg-white text-red-600 text-[8px] px-1.5 py-0.2 rounded-full font-black">{intrusionLogs.length}</span>}
          </button>
          <button onClick={() => setActiveTab('audit')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 ${activeTab === 'audit' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>AUDIT LOGS</button>
        </div>

        {/* 1. ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                 {[ 
                   { label: 'Live Visitors', value: analytics.visitors, icon: Activity, color: 'text-emerald-400' }, 
                   { label: 'Active Ads', value: listings.length, icon: Package, color: 'text-blue-400' }, 
                   { label: 'Gross Revenue', value: '₦142,500', icon: DollarSign, color: 'text-amber-400' }, 
                   { label: 'Uptime', value: '99.9%', icon: Server, color: 'text-purple-400' } 
                 ].map((stat, i) => (
                   <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                     <div className={`flex items-center gap-1.5 ${stat.color}`}>
                       <stat.icon className="w-3.5 h-3.5" />
                       <span className="text-[9px] font-black uppercase tracking-wider">{stat.label}</span>
                     </div>
                     <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
                   </div>
                 ))}
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl h-72 shadow-2xl relative overflow-hidden">
                 <div className="flex items-center gap-2 mb-4">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <h3 className="text-xs font-black uppercase text-slate-400">Real-Time Platform Sessions</h3>
                 </div>
                 <ResponsiveContainer width="100%" height="80%">
                   <AreaChart data={analytics.sessionsPerMinute.map((v, i) => ({ t: i, v }))}>
                     <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                     <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={3} fillOpacity={0.15} fill="#10b981" />
                   </AreaChart>
                 </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
               <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Security & System Health</span>
                  </h3>
                  <div className="space-y-2.5">
                     {[ 
                       { label: 'Database Integrity', status: 'Online', color: 'text-emerald-400' }, 
                       { label: 'NIN Auth Protocol', status: 'Active', color: 'text-blue-400' }, 
                       { label: 'Ad Spam Filter', status: 'Scanning', color: 'text-amber-400' },
                       { label: 'Master Security PIN', status: `Set (${adminPin})`, color: 'text-emerald-400' }
                     ].map((item, i) => (
                       <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                         <span className="font-bold text-slate-400">{item.label}</span>
                         <span className={`text-[10px] font-black uppercase ${item.color}`}>{item.status}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* SYSTEM CONFIG TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">System Global Configuration</h2>
                <p className="text-xs text-slate-400">Control marketplace behavior, security policies, and ad approvals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">Maintenance Mode</h4>
                    <p className="text-xs text-slate-400">Pause public browsing and new ad postings</p>
                  </div>
                  <button
                    onClick={() => updateSystemConfig({ maintenanceMode: !systemConfig.maintenanceMode })}
                    className={`p-2 rounded-xl border font-bold text-xs ${systemConfig.maintenanceMode ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    {systemConfig.maintenanceMode ? 'ACTIVE (PAUSED)' : 'OFF (NORMAL)'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">Auto-Approve New Listings</h4>
                    <p className="text-xs text-slate-400">Publish ads instantly without manual admin queue</p>
                  </div>
                  <button
                    onClick={() => updateSystemConfig({ autoApproveAds: !systemConfig.autoApproveAds })}
                    className={`p-2 rounded-xl border font-bold text-xs ${systemConfig.autoApproveAds ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    {systemConfig.autoApproveAds ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">Require NIN ID for Postings</h4>
                    <p className="text-xs text-slate-400">Force sellers to hold a verified badge before creating ads</p>
                  </div>
                  <button
                    onClick={() => updateSystemConfig({ requireIdForPosting: !systemConfig.requireIdForPosting })}
                    className={`p-2 rounded-xl border font-bold text-xs ${systemConfig.requireIdForPosting ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    {systemConfig.requireIdForPosting ? 'MANDATORY' : 'OPTIONAL'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">AI Fraud & Spam Filter</h4>
                    <p className="text-xs text-slate-400">Scan ad descriptions for suspicious external links or scam flags</p>
                  </div>
                  <button
                    onClick={() => updateSystemConfig({ aiSpamFilter: !systemConfig.aiSpamFilter })}
                    className={`p-2 rounded-xl border font-bold text-xs ${systemConfig.aiSpamFilter ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    {systemConfig.aiSpamFilter ? 'SCANNING' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. FINANCE TAB */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><DollarSign className="w-6 h-6" /></div>
              <div><h2 className="text-xl font-black">Promotion Payment Verifications</h2><p className="text-xs text-slate-400">Review receipts for Opay/Paga transfers and activate Top Ad boosts.</p></div>
            </div>
            {pendingPromoPay.length === 0 ? (
              <div className="bg-slate-900 p-12 border border-slate-800 rounded-3xl text-center text-slate-500 text-xs">No pending promotion payments in the queue.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPromoPay.map(req => (
                  <div key={req.id} className="bg-slate-900 border border-emerald-500/20 p-5 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <img src={req.paymentProofUrl} className="w-16 h-16 rounded-xl object-cover border border-slate-800 cursor-zoom-in" onClick={() => window.open(req.paymentProofUrl)} />
                        <div><p className="font-bold text-white">NGN {req.amount.toLocaleString()}</p><p className="text-[10px] text-emerald-400 font-mono">AD ID: {req.listingId}</p><p className="text-[10px] text-slate-500">Plan: {req.planName}</p></div>
                      </div>
                      <span className="text-[8px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded uppercase">Pending Verify</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => processPromotionPaymentRequest(req.id, 'rejected')} className="flex-1 py-2 bg-slate-800 text-slate-400 font-black rounded-xl text-[10px] uppercase">REJECT PROOF</button>
                      <button onClick={() => processPromotionPaymentRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase">ACTIVATE BOOST</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. USERS & BADGES TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Verification Badge Approval Requests */}
            {pendingVerifications.length > 0 && (
              <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wider">
                  <Award className="w-5 h-5" />
                  <span>Pending Merchant Badge Applications ({pendingVerifications.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingVerifications.map((vReq) => (
                    <div key={vReq.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{vReq.userName}</h4>
                          <p className="text-[10px] text-slate-400">{vReq.userEmail} • Doc: {vReq.docType}</p>
                          <p className="text-[10px] text-emerald-400 font-mono font-bold">Doc #: {vReq.docNumber}</p>
                        </div>
                        <span className="text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase">
                          {vReq.type} Badge
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => processVerificationRequest(vReq.id, 'rejected')} className="flex-1 py-2 bg-slate-800 text-slate-400 font-bold rounded-xl text-xs">Reject</button>
                        <button onClick={() => processVerificationRequest(vReq.id, 'approved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow">Grant Badge</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NIN Password Change Requests Queue */}
            {pendingPasswordRequests.length > 0 && (
              <div className="bg-slate-900 border border-blue-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-blue-400 font-black text-sm uppercase tracking-wider">
                  <KeyRound className="w-5 h-5" />
                  <span>NIN Password Reset Requests ({pendingPasswordRequests.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingPasswordRequests.map((pReq) => (
                    <div key={pReq.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{pReq.userName}</h4>
                          <p className="text-[10px] text-slate-400">{pReq.userEmail}</p>
                          <p className="text-[10px] text-blue-400 font-mono font-bold">NIN: {pReq.nin}</p>
                          <p className="text-[10px] text-slate-500 italic mt-1">Reason: "{pReq.reason}"</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => processPasswordRequest(pReq.id, 'declined')} className="flex-1 py-2 bg-slate-800 text-slate-400 font-bold rounded-xl text-xs">Decline</button>
                        <button onClick={() => processPasswordRequest(pReq.id, 'approved')} className="flex-1 py-2 bg-blue-600 text-white font-black rounded-xl text-xs shadow">Approve Reset</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Directory Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-white">Registered Marketplace Members ({allUsers.length})</h3>
                  <p className="text-xs text-slate-400">Search and edit user records, vendor roles, and restrictions</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead className="bg-slate-950 border-b border-slate-800 font-black uppercase text-slate-500">
                    <tr className="px-4 py-3">
                      <th className="p-3">User Member</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Badge</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img src={u.avatarUrl} className="w-8 h-8 rounded-xl object-cover border border-slate-800 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">{u.fullName}</p>
                              <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 capitalize font-bold text-slate-300">{u.role}</td>
                        <td className="p-3"><VerifiedBadge type={u.verificationType || 'none'} showText /></td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            u.status === 'restricted' || u.status === 'banned' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1 sm:space-x-2 shrink-0">
                          <button 
                            onClick={() => handleToggleRestriction(u)} 
                            className={`p-1.5 rounded-lg ${u.status === 'restricted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}
                            title={u.status === 'restricted' ? 'Restore User' : 'Quick Restrict User'}
                          >
                            {u.status === 'restricted' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => setEditingUser(u)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg" title="Edit Record"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteUser(u.id)} className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg" title="Delete User"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <form onSubmit={handleAddCategory} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row items-end gap-4 shadow-xl">
              <div className="flex-1 space-y-1.5 w-full"><label className="text-xs font-black text-slate-400 uppercase">New Category Name</label><input type="text" required value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Solar & Inverters" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:border-emerald-500" /></div>
              <div className="space-y-1.5 w-full sm:w-auto"><label className="text-xs font-black text-slate-400 uppercase">Accent</label><select value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs"><option value="bg-emerald-500">Green</option><option value="bg-blue-500">Blue</option><option value="bg-purple-500">Purple</option><option value="bg-amber-500">Amber</option></select></div>
              <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2"><Plus className="w-4 h-4" /><span>CREATE</span></button>
            </form>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
               {categories.map(cat => (
                 <div key={cat.id} className="bg-slate-900 p-4 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 group">
                   <div className="flex items-center gap-2 min-w-0"><div className={`w-8 h-8 rounded-lg ${cat.color} text-white flex items-center justify-center shrink-0`}><Layers className="w-4 h-4" /></div><span className="font-bold text-xs truncate">{cat.name}</span></div>
                   <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-slate-500 hover:text-rose-500"><X className="w-4 h-4" /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* 5. INVENTORY TAB */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
             {expiredAds.length > 0 && (
               <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-xs tracking-widest"><AlertTriangle className="w-5 h-5" /><span>Expired Promotions Detected</span></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {expiredAds.map(ad => (
                      <div key={ad.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <div className="min-w-0"><p className="text-xs font-bold text-white truncate">{ad.title}</p><p className="text-[9px] text-slate-500">Ended: {new Date(ad.promotionEndDate!).toLocaleDateString()}</p></div>
                        <button onClick={() => updateListing(ad.id, { featured: false })} className="px-3 py-1 bg-rose-600 text-white text-[9px] font-black rounded-lg">REVOKE BOOST</button>
                      </div>
                    ))}
                  </div>
               </div>
             )}
             <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className="bg-slate-950 border-b border-slate-800 font-black uppercase text-slate-500"><tr className="px-6 py-4"><th>Classified Ad</th><th>Status</th><th>Performance</th><th>Action</th></tr></thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {listings.map(ad => (
                        <tr key={ad.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 sm:px-6 py-4"><div className="flex items-center gap-3"><img src={ad.images[0]} className="w-10 h-8 rounded-lg object-cover shrink-0" /><div><p className="font-bold text-white truncate max-w-xs">{ad.title}</p><p className="text-[10px] text-slate-500">{ad.category} • {ad.id}</p></div></div></td>
                          <td className="px-4 sm:px-6 py-4"><span className={`px-2 py-0.5 rounded-[6px] font-black uppercase text-[8px] ${ad.featured ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{ad.featured ? 'Promoted' : 'Basic'}</span></td>
                          <td className="px-4 sm:px-6 py-4 font-bold text-slate-300">{ad.viewsCount} Views</td>
                          <td className="px-4 sm:px-6 py-4"><button onClick={() => deleteListing(ad.id)} className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {/* 6. MODERATION TAB */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Marketplace Safety & Moderation Queue</h2>
                <p className="text-xs text-slate-400">Inspect user safety reports regarding counterfeit products, wrong pricing, or spam</p>
              </div>
            </div>

            {pendingReports.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
                No active safety reports pending review. Marketplace guidelines are clean!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingReports.map((rep) => (
                  <div key={rep.id} className="bg-slate-900 border border-rose-500/30 p-5 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-black uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                          {rep.reason}
                        </span>
                        <h4 className="font-bold text-sm text-white mt-2">{rep.listingTitle}</h4>
                        <p className="text-[10px] text-slate-500">Reported by: {rep.reporterName} • {rep.createdAt}</p>
                      </div>
                    </div>

                    {rep.details && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
                        "{rep.details}"
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => processReport(rep.id, 'dismiss')}
                        className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-750 transition-colors"
                      >
                        Dismiss Report
                      </button>
                      <button
                        onClick={() => processReport(rep.id, 'resolve_delete_ad')}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition-colors shadow-lg"
                      >
                        Delete Offending Ad
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. BROADCASTS TAB */}
        {activeTab === 'broadcasts' && (
          <div className="space-y-6">
            {/* Direct Mass User Push Notification Dispatch */}
            <form onSubmit={handleSendMassPush} className="bg-slate-900 border border-purple-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-purple-400 font-black text-sm uppercase tracking-wider">
                <Bell className="w-5 h-5" />
                <span>Dispatch Mass Push Notification to Inboxes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Push Title *</label>
                  <input
                    type="text"
                    required
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="e.g. Price Drop Alert on All Electronics!"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Target User Group</label>
                  <select
                    value={pushRole}
                    onChange={(e) => setPushRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 capitalize"
                  >
                    <option value="all">All Members ({allUsers.length})</option>
                    <option value="seller">Sellers Only ({allUsers.filter(u=>u.role === 'seller').length})</option>
                    <option value="buyer">Buyers Only ({allUsers.filter(u=>u.role === 'buyer').length})</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Push Message Body *</label>
                <textarea
                  rows={2}
                  required
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                  placeholder="Enter message text to push into target users' notification center..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Mass Push Notification</span>
              </button>
            </form>

            {/* Header Banner Announcement Form */}
            <form onSubmit={handleCreateAnnouncement} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider">
                <Megaphone className="w-5 h-5" />
                <span>Create Global Header Broadcast Banner</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Banner Headline Title</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. Safe Exchange Zones Notice"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Banner Style / Type</label>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 capitalize"
                  >
                    <option value="info">Info (Slate)</option>
                    <option value="success">Success (Emerald Green)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="alert">Alert (Rose Red)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Message Content</label>
                <textarea
                  rows={2}
                  required
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Enter message to display across all top header bars..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors"
              >
                <Radio className="w-4 h-4" />
                <span>Publish Live Announcement Banner</span>
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-white">Active & Past Broadcast Banners</h3>
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{ann.title}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        ann.type === 'alert' ? 'bg-rose-500/20 text-rose-300' :
                        ann.type === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                        ann.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {ann.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{ann.message}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleAnnouncement(ann.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        ann.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {ann.active ? 'Active (Live)' : 'Paused'}
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. INTRUSIONS TAB */}
        {activeTab === 'intrusions' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Security Intrusion Alerts & Forensics</h2>
                <p className="text-xs text-slate-400">Blocked unauthorized login attempts with captured device metadata</p>
              </div>
            </div>

            {intrusionLogs.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-sm text-slate-500">No security intrusions detected in this session.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {intrusionLogs.map((log) => (
                  <div key={log.id} className="bg-slate-900 border-2 border-red-600/30 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-red-600/5 to-transparent"></div>
                    
                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                      {/* Alert Info */}
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest animate-pulse">Critical Alert</span>
                            <span className="text-[10px] font-mono text-slate-500">{log.id} • {log.timestamp}</span>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${log.mediaCaptured ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                            Media: {log.mediaStatus}
                          </div>
                        </div>

                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                          <p className="text-[10px] text-slate-500 uppercase font-black">Targeted Access Key (Email)</p>
                          <p className="text-base font-mono text-red-400 font-bold">{log.attemptedEmail}</p>
                        </div>

                        {/* Device Spec Table */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                            <Monitor className="w-4 h-4 text-blue-400" />
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase font-bold">Platform</p>
                              <p className="text-[11px] text-white font-bold">{log.deviceInfo.platform}</p>
                            </div>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                            <Cpu className="w-4 h-4 text-purple-400" />
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase font-bold">Processing</p>
                              <p className="text-[11px] text-white font-bold">{log.deviceInfo.cores} Logical Cores</p>
                            </div>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                            <Globe className="w-4 h-4 text-emerald-400" />
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase font-bold">Locale</p>
                              <p className="text-[11px] text-white font-bold">{log.deviceInfo.language}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-slate-400 leading-snug break-all">
                          <span className="text-blue-400 font-bold">Fingerprint:</span> {log.deviceInfo.userAgent}
                        </div>
                      </div>

                      {/* Action Sidebar */}
                      <div className="w-full md:w-56 space-y-3 shrink-0">
                         <div className="bg-red-600/10 border border-red-500/20 p-4 rounded-2xl text-center space-y-2">
                           <ShieldAlert className="w-6 h-6 text-red-500 mx-auto" />
                           <p className="text-[10px] text-red-200 leading-tight">Evidence packet ready for NPF Cybercrime Unit.</p>
                         </div>
                         <button className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-[10px] uppercase shadow-lg shadow-red-900/40">REPORT TO AGENCY</button>
                         <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-[10px] uppercase">DISMISS & LOG</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base text-white">System Audit & Compliance Log</h3>
                <p className="text-xs text-slate-400">Complete record of administrative actions, user logins, and badge issuances</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
                {auditLogs.length} Events Logged
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs font-mono min-w-[500px]">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-500 uppercase font-black">
                  <tr className="px-4 py-3">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Action Event</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="p-3 text-slate-500 whitespace-nowrap">{log.createdAt}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          log.type === 'security' ? 'bg-rose-500/20 text-rose-400' :
                          log.type === 'verification' ? 'bg-purple-500/20 text-purple-300' :
                          log.type === 'ad' ? 'bg-blue-500/20 text-blue-300' : 
                          log.type === 'intrusion' ? 'bg-red-600 text-white' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-200 whitespace-nowrap">{log.action}</td>
                      <td className="p-3 text-slate-400">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Change Master Security PIN Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setIsPinModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleUpdatePin} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-xl text-white">Update Master Security PIN</h3>
                <p className="text-xs text-slate-400">Current Security PIN: <span className="font-mono text-emerald-400 font-bold">{adminPin}</span></p>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">New Master Security PIN *</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Enter new 6-digit PIN"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save New Master Security PIN</span>
              </button>
            </form>
          </div>
        </div>
      )}

      <AdminEditUserModal 
        user={editingUser} 
        onClose={() => setEditingUser(null)} 
        onSave={(id, updated) => updateUser(id, updated)} 
      />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;