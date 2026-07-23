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
  Search, ShieldCheck, Check, X, Database, Plus, Sparkles, 
  AlertTriangle, LogOut, Megaphone, Bell, Download, 
  Terminal, DollarSign, Users, FileText, CheckCircle2,
  Lock, Palette, Layout, Globe, KeyRound, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, logout, categories, addCategory, 
    listings, allUsers, updateUser, t,
    promotionPaymentRequests, processPromotionPaymentRequest, 
    verificationRequests, processVerificationRequest,
    passwordRequests, processPasswordRequest,
    announcements, addAnnouncement, auditLogs, analytics,
    adminPin, updateAdminPin, siteSettings, updateSiteSettings, exportDatabaseBackup,
    broadcastMassNotification, disputeCases
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'finance' | 'users' | 'listings' | 'branding' | 'broadcasts' | 'settings'>('analytics');
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

  const filteredUsers = allUsers.filter(u => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({ siteName, siteDescription: siteDesc, logoUrl, ogImage });
    toast.success('Global Branding updated! Changes are now live for all users.');
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
              <h1 className="text-xl sm:text-2xl font-black text-white">Sealify Master Terminal</h1>
              <p className="text-[11px] text-slate-400">Master Control • {siteSettings.siteName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 flex-wrap w-full sm:w-auto">
            <button onClick={() => setIsPinModalOpen(true)} className="px-3 py-2 bg-slate-800 text-amber-400 text-[10px] font-black rounded-xl border border-slate-700 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" /> PIN ({adminPin})</button>
            <button onClick={exportDatabaseBackup} className="px-3 py-2 bg-slate-800 text-emerald-400 text-[10px] font-black rounded-xl border border-slate-700 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> BACKUP</button>
            <button onClick={() => setIsSqlModalOpen(true)} className="p-2 bg-slate-800 text-teal-400 rounded-xl border border-slate-700" title="Schema Viewer"><Database className="w-4 h-4" /></button>
            <button onClick={logout} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/30"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('analytics')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>ANALYTICS</button>
          <button onClick={() => setActiveTab('branding')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'branding' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>BRANDING & SEO</button>
          <button onClick={() => setActiveTab('finance')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'finance' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>FINANCE</button>
          <button onClick={() => setActiveTab('users')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'users' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>USERS</button>
          <button onClick={() => setActiveTab('listings')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'listings' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>INVENTORY</button>
          <button onClick={() => setActiveTab('broadcasts')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'broadcasts' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>BROADCASTS</button>
          <button onClick={() => setActiveTab('settings')} className={`px-3.5 py-2 rounded-xl text-[10px] font-black shrink-0 ${activeTab === 'settings' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>CONFIG</button>
        </div>

        {/* Tab Content: Branding & SEO */}
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
                  <input 
                    type="text" 
                    value={siteName} 
                    onChange={e => setSiteName(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layout className="w-3.5 h-3.5" />
                    <span>Global Logo URL</span>
                  </label>
                  <input 
                    type="text" 
                    value={logoUrl} 
                    onChange={e => setLogoUrl(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Meta SEO Description</span>
                </label>
                <textarea 
                  rows={3} 
                  value={siteDesc} 
                  onChange={e => setSiteDesc(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Social Metadata Image (OpenGraph)</span>
                </label>
                <input 
                  type="text" 
                  value={ogImage} 
                  onChange={e => setOgImage(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                />
              </div>

              <button 
                type="submit" 
                className="px-10 py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
              >
                <Check className="w-4.5 h-4.5" />
                <span>SAVE GLOBAL IDENTITY SETTINGS</span>
              </button>
            </form>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
             {[ 
               { label: 'Live Visitors', value: analytics.visitors, icon: Activity, color: 'text-emerald-400' }, 
               { label: 'Active Ads', value: listings.length, icon: Package, color: 'text-blue-400' }, 
               { label: 'Members', value: allUsers.length, icon: Users, color: 'text-amber-400' }, 
               { label: 'Uptime', value: '99.9%', icon: Terminal, color: 'text-purple-400' } 
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
        )}
      </main>

      <AdminEditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(id, updated) => updateUser(id, updated)} />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;