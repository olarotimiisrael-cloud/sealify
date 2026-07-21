import React from 'react';
import { useSealify } from '../context/SealifyContext';
import { X, Scale, Trash2, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose }) => {
  const { compareListingIds, listings, toggleCompareListing, clearCompare } = useSealify();

  if (!isOpen) return null;

  const compareItems = listings.filter((l) => compareListingIds.includes(l.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-black text-white">Ad Comparison Matrix</h2>
            <span className="text-xs bg-slate-800 text-slate-400 font-bold px-2.5 py-0.5 rounded-full">
              {compareItems.length} of 3 items
            </span>
          </div>

          <div className="flex items-center gap-3">
            {compareItems.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs text-slate-400 hover:text-red-400 font-semibold"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Matrix comparison table */}
        <div className="flex-1 overflow-x-auto py-6">
          {compareItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-3">
              <Scale className="w-10 h-10 text-slate-600 mx-auto" />
              <p>No listings selected for comparison.</p>
              <p className="text-[11px] text-slate-500">Click the scale/compare icon on any item card to compare side-by-side.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[600px]">
              {compareItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 relative"
                >
                  <button
                    onClick={() => toggleCompareListing(item.id)}
                    className="absolute top-3 right-3 p-1.5 bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg"
                    title="Remove from comparison"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-3">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-36 object-cover rounded-xl border border-slate-800"
                    />

                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-sm text-white mt-1 line-clamp-2">{item.title}</h3>
                      <p className="text-2xl font-black text-emerald-400 mt-1">${item.price.toLocaleString()}</p>
                    </div>

                    {/* Comparison rows */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Condition</span>
                        <span className="font-bold text-slate-200">{item.condition}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Location</span>
                        <span className="font-bold text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {item.location}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Seller</span>
                        <span className="font-bold text-slate-200 flex items-center gap-1">
                          {item.sellerName}
                          {item.sellerVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Total Views</span>
                        <span className="font-semibold text-slate-300">{item.viewsCount} views</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/listing/${item.id}`}
                    onClick={onClose}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs text-center flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>View Ad Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;