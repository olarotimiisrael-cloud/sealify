import React from 'react';
import { useSealify } from '../context/SealifyContext';
import { Category, Condition } from '../types/sealify';
import { Filter, RotateCcw, X, MapPin, Tag } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

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

const CONDITIONS: (Condition | 'All')[] = [
  'All',
  'Brand New',
  'Like New',
  'Used - Good',
  'Used - Fair',
];

const POPULAR_CITIES = [
  'Ogbomoso',
  'Ibadan',
  'Ilorin',
  'Osogbo',
  'Abeokuta',
  'Lagos',
];

const BUDGET_PRESETS = [
  { label: 'Under ₦50k', min: null, max: 50000 },
  { label: 'Under ₦250k', min: null, max: 250000 },
  { label: 'Under ₦1M', min: null, max: 1000000 },
  { label: '₦1M+', min: 1000000, max: null },
];

const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters, resetFilters } = useSealify();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex justify-end font-sans">
      <div className="w-full max-w-md bg-white h-full overflow-y-auto p-6 space-y-6 shadow-2xl border-l border-slate-200 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <Filter className="w-5 h-5 text-emerald-600" />
            <span>Filter Classifieds</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <span>Budget Presets</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {BUDGET_PRESETS.map((preset) => {
              const isSelected = filters.maxPrice === preset.max && filters.minPrice === preset.min;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      minPrice: preset.min,
                      maxPrice: preset.max,
                    }))
                  }
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
                className={`py-2 px-3 rounded-xl text-xs font-medium text-left transition-colors ${
                  filters.category === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-100/80 text-slate-300 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Custom Price Range (₦ NGN)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minPrice: e.target.value ? Number(e.target.value) : null
                }))
              }
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-slate-600">-</span>
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxPrice: e.target.value ? Number(e.target.value) : null
                }))
              }
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Location</label>
          <input
            type="text"
            placeholder="e.g. Ogbomoso, Ibadan, Ilorin"
            value={filters.location}
            onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
          />

          <div className="flex flex-wrap gap-1.5 pt-1">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    location: prev.location === city ? '' : city
                  }))
                }
                className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                  filters.location.toLowerCase().includes(city.toLowerCase())
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                    : 'border-slate-200 bg-slate-100/60 text-slate-600 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>{city}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Condition</label>
          <div className="space-y-1">
            {CONDITIONS.map((cond) => (
              <label
                key={cond}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 cursor-pointer text-sm"
              >
                <span className={filters.condition === cond ? 'text-emerald-600 font-semibold' : 'text-slate-300'}>
                  {cond}
                </span>
                <input
                  type="radio"
                  name="condition"
                  checked={filters.condition === cond}
                  onChange={() => setFilters((prev) => ({ ...prev, condition: cond }))}
                  className="accent-emerald-500"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as 'newest' | 'price-asc' | 'price-desc'
              }))
            }
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
          <button
            onClick={resetFilters}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-300 font-semibold rounded-xl text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;

