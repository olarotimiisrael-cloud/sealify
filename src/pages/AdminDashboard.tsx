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
  Search, ShieldCheck, Check, X, Database, Plus, Sparkles, 
  AlertTriangle, LogOut, Megaphone, Bell, Download, 
  Terminal, DollarSign, Users, FileText, CheckCircle2,
  Lock, Palette, Layout, Globe, KeyRound, Image as ImageIcon,
  Clock, Eye, Filter, ArrowUpRight, ShieldAlert, BadgeCheck,
  Gavel, Fingerprint, MousePointer2, Smartphone, Cpu
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, logout, categories, addCategory, deleteCategory, updateCategory,
    listings, allUsers, updateUser, t,
    promotionPaymentRequests, processPromotionPaymentRequest, 
    verificationRequests, processVerificationRequest,
    passwordRequests, processPasswordRequest,
    announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
    auditLogs, analytics, adminPin, updateAdminPin, siteSettings, updateSiteSettings, 
    exportDatabaseBackup, broadcastMassNotification, deleteListing, systemConfig, updateSystemConfig,
    disputeCases, processDisputeCase, intrusionLogs
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'finance' | 'users' | 'listings' | 'branding' | 'broadcasts' | 'requests' | 'disputes' | 'security' | 'categories' | 'settings'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  // Category Manager State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Layers');
  const [newCatColor, setNewCatColor] = useState('bg-blue-500');

  // Branding state
  const [siteName, setSiteName] = useState(siteSettings.siteName);
  const [siteDesc, setSiteDesc] = useState(siteSettings.siteDescription);
  const [logoUrl, setLogoUrl] = useState(siteSettings.logoUrl);
  const [ogImage, setOgImage] = useState(siteSettings.ogImage);

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPasswords = passwordRequests.filter(r => r.status === 'pending');
  const activeDisputes = disputeCases.filter(c => c.status !== 'resolved');

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({ siteName, siteDescription: siteDesc, logoUrl, ogImage });
    toast.success('Global Branding updated!');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName, iconName: newCatIcon, color: newCatColor, count: 0 });
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

          <div className="flex items-center gap-2 relative z-10 flex-wrap">
            <button onClick={() => setIsPinModalOpen(true)} className="px-3 py-2 bg-slate-800 text-amber-400 text-[10px] font-black rounded-xl border border-slate-700 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" /> PIN</button>
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
            { id: 'security', label: 'SECURITY', icon: Fingerprint, badge: intrusionLogs.length },
            { id: 'categories', label: 'TAXONOMY', icon: Layout },
            { id: 'branding', label: 'IDENTITY', icon: Palette },
            { id: 'users', label: 'MEMBERS', icon: Users },
            { id: 'listings', label: 'ADS', icon: Package },
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

        {/* Content: Dispute Center */}
        {activeTab === 'disputes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20">
                   <Gavel className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-xl font-black text-white">Trade Arbitration Center</h2>
                   <p className="text-xs text-slate-400">Mediate marketplace grievances and review evidence claims</p>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {disputeCases.length === 0 ? (
                   <div className="py-20 text-center text-slate-600 text-xs italic bg-slate-900 border border-slate-800 rounded-[2.5rem]">No active trade disputes found.</div>
                ) : (
                   disputeCases.map(disp => (
                      <div key={disp.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row gap-6 shadow-xl relative overflow-hidden">
                         <div className={`absolute top-0 left-0 w-1 h-full ${disp.status === 'resolved' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                         <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                               <div>
                                  <span className="text-[10px] font-mono text-emerald-400 font-bold">{disp.id}</span>
                                  <h3 className="text-lg font-black text-white mt-1">{disp.itemTitle}</h3>
                                  <p className="text-xs text-slate-400">Claimant: <strong className="text-white">{disp.userEmail}</strong> vs <strong className="text-rose-400">{disp.counterparty}</strong></p>
                               </div>
                               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${disp.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>{disp.status}</span>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                               <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Dispute Details:</p>
                               <p className="text-sm text-slate-200 leading-relaxed italic">"{disp.details}"</p>
                               {disp.evidenceUrl && <a href={disp.evidenceUrl} target="_blank" className="text-[10px] text-blue-400 font-black hover:underline flex items-center gap-1 mt-3">VIEW EVIDENCE FILE <ArrowUpRight className="w-3.5 h-3.5" /></a>}
                            </div>
                         </div>
                         <div className="md:w-64 space-y-2 shrink-0">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Arbitration Actions</p>
                            <button onClick={() => processDisputeCase(disp.id, 'in_review')} className="w-full py-2.5 bg-slate-800 text-amber-400 font-black rounded-xl text-[10px] uppercase transition-all">Move to Review</button>
                            <button onClick={() => processDisputeCase(disp.id, 'resolved')} className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg transition-all">Resolve & Close Case</button>
                            <button className="w-full py-2.5 bg-slate-800 text-slate-400 font-black rounded-xl text-[10px] uppercase border border-slate-700">Contact Parties</button>
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>
        )}

        {/* Content: Security Intrusion Watchdog */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20">
                   <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-xl font-black text-white">Forensic Intrusion Intelligence</h2>
                   <p className="text-xs text-slate-400">Metadata and device indicators from failed administrative authentication attempts</p>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {intrusionLogs.length === 0 ? (
                   <div className="py-20 text-center text-slate-600 text-xs italic bg-slate-900 border border-slate-800 rounded-[2.5rem]">Terminal security uncompromised. No alerts recorded.</div>
                ) : (
                   intrusionLogs.map(log => (
                      <div key={log.id} className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl"></div>
                         <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                            <div className="flex-1 space-y-4">
                               <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                  <div className="flex items-center gap-3">
                                     <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-rose-500 border border-rose-500/30 shadow-inner"><ShieldAlert className="w-6 h-6 animate-pulse" /></div>
                                     <div>
                                        <h4 className="font-black text-white text-base">Breach Attempt: {log.attemptedEmail}</h4>
                                        <p className="text-[10px] text-slate-500 font-mono">{log.timestamp} • {log.id}</p>
                                     </div>
                                  </div>
                                  <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-1 rounded">CRITICAL ALERT</span>
                               </div>

                               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800"><div className="flex items-center gap-2 text-slate-500 font-bold mb-1"><Smartphone className="w-3 h-3" /> OS Platform</div><p className="text-white font-mono">{log.deviceInfo.platform}</p></div>
                                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800"><div className="flex items-center gap-2 text-slate-500 font-bold mb-1"><MousePointer2 className="w-3 h-3" /> Resolution</div><p className="text-white font-mono">{log.deviceInfo.screenResolution}</p></div>
                                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800"><div className="flex items-center gap-2 text-slate-500 font-bold mb-1"><Cpu className="w-3 h-3" /> Hardware</div><p className="text-white font-mono">{log.deviceInfo.cores} Cores / {log.deviceInfo.language}</p></div>
                                  <div className={`p-3 rounded-xl border ${log.mediaCaptured ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}><div className="flex items-center gap-2 font-bold mb-1"><ImageIcon className="w-3 h-3" /> Forensic Media</div><p className="font-black uppercase">{log.mediaCaptured ? 'Captured' : 'Denied'}</p></div>
                               </div>

                               <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                  <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Raw User-Agent Forensics:</p>
                                  <p className="text-[10px] text-slate-400 font-mono leading-tight">{log.deviceInfo.userAgent}</p>
                               </div>
                            </div>
                            <div className="lg:w-48 flex flex-col gap-2 shrink-0">
                               <button className="w-full py-3 bg-slate-800 text-rose-400 font-black rounded-xl text-[10px] uppercase border border-rose-500/20">Blacklist IP Node</button>
                               <button className="w-full py-3 bg-slate-800 text-white font-black rounded-xl text-[10px] uppercase border border-slate-700">Dismiss Alert</button>
                            </div>
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>
        )}

        {/* Content: Taxonomy (Category Manager) */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
             <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-xs tracking-widest">
                   <Layout className="w-4 h-4" />
                   <span>Add New Marketplace Category</span>
                </div>
                <form onSubmit={handleAddCategory} className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Category Display Name</label>
                      <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Health & Fitness" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Lucide Icon Key</label>
                      <select value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none">
                         <option value="Smartphone">Smartphone</option>
                         <option value="Car">Car</option>
                         <option value="Home">Home</option>
                         <option value="Shirt">Shirt</option>
                         <option value="Layers">Layers</option>
                         <option value="Briefcase">Briefcase</option>
                      </select>
                   </div>
                   <button type="submit" className="w-full py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs uppercase shadow-lg">CREATE CATEGORY</button>
                </form>
             </div>

             <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="font-black text-white text-sm uppercase tracking-widest">Global Taxonomy Registry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {categories.map(cat => (
                      <div key={cat.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 group">
                         <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${cat.color} text-white`}><ImageIcon className="w-4 h-4" /></div>
                            <div>
                               <h4 className="font-bold text-xs text-white">{cat.name}</h4>
                               <p className="text-[10px] text-slate-500">{cat.count} listings</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 hover:text-emerald-400 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteCategory(cat.id)} className="p-1.5 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* Existing User/Listing Management Tabs Placeholder... */}
        {activeTab === 'analytics' && (
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
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
        )}

      </main>

      <AdminEditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(id, updated) => updateUser(id, updated)} />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;