import React from 'react';
import { useApp } from '@/context/AppContext';
import { X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/data/mockData';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose }) => {
  const { searchFilter, setSearchFilter, resetFilters } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Filter Ads</h3>
            <p className="text-xs text-slate-500">Refine your marketplace search</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6 text-slate-700">
          
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Category
            </label>
            <select
              value={searchFilter.category}
              onChange={(e) => setSearchFilter((p) => ({ ...p, category: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Price Range ($)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                placeholder="Min"
                value={searchFilter.minPrice ?? ''}
                onChange={(e) =>
                  setSearchFilter((p) => ({
                    ...p,
                    minPrice: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="number"
                placeholder="Max"
                value={searchFilter.maxPrice ?? ''}
                onChange={(e) =>
                  setSearchFilter((p) => ({
                    ...p,
                    maxPrice: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Condition
            </label>
            <select
              value={searchFilter.condition}
              onChange={(e) => setSearchFilter((p) => ({ ...p, condition: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Any Condition</option>
              <option value="Brand New">Brand New</option>
              <option value="Like New">Like New</option>
              <option value="Refurbished">Refurbished</option>
              <option value="Used - Good">Used - Good</option>
              <option value="Used - Fair">Used - Fair</option>
            </select>
          </div>

          {/* Location Search */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Location / City
            </label>
            <input
              type="text"
              placeholder="e.g. Lagos, Ikeja, Lekki..."
              value={searchFilter.location}
              onChange={(e) => setSearchFilter((p) => ({ ...p, location: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Sort By
            </label>
            <select
              value={searchFilter.sortBy}
              onChange={(e) =>
                setSearchFilter((p) => ({
                  ...p,
                  sortBy: e.target.value as any,
                }))
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="newest">Newest Ads First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex-1 rounded-xl border-slate-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            Apply Filters
          </Button>
        </div>

      </div>
    </div>
  );
};