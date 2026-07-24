import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import AuthModal from '../components/AuthModal';
import { Category } from '../types/sealify';
import { 
  HelpCircle, 
  Plus, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  Search, 
  X, 
  CheckCircle2, 
  Tag, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CATEGORIES: (Category | 'All')[] = [
  'All',
  'Vehicles',
  'Electronics',
  'Real Estate',
  'Fashion',
  'Home & Furniture',
  'Services',
  'Jobs',
  'Beauty & Health',
  'Utility & Energy',
];

export const BuyerRequests: React.FC = () => {
  const { buyerRequests, createBuyerRequest, user, isAuthenticated, sendMessage, deleteBuyerRequest } = useSealify();
  const navigate = useNavigate();

  const [selectedCat, setSelectedCat] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Form State for Posting Request
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState<Category>('Electronics');
  const [reqBudget, setReqBudget] = useState('');
  const [reqLocation, setReqLocation] = useState('Under G Area, Ogbomoso');
  const [reqDescription, setReqDescription] = useState('');

  const filteredRequests = buyerRequests.filter((req) => {
    if (selectedCat !== 'All' && req.category !== selectedCat) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        req.title.toLowerCase().includes(q) ||
        req.description.toLowerCase().includes(q) ||
        req.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenPostModal = () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    setIsPostModalOpen(true);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!reqTitle.trim() || !reqBudget || !reqDescription.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    createBuyerRequest({
      userId: user.id,
      userName: user.fullName,
      userAvatar: user.avatarUrl,
      title: reqTitle.trim(),
      category: reqCategory,
      maxBudget: Number(reqBudget),
      location: reqLocation.trim(),
      description: reqDescription.trim(),
    });

    setReqTitle('');
    setReqBudget('');
    setReqDescription('');
    setIsPostModalOpen(false);
  };

  const handleReplyToBuyer = (reqUserId: string, reqTitle: string, reqCategory: Category) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    const promptMsg = `Hi! I saw your item request for "\${reqTitle}" on the Sealify Want Board. I have an item that matches what you are looking for!`;
    sendMessage('lst_custom', reqUserId, promptMsg);
    toast.success('Chat initiated with buyer!');
    navigate('/messages');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO 
        title="Buyer Want Board & Requests — Sealify Nigeria" 
        description="Can't find an item? Post an item request on Sealify and let verified vendors in Ogbomoso reach out with offers."
      />
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border border-teal-500/30 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center sm:text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
                <HelpCircle className="w-4 h-4" />
                <span>Buyer Want Board & Community Requests</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Can't Find What You Need?
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Post an official <strong>"Item Request"</strong> on our community board. Local verified merchants and sellers across Ogbomoso will be notified to pitch their available items directly to you!
              </p>
            </div>

            <button
              onClick={handleOpenPostModal}
              className="px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span>Post an Item Request</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search requested items or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${
                  selectedCat === cat
                    ? 'bg-emerald-500 text-slate-950 font-black shadow'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Feed Grid */}
        {filteredRequests.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs my-8 space-y-4">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No requests found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">Be the first to post a request if you are looking for a product or service!</p>
            <button
              onClick={handleOpenPostModal}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Request</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => {
              const isOwner = user?.id === req.userId;

              return (
                <div
                  key={req.id}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4 relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.userAvatar}
                          alt={req.userName}
                          className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-500"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-white">{req.userName}</h4>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500" /> {req.createdAt}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-black uppercase text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                        {req.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors leading-snug">
                        {req.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {req.description}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Max Buyer Budget</span>
                        <strong className="text-emerald-400 font-black text-sm">{formatNGN(req.maxBudget)}</strong>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Target Area</span>
                        <span className="text-slate-300 font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" /> {req.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {isOwner ? (
                      <button
                        onClick={() => deleteBuyerRequest(req.id)}
                        className="text-xs font-bold text-rose-400 hover:underline"
                      >
                        Delete My Request
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReplyToBuyer(req.userId, req.title, req.category)}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs text-center flex items-center justify-center gap-2 shadow transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>I Have This Item! Offer Buyer</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Post Request Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-5">
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center mx-auto border border-teal-500/30">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Post Item Request</h2>
              <p className="text-xs text-slate-400">Describe what you are looking to purchase</p>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Item Needed / Title *</label>
                <input
                  type="text"
                  required
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g. Clean iPhone 13 Pro 256GB or Elepaq Generator"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Category *</label>
                  <select
                    value={reqCategory}
                    onChange={(e) => setReqCategory(e.target.value as Category)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Max Budget (₦ NGN) *</label>
                  <input
                    type="number"
                    required
                    value={reqBudget}
                    onChange={(e) => setReqBudget(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-black focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Preferred Neighborhood Location *</label>
                <input
                  type="text"
                  required
                  value={reqLocation}
                  onChange={(e) => setReqLocation(e.target.value)}
                  placeholder="e.g. Under G Area, Ogbomoso"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Detailed Description & Specifications *</label>
                <textarea
                  rows={4}
                  required
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                  placeholder="Mention color preference, minimum condition, or urgency level..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Publish Request to Want Board</span>
              </button>
            </form>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <Footer />
      <MobileNav />
    </div>
  );
};

export default BuyerRequests;