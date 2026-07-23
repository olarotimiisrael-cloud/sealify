import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import AdminEditUserModal from '../components/AdminEditUserModal';
import { UserProfile, Category } from '../types/sealify';
import { 
  Shield, Package, Activity, RefreshCw, Edit3, Trash2,
  Database, Megaphone, LogOut, Download, 
  Terminal, DollarSign, Users, ArrowUpRight, 
  BadgeCheck, Gavel, Fingerprint, MousePointer2, Smartphone, 
  Cpu, Send, SmartphoneNfc, ImageIcon, Globe,
  Lock as LockIcon, Settings as SettingsIcon, Layout, Plus, Search,
  Eye, ShieldAlert, AlertOctagon, CheckCircle2, History, Zap
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, logout, categories, addCategory, deleteCategory, updateCategory,
    listings, allUsers, updateUser, deleteUser, updateListing, deleteListing,
    promotionPaymentRequests, processPromotionPaymentRequest, 
    verificationRequests, processVerificationRequest,
    passwordRequests, processPasswordRequest,
    auditLogs, analytics, exportDatabaseBackup, broadcastMassNotification,
    disputeCases, processDisputeCase, intrusionLogs,
    systemConfig, updateSystemConfig, siteSettings, updateSiteSettings
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'finance' | 'users' | 'listings' | 'branding' | 'broadcasts' | 'requests' | 'disputes' | 'security' | 'categories' | 'logs' | 'settings'>('analytics');
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  
  // Broadcast State
  const [bcTitle, setBcTitle] = useState('');
  const [bcMsg, setBcMsg] = useState('');
  const [bcTarget, setBcTarget] = useState<'all' | 'seller' | 'buyer'>('all');

  // Category Add State
  const [newCatName, setNewCatName] = useState('');

  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPasswords = passwordRequests.filter(r => r.status === 'pending');
  const activeDisputes = disputeCases.filter(c => c.status !== 'resolved');
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMsg.trim()) return;
    broadcastMassNotification(bcTitle, bcMsg, bcTarget);
    setBcTitle(''); setBcMsg('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName, iconName: 'LayoutGrid', count: 0, color: 'bg-slate-500' });
    setNewCatName('');
    toast.success(`Category "${newCatName}" added to marketplace.`);
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
        
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-[2rem] gap-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Command Center</h1>
              <p className="text-[11px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Root Protocol Active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <button onClick={exportDatabaseBackup} className="px-3 py-2 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-xl border border-slate-700 flex items-center gap-1.5 hover:bg-slate-700 transition-all"><Download className="w-3.5 h-3.5" /> BACKUP</button>
            <button onClick={logout} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/30 hover:bg-rose-500/20 transition-all"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Navigation Bar - Full Width Scroll */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar shadow-inner">
          {[
            { id: 'analytics', label: 'ANALYTICS', icon: Activity },
            { id: 'users', label: 'USERS', icon: Users },
            { id: 'listings', label: 'ADS', icon: Package },
            { id: 'requests', label: 'QUEUE', icon: BadgeCheck, badge: pendingVerifications.length + pendingPasswords.length },
            { id: 'disputes', label: 'DISPUTES', icon: Gavel, badge: activeDisputes.length },
            { id: 'finance', label: 'FINANCE', icon: DollarSign, badge: pendingPromoPay.length },
            { id: 'categories', label: 'CATEGORIES', icon: Layout },
            { id: 'branding', label: 'BRANDING', icon: ImageIcon },
            { id: 'broadcasts', label: 'BROADCAST', icon: Megaphone },
            { id: 'security', label: 'SECURITY', icon: Fingerprint, badge: intrusionLogs.length },
            { id: 'logs', label: 'AUDIT', icon: History },
            { id: 'settings', label: 'CONFIG', icon: SettingsIcon },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black shrink-0 transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 && <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${activeTab === tab.id ? 'bg-slate-950 text-emerald-400' : 'bg-rose-600 text-white'}`}>{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* Tab Analytics */}
        {activeTab === 'analytics' && (
           <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[ 
                  { label: 'Live Visitors', value: analytics.visitors, icon: Activity, color: 'text-emerald-400' }, 
                  { label: 'Active Ads', value: listings.length, icon: Package, color: 'text-blue-400' }, 
                  { label: 'Members', value: allUsers.length, icon: Users, color: 'text-amber-400' }, 
                  { label: 'Uptime', value: '100%', icon: Terminal, color: 'text-teal-400' } 
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
                    <div className={`flex items-center gap-1.5 ${stat.color}`}>
                      <stat.icon className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                 <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl space-y-4">
                    <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> Traffic Velocity & Ingress</h3>
                    <div className="h-48 flex items-end gap-1.5 pt-4">
                       {analytics.sessionsPerMinute.map((val, idx) => (
                          <div 
                            key={idx} 
                            className="flex-1 bg-gradient-to-t from-blue-600/40 to-blue-500/10 border-t border-blue-500/50 rounded-t-lg relative group transition-all hover:from-emerald-500/40 hover:to-emerald-400/10" 
                            style={{ height: `${val * 2}%` }}
                          >
                             <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-950 text-[8px] font-black text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{val} sessions</div>
                          </div>
                       ))}
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">
                       <span>Real-time (Last 10 mins)</span>
                       <span>Current Edge Node: Ogbomoso Main</span>
                    </div>
                 </div>

                 <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl space-y-5">
                    <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2"><Fingerprint className="w-4 h-4 text-emerald-400" /> Platform Vitals</h3>
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-400">Memory Cluster</span><span className="text-emerald-400">42%</span></div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800"><div className="bg-emerald-500 h-full w-[42%]"></div></div>
                       </div>
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-400">DB Persistence</span><span className="text-blue-400">OPTIMAL</span></div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800"><div className="bg-blue-500 h-full w-[100%] animate-pulse"></div></div>
                       </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800">
                       <button onClick={() => setIsSqlModalOpen(true)} className="w-full py-3 bg-slate-950 border border-slate-800 text-slate-300 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors uppercase"><Database className="w-4 h-4 text-emerald-400" /> Inspect Core Schema</button>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* Tab Users */}
        {activeTab === 'users' && (
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                 <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> Directory Management ({allUsers.length})</h3>
                 <div className="relative w-full sm:w-64">
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

              <div className="overflow-x-auto no-scrollbar">
                 <table className="w-full text-xs text-left">
                    <thead>
                       <tr className="text-slate-500 font-black uppercase tracking-widest border-b border-slate-800">
                          <th className="px-4 py-3">Member</th>
                          <th className="px-4 py-3">Role / Badge</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                       {allUsers.filter(u => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                          <tr key={u.id} className="hover:bg-slate-950/50 transition-colors">
                             <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                   <img src={u.avatarUrl} className="w-9 h-9 rounded-xl object-cover border border-slate-800" />
                                   <div><p className="font-bold text-white">{u.fullName}</p><p className="text-[10px] text-slate-500">{u.email}</p></div>
                                </div>
                             </td>
                             <td className="px-4 py-4">
                                <div className="space-y-1">
                                   <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">{u.role}</span>
                                   <p className="text-[9px] text-slate-500 font-bold uppercase">{u.verificationType || 'None'}</p>
                                </div>
                             </td>
                             <td className="px-4 py-4">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${u.status === 'active' || !u.status ? 'text-emerald-400' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'}`}>{u.status || 'active'}</span>
                             </td>
                             <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <button onClick={() => setEditingUser(u)} className="p-2 bg-slate-800 text-blue-400 rounded-lg border border-slate-700 hover:bg-slate-700 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                                   <button onClick={() => deleteUser(u.id)} className="p-2 bg-slate-800 text-rose-500 rounded-lg border border-slate-700 hover:bg-rose-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {/* Tab Ads Management */}
        {activeTab === 'listings' && (
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                 <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2"><Package className="w-4 h-4 text-emerald-400" /> Global Inventory Control</h3>
                 <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="Search ads by title..." 
                      value={listingSearch}
                      onChange={e => setListingSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" 
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {listings.filter(l => l.title.toLowerCase().includes(listingSearch.toLowerCase())).map(l => (
                    <div key={l.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 group">
                       <div className="flex items-center gap-4 min-w-0">
                          <img src={l.images[0]} className="w-14 h-14 rounded-xl object-cover border border-slate-800" />
                          <div className="min-w-0">
                             <h4 className="font-bold text-white text-xs truncate">{l.title}</h4>
                             <p className="text-[10px] text-emerald-400 font-black mt-0.5">₦{l.price.toLocaleString()}</p>
                             <p className="text-[9px] text-slate-500 truncate">Seller: {l.sellerName} • {l.location}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => updateListing(l.id, { featured: !l.featured })} className={`p-2 rounded-lg border transition-all ${l.featured ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'}`}><Zap className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteListing(l.id)} className="p-2 bg-slate-900 text-rose-500 rounded-lg border border-slate-800 hover:bg-rose-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Tab Requests */}
        {activeTab === 'requests' && (
           <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* ID Verifications */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 flex items-center justify-between"><span>Badge Requests</span> <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">{pendingVerifications.length}</span></h3>
                    {pendingVerifications.map(req => (
                       <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20"><Users className="w-5 h-5" /></div>
                                <div><h4 className="font-black text-white text-sm">{req.userName}</h4><p className="text-[10px] text-slate-500 uppercase font-bold">{req.type} Badge Request</p></div>
                             </div>
                             <span className="text-[9px] font-mono text-slate-600 uppercase">{req.id}</span>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => processVerificationRequest(req.id, 'rejected')} className="flex-1 py-2.5 bg-slate-800 text-rose-500 font-black rounded-xl text-[10px] uppercase">Reject</button>
                             <button onClick={() => processVerificationRequest(req.id, 'approved')} className="flex-1 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg">Issue Badge</button>
                          </div>
                       </div>
                    ))}
                    {pendingVerifications.length === 0 && <p className="text-center py-10 text-xs text-slate-600 italic">No pending badge verifications.</p>}
                 </div>

                 {/* Password Resets */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 flex items-center justify-between"><span>Password Reset Queue</span> <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">{pendingPasswords.length}</span></h3>
                    {pendingPasswords.map(req => (
                       <div key={req.id} className="bg-slate-900 border border-rose-500/20 rounded-3xl p-5 space-y-4 shadow-xl">
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/20"><LockIcon className="w-5 h-5" /></div>
                                <div><h4 className="font-black text-white text-sm">{req.userName}</h4><p className="text-[10px] text-slate-500 uppercase font-bold">NIN-Verified Pass Reset</p></div>
                             </div>
                             <span className="text-[9px] font-mono text-slate-600 uppercase">{req.id}</span>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => processPasswordRequest(req.id, 'declined')} className="flex-1 py-2.5 bg-slate-800 text-rose-500 font-black rounded-xl text-[10px] uppercase">Decline</button>
                             <button onClick={() => processPasswordRequest(req.id, 'approved')} className="flex-1 py-2.5 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase shadow-lg shadow-blue-900/40">Apply New Password</button>
                          </div>
                       </div>
                    ))}
                    {pendingPasswords.length === 0 && <p className="text-center py-10 text-xs text-slate-600 italic">No pending password resets.</p>}
                 </div>
              </div>
           </div>
        )}

        {/* Tab Finance */}
        {activeTab === 'finance' && (
           <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 gap-4">
                 {pendingPromoPay.map(req => (
                    <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col lg:flex-row gap-6 shadow-xl group">
                       <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                             <div>
                                <h3 className="font-black text-white text-lg">₦{req.amount.toLocaleString()} — {req.planName}</h3>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Method: {req.paymentMethod} • Request ID: {req.id}</p>
                             </div>
                             <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400'}`}>{req.status}</span>
                       </div>
                          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex gap-4">
                             <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 shrink-0"><SmartphoneNfc className="w-5 h-5" /></div>
                             <div className="text-xs">
                                <p className="text-slate-200 leading-relaxed font-semibold">User ID: {req.userId}</p>
                                <p className="text-slate-400">Target Listing ID: <strong className="text-emerald-400">{req.listingId}</strong></p>
                             </div>
                          </div>
                       </div>

                       <div className="lg:w-72 space-y-3">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center lg:text-left mb-2">Verification Action</p>
                          {req.paymentProofUrl && (
                             <a href={req.paymentProofUrl} target="_blank" className="w-full py-2.5 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors uppercase"><ImageIcon className="w-3.5 h-3.5" /> View Receipt Image</a>
                          )}
                          <div className="flex gap-2">
                             <button onClick={() => processPromotionPaymentRequest(req.id, 'rejected')} className="flex-1 py-3 bg-slate-800 text-rose-500 font-black rounded-xl text-[10px] uppercase border border-rose-500/20">Decline</button>
                             <button onClick={() => processPromotionPaymentRequest(req.id, 'approved')} className="flex-1 py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg shadow-emerald-500/20">Verify & Boost Ad</button>
                          </div>
                       </div>
                    </div>
                 ))}
                 {pendingPromoPay.length === 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-20 text-center space-y-4">
                       <DollarSign className="w-12 h-12 text-slate-700 mx-auto" />
                       <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No pending promotion payments in ledger.</p>
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* Tab Categories */}
        {activeTab === 'categories' && (
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                 <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2"><Layout className="w-4 h-4 text-emerald-400" /> Marketplace Categories</h3>
                 <form onSubmit={handleAddCategory} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Category name..." 
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" 
                    />
                    <button type="submit" className="p-2 bg-emerald-500 text-slate-950 rounded-xl shadow-lg hover:bg-emerald-400 transition-all"><Plus className="w-4 h-4" /></button>
                 </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 {categories.map(cat => (
                    <div key={cat.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl text-white ${cat.color}`}><Package className="w-4 h-4" /></div>
                          <div>
                             <h4 className="font-bold text-white text-xs">{cat.name}</h4>
                             <p className="text-[10px] text-slate-500 uppercase font-black">{cat.count || 0} ADS LISTED</p>
                          </div>
                       </div>
                       <button onClick={() => deleteCategory(cat.id)} className="p-2 bg-slate-900 text-slate-500 hover:text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Tab Branding */}
        {activeTab === 'branding' && (
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
              <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-4"><ImageIcon className="w-4 h-4 text-emerald-400" /> Platform Appearance & SEO</h3>
              
              <div className="grid grid-cols-1 gap-4 text-xs">
                 <div className="space-y-1">
                    <label className="font-black text-slate-500 uppercase tracking-widest ml-1">Marketplace Name</label>
                    <input 
                      type="text" 
                      value={siteSettings.siteName}
                      onChange={e => updateSiteSettings({ siteName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="font-black text-slate-500 uppercase tracking-widest ml-1">SEO Description</label>
                    <textarea 
                      rows={3}
                      value={siteSettings.siteDescription}
                      onChange={e => updateSiteSettings({ siteDescription: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="font-black text-slate-500 uppercase tracking-widest ml-1">Primary Support Email</label>
                       <input 
                         type="email" 
                         value={siteSettings.contactEmail}
                         onChange={e => updateSiteSettings({ contactEmail: e.target.value })}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="font-black text-slate-500 uppercase tracking-widest ml-1">Support Phone</label>
                       <input 
                         type="text" 
                         value={siteSettings.contactPhone}
                         onChange={e => updateSiteSettings({ contactPhone: e.target.value })}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                       />
                    </div>
                 </div>
              </div>
              <p className="text-[10px] text-slate-500 italic">Site settings update instantly across all client sessions.</p>
           </div>
        )}

        {/* Tab Broadcast */}
        {activeTab === 'broadcasts' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                 <form onSubmit={handleSendBroadcast} className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notification Segment</label>
                       <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                          {(['all', 'seller', 'buyer'] as const).map(t => (
                             <button key={t} type="button" onClick={() => setBcTarget(t)} className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all ${bcTarget === t ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Broadcast Subject</label>
                       <input type="text" value={bcTitle} onChange={e => setBcTitle(e.target.value)} placeholder="e.g. New Safety Protocol Active" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Broadcast Message Payload</label>
                       <textarea rows={4} value={bcMsg} onChange={e => setBcMsg(e.target.value)} placeholder="Enter instructions or announcements..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-emerald-500" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all">DISPATCH BROADCAST <Send className="w-4 h-4" /></button>
                 </form>
              </div>

              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-4">
                 <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2"><History className="w-4 h-4 text-emerald-400" /> Recent Broadcast Logs</h3>
                 <div className="space-y-3">
                    {auditLogs.filter(l => l.type === 'broadcast').slice(0, 5).map(l => (
                       <div key={l.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                          <p className="text-xs font-bold text-white leading-tight">{l.details}</p>
                          <p className="text-[9px] text-slate-500 mt-1 font-mono uppercase">{l.createdAt}</p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {/* Tab Security / Intrusions */}
        {activeTab === 'security' && (
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl space-y-6 animate-in fade-in duration-300">
              <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2"><Fingerprint className="w-4 h-4 text-rose-500" /> Forensic Intrusion Logs</h3>
              <div className="grid grid-cols-1 gap-3">
                 {intrusionLogs.length === 0 ? (
                    <div className="py-20 text-center italic text-slate-600 text-sm">No security violations recorded in current cluster.</div>
                 ) : (
                    intrusionLogs.map(log => (
                       <div key={log.id} className="p-5 bg-slate-950 border border-rose-500/20 rounded-3xl flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-3">
                             <div className="flex items-center gap-2">
                                <span className="p-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20"><ShieldAlert className="w-5 h-5" /></span>
                                <div><h4 className="font-black text-white text-sm">Target Account: {log.attemptedEmail}</h4><p className="text-[10px] text-slate-500 font-mono">{log.id} • {log.timestamp}</p></div>
                             </div>
                             <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-400 font-mono">
                                <div><p className="text-slate-500 uppercase font-black">PLATFORM</p><p>{log.deviceInfo.platform}</p></div>
                                <div><p className="text-slate-500 uppercase font-black">MEDIA STATUS</p><p className={log.mediaCaptured ? 'text-emerald-400' : 'text-rose-400'}>{log.mediaStatus}</p></div>
                             </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                             <button className="px-4 py-2 bg-slate-900 text-slate-400 rounded-xl text-[10px] font-black uppercase hover:text-white border border-slate-800">Dismiss</button>
                             <button className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-rose-900/40">Report to NPF</button>
                          </div>
                       </div>
                    )
                 ))}
              </div>
           </div>
        )}

        {/* Tab Audit Logs */}
        {activeTab === 'logs' && (
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                 <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2"><History className="w-4 h-4 text-blue-400" /> Platform Audit Trail</h3>
                 <span className="text-[10px] font-black text-slate-500 uppercase">{auditLogs.length} events logged</span>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
                 {auditLogs.map(log => (
                    <div key={log.id} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4 hover:border-emerald-500/30 transition-colors">
                       <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${log.type === 'security' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : log.type === 'finance' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                          <div className="text-[11px]"><span className="font-black text-white uppercase mr-2">{log.action}:</span><span className="text-slate-400">{log.details}</span></div>
                       </div>
                       <span className="text-[9px] font-mono text-slate-600 uppercase shrink-0">{log.createdAt}</span>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Tab Config / Settings */}
        {activeTab === 'settings' && (
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
              <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-4"><Cpu className="w-4 h-4 text-purple-400" /> Core Engine Configuration</h3>
              <div className="space-y-4">
                 {[
                    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Lock frontend and show maintenance page to all users' },
                    { key: 'autoApproveAds', label: 'Auto-Approve Classifieds', desc: 'Skip manual review and publish ads instantly' },
                    { key: 'requireIdForPosting', label: 'Verified Posting Only', desc: 'Only users with badge can list items for sale' },
                    { key: 'aiSpamFilter', label: 'Neural Spam Guard', desc: 'Auto-flag suspicious ad content via AI scan' }
                 ].map(item => (
                    <div key={item.key} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                       <div className="min-w-0">
                          <h4 className="font-bold text-white text-xs">{item.label}</h4>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                       </div>
                       <button 
                         onClick={() => updateSystemConfig({ [item.key]: !systemConfig[item.key as keyof typeof systemConfig] })}
                         className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 ${systemConfig[item.key as keyof typeof systemConfig] ? 'bg-emerald-500' : 'bg-slate-800'}`}
                       >
                          <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${systemConfig[item.key as keyof typeof systemConfig] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                       </button>
                    </div>
                 ))}
              </div>
              <div className="pt-4 flex justify-center">
                 <button onClick={() => setIsSqlModalOpen(true)} className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-emerald-400 uppercase tracking-widest"><Database className="w-3.5 h-3.5" /> Launch SQL Database Terminal</button>
              </div>
           </div>
        )}

      </main>

      <AdminEditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(id, updated) => updateUser(id, updated)} />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;