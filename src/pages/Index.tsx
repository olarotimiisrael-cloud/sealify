import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ListingCard } from '@/components/ListingCard';
import { FilterDrawer } from '@/components/FilterDrawer';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { SlidersHorizontal, ShieldCheck, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const { listings, searchFilter } = useApp();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter listings based on global search state
  const filteredListings = listings.filter((item) => {
    if (item.status !== 'active') return false;

    if (searchFilter.category !== 'all' && item.category !== searchFilter.category) {
      return false;
    }

    if (searchFilter.condition !== 'all' && item.condition !== searchFilter.condition) {
      return false;
    }

    if (searchFilter.minPrice !== null && item.price < searchFilter.minPrice) {
      return false;
    }

    if (searchFilter.maxPrice !== null && item.price > searchFilter.maxPrice) {
      return false;
    }

    if (
      searchFilter.location &&
      !item.location.toLowerCase().includes(searchFilter.location.toLowerCase())
    ) {
      return false;
    }

    if (searchFilter.query) {
      const q = searchFilter.query.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      return matchTitle || matchDesc;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar onOpenFilter={() => setIsFilterOpen(true)} />

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Buy & Sell Anything safely on Sealify
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 max-w-3xl mx-auto">
            Find Great Deals Near You
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 max-w-xl mx-auto mb-6">
            Over thousands of verified sellers posting cars, phones, housing, and everyday items every minute.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-emerald-200">
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" /> Verified Sellers</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" /> Safe Escrow Communication</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" /> Zero Listing Fees</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full py-6">
        
        {/* Categories Grid */}
        <CategoryGrid />

        {/* Section Header & Active Filters Bar */}
        <div className="flex items-center justify-between mt-8 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Fresh Ads & Trending Items
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredListings.length} items
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="rounded-full border-slate-300 text-slate-700 md:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-1.5" />
            Filters
          </Button>
        </div>

        {/* Listing Cards Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 my-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
              <SlidersHorizontal className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No listings match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your price range, category selection, or search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

      </main>

      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <MobileNav />
      <MadeWithDyad />
    </div>
  );
}