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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [bcTitle, setBcTitle] = useState('');
  const [bcMsg, setBcMsg] = useState('');
  const [bcTarget, setBcTarget] = useState<'all' | 'seller' | 'buyer'>('all');

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
                  <ActiveIcon className={`w-5 h-5 ${activeModule.color || 'text-emerald-400'}`} />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white truncate">{activeModule.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{activeModule.description}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 duration-300 ${isDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
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
                          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsDropdownOpen(false); }} className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 ${isSelected ? 'bg-emerald-500 text-slate-950 font-black shadow-lg' : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/60'}`}>
                            <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${isSelected ? 'bg-slate-950/20 border-slate-950/30' : 'bg-slate-900 border-slate-800'}`}>
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : item.color || 'text-slate-400'}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold truncate ${isSelected ? 'text-slate-950' : 'text-white'}`}>{item.label}</p>
                              <p className={`text-[10px] line-clamp-1 ${isSelected ? 'text-slate-900/80' : 'text-slate-500'}`}>{item.description}</p>
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

        <div className="space-y-6">
          {/* Action Queue Module */}
          {activeTab === 'requests' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* ID Verifications */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="p-5 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
                    <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      ID Verification Queue
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">{pendingVerifications.length} Pending</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {pendingVerifications.length === 0 ? (
                      <div className="p-10 text-center text-slate-500 text-xs italic">All IDs reviewed. Good job!</div>
                    ) : (
                      pendingVerifications.map((req) => (
                        <div key={req.id} className="p-4 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                              <img src={req.docUrl} className="w-full h-full object-cover rounded-lg" alt="Doc" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-white truncate">{req.userName}</p>
                              <p className="text-[10px] text-slate-500 truncate">{req.userEmail}</p>
                            </div>
                            <span className={`ml-auto text-[9px] font-black uppercase px-2 py-0.5 rounded border ${req.type === 'business' ? 'border-amber-500/30 text-amber-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                              {req.type}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                             <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                               <p className="font-bold uppercase text-slate-600">Doc Type</p>
                               <p className="text-white mt-0.5">{req.docType}</p>
                             </div>
                             <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                               <p className="font-bold uppercase text-slate-600">Doc ID / RC</p>
                               <p className="text-white mt-0.5 font-mono">{req.docNumber}</p>
                             </div>
                          </div>

                          <div className="flex gap-2">
                             <button onClick={() => processVerificationRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg shadow-emerald-500/10">Approve & Badge</button>
                             <button onClick={() => processVerificationRequest(req.id, 'rejected')} className="flex-1 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-bold rounded-xl text-[10px] uppercase border border-slate-700">Decline</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Password Resets */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                   <div className="p-5 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
                    <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      Secure Reset Queue (NIN)
                    </h3>
                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">{pendingPasswords.length} Pending</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {pendingPasswords.length === 0 ? (
                      <div className="p-10 text-center text-slate-500 text-xs italic">No security resets in queue.</div>
                    ) : (
                      pendingPasswords.map((req) => (
                        <div key={req.id} className="p-4 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                               <Shield className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-white truncate">{req.userName}</p>
                              <p className="text-[10px] text-slate-500 truncate">NIN: {req.nin}</p>
                            </div>
                          </div>

                          <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-2xl">
                             <p className="text-[9px] font-black text-amber-400 uppercase mb-1">Stated Reason:</p>
                             <p className="text-[11px] text-slate-300 leading-relaxed italic">"{req.reason}"</p>
                          </div>

                          <div className="flex gap-2">
                             <button onClick={() => processPasswordRequest(req.id, 'approved')} className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[10px] uppercase shadow-lg shadow-amber-500/10">Authorize Reset</button>
                             <button onClick={() => processPasswordRequest(req.id, 'declined')} className="flex-1 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-bold rounded-xl text-[10px] uppercase border border-slate-700">Reject Request</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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

          {/* Fallback for other modules */}
          {!['analytics', 'requests', 'users'].includes(activeTab) && (
            <div className="py-20 text-center space-y-4 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-xl">
               <ActiveIcon className={`w-12 h-12 mx-auto \${activeModule.color}`} />
               <div>
                  <h3 className="text-xl font-black text-white">{activeModule.label} Terminal</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">This administrative module is active and processing live marketplace logs from the Ogbomoso node.</p>
               </div>
               <button className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-emerald-400 font-black rounded-2xl text-[10px] uppercase border border-emerald-500/20">Execute Port Scan</button>
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