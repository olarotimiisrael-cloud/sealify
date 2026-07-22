import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { ChatModal } from '../components/ChatModal';
import VerifiedBadge from '../components/VerifiedBadge';
import {
  MapPin,
  Phone,
  MessageSquare,
  Heart,
  ChevronLeft,
  Share2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listings, isSaved, toggleSaveListing } = useSealify();
  
  const listing = listings.find((l) => l.id === id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Item Not Found</h2>
          <p className="text-slate-400 text-xs mb-4">The listing you are looking for may have been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const saved = isSaved(listing.id);
  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (Gallery + Description) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery Component */}
            <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-xl overflow-hidden">
              <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden mb-3">
                <img
                  src={listing.images[selectedImageIndex] || listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => toggleSaveListing(listing.id)}
                  className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-md transition-colors ${
                    saved ? 'bg-rose-500 text-white' : 'bg-slate-900/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 ${
                        selectedImageIndex === idx ? 'border-emerald-500 scale-95' : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Details */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full uppercase">
                  {listing.category}
                </span>
                <div className="flex items-center text-xs text-slate-400 gap-4">
                  <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {listing.createdAt}</span>
                  <span>{listing.viewsCount} views</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {listing.title}
              </h1>

              <div className="text-3xl font-black text-emerald-400">
                {formatNGN(listing.price)}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-y border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Condition</span>
                  <span className="font-bold text-white">{listing.condition}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Location</span>
                  <span className="font-bold text-white">{listing.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status</span>
                  <span className="font-bold text-emerald-400 uppercase">{listing.status}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-base mb-2">Description</h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-emerald-400"
                >
                  <Share2 className="w-4 h-4 mr-1.5" /> Share Listing
                </button>
              </div>
            </div>

            {/* Safety Tips Card */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" /> Safety Tips for Buyers
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Meet the seller in a public, well-lit place.</li>
                <li>Inspect the product thoroughly before making payment.</li>
                <li>Never pay upfront or transfer money before receiving the item.</li>
              </ul>
            </div>
          </div>

          {/* Sidebar Seller Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl sticky top-20 space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                <img
                  src={listing.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={listing.sellerName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1 font-bold text-white text-base">
                    {listing.sellerName}
                    {listing.sellerVerified && (
                      <VerifiedBadge type={listing.sellerVerificationType || 'individual'} />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Member since 2023</p>
                  <p className="text-xs text-slate-400 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1 text-slate-500" /> {listing.location}
                  </p>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl py-3.5 text-xs shadow-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Start Chat
                </button>

                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white rounded-2xl py-3.5 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  {showPhone ? (
                    <span className="font-mono">{listing.sellerPhone}</span>
                  ) : (
                    'Show Phone Number'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ChatModal
        listing={listing}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
      <MobileNav />
    </div>
  );
}