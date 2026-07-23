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
  Sliders, Lock, Unlock, ToggleLeft, ToggleRight, Send, Scale, Layout, Palette
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
    adminPin, updateAdminPin, intrusionLogs, systemConfig, updateSystemConfig, siteSettings, updateSiteSettings, exportDatabaseBackup,
    broadcastMassNotification, disputeCases, processDisputeCase
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'finance' | 'users' | 'categories' | 'listings' | 'broadcasts' | 'disputes' | 'moderation' | 'settings' | 'audit' | 'intrusions' | 'branding'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  // Branding state
  const [siteName, setSiteName] = useState(siteSettings.siteName);
  const [siteDesc, setSiteDesc] = useState(siteSettings.siteDescription);
  const [logoUrl, setLogoUrl] = useState(siteSettings.logoUrl);
  const [ogImage, setOgImage] = useState(siteSettings.ogImage);

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
  const pendingDisputes = disputeCases.filter(c => c.status !== 'resolved');
  const expiredAds = listings.filter(l => l.featured && l.promotionEndDate && new Date(l.promotionEndDate) < new Date());

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName.trim(), iconName: newCatIcon, count: 0, color: newCatColor });
    setNewCatName('');
    toast.success('Category added!');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    addAnnouncement({ title: annTitle.trim(), message: annMessage.trim(), type: annType, active: true });
    setAnnTitle('');
    setAnnMessage('');
    toast.success('Broadcast published!');
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({ siteName, siteDescription: siteDesc, logoUrl, ogImage });
    toast.success('Global Branding updated!');
  };

  const handleSendMassPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushMessage.trim()) return;
    broadcastMassNotification(pushTitle.trim(), pushMessage.trim(), pushRole);
    setPushTitle('');
    setPushMessage('');
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length < 4) return;
    updateAdminPin(newPinInput.trim());
    setIsPinModalOpen(false);
    setNewPinInput('');
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
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl gap-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Sealify Sovereign Terminal</h1>
              <p className="text-[11px] text-slate-400">Master Control • {siteSettings.siteName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 flex-wrap w-full sm:w-auto">
            <button onClick={() => setIsPinModalOpen(true)} className="px-3 py-2 bg-slate-800 text-amber-400 text-[10px] font-black rounded-xl border border-slate-700 flex items-center gap-1.5"><Key className="w-3.5 h-3.5" /> PIN ({adminPin})</button>
            <button onClick={exportDatabaseBackup} className="px-3 py-2 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-xl border border-slate-700 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> BACKUP</button>
            <button onClick={() => setIsSqlModalOpen(true)} className="p-2 bg-slate-800 text-teal-400 rounded-xl border border-slate-700"><Database className="w-4 h-4" /></button>
            <button onClick={logout} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/30"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('analytics')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>ANALYTICS</button>
          <button onClick={() => setActiveTab('branding')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'branding' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>BRANDING & SEO</button>
          <button onClick={() => setActiveTab('finance')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'finance' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>FINANCE</button>
          <button onClick={() => setActiveTab('users')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'users' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>USERS</button>
          <button onClick={() => setActiveTab('listings')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'listings' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>INVENTORY</button>
          <button onClick={() => setActiveTab('moderation')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'moderation' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}>MODERATION</button>
          <button onClick={() => setActiveTab('settings')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'settings' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>CONFIG</button>
          <button onClick={() => setActiveTab('broadcasts')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'broadcasts' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>BROADCASTS</button>
        </div>

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
               {[ 
                 { label: 'Live Visitors', value: analytics.visitors, icon: Activity, color: 'text-emerald-400' }, 
                 { label: 'Active Ads', value: listings.length, icon: Package, color: 'text-blue-400' }, 
                 { label: 'Total Members', value: allUsers.length, icon: Users, color: 'text-amber-400' }, 
                 { label: 'Uptime', value: '99.9%', icon: Server, color: 'text-purple-400' } 
               ].map((stat, i) => (
                 <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                   <div className={`flex items-center gap-1.5 ${stat.color}`}>
                     <stat.icon className="w-3.5 h-3.5" />
                     <span className="text-[9px] font-black uppercase tracking-wider">{stat.label}</span>
                   </div>
                   <p className="text-2xl font-black text-white">{stat.value}</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* BRANDING & SEO TAB */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Public Branding & SEO Control</h2>
                <p className="text-xs text-slate-400">Control the site name, logo, description, and social metadata images globally</p>
              </div>
            </div>

            <form onSubmit={handleSaveBranding} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase">Platform Site Name</label>
                  <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase">Master Logo URL</label>
                  <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase">Public SEO Description</label>
                <textarea rows={3} value={siteDesc} onChange={e => setSiteDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase">OG / Social Preview Image URL</label>
                <input type="text" value={ogImage} onChange={e => setOgImage(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500" />
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-4">
                 <div className="p-2 bg-white rounded-lg border border-slate-700 shrink-0">
                    <img src={logoUrl} className="h-10 w-auto" alt="Logo Preview" />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase text-slate-500">Live Header Preview</p>
                    <p className="text-xs font-bold text-white truncate">{siteName}</p>
                 </div>
              </div>

              <button type="submit" className="px-8 py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"><Check className="w-4 h-4" /> SAVE GLOBAL BRANDING</button>
            </form>
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><DollarSign className="w-6 h-6" /></div>
              <div><h2 className="text-xl font-black">Finance & Payments</h2><p className="text-xs text-slate-400">Review promotion receipts.</p></div>
            </div>
            {pendingPromoPay.length === 0 ? (
              <div className="bg-slate-900 p-12 border border-slate-800 rounded-3xl text-center text-slate-500 text-xs">No pending promotion payments.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPromoPay.map(req => (
                  <div key={req.id} className="bg-slate-900 border border-emerald-500/20 p-5 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-start text-xs">
                      <div><p className="font-bold text-white">₦{req.amount.toLocaleString()}</p><p className="text-[10px] text-slate-500">AD: {req.listingId}</p></div>
                      <span className="text-[8px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded uppercase">Pending</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => processPromotionPaymentRequest(req.id, 'rejected')} className="flex-1 py-2 bg-slate-800 text-slate-400 font-bold rounded-xl text-xs">Reject</button>
                      <button onClick={() => processPromotionPaymentRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs">Verify & Boost</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-base text-white">Users Directory ({allUsers.length})</h3>
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input type="text" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-emerald-500" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 font-black uppercase text-slate-500"><tr className="px-4 py-3"><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td className="p-3"><p className="font-bold text-white">{u.fullName}</p><p className="text-[10px] text-slate-500">{u.email}</p></td>
                        <td className="p-3 capitalize">{u.role}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${u.status === 'restricted' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{u.status || 'active'}</span></td>
                        <td className="p-3"><button onClick={() => setEditingUser(u)} className="p-1.5 bg-slate-800 text-blue-400 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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