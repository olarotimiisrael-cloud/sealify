import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import { UserProfile, VerificationBadgeType } from '../types/sealify';
import { 
  Shield, Package, Activity, Layers, RefreshCw, LayoutGrid, Edit3, Trash2,
  Users, MousePointer2, Globe, Clock, Terminal, CheckCircle2, AlertCircle,
  Search, ShieldCheck, Mail, Phone, MapPin, Award, Check, X
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, categories, addCategory, deleteCategory, analytics, listings, allUsers, updateUser, deleteUser, t 
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'categories' | 'maintenance'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newCatName, setNewCatName] = useState('');

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleUpdateBadge = (userId: string, type: VerificationBadgeType) => {
    updateUser(userId, { 
      verificationType: type, 
      verified: type !== 'none' 
    });
    toast.success(`Badge updated to ${type.toUpperCase()}`);
    setEditingUser(null);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <Shield className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-black">Restricted Access</h2>
        <p className="text-slate-400 text-xs mt-2">Only administrators can access this terminal.</p>
        <Link to="/" className="mt-6 px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs">Back Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">{t('system_terminal')}</h1>
              <p className="text-xs text-slate-400">Live monitoring & infrastructure management</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>ANALYTICS</button>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'users' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>USERS</button>
            <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'categories' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>CATEGORIES</button>
            <button onClick={() => setActiveTab('maintenance')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'maintenance' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>MAINTENANCE</button>
          </div>
        </div>

        {/* Tab Content: Users Management (The requested feature) */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search users by name, email or phone..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none"
              />
              <span className="text-[10px] font-black text-slate-500 uppercase px-3 py-1 bg-slate-950 rounded-lg">{filteredUsers.length} total</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">User / Profile</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Status & Badge</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Activity</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatarUrl} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">{u.fullName}</p>
                              <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <VerifiedBadge type={u.verificationType || 'none'} showText />
                            {u.role === 'admin' && <span className="text-[9px] font-black text-rose-400 uppercase">Super Admin</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="text-slate-300 font-medium">Joined {u.memberSince}</p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {u.location}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setEditingUser(u)}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition-all"
                              title="Edit User Badge / Profile"
                            >
                              <Award className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteUser(u.id)}
                              className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"
                              title="Delete User Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics & Stats Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400"><Activity className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">{t('visitors')}</span></div>
                  <p className="text-3xl font-black text-white">{analytics.visitors}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400"><Package className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Active Ads</span></div>
                  <p className="text-3xl font-black text-white">{listings.length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-purple-400"><Layers className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Categories</span></div>
                  <p className="text-3xl font-black text-white">{categories.length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400"><RefreshCw className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Uptime</span></div>
                  <p className="text-3xl font-black text-white">99.9%</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.sessionsPerMinute.map((v, i) => ({ t: i, v }))}>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={3} fillOpacity={0.1} fill="#10b981" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Platform Integrity</h3>
              <div className="space-y-3">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
                    <div><p className="font-bold text-white">Identity Lock</p><p className="text-[10px] text-slate-500">2FA Active</p></div>
                  </div>
                  <div className="w-8 h-4 bg-emerald-500 rounded-full"></div>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center"><Terminal className="w-5 h-5" /></div>
                    <div><p className="font-bold text-white">API Layer</p><p className="text-[10px] text-slate-500">Ready</p></div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Badge Alignment Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative space-y-6">
              <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"><X className="w-4 h-4" /></button>
              
              <div className="text-center space-y-2">
                <img src={editingUser.avatarUrl} className="w-20 h-20 rounded-3xl mx-auto border-2 border-emerald-500 mb-2" />
                <h3 className="text-xl font-black text-white">{editingUser.fullName}</h3>
                <p className="text-xs text-slate-400">Align Verified Badge Status for this user</p>
              </div>

              <div className="space-y-3">
                <button onClick={() => handleUpdateBadge(editingUser.id, 'none')} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-slate-600">
                  <div className="text-left"><p className="font-bold text-white">Remove Badge</p><p className="text-[10px] text-slate-500">Reset to unverified status</p></div>
                  <X className="w-5 h-5 text-slate-600 group-hover:text-red-400" />
                </button>
                <button onClick={() => handleUpdateBadge(editingUser.id, 'individual')} className="w-full p-4 bg-slate-950 border border-emerald-500/20 rounded-2xl flex items-center justify-between group hover:border-emerald-500/50">
                  <div className="text-left"><p className="font-bold text-emerald-400">Verified ID</p><p className="text-[10px] text-slate-500">Individual identity verified</p></div>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </button>
                <button onClick={() => handleUpdateBadge(editingUser.id, 'business')} className="w-full p-4 bg-slate-950 border border-amber-500/20 rounded-2xl flex items-center justify-between group hover:border-amber-500/50">
                  <div className="text-left"><p className="font-bold text-amber-400">Verified Business</p><p className="text-[10px] text-slate-500">Registered commercial entity</p></div>
                  <Award className="w-5 h-5 text-amber-400" />
                </button>
                <button onClick={() => handleUpdateBadge(editingUser.id, 'premium')} className="w-full p-4 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-2xl flex items-center justify-between group hover:border-purple-400">
                  <div className="text-left"><p className="font-bold text-purple-300">Premium Partner</p><p className="text-[10px] text-slate-400">Paid advertiser / Trusted VIP</p></div>
                  <Check className="w-5 h-5 text-purple-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
};

export default AdminDashboard;