import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import ReportModal from '../components/ReportModal';
import OfferModal from '../components/OfferModal';
import ShareQrModal from '../components/ShareQrModal';
import SafeMeetupModal from '../components/SafeMeetupModal';
import FinancingCalculator from '../components/FinancingCalculator';
import ListingCard from '../components/ListingCard';
import MobileNav from '../components/MobileNav';
import { 
  MapPin, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Heart, 
  Share2, 
  ArrowLeft, 
  AlertTriangle,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ExternalLink,
  Tag,
  Sparkles,
  QrCode,
  Shield
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
  const [chatMessage, setChatMessage] = useState('Hi, is this item still available?');

  useEffect(() => {
    if (listing?.id) {
      addRecentlyViewed(listing.id);
    }
  }, [listing?.id]);

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Listing Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">This item may have been removed or sold by the owner.</p>
          <Link to="/" className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs">
            Back to Home
          </Link>
        </div>
        <MobileNav />
      </div>
    );
  }

  // Related items in the same category excluding current item
  const relatedListings = listings
    .filter((l) => l.category === listing.category && l.id !== listing.id)
    .slice(0, 4);

  const saved = isSaved(listing.id);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(listing.price);

  const isEligibleForFinancing = ['Vehicles', 'Real Estate', 'Electronics'].includes(listing.category) || listing.price >= 500;

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
    const meetupProposal = `📍 PROPOSED MEETUP LOCATION:\n${spotName}\n${spotAddress}`;
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    sendMessage(listing.id, listing.sellerId, meetupProposal);
    navigate('/messages');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-8">
        {/* Breadcrumb / Back button */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Listings</span>
          </Link>

          <div className="flex items-center gap-2">
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
              title="QR Code & Share"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

            <button
              onClick={() => setIsQrOpen(true)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleSaveListing(listing.id)}
              className={`p-2 border rounded-xl transition-colors ${
                saved
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-red-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Image Gallery & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-3 space-y-3">
              <div className="relative aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center">
                <img
                  src={listing.images[activeImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />

                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1))
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/70 text-white rounded-full backdrop-blur hover:bg-slate-950"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/70 text-white rounded-full backdrop-blur hover:bg-slate-950"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    {listing.category}
                  </span>
                  <h1 className="text-2xl font-black text-white mt-2 leading-tight">{listing.title}</h1>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
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

                <div className="text-right shrink-0">
                  <p className="text-3xl font-black text-emerald-400">{formattedPrice}</p>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">{listing.condition}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Item Description</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

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

            {/* Financing Calculator Widget */}
            {isEligibleForFinancing && (
              <FinancingCalculator itemPrice={listing.price} category={listing.category} />
            )}
          </div>

          {/* Right Sidebar: Seller Snippet & Actions */}
          <div className="space-y-6">
            {/* Seller Info Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seller Information</h3>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={listing.sellerAvatar}
                    alt={listing.sellerName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-white text-base">{listing.sellerName}</h4>
                      {listing.sellerVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" title="Verified Seller" />
                      )}
                    </div>
                    <p className="text-xs text-emerald-400 font-medium">Verified Vendor</p>
                    <p className="text-[11px] text-slate-500">Member since 2023</p>
                  </div>
                </div>

                <Link
                  to={`/seller/${listing.sellerId}`}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white"
                  title="View Seller Profile"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {/* Phone reveal button */}
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{showPhone ? listing.sellerPhone : 'Show Phone Number'}</span>
                </button>

                {/* Instant Message area */}
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

            {/* Safety Tips & Meetup spot banner */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Safety Guidelines</span>
                </div>

                <button
                  onClick={() => setIsMeetupOpen(true)}
                  className="text-[11px] font-bold text-emerald-400 hover:underline"
                >
                  Safe Meetup Spots →
                </button>
              </div>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                <li>Meet the seller in a public, well-lit area.</li>
                <li>Inspect the product thoroughly before making payment.</li>
                <li>Avoid wire transfers or paying advance deposits.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related / Similar Listings Section */}
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
      <MobileNav />
    </div>
  );
};

export default ListingDetail;