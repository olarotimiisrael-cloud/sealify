import React from 'react';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import { X, Check, MapPin, Eye, Tag, ShieldCheck, ArrowRight } from 'lucide-react';

interface ComparisonTableProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ isOpen, onClose }) => {
  const { compareListingIds, listings, toggleCompareListing } = useSealify();

  if (!isOpen) return null;

  const compareItems = listings.filter((l) => compareListingIds.includes(l.id));

  if (compareItems.length < 2) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const attributes = [
    { key: 'price', label: 'Price', formatter: formatNGN },
    { key: 'category', label: 'Category' },
    { key: 'condition', label: 'Condition' },
    { key: 'location', label: 'Location' },
    { key: 'viewsCount', label: 'Views', formatter: (v: number) => v.toLocaleString() },
    { key: 'createdAt', label: 'Posted' },
    { key: 'sellerName', label: 'Seller' },
    { key: 'sellerVerified', label: 'Verified', formatter: (v: boolean) => v ? 'Yes' : 'No' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-white/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative text-slate-900 max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-500/30">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Compare Classifieds</h2>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{compareItems.length} of 3 items selected</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-750 text-slate-600 hover:text-slate-900 rounded-xl transition-all"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-x-auto py-6 no-scrollbar">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left text-slate-600 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-900 uppercase tracking-wider text-[10px]">Attribute</th>
                {compareItems.map((item) => (
                  <th key={item.id} className="p-4 font-bold text-slate-900 text-sm">
                    <img src={item.images[0]} className="w-12 h-12 rounded-xl object-cover mb-2" />
                    <div className="truncate max-w-xs">{item.title}</div>
                    <span className="text-emerald-600 font-black text-xs">{formatNGN(item.price)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {attributes.map((attr) => (
                <tr key={attr.key}>
                  <td className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider">{attr.label}</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="p-4 text-slate-900 text-sm">
                      {attr.key === 'sellerVerified' ? (
                        <span className={`font-bold ${item.sellerVerified ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {item.sellerVerified ? '✓ Verified' : 'Not Verified'}
                        </span>
                      ) : attr.formatter ? (
                        attr.formatter(item[attr.key as keyof typeof item] as never)
                      ) : (
                        item[attr.key as keyof typeof item] as string
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-between gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-sm transition-colors">
            Close Comparison
          </button>
          <button className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow-lg transition-colors">
            View Details Side-by-Side
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;

