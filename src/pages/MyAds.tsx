import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import EditListingModal from '../components/EditListingModal';
import PromoteModal from '../components/PromoteModal';
import VerificationModal from '../components/VerificationModal';
import SoldConfirmationModal from '../components/SoldConfirmationModal';
import AdAnalyticsModal from '../components/AdAnalyticsModal';
import TransactionReceiptModal from '../components/TransactionReceiptModal';
import SalesReportModal from '../components/SalesReportModal';
import StorefrontFlycardModal from '../components/StorefrontFlycardModal';
import VerifiedBadge from '../components/VerifiedBadge';
import { Listing } from '../types/sealify';
import { 
  Trash2, 
  CheckCircle, 
  PlusCircle, 
  Edit3, 
  Award, 
  BarChart2, 
  Crown,
  RefreshCw,
  Eye,
  Package,
  Sparkles,
  AlertOctagon,
  Gavel,
  ShieldAlert,
  Send,
  FileText,
  FileSpreadsheet,
  QrCode,
  Share2,
  Clock,
  KeyRound,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type StatusFilter = 'all' | 'active' | 'sold' | 'featured';

const MyAds: React.FC = () => {
  const { user, logout, listings, deleteListing, markAsSold, updateListing, promoteListing, updateUser, sendMessage, verificationRequests, passwordRequests } = useSealify();
  const navigate = useNavigate();

  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [promotingListing, setPromotingListing] = useState<Listing | null>(null);
  const [analyticsListing, setAnalyticsListing] = useState<Listing | null>(null);
  const [soldPromptListing, setSoldPromptListing] = useState<Listing | null>(null);
  const [receiptListing, setReceiptListing] = useState<Listing | null>(null);
  const [flycardListing, setFlycardListing] = useState<Listing | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isSalesReportOpen, setIsSalesReportOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const myAds = listings.filter((l) => l.sellerId === user?.id);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredAds = myAds.filter((ad) => {
    if (statusFilter === 'active') return ad.status === 'active';
    if (statusFilter === 'sold') return ad.status === 'sold';
    if (statusFilter === 'featured') return ad.featured;
    return true;
  });

  const totalImpressions = myAds.reduce((acc, ad) => acc + (ad.viewsCount || 0), 0);
  const activeCount = myAds.filter((ad) => ad.status === 'active').length;
  const soldCount = myAds.filter((ad) => ad.status === 'sold').length;

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO title="My Ads & Inventory — Sealify" />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        
        {/* Profile & Summary Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-4 text-center sm:text-left">
            <img 
              src={user?.avatarUrl} 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0" 
              alt="Avatar"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">{user?.fullName}</h1>
                {user?.verified ? (
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
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-4 text-xs pt-1 font-semibold text-slate-400 justify-center sm:justify-start">
                <span>Active Ads: <strong className="text-emerald-400">{activeCount}</strong></span>
                <span>Sold: <strong className="text-teal-400">{soldCount}</strong></span>
                <span>Views: <strong className="text-amber-400">{totalImpressions}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-end w-full lg:w-auto">
            <button
              onClick={() => setIsSalesReportOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Report</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white font-bold rounded-xl text-xs border border-rose-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <Link
              to="/post-ad"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Ad</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-white">Your Classified Inventory</h2>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl">
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
             <p className="font-bold text-white text-sm">No ads found in this category.</p>
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
      
      {flycardListing && (
        <StorefrontFlycardModal
          isOpen={!!flycardListing}
          onClose={() => setFlycardListing(null)}
          title={flycardListing.title}
          price={flycardListing.price}
          location={flycardListing.location}
          image={flycardListing.images[0]}
          sellerName={user?.fullName || flycardListing.sellerName}
          sellerPhone={user?.phoneNumber || flycardListing.sellerPhone}
          verificationType={user?.verificationType || flycardListing.sellerVerificationType}
          itemUrl={`${window.location.origin}/listing/${flycardListing.id}`}
        />
      )}

      <MobileNav />
    </div>
  );
};

export default MyAds;