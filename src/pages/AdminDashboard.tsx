import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import AdminEditUserModal from '../components/AdminEditUserModal';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import PwaInstallButton from '../components/PwaInstallButton';
import { Link } from 'react-router-dom';
import { 
  Download, 
  Users, 
  Package, 
  Activity, 
  ShieldCheck, 
  Database, 
  BellRing,
  Send,
  Trash2,
  Check,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Search,
  KeyRound,
  Mail,
  CreditCard,
  MapPin,
  UserCheck,
  Siren,
  Gavel,
  Flag,
  Globe,
  SearchCode,
  Fingerprint,
  MessageCircle,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile, Listing, SafeMeetupSpotConfig } from '../types/sealify';

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
    dispatchPromotionalEmailDigest,
    exportDatabaseBackup,
    systemConfig,
    updateSystemConfig,
    siteSettings,
    updateSiteSettings,
    adminEmail,
    adminPassword,
    adminPin,
    updateAdminCredentials,
    verificationRequests,
    processVerificationRequest,
    promotionPaymentRequests,
    processPromotionPaymentRequest,
    intrusionLogs,
    safeSpots,
    addSafeSpot,
    deleteSafeSpot,
    disputeCases,
    processDisputeCase,
    reports,
    processReport,
    auditLogs
  } = useSealify();

  const PWA_DEPLOYED_URL = 'https://sealify.pages.dev';

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'requests' | 'disputes' | 'security' | 'audit' | 'settings' | 'spots' | 'broadcast' | 'credentials'>('overview');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const [newEmail, setNewEmail] = useState(adminEmail);
  const [newPassword, setNewPassword] = useState(adminPassword);
  const [newPin, setNewPin] = useState(adminPin);

  // Site Meta State
  const [metaName, setMetaName] = useState(siteSettings.siteName);
  const [metaDesc, setMetaDesc] = useState(siteSettings.siteDescription);
  const [metaPhone, setMetaPhone] = useState(siteSettings.contactPhone);
  const [metaEmail, setMetaEmail] = useState(siteSettings.contactEmail);

  // Safe Spot Form State
  const [spotName, setSpotName] = useState('');
  const [spotAddress, setSpotAddress] = useState('');
  const [spotZone, setSpotZone] = useState<'LAUTECH Area' | 'Takie / Center' | 'Sabo Market Zone' | 'Police HQ'>('LAUTECH Area');
  const [spotCategory, setSpotCategory] = useState<'Police Safe Zone' | 'Public Library' | 'Shopping Mall' | 'Café'>('Police Safe Zone');

  // Hardened Route Guard: If not an authenticated Admin with verified token signature
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">
        <SEO title="Restricted Area — Admin Login Required" />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border-2 border-rose-500/40 p-8 sm:p-10 rounded-[2.5rem] space-y-6 max-w-md my-auto shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Access Restricted</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                You must log in through the official encrypted Terminal with Master Access Credentials to view this control panel.
              </p>
            </div>
            <Link 
              to="/admin/login" 
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-rose-950/50 inline-flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>AUTHENTICATE AT ADMIN TERMINAL</span>
            </Link>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  const filteredUsers = allUsers.filter(u => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredListings = listings.filter(l => l.title.toLowerCase().includes(listingSearch.toLowerCase()) || l.category.toLowerCase().includes(listingSearch.toLowerCase()));
  const filteredAudits = auditLogs.filter(log => log.action.toLowerCase().includes(auditSearch.toLowerCase()) || log.details.toLowerCase().includes(auditSearch.toLowerCase()));

  const pendingVerifications = verificationRequests.filter(v => v.status === 'pending');
  const pendingPromotions = promotionPaymentRequests.filter(p => p.status === 'pending');
  const pendingDisputes = disputeCases.filter(d => d.status !== 'resolved');
  const pendingReports = reports.filter(r => r.status === 'pending');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    broadcastMassNotification(broadcastTitle.trim(), broadcastMessage.trim());
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({ siteName: metaName, siteDescription: metaDesc, contactPhone: metaPhone, contactEmail: metaEmail });
    toast.success('Global Site Settings Updated!');
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword.trim() || newPin.length < 6) return;
    updateAdminCredentials(newEmail.trim(), newPassword.trim(), newPin.trim());
  };

  const handleAddSafeSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotName.trim() || !spotAddress.trim()) return;
    addSafeSpot({ name: spotName.trim(), address: spotAddress.trim(), zone: spotZone, category: spotCategory, distance: 'Local Hub', hours: '8:00 AM - 6:00 PM', cctvVerified: true });
    setSpotName('');
    setSpotAddress('');
    toast.success('New Verified Safe Meetup Spot added!');
  };

  const handleCopyPwaLink = () => {
    navigator.clipboard.writeText(PWA_DEPLOYED_URL);
    toast.success(`Copied PWA Link: ${PWA_DEPLOYED_URL}`);
  };

  const handleShareToWhatsAppGroup = () => {
    const text = `📲 Install the Official Sealify App for Ogbomoso & Oyo State!\n\nClick link to open & install directly to your home screen:\n${PWA_DEPLOYED_URL}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-20 font-sans">
      <SEO title="Admin Terminal — Sealify Master Control" />
      <Navbar />
      
      <main className="max-w-7xl mx-auto w-full px-4 py-8 space-y-8 flex-1">
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Sealify Master Control</h1>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">Node Ogbomoso</span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">SESSION_UID: {user?.id}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap relative z-10">
            <button onClick={() => setIsSqlModalOpen(true)} className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-emerald-400 font-bold text-xs flex items-center gap-2 transition-all">
              <Database className="w-4 h-4" />
              <span>SQL Schema</span>
            </button>
            <button onClick={exportDatabaseBackup} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95">
              <FileSpreadsheet className="w-4 h-4" />
              <span>DB Backup</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-800 pb-3">
          {[
            { id: 'overview', label: 'System Overview' },
            { id: 'users', label: `Users (${allUsers.length})` },
            { id: 'listings', label: `Ads (${listings.length})` },
            { id: 'requests', label: `Queues (${pendingVerifications.length + pendingPromotions.length})` },
            { id: 'disputes', label: `Mediation (${pendingDisputes.length + pendingReports.length})` },
            { id: 'audit', label: 'Audit Log', icon: SearchCode },
            { id: 'security', label: 'Forensics', icon: Siren },
            { id: 'settings', label: 'Site Meta', icon: Globe },
            { id: 'spots', label: 'Safe Spots' },
            { id: 'broadcast', label: 'Broadcast' },
            { id: 'credentials', label: 'Root Keys', icon: KeyRound }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 shadow-xl"><span className="text-[10px] font-black text-slate-500 uppercase">Registered Node Users</span><p className="text-3xl font-black text-white">{allUsers.length}</p></div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 shadow-xl"><span className="text-[10px] font-black text-slate-500 uppercase">Active Marketplace Ads</span><p className="text-3xl font-black text-emerald-400">{listings.length}</p></div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 shadow-xl"><span className="text-[10px] font-black text-slate-500 uppercase">Verification Queue</span><p className="text-3xl font-black text-amber-400">{pendingVerifications.length}</p></div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 shadow-xl"><span className="text-[10px] font-black text-slate-500 uppercase">Fraud Reports</span><p className="text-3xl font-black text-rose-400">{reports.length}</p></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                    <Download className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">App Distribution & PWA Hub</h2>
                    <p className="text-xs text-slate-400">Share & install Sealify directly at <strong className="text-emerald-400">https://sealify.pages.dev</strong></p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                  <span className="text-[10px] font-black uppercase text-slate-500">Official PWA URL</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-emerald-400 font-bold truncate">{PWA_DEPLOYED_URL}</span>
                    <button
                      onClick={handleCopyPwaLink}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs shrink-0 border border-slate-800"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PwaInstallButton variant="compact" className="w-full justify-center py-3.5" />
                  
                  <button 
                    onClick={handleShareToWhatsAppGroup} 
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Share on WhatsApp Group</span>
                  </button>
                </div>
              </section>

              <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
                <div className="flex items-center gap-3"><div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20"><Layers className="w-8 h-8" /></div><div><h2 className="text-xl font-black text-white">System Config</h2><p className="text-xs text-slate-400">Manage global node policies</p></div></div>
                <div className="space-y-4">
                  {[
                    { key: 'autoApproveAds', label: 'Auto Approve Classified Ads', desc: 'Allow instant publishing' },
                    { key: 'aiSpamFilter', label: 'AI Spam & Scam Shield', desc: 'Detect suspicious descriptions' }
                  ].map(cfg => (
                    <div key={cfg.key} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <div><p className="text-xs font-black text-white">{cfg.label}</p><p className="text-[10px] text-slate-500">{cfg.desc}</p></div>
                      <button onClick={() => updateSystemConfig({ [cfg.key]: !systemConfig[cfg.key as keyof typeof systemConfig] })} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${systemConfig[cfg.key as keyof typeof systemConfig] ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>{(systemConfig[cfg.key as keyof typeof systemConfig]) ? 'ACTIVE' : 'OFF'}</button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Tab: Users Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3"><Search className="w-4 h-4 text-slate-500" /><input type="text" placeholder="Search users by name or email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="bg-transparent border-none text-xs text-white focus:outline-none w-full" /></div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800 shadow-xl">
              {filteredUsers.map(u => (
                <div key={u.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={u.avatarUrl || '/logo.png'} className="w-10 h-10 rounded-xl object-cover border border-emerald-500" alt={u.fullName} />
                    <div><h4 className="font-bold text-xs text-white">{u.fullName}</h4><p className="text-[11px] text-slate-400 font-mono">{u.email} • {u.role}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingUser(u)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-xs">Edit</button>
                    <button onClick={() => { if (window.confirm(`Delete user ${u.fullName}?`)) deleteUser(u.id); }} className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Listings Management */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3"><Search className="w-4 h-4 text-slate-500" /><input type="text" placeholder="Filter listings by title or category..." value={listingSearch} onChange={(e) => setListingSearch(e.target.value)} className="bg-transparent border-none text-xs text-white focus:outline-none w-full" /></div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800 shadow-xl">
               {filteredListings.map(item => (
                 <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40">
                    <div className="flex items-center gap-3"><img src={item.images[0]} className="w-12 h-12 rounded-xl object-cover border border-slate-800" /><div className="min-w-0"><h4 className="font-bold text-xs text-white truncate max-w-xs">{item.title}</h4><p className="text-[11px] text-emerald-400 font-black">₦{item.price.toLocaleString()} • {item.category}</p></div></div>
                    <button onClick={() => { if(window.confirm('Delete ad?')) deleteListing(item.id); }} className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Tab: Verification & Promotion Queues */}
        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <span>ID & CAC Verification Queue</span>
                </h3>
                <span className="text-[10px] font-black bg-slate-950 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30">{pendingVerifications.length} Pending</span>
              </div>
              <div className="space-y-3">
                {pendingVerifications.length === 0 ? <p className="text-xs text-slate-500 italic p-4 text-center">No pending identity verification requests.</p> : pendingVerifications.map(req => (
                  <div key={req.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div><p className="font-bold text-xs text-white">{req.userName}</p><p className="text-[10px] text-slate-400 font-mono">{req.userEmail}</p></div>
                      <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{req.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono">Doc: {req.docType} ({req.docNumber})</p>
                    <div className="flex gap-2">
                      <button onClick={() => processVerificationRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Approve</button>
                      <button onClick={() => processVerificationRequest(req.id, 'rejected')} className="flex-1 py-2 bg-rose-600/20 text-rose-400 font-bold rounded-xl text-xs border border-rose-500/30">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <span>Promotions & Payment Proofs</span>
                </h3>
                <span className="text-[10px] font-black bg-slate-950 text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/30">{pendingPromotions.length} Pending</span>
              </div>
              <div className="space-y-3">
                {pendingPromotions.length === 0 ? <p className="text-xs text-slate-500 italic p-4 text-center">No pending promotion payment proofs.</p> : pendingPromotions.map(req => (
                  <div key={req.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div><p className="font-bold text-xs text-white">Ad ID: {req.listingId}</p><p className="text-xs font-black text-emerald-400">₦{req.amount.toLocaleString()} ({req.planName})</p></div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{req.paymentMethod}</span>
                    </div>
                    {req.paymentProofUrl && <p className="text-[10px] text-slate-400 truncate font-mono">Proof: {req.paymentProofUrl}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => processPromotionPaymentRequest(req.id, 'approved')} className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Approve Boost</button>
                      <button onClick={() => processPromotionPaymentRequest(req.id, 'rejected')} className="flex-1 py-2 bg-rose-600/20 text-rose-400 font-bold rounded-xl text-xs border border-rose-500/30">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Disputes & Reports */}
        {activeTab === 'disputes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
              <h3 className="font-black text-white text-base flex items-center gap-2"><Gavel className="w-5 h-5 text-rose-400" /><span>Trade Dispute Claims</span></h3>
              <div className="space-y-3">
                {disputeCases.length === 0 ? <p className="text-xs text-slate-500 italic p-4 text-center">No open trade disputes.</p> : disputeCases.map(disp => (
                  <div key={disp.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div><p className="font-bold text-xs text-white">{disp.itemTitle}</p><p className="text-[10px] text-slate-400">Claim by: {disp.userEmail} vs {disp.counterparty}</p></div>
                      <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{disp.status}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{disp.details}</p>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => processDisputeCase(disp.id, 'resolved')} className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs">Mark Resolved</button>
                      <button onClick={() => processDisputeCase(disp.id, 'in_review')} className="flex-1 py-1.5 bg-slate-800 text-amber-300 font-bold rounded-lg text-xs">Set In Review</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
              <h3 className="font-black text-white text-base flex items-center gap-2"><Flag className="w-5 h-5 text-amber-400" /><span>Reported Listings</span></h3>
              <div className="space-y-3">
                {pendingReports.length === 0 ? <p className="text-xs text-slate-500 italic p-4 text-center">No reported ads pending review.</p> : pendingReports.map(rep => (
                  <div key={rep.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-xs text-white">{rep.listingTitle}</p>
                      <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">{rep.reason}</span>
                    </div>
                    {rep.details && <p className="text-xs text-slate-400">{rep.details}</p>}
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => processReport(rep.id, 'resolve_delete_ad')} className="flex-1 py-1.5 bg-rose-600 text-white font-black rounded-lg text-xs">Remove Ad</button>
                      <button onClick={() => processReport(rep.id, 'dismiss')} className="flex-1 py-1.5 bg-slate-800 text-slate-300 font-bold rounded-lg text-xs">Dismiss Report</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Security Intrusion Forensics */}
        {activeTab === 'security' && (
          <div className="space-y-4">
             <div className="flex items-center justify-between"><h3 className="font-black text-white text-base flex items-center gap-2"><Fingerprint className="w-5 h-5 text-rose-500" /><span>Terminal Intrusion Logs</span></h3></div>
             <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl divide-y divide-slate-800 font-mono text-xs">
                {intrusionLogs.length === 0 ? <div className="p-8 text-center text-slate-500 italic">No unauthorized terminal intrusions logged.</div> : intrusionLogs.map(log => (
                  <div key={log.id} className="p-4 space-y-1 hover:bg-slate-800/40">
                     <div className="flex justify-between items-center"><span className="text-rose-400 font-black">ATTEMPT_EMAIL: {log.attemptedEmail}</span><span className="text-slate-500 text-[10px]">{log.timestamp}</span></div>
                     <p className="text-[11px] text-slate-400">{log.mediaStatus}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Tab: Safe Meetup Spots Manager */}
        {activeTab === 'spots' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
              <h3 className="font-black text-white text-base flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-400" /><span>Add Verified Safe Spot</span></h3>
              <form onSubmit={handleAddSafeSpot} className="space-y-3 text-xs">
                <div className="space-y-1"><label className="font-bold text-slate-400 uppercase">Spot Name</label><input type="text" required value={spotName} onChange={(e) => setSpotName(e.target.value)} placeholder="e.g. Takie Police Station Gate" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none" /></div>
                <div className="space-y-1"><label className="font-bold text-slate-400 uppercase">Address / Landmark</label><input type="text" required value={spotAddress} onChange={(e) => setSpotAddress(e.target.value)} placeholder="Full street address" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><label className="font-bold text-slate-400 uppercase">Zone</label><select value={spotZone} onChange={(e) => setSpotZone(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white"><option value="LAUTECH Area">LAUTECH Area</option><option value="Takie / Center">Takie / Center</option><option value="Sabo Market Zone">Sabo Market Zone</option><option value="Police HQ">Police HQ</option></select></div>
                  <div className="space-y-1"><label className="font-bold text-slate-400 uppercase">Category</label><select value={spotCategory} onChange={(e) => setSpotCategory(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white"><option value="Police Safe Zone">Police Safe Zone</option><option value="Public Library">Public Library</option><option value="Shopping Mall">Shopping Mall</option><option value="Café">Café</option></select></div>
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-2">Publish Safe Spot</button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
              <h3 className="font-black text-white text-base">Active Safe Meetup Spots ({safeSpots.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {safeSpots.map(s => (
                  <div key={s.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div><p className="font-bold text-white">{s.name}</p><p className="text-[10px] text-slate-400">{s.zone} • {s.address}</p></div>
                    <button onClick={() => deleteSafeSpot(s.id)} className="p-1.5 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Filter audit trail by action or user..." value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} className="bg-transparent border-none text-xs text-white focus:outline-none w-full" />
             </div>
             <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800">
                {filteredAudits.length === 0 ? <div className="p-8 text-center text-slate-500 text-xs italic">No matching audit logs found.</div> : filteredAudits.map(log => (
                  <div key={log.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${log.type === 'security' ? 'bg-rose-500/10 text-rose-400' : log.type === 'finance' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}><Activity className="w-4 h-4" /></div>
                        <div><p className="text-xs font-black text-white uppercase">{log.action}</p><p className="text-[11px] text-slate-400">{log.details}</p></div>
                     </div>
                     <span className="text-[10px] font-mono text-slate-600 shrink-0">{log.createdAt}</span>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Tab: Site Meta Settings */}
        {activeTab === 'settings' && (
          <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl max-w-2xl mx-auto space-y-6">
             <div className="flex items-center gap-3"><div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20"><Globe className="w-8 h-8" /></div><div><h2 className="text-xl font-black text-white uppercase">Site Metadata Manager</h2><p className="text-xs text-slate-400">Update global marketplace branding</p></div></div>
             <form onSubmit={handleSaveMeta} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-1"><label className="font-bold uppercase text-slate-500 tracking-wider">Node / Site Name</label><input type="text" value={metaName} onChange={(e) => setMetaName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none" /></div>
                   <div className="space-y-1"><label className="font-bold uppercase text-slate-500 tracking-wider">Support Phone</label><input type="text" value={metaPhone} onChange={(e) => setMetaPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none" /></div>
                </div>
                <div className="space-y-1"><label className="font-bold uppercase text-slate-500 tracking-wider">Site Description</label><textarea rows={3} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none" /></div>
                <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest"><Check className="w-4 h-4" /> Save Meta Changes</button>
             </form>
          </section>
        )}

        {/* Tab: Broadcast & Promotional Emails */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                  <BellRing className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">System Broadcast Dispatcher</h2>
                  <p className="text-xs text-slate-400">Push notification to all Node Users</p>
                </div>
              </div>
              <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-300">Alert Headline</label>
                  <input type="text" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-300">Message Content</label>
                  <textarea rows={4} value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none" />
                </div>
                <button type="submit" className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> DISPATCH BROADCAST
                </button>
              </form>
            </section>

            {/* Promotional Digest Mailer */}
            <section className="bg-slate-900 border border-emerald-500/30 p-8 rounded-[2.5rem] shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <Mail className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Promotional Email Digest</h2>
                  <p className="text-xs text-slate-400">Send periodic updates about new admin-approved promotional ads to all user emails</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Clicking below compiles top-performing and promoted ads across Ogbomoso and dispatches a newsletter update directly to all registered user accounts ({allUsers.length} recipients).
              </p>
              <button 
                onClick={dispatchPromotionalEmailDigest}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>DISPATCH PROMOTIONAL AD DIGEST TO ALL USERS ({allUsers.length})</span>
              </button>
            </section>
          </div>
        )}

        {/* Tab: Root Credentials */}
        {activeTab === 'credentials' && (
          <section className="bg-slate-900 border-2 border-rose-500/30 p-8 rounded-[2.5rem] shadow-2xl max-w-2xl mx-auto space-y-6 font-mono">
            <div className="flex items-center gap-3"><div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/30"><KeyRound className="w-8 h-8" /></div><div><h2 className="text-xl font-black text-white uppercase">Root Credentials Manager</h2><p className="text-xs text-slate-400 font-sans">Overwrite official admin terminal keys</p></div></div>
            <form onSubmit={handleSaveCredentials} className="space-y-5 text-xs font-sans">
              <div className="space-y-1"><label className="font-bold uppercase text-[10px] text-slate-500">Official Email ID</label><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono" /></div>
              <div className="space-y-1"><label className="font-bold uppercase text-[10px] text-slate-500">Access Key (Password)</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono" /></div>
              <div className="space-y-1"><label className="font-bold uppercase text-[10px] text-slate-500">Master PIN (6 Digits)</label><input type="text" maxLength={6} value={newPin} onChange={(e) => setNewPin(e.target.value)} className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-4 py-2.5 text-rose-400 font-black tracking-widest" /></div>
              <button type="submit" className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl">Save & Overwrite Official Credentials</button>
            </form>
          </section>
        )}

      </main>

      <AdminEditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(id, updated) => updateUser(id, updated)} />
      <SqlSchemaViewer isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;