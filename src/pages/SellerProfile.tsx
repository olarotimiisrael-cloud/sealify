import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ReviewModal from '../components/ReviewModal';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import TrustScore from '../components/TrustScore';
import { 
  MapPin, Calendar, Phone, ArrowLeft, Package, Star, 
  TrendingUp, TrendingDown, Eye, MessageSquare, Heart,
  Award, ShieldCheck, Zap, BarChart2, LineChart, PieChart,
  Users, Clock, CheckCircle2, AlertCircle, Crown,
  ExternalLink, Share2, Download, Settings, Bell,
  Activity, Target, DollarSign, Percent, ArrowUpRight,
  ArrowDownRight, Minus, Plus, Filter, Grid, List,
  ChevronLeft, ChevronRight, MoreHorizontal, Search
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, Tooltip, 
  XAxis, YAxis, CartesianGrid, Legend, RadialBarChart, RadialBar
} from 'recharts';

interface ReviewItem {
  id: string;
  author: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface PerformanceMetric {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { listings, allUsers, user: currentUser } = useSealify();

  const sellerUser = allUsers.find((u) => u.id === id);
  const sellerListings = listings.filter((l) => l.sellerId === id);
  const sampleListing = sellerListings[0] || listings[0];

  const sellerName = sellerUser?.fullName || sampleListing?.sellerName || 'Verified Seller';
  const sellerAvatar = sellerUser?.avatarUrl || sampleListing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const sellerVerified = sellerUser?.verified ?? sampleListing?.sellerVerified ?? true;
  const sellerVerificationType = sellerUser?.verificationType || sampleListing?.sellerVerificationType || 'individual';
  const sellerLocation = sellerUser?.location || sampleListing?.location || 'Ogbomoso, Nigeria';
  const sellerPhone = sellerUser?.phoneNumber || sampleListing?.sellerPhone || '+234 800 000 0000';
  const memberSince = sellerUser?.memberSince || '2023';

  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev_1',
      author: 'Michael B.',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      rating: 5,
      comment: 'Very reliable seller. Product was clean and arrived quickly! Communication was excellent throughout.',
      date: '1 week ago',
      verified: true,
    },
    {
      id: 'rev_2',
      author: 'Sarah K.',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      rating: 5,
      comment: 'Best experience buying a car online. The seller was transparent about everything. Highly recommended!',
      date: '2 weeks ago',
      verified: true,
    },
    {
      id: 'rev_3',
      author: 'David O.',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      rating: 4,
      comment: 'Good product, fair price. Met at the safe zone, everything went smoothly. Would buy again.',
      date: '1 month ago',
      verified: false,
    },
    {
      id: 'rev_4',
      author: 'Grace A.',
      authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      rating: 5,
      comment: 'Amazing service! The laptop was exactly as described, even better in person. Fast response time.',
      date: '1 month ago',
      verified: true,
    },
    {
      id: 'rev_5',
      author: 'James M.',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      rating: 5,
      comment: 'Professional seller. Helped with paperwork for the vehicle transfer. 10/10 experience.',
      date: '2 months ago',
      verified: true,
    },
  ]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reviews' | 'listings'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleAddReview = (rating: number, comment: string) => {
    const newRev: ReviewItem = {
      id: 'rev_' + Date.now(),
      author: 'You (Verified Buyer)',
      authorAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      rating,
      comment,
      date: 'Just now',
      verified: true,
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  const avgRating = useMemo(() => (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1), [reviews]);

  const ratingDistribution = useMemo(() => {
    const dist = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
      percentage: (reviews.filter(r => r.rating === star).length / (reviews.length || 1)) * 100
    }));
    return dist;
  }, [reviews]);

  // Mock analytics data
  const analyticsData = useMemo(() => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    
    const viewsData = Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 200) + 50,
        inquiries: Math.floor(Math.random() * 20) + 5,
        saves: Math.floor(Math.random() * 15) + 2,
        shares: Math.floor(Math.random() * 10) + 1,
      };
    });

    const categoryData = sellerListings.reduce((acc, l) => {
      acc[l.category] = (acc[l.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = {
      active: sellerListings.filter(l => l.status === 'active').length,
      sold: sellerListings.filter(l => l.status === 'sold').length,
    };

    const totalViews = sellerListings.reduce((sum, l) => sum + l.viewsCount, 0);
    const totalInquiries = Math.floor(totalViews * 0.08);
    const totalSaves = Math.floor(totalViews * 0.12);
    const totalShares = Math.floor(totalViews * 0.03);
    const conversionRate = ((sellerListings.filter(l => l.status === 'sold').length / (sellerListings.length || 1)) * 100).toFixed(1);

    return {
      viewsData,
      categoryData,
      statusData,
      totalViews,
      totalInquiries,
      totalSaves,
      totalShares,
      conversionRate,
      avgResponseTime: '< 2 hrs',
      responseRate: '98%',
    };
  }, [sellerListings, timeRange]);

  const metrics: PerformanceMetric[] = [
    {
      label: 'Total Views',
      value: analyticsData.totalViews.toLocaleString(),
      change: 12.5,
      changeLabel: 'vs last period',
      icon: Eye,
      color: 'text-emerald-400',
      trend: 'up',
    },
    {
      label: 'Buyer Inquiries',
      value: analyticsData.totalInquiries,
      change: 8.2,
      changeLabel: 'vs last period',
      icon: MessageSquare,
      color: 'text-blue-400',
      trend: 'up',
    },
    {
      label: 'Saves & Favorites',
      value: analyticsData.totalSaves,
      change: -3.1,
      changeLabel: 'vs last period',
      icon: Heart,
      color: 'text-rose-400',
      trend: 'down',
    },
    {
      label: 'Shares',
      value: analyticsData.totalShares,
      change: 15.7,
      changeLabel: 'vs last period',
      icon: Share2,
      color: 'text-purple-400',
      trend: 'up',
    },
    {
      label: 'Conversion Rate',
      value: `${analyticsData.conversionRate}%`,
      change: 2.3,
      changeLabel: 'vs last period',
      icon: Target,
      color: 'text-amber-400',
      trend: 'up',
    },
    {
      label: 'Avg Response Time',
      value: analyticsData.avgResponseTime,
      change: 0,
      changeLabel: 'industry best',
      icon: Clock,
      color: 'text-teal-400',
      trend: 'neutral',
    },
  ];

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getVerificationIcon = (type: string) => {
    switch (type) {
      case 'premium': return <Crown className="w-5 h-5 text-amber-300 fill-amber-300" />;
      case 'business': return <Award className="w-5 h-5 text-amber-400" />;
      default: return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getVerificationLabel = (type: string) => {
    switch (type) {
      case 'premium': return 'Premium Verified Partner';
      case 'business': return 'Verified Business';
      default: return 'Verified Individual';
    }
  };

  const getVerificationColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 border-purple-400/50 text-purple-200';
      case 'business': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default: return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Hero Profile Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-slate-900/50 to-purple-500/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative bg-slate-900/80 border border-slate-800/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            {/* Main Profile Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-emerald-500/50 shadow-2xl shadow-emerald-500/20 relative z-10">
                    <img src={sellerAvatar} alt={sellerName} className="w-full h-full rounded-2xl object-cover" />
                  </div>
                  {/* Online/Verified Badge */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-slate-900 rounded-full flex items-center justify-center animate-pulse">
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-white">{sellerName}</h1>
                    {sellerVerified && (
                      <span className={`inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-full text-xs ${getVerificationColor(sellerVerificationType)} border`}>
                        {getVerificationIcon(sellerVerificationType)}
                        <span>{getVerificationLabel(sellerVerificationType)}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      {sellerLocation}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      Member since {memberSince}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Package className="w-4 h-4 text-slate-500" />
                      {sellerListings.length} Active Ads
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setIsReviewOpen(true)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all group"
                >
                  <Star className="w-5 h-5 fill-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Leave Vendor Review</span>
                </button>

                <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-center md:text-right min-w-[180px]">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Direct Contact</p>
                  <p className="text-sm font-extrabold text-white mt-1 flex items-center justify-center md:justify-end gap-1">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{sellerPhone}</span>
                  </p>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center justify-center md:justify-end gap-1">
                    <Zap className="w-3 h-3" /> Typically replies in < 2 hours
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Score */}
            <TrustScore 
              score={98} 
              responseTime="< 2 hours" 
              verified={sellerVerified} 
              salesCount={sellerListings.filter(l => l.status === 'sold').length + 12} 
            />

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-4 border-t border-slate-800/50">
              <div className="text-center p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <p className="text-2xl font-black text-emerald-400">{sellerListings.length}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Listings</p>
              </div>
              <div className="text-center p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <p className="text-2xl font-black text-blue-400">{analyticsData.totalViews.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Views</p>
              </div>
              <div className="text-center p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <p className="text-2xl font-black text-amber-400">{analyticsData.totalInquiries}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Inquiries</p>
              </div>
              <div className="text-center p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <p className="text-2xl font-black text-rose-400">{analyticsData.totalSaves}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Saves</p>
              </div>
              <div className="text-center p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <p className="text-2xl font-black text-purple-400">{analyticsData.conversionRate}%</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Conversion</p>
              </div>
              <div className="text-center p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <p className="text-2xl font-black text-teal-400">{analyticsData.responseRate}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Response Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-1.5 flex gap-1.5">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'listings', label: 'Listings', icon: Package },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl overflow-hidden">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Performance Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {metrics.map((metric, i) => {
                  const Icon = metric.icon;
                  return (
                    <div
                    <div
                      key={metric.label}
                      className="group relative bg-slate-950/50 border border-slate-800/50 rounded-2xl p-5 hover:border-emerald-500/30 transition-all"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                      <div className="relative flex items-start justify-between">
                        <div className={`p-3 rounded-xl ${metric.color} bg-opacity-10`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className={`text-[10px] font-bold ${metric.trend === 'up' ? 'text-emerald-400' : metric.trend === 'down' ? 'text-rose-400' : 'text-slate-500'}`}>
                          {metric.trend !== 'neutral' && (
                            <span className="flex items-center gap-0.5">
                              {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {Math.abs(metric.change || 0)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 space-y-1 relative">
                        <p className="text-2xl font-black text-white">{metric.value}</p>
                        <p className="text-xs text-slate-400">{metric.label}</p>
                        {metric.changeLabel && (
                          <p className="text-[10px] text-slate-500">{metric.changeLabel}</p>
                        )}
                      </div>
                    </div>
                    );
                })}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Views & Inquiries Chart */}
                <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">Views & Engagement Trend</h3>
                    <div className="flex items-center gap-1">
                      {['7d', '30d', '90d', '1y'].map(range => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range as typeof timeRange)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            timeRange === range
                              ? 'bg-emerald-500 text-slate-950'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.viewsData}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                          interval={timeRange === '7d' ? 1 : timeRange === '30d' ? 3 : 7}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }}
                          labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                          itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#colorViews)" 
                          name="Views"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="inquiries" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#colorInquiries)" 
                          name="Inquiries"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4">Listings by Category</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={Object.entries(analyticsData.categoryData).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                          labelStyle={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }}
                        >
                          {Object.entries(analyticsData.categoryData).map((_, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                          formatter={(value: number) => [value, 'Listings']}
                        />
                        <Legend 
                          layout="vertical" 
                          align="right" 
                          verticalAlign="middle"
                          iconType="circle"
                          iconSize={8}
                          formatter={(name) => name}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-5">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Listing Status
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Active Listings', value: analyticsData.statusData.active, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                      { label: 'Sold Listings', value: analyticsData.statusData.sold, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-slate-300">{item.label}</span>
                        <div className="flex items-center gap-3">
                          <span className={`font-black text-xl ${item.color}`}>{item.value}</span>
                          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.bg}`} 
                              style={{ width: `${(item.value / (analyticsData.statusData.active + analyticsData.statusData.sold || 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-5">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-400" />
                    Performance Indicators
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Response Rate', value: analyticsData.responseRate, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                      { label: 'Avg Response Time', value: analyticsData.avgResponseTime, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                      { label: 'Profile Completeness', value: '95%', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                      { label: 'Verification Level', value: sellerVerificationType === 'premium' ? 'Premium' : sellerVerificationType === 'business' ? 'Business' : 'Standard', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-slate-300">{item.label}</span>
                        <div className={`px-3 py-1 rounded-xl font-bold text-sm ${item.color} ${item.bg} border border-opacity-20`}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-white">Performance Analytics Dashboard</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                  </select>
                </div>
              </div>

              {/* Detailed Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Impressions', value: (analyticsData.totalViews * 2.3).toLocaleString(), icon: Eye, color: 'text-emerald-400', change: 15.2 },
                  { label: 'Unique Visitors', value: (analyticsData.totalViews * 0.65).toLocaleString(), icon: Users, color: 'text-blue-400', change: 8.7 },
                  { label: 'Chat Conversations', value: analyticsData.totalInquiries, icon: MessageSquare, color: 'text-purple-400', change: 12.4 },
                  { label: 'Phone Reveals', value: Math.floor(analyticsData.totalInquiries * 0.4), icon: Phone, color: 'text-amber-400', change: 5.1 },
                  { label: 'Meetup Requests', value: Math.floor(analyticsData.totalInquiries * 0.15), icon: MapPin, color: 'text-teal-400', change: 22.8 },
                  { label: 'Offer Received', value: Math.floor(analyticsData.totalInquiries * 0.25), icon: Tag, color: 'text-rose-400', change: -2.3 },
                  { label: 'Repeat Buyers', value: Math.floor(reviews.length * 0.3), icon: CheckCircle2, color: 'text-indigo-400', change: 18.5 },
                  { label: 'Avg Session Time', value: '2m 34s', icon: Clock, color: 'text-cyan-400', change: 3.7 },
                ].map((metric, i) => {
                  const Icon = metric.icon;
                  return (
                    <div key={i} className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-xl ${metric.color} bg-opacity-10`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold ${metric.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {metric.change >= 0 ? '+' : ''}{metric.change}%
                        </span>
                      </div>
                      <p className="text-2xl font-black text-white">{metric.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{metric.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Engagement Funnel */}
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-5">Buyer Engagement Funnel</h3>
                <div className="flex items-center justify-between gap-4">
                  {[
                    { label: 'Impressions', value: (analyticsData.totalViews * 2.3).toLocaleString(), color: '#64748b', width: 100 },
                    { label: 'Profile Views', value: analyticsData.totalViews.toLocaleString(), color: '#3b82f6', width: 70 },
                    { label: 'Interactions', value: (analyticsData.totalInquiries + analyticsData.totalSaves + analyticsData.totalShares).toLocaleString(), color: '#8b5cf6', width: 45 },
                    { label: 'Inquiries', value: analyticsData.totalInquiries.toLocaleString(), color: '#10b981', width: 25 },
                    { label: 'Meetups', value: Math.floor(analyticsData.totalInquiries * 0.15).toLocaleString(), color: '#f59e0b', width: 12 },
                    { label: 'Sales', value: analyticsData.statusData.sold.toLocaleString(), color: '#ef4444', width: 8 },
                  ].map((stage, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full rounded-t-xl" 
                        style={{ height: '120px', background: stage.color, width: `${stage.width}%` }}
                      ></div>
                      <div className="text-center mt-3 w-full">
                        <p className="font-bold text-white text-sm">{stage.label}</p>
                        <p className="text-2xl font-black" style={{ color: stage.color }}>{stage.value}</p>
                        <p className="text-[10px] text-slate-500">{stage.width}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Listings */}
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">Top Performing Listings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="pb-3 pr-4">Listing</th>
                        <th className="pb-3 pr-4">Category</th>
                        <th className="pb-3 pr-4">Views</th>
                        <th className="pb-3 pr-4">Inquiries</th>
                        <th className="pb-3 pr-4">Saves</th>
                        <th className="pb-3 pr-4">Conversion</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerListings
                        .sort((a, b) => b.viewsCount - a.viewsCount)
                        .slice(0, 10)
                        .map((listing, i) => (
                          <tr key={listing.id} className="border-b border-slate-800/50 hover:bg-slate-950/50 transition-colors">
                            <td className="py-4 pr-4">
                              <Link to={`/listing/${listing.id}`} className="flex items-center gap-3 group">
                                <img src={listing.images[0]} className="w-12 h-12 rounded-xl object-cover" />
                                <div>
                                  <p className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-xs">{listing.title}</p>
                                  <p className="text-[10px] text-slate-500">{listing.createdAt}</p>
                                </div>
                              </Link>
                            </td>
                            <td className="py-4 pr-4">
                              <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-300">{listing.category}</span>
                            </td>
                            <td className="py-4 pr-4 font-semibold text-white">{listing.viewsCount}</td>
                            <td className="py-4 pr-4 text-blue-400 font-semibold">{Math.floor(listing.viewsCount * 0.08)}</td>
                            <td className="py-4 pr-4 text-rose-400 font-semibold">{Math.floor(listing.viewsCount * 0.12)}</td>
                            <td className="py-4 pr-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold ${listing.status === 'sold' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {listing.status === 'sold' ? 'Sold' : `${((Math.floor(listing.viewsCount * 0.08) / (listing.viewsCount || 1)) * 100).toFixed(1)}%`}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${listing.status === 'sold' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {listing.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Rating Summary */}
                <div className="lg:w-80 flex-shrink-0 bg-slate-950/50 border border-slate-800/50 rounded-3xl p-8 text-center">
                  <div className="mb-6">
                    <p className="text-6xl font-black text-white">{avgRating}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`w-6 h-6 ${star <= Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-slate-400 mt-2">Based on {reviews.length} reviews</p>
                  </div>

                  {/* Rating Bars */}
                  <div className="space-y-2">
                    {ratingDistribution.map((item) => (
                      <div key={item.star} className="text-left">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-300">{item.star} Star</span>
                          <span className="font-bold text-white">{item.count}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">Customer Reviews ({reviews.length})</h3>
                    <button
                      onClick={() => setIsReviewOpen(true)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2"
                    >
                      <Star className="w-4 h-4 fill-emerald-400" />
                      <span>Write a Review</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-5">
                        <div className="flex items-start gap-4">
                          <img 
                            src={review.authorAvatar} 
                            alt={review.author} 
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white">{review.author}</h4>
                                {review.verified && (
                                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified Purchase
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 shrink-0">{review.date}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[1,2,3,4,5].map(star => (
                                <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                              ))}
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LISTINGS TAB */}
          {activeTab === 'listings' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">All Listings ({sellerListings.length})</h2>
                  <p className="text-xs text-slate-400">Manage and track your classified ads</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex gap-1">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}><Grid className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}><List className="w-4 h-4" /></button>
                  </div>
                  <select className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sellerListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {sellerListings.map((listing) => (
                    <div key={listing.id} className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-4 flex items-center gap-4 group hover:border-emerald-500/30 transition-all">
                      <img src={listing.images[0]} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white truncate">{listing.title}</h4>
                          {listing.featured && <span className="text-[9px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded uppercase">TOP AD</span>}
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${listing.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {listing.status}
                          </span>
                        </div>
                        <p className="text-emerald-400 font-extrabold text-sm mt-1">{formatNGN(listing.price)}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{listing.category} • {listing.location} • {listing.viewsCount} views</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-blue-400">{Math.floor(listing.viewsCount * 0.08)} inquiries</span>
                        <span className="text-sm font-bold text-rose-400">{Math.floor(listing.viewsCount * 0.12)} saves</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sellerListings.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Package className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                  <p className="text-lg font-medium">No listings yet</p>
                  <p className="text-sm mt-1">This seller hasn't posted any ads yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        sellerName={sellerName}
        onAddReview={handleAddReview}
      />
      <MobileNav />
    </div>
  );
};

export default SellerProfile;