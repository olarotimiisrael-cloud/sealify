import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import AdminEditUserModal from '../components/AdminEditUserModal';
import { UserProfile, Listing } from '../types/sealify';
import { 
  Shield, Package, Activity, RefreshCw, Edit3, Trash2,
  Search, ShieldCheck, Check, X, Database, Plus, Sparkles, 
  AlertTriangle, LogOut, Megaphone, Bell, Download, 
  Terminal, DollarSign, Users, FileText, CheckCircle2,
  Lock, Palette, Layout, Globe, KeyRound, Image as ImageIcon,
  Clock, Eye, Filter, ArrowUpRight, ShieldAlert, BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, logout, categories, addCategory, 
    listings, allUsers, updateUser, t,
    promotionPaymentRequests, processPromotionPaymentRequest, 
    verificationRequests, processVerificationRequest,
    passwordRequests, processPasswordRequest,
    announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
    auditLogs, analytics, adminPin, updateAdminPin, siteSettings, updateSiteSettings, 
    exportDatabaseBackup, broadcastMassNotification, deleteListing, systemConfig, updateSystemConfig
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'finance' | 'users' | 'listings' | 'branding' | 'broadcasts' | 'requests' | 'settings'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  // Broadcast state
  const [bcTitle, setBcTitle] = useState('');
  const [bcMsg, setBcMsg] = useState('');
  const [bcType, setBcType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');

  // Branding state
  const [siteName, setSiteName] = useState(siteSettings.siteName);
  const [siteDesc, setSiteDesc] = useState(siteSettings.siteDescription);
  const [logoUrl, setLogoUrl] = useState(siteSettings.logoUrl);
  const [ogImage, setOgImage] = useState(siteSettings.ogImage);

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(listingSearch.toLowerCase()) || 
    l.id.toLowerCase().includes(listingSearch.toLowerCase())
  );

  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPasswords = passwordRequests.filter(r => r.status === 'pending');

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({ siteName, siteDescription: siteDesc, logoUrl, ogImage });
    toast.success('Global Branding updated!');
  };

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMsg.trim()) return;
    addAnnouncement({ title: bcTitle, message: bcMsg, type: bcType, active: true });
    setBcTitle(''); setBcMsg('');
    toast.success('Live Broadcast published to all users!');
  };

  if (!isAdmin) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <Shield className="w-16 h-16 text-rose-500 mb-4" />
      <h2 className="text-2xl font-black text-white">Access Denied</h2>
      <Link to="/" className="mt-6 px-6 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">Return Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 md:pb-8 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 flex-1 space-y-6">
        
        {/* Master Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-[2rem] gap-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Sealify Command Terminal</h1>
              <p className="text-[11px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                System Administrator Online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 flex-wrap w-full sm:w-auto">
            <button onClick={() => setIsPinModalOpen(true)} className="px-3 py-2 bg-slate-800 text-amber-400 text-[10px] font-black rounded-xl border border-slate-700 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" /> PIN ({adminPin})</button>
            <button onClick={exportDatabaseBackup} className="px-3 py-2 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-xl border border-slate-700 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> BACKUP</button>
            <button onClick={() => setIsSqlModalOpen(true)} className="p-2 bg-slate-800 text-teal-400 rounded-xl border border-slate-700" title="Schema Viewer"><Database className="w-4 h-4" /></button>
            <button onClick={logout} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/30"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'analytics', label: 'ANALYTICS', icon: Activity },
            { id: 'requests', label: 'SECURITY QUEUE', icon: ShieldAlert, badge: pendingVerifications.length + pendingPasswords.length },
            { id: 'finance', label: 'FINANCE', icon: DollarSign, badge: pendingPromoPay.length },
            { id: 'branding', label: 'BRANDING', icon: Palette },
            { id: 'users', label: 'MEMBERS', icon: Users },
            { id: 'listings', label: 'INVENTORY', icon: Package },
            { id: 'broadcasts', label: 'BROADCASTS', icon: Megaphone },
            { id: 'settings', label: 'SYSTEM', icon: Terminal },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black shrink-0 transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 && <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${activeTab === tab.id ? 'bg-slate-950 text-emerald-400' : 'bg-rose-600 text-white'}`}>{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* Tab Content: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {[ 
                 { label: 'Live Visitors', value: analytics.visitors, icon: Activity, color: 'text-emerald-400' }, 
                 { label: 'Active Ads', value: listings.length, icon: Package, color: 'text-blue-400' }, 
                 { label: 'Members', value: allUsers.length, icon: Users, color: 'text-amber-400' }, 
                 { label: 'Total Sales', value: listings.filter(l => l.status === 'sold').length, icon: CheckCircle2, color: 'text-teal-400' } 
               ].map((stat, i) => (
                 <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-xl">
                   <div className={`flex items-center gap-1.5 ${stat.color}`}>
                     <stat.icon className="w-3.5 h-3.5" />
                     <span className="text-[10px] font-black uppercase tracking-wider">{stat.label}</span>
                   </div>
                   <p className="text-3xl font-black text-white">{stat.value}</p>
                 </div>
               ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
               <h3 className="font-black text-white text-sm mb-4 uppercase tracking-widest flex items-center gap-2">
                 <Terminal className="w-4 h-4 text-emerald-500" />
                 <span>System Operations Audit Log</span>
               </h3>
               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                 {auditLogs.map(log => (
                   <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-[11px]">
                     <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${log.type === 'security' ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                        <p className="text-slate-200"><strong className="text-white">{log.action}:</strong> {log.details}</p>
                     </div>
                     <span className="text-slate-500 font-mono text-[10px]">{log.createdAt}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* Tab Content: Security Queue (Requests) */}
        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
             {/* Verification Badge Requests */}
             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                   <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-emerald-400" />
                      <span>ID Verification Badge Queue</span>
                   </h3>
                   <span className="text-[10px] font-black bg-slate-800 px-2 py-0.5 rounded-full">{pendingVerifications.length} PENDING</span>
                </div>

                <div className="space-y-3">
                   {pendingVerifications.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs italic">All verification documents processed.</div>
                   ) : (
                      pendingVerifications.map(req => (
                        <div key={req.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 font-black border border-slate-800">{req.userName.charAt(0)}</div>
                                 <div>
                                    <h4 className="font-bold text-xs text-white leading-tight">{req.userName}</h4>
                                    <p className="text-[10px] text-slate-500">{req.userEmail}</p>
                                 </div>
                              </div>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{req.type}</span>
                           </div>
                           <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                              <p className="text-[10px] text-slate-500 font-bold uppercase">{req.docType}: <span className="text-white font-mono">{req.docNumber}</span></p>
                              <a href={req.docUrl} target="_blank" className="text-[10px] text-blue-400 font-black hover:underline flex items-center gap-1">VIEW DOCUMENT <ArrowUpRight className="w-3 h-3" /></a>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={() => processVerificationRequest(req.id, 'rejected')} className="flex-1 py-2 bg-slate-800 text-rose-400 font-black rounded-xl text-[10px] uppercase border border-rose-500/20">Decline</button>
                              <button onClick={() => processVerificationRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg">Approve Badge</button>
                           </div>
                        </div>
                      ))
                   )}
                </div>
             </div>

             {/* Password Reset Requests */}
             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                   <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Password NIN Verification Queue</span>
                   </h3>
                   <span className="text-[10px] font-black bg-slate-800 px-2 py-0.5 rounded-full">{pendingPasswords.length} PENDING</span>
                </div>

                <div className="space-y-3">
                   {pendingPasswords.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs italic">All reset requests verified.</div>
                   ) : (
                      pendingPasswords.map(req => (
                        <div key={req.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-amber-400 font-black border border-slate-800">{req.userName.charAt(0)}</div>
                              <div>
                                 <h4 className="font-bold text-xs text-white leading-tight">{req.userName}</h4>
                                 <p className="text-[10px] text-slate-500">Reason: "{req.reason}"</p>
                              </div>
                           </div>
                           <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] space-y-1">
                              <p className="text-slate-500 font-bold uppercase">NIN ID: <span className="text-white font-mono">{req.nin}</span></p>
                              <p className="text-slate-500 font-bold uppercase">Target Password: <span className="text-emerald-400 font-mono">{req.newPassword}</span></p>
                              <a href={req.id_document_url} target="_blank" className="text-blue-400 font-black hover:underline inline-block pt-1">VIEW ID PROOF</a>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={() => processPasswordRequest(req.id, 'declined')} className="flex-1 py-2 bg-slate-800 text-slate-400 font-black rounded-xl text-[10px] uppercase border border-slate-700">Decline</button>
                              <button onClick={() => processPasswordRequest(req.id, 'approved')} className="flex-1 py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg">Verify NIN & Reset</button>
                           </div>
                        </div>
                      ))
                   )}
                </div>
             </div>
          </div>
        )}

        {/* Tab Content: Finance (Promotion Approvals) */}
        {activeTab === 'finance' && (
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-300">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                      <DollarSign className="w-6 h-6" />
                   </div>
                   <div>
                      <h2 className="text-xl font-black text-white">Promotion Payment Verification</h2>
                      <p className="text-xs text-slate-400">Review Opay/Transfer receipts for Top Ad boosts</p>
                   </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-center">
                   <p className="text-xl font-black text-emerald-400">₦{promotionPaymentRequests.filter(r => r.status === 'approved').reduce((acc, r) => acc + r.amount, 0).toLocaleString()}</p>
                   <p className="text-[9px] font-black uppercase text-slate-500">Realized Revenue</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPromoPay.length === 0 ? (
                   <div className="col-span-full py-16 text-center text-slate-500 text-xs italic bg-slate-950 border border-slate-800 border-dashed rounded-3xl">No pending financial verifications in the queue.</div>
                ) : (
                   pendingPromoPay.map(req => (
                      <div key={req.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 hover:border-amber-500/30 transition-all flex flex-col justify-between">
                         <div className="space-y-3">
                            <div className="flex justify-between items-start">
                               <div className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-tighter">{req.planName}</div>
                               <span className="text-[9px] font-mono text-slate-600">{req.id}</span>
                            </div>
                            <div>
                               <p className="text-lg font-black text-white">₦{req.amount.toLocaleString()}</p>
                               <p className="text-[10px] text-slate-500 font-bold">Via {req.paymentMethod.toUpperCase()} Dispatch</p>
                            </div>
                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] space-y-1">
                               <p className="text-slate-400">Listing ID: <span className="text-white font-mono">{req.listingId}</span></p>
                               <p className="text-slate-400">Merchant UID: <span className="text-white font-mono">{req.userId}</span></p>
                               <a href={req.paymentProofUrl} target="_blank" className="text-emerald-400 font-black hover:underline flex items-center gap-1 mt-1">VIEW RECEIPT PROOF <ArrowUpRight className="w-3 h-3" /></a>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => processPromotionPaymentRequest(req.id, 'rejected')} className="flex-1 py-2 bg-slate-800 text-rose-400 font-black rounded-xl text-[10px] uppercase border border-rose-500/20">Decline</button>
                            <button onClick={() => processPromotionPaymentRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg">Verify & Boost Ad</button>
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>
        )}

        {/* Tab Content: Broadcasts */}
        {activeTab === 'broadcasts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
             <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-xs tracking-widest">
                   <Megaphone className="w-4 h-4" />
                   <span>Global Broadcast Desk</span>
                </div>
                <form onSubmit={handleCreateBroadcast} className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Alert Title</label>
                      <input type="text" required value={bcTitle} onChange={e => setBcTitle(e.target.value)} placeholder="e.g. Maintenance Alert" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 outline-none" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Message Body</label>
                      <textarea rows={3} required value={bcMsg} onChange={e => setBcMsg(e.target.value)} placeholder="Type announcement here..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 outline-none" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Banner Style</label>
                      <select value={bcType} onChange={e => setBcType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none">
                         <option value="info">Info (Slate)</option>
                         <option value="alert">Alert (Rose Red)</option>
                         <option value="warning">Warning (Amber)</option>
                         <option value="success">Success (Emerald)</option>
                      </select>
                   </div>
                   <button type="submit" className="w-full py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs uppercase shadow-lg shadow-emerald-500/20">PUBLISH SITE-WIDE</button>
                </form>
             </div>

             <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="font-black text-white text-sm uppercase tracking-widest">Active & Past Announcements</h3>
                <div className="space-y-2">
                   {announcements.length === 0 ? (
                      <div className="py-20 text-center text-slate-600 text-xs italic">No broadcasts on record.</div>
                   ) : (
                      announcements.map(ann => (
                         <div key={ann.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${ann.type === 'alert' ? 'bg-rose-950/20 border-rose-500/20' : 'bg-slate-950 border-slate-800'}`}>
                            <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-lg ${ann.type === 'alert' ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-400'}`}><Bell className="w-4 h-4" /></div>
                               <div>
                                  <h4 className="font-bold text-xs text-white">{ann.title}</h4>
                                  <p className="text-[10px] text-slate-400 line-clamp-1">{ann.message}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={() => toggleAnnouncement(ann.id)} className={`px-2 py-1 rounded text-[9px] font-black uppercase ${ann.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>{ann.active ? 'ACTIVE' : 'HIDDEN'}</button>
                               <button onClick={() => deleteAnnouncement(ann.id)} className="p-2 text-slate-600 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                         </div>
                      ))
                   )}
                </div>
             </div>
          </div>
        )}

        {/* Tab Content: Branding (Logo & Meta) */}
        {activeTab === 'branding' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Identity & SEO Management</h2>
                <p className="text-xs text-slate-400">Control logo, site name, meta information, and global search engine visibility</p>
              </div>
            </div>

            <form onSubmit={handleSaveBranding} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl max-w-4xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public Site Name</span>
                  </label>
                  <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layout className="w-3.5 h-3.5" />
                    <span>Global Logo URL</span>
                  </label>
                  <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Meta SEO Description</span>
                </label>
                <textarea rows={3} value={siteDesc} onChange={e => setSiteDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Social Metadata Image (OpenGraph)</span>
                </label>
                <input type="text" value={ogImage} onChange={e => setOgImage(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
              <button type="submit" className="px-10 py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl">SAVE GLOBAL IDENTITY</button>
            </form>
          </div>
        )}

        {/* Tab Content: Users */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h3 className="font-extrabold text-base text-white">Database Members Directory ({allUsers.length})</h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input type="text" placeholder="Search email, name or ID..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-emerald-500 outline-none" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 font-black uppercase text-slate-500">
                  <tr><th className="p-3">User Profile</th><th className="p-3">Role</th><th className="p-3">Verified</th><th className="p-3">Status</th><th className="p-3">Manage</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img src={u.avatarUrl} className="w-8 h-8 rounded-lg object-cover border border-slate-700" alt="" />
                          <div><p className="font-bold text-white leading-tight">{u.fullName}</p><p className="text-[10px] text-slate-500">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="p-3 capitalize text-slate-400 font-bold">{u.role}</td>
                      <td className="p-3">{u.verified ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-slate-700" />}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${u.status === 'restricted' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{u.status || 'active'}</span></td>
                      <td className="p-3"><button onClick={() => setEditingUser(u)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Listings (Global Inventory) */}
        {activeTab === 'listings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h3 className="font-extrabold text-base text-white">Global Classified Ads Moderator ({listings.length})</h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input type="text" placeholder="Search listing title or ID..." value={listingSearch} onChange={e => setListingSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-emerald-500 outline-none" />
              </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 font-black uppercase text-slate-500">
                     <tr><th className="p-3">Ad Title</th><th className="p-3">Seller</th><th className="p-3">Price</th><th className="p-3">Type</th><th className="p-3">Moderate</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                     {filteredListings.map(l => (
                        <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                           <td className="p-3">
                              <div className="flex items-center gap-2">
                                 <img src={l.images[0]} className="w-8 h-8 rounded-lg object-cover border border-slate-700" alt="" />
                                 <p className="font-bold text-white leading-tight truncate max-w-[200px]">{l.title}</p>
                              </div>
                           </td>
                           <td className="p-3 text-slate-400">{l.sellerName}</td>
                           <td className="p-3 font-black text-emerald-400">₦{l.price.toLocaleString()}</td>
                           <td className="p-3">
                              {l.featured ? <span className="bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/20">TOP AD</span> : <span className="text-slate-600 uppercase text-[9px] font-bold">REGULAR</span>}
                           </td>
                           <td className="p-3">
                              <button onClick={() => { if(window.confirm('Delete this ad?')) deleteListing(l.id); }} className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* Tab Content: Config (System Settings) */}
        {activeTab === 'settings' && (
           <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">System Engine Configuration</h2>
                  <p className="text-xs text-slate-400">Manage site status, security filters, and administrative rules</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                    { id: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Disables marketplace access for non-admins', icon: AlertTriangle, color: 'text-rose-400' },
                    { id: 'autoApproveAds', label: 'Auto-Approve Classifieds', desc: 'Post ads instantly without admin moderation', icon: CheckCircle2, color: 'text-emerald-400' },
                    { id: 'requireIdForPosting', label: 'Enforce ID for Selling', desc: 'Sellers must have verified badge to list items', icon: Lock, color: 'text-amber-400' },
                    { id: 'aiSpamFilter', label: 'AI Spam Firewall', desc: 'Auto-scan descriptions for scam links/spam', icon: ShieldCheck, color: 'text-teal-400' }
                 ].map(config => (
                    <div key={config.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl flex items-center justify-between gap-4">
                       <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 ${config.color}`}><config.icon className="w-4 h-4" /></div>
                          <div>
                             <h4 className="font-bold text-xs text-white">{config.label}</h4>
                             <p className="text-[10px] text-slate-500 leading-tight">{config.desc}</p>
                          </div>
                       </div>
                       <button 
                          onClick={() => updateSystemConfig({ [config.id]: !((systemConfig as any)[config.id]) })}
                          className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-1 ${ (systemConfig as any)[config.id] ? 'bg-emerald-500' : 'bg-slate-800' }`}
                       >
                          <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${ (systemConfig as any)[config.id] ? 'translate-x-6' : 'translate-x-0' }`}></div>
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </main>

      {/* Admin PIN Update Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4">
             <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-xs tracking-widest"><Lock className="w-4 h-4" /><span>Update Security Access PIN</span></div>
             <form onSubmit={(e) => { e.preventDefault(); updateAdminPin(newPinInput); setIsPinModalOpen(false); setNewPinInput(''); }} className="space-y-4">
                <input type="password" maxLength={6} placeholder="Enter New 6-Digit PIN" value={newPinInput} onChange={e => setNewPinInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono tracking-widest text-center outline-none focus:border-emerald-500" />
                <div className="flex gap-2">
                   <button type="button" onClick={() => setIsPinModalOpen(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold">Cancel</button>
                   <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-black">Commit Change</button>
                </div>
             </form>
          </div>
        </div>
      )}

      <AdminEditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(id, updated) => updateUser(id, updated)} />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;