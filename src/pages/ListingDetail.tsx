import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import AuthModal from '../components/AuthModal';
import ReportModal from '../components/ReportModal';
import OfferModal from '../components/OfferModal';
import ShareQrModal from '../components/ShareQrModal';
import SafeMeetupModal from '../components/SafeMeetupModal';
import DeliveryEstimatorModal from '../components/DeliveryEstimatorModal';
import InspectionChecklistModal from '../components/InspectionChecklistModal';
import LightboxModal from '../components/LightboxModal';
import ListingCard from '../components/ListingCard';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import TrustScore from '../components/TrustScore';
import PriceHistoryChart from '../components/PriceHistoryChart';
import { 
  MapPin, 
  Phone, 
  MessageSquare, 
  MessageCircle,
  Heart, 
  ArrowLeft, 
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ExternalLink,
  Tag,
  Sparkles,
  QrCode,
  Shield,
  Maximize2,
  Video,
  Share2,
  Truck,
  CheckSquare,
  TrendingDown,
  TrendingUp,
  Info
} from 'lucide-react';

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listings, toggleSaveListing, isSaved, isAuthenticated, sendMessage, addRecentlyViewed } = useSealify();
  
  const listing = listings.find((l) => l.id === id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isMeetupOpen, setIsMeetupOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('Hi, is this item still available?');
  const [viewMode, setViewMode] = useState<'image' | 'video'>('image');

  useEffect(() => {
    if (listing?.id) {
      addRecentlyViewed(listing.id);
    }
  }, [listing?.id]);

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
        <SEO title="Listing Not Found — Sealify" description="This classified item is no longer available on Sealify." />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Listing Not Found</h2>
          <p className="text-slate-400 text-xs mb-6">This item may have been removed or sold by the owner.</p>
          <Link to="/" className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs">
            Back to Home
          </Link>
        </div>
        <MobileNav />
      </div>
    );
  }

  const categoryAds = listings.filter(l => l.category === listing.category);
  const avgPrice = categoryAds.reduce((acc, l) => acc + l.price, 0) / categoryAds.length;
  const isBelowAvg = listing.price < avgPrice;
  const priceDiffPercent = Math.abs(Math.round(((listing.price - avgPrice) / avgPrice) * 100));

  const relatedListings = listings
    .filter((l) => l.category === listing.category && l.id !== listing.id)
    .slice(0, 4);

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

  const cleanPhone = listing.sellerPhone.replace(/[^0-9]/g, '');
  const formattedWhatsappPhone = cleanPhone.startsWith('0') ? `234${cleanPhone.slice(1)}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${formattedWhatsappPhone}?text=\${encodeURIComponent(
    \`Hello \${listing.sellerName}, I am interested in your item on Sealify: "\${listing.title}" (\${formattedPrice}). Is it still available?\`
  )}`;

  const handleStartChat = () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    sendMessage(listing.id, listing.sellerId, chatMessage);
    navigate('/messages');
  };

  const handleSendOffer = (offerPrice: number, offerMsg: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    sendMessage(listing.id, listing.sellerId, offerMsg);
    navigate('/messages');
  };

  const handleSelectMeetupSpot = (spotName: string, spotAddress: string) => {
    const meetupProposal = `📍 PROPOSED MEETUP LOCATION:\n\${spotName}\n\${spotAddress}`;
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    sendMessage(listing.id, listing.sellerId, meetupProposal);
    navigate('/messages');
  };

  const handleSendDeliveryEstimate = (estimateMsg: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    sendMessage(listing.id, listing.sellerId, estimateMsg);
    navigate('/messages');
  };

  const handleSendInspectionReport = (reportMsg: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    sendMessage(listing.id, listing.sellerId, reportMsg);
    navigate('/messages');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-28 md:pb-0 font-sans">
      <SEO 
        title={`\${listing.title} — \${formattedPrice} | Sealify Nigeria`} 
        description={`\${listing.description.substring(0, 160)}... Available in \${listing.location}.`}
        image={listing.images[0]}
        url={window.location.href}
      />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsInspectionOpen(true)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-purple-400 hover:text-white flex items-center gap-1 text-xs font-bold"
              title="Interactive Inspection Checklist"
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Testing Checklist</span>
            </button>

            <button
              onClick={() => setIsDeliveryOpen(true)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-amber-400 hover:text-white flex items-center gap-1 text-xs font-bold"
              title="Estimate Delivery / Shipping Cost"
            >
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Delivery Fee</span>
            </button>

            <button
              onClick={() => setIsMeetupOpen(true)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-teal-400 hover:text-white flex items-center gap-1 text-xs font-bold"
              title="Find Safe Meetup Spot"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Safe Exchange Zone</span>
            </button>

            <button
              onClick={() => setIsQrOpen(true)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 hover:text-white flex items-center gap-1 text-xs font-bold"
              title="Share & QR Link Preview"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share Ad</span>
            </button>

            <button
              onClick={() => toggleSaveListing(listing.id)}
              className={`p-2 border rounded-xl transition-colors \${
                saved
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 \${saved ? 'fill-red-500' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-3 space-y-3 relative group">
              <div className="relative aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center">
                {viewMode === 'video' && listing.videoUrl ? (
                  <video 
                    src={listing.videoUrl} 
                    className="w-full h-full bg-black object-contain" 
                    controls 
                    autoPlay 
                  />
                ) : (
                  <div
                    onClick={() => setIsLightboxOpen(true)}
                    className="w-full h-full cursor-pointer relative"
                  >
                    <img
                      src={listing.images[activeImageIndex]}
                      alt={listing.title}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                      className="absolute top-3 right-3 p-2 bg-slate-950/80 text-white rounded-xl backdrop-blur-md opacity-80 hover:opacity-100 transition-opacity"
                      title="View Fullscreen Photo"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {viewMode === 'image' && listing.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/70 text-white rounded-full backdrop-blur hover:bg-slate-950"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/70 text-white rounded-full backdrop-blur hover:bg-slate-950"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 items-center">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setViewMode('image');
                      setActiveImageIndex(idx);
                    }}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all \${
                      viewMode === 'image' && activeImageIndex === idx ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-60'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}

                {listing.videoUrl && (
                  <button
                    onClick={() => setViewMode('video')}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 flex items-center justify-center bg-slate-800 transition-all \${
                      viewMode === 'video' ? 'border-purple-500 scale-105' : 'border-slate-800 opacity-60'
                    }`}
                  >
                    <Video className="w-6 h-6 text-purple-400" />
                    <div className="absolute inset-0 bg-purple-500/10"></div>
                    <span className="absolute bottom-1 right-1 text-[8px] font-black text-white bg-purple-600 px-1 rounded">VIDEO</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-800 flex-wrap sm:flex-nowrap">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    {listing.category}
                  </span>
                  <h1 className="text-2xl font-black text-white mt-2 leading-tight">{listing.title}</h1>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {listing.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {listing.createdAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      {listing.viewsCount} views
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <p className="text-3xl font-black text-emerald-400">{formattedPrice}</p>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">{listing.condition}</p>
                </div>
              </div>

              {/* Market Comparison Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border \${isBelowAvg ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                    {isBelowAvg ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Market Comparison</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      This item is <strong className={isBelowAvg ? 'text-emerald-400' : 'text-amber-400'}>{priceDiffPercent}% {isBelowAvg ? 'below' : 'above'}</strong> category average in Ogbomoso.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-center shrink-0">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Avg Price</p>
                  <p className="text-sm font-black text-white">{formatNGN(avgPrice)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Item Description</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              <PriceHistoryChart currentPrice={listing.price} />

              <div className="pt-2 flex justify-between items-center border-t border-slate-800/80">
                <button
                  onClick={() => setIsOfferOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 hover:underline bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30"
                >
                  <Tag className="w-4 h-4" />
                  <span>Make an Offer</span>
                </button>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Report suspicious ad</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Safety Tips for Buyers</h3>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                <li>Meet the seller in a public, well-lit area.</li>
                <li>Inspect the product thoroughly before making payment.</li>
                <li>Avoid wire transfers or paying advance deposits.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seller Information</h3>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={listing.sellerAvatar}
                    alt={listing.sellerName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-white text-base">{listing.sellerName}</h4>
                      {listing.sellerVerified && (
                        <VerifiedBadge type={listing.sellerVerificationType || 'individual'} showText />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">Member since 2023</p>
                  </div>
                </div>

                <Link
                  to={`/seller/\${listing.sellerId}`}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white"
                  title="View Seller Profile"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              <TrustScore 
                score={98} 
                responseTime="< 2 hours" 
                verified={listing.sellerVerified} 
                salesCount={listing.viewsCount > 100 ? 12 : 3} 
              />

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="py-3 bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{showPhone ? listing.sellerPhone : 'Show Phone'}</span>
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat WhatsApp</span>
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
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Start Live Chat</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Safety Guidelines</span>
                </div>

                <Link
                  to="/safety"
                  className="text-[11px] font-bold text-emerald-400 hover:underline"
                >
                  Full Safety Guide →
                </Link>
              </div>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                <li>Always meet in well-lit, public spaces like coffee shops, mall lobbies, or official police station exchange zones.</li>
                <li>Avoid secluded areas or private residences when meeting a seller or buyer for the first time.</li>
                <li>Bring a friend or family member with you whenever possible.</li>
              </ul>
            </div>
          </div>
        </div>

        {relatedListings.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">
                Similar Classifieds in {listing.category}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {relatedListings.map((rel) => (
                <ListingCard key={rel.id} listing={rel} />
              ))}
            </div>
          </div>
        )}
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} listingTitle={listing.title} />
      <OfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        listingTitle={listing.title}
        originalPrice={listing.price}
        onSendOffer={handleSendOffer}
      />
      <ShareQrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        listingTitle={listing.title}
        listingPrice={listing.price}
        listingUrl={window.location.href}
      />
      <SafeMeetupModal
        isOpen={isMeetupOpen}
        onClose={() => setIsMeetupOpen(false)}
        itemTitle={listing.title}
        onSelectSpot={handleSelectMeetupSpot}
      />
      <DeliveryEstimatorModal
        isOpen={isDeliveryOpen}
        onClose={() => setIsDeliveryOpen(false)}
        itemTitle={listing.title}
        itemLocation={listing.location}
        onSendEstimateToChat={handleSendDeliveryEstimate}
      />
      <InspectionChecklistModal
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        category={listing.category}
        itemTitle={listing.title}
        onSendChecklistToChat={handleSendInspectionReport}
      />
      <LightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={listing.images}
        currentIndex={activeImageIndex}
        onIndexChange={setActiveImageIndex}
        title={listing.title}
      />
      <MobileNav />
    </div>
  );
};

export default ListingDetail;