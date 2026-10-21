import React, { useState, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Grid, Home, Package, Smartphone, Shirt, Sofa, Car, Briefcase, Zap, Leaf, Building, Paw, Laptop, Book, Clock, ArrowRight } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  vehicles: Car,
  property: Home,
  electronics: Laptop,
  fashion: Shirt,
  home_furniture: Sofa,
  services: Wrench,
  jobs: Briefcase,
  beauty_health: Zap,
  utility_energy: Zap,
  solar_clean_energy: Leaf,
  agriculture: Leaf,
  business_industry: Building,
  pets: Paw,
};

export default function Categories() {
  const { categories, t } = useSealify();
  const [catList, setCatList] = useState<any[]>([]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCatList(categories);
    }
  }, [categories]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Categories — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <Grid className="w-3 h-3" />
            <span>Browse Categories</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">
            Everything You Need
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Discover verified items and local services across Ogbomosoland and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {catList.length > 0 ? (
            catList.map((cat: any) => {
              const IconComponent = CATEGORY_ICONS[cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '_')] || Package;
              const itemCount = cat._count?.listings || cat.listings_count || 0;
              return (
                <Link key={cat.id} to={`/categories/${cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}`} className="group block">
                  <div className="bg-white border border-slate-200 rounded-[2.5rem] p-5 sm:p-7 transition-all hover:shadow-xl hover:border-emerald-500/50 h-full flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300 border border-emerald-100">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base mb-1 group-hover:text-emerald-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">{itemCount} items</p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Grid className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">No categories available</h3>
              <p className="text-slate-500 text-xs">Check back soon for new categories.</p>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

