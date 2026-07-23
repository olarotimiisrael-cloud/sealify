import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import AdminEditUserModal from '../components/AdminEditUserModal';
import { UserProfile } from '../types/sealify';
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
  ShieldCheck, Award
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    user, isAdmin, logout, categories, addCategory, deleteCategory,
    listings, allUsers, updateUser, deleteUser, updateListing, deleteListing,
    promotionPaymentRequests, processPromotionPaymentRequest, 
    verificationRequests, processVerificationRequest,
    passwordRequests, processPasswordRequest,
    auditLogs, analytics, exportDatabaseBackup, broadcastMassNotification,
    disputeCases, processDisputeCase, intrusionLogs,
    systemConfig, updateSystemConfig, siteSettings, updateSiteSettings,
    adminPin, updateAdminPin
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'finance' | 'users' | 'listings' | 'requests' | 'security' | 'categories' | 'logs' | 'settings' | 'superuser'>('analytics');
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  
  // Superuser management state
  const [newPin, setNewPin] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Broadcast state
  const [bcTitle, setBcTitle] = useState('');
  const [bcMsg, setBcMsg] = useState('');
  const [bcTarget, setBcTarget] = useState<'all' | 'seller' | 'buyer'>('all');

  if (!isAdmin || !user) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center font-mono">
      <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/30 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
        <ShieldAlert className="w-10 h-10 text-rose-500" />
      </div>
      <h2 className="text-2xl font-black text-white tracking-widest uppercase">Access Level: Unauthorized</h2>
      <p className="text-slate-500 text-xs mt-2 uppercase">Root credentials required to access GodMode Terminal.</p>
      <Link to="/" className="mt-8 px-8 py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">Return to Safe Zone</Link>
    </div>
  );

  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPasswords = passwordRequests.filter(r => r.status === 'pending');
  const activeDisputes = disputeCases.filter(c => c.status !== 'resolved');
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 6) {
      toast.error("Master PIN must be at least 6 digits for security parity.");
      return;
    }
    updateAdminPin(newPin);
    setNewPin('');
    toast.success("GodMode Security PIN updated. Future login sessions will require this new key.");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          updateUser(user.id, { avatarUrl: ev.target.result as string });
          toast.success("Superuser forensic avatar updated successfully.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMsg.trim()) return;
    broadcastMassNotification(bcTitle, bcMsg, bcTarget);
    setBcTitle(''); setBcMsg('');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      
      {/* HUD Header */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 backdrop-blur-xl sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-0.5 relative z-10 overflow-hidden shadow-2xl">
                <img src={user.avatarUrl} className="w-full h-full object-cover rounded-xl" alt="Root" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-slate-950 rounded-lg flex items-center justify-center border-2 border-slate-900 z-20">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
                Sealify Master ControlPanel
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 animate-pulse">GODMODE</span>
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  System Status: Optimal
                </p>
                <span className="text-[10px] text-slate-600 font-mono">UID: {user.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={exportDatabaseBackup} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-[10px] font-black rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all group">
              <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" /> 
              GENERATE BACKUP
            </button>
            <button onClick={logout} className="p-2.5 bg-rose-600/10 text-rose-500 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all">
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 space-y-2 shrink-0">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-4">System Nodes</p>
          {[
            { id: 'analytics', label: 'Vitals & Stats', icon: Activity },
            { id: 'superuser', label: 'Master Profile', icon: Fingerprint, color: 'text-emerald-400' },
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'listings', label: 'Ad Inventory', icon: Package },
            { id: 'requests', label: 'Action Queue', icon: BadgeCheck, badge: pendingVerifications.length + pendingPasswords.length },
            { id: 'finance', label: 'Treasury', icon: Wallet, badge: pendingPromoPay.length },
            { id: 'categories', label: 'Market Grid', icon: Layout },
            { id: 'security', label: 'Threat Logs', icon: ShieldAlert, badge: intrusionLogs.length, color: 'text-rose-500' },
            { id: 'logs', label: 'Audit Trail', icon: History },
            { id: 'settings', label: 'Global Config', icon: SettingsIcon },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/10' : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'}`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className={`w-4.5 h-4.5 ${activeTab === tab.id ? 'text-slate-950' : tab.color || 'text-slate-500'}`} />
                <span className="text-[11px] font-black uppercase tracking-wider">{tab.label}</span>
              </div>
              {tab.badge && tab.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab === tab.id ? 'bg-slate-950 text-emerald-400' : 'bg-rose-600 text-white'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Dynamic Content Cluster */}
        <div className="flex-1 space-y-6">
          
          {/* Tab: Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Cloud Sessions', value: analytics.visitors, icon: Radio, trend: '+12%', color: 'text-emerald-400' },
                    { label: 'Active Items', value: listings.length, icon: Package, trend: '+5', color: 'text-blue-400' },
                    { label: 'Core Users', value: allUsers.length, icon: Users, trend: '84 new', color: 'text-amber-400' },
                    { label: 'Revenue (Est)', value: '₦4.2M', icon: DollarSign, trend: 'Optimal', color: 'text-teal-400' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] space-y-2 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 -rotate-45 translate-x-8 -translate-y-8 group-hover:translate-x-6 transition-transform"></div>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <div>
                        <p className="text-2xl font-black text-white">{stat.value}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${stat.trend.includes('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>{stat.trend}</span>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        Traffic Ingress Monitor
                      </h3>
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-950 px-2 py-1 rounded-lg">Real-time Feed</span>
                    </div>
                    <div className="h-56 flex items-end gap-2 pt-4">
                      {analytics.sessionsPerMinute.map((val, idx) => (
                        <div 
                          key={idx} 
                          className="flex-1 bg-gradient-to-t from-blue-500/40 via-blue-400/10 to-transparent border-t-2 border-blue-400/50 rounded-t-xl relative group transition-all" 
                          style={{ height: `${val * 2}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[9px] font-black text-emerald-400 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                            {val} sessions
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-slate-800/50 flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                       <span>Temporal Distribution (10m)</span>
                       <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Edge Node: Oyo-01</span>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                     <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 space-y-5">
                        <h3 className="font-black text-white text-[11px] uppercase tracking-widest flex items-center gap-2"><Cpu className="w-4.5 h-4.5 text-emerald-400" /> Infrastructure Vitals</h3>
                        <div className="space-y-4">
                          {[
                            { label: 'Memory Persistence', val: 38, color: 'bg-blue-500' },
                            { label: 'DB Latency', val: 94, color: 'bg-emerald-500' },
                            { label: 'AI Queue Load', val: 12, color: 'bg-purple-500' }
                          ].map(v => (
                            <div key={v.label} className="space-y-1.5">
                              <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                                <span>{v.label}</span>
                                <span className={v.val > 90 ? 'text-emerald-400' : 'text-slate-300'}>{v.val}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                                <div className={`${v.color} h-full transition-all duration-1000`} style={{ width: `${v.val}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>
                     
                     <button onClick={() => setIsSqlModalOpen(true)} className="w-full py-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-400 hover:text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl group">
                        <Database className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                        Explore Core Database Schema
                     </button>
                  </div>
               </div>
            </div>
          )}

          {/* Tab: Requests / Action Queue */}
          {activeTab === 'requests' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-3"><BadgeCheck className="w-5 h-5 text-emerald-400" /> Identity & Security Queue</h3>
                
                <div className="space-y-4">
                  {pendingVerifications.length === 0 && pendingPasswords.length === 0 ? (
                    <div className="py-20 text-center space-y-3 opacity-30">
                      <CheckCircle2 className="w-12 h-12 mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Queue Clear: All citizen nodes verified</p>
                    </div>
                  ) : (
                    <>
                      {pendingVerifications.map(req => (
                        <div key={req.id} className="p-5 bg-slate-950 border border-slate-800 rounded-[1.5rem] flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-emerald-500/30 transition-all">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0"><Award className="w-6 h-6" /></div>
                            <div className="min-w-0">
                              <h4 className="font-black text-white text-sm uppercase tracking-tight">Badge Request: {req.type}</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">{req.userName} • {req.userEmail}</p>
                              <p className="text-[9px] text-slate-600 font-mono mt-0.5">DOC: {req.docType} (#{req.docNumber})</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <a href={req.docUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-900 text-blue-400 rounded-xl border border-slate-800 hover:bg-slate-800"><Eye className="w-4 h-4" /></a>
                             <button onClick={() => processVerificationRequest(req.id, 'approved')} className="px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase">Approve</button>
                             <button onClick={() => processVerificationRequest(req.id, 'rejected')} className="px-4 py-2 bg-rose-600 text-white font-black rounded-xl text-[10px] uppercase">Reject</button>
                          </div>
                        </div>
                      ))}
                      {pendingPasswords.map(req => (
                        <div key={req.id} className="p-5 bg-slate-950 border border-rose-500/20 rounded-[1.5rem] flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-rose-500/40 transition-all">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0"><KeyRound className="w-6 h-6" /></div>
                            <div className="min-w-0">
                              <h4 className="font-black text-white text-sm uppercase tracking-tight">Secure Reset Request</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">{req.userName} • NIN: {req.nin}</p>
                              <p className="text-[9px] text-rose-400 font-bold mt-0.5 uppercase tracking-tighter">REASON: {req.reason}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <a href={req.id_document_url} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-900 text-blue-400 rounded-xl border border-slate-800 hover:bg-slate-800"><Eye className="w-4 h-4" /></a>
                             <button onClick={() => processPasswordRequest(req.id, 'approved')} className="px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase">Auth Reset</button>
                             <button onClick={() => processPasswordRequest(req.id, 'declined')} className="px-4 py-2 bg-rose-600 text-white font-black rounded-xl text-[10px] uppercase">Decline</button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Finance / Treasury */}
          {activeTab === 'finance' && (
             <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending Revenue</p>
                      <p className="text-3xl font-black text-white">₦{pendingPromoPay.reduce((a,b)=>a+b.amount, 0).toLocaleString()}</p>
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">{pendingPromoPay.length} proof uploads</span>
                   </div>
                   <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Revenue</p>
                      <p className="text-3xl font-black text-emerald-400">₦284,500</p>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">Cycle: Oct-Nov</span>
                   </div>
                   <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conversion Rate</p>
                      <p className="text-3xl font-black text-blue-400">8.4%</p>
                      <span className="text-[9px] font-bold text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">Ad Promotion Opt-in</span>
                   </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                   <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-3"><Wallet className="w-5 h-5 text-emerald-400" /> Payment Verification Desk</h3>
                   <div className="space-y-4">
                      {pendingPromoPay.length === 0 ? (
                        <div className="py-12 text-center opacity-30 italic text-[10px] uppercase font-black tracking-widest">No pending transactions found in ledger</div>
                      ) : (
                        pendingPromoPay.map(pay => (
                          <div key={pay.id} className="p-5 bg-slate-950 border border-slate-800 rounded-[1.5rem] flex flex-col sm:flex-row items-center justify-between gap-4 group">
                             <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0"><DollarSign className="w-6 h-6" /></div>
                                <div className="min-w-0">
                                   <h4 className="font-black text-white text-sm uppercase">₦{pay.amount.toLocaleString()} - {pay.planName}</h4>
                                   <p className="text-[9px] text-slate-500 font-mono">LISTING_UID: {pay.listingId}</p>
                                   <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-tighter">METHOD: {pay.paymentMethod.toUpperCase()}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                {pay.paymentProofUrl && (
                                   <a href={pay.paymentProofUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-blue-400 hover:bg-slate-800 transition-colors uppercase">View Receipt</a>
                                )}
                                <button onClick={() => processPromotionPaymentRequest(pay.id, 'approved')} className="p-2 bg-emerald-500 text-slate-950 rounded-xl hover:scale-105 transition-transform"><Check className="w-4.5 h-4.5" /></button>
                                <button onClick={() => processPromotionPaymentRequest(pay.id, 'rejected')} className="p-2 bg-rose-600 text-white rounded-xl hover:scale-105 transition-transform"><X className="w-4.5 h-4.5" /></button>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
             </div>
          )}

          {/* Tab: Settings / Global Config */}
          {activeTab === 'settings' && (
             <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
                      <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-3"><SettingsIcon className="w-5 h-5 text-emerald-400" /> Platform Infrastructure</h3>
                      <div className="space-y-5">
                         {[
                           { key: 'maintenanceMode', label: 'Global Maintenance Mode', desc: 'Deny access to all non-admin routes', icon: ShieldX },
                           { key: 'autoApproveAds', label: 'Autonomous Ad Approval', desc: 'Bypass manual moderator review for new posts', icon: Zap },
                           { key: 'requireIdForPosting', label: 'Mandatory Identity Verification', desc: 'Require Verified ID badge to post items', icon: BadgeCheck },
                           { key: 'aiSpamFilter', label: 'AI Forensic Spam Filtering', desc: 'Enable neural network analysis for ad descriptions', icon: Brain }
                         ].map(cfg => (
                           <div key={cfg.key} className="flex items-center justify-between gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800/50">
                              <div className="flex items-center gap-3 min-w-0">
                                 <cfg.icon className={`w-5 h-5 shrink-0 ${(systemConfig as any)[cfg.key] ? 'text-emerald-400' : 'text-slate-600'}`} />
                                 <div className="min-w-0">
                                    <p className="text-[11px] font-black text-white uppercase tracking-tight">{cfg.label}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{cfg.desc}</p>
                                 </div>
                              </div>
                              <button onClick={() => updateSystemConfig({ [cfg.key]: !(systemConfig as any)[cfg.key] })} className="shrink-0 transition-transform active:scale-90">
                                 {(systemConfig as any)[cfg.key] ? <ToggleRight className="w-10 h-10 text-emerald-500" /> : <ToggleLeft className="w-10 h-10 text-slate-800" />}
                              </button>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
                      <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-3"><Megaphone className="w-5 h-5 text-blue-400" /> Emergency Broadcast Node</h3>
                      <form onSubmit={handleSendBroadcast} className="space-y-4">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Transmission Subject</label>
                            <input type="text" value={bcTitle} onChange={e => setBcTitle(e.target.value)} required placeholder="e.g. System Upgrade Notification" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-blue-400 focus:outline-none focus:border-blue-500" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message Payload (Raw Text)</label>
                            <textarea rows={3} value={bcMsg} onChange={e => setBcMsg(e.target.value)} required placeholder="Relay critical instructions to the fleet..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-blue-500" />
                         </div>
                         <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                            <Radio className="w-4 h-4" /> Execute Broadcast
                         </button>
                      </form>
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-[10px] text-slate-500 font-bold leading-relaxed">
                        <span className="text-blue-400 mr-1">NOTICE:</span> Broadcasts are pushed instantly to all logged-in client nodes and recorded in the Forensic Audit Log. Use with extreme caution.
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* Tab: Users */}
          {activeTab === 'users' && (
             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                   <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-3"><Users className="w-5 h-5 text-emerald-400" /> Account Federation Management</h3>
                   <div className="relative w-full sm:w-80">
                      <Search className="w-4.5 h-4.5 text-slate-500 absolute left-4 top-3" />
                      <input 
                        type="text" 
                        placeholder="Filter by name, UID, or email..." 
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-700" 
                      />
                   </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                   <table className="w-full text-xs text-left">
                      <thead>
                         <tr className="text-slate-600 font-black uppercase tracking-[0.2em] border-b border-slate-800">
                            <th className="px-5 py-4">Node / Identity</th>
                            <th className="px-5 py-4">Auth Level</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                         {allUsers.filter(u => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                            <tr key={u.id} className="hover:bg-slate-950/40 transition-colors group">
                               <td className="px-5 py-5">
                                  <div className="flex items-center gap-4">
                                     <img src={u.avatarUrl} className="w-10 h-10 rounded-[1rem] object-cover border border-slate-800 group-hover:border-emerald-500/40 transition-colors" />
                                     <div>
                                        <p className="font-bold text-white text-sm">{u.fullName}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-5 py-5">
                                  <div className="flex flex-col items-start gap-1">
                                     <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">{u.role}</span>
                                     {u.verified && <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest ml-1">{u.verificationType} Badge</p>}
                                  </div>
                               </td>
                               <td className="px-5 py-5">
                                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${u.status === 'active' || !u.status ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-rose-500 border-rose-500/20 bg-rose-500/5'}`}>{u.status || 'active'}</span>
                               </td>
                               <td className="px-5 py-5 text-right">
                                  <div className="flex items-center justify-end gap-2.5">
                                     <button onClick={() => setEditingUser(u)} className="p-2.5 bg-slate-900 text-blue-400 rounded-xl border border-slate-800 hover:bg-slate-800 transition-all"><Edit3 className="w-4 h-4" /></button>
                                     {u.id !== user.id && <button onClick={() => deleteUser(u.id)} className="p-2.5 bg-slate-900 text-rose-500 rounded-xl border border-slate-800 hover:bg-rose-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>}
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* Other tab sections: categories, logs, security, superuser, listings */}
          {activeTab === 'listings' && (
             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                   <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-3"><Package className="w-5 h-5 text-emerald-400" /> Marketplace Item Control</h3>
                   <div className="relative w-full sm:w-80">
                      <Search className="w-4.5 h-4.5 text-slate-500 absolute left-4 top-3" />
                      <input 
                        type="text" 
                        placeholder="Search inventory..." 
                        value={listingSearch}
                        onChange={e => setListingSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-700" 
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {listings.filter(l => l.title.toLowerCase().includes(listingSearch.toLowerCase())).map(l => (
                      <div key={l.id} className="p-5 bg-slate-950 border border-slate-800 rounded-[1.5rem] flex items-center justify-between gap-4 group hover:border-emerald-500/30 transition-all">
                         <div className="flex items-center gap-4 min-w-0">
                            <img src={l.images[0]} className="w-16 h-16 rounded-xl object-cover border border-slate-800 group-hover:scale-105 transition-transform" />
                            <div className="min-w-0 space-y-1">
                               <h4 className="font-bold text-white text-sm truncate">{l.title}</h4>
                               <p className="text-[11px] text-emerald-400 font-black">₦{l.price.toLocaleString()}</p>
                               <div className="flex items-center gap-2 text-[9px] text-slate-500 uppercase font-black">
                                  <span className="truncate">{l.sellerName}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                  <span>{l.location.split(',')[0]}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => updateListing(l.id, { featured: !l.featured })} className={`p-2.5 rounded-xl border transition-all ${l.featured ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-900/10' : 'bg-slate-900 text-slate-600 border-slate-800 hover:text-white'}`}><Zap className="w-4 h-4 fill-current" /></button>
                            <button onClick={() => deleteListing(l.id)} className="p-2.5 bg-slate-900 text-rose-500 rounded-xl border border-slate-800 hover:bg-rose-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* Tab: Superuser / Profile & PIN */}
          {activeTab === 'superuser' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Superuser Identity</h2>
                    <p className="text-xs text-slate-500">Manage root credentials and forensic visual markers</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative group shrink-0">
                    <div className="w-32 h-32 rounded-[2rem] bg-slate-950 border-4 border-slate-900 shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Root Avatar" />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer"
                      >
                        <Camera className="w-6 h-6 text-white mb-1" />
                        <span className="text-[9px] font-black text-white uppercase">Upload New</span>
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 uppercase">ACTIVE_ROOT</div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Administrator Display Name</label>
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white flex items-center justify-between">
                        {user.fullName}
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Terminal Email</label>
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-mono text-emerald-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdatePin} className="space-y-6 pt-6 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-black text-sm text-white uppercase tracking-widest">Update Master Security PIN</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Protocol Key</label>
                      <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm font-mono tracking-[0.5em] text-slate-500 italic">
                        ••••••
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New 6-Digit Master PIN</label>
                      <input 
                        type="password" 
                        required 
                        maxLength={6}
                        placeholder="••••••"
                        value={newPin}
                        onChange={e => setNewPin(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-mono tracking-[0.5em] text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder:text-slate-800"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/10 hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 group">
                    <Shield className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Apply New Security Credentials
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-in fade-in duration-300">
               <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-3"><Layout className="w-5 h-5 text-emerald-400" /> Market Grid Architecture</h3>
               
               <form onSubmit={(e) => { e.preventDefault(); addCategory({ name: newCatName, color: 'bg-emerald-500', iconName: 'LayoutGrid' }); setNewCatName(''); }} className="flex gap-2">
                  <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Node Name..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500" />
                  <button type="submit" className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg hover:bg-emerald-400 transition-all">Add Category</button>
               </form>

               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center text-white`}><Zap className="w-4 h-4" /></div>
                          <span className="text-[11px] font-bold text-white uppercase">{cat.name}</span>
                       </div>
                       <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-slate-600 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
               <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-3"><History className="w-5 h-5 text-emerald-400" /> Master Forensic Ledger</h3>
               <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
                  {auditLogs.map(log => (
                    <div key={log.id} className="p-3.5 bg-slate-950 border border-slate-800/60 rounded-xl flex gap-3 text-[10px]">
                       <span className="text-slate-600 font-mono shrink-0">[{log.createdAt}]</span>
                       <div className="flex-1">
                          <span className={`font-black uppercase mr-2 ${log.type === 'security' ? 'text-rose-400' : 'text-emerald-400'}`}>{log.action}:</span>
                          <span className="text-slate-300">{log.details}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Threat Logs Tab */}
          {activeTab === 'security' && (
             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                   <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-3"><ShieldAlert className="w-5 h-5 text-rose-500" /> Perimeter Intrusion Log</h3>
                   <span className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[9px] font-black rounded-lg border border-rose-500/20">FIREWALL ACTIVE</span>
                </div>
                <div className="space-y-3">
                   {intrusionLogs.length === 0 ? (
                      <div className="py-20 text-center opacity-30 italic text-[10px] uppercase font-black">Zero perimeter breaches detected in current epoch</div>
                   ) : (
                      intrusionLogs.map(log => (
                        <div key={log.id} className="p-5 bg-slate-950 border border-rose-500/10 rounded-[1.5rem] space-y-3 relative overflow-hidden group">
                           <div className="flex justify-between items-start relative z-10">
                              <div className="space-y-1">
                                 <p className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 animate-pulse" /> Unauthorized Auth Attempt
                                 </p>
                                 <p className="text-sm font-bold text-white">Identity: <span className="text-emerald-400">{log.attemptedEmail}</span></p>
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">{log.timestamp}</p>
                           </div>
                           <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[9px] text-slate-400 leading-relaxed grid grid-cols-2 gap-2">
                              <div>OS: {log.deviceInfo.platform}</div>
                              <div>RES: {log.deviceInfo.screenResolution}</div>
                              <div>LANG: {log.deviceInfo.language}</div>
                              <div>AGENT: {log.deviceInfo.userAgent.slice(0, 30)}...</div>
                           </div>
                           <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase ${log.mediaCaptured ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>
                              <Camera className="w-3.5 h-3.5" /> Biometric Capture: {log.mediaStatus}
                           </div>
                        </div>
                      ))
                   )}
                </div>
             </div>
          )}

        </div>
      </main>

      <AdminEditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(id, updated) => updateUser(id, updated)} />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

// Sub-component for Icon display
const Brain = ({ className }: { className?: string }) => <Cpu className={className} />;

export default AdminDashboard;