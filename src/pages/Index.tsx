('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [heroSearch, setHeroSearch] = useState('');

  // Sync URL search parameters with filter state
  useEffect(() => {
    const qParam = searchParams.get('q');
    const catParam = searchParams.get('category');
    const locParam = searchParams.get('location');

    if (qParam || catParam || locParam) {
      setFilters((prev) => ({
        ...prev,
        query: qParam || prev.query,
        category: (catParam as any) || prev.category,
        location: locParam || prev.location,
      }));
    }
  }, [searchParams, setFilters]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, query: heroSearch.trim() }));
  };

  const activeAnnouncements = announcements.filter((a) => a.active);

  const listings = listingsData?.listings || [];
  const totalCount = listingsData?.total || 0;

  const filteredListings = useMemo(() => {
    // Additional client-side filtering for features not in API yet
    return listings.filter((item) => {
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (filters.condition !== 'All' && item.condition !== filters.condition) return false;
      return true;
    });
  }, [listings, activeCategory, filters]);

  const recentlyViewed = useMemo(() => {
    return listings.filter(l => recentlyViewedIds.includes(l.id));
  }, [listings, recentlyViewedIds]);

  // AI Recommendation Logic
  const recommendedListings = useMemo(() => {
    if (Object.keys(userInterests).length === 0) return [];
    
    const sortedInterests = Object.entries(userInterests)
      .sort(([, a], [, b]) => b - a)
      .map(([cat]) => cat);

    return listings
      .filter(l => l.status === 'active' && !recentlyViewedIds.includes(l.id))
      .sort((a, b) => {
        const aIndex = sortedInterests.indexOf(a.category);
        const bIndex = sortedInterests.indexOf(b.category);
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      })
      .slice(0, 4);
  }, [listings, userInterests, recentlyViewedIds]);

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (filters.sortBy === 'price-asc') return a.price - b.price;
    if (filters.sortBy === 'price-desc') return b.price - a.price;
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasActiveFilters = Boolean(
    filters.query || 
    filters.category !== 'All' || 
    filters.location || 
    filters.minPrice !== null || 
    filters.maxPrice !== null
  );

  const totalMarketViews = listings.reduce((acc, l) => acc + (l.viewsCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-20 md:pb-0 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <SEO 
        title="Sealify — Nigeria's Trusted Local Marketplace"
        description="Buy, sell, and connect safely with verified sellers in Ogbomoso, Oyo State, and across Nigeria."
      />
      <Navbar />
      <CategoryBar />

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 flex-1 space-y-8 overflow-x-hidden relative">
        {/* HERO SECTION */}
        <section className="relative py-12 sm:py-20 text-center space-y-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none"></div>

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/5">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>{t('trusted_marketplace')}</span>
            </div>
            <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tighter leading-none">
              Trade Securely in <br/>
              <span className="text-emerald-500">Ogbomosoland.</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto font-medium">
              Verified local items, safe meetup locations, and AI-powered pricing. Connect with thousands of buyers in Under G, Takie, and LAUTECH.
            </p>
          </div>

          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto relative z-10 px-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center bg-slate-900 border-2 border-slate-800 focus-within:border-emerald-500 rounded-[2rem] p-2 pr-2.5 transition-all shadow-2xl">
                <Search className="w-6 h-6 text-slate-500 ml-4 shrink-0" />
                <input 
                  type="text" 
                  placeholder={t('search_placeholder')}
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none text-white text-base sm:text-lg px-4 py-3 focus:outline-none placeholder:text-slate-600 font-bold"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition-transform active:scale-95">
                  <span className="hidden sm:inline">FIND DEALS</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mr-1">Trending:</span>
              {['iPhone', 'Toyota', 'Hostel', 'Generator', 'Laptop'].map(tag => (
                <button 
                  key={tag} 
                  type="button"
                  onClick={() => { setHeroSearch(tag); setFilters(f => ({...f, query: tag})); }}
                  className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>
        </section>

        {activeAnnouncements.length > 0 && (
          <div className="space-y-2">
            {activeAnnouncements.map((ann) => (
              <div key={ann.id} className="p-3.5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs shadow-lg animate-in fade-in">
                <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0"><Sparkles className="w-4 h-4 animate-pulse" /></span>
                <p className="min-w-0 truncate"><strong className="text-white font-black">{ann.title}: </strong>{ann.message}</p>
              </div>
            ))}
          </div>
        )}

        <PromotedSpotlightBanner listings={listings} />

        {/* Marketplace Pulse Metrics */}
        {activeCategory === 'All' && !hasActiveFilters && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-xl hover:border-emerald-500/30 transition-colors group">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Market Pulse</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-black text-white">Live</p>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Active Node Trading</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-xl hover:border-blue-500/30 transition-colors group">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Community</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{allUsers.length}</p>
              <p className="text-[11px] text-slate-400 font-medium">Registered Members</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-xl hover:border-amber-500/30 transition-colors group">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Impressions</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{(totalMarketViews / 1000).toFixed(1)}k</p>
              <p className="text-[11px] text-slate-400 font-medium">Cumulative Ad Views</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-xl hover:border-purple-500/30 transition-colors group">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Volume</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{listings.length}</p>
              <p className="text-[11px] text-slate-400 font-medium">Verified Classifieds</p>
            </div>
          </section>
        )}

        {/* Recent Market Activity Ticker */}
        {recentDeals.length > 0 && (activeCategory === 'All') && (
          <section className="bg-slate-900/40 border-y border-slate-800/50 py-3 -mx-4 sm:-mx-8 overflow-hidden">
            <div className="flex items-center gap-4 px-4 whitespace-nowrap">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase shrink-0">
                <Zap className="w-3 h-3 fill-current" />
                <span>Recent Deals</span>
              </div>
              <div className="flex items-center gap-8 animate-marquee">
                {recentDeals.concat(recentDeals).map((deal, idx) => (
                  <div key={`${deal.id}-${idx}`} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-slate-400">Sold:</span>
                    <span className="font-bold text-white">{deal.itemTitle}</span>
                    <span className="text-emerald-400 font-black">{formatNGN(deal.price)}</span>
                    <span className="text-slate-500 text-[10px]">{deal.location}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* AI Recommendations Section */}
        {recommendedListings.length > 0 && activeCategory === 'All' && !hasActiveFilters && (
          <section className="bg-slate-900/50 border border-slate-800/50 p-6 rounded-[2.5rem] space-y-4 animate-in fade-in slide-in-from-right-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">{t('recommended_for_you')}</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('ai_matched')}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedListings.map(item => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Tray */}
        {recentlyViewed.length > 0 && !hasActiveFilters && (
          <section className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-3xl space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Recently Inspected Items</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-bold">{recentlyViewed.length} items</span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {recentlyViewed.map((item) => (
                <a
                  key={item.id}
                  to={`/listing/${item.id}`}
                  className="min-w-[180px] sm:min-w-[200px] bg-slate-950 border border-slate-800 hover:border-emerald-500/40 p-2.5 rounded-2xl flex items-center gap-3 shrink-0 transition-all group"
                >
                  <img src={item.images?.[0]} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" />
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{item.title}</p>
                    <p className="text-xs font-black text-emerald-400">{formatNGN(item.price)}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <CategoryGrid />
        <NeighborhoodFilter />
        <FeaturedVendorsSection />

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Active Filters:</span>

            {filters.query && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-xl">
                <span>Keyword: "{filters.query}"</span>
                <button onClick={() => setFilters(f => ({ ...f, query: '' }))} className="hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}

            {filters.category !== 'All' && (
              <span className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold px-2.5 py-1 rounded-xl">
                <span>Category: {filters.category}</span>
                <button onClick={() => setFilters(f => ({ ...f, category: 'All' }))} className="hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}

            {filters.location && (
              <span className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold px-2.5 py-1 rounded-xl">
                <span>Location: {filters.location}</span>
                <button onClick={() => setFilters(f => ({ ...f, location: '' }))} className="hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}

            {(filters.minPrice !== null || filters.maxPrice !== null) && (
              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-xl">
                <span>Price: {filters.minPrice ? formatNGN(filters.minPrice) : '₦0'} - {filters.maxPrice ? formatNGN(filters.maxPrice) : 'Any'}</span>
                <button onClick={() => setFilters(f => ({ ...f, minPrice: null, maxPrice: null }))} className="hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-[10px] font-black uppercase text-rose-400 hover:underline ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear All
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{t('marketplace_feed')}</h2>
              <span className="text-[10px] bg-slate-900 text-emerald-400 font-extrabold px-3 py-1 rounded-full border border-slate-800 shadow">
                {totalCount} ads
              </span>
            </div>
            {filters.query && (
              <p className="text-xs text-slate-400 mt-1">
                Showing results for "<strong className="text-emerald-400">{filters.query}</strong>"
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button onClick={() => setIsAlertsOpen(true)} className="px-3 py-2 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition-colors">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>{t('search_alerts')}</span>
            </button>
            <button onClick={() => setIsCompareOpen(true)} className="px-3 py-2 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition-colors">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>{t('compare')} ({compareListingIds.length})</span>
            </button>
            <button onClick={() => setIsFilterOpen(true)} className="px-3 py-2 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition-colors">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>{t('filters')}</span>
            </button>
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shrink-0">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}><Grid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-lg ${viewMode === 'map' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}><MapPin className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {viewMode === 'map' ? (
          <MapView listings={sortedListings} />
        ) : sortedListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {sortedListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs my-6 space-y-4 shadow-xl">
            <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto border border-slate-800">
              <Package className="w-8 h-8 text-slate-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No ads found matching your criteria</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Try clearing your search keyword, category, or location filters to view all listings.</p>
            </div>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs hover:bg-emerald-400 transition-colors shadow-lg"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Floating AI Copilot Action Widget */}
        <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-30">
          <button
            onClick={() => setIsAiCopilotOpen(true)}
            className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black px-4 py-3 rounded-full shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all border-2 border-white/20"
            title="Open Sealify AI Shopping Copilot"
          >
            <Bot className="w-5 h-5 stroke-[2.5] animate-pulse" />
            <span className="text-xs tracking-tight hidden sm:inline">AI Copilot</span>
          </button>
        </div>

      </main>

      <Footer />
      <MobileNav />
      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <CompareModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />
      <SavedAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
      <AiShoppingAssistantModal isOpen={isAiCopilotOpen} onClose={() => setIsAiCopilotOpen(false)} />
    </div>
  );
}