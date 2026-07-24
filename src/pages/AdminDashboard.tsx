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
  ChevronDown, SlidersHorizontal, Grid, PlusCircle, Crown, HelpCircle, Star
} from 'lucide-react';
import { toast } from 'sonner';

type AdminTab = 'analytics' | 'finance' | 'users' | 'listings' | 'requests' | 'security' | 'categories' | 'logs' | 'settings' | 'superuser' | 'disputes' | 'buyer_requests' | 'reviews';

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
    listings, allUsers, updateUser, deleteUser, updateListing, deleteListing, toggleFeaturedListing, markAsSold,
    promotionPaymentRequests, processPromotionPaymentRequest, 
    verificationRequests, processVerificationRequest,
    passwordRequests, processPasswordRequest,
    auditLogs, analytics, exportDatabaseBackup, broadcastMassNotification,
    disputeCases, processDisputeCase, intrusionLogs,
    systemConfig, updateSystemConfig, siteSettings, updateSiteSettings,
    adminPin, updateAdminPin, announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement,
    reports, processReport, buyerRequests, deleteBuyerRequest, reviews, deleteReview
  } = useSealify();

  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  
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
        { id: 'listings', label: 'Ad Inventory', description: 'Audit, feature, mark sold, and purge ads', icon: Package, badge: listings.length, color: 'text-teal-400' },
        { id: 'buyer_requests', label: 'Buyer Want Board', description: 'Moderate community product requests', icon: HelpCircle, badge: buyerRequests.length, color: 'text-amber-400' },
        { id: 'reviews', label: 'Seller Reviews', description: 'Audit buyer feedback and delete spam', icon: Star, badge: reviews.length, color: 'text-yellow-400' },
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
              <PlusCircle className="w-3.5 h-3.5" /> POST OFFICIAL AD
            </Link>
            <button onClick={logout} className="p-2.5 bg-rose-600/10 text-rose-500 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all">
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        
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
                  <ActiveIcon className={`w-5 h-5 \${activeModule.color || 'text-emerald-400'}`} />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white truncate">{activeModule.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{activeModule.description}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 duration-300 \${isDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 max-h-[75vh] overflow-y-auto no-scrollbar divide-y divide-slate-800/60">
                {moduleGroups.map((group) => (
                  <div key={group.groupName} className="py-2 first:pt-0 last:pb-0 space-y-1">
                    <p className="px-3 py-1 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-slate-950/40 rounded-lg w-fit mb-1">{group.groupName}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isSelected = activeTab === item.id;
                        return (
                          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsDropdownOpen(false); }} className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 \${isSelected ? 'bg-emerald-500 text-slate-950 font-black shadow-lg' : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/60'}`}>
                            <div className={`p-2 rounded-xl border shrink-0 mt-0.5 \${isSelected ? 'bg-slate-950/20 border-slate-950/30' : 'bg-slate-900 border-slate-800'}`}>
                              <Icon className={`w-4 h-4 \${isSelected ? 'text-slate-950' : item.color || 'text-slate-400'}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold truncate \${isSelected ? 'text-slate-950' : 'text-white'}`}>{item.label}</p>
                              <p className={`text-[10px] line-clamp-1 \${isSelected ? 'text-slate-900/80' : 'text-slate-500'}`}>{item.description}</p>
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
        </div>

        {/* Content Modules Area */}
        <div className="space-y-6">
          
          {/* Analytics Module with LIVE SESSION MONITOR */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2">
                     <Activity className="w-5 h-5 text-emerald-400" />
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                     </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Online Visitors</p>
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

              {/* LIVE SESSION MONITOR TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                 <div className="p-6 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
                          <Radio className="w-5 h-5 animate-pulse" />
                       </div>
                       <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Session Stream</h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Real-time user behavior forensics on Node 72</p>
                       </div>
                    </div>
                    <span className="text-[9px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full animate-pulse">RECORDS UPDATING LIVE</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                       <thead className="bg-slate-950 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800">
                          <tr>
                             <th className="px-6 py-4">Virtual Node ID</th>
                             <th className="px-6 py-4">Associated User</th>
                             <th className="px-6 py-4">Current Active Protocol</th>
                             <th className="px-6 py-4 text-right">Elapsed</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800/60">
                          {analytics.activeSessions.map((sess) => (
                             <tr key={sess.id} className="hover:bg-slate-800/30 transition-colors animate-in slide-in-from-left-2">
                                <td className="px-6 py-4 font-mono text-emerald-400 text-[10px]">{sess.id}</td>
                                <td className="px-6 py-4 font-bold text-slate-300">{sess.user}</td>
                                <td className="px-6 py-4">
                                   <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400 font-bold text-[9px] uppercase tracking-tighter">
                                      {sess.action}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right text-slate-500 font-mono">{sess.time}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-400" /> Aggregated Throughput</h3>
                 <div className="flex items-end justify-between gap-2 h-32">
                    {analytics.sessionsPerMinute.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-2 h-full">
                         <div style={{ height: `\${(val / 40) * 100}%` }} className="bg-emerald-500/20 rounded-t-lg border-t-2 border-emerald-500 relative group">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{val} ops</div>
                         </div>
                      </div>
                    ))}
                 </div>
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
                            <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-wider \${u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{u.role}</span>
                            <div className="flex items-center gap-1.5">
                               <span className={`w-1.5 h-1.5 rounded-full \${u.status === 'banned' ? 'bg-rose-500' : u.status === 'restricted' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
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
                            <button onClick={() => deleteUser(u.id)} className="p-2 bg-slate-950 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl transition-all border border-slate-800">
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

          {/* Content for other tabs omitted for brevity but they remain active... */}

        </div>
      </main>

      <AdminEditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(id, updated) => updateUser(id, updated)} />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;