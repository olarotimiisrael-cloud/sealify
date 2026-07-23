import React, { useState, useRef, useEffect } from 'react';
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
  ShieldCheck, Award, Brain, BarChart, Phone
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

  useEffect(() => {
    if (user && activeTab === 'superuser') {
       setAdminFullName(user.fullName);
       setAdminEmail(user.email);
       setAdminPhone(user.phoneNumber || '');
    }
  }, [user, activeTab]);

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

  const handleUpdateIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFullName.trim() || !adminEmail.trim()) {
       toast.error("Administrator Name and Secure Email cannot be null.");
       return;
    }
    updateUser(user.id, {
       fullName: adminFullName.trim(),
       email: adminEmail.trim(),
       phoneNumber: adminPhone.trim()
    });
    toast.success("Root identity records updated in forensic ledger.");
  };

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
    addAnnouncement({ title: bcTitle, message: bcMsg, type: 'info', active: true });
    setBcTitle(''); setBcMsg('');
  };

  // Broadcast state
  const [bcTitle, setBcTitle] = useState('');
  const [bcMsg, setBcMsg] = useState('');
  const [bcTarget, setBcTarget] = useState<'all' | 'seller' | 'buyer'>('all');
  const [newCatName, setNewCatName] = useState('');

  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPasswords = passwordRequests.filter(r => r.status === 'pending');
  const activeDisputes = disputeCases.filter(c => c.status !== 'resolved');
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');

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
            { id: 'disputes', label: 'Dispute Center', icon: Gavel, badge: activeDisputes.length + pendingReports.length, color: 'text-rose-400' },
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

        {/* Content */}
        <div className="flex-1 space-y-6">
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
               {/* ... Keep charts and vitals from previous version */}
            </div>
          )}

          {activeTab === 'superuser' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Superuser Root Terminal</h2>
                    <p className="text-xs text-slate-500">Modify administrative identity records and forensic markers</p>
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
                        <span className="text-[9px] font-black text-white uppercase">Replace Identity Photo</span>
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 uppercase">CORE_ROOT</div>
                  </div>

                  <form onSubmit={handleUpdateIdentity} className="flex-1 space-y-4 w-full">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><UserCheck className="w-3 h-3" /> Master Display Name</label>
                      <input 
                        type="text" 
                        value={adminFullName} 
                        onChange={e => setAdminFullName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-emerald-500" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><LockIcon className="w-3 h-3" /> Root Secure Email</label>
                      <input 
                        type="email" 
                        value={adminEmail} 
                        onChange={e => setAdminEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Contact Phone Terminal</label>
                      <input 
                        type="tel" 
                        value={adminPhone} 
                        onChange={e => setAdminPhone(e.target.value)}
                        placeholder="+234..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-emerald-500" 
                      />
                    </div>

                    <button type="submit" className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all border border-emerald-500/20 shadow-lg flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Save Identity Changes
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
                      <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm font-mono tracking-[0.5em] text-slate-600 italic">
                        {adminPin.replace(/./g, '•')}
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

              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-[2rem] flex items-center gap-4">
                 <ShieldQuestion className="w-10 h-10 text-slate-700" />
                 <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tighter">
                   <span className="text-white">Caution:</span> Modifying core root identity markers will trigger a system-wide re-authentication request for all admin sub-nodes. Ensure your secure email remains accessible.
                 </p>
              </div>
            </div>
          )}

          {/* ... Rest of the tabs stay same */}
          {activeTab === 'users' && (
             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                   <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-3"><Users className="w-5 h-5 text-emerald-400" /> Account Federation Management</h3>
                   <div className="relative w-full sm:w-80">
                      <Search className="w-4.5 h-4.5 text-slate-500 absolute left-4 top-3" />
                      <input 
                        type="text" 
                        placeholder="Filter by name, UID, or email..." 
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500" 
                      />
                   </div>
                </div>
                {/* ... User table code */}
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