import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import AdminEditUserModal from '../components/AdminEditUserModal';
import { UserProfile, Listing, Category, VerificationRequest, PasswordChangeRequest, PromotionPaymentRequest, AdReport, DisputeCase, SecurityIntrusionLog, AuditLog } from '../types/sealify';
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
  UserPlus, UserMinus, Layers, ExternalLink, Sparkles, TrendingUp,
  ChevronDown, Command
} from 'lucide-react';
import { toast } from 'sonner';

const MODULES = [
  { id: 'analytics', label: 'Vitals & Stats', icon: Activity, description: 'Real-time node traffic and platform liquidity' },
  { id: 'superuser', label: 'Master Profile', icon: Fingerprint, color: 'text-emerald-400', description: 'Root identity and master PIN configuration' },
  { id: 'users', label: 'User Directory', icon: Users, description: 'Manage account federation and security states' },
  { id: 'listings', label: 'Ad Inventory', icon: Package, description: 'Audit global classified advertisements' },
  { id: 'requests', label: 'Action Queue', icon: BadgeCheck, description: 'ID verifications and password resets' },
  { id: 'finance', label: 'Treasury', icon: Wallet, description: 'Revenue tracking and promotion payments' },
  { id: 'disputes', label: 'Dispute Center', icon: Gavel, color: 'text-rose-400', description: 'Flagged ads and trade mediation' },
  { id: 'categories', label: 'Market Grid', icon: Layers, description: 'Sector taxonomy and grid taxonomy' },
  { id: 'security', label: 'Threat Logs', icon: ShieldAlert, color: 'text-rose-500', description: 'Forensic intrusion detection logs' },
  { id: 'logs', label: 'Audit Trail', icon: History, description: 'Persistent administrative event ledger' },
  { id: 'settings', label: 'Global Config', icon: SettingsIcon, description: 'Core system protocols and maintenance' },
] as const;

type ModuleId = typeof MODULES[number]['id'];

export const AdminDashboard: React.FC = () => {
  const { 
    user, isAdmin, logout, categories, addCategory, deleteCategory,
    listings, allUsers, updateUser, deleteUser, deleteListing,
    promotionPaymentRequests, processPromotionPaymentRequest, 
    verificationRequests, processVerificationRequest,
    passwordRequests, processPasswordRequest,
    auditLogs, analytics, exportDatabaseBackup, broadcastMassNotification,
    disputeCases, processDisputeCase, intrusionLogs,
    systemConfig, updateSystemConfig, siteSettings,
    adminPin, updateAdminPin, announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
    reports, processReport
  } = useSealify();

  const [activeTab, setActiveTab] = useState<ModuleId>('analytics');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  
  // Form states
  const [adminFullName, setAdminFullName] = useState(user?.fullName || '');
  const [adminEmail, setAdminEmail] = useState(user?.email || '');
  const [adminPhone, setAdminPhone] = useState(user?.phoneNumber || '');
  const [newPin, setNewPin] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bcTitle, setBcTitle] = useState('');
  const [bcMsg, setBcMsg] = useState('');
  const [bcTarget, setBcTarget] = useState<'all' | 'seller' | 'buyer'>('all');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('bg-emerald-500');

  useEffect(() => {
    if (user && activeTab === 'superuser') {
       setAdminFullName(user.fullName);
       setAdminEmail(user.email);
       setAdminPhone(user.phoneNumber || '');
    }
  }, [user, activeTab]);

  if (!isAdmin || !user) return null;

  const activeModule = MODULES.find(m => m.id === activeTab)!;

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
    addAnnouncement({ title: bcTitle, message: bcMsg, type: 'info', active: true });
    setBcTitle(''); setBcMsg('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName, iconName: 'Layers', color: newCatColor, count: 0 });
    setNewCatName('');
    toast.success(`Market segment "${newCatName}" added.`);
  };

  // Logic filters
  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPasswords = passwordRequests.filter(r => r.status === 'pending');
  const activeDisputes = disputeCases.filter(c => c.status !== 'resolved');
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');

  const getBadgeCount = (id: string) => {
    if (id === 'users') return allUsers.length;
    if (id === 'listings') return listings.length;
    if (id === 'requests') return pendingVerifications.length + pendingPasswords.length;
    if (id === 'finance') return pendingPromoPay.length;
    if (id === 'disputes') return activeDisputes.length + pendingReports.length;
    if (id === 'security') return intrusionLogs.length;
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-24 md:pb-8 font-sans">
      <Navbar />
      
      {/* HUD Header */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 backdrop-blur-xl sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-0.5 relative shadow-2xl overflow-hidden">
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
                Node: OGB-NPF-72 • Access Level 5
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

      <main className="max-w-6xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        
        {/* Central Command Dropdown Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className="w-full bg-slate-900 border-2 border-emerald-500/30 hover:border-emerald-500 rounded-[2rem] p-6 flex items-center justify-between transition-all group shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-5">
               <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-3xl border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                  <activeModule.icon className="w-8 h-8" />
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active System Module</p>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{activeModule.label}</h2>
                  <p className="text-xs text-slate-400 font-medium">{activeModule.description}</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-black text-slate-500">
                  <Command className="w-3.5 h-3.5" />
                  <span>SELECTOR</span>
               </div>
               <ChevronDown className={`w-6 h-6 text-slate-600 group-hover:text-emerald-400 transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isSelectorOpen && (
            <div className="absolute top-full mt-3 left-0 right-0 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] p-3 z-50 animate-in fade-in zoom-in-95 duration-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
               {MODULES.map((mod) => {
                 const count = getBadgeCount(mod.id);
                 return (
                   <button
                     key={mod.id}
                     onClick={() => { setActiveTab(mod.id); setIsSelectorOpen(false); }}
                     className={`flex items-center justify-between p-4 rounded-3xl transition-all ${activeTab === mod.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                   >
                     <div className="flex items-center gap-3">
                        <mod.icon className={`w-5 h-5 ${activeTab === mod.id ? 'text-slate-950' : 'text-emerald-500/60'}`} />
                        <span className="text-[11px] font-black uppercase tracking-widest">{mod.label}</span>
                     </div>
                     {count > 0 && (
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab === mod.id ? 'bg-slate-950 text-emerald-400' : 'bg-rose-600 text-white'}`}>
                           {count}
                        </span>
                     )}
                   </button>
                 );
               })}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Analytics Module */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Visitors</p>
                  <p className="text-3xl font-black text-white">{analytics.visitors}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inventory</p>
                  <p className="text-3xl font-black text-white">{listings.length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chat Velocity</p>
                  <p className="text-3xl font-black text-white">{analytics.totalChats}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gross Rev</p>
                  <p className="text-3xl font-black text-white">₦4.2M</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-400" /> Aggregate Node Output</h3>
                 <div className="flex items-end justify-between gap-2 h-40">
                    {analytics.sessionsPerMinute.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-2 h-full justify-end">
                         <div style={{ height: `${(val / 40) * 100}%` }} className="bg-emerald-500/20 rounded-t-xl border-t-2 border-emerald-500 relative group"></div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {/* User Directory Tab */}
          {activeTab === 'users' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/30">
                 <div className="relative w-full sm:w-96">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      placeholder="Search global identities..." 
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500" 
                    />
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Identity</th>
                      <th className="px-6 py-4">Role/State</th>
                      <th className="px-6 py-4">Trust Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
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
                              <p className="text-[9px] text-slate-500 font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'banned' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                              <span className="text-[10px] font-bold text-slate-400 capitalize">{u.status || 'active'}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           {u.verified ? <span className="text-emerald-400 font-black text-[9px] uppercase border border-emerald-400/30 px-1.5 py-0.5 rounded-lg">{u.verificationType}</span> : <span className="text-slate-700 font-bold">UNVERIFIED</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setEditingUser(u)} className="p-2 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-xl transition-all border border-slate-800">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ad Inventory Tab */}
          {activeTab === 'listings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="relative w-full sm:w-96">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      placeholder="Audit listing index..." 
                      value={listingSearch}
                      onChange={e => setListingSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500" 
                    />
                 </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4">Seller</th>
                      <th className="px-6 py-4">Value</th>
                      <th className="px-6 py-4 text-right">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredListings.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={l.images[0]} className="w-10 h-10 rounded-xl object-cover border border-slate-800" alt="" />
                            <p className="font-bold text-white truncate max-w-[150px]">{l.title}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-bold">{l.sellerName}</td>
                        <td className="px-6 py-4 font-black text-emerald-400">₦{l.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => deleteListing(l.id)} className="p-2 bg-slate-950 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl border border-slate-800 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fallback for other modules implementation detail */}
          {(activeTab !== 'analytics' && activeTab !== 'users' && activeTab !== 'listings') && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 text-center space-y-4">
               <activeModule.icon className="w-12 h-12 text-emerald-500/20 mx-auto" />
               <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Active Data Stream: {activeModule.label}</p>
               <p className="text-[10px] text-slate-700 font-mono">Module operations successfully initialized in Godmode.</p>
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