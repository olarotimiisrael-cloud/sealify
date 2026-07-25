import React, { useState, useRef } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import EditListingModal from '../components/EditListingModal';
import PromoteModal from '../components/PromoteModal';
import VerificationModal from '../components/VerificationModal';
import SalesReportModal from '../components/SalesReportModal';
import StorefrontFlycardModal from '../components/StorefrontFlycardModal';
import AdAnalyticsModal from '../components/AdAnalyticsModal';
import VerifiedBadge from '../components/VerifiedBadge';
import { Listing } from '../types/sealify';
import { 
  Trash2, 
  PlusCircle, 
  Edit3, 
  Award, 
  Crown,
  RefreshCw,
  Eye,
  Package,
  FileSpreadsheet,
  Share2,
  Camera,
  LogOut,
  User,
  Wallet as WalletIcon,
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Database,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type StatusFilter = 'all' | 'active' | 'sold' | 'featured';

const MyAds: React.FC = () => {
  const { 
    user, 
    logout, 
    listings, 
    deleteListing, 
    updateListing, 
    promoteListing, 
    updateUser, 
    wallet,
    verificationRequests,
    isSyncing,
    lastSyncTime,
    syncDatabase
  } = useSealify();
  
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [promotingListing, setPromotingListing] = useState<Listing | null>(null);
  const [flycardListing, setFlycardListing] = useState<Listing | null>(null);
  const [analyticsListing, setAnalyticsListing] = useState<Listing | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isSalesReportOpen, setIsSalesReportOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const myAds = listings.filter((l) => l.sellerId === user?.id);
  const myVerificationReq = verificationRequests.find(r => r.userId === user?.id);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newAvatarUrl = event.target.result as string;
        updateUser(user.id, { avatarUrl: newAvatarUrl });
        toast.success('🎉 Profile picture updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredAds = myAds.filter((ad) => {
    if (statusFilter === 'active' && ad.status !== 'active') return false;
    if (statusFilter === 'sold' && ad.status !== 'sold') return false;
    if (statusFilter === 'featured' && !ad.featured) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return ad.title.toLowerCase().includes(q) || ad.category.toLowerCase().includes(q);
    }
    return true;
  });

  const totalImpressions = myAds.reduce((acc, ad) => acc + (ad.viewsCount || 0), 0);
  const activeCount = myAds.filter((ad) => ad.status === 'active').length;
  const soldCount = myAds.filter((ad) => ad.status === 'sold').length;
  const totalInventoryValuation = myAds.reduce((acc, ad) => acc + (ad.status === 'active' ? ad.price : 0), 0);

  const handleBumpAd = (ad: Listing) => {
    updateListing(ad.id, { createdAt: 'Just now' });
    toast.success(`⚡ "${ad.title}" has been bumped to the top of category feeds!`);
  };

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-16 md:pb-0 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <SEO title="My Ads & Inventory — Sealify" />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        
        {/* Sync Status Banner */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-slate-300">Database Sync Status:</span>
            <span className="text-emerald-400 font-mono text-[11px]">{isSyncing ? 'Synchronizing...' : `Connected (Synced ${lastSyncTime})`}</span>
          </div>

          <button
            onClick={() => syncDatabase()}
            disabled={isSyncing}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Profile & Summary Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative group shrink-0">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-emerald-500 shadow-xl bg-slate-950" 
                  alt="Avatar"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-2 border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-500 shadow-xl">
                  <User className="w-8 h-8 sm:w-10 sm:h-10" />
                  <span className="text-[8px] font-extrabold uppercase mt-0.5">No Photo</span>
                </div>
              )}
              <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-slate-950 rounded-xl shadow-lg font-black hover:scale-110 transition-transform"
                title="Change Profile Picture"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{user.fullName}</h1>
                {user.verified ? (
                  <VerifiedBadge type={user.verificationType || 'individual'} showText />
                ) : (
                  <button
                    onClick={() => setIsVerificationOpen(true)}
                    className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Get Verified Badge</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
              <div className="flex items-center gap-4 text-xs pt-1 font-semibold text-slate-400 justify-center sm:justify-start flex-wrap">
                <span>Active Ads: <strong className="text-emerald-400 font-black">{activeCount}</strong></span>
                <span>Sold: <strong className="text-teal-400 font-black">{soldCount}</strong></span>
                <span>Valuation: <strong className="text-amber-400 font-black">{formatNGN(totalInventoryValuation)}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-end w-full lg:w-auto relative z-10">
            {/* Wallet Quick Access */}
            <Link 
              to="/wallet"
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl hover:bg-emerald-500/20 transition-all group"
            >
              <WalletIcon className="w-4 h-4" />
              <div className="text-left">
                <p className="text-[8px] font-black uppercase leading-none opacity-60">Balance</p>
                <p className="text-sm font-black leading-tight">{formatNGN(wallet?.balance || 0)}</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-1 opacity-40 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <button
              onClick={() => setIsSalesReportOpen(true)}
              className="flex items-center gap-1.5 px-4 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-2xl text-xs border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Report</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-3 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white font-bold rounded-2xl text-xs border border-rose-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <Link
              to="/post-ad"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Ad</span>
            </Link>
          </div>
        </div>

        {/* Verification Tracker */}
        {myVerificationReq && !user.verified && (
          <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-xl animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${myVerificationReq.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : myVerificationReq.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                  {myVerificationReq.status === 'pending' ? <Clock className="w-5 h-5" /> : myVerificationReq.status === 'rejected' ? <XCircle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    Verification Status: {myVerificationReq.status.toUpperCase()}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {myVerificationReq.status === 'pending' 
                      ? 'Our team is currently reviewing your documents. ETA: 24-48 hours.' 
                      : myVerificationReq.status === 'rejected' 
                      ? 'Application declined. Please check your email for details or re-apply.'
                      : 'Congratulations! Your official verification badge is now active.'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Type: {myVerificationReq.type}</span>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">REQ_ID: {myVerificationReq.id.slice(-6)}</span>
              </div>
            </div>
          </section>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search your inventory by ad title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl shrink-0">
            {(['all', 'active', 'sold', 'featured'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                  statusFilter === f ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredAds.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs my-8 space-y-4 shadow-xl">
             <Package className="w-12 h-12 text-slate-700 mx-auto" />
             <div className="space-y-1">
                <p className="font-bold text-white text-sm">No ads found matching your search.</p>
                <p className="text-slate-500 max-w-xs mx-auto">Publish your first ad today and reach thousands of buyers in Ogbomoso!</p>
             </div>
             <Link to="/post-ad" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">
                <PlusCircle className="w-4 h-4" />
                <span>Create New Listing</span>
             </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all shadow-md"
              >
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className="relative shrink-0">
                    <img 
                      src={ad.images[0]} 
                      alt={ad.title} 
                      className="w-20 h-20 rounded-xl object-cover bg-slate-950 border border-slate-800" 
                    />
                    {ad.featured && (
                      <div className="absolute -top-1.5 -left-1.5 bg-amber-500 p-1 rounded-md shadow">
                        <Crown className="w-3 h-3 text-slate-950 fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-xs">{ad.title}</h3>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-extrabold text-emerald-400">{formatNGN(ad.price)}</span>
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Eye className="w-3 h-3 text-slate-500" />
                        {ad.viewsCount} views
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <button onClick={() => setAnalyticsListing(ad)} className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-blue-400 font-bold rounded-xl text-xs border border-slate-700 transition-colors">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Stats</span>
                  </button>

                  <button onClick={() => setFlycardListing(ad)} className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold rounded-xl text-xs border border-slate-700 transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Flyer</span>
                  </button>

                  {ad.status === 'active' && (
                    <>
                      <button onClick={() => handleBumpAd(ad)} className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold rounded-xl text-xs border border-slate-700 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Bump</span>
                      </button>

                      <button onClick={() => setEditingListing(ad)} className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button onClick={() => setPromotingListing(ad)} className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black rounded-xl text-xs shadow-lg">
                        <Crown className="w-3.5 h-3.5 text-amber-300" />
                        <span>Promote</span>
                      </button>
                    </>
                  )}

                  <button onClick={() => deleteListing(ad.id)} className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <EditListingModal isOpen={!!editingListing} onClose={() => setEditingListing(null)} listing={editingListing} onSave={updateListing} />
      <PromoteModal isOpen={!!promotingListing} onClose={() => setPromotingListing(null)} listing={promotingListing} onPromoteSuccess={(id, dur, plan) => promoteListing(id, dur, plan)} />
      <VerificationModal isOpen={isVerificationOpen} onClose={() => setIsVerificationOpen(false)} />
      <SalesReportModal isOpen={isSalesReportOpen} onClose={() => setIsSalesReportOpen(false)} userListings={myAds} />
      <AdAnalyticsModal isOpen={!!analyticsListing} onClose={() => setAnalyticsListing(null)} listing={analyticsListing} />
      
      {flycardListing && (
        <StorefrontFlycardModal
          isOpen={!!flycardListing}
          onClose={() => setFlycardListing(null)}
          title={flycardListing.title}
          price={flycardListing.price}
          location={flycardListing.location}
          image={flycardListing.images[0]}
          sellerName={user.fullName}
          sellerPhone={user.phoneNumber}
          verificationType={user.verificationType}
          itemUrl={`${window.location.origin}/listing/${flycardListing.id}`}
        />
      )}

      <MobileNav />
    </div>
  );
};

export default MyAds;