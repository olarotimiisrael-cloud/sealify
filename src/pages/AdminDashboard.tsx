import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import { UserProfile, VerificationBadgeType, Listing, PasswordChangeRequest, VerificationRequest } from '../types/sealify';
import { 
  Shield, Package, Activity, Layers, RefreshCw, LayoutGrid, Edit3, Trash2,
  Users, MousePointer2, Globe, Clock, Terminal, CheckCircle2, AlertCircle,
  Search, ShieldCheck, Mail, Phone, MapPin, Award, Check, X, Tag, Eye,
  KeyRound, Lock, FileText, ExternalLink, Zap, Crown, Database
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, categories, addCategory, deleteCategory, analytics, listings, allUsers, updateUser, deleteUser, updateListing, deleteListing, t,
    passwordRequests, processPasswordRequest, verificationRequests, processVerificationRequest
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'listings' | 'approvals'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [adSearch, setAdSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAds = listings.filter(l => 
    l.title.toLowerCase().includes(adSearch.toLowerCase()) || 
    l.sellerName.toLowerCase().includes(adSearch.toLowerCase())
  );

  const pendingPW = passwordRequests.filter(r => r.status === 'pending');
  const pendingVerif = verificationRequests.filter(r => r.status === 'pending');
  const promotedAds = listings.filter(l => l.featured);

  const handleUpdateBadge = (userId: string, type: VerificationBadgeType) => {
    updateUser(userId, { 
      verificationType: type, 
      verified: type !== 'none' 
    });
    toast.success(`Badge updated to ${type.toUpperCase()}`);
    setEditingUser(null);
  };

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
        <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black">Security Terminal</h1>
                <button
                  onClick={() => setIsSqlModalOpen(true)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-emerald-400 text-[10px] font-black rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                  title="View Supabase Database Migration Schema"
                >
                  <Database className="w-3 h-3" />
                  <span>SQL Migration</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">Monitoring {listings.length} ads & {allUsers.length} active nodes</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>ANALYTICS</button>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'users' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>USERS</button>
            <button onClick={() => setActiveTab('listings')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'listings' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>ADS & PROMOTIONS</button>
            <button onClick={() => setActiveTab('approvals')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all relative ${activeTab === 'approvals' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              APPROVALS
              {(pendingPW.length + pendingVerif.length) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingPW.length + pendingVerif.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content: Approvals (PW & Verification) */}
        {activeTab === 'approvals' && (
          <div className="space-y-10">
            {/* 1. Verification Badge Requests */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black">Verification Badge Requests</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{pendingVerif.length} identity reviews pending</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verificationRequests.map((req) => (
                  <div key={req.id} className={`bg-slate-900 border p-5 rounded-3xl space-y-4 shadow-xl ${
                    req.status === 'pending' ? 'border-emerald-500/30 ring-1 ring-emerald-500/10' : 'border-slate-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={req.docUrl} className="w-12 h-12 rounded-xl object-cover border border-slate-800 hover:scale-150 transition-transform cursor-zoom-in" />
                        <div>
                          <h4 className="font-bold text-sm text-white">{req.userName}</h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            req.type === 'premium' ? 'bg-purple-600 text-white' : 
                            req.type === 'business' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                          }`}>
                            {req.type} Apply
                          </span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase ${req.status === 'pending' ? 'text-amber-400' : 'text-slate-500'}`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-2xl text-[11px] space-y-1.5">
                      <p className="text-slate-400 truncate">Doc: <strong className="text-white">{req.docType}</strong></p>
                      <p className="text-slate-400">ID: <strong className="text-white font-mono">{req.docNumber}</strong></p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => processVerificationRequest(req.id, 'rejected')} className="flex-1 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 font-bold rounded-xl text-[10px]">REJECT</button>
                        <button onClick={() => processVerificationRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px]">ISSUE BADGE</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Password Reset Requests */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black">Secure Password Resets</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{pendingPW.length} pending NIN authentication</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {passwordRequests.map((req) => (
                  <div key={req.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                       <img src={req.idDocumentUrl} className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                       <div className="min-w-0">
                         <h4 className="font-bold text-sm text-white truncate">{req.userName}</h4>
                         <p className="text-[10px] text-slate-500 truncate">{req.userEmail}</p>
                       </div>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-2xl text-[11px] space-y-1.5">
                      <p className="text-slate-400">NIN: <strong className="text-emerald-400 font-mono">{req.nin}</strong></p>
                      <p className="text-slate-400">Reason: <strong className="text-white italic">"{req.reason}"</strong></p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => processPasswordRequest(req.id, 'declined')} className="flex-1 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 font-bold rounded-xl text-[10px]">DECLINE</button>
                        <button onClick={() => processPasswordRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px]">APPROVE NEW PW</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Analytics */}
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

        {/* Tab Content: Listings & Promotions */}
        {activeTab === 'listings' && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Active Promotions ({promotedAds.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {promotedAds.map(ad => (
                  <div key={ad.id} className="bg-slate-950 border border-amber-500/30 p-4 rounded-2xl space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2"><Crown className="w-4 h-4 text-amber-400 opacity-20 group-hover:opacity-100 transition-opacity" /></div>
                    <div className="flex items-center gap-2">
                      <img src={ad.images[0]} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{ad.title}</p>
                        <p className="text-[9px] text-amber-400 font-black uppercase">{ad.promotionPlanName}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-800">
                      <span>Expires in {ad.promotionDurationMonths} mo</span>
                      <button onClick={() => updateListing(ad.id, { featured: false })} className="text-red-400 hover:underline">REVOKE</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Classified Ad</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Seller / Vendor</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400">Metrics</th>
                      <th className="px-6 py-4 font-black uppercase text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredAds.map((ad) => (
                      <tr key={ad.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={ad.images[0]} className="w-12 h-10 rounded-lg object-cover border border-slate-700" />
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">{ad.title}</p>
                              <p className="text-[10px] text-emerald-400 font-black">{formatNGN(ad.price)} • {ad.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-300">{ad.sellerName}</span>
                            {ad.sellerVerified && <VerifiedBadge type={ad.sellerVerificationType || 'individual'} />}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">{ad.location}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-slate-400" /><span className="font-bold">{ad.viewsCount}</span></div>
                            {ad.featured && <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[9px] font-black uppercase border border-amber-500/20">Featured</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/listing/${ad.id}`} className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl transition-all"><Eye className="w-4 h-4" /></Link>
                            <button onClick={() => deleteListing(ad.id)} className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
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

        {/* Badge Alignment Modal (Users Tab) */}
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

      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;