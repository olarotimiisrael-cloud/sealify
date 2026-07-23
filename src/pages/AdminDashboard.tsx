import React, { useState } from 'react';
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
  BadgeCheck, Gavel, Fingerprint, MousePointer2, Smartphone, 
  Cpu, Send, SmartphoneNfc, ImageIcon, Globe,
  Lock as LockIcon
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, logout, categories, deleteCategory,
    listings, allUsers, updateUser,
    promotionPaymentRequests, processPromotionPaymentRequest, 
    verificationRequests, processVerificationRequest,
    passwordRequests, processPasswordRequest,
    auditLogs, analytics, exportDatabaseBackup, broadcastMassNotification,
    disputeCases, processDisputeCase, intrusionLogs
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'finance' | 'users' | 'listings' | 'branding' | 'broadcasts' | 'requests' | 'disputes' | 'security' | 'categories' | 'settings'>('analytics');
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  
  // Broadcast State
  const [bcTitle, setBcTitle] = useState('');
  const [bcMsg, setBcMsg] = useState('');
  const [bcTarget, setBcTarget] = useState<'all' | 'seller' | 'buyer'>('all');

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
            <button onClick={exportDatabaseBackup} className="px-3 py-2 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-xl border border-slate-700 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> BACKUP</button>
            <button onClick={logout} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/30"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'analytics', label: 'ANALYTICS', icon: Activity },
            { id: 'requests', label: 'QUEUE', icon: BadgeCheck, badge: pendingVerifications.length + pendingPasswords.length },
            { id: 'disputes', label: 'DISPUTES', icon: Gavel, badge: activeDisputes.length },
            { id: 'finance', label: 'FINANCE', icon: DollarSign, badge: pendingPromoPay.length },
            { id: 'broadcasts', label: 'BROADCAST', icon: Megaphone },
            { id: 'security', label: 'SECURITY', icon: Fingerprint, badge: intrusionLogs.length },
            { id: 'settings', label: 'CONFIG', icon: Terminal },
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

        {/* Tab Analytics */}
        {activeTab === 'analytics' && (
           <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {[ 
                  { label: 'Live Visitors', value: analytics.visitors, icon: Activity, color: 'text-emerald-400' }, 
                  { label: 'Active Ads', value: listings.length, icon: Package, color: 'text-blue-400' }, 
                  { label: 'Members', value: allUsers.length, icon: Users, color: 'text-amber-400' }, 
                  { label: 'Uptime', value: '100%', icon: Terminal, color: 'text-teal-400' } 
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
                    <div className={`flex items-center gap-1.5 \${stat.color}`}>
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
                                <p className="text-slate-200 leading-relaxed font-semibold">User: {req.userId}</p>
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
              </div>
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
                          {['all', 'seller', 'buyer'].map(t => (
                             <button key={t} type="button" onClick={() => setBcTarget(t as any)} className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all ${bcTarget === t ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
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