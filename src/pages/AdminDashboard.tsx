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
  Clock, Server, DollarSign, Image
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, user, logout, categories, addCategory, deleteCategory, updateCategory, 
    listings, allUsers, updateUser, deleteUser, updateListing, deleteListing, t,
    passwordRequests, processPasswordRequest, verificationRequests, processVerificationRequest,
    promotionPaymentRequests, processPromotionPaymentRequest, announcements, addAnnouncement, 
    toggleAnnouncement, deleteAnnouncement, reports, processReport, auditLogs, analytics
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'finance' | 'users' | 'categories' | 'listings' | 'broadcasts' | 'moderation' | 'audit'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');
  const [newCatColor, setNewCatColor] = useState('bg-emerald-500');

  const filteredUsers = allUsers.filter(u => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');
  const expiredAds = listings.filter(l => l.featured && l.promotionEndDate && new Date(l.promotionEndDate) < new Date());

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName.trim(), iconName: newCatIcon, count: 0, color: newCatColor });
    setNewCatName('');
    toast.success('Category added to marketplace UI!');
  };

  const formatNGN = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

  if (!isAdmin) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center"><Shield className="w-16 h-16 text-rose-500 mb-4" /><h2 className="text-2xl font-black text-white">Access Denied</h2><Link to="/" className="mt-6 px-6 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs">Return to Home</Link></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl gap-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30"><Shield className="w-8 h-8" /></div>
            <div>
              <h1 className="text-2xl font-black">Sealify Sovereign Terminal</h1>
              <p className="text-xs text-slate-400">Total System Control • Encrypted Administrative Access</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <button onClick={() => setIsSqlModalOpen(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 text-[10px] font-black rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"><Database className="w-4 h-4" /><span>DATABASE</span></button>
            <button onClick={logout} className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/30"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400'}`}>ANALYTICS</button>
          <button onClick={() => setActiveTab('finance')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all relative ${activeTab === 'finance' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400'}`}>FINANCE {pendingPromoPay.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{pendingPromoPay.length}</span>}</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'users' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400'}`}>USERS</button>
          <button onClick={() => setActiveTab('categories')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'categories' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400'}`}>CATEGORIES</button>
          <button onClick={() => setActiveTab('listings')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all relative ${activeTab === 'listings' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400'}`}>INVENTORY {expiredAds.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1 animate-pulse"></span>}</button>
          <button onClick={() => setActiveTab('moderation')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all relative ${activeTab === 'moderation' ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/20' : 'text-slate-400'}`}>MODERATION {pendingReports.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{pendingReports.length}</span>}</button>
          <button onClick={() => setActiveTab('audit')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'audit' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400'}`}>AUDIT LOGS</button>
        </div>

        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><DollarSign className="w-6 h-6" /></div>
              <div><h2 className="text-xl font-black">Promotion Payment Verifications</h2><p className="text-xs text-slate-400">Review receipts for Paga transfers and activate Top Ad boosts.</p></div>
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
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 font-black uppercase text-slate-500"><tr className="px-6 py-4"><th>Classified Ad</th><th>Status</th><th>Performance</th><th>Action</th></tr></thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {listings.map(ad => (
                      <tr key={ad.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={ad.images[0]} className="w-10 h-8 rounded-lg object-cover" /><div><p className="font-bold text-white">{ad.title}</p><p className="text-[10px] text-slate-500">{ad.category} • {ad.id}</p></div></div></td>
                        <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-[6px] font-black uppercase text-[8px] ${ad.featured ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{ad.featured ? 'Promoted' : 'Basic'}</span></td>
                        <td className="px-6 py-4 font-bold text-slate-300">{ad.viewsCount} Views</td>
                        <td className="px-6 py-4"><button onClick={() => deleteListing(ad.id)} className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <form onSubmit={handleAddCategory} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row items-end gap-4 shadow-xl">
              <div className="flex-1 space-y-1.5 w-full"><label className="text-xs font-black text-slate-400 uppercase">New Category Name</label><input type="text" required value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Solar & Inverters" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:border-emerald-500" /></div>
              <div className="space-y-1.5"><label className="text-xs font-black text-slate-400 uppercase">Accent</label><select value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs"><option value="bg-emerald-500">Green</option><option value="bg-blue-500">Blue</option><option value="bg-purple-500">Purple</option><option value="bg-amber-500">Amber</option></select></div>
              <button type="submit" className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2"><Plus className="w-4 h-4" /><span>CREATE</span></button>
            </form>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
               {categories.map(cat => (
                 <div key={cat.id} className="bg-slate-900 p-4 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 group">
                   <div className="flex items-center gap-2 min-w-0"><div className={`w-8 h-8 rounded-lg ${cat.color} text-white flex items-center justify-center`}><Layers className="w-4 h-4" /></div><span className="font-bold text-xs truncate">{cat.name}</span></div>
                   <button onClick={() => deleteCategory(cat.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-500"><X className="w-4 h-4" /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[ { label: 'Visitors', value: analytics.visitors, icon: Activity, color: 'text-emerald-400' }, { label: 'Active Ads', value: listings.length, icon: Package, color: 'text-blue-400' }, { label: 'Revenue', value: '₦142k', icon: DollarSign, color: 'text-amber-400' }, { label: 'Uptime', value: '99.9%', icon: Server, color: 'text-purple-400' } ].map((stat, i) => (
                   <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] space-y-2">
                     <div className={`flex items-center gap-2 ${stat.color}`}><stat.icon className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span></div>
                     <p className="text-3xl font-black text-white">{stat.value}</p>
                   </div>
                 ))}
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] h-80 shadow-2xl relative overflow-hidden">
                 <div className="flex items-center gap-2 mb-6"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div><h3 className="text-xs font-black uppercase text-slate-500">Live Traffic Pulse</h3></div>
                 <ResponsiveContainer width="100%" height="80%">
                   <AreaChart data={analytics.sessionsPerMinute.map((v, i) => ({ t: i, v }))}><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} /><Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={4} fillOpacity={0.1} fill="#10b981" /></AreaChart>
                 </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-4">
               <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Terminal className="w-4 h-4" />Security Status</h3>
                  <div className="space-y-3">
                     {[ { label: 'Database Integrity', status: 'Online', color: 'text-emerald-400' }, { label: 'Identity Lock (2FA)', status: 'Active', color: 'text-blue-400' }, { label: 'Ad Spam Filter', status: 'Scanning', color: 'text-amber-400' } ].map((item, i) => (
                       <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between"><span className="text-[11px] font-bold text-slate-400">{item.label}</span><span className={`text-[10px] font-black uppercase ${item.color}`}>{item.status}</span></div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;