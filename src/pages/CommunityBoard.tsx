import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import VerifiedBadge from '../components/VerifiedBadge';
import { 
  Megaphone, 
  Calendar, 
  Radio, 
  Users, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  ExternalLink, 
  Zap, 
  Award, 
  Star,
  CheckCircle,
  MessageCircle,
  Bell,
  Send,
  Loader2,
  AlertCircle,
  Heart,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export const CommunityBoard: React.FC = () => {
  const { announcements, allUsers, listings, broadcastMassNotification, dispatchPromotionalEmailDigest } = useSealify();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<'all' | 'security' | 'features' | 'news'>('all');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'buyers' | 'sellers'>('all');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Simulated community stats
  const [communityStats] = useState({
    totalMembers: allUsers.length,
    activeToday: Math.floor(allUsers.length * 0.12),
    totalAnnouncements: announcements.length,
    whatsappFollowers: 2847,
  });

  const filteredAnnouncements = announcements.filter(a => {
    if (activeFilter === 'all') return a.active;
    return a.active && a.type === activeFilter;
  });

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setIsSendingBroadcast(true);
    try {
      await broadcastMassNotification({
        target: broadcastTarget,
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
      });
      toast.success(`Broadcast sent to ${broadcastTarget === 'all' ? 'all users' : broadcastTarget}!`);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setShowBroadcastModal(false);
    } catch (err) {
      toast.error('Failed to send broadcast');
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/community');
    toast.success('Community invite link copied!');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">
      <SEO 
        title="Community Board & Marketplace Announcements — Sealify Nigeria" 
        description="Stay updated with the latest Ogbomoso marketplace announcements, safety alerts, and merchant spotlights." 
      />
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 py-8 sm:py-12 flex-1 space-y-12">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
           
           <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Ogbomoso Node Broadcasts</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Community Board</h1>
              <p className="text-slate-400 text-xs sm:text-base leading-relaxed">
                Your primary source for official marketplace updates, neighborhood trading news, and verified safety alerts across Ogbomosoland.
              </p>
           </div>

           <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <a 
                href="https://whatsapp.com/channel/0029VaqFIYEC6ZvlrPCLql1R" 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs"
              >
                 <span>Follow WhatsApp Channel</span>
                 <ExternalLink className="w-4 h-4" />
              </a>
              <button 
                className="px-8 py-4 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all text-xs"
                onClick={() => handleCopyInviteLink()}
              >
                 <Link className="w-4 h-4" />
                 <span>Copy Invite Link</span>
              </button>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Members</span>
            </div>
            <p className="text-2xl font-black text-white">{communityStats.totalMembers.toLocaleString()}</p>
            <p className="text-xs text-slate-400">{communityStats.activeToday} online now</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">WhatsApp Channel</span>
            </div>
            <p className="text-2xl font-black text-white">{communityStats.whatsappFollowers.toLocaleString()}</p>
            <p className="text-xs text-slate-400">Followers</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Announcements</span>
            </div>
            <p className="text-2xl font-black text-white">{communityStats.totalAnnouncements}</p>
            <p className="text-xs text-slate-400">Active broadcasts</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Activity Today</span>
            </div>
            <p className="text-2xl font-black text-white">{communityStats.activeToday}</p>
            <p className="text-xs text-slate-400">Active traders</p>
          </div>
        </div>

        {/* Filter Tabs & Broadcast Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {(['all', 'security', 'features', 'news'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <Megaphone className="w-4 h-4" />
            <span>Send Broadcast</span>
          </button>
        </div>

        {/* Announcements Feed */}
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-5">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto border border-slate-700">
                <Megaphone className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white">No announcements yet</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Check back later for new marketplace updates and safety alerts.
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((ann) => (
              <div 
                key={ann.id} 
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 hover:border-emerald-500/30 transition-all shadow-xl group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-950 border border-slate-800 ${ann.type === 'alert' ? 'text-rose-400 border-rose-500/30' : ann.type === 'warning' ? 'text-amber-400 border-amber-500/30' : ann.type === 'success' ? 'text-emerald-400 border-emerald-500/30' : 'text-blue-400 border-blue-500/30'}`}>
                    {ann.type.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(ann.createdAt)}
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors leading-tight mb-3">
                  {ann.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  {ann.message}
                </p>
                <button className="flex items-center gap-2 text-xs font-black text-emerald-400 group-hover:gap-3 transition-all uppercase tracking-widest">
                  Read Full Announcement
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          )}
        </div>

        {/* Community Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Merchant Spotlight */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-xl">
            <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Top Performers</span>
            </h3>
            
            <div className="space-y-3">
              {allUsers
                .filter(u => u.verified)
                .sort((a, b) => (b.completedDeals || 0) - (a.completedDeals || 0))
                .slice(0, 5)
                .map((seller, idx) => (
                  <Link 
                    to={`/seller/${seller.id}`} 
                    key={seller.id} 
                    className="flex items-center justify-between p-3 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={seller.avatarUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-xl object-cover border border-slate-700" alt={seller.fullName} />
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{seller.fullName}</h4>
                        <div className="flex items-center gap-1">
                          <VerifiedBadge type={seller.verificationType} className="scale-75 origin-left" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-black text-emerald-400 flex items-center justify-end gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        {seller.completedDeals || (5 + idx)}
                      </p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase">DEALS</p>
                    </div>
                  </Link>
                ))}
            </div>

            <Link to="/vendors" className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 hover:text-white text-center transition-all uppercase tracking-widest">
              View Merchant Directory
            </Link>
          </div>

          {/* Market Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-xl">
            <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Market Stats Today
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">Live Users</span>
                <span className="text-lg font-black text-emerald-400">142</span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">New Ads</span>
                <span className="text-lg font-black text-blue-400">+28</span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">Trades Sealed</span>
                <span className="text-lg font-black text-purple-400">12</span>
              </div>
            </div>
          </div>

          {/* Verified Contributor CTA */}
          <div className="lg:col-span-2 bg-emerald-500 rounded-[2rem] p-6 space-y-4 shadow-2xl text-slate-950">
            <ShieldCheck className="w-10 h-10" />
            <h3 className="text-lg font-black leading-tight">Become a Verified Contributor</h3>
            <p className="text-xs font-bold leading-relaxed opacity-90">
              Trusted vendors with 50+ successful deals can apply for Community Moderator status to help verify new neighborhood listings.
            </p>
            <button className="w-full py-3 bg-slate-950 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg">
              Apply Now
            </button>
          </div>

          {/* Neighborhood Hubs */}
          <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-[2rem] space-y-4">
            <h3 className="font-black text-white text-sm uppercase tracking-widest">Neighborhood Hubs</h3>
            <div className="space-y-2">
              {['Under G', 'LAUTECH Gate', 'Takie Square', 'Sabo Market', 'Aroje'].map(hub => (
                <div key={hub} className="flex items-center justify-between text-xs py-2 border-b border-slate-800 last:border-0">
                  <span className="text-slate-400 font-medium flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-500" />
                    {hub}
                  </span>
                  <span className="text-emerald-400 font-black">ACTIVE</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WhatsApp Community Section */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border-2 border-emerald-500/40 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
             <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-950 border-4 border-emerald-500/50 rounded-full flex items-center justify-center shadow-2xl shrink-0">
                <Radio className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
             </div>
             
             <div className="space-y-6 text-center md:text-left flex-1">
                <div className="space-y-2">
                   <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Join the Community</h3>
                   <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Connect with thousands of verified traders in Ogbomoso. Get real-time alerts, share feedback, and stay ahead of the market.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                   <a 
                     href="https://whatsapp.com/channel/0029VaqFIYEC6ZvlrPCLql1R" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="px-6 py-4 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-emerald-500/30"
                   >
                     <span>Follow Broadcast Channel</span>
                     <ExternalLink className="w-4 h-4" />
                   </a>
                   <a 
                     href="https://chat.whatsapp.com/F0iRCn1r1z2JQuKLoRhmw4?s=cl&p=a&ilr=1" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
                   >
                     <span>Join Discussion Group</span>
                     <ExternalLink className="w-3.5 h-3.5" />
                   </a>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowBroadcastModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleBroadcast} className="space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white">Send Mass Notification</h2>
                <p className="text-xs text-slate-400">Reach all users instantly with important updates</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Audience</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Users ({allUsers.length})</option>
                  <option value="buyers">Buyers Only</option>
                  <option value="sellers">Sellers Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notification Title</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. New Feature Release"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Message Content</label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Broadcast message..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingBroadcast}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSendingBroadcast ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isSendingBroadcast ? 'Sending...' : 'Send Broadcast'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <MobileNav />
    </div>
  );
};

export default CommunityBoard;