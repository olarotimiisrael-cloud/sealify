import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Package, MapPin, Eye, Shield, Star, Tag, 
  ArrowRightLeft, QrCode, Volume2, Image as ImageIcon,
  BarChart, Calculator, Sparkles, Share2, 
  Truck, CheckSquare, Heart, MessageSquare,
  ShieldCheck, Zap, Crown, BadgeCheck
} from 'lucide-react';

// Re-export all marketplace components as a unified library
export const MarketplaceComponents = {
  ListingCard: ({ listing, variant = 'grid' }: any) => (
    <Card className="group bg-slate-900 border border-slate-800/90 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/30 flex flex-col justify-between relative h-full">
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start max-w-[65%] pointer-events-none">
        {listing.featured && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-slate-950" /> TOP AD
          </Badge>
        )}
        {listing.viewsCount > 200 && !listing.featured && (
          <Badge className="bg-purple-600 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-md flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5 fill-current" /> HOT
          </Badge>
        )}
      </div>

      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <button className="p-1.5 rounded-full bg-slate-950/80 text-emerald-400 hover:text-white backdrop-blur-md transition-transform active:scale-90">
          <Share2 className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 rounded-full bg-slate-950/80 text-amber-400 hover:text-white backdrop-blur-md transition-transform active:scale-90">
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>
        <button className={`p-1.5 rounded-full backdrop-blur-md transition-transform active:scale-90 ${listing.verified ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-950/80 text-slate-300 hover:text-white'}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
        </button>
        <button className={`p-1.5 rounded-full backdrop-blur-md transition-transform active:scale-90 ${listing.saved ? 'bg-rose-500 text-white' : 'bg-slate-950/80 text-slate-300 hover:text-white'}`}>
          <Heart className={`w-3.5 h-3.5 ${listing.saved ? 'fill-white' : ''}`} />
        </button>
      </div>

      <div>
        <img
          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'}
          alt={listing.title}
          className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-2 right-2 bg-slate-950/80 text-slate-300 text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
          <Eye className="w-3 h-3 text-amber-400" />
          <span>{listing.viewsCount}</span>
        </div>
      </div>

      <div className="p-3.5 space-y-1.5">
        <div className="flex justify-between items-baseline gap-1">
          <span className="text-base font-black text-emerald-400 tracking-tight">₦{listing.price.toLocaleString()}</span>
          <Badge className="text-[8px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded uppercase shrink-0">
            {listing.category}
          </Badge>
        </div>

        <h3 className="text-xs font-bold text-slate-100 line-clamp-1 hover:text-emerald-400 transition-colors">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1">
          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{listing.location.split(',')[0]}</span>
          <Badge className="ml-auto shrink-0">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
          </Badge>
        </div>
      </div>
    </Card>
  ),

  TrustScore: ({ score = 98, responseTime = '< 2 hours', verified = true, salesCount = 12 }: any) => (
    <Card className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seller Trust Score</span>
        </div>
        <div className={`text-lg font-black ${score >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{score}%</div>
      </div>

      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${score >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] text-slate-300 font-bold">{responseTime} response</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] text-slate-300 font-bold">{salesCount}+ successful deals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3 text-purple-400 fill-purple-400/20" />
          <span className="text-[10px] text-slate-300 font-bold">Top Rated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] text-slate-300 font-bold">Verified</span>
        </div>
      </div>
    </Card>
  ),

  PriceGuard: ({ price = 450000, category = 'Electronics', location = 'Ogbomoso' }: any) => (
    <Card className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Sealify AI Price Guard</span>
        </div>
        
        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">
          <Sparkles className="w-3 h-3 fill-current" />
          VETTED GREAT DEAL
        </span>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">Market Analysis for <strong className="text-slate-200">{location.split(',')[0]}</strong></p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Confidence: 94%</p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
            <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-emerald-300">Priced 15% Below Average</p>
              <p className="text-[10px] text-emerald-400/80 leading-relaxed mt-0.5">This item is significantly cheaper than similar listings in the Ogbomoso Node. High probability of fast sale.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800 pt-2">
          <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Based on 42 local ads</span>
          <button className="font-bold text-emerald-400 hover:underline">View Price Index →</button>
        </div>
      </div>
    </Card>
  ),

  VerifiedBadge: ({ type = 'individual', showText = false }: any) => {
    if (type === 'premium') {
      return (
        <Badge className="inline-flex items-center gap-1 font-black text-purple-200 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 border border-purple-400/50 px-2.5 py-0.5 rounded-full text-[10px] shadow-lg shadow-purple-900/40 animate-pulse">
          <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          {showText ? <span>Premium Verified</span> : <Sparkles className="w-2.5 h-2.5 text-amber-300" />}
        </Badge>
      );
    }
    if (type === 'business') {
      return (
        <Badge className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px]">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          {showText && <span>Verified Business</span>}
        </Badge>
      );
    }
    if (type === 'student') {
      return (
        <Badge className="inline-flex items-center gap-1 font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px]">
          <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
          {showText && <span>Verified Student</span>}
        </Badge>
      );
    }
    return (
      <Badge className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        {showText && <span>Verified ID</span>}
      </Badge>
    );
  },
};

export default MarketplaceComponents;
