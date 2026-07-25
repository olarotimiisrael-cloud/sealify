import React from 'react';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import VerifiedBadge from '../components/VerifiedBadge';
import { Megaphone, Calendar, Radio, Users, Sparkles, ArrowRight, ShieldCheck, MapPin, ExternalLink, Zap, Award, Star } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';
import { Link } from 'react-router-dom';

export const CommunityBoard: React.FC = () => {
  const { announcements, allUsers } = useSealify();

  const topSellers = allUsers
    .filter(u => u.verified)
    .sort((a, b) => (b.completedDeals || 0) - (a.completedDeals || 0))
    .slice(0, 5);

  const newsItems = [
    {
      id: 'news_1',
      title: 'New Safe Meetup Spot: LAUTECH Library Gate',
      desc: 'The LAUTECH Library Gate has been officially added as a Verified Safe Spot with 24/7 security and enhanced lighting for campus trades.',
      tag: 'Location Update',
      color: 'text-emerald-400',
      time: '2 hours ago'
    },
    {
      id: 'news_2',
      title: 'Merchant Spotlight: Ogbomoso Tech Hub',
      desc: 'Congratulations to our top-rated vendor of the week with 100% positive feedback on 15 successful transactions this month.',
      tag: 'Merchant News',
      color: 'text-amber-400',
      time: '1 day ago'
    },
    {
      id: 'news_3',
      title: 'Marketplace Security Protocol v2.4 Live',
      desc: 'We have updated our fraud detection algorithms to better protect users against overpayment scams and fake payment alerts.',
      tag: 'Security',
      color: 'text-blue-400',
      time: '3 days ago'
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">
      <SEO 
        title="Community News & Marketplace Board — Sealify Nigeria" 
        description="Stay updated with the latest Ogbomoso marketplace announcements, safety alerts, and merchant spotlights." 
      />
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 py-8 sm:py-12 flex-1 space-y-12">
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
              <a href="https://whatsapp.com/channel/0029VaqFIYEC6ZvlrPCLql1R" target="_blank" rel="noreferrer" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs">
                 <span>WhatsApp Channel</span>
                 <ExternalLink className="w-4 h-4" />
              </a>
              <button className="px-8 py-4 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all text-xs">
                 <Users className="w-4 h-4" />
                 <span>Join Support Group</span>
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Primary News Feed */}
           <div className="lg:col-span-8 space-y-6">
              <h2 className="text-xl font-black text-white uppercase flex items-center gap-2 tracking-tight">
                <Megaphone className="w-5 h-5 text-emerald-400" />
                Latest Marketplace Headlines
              </h2>

              <div className="space-y-4">
                 {newsItems.map(item => (
                   <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 hover:border-emerald-500/30 transition-all shadow-xl group">
                      <div className="flex justify-between items-start mb-4">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-950 border border-slate-800 ${item.color}`}>
                            {item.tag}
                         </span>
                         <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {item.time}
                         </span>
                      </div>
                      <h3 className="text-lg sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors leading-tight mb-3">
                         {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                         {item.desc}
                      </p>
                      <button className="flex items-center gap-2 text-xs font-black text-emerald-400 group-hover:gap-3 transition-all uppercase tracking-widest">
                         Read Full Release
                         <ArrowRight className="w-4 h-4" />
                      </button>
                   </div>
                 ))}
              </div>
           </div>

           {/* Sidebar Info & Leaderboard */}
           <div className="lg:col-span-4 space-y-8">
              {/* Merchant Leaderboard */}
              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-2xl">
                 <div className="flex items-center justify-between">
                    <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                       <Award className="w-4 h-4 text-amber-400" />
                       Top Performers
                    </h3>
                    <span className="text-[9px] font-black text-slate-500 uppercase">MONTHLY</span>
                 </div>
                 
                 <div className="space-y-3">
                    {topSellers.map((seller, idx) => (
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

              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-2xl">
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

              <div className="bg-emerald-500 rounded-[2rem] p-6 space-y-4 shadow-2xl text-slate-950">
                 <ShieldCheck className="w-10 h-10" />
                 <h3 className="text-lg font-black leading-tight">Become a Verified Contributor</h3>
                 <p className="text-xs font-bold leading-relaxed opacity-90">
                    Trusted vendors with 50+ successful deals can apply for Community Moderator status to help verify new neighborhood listings.
                 </p>
                 <button className="w-full py-3 bg-slate-950 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg">
                    Apply Now
                 </button>
              </div>

              <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] space-y-4">
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
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default CommunityBoard;