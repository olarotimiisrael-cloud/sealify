import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import AdminEditUserModal from '../components/AdminEditUserModal';
import { UserProfile, VerificationRequest, PasswordChangeRequest, PromotionPaymentRequest, AdReport, DisputeCase, SecurityIntrusionLog, AuditLog } from '../types/sealify';
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
  UserPlus, UserMinus, ShieldAlert as AlertIcon
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
    adminPin, updateAdminPin, announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
    reports, processReport
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'finance' | 'users' | 'listings' | 'requests' | 'security' | 'categories' | 'logs' | 'settings' | 'superuser' | 'disputes'>('analytics');
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  
  // Superuser identity state
  const [adminFullName, setAdminFullName] = useState(user?.fullName || '');
  const [adminEmail, setAdminEmail] = useState(user?.email || '');
  const [adminPhone, setAdminPhone] = useState(user?.phoneNumber || '');
  const [newPin, setNewPin] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Broadcast state
  const [bcTitle, setBcTitle] = useState('');
  const [bcMsg, setBcMsg] = useState('');
  const [bcTarget, setBcTarget] = useState<'all' | 'seller' | 'buyer'>('all');
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (user && activeTab === 'superuser') {
       setAdminFullName(user.fullName);
       setAdminEmail(user.email);
       setAdminPhone(user.phoneNumber || '');
    }
  }, [user, activeTab]);

  if (!isAdmin || !user) return null;

  const handleUpdateIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(user.id, { fullName: adminFullName.trim(), email: adminEmail.trim(), phoneNumber: adminPhone.trim() });
    toast.success("Root identity records updated.");
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 6) { toast.error("PIN must be 6 digits."); return; }
    updateAdminPin(newPin);
    setNewPin('');
    toast.success("Master Security PIN updated.");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) updateUser(user.id, { avatarUrl: ev.target.result as string });
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

  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPasswords = passwordRequests.filter(r => r.status === 'pending');
  const activeDisputes = disputeCases.filter(c => c.status !== 'resolved');
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-24 md:pb-8 font-sans">
      <Navbar />
      
      {/* HUD Header */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 backdrop-blur-xl sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-0.5 relative shadow-2xl">
              <img src={user.avatarUrl} className="w-full h-full object-cover rounded-xl" alt="Root" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-slate-950 rounded-lg flex items-center justify-center border-2 border-slate-900 z-20">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
                Sealify Master Control
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">GODMODE</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Administrator Level 5
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={exportDatabaseBackup} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-[10px] font-black rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all">
              <Download className="w-3.5 h-3.5" /> BACKUP
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
          {[
            { id: 'analytics', label: 'Vitals & Stats', icon: Activity },
            { id: 'superuser', label: 'Master Profile', icon: Fingerprint, color: 'text-emerald-400' },
            { id: 'users', label: 'User Directory', icon: Users, badge: allUsers.length },
            { id: 'listings', label: 'Ad Inventory', icon: Package, badge: listings.length },
            { id: 'requests', label: 'Action Queue', icon: BadgeCheck, badge: pendingVerifications.length + pendingPasswords.length },
            { id: 'finance', label: 'Treasury', icon: Wallet, badge: pendingPromoPay.length },
            { id: 'disputes', label: 'Dispute Center', icon: Gavel, badge: activeDisputes.length + pendingReports.length, color: 'text-rose-400' },
            { id: 'security', label: 'Threat Logs', icon: ShieldAlert, badge: intrusionLogs.length, color: 'text-rose-500' },
            { id: 'logs', label: 'Audit Trail', icon: History },
            { id: 'settings', label: 'Global Config', icon: SettingsIcon },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950 shadow-xl' : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'}`}
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

        {/* Content Modules */}
        <div className="flex-1 space-y-6">
          {/* User Directory Tab */}
          {activeTab === 'users' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4">
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/30">
                 <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                       <Users className="w-5 h-5 text-emerald-400" />
                       Account Federation
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Manage global user identities and security states</p>
                 </div>
                 <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" 
                    />
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">User Identity</th>
                      <th className="px-6 py-4">Role / State</th>
                      <th className="px-6 py-4">Verification</th>
                      <th className="px-6 py-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatarUrl} className="w-9 h-9 rounded-xl object-cover border border-slate-800" alt="" />
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">{u.fullName}</p>
                              <p className="text-[10px] text-slate-500 font-mono truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-wider ${u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{u.role}</span>
                            <div className="flex items-center gap-1.5">
                               <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'banned' ? 'bg-rose-500' : u.status === 'restricted' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                               <span className="text-[10px] font-bold text-slate-400 capitalize">{u.status || 'active'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           {u.verified ? (
                             <div className="flex items-center gap-1 text-emerald-400 font-black text-[10px] uppercase">
                               <ShieldCheck className="w-3.5 h-3.5" /> {u.verificationType}
                             </div>
                           ) : <span className="text-slate-600 font-bold text-[10px] uppercase">Unverified</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setEditingUser(u)} className="p-2 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-xl transition-all border border-slate-800">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteUser(u.id)} className="p-2 bg-slate-950 hover:bg-rose-500 hover:text-white text-slate-500 rounded-xl transition-all border border-slate-800">
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Queue (Requests) Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20"><BadgeCheck className="w-6 h-6" /></div>
                 <div>
                    <h2 className="text-xl font-black text-white">Pending Action Queue</h2>
                    <p className="text-xs text-slate-500 uppercase font-black tracking-widest">{pendingVerifications.length + pendingPasswords.length} items requiring moderator attention</p>
                 </div>
              </div>

              {/* ID Verification Requests */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Verifications</h4>
                {pendingVerifications.length === 0 ? (
                  <div className="bg-slate-900/50 border border-dashed border-slate-800 p-8 rounded-3xl text-center text-slate-600 text-xs font-bold">No pending ID verification requests.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingVerifications.map((req) => (
                      <div key={req.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-950 rounded-xl overflow-hidden border border-slate-800"><img src={req.docUrl} className="w-full h-full object-cover" /></div>
                            <div>
                               <p className="text-xs font-black text-white">{req.userName}</p>
                               <p className="text-[10px] text-emerald-400 font-bold uppercase">{req.type} Badge</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-slate-600">{req.id}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-[11px]">
                           <p><span className="text-slate-500">Doc:</span> <span className="text-slate-300 font-bold">{req.docType}</span></p>
                           <p><span className="text-slate-500">ID #:</span> <span className="text-slate-300 font-mono">{req.docNumber}</span></p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => processVerificationRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5"><Check className="w-3.5 h-3.5" /> Approve</button>
                           <button onClick={() => processVerificationRequest(req.id, 'rejected')} className="flex-1 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 font-black rounded-xl text-[10px] uppercase transition-all">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Password Reset Requests */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Manual Password Resets (NIN Verified)</h4>
                {pendingPasswords.length === 0 ? (
                  <div className="bg-slate-900/50 border border-dashed border-slate-800 p-8 rounded-3xl text-center text-slate-600 text-xs font-bold">No password reset requests.</div>
                ) : (
                  <div className="space-y-3">
                    {pendingPasswords.map((req) => (
                      <div key={req.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20"><KeyRound className="w-5 h-5" /></div>
                            <div>
                               <p className="text-xs font-black text-white">{req.userName} <span className="text-slate-500 font-normal">({req.userEmail})</span></p>
                               <p className="text-[10px] text-slate-400 font-bold">NIN: <span className="text-white font-mono">{req.nin}</span> • Reason: <span className="italic">"{req.reason}"</span></p>
                            </div>
                         </div>
                         <div className="flex gap-2 shrink-0">
                            <button onClick={() => processPasswordRequest(req.id, 'approved')} className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase flex items-center gap-1.5 shadow-lg"><CheckCircle2 className="w-3.5 h-3.5" /> Execute Reset</button>
                            <button onClick={() => processPasswordRequest(req.id, 'declined')} className="px-5 py-2.5 bg-slate-800 text-slate-400 font-bold rounded-xl text-[10px] uppercase">Decline</button>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
               <div className="bg-rose-500/10 border border-rose-500/30 rounded-[2.5rem] p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-rose-500/20 text-rose-500 rounded-2xl shadow-inner"><ShieldAlert className="w-7 h-7" /></div>
                     <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Forensic Threat Ledger</h2>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Unauthorized login attempts and detected evasion patterns</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-3">
                  {intrusionLogs.length === 0 ? (
                    <div className="p-20 text-center space-y-4 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
                       <ShieldCheck className="w-12 h-12 text-emerald-500/20 mx-auto" />
                       <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">No active threats detected in current session.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                       {intrusionLogs.map((log) => (
                          <div key={log.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors"></div>
                             
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-slate-950 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-500"><AlertOctagon className="w-5 h-5" /></div>
                                   <div>
                                      <p className="text-xs font-black text-white">Event: <span className="text-rose-400">Intrusion Detected</span></p>
                                      <p className="text-[10px] text-slate-500 font-mono">{log.timestamp}</p>
                                   </div>
                                </div>
                                <span className="font-mono text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">{log.id}</span>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[10px]">
                                <div className="space-y-1"><p className="text-slate-500 uppercase font-black">Target Email</p><p className="text-white font-bold">{log.attemptedEmail}</p></div>
                                <div className="space-y-1"><p className="text-slate-500 uppercase font-black">Media Indicator</p><p className={`font-black ${log.mediaCaptured ? 'text-emerald-400' : 'text-amber-400'}`}>{log.mediaStatus}</p></div>
                                <div className="space-y-1"><p className="text-slate-500 uppercase font-black">Device Node</p><p className="text-white font-mono truncate">{log.deviceInfo.userAgent}</p></div>
                                <div className="space-y-1"><p className="text-slate-500 uppercase font-black">Geo/TZ Context</p><p className="text-white font-bold">{log.deviceInfo.timezone}</p></div>
                             </div>

                             <div className="flex gap-2 pt-2">
                                <button className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 shadow-lg"><ShieldX className="w-3.5 h-3.5" /> Blacklist Node IP</button>
                                <button className="px-6 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-[10px] uppercase">Dismiss</button>
                             </div>
                          </div>
                       ))}
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* Disputes & Reports Tab */}
          {activeTab === 'disputes' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex flex-col lg:flex-row gap-6">
                   {/* Reported Ads */}
                   <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert className="w-4.5 h-4.5 text-amber-400" />
                            Flagged Ads ({pendingReports.length})
                         </h3>
                      </div>
                      
                      <div className="space-y-3">
                         {pendingReports.length === 0 ? (
                           <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-600 text-xs font-bold uppercase tracking-widest">No active reports in queue.</div>
                         ) : (
                           pendingReports.map(rep => (
                             <div key={rep.id} className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3 shadow-xl border-l-4 border-l-rose-500">
                                <div className="flex justify-between items-start">
                                   <p className="text-xs font-black text-white truncate max-w-[200px]">{rep.listingTitle}</p>
                                   <span className="text-[9px] font-mono text-slate-600">{rep.id}</span>
                                </div>
                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                   <p className="text-[10px] font-black text-rose-400 uppercase mb-1">Violation: {rep.reason}</p>
                                   <p className="text-[11px] text-slate-400 italic">"{rep.details || 'No additional details provided.'}"</p>
                                </div>
                                <div className="flex gap-2">
                                   <button onClick={() => processReport(rep.id, 'resolve_delete_ad')} className="flex-1 py-2 bg-rose-600 text-white font-black rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Purge Ad</button>
                                   <button onClick={() => processReport(rep.id, 'dismiss')} className="flex-1 py-2 bg-slate-800 text-slate-400 font-bold rounded-xl text-[10px] uppercase">Dismiss</button>
                                </div>
                             </div>
                           ))
                         )}
                      </div>
                   </div>

                   {/* Trade Disputes */}
                   <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                            <Gavel className="w-4.5 h-4.5 text-emerald-400" />
                            Open Disputes ({activeDisputes.length})
                         </h3>
                      </div>
                      
                      <div className="space-y-3">
                         {activeDisputes.length === 0 ? (
                           <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-600 text-xs font-bold uppercase tracking-widest">Marketplace is peaceful. No disputes.</div>
                         ) : (
                           activeDisputes.map(case_ => (
                             <div key={case_.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-mono text-emerald-400 font-black">{case_.id}</span>
                                   <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${case_.status === 'in_review' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>{case_.status}</span>
                                </div>
                                <div className="space-y-1">
                                   <p className="text-xs font-black text-white">{case_.itemTitle}</p>
                                   <p className="text-[10px] text-slate-400 uppercase font-bold">{case_.userEmail} vs {case_.counterparty}</p>
                                </div>
                                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed italic">
                                   "{case_.details}"
                                </div>
                                <div className="flex gap-2">
                                   <button onClick={() => processDisputeCase(case_.id, 'resolved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Resolve Case</button>
                                   <button onClick={() => processDisputeCase(case_.id, 'in_review')} className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-[10px] uppercase">Mark In-Review</button>
                                </div>
                             </div>
                           ))
                         )}
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* Fallback for other tabs */}
          {activeTab === 'superuser' && (
             <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                   
                   <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
                      <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
                         <Fingerprint className="w-6 h-6" />
                      </div>
                      <div>
                         <h2 className="text-xl font-black text-white uppercase tracking-tight">Superuser Profile Terminal</h2>
                         <p className="text-xs text-slate-500 uppercase font-black">Configure master identity and root authentication</p>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row items-start gap-8">
                      <div className="relative group shrink-0 self-center">
                         <div className="w-32 h-32 rounded-[2rem] bg-slate-950 border-4 border-slate-900 shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                            <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Root Avatar" />
                            <button 
                               onClick={() => fileInputRef.current?.click()}
                               className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer"
                            >
                               <Camera className="w-6 h-6 text-white mb-1" />
                               <span className="text-[9px] font-black text-white uppercase">Replace Photo</span>
                            </button>
                         </div>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                         <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 uppercase tracking-tighter shadow-xl">ROOT_NODE</div>
                      </div>

                      <form onSubmit={handleUpdateIdentity} className="flex-1 space-y-4 w-full">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><UserCheck className="w-3 h-3" /> Master Identity Name</label>
                            <input 
                               type="text" 
                               value={adminFullName} 
                               onChange={e => setAdminFullName(e.target.value)}
                               className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-emerald-500" 
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><LockIcon className="w-3 h-3" /> Admin Secure Email</label>
                            <input 
                               type="email" 
                               value={adminEmail} 
                               onChange={e => setAdminEmail(e.target.value)}
                               className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500" 
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Admin Terminal Phone</label>
                            <input 
                               type="tel" 
                               value={adminPhone} 
                               onChange={e => setAdminPhone(e.target.value)}
                               className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-emerald-500" 
                            />
                         </div>
                         <button type="submit" className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all border border-emerald-500/20 shadow-lg flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" /> Save Master Changes
                         </button>
                      </form>
                   </div>

                   <form onSubmit={handleUpdatePin} className="space-y-6 pt-8 border-t border-slate-800">
                      <div className="flex items-center gap-3">
                         <KeyRound className="w-5 h-5 text-emerald-400" />
                         <h3 className="font-black text-sm text-white uppercase tracking-widest">Global Security Protocol Key</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Active Key</label>
                            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm font-mono tracking-[0.5em] text-slate-600 italic">{adminPin.replace(/./g, '•')}</div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New 6-Digit Master PIN</label>
                            <input 
                               type="password" 
                               required 
                               maxLength={6}
                               value={newPin}
                               onChange={e => setNewPin(e.target.value)}
                               className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-mono tracking-[0.5em] text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder:text-slate-800"
                            />
                         </div>
                      </div>
                      <button type="submit" className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/10 hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 group">
                         <Shield className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                         Apply New Credentials
                      </button>
                   </form>
                </div>
             </div>
          )}

          {activeTab === 'finance' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Revenue</p>
                      <p className="text-3xl font-black text-emerald-400">₦2.4M</p>
                   </div>
                   <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Ad Promos</p>
                      <p className="text-3xl font-black text-white">42</p>
                   </div>
                   <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending Payouts</p>
                      <p className="text-3xl font-black text-amber-400">₦84k</p>
                   </div>
                </div>

                <div className="space-y-3">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pending Promotion Payments</h4>
                   {pendingPromoPay.length === 0 ? (
                      <div className="bg-slate-900 border border-slate-800 p-12 rounded-[2.5rem] text-center text-slate-600 font-bold uppercase tracking-widest text-xs">No pending payment verifications.</div>
                   ) : (
                      <div className="space-y-3">
                         {pendingPromoPay.map(req => (
                            <div key={req.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border-l-4 border-l-emerald-500">
                               <div className="flex items-center gap-4">
                                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20"><Wallet className="w-5 h-5" /></div>
                                  <div>
                                     <p className="text-xs font-black text-white">₦{req.amount.toLocaleString()} <span className="text-slate-500 font-normal">via {req.paymentMethod}</span></p>
                                     <p className="text-[10px] text-slate-400 font-bold">Plan: <span className="text-emerald-400">{req.planName}</span> ({req.durationMonths}mo) • <span className="text-slate-500">Ref: {req.id}</span></p>
                                  </div>
                               </div>
                               <div className="flex gap-2">
                                  <button onClick={() => processPromotionPaymentRequest(req.id, 'approved')} className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase flex items-center gap-1.5 shadow-lg"><CheckCircle2 className="w-3.5 h-3.5" /> Approve</button>
                                  <button onClick={() => processPromotionPaymentRequest(req.id, 'rejected')} className="px-5 py-2.5 bg-slate-800 text-slate-400 font-bold rounded-xl text-[10px] uppercase">Void</button>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'logs' && (
             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/30">
                    <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest"><History className="w-5 h-5 text-purple-400" /> Platform Audit Trail</h3>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{auditLogs.length} logged events</span>
                </div>
                <div className="max-h-[600px] overflow-y-auto no-scrollbar">
                   {auditLogs.map((log) => (
                      <div key={log.id} className="px-6 py-4 border-b border-slate-800 hover:bg-slate-800/20 transition-all group flex items-start gap-4">
                         <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${log.type === 'security' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : log.type === 'finance' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                            <Zap className="w-3.5 h-3.5" />
                         </div>
                         <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-baseline gap-2">
                               <p className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{log.action}</p>
                               <span className="text-[9px] font-mono text-slate-600">{log.createdAt}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug">{log.details}</p>
                         </div>
                      </div>
                   ))}
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

export default AdminDashboard;