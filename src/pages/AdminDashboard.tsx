import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { usePwaInstall } from '../hooks/usePwaInstall';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import AdminEditUserModal from '../components/AdminEditUserModal';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import { 
  Download, 
  Users, 
  Package, 
  Activity, 
  Share2, 
  ShieldCheck, 
  Database, 
  BellRing,
  Send,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Lock,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile, Listing } from '../types/sealify';

const AdminDashboard: React.FC = () => {
  const { 
    user, 
    isAdmin, 
    listings, 
    allUsers, 
    updateUser, 
    deleteUser, 
    deleteListing, 
    broadcastMassNotification,
    exportDatabaseBackup,
    systemConfig,
    updateSystemConfig
  } = useSealify();
  
  const { isInstallable, install } = usePwaInstall();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'broadcast'>('overview');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <SEO title="Unauthorized — Sealify" />
        <Navbar />
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-4 max-w-md my-auto">
          <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-white">Access Denied</h2>
          <p className="text-xs text-slate-400">You must hold Administrator credentials to open this terminal.</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(listingSearch.toLowerCase()) || 
    l.category.toLowerCase().includes(listingSearch.toLowerCase())
  );

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error('Please fill both title and message for broadcast');
      return;
    }
    broadcastMassNotification(broadcastTitle.trim(), broadcastMessage.trim());
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-20 font-sans">
      <SEO title="Admin Terminal — Sealify Master Control" />
      <Navbar />
      
      <main className="max-w-7xl mx-auto w-full px-4 py-8 space-y-8 flex-1">
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Sealify Master Control</h1>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Ogbomoso Node Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">AUTHENTICATED_SESSION: {user?.email}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => setIsSqlModalOpen(true)} 
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-emerald-400 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Database className="w-4 h-4" />
              <span>SQL Schema</span>
            </button>

            <button 
              onClick={exportDatabaseBackup} 
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export DB Backup</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'overview' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            System Health & App Distro
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'users' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            User Records ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'listings' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Listings Management ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'broadcast' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Mass Push Broadcast
          </button>
        </div>

        {/* Tab 1: System Health & App Distro */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registered Merchants</span>
                <p className="text-3xl font-black text-white">{allUsers.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Ads in Feed</span>
                <p className="text-3xl font-black text-emerald-400">{listings.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Node Uptime</span>
                <p className="text-3xl font-black text-blue-400">99.9%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* App Distribution Utility */}
              <section className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                    <Download className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">PWA App Distribution Utility</h2>
                    <p className="text-xs text-slate-400">Promote app installation across community groups</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Easily install Sealify on your test device or copy the direct distribution link to post in official WhatsApp community groups.
                </p>
                
                <div className="space-y-3">
                  {isInstallable && (
                    <button 
                      onClick={install} 
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl transition-transform active:scale-95 text-xs"
                    >
                      INSTALL ON THIS DEVICE
                    </button>
                  )}
                  
                  <button 
                    onClick={() => { 
                      navigator.clipboard.writeText(window.location.origin); 
                      toast.success('PWA App Link copied to clipboard!'); 
                    }} 
                    className="w-full py-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-black rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>COPY SHAREABLE APP LINK FOR WHATSAPP</span>
                  </button>
                </div>
              </section>

              {/* System Config Toggles */}
              <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                    <Layers className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">System Config Controls</h2>
                    <p className="text-xs text-slate-400">Toggle node policies in real-time</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div>
                      <p className="text-xs font-black text-white">Auto Approve Classified Ads</p>
                      <p className="text-[10px] text-slate-500">Post listings instantly without queueing</p>
                    </div>
                    <button
                      onClick={() => updateSystemConfig({ autoApproveAds: !systemConfig.autoApproveAds })}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        systemConfig.autoApproveAds ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {systemConfig.autoApproveAds ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div>
                      <p className="text-xs font-black text-white">AI Spam & Scam Shield</p>
                      <p className="text-[10px] text-slate-500">Filter suspected spam descriptions</p>
                    </div>
                    <button
                      onClick={() => updateSystemConfig({ aiSpamFilter: !systemConfig.aiSpamFilter })}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        systemConfig.aiSpamFilter ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {systemConfig.aiSpamFilter ? 'ENABLED' : 'OFF'}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-3">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.fullName} className="w-10 h-10 rounded-xl object-cover border border-emerald-500" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                        <Users className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-white">{u.fullName}</h4>
                        {u.verified && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.2 rounded font-black">VERIFIED</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">{u.email} • {u.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Record</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete user ${u.fullName}?`)) deleteUser(u.id);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Listings Management */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search listings by title..."
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800">
              {filteredListings.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-3">
                    <img src={item.images[0]} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-950" />
                    <div>
                      <h4 className="font-bold text-xs text-white truncate max-w-xs">{item.title}</h4>
                      <p className="text-[11px] text-emerald-400 font-black">₦{item.price.toLocaleString()} • {item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/listing/${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:text-white"
                    >
                      View Ad
                    </a>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ad "${item.title}"?`)) deleteListing(item.id);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Mass Push Broadcast */}
        {activeTab === 'broadcast' && (
          <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                <BellRing className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">System Broadcast Dispatcher</h2>
                <p className="text-xs text-slate-400">Send an instant alert to all registered users on Sealify</p>
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-300">Alert Headline *</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. 🚀 Security Notice: New Safe Spots Added in Ogbomoso"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-300">Message Content *</label>
                <textarea
                  rows={4}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter details of the system announcement..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl text-xs shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>DISPATCH MASS BROADCAST TO ALL USERS</span>
              </button>
            </form>
          </section>
        )}
      </main>

      <AdminEditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={(id, updated) => updateUser(id, updated)}
      />

      <SqlSchemaViewer
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      <MobileNav />
    </div>
  );
};

export default AdminDashboard;