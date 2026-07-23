import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import AdminEditUserModal from '../components/AdminEditUserModal';
import { UserProfile, Listing, Category } from '../types/sealify';
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
  ChevronDown, SlidersHorizontal, Grid, PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';

type AdminTab = 'analytics' | 'finance' | 'users' | 'listings' | 'requests' | 'security' | 'categories' | 'logs' | 'settings' | 'superuser' | 'disputes';

interface ModuleItem {
  id: AdminTab;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  badge?: number;
  color?: string;
  badgeBg?: string;
}

interface ModuleGroup {
  groupName: string;
  items: ModuleItem[];
}

export const AdminDashboard: React.FC = () => {
  const { 
    user, isAdmin, logout, categories, addCategory, deleteCategory, updateCategory,
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

  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  
  // Local states for forms
  const [adminFullName, setAdminFullName] = useState(user?.fullName || '');
  const [adminEmail, setAdminEmail] = useState(user?.email || '');
  const [adminPhone, setAdminPhone] = useState(user?.phoneNumber || '');
  const [newPin, setNewPin] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAdmin || !user) return null;

  const pendingVerifications = verificationRequests.filter(r => r.status === 'pending');
  const pendingPasswords = passwordRequests.filter(r => r.status === 'pending');
  const activeDisputes = disputeCases.filter(c => c.status !== 'resolved');
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');

  const moduleGroups: ModuleGroup[] = [
    {
      groupName: "Overview & Root",
      items: [
        { id: 'analytics', label: 'Vitals & Stats', description: 'Real-time metrics, node traffic, gross liquidity', icon: Activity, color: 'text-emerald-400' },
        { id: 'superuser', label: 'Master Profile', description: 'Configure master identity and root authentication', icon: Fingerprint, color: 'text-emerald-400' },
      ]
    },
    {
      groupName: "Management & Moderation",
      items: [
        { id: 'users', label: 'User Directory', description: 'Account permissions, bans, and profile editing', icon: Users, badge: allUsers.length, color: 'text-blue-400' },
        { id: 'listings', label: 'Ad Inventory', description: 'Audit, purge, and manage classified ads', icon: Package, badge: listings.length, color: 'text-teal-400' },
        { id: 'requests', label: 'Action Queue', description: 'ID verifications and NIN password resets', icon: BadgeCheck, badge: pendingVerifications.length + pendingPasswords.length, color: 'text-amber-400', badgeBg: 'bg-amber-500 text-slate-950' },
        { id: 'disputes', label: 'Dispute Center', description: 'Trade arbitration and flagged ad reports', icon: Gavel, badge: activeDisputes.length + pendingReports.length, color: 'text-rose-400', badgeBg: 'bg-rose-600 text-white' },
        { id: 'categories', label: 'Market Grid', description: 'Taxonomy sectors and category customization', icon: Layers, color: 'text-purple-400' },
      ]
    },
    {
      groupName: "Treasury & Security",
      items: [
        { id: 'finance', label: 'Treasury & Revenue', description: 'Ad promotion payments and financial ledger', icon: Wallet, badge: pendingPromoPay.length, color: 'text-emerald-400', badgeBg: 'bg-emerald-500 text-slate-950' },
        { id: 'security', label: 'Threat Logs', description: 'Forensic intrusion detection and device logs', icon: ShieldAlert, badge: intrusionLogs.length, color: 'text-rose-500', badgeBg: 'bg-rose-600 text-white' },
        { id: 'logs', label: 'Audit Trail', description: 'System-wide activity ledger and change log', icon: History, color: 'text-slate-400' },
        { id: 'settings', label: 'Global Config', description: 'System protocols and broadcast alerts', icon: SettingsIcon, color: 'text-cyan-400' },
      ]
    }
  ];

  const allModules = moduleGroups.flatMap(g => g.items);
  const activeModule = allModules.find(m => m.id === activeTab) || allModules[0];
  const ActiveIcon = activeModule.icon;

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
    toast.success(`Market segment "${newCatName}" added to grid.`);
  };

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(listingSearch.toLowerCase()) || 
    l.id.toLowerCase().includes(listingSearch.toLowerCase()) ||
    l.sellerName.toLowerCase().includes(listingSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      
      {/* HUD Header */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 backdrop-blur-xl sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-0.5 relative shadow-2xl overflow-hidden shrink-0">
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

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Link to="/post-ad" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black rounded-xl shadow-lg flex items-center gap-1.5 transition-all">
              <PlusCircle className="w-3.5 h-3.5" /> POST FREE OFFICIAL AD
            </Link>

            <button onClick={exportDatabaseBackup} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-[10px] font-black rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all">
              <Download className="w-3.5 h-3.5" /> BACKUP
            </button>

            <button onClick={logout} className="p-2.5 bg-rose-600/10 text-rose-500 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all">
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        
        {/* Module Selector Header Bar with Dropdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative z-20">
          
          <div className="relative flex-1" ref={dropdownRef}>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-emerald-400" />
              <span>Select Control Module</span>
            </p>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-950 hover:bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-2xl flex items-center justify-between transition-all group shadow-inner"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
                  <ActiveIcon className={`w-5 h-5 ${activeModule.color || 'text-emerald-400'}`} />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white truncate">{activeModule.label}</span>
                    {activeModule.badge && activeModule.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeModule.badgeBg || 'bg-rose-600 text-white'}`}>
                        {activeModule.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{activeModule.description}</p>
                </div>
              </div>

              <ChevronDown className={`w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {/* Categorized Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[75vh] overflow-y-auto no-scrollbar divide-y divide-slate-800/60">
                {moduleGroups.map((group) => (
                  <div key={group.groupName} className="py-2 first:pt-0 last:pb-0 space-y-1">
                    <p className="px-3 py-1 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-slate-950/40 rounded-lg w-fit mb-1">
                      {group.groupName}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isSelected = activeTab === item.id;

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                                : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-800/60'
                            }`}
                          >
                            <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${
                              isSelected 
                                ? 'bg-slate-950/20 border-slate-950/30 text-slate-950' 
                                : 'bg-slate-900 border-slate-800'
                            }`}>
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : item.color || 'text-slate-400'}`} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`text-xs font-bold truncate ${isSelected ? 'text-slate-950 font-black' : 'text-white'}`}>
                                  {item.label}
                                </p>
                                {item.badge && item.badge > 0 && (
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                                    isSelected ? 'bg-slate-950 text-emerald-400' : item.badgeBg || 'bg-rose-600 text-white'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className={`text-[10px] line-clamp-1 ${isSelected ? 'text-slate-900/80' : 'text-slate-500'}`}>
                                {item.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick-Switch Pill Bar for Top Frequency Modules */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0 self-end md:self-center">
            {[
              { id: 'analytics', label: 'Stats', icon: Activity },
              { id: 'users', label: 'Users', icon: Users, badge: allUsers.length },
              { id: 'listings', label: 'Ads', icon: Package, badge: listings.length },
              { id: 'requests', label: 'Queue', icon: BadgeCheck, badge: pendingVerifications.length + pendingPasswords.length },
              { id: 'disputes', label: 'Disputes', icon: Gavel, badge: activeDisputes.length + pendingReports.length },
            ].map((pill) => {
              const Icon = pill.icon;
              const isSelected = activeTab === pill.id;

              return (
                <button
                  key={pill.id}
                  onClick={() => setActiveTab(pill.id as AdminTab)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                  <span>{pill.label}</span>
                  {pill.badge && pill.badge > 0 ? (
                    <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black ${isSelected ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                      {pill.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

        </div>

        {/* Content Modules Area */}
        <div className="space-y-6">
          
          {/* Analytics Module */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Visitors</p>
                  <p className="text-3xl font-black text-white">{analytics.visitors}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Inventory</p>
                  <p className="text-3xl font-black text-white">{listings.length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chat Liquidity</p>
                  <p className="text-3xl font-black text-white">{analytics.totalChats}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gross Liquidity</p>
                  <p className="text-3xl font-black text-white">₦4.2M</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-400" /> Real-time Node Activity</h3>
                 <div className="flex items-end justify-between gap-2 h-32">
                    {analytics.sessionsPerMinute.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-2 h-full">
                         <div style={{ height: `${(val / 40) * 100}%` }} className="bg-emerald-500/20 rounded-t-lg border-t-2 border-emerald-500 relative group">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{val} ops</div>
                         </div>
                      </div>
                    ))}
                 </div>
                 <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">Aggregate Operation Throughput (Node 72)</p>
              </div>
            </div>
          )}

          {/* User Directory Tab */}
          {activeTab === 'users' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
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

          {/* Ad Inventory Tab */}
          {activeTab === 'listings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/30">
                 <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                       <Package className="w-5 h-5 text-emerald-400" />
                       Global Ad Inventory
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Audit and moderate all live classified advertisements</p>
                 </div>
                 <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="Search items, UID, or seller..." 
                      value={listingSearch}
                      onChange={e => setListingSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" 
                    />
                 </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Item Details</th>
                      <th className="px-6 py-4">Seller Context</th>
                      <th className="px-6 py-4">Financials</th>
                      <th className="px-6 py-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredListings.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={l.images[0]} className="w-12 h-12 rounded-xl object-cover border border-slate-800" alt="" />
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate max-w-[180px]">{l.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 uppercase font-bold">{l.category}</span>
                                {l.featured && <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black uppercase">Promoted</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-bold text-slate-300">{l.sellerName}</p>
                           <p className="text-[10px] text-slate-500 font-mono mt-0.5">{l.sellerPhone}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-black text-emerald-400">₦{l.price.toLocaleString()}</p>
                           <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1"><Eye className="w-3 h-3" /> {l.viewsCount} views</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Link to={`/listing/${l.id}`} className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-xl border border-slate-800 transition-all"><ExternalLink className="w-3.5 h-3.5" /></Link>
                             <button onClick={() => deleteListing(l.id)} className="p-2 bg-slate-950 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl border border-slate-800 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                            <button onClick={() => processPasswordRequest(req.id, 'approved')} className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 shadow-lg"><CheckCircle2 className="w-3.5 h-3.5" /> Execute Reset</button>
                            <button onClick={() => processPasswordRequest(req.id, 'declined')} className="px-5 py-2.5 bg-slate-800 text-slate-400 font-bold rounded-xl text-[10px] uppercase">Decline</button>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Finance Tab */}
          {activeTab === 'finance' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                                  <button onClick={() => processPromotionPaymentRequest(req.id, 'approved')} className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 shadow-lg"><CheckCircle2 className="w-3.5 h-3.5" /> Approve & Broadcast</button>
                                  <button onClick={() => processPromotionPaymentRequest(req.id, 'rejected')} className="px-5 py-2.5 bg-slate-800 text-slate-400 font-bold rounded-xl text-[10px] uppercase">Void</button>
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
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

          {/* Market Grid / Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20"><Layers className="w-6 h-6" /></div>
                     <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Market Taxonomy Grid</h2>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Manage available sectors and grid visualization</p>
                     </div>
                  </div>

                  <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 bg-slate-950 p-4 rounded-3xl border border-slate-800">
                     <input 
                       type="text" 
                       placeholder="Category Name..." 
                       value={newCatName}
                       onChange={e => setNewCatName(e.target.value)}
                       className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                     />
                     <select 
                       value={newCatColor} 
                       onChange={e => setNewCatColor(e.target.value)}
                       className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                     >
                        <option value="bg-emerald-500">Emerald Green</option>
                        <option value="bg-blue-500">Ocean Blue</option>
                        <option value="bg-purple-500">Cyber Purple</option>
                        <option value="bg-rose-500">Rose Red</option>
                        <option value="bg-amber-500">Amber Gold</option>
                     </select>
                     <button type="submit" className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg"><Plus className="w-4 h-4" /> Add Sector</button>
                  </form>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {categories.map((cat) => (
                        <div key={cat.id} className="bg-slate-950 border border-slate-800 p-4 rounded-3xl space-y-4 relative group">
                           <button onClick={() => deleteCategory(cat.id)} className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X className="w-3.5 h-3.5" /></button>
                           <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center shadow-lg`}>
                              <Layers className="w-5 h-5 text-white" />
                           </div>
                           <div>
                              <p className="font-black text-xs text-white">{cat.name}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{cat.count} total items</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

          {/* Audit Logs Tab */}
          {activeTab === 'logs' && (
             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
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

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* System Protocol Toggles */}
                  <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl">
                     <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl"><SettingsIcon className="w-6 h-6" /></div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Core System Protocols</h2>
                     </div>

                     <div className="space-y-4 pt-2">
                        {[
                          { id: 'maintenanceMode', label: 'Platform Maintenance Mode', desc: 'Deny user access and show maintenance screen', icon: ShieldX, color: 'text-rose-500' },
                          { id: 'autoApproveAds', label: 'Auto-Approve Ad Postings', desc: 'Ads go live instantly without moderator review', icon: CheckCircle2, color: 'text-emerald-500' },
                          { id: 'requireIdForPosting', label: 'Require ID for Postings', desc: 'Users must have Verified Badge to post ads', icon: ShieldCheck, color: 'text-blue-500' },
                          { id: 'aiSpamFilter', label: 'AI Forensic Spam Filtering', desc: 'Enable neural network analysis for ad descriptions', icon: Brain, color: 'text-purple-500' }
                        ].map((conf) => (
                           <div key={conf.id} className="p-4 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                 <conf.icon className={`w-5 h-5 ${conf.color}`} />
                                 <div>
                                    <p className="text-xs font-black text-white">{conf.label}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{conf.desc}</p>
                                 </div>
                              </div>
                              <button 
                                onClick={() => updateSystemConfig({ [conf.id]: !systemConfig[conf.id as keyof typeof systemConfig] })}
                                className="text-emerald-400 hover:scale-110 transition-transform"
                              >
                                 {systemConfig[conf.id as keyof typeof systemConfig] ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-700" />}
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Broadcast & Announcements */}
                  <div className="lg:col-span-5 space-y-6">
                     <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 space-y-5 shadow-2xl">
                        <div className="flex items-center gap-3">
                           <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20"><Megaphone className="w-5 h-5" /></div>
                           <h3 className="font-black text-sm text-white uppercase tracking-widest">Global Broadcast</h3>
                        </div>
                        
                        <form onSubmit={handleSendBroadcast} className="space-y-3">
                           <input 
                             type="text" 
                             required 
                             placeholder="Alert Title..." 
                             value={bcTitle}
                             onChange={e => setBcTitle(e.target.value)}
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500" 
                           />
                           <textarea 
                             required 
                             placeholder="Broadcast message payload..." 
                             value={bcMsg}
                             onChange={e => setBcMsg(e.target.value)}
                             rows={3}
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-amber-500" 
                           />
                           <select 
                             value={bcTarget} 
                             onChange={e => setBcTarget(e.target.value as any)}
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 focus:outline-none"
                           >
                              <option value="all">Target: All Users</option>
                              <option value="seller">Target: Verified Sellers</option>
                              <option value="buyer">Target: Registered Buyers</option>
                           </select>
                           <button type="submit" className="w-full py-3 bg-amber-500 text-slate-950 font-black rounded-xl text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg"><Send className="w-3.5 h-3.5" /> Dispatch Alert</button>
                        </form>
                     </div>

                     <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Radio className="w-3.5 h-3.5 text-emerald-400" /> Active System Banners</h4>
                        <div className="space-y-2">
                           {announcements.map(ann => (
                              <div key={ann.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                                 <div className="min-w-0">
                                    <p className="text-[10px] font-black text-white truncate">{ann.title}</p>
                                    <p className={`text-[8px] font-bold uppercase ${ann.active ? 'text-emerald-400' : 'text-slate-600'}`}>{ann.active ? 'Live' : 'Deactivated'}</p>
                                 </div>
                                 <div className="flex gap-1">
                                    <button onClick={() => toggleAnnouncement(ann.id)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500"><RefreshCw className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => deleteAnnouncement(ann.id)} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-500 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                 </div>
                              </div>
                           ))}
                           {announcements.length === 0 && <p className="text-center py-4 text-[10px] text-slate-600 font-bold uppercase">No active banners.</p>}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Superuser Profile Terminal */}
          {activeTab === 'superuser' && (
             <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

        </div>
      </main>

      <AdminEditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(id, updated) => updateUser(id, updated)} />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;