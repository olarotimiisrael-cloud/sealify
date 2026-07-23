import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import AuthModal from '../components/AuthModal';
import PostRequestModal from '../components/PostRequestModal';
import { 
  MessageSquare, 
  Search, 
  MapPin, 
  PlusCircle, 
  Clock, 
  Tag, 
  User, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Filter,
  Package
} from 'lucide-react';

export const BuyerRequests: React.FC = () => {
  const { buyerRequests, isAuthenticated, user, deleteBuyerRequest, sendMessage } = useSealify();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = buyerRequests.filter((req) => {
    const q = searchQuery.toLowerCase();
    return (
      req.title.toLowerCase().includes(q) ||
      req.description.toLowerCase().includes(q) ||
      req.category.toLowerCase().includes(q)
    );
  });

  const handlePostRequest = () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    setIsPostModalOpen(true);
  };

  const handleContactBuyer = (reqId: string, buyerId: string, buyerName: string, reqTitle: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    const introMsg = `Hello ${buyerName}, I saw your request for "${reqTitle}" on the Sealify Wanted Board. I have something that might interest you!`;
    sendMessage('wanted_board', buyerId, introMsg);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO 
        title="Wanted Board — Buyer Requests | Sealify Nigeria"
        description="Browse what buyers are looking for in Ogbomoso. Can't find an item? Post a wanted request and let sellers find you."
      />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Ogbomoso Demand & Wanted Board</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Can't find what you're <br />looking for?
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
                Post a specific request here. Our community of verified sellers monitors this board daily to fulfill local needs.
              </p>
              
              <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-3">
                <button
                  onClick={handlePostRequest}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>POST A WANTED REQUEST</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-3xl space-y-1 shrink-0 text-center w-full sm:w-auto shadow-xl">
              <p className="text-3xl font-black text-emerald-400">{buyerRequests.length}</p>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Active Buyer Needs</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search specific requests (e.g. 'iPhone', 'Hostel')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Latest Requests First</span>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs my-8 space-y-3">
            <Search className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-bold text-white text-sm">No requests found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5 relative group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.userAvatar}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-800 shadow-md"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'; }}
                      />
                      <div>
                        <h3 className="font-extrabold text-sm text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">{req.title}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5">
                           <span>{req.userName}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                           <span className="text-emerald-500">{req.category}</span>
                        </p>
                      </div>
                    </div>
                    {req.budget && (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[11px] font-black shadow-sm shrink-0">
                        ₦{req.budget.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 italic">
                      "{req.description}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold px-1">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-600" /> {req.location}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-600" /> {req.createdAt}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleContactBuyer(req.id, req.userId, req.userName, req.title)}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>I HAVE THIS ITEM</span>
                  </button>
                  
                  {user?.id === req.userId && (
                    <button
                      onClick={() => deleteBuyerRequest(req.id)}
                      className="p-2.5 bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition-colors"
                      title="Remove your request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global Protection Badge */}
        <div className="pt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Community-Led Market Integrity</span>
          </div>
        </div>
      </main>

      <PostRequestModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <Footer />
      <MobileNav />
    </div>
  );
};

export default BuyerRequests;