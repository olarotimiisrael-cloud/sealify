import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { ChatModal } from '@/components/ChatModal';
import {
  MapPin,
  ShieldCheck,
  Phone,
  MessageSquare,
  Bookmark,
  ChevronLeft,
  Share2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listings, savedIds, toggleSaveListing } = useApp();
  
  const listing = listings.find((l) => l.id === id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Item Not Found</h2>
          <p className="text-slate-500 text-sm mb-4">The listing you are looking for may have been removed.</p>
          <Button onClick={() => navigate('/')} className="bg-emerald-600 text-white rounded-full">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const isSaved = savedIds.includes(listing.id);
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(listing.price);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (Gallery + Description) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gallery Component */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm overflow-hidden">
              <div className="relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden mb-3">
                <img
                  src={listing.images[selectedImageIndex] || listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => toggleSaveListing(listing.id)}
                  className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-md transition-colors ${
                    isSaved ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${
                        selectedImageIndex === idx ? 'border-emerald-600 scale-95' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Details */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-semibold uppercase">
                  {listing.category}
                </Badge>
                <div className="flex items-center text-xs text-slate-400 gap-4">
                  <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> Posted {new Date(listing.created_at).toLocaleDateString()}</span>
                  <span>{listing.views_count} views</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {listing.title}
              </h1>

              <div className="text-3xl font-black text-emerald-600">
                {formattedPrice}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">Condition</span>
                  <span className="font-bold text-slate-800">{listing.condition}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Location</span>
                  <span className="font-bold text-slate-800">{listing.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status</span>
                  <span className="font-bold text-emerald-600 uppercase">{listing.status}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-600"
                >
                  <Share2 className="w-4 h-4 mr-1.5" /> Share Listing
                </button>
              </div>
            </div>

            {/* Safety Tips Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Safety Tips for Buyers
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800/80">
                <li>Meet the seller in a public, well-lit place.</li>
                <li>Inspect the product thoroughly before making payment.</li>
                <li>Never pay upfront or transfer money before receiving the item.</li>
              </ul>
            </div>

          </div>

          {/* Sidebar Seller Snippet Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-20 space-y-5">
              
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <img
                  src={listing.seller?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={listing.seller?.full_name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1 font-bold text-slate-900 text-base">
                    {listing.seller?.full_name || 'Verified Seller'}
                    {listing.seller?.verified && (
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">Member since {listing.seller?.member_since || '2023'}</p>
                  <p className="text-xs text-slate-500 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {listing.seller?.location || listing.location}
                  </p>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="space-y-3">
                <Button
                  onClick={() => setIsChatOpen(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 font-bold shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" /> Start Chat
                </Button>

                <Button
                  onClick={() => setShowPhone(!showPhone)}
                  variant="outline"
                  className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-2xl py-6 font-bold flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  {showPhone ? (
                    <span className="font-mono">{listing.seller?.phone_number || '+234 800 000 0000'}</span>
                  ) : (
                    'Show Phone Number'
                  )}
                </Button>
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