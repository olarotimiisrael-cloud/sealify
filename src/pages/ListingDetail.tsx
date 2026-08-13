import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import { useListing, useUpdateListing, useDeleteListing } from '../lib/api-client';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import ListingCard from '../components/ListingCard';
import PriceHistoryChart from '../components/PriceHistoryChart';
import PriceGuard from '../components/PriceGuard';
import VerifiedBadge from '../components/VerifiedBadge';
import TrustScore from '../components/TrustScore';
import AuthModal from '../components/AuthModal';
import ReportModal from '../components/ReportModal';
import OfferModal from '../components/OfferModal';
import SwapProposalModal from '../components/SwapProposalModal';
import ShareQrModal from '../components/ShareQrModal';
import SafeMeetupModal from '../components/SafeMeetupModal';
import DeliveryEstimatorModal from '../components/DeliveryEstimatorModal';
import InspectionChecklistModal from '../components/InspectionChecklistModal';
import LightboxModal from '../components/LightboxModal';
import DealQrScannerModal from '../components/DealQrScannerModal';
import AiVoiceOverviewModal from '../components/AiVoiceOverviewModal';
import PriceDropAlertModal from '../components/PriceDropAlertModal';
import StorefrontFlycardModal from '../components/StorefrontFlycardModal';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Volume2,
  ArrowRightLeft,
  Bell,
  Share2,
  Truck,
  CheckSquare,
  Shield,
  Heart,
  Maximize2,
  Video,
  MapPin,
  Calendar,
  Eye,
  Sliders,
  Tag,
  ShieldAlert,
  ExternalLink,
  Phone,
  MessageCircle,
  MessageSquare,
  Settings,
  Trash2,
  Sparkles,
} from 'lucide-react';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    user, 
    isAuthenticated, 
    sendMessage, 
    addRecentlyViewed,
    toggleSaveListing, 
    isSaved,
    sealDeal,
    t
  } = useSealify();
  
  // Use real API for listing data
  const { data: listingData, isLoading, error, refetch } = useListing(id || '');
  const listing = listingData?.listing;
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isMeetupOpen, setIsMeetupOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isFlyerOpen, setIsFlyerOpen] = useState(false);
  const [isVoiceTourOpen, setIsVoiceTourOpen] = useState(false);
  const [isPriceDropOpen, setIsPriceDropOpen] = useState(false);
  const [isDealScannerOpen, setIsDealScannerOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('Hi, is this item still available?');
  const [viewMode, setViewMode] = useState<'image' | 'video'>('image');

  // Real API mutations
  const updateListingMutation = useUpdateListing();
  const deleteListingMutation = useDeleteListing();

  useEffect(() => {
    if (listing?.id) {
      addRecentlyViewed(listing.id);
    }
  }, [listing?.id, addRecentlyViewed]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
        <SEO title="Loading..." />
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
        <SEO title="Listing Not Found" />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-xl space-y-4">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Listing Not Found</h2>
            <p className="text-xs text-slate-400">The listing you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs">
              <ArrowRight className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  const relatedListings = []; // Would fetch from API in real implementation

  const saved = isSaved(listing.id);

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formattedPrice = formatNGN(listing.price);

  const whatsappUrl = `https://wa.me/${listing.sellerPhone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(
    `Hello, I am interested in your item on Sealify: "${listing.title}" (${formattedPrice})`
  )}`;

  const handleStartChat = () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    sendMessage(listing.id, listing.sellerId, chatMessage);
    navigate('/messages');
  };

  const handleSendOfferFromModal = (offerPrice: number, offerMsg: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    sendMessage(listing.id, listing.sellerId, offerMsg);
    toast.success(`Price offer sent to ${listing.sellerName}!`);
    navigate('/messages');
  };

  const handleSendSwapFromModal = (swapMsg: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    sendMessage(listing.id, listing.sellerId, swapMsg);
    toast.success(`Swap deal proposal sent to ${listing.sellerName}!`);
    navigate('/messages');
  };

  const handleSelectMeetupSpot = (spotName: string, spotAddress: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    const meetupProposal = `📍 PROPOSED SAFE MEETUP LOCATION:\n${spotName}\n${spotAddress}`;
    sendMessage(listing.id, listing.sellerId, meetupProposal);
    toast.success(`Proposed meetup location sent to seller chat!`);
    navigate('/messages');
  };

  const handleSendEstimateToChat = (estimateMsg: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    sendMessage(listing.id, listing.sellerId, estimateMsg);
    toast.success(`Delivery dispatch rate proposal sent to chat!`);
    navigate('/messages');
  };

  const handleSendInspectionReport = (reportMsg: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    sendMessage(listing.id, listing.sellerId, reportMsg);
    toast.success(`Inspection report shared to seller chat!`);
    navigate('/messages');
  };

  const handleDealSealedInChat = (receiptMsg: string) => {
    sendMessage(listing.id, listing.sellerId, receiptMsg);
  };

  const handleDeleteListing = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteListingMutation.mutateAsync(listing.id);
      toast.success('Listing deleted');
      navigate('/my-ads');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete listing');
    }
  };

  const handleMarkAsSold = async () => {
    try {
      await updateListingMutation.mutateAsync({ id: listing.id, data: { status: 'sold' } });
      toast.success('Listing marked as sold!');
      sealDeal(listing.title, listing.sellerName, listing.price);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark as sold');
    }
  };

  const hasSpecs = listing.specifications && Object.keys(listing.specifications).length > 0;
  const isOwner = user?.id === listing.sellerId;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-28 md:pb-0 font-sans">
      <SEO 
        title={`${listing.title} — ${formattedPrice}`} 
        description={listing.description}
        image={listing.images?.[0]}
        type="article"
      />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        <div className="flex items-center justify-end flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsDealScannerOpen(true)}
              className="p-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5 text-xs font-black shadow-lg rounded-xl hover:scale-105 transition-all"
              title="Verify In-Person Handover QR or PIN Code"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify Handover PIN</span>
            </button>

            <button
              onClick={() => setIsVoiceTourOpen(true)}
              className="p-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 hover:text-white flex items-center gap-1.5 text-xs font-black shadow-lg hover:scale-105 transition-all"
              title="Listen to AI Spoken Audio Briefing"
            >
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span>AI Voice Tour</span>
            </button>

            <button
              onClick={() => setIsSwapOpen(true)}
              className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 hover:text-white flex items-center gap-1 text-xs font-black shadow-lg hover:scale-105 transition-all"
              title="Propose Item Trade-In or Swap"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Swap / Trade-In</span>
            </button>

            <button
              onClick={() => setIsPriceDropOpen(true)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 hover:text-white flex items-center gap-1 text-xs font-bold shadow-lg"
              title="Set Target Price Drop Alert"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Price Watch</span>
            </button>

            <button
              onClick={() => setIsFlyerOpen(true)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-amber-400 hover:text-white flex items-center gap-1 text-xs font-bold shadow-lg"
              title="Generate Social Promo Card"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Social Promo Card</span>
            </button>

            <button
              onClick={() => setIsDeliveryOpen(true)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 hover:text-white flex items-center gap-1 text-xs font-bold shadow-lg"
            >
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Dispatch Rates</span>
            </button>

            <button
              onClick={() => setIsInspectionOpen(true)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-purple-400 hover:text-white flex items-center gap-1 text-xs font-bold"
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Checklist</span>
            </button>

            <button
              onClick={() => setIsMeetupOpen(true)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-teal-400 hover:text-white flex items-center gap-1 text-xs font-bold"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Safe Meetup</span>
            </button>

            <button
              onClick={() => toggleSaveListing(listing.id)}
              className={`p-2 border rounded-xl transition-colors ${
                saved
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-3 space-y-3 relative group">
              <div className="relative aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center">
                {viewMode === 'video' && listing.videoUrl ? (
                  <video src={listing.videoUrl} className="w-full h-full bg-black object-contain" controls />
                ) : (
                  <img
                    src={listing.images?.[activeImageIndex] || listing.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'}
                    alt={listing.title}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                )}
                
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute top-3 right-3 p-2 bg-slate-950/80 text-white rounded-xl backdrop-blur-md"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 items-center">
                {listing.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setViewMode('image'); setActiveImageIndex(idx); }}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${activeImageIndex === idx ? 'border-emerald-500 scale-105' : 'border-slate-800'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
                {listing.videoUrl && (
                  <button
                    onClick={() => setViewMode('video')}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 flex items-center justify-center bg-slate-800 ${viewMode === 'video' ? 'border-purple-500' : 'border-slate-800'}`}
                  >
                    <Video className="w-6 h-6 text-purple-400" />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    {listing.category}
                  </span>
                  <h1 className="text-2xl font-black text-white mt-2 leading-tight">{listing.title}</h1>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {listing.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {listing.createdAt}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-500" /> {listing.viewsCount} views</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-3xl font-black text-emerald-400">{formatNGN(listing.price)}</p>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">{listing.condition}</p>
                </div>
              </div>

              {hasSpecs && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    <span>Technical Specifications</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    {Object.entries(listing.specifications!).map(([key, val]) => (
                      <div key={key} className="bg-slate-900 border border-slate-800/80 p-2.5 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">{key}</span>
                        <span className="font-extrabold text-white truncate block">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Item Description</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsOfferOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 hover:underline bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30"
                  >
                    <Tag className="w-4 h-4" />
                    <span>Make Price Offer</span>
                  </button>

                  <button
                    onClick={() => setIsSwapOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 hover:underline bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Propose Item Swap</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Report Ad</span>
                </button>
              </div>
            </div>

            {/* Price History Chart Component */}
            <PriceHistoryChart currentPrice={listing.price} />
          </div>

          <div className="space-y-6">
            <PriceGuard price={listing.price} category={listing.category} location={listing.location} />

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seller Information</h3>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={listing.sellerAvatar || '/logo.png'} className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500" alt={listing.sellerName} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-white text-base">{listing.sellerName}</h4>
                      {listing.sellerVerified && <VerifiedBadge type="individual" />}
                    </div>
                    <p className="text-[11px] text-slate-500">Member since 2023</p>
                  </div>
                </div>
                <Link to={`/seller/${listing.sellerId}`} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300"><ExternalLink className="w-4 h-4" /></Link>
              </div>

              <TrustScore score={98} responseTime="< 2 hours" verified={listing.sellerVerified} salesCount={12} />

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="py-3 bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{showPhone ? listing.sellerPhone : 'Show Phone'}</span>
                  </button>

                  <a
                    href={`https://wa.me/${listing.sellerPhone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(`Hello ${listing.sellerName}, I saw your ad on Sealify: "${listing.title}" (${formatNGN(listing.price)})`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <textarea
                    rows={2}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={handleStartChat}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Start Live Chat</span>
                  </button>
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" />
                  <span>Owner Actions</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => updateListingMutation.mutate({ id: listing.id, data: { status: listing.status === 'active' ? 'sold' : 'active' } })}
                    className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{listing.status === 'active' ? 'Mark as Sold' : 'Relist'}</span>
                  </button>

                  <button
                    onClick={handleDeleteListing}
                    className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Listing</span>
                  </button>

                  <button
                    onClick={() => setIsFlyerOpen(true)}
                    className="py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Generate Promo Card</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {relatedListings.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Similar Ads in {listing.category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {relatedListings.map((rel) => (
                  <ListingCard key={rel.id} listing={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} listingTitle={listing.title} listingId={listing.id} />
      <OfferModal isOpen={isOfferOpen} onClose={() => setIsOfferOpen(false)} listingTitle={listing.title} originalPrice={listing.price} onSendOffer={handleSendOfferFromModal} />
      <SwapProposalModal isOpen={isSwapOpen} onClose={() => setIsSwapOpen(false)} targetItemTitle={listing.title} targetItemPrice={listing.price} sellerName={listing.sellerName} onSendSwapToChat={handleSendSwapFromModal} />
      <ShareQrModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} listingTitle={listing.title} listingPrice={listing.price} listingUrl={window.location.href} />
      <SafeMeetupModal isOpen={isMeetupOpen} onClose={() => setIsMeetupOpen(false)} itemTitle={listing.title} onSelectSpot={handleSelectMeetupSpot} />
      <DeliveryEstimatorModal isOpen={isDeliveryOpen} onClose={() => setIsDeliveryOpen(false)} itemTitle={listing.title} itemLocation={listing.location} onSendEstimateToChat={handleSendEstimateToChat} />
      <InspectionChecklistModal isOpen={isInspectionOpen} onClose={() => setIsInspectionOpen(false)} category={listing.category} itemTitle={listing.title} onSendChecklistToChat={handleSendInspectionReport} />
      <LightboxModal isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} images={listing.images || []} currentIndex={activeImageIndex} onIndexChange={setActiveImageIndex} title={listing.title} />
      <DealQrScannerModal isOpen={isDealScannerOpen} onClose={() => setIsDealScannerOpen(false)} listing={listing} onDealSealed={handleDealSealedInChat} />
      
      <AiVoiceOverviewModal
        isOpen={isVoiceTourOpen}
        onClose={() => setIsVoiceTourOpen(false)}
        listing={listing}
      />

      <PriceDropAlertModal
        isOpen={isPriceDropOpen}
        onClose={() => setIsPriceDropOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        currentPrice={listing.price}
      />

      <StorefrontFlycardModal
        isOpen={isFlyerOpen}
        onClose={() => setIsFlyerOpen(false)}
        title={listing.title}
        price={listing.price}
        location={listing.location}
        image={listing.images?.[0]}
        sellerName={listing.sellerName}
        sellerPhone={listing.sellerPhone}
        verificationType={listing.sellerVerificationType}
        itemUrl={window.location.href}
      />

      <MobileNav />
    </div>
  );
};

