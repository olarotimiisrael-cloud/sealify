import React from 'react';
import { X, Scale, Trash2, ShieldCheck, MapPin, ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';

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
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Compare Classifieds</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{compareItems.length} of 3 spots used</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {compareItems.length > 0 && <button onClick={clearCompare} className="text-[10px] font-black text-slate-500 hover:text-rose-500 uppercase tracking-widest transition-colors">Clear All</button>}
            <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-xl transition-all"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto py-6 no-scrollbar">
          {compareItems.length === 0 ? (
            <div className="py-20 text-center space-y-4 max-w-xs mx-auto">
              <Scale className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-500">No items selected. Use the comparison icon on any ad to compare side-by-side.</p>
            </div>
          ) : (
            <div className="flex gap-4 min-w-full">
              {compareItems.map((item) => (
                <div key={item.id} className="min-w-[280px] sm:min-w-[320px] bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 relative group">
                  <button onClick={() => toggleCompareListing(item.id)} className="absolute top-4 right-4 p-2 bg-slate-900/80 text-slate-500 hover:text-rose-500 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10"><Trash2 className="w-4 h-4" /></button>
                  <div className="space-y-4">
                    <img src={item.images[0]} className="w-full h-40 object-cover rounded-2xl border border-slate-800 shadow-lg" />
                    <div>
                      <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider">{item.category}</span>
                      <h3 className="font-bold text-sm text-white mt-1 line-clamp-2 leading-snug">{item.title}</h3>
                      <p className="text-2xl font-black text-emerald-400 mt-1">₦{item.price.toLocaleString()}</p>
                    </div>
                    <div className="space-y-3 pt-3 border-t border-slate-900 text-xs">
                      <div className="flex justify-between items-center"><span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Condition</span><span className="font-black text-slate-200">{item.condition}</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Store Loc.</span><span className="font-black text-slate-200 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-500" />{item.location.split(',')[0]}</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Seller</span><span className="font-black text-slate-200 flex items-center gap-1">{item.sellerName.split(' ')[0]} {item.sellerVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}</span></div>
                    </div>
                  </div>
                  <Link to={`/listing/${item.id}`} onClick={onClose} className="w-full py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-center text-xs shadow-lg flex items-center justify-center gap-2"><span>View Ad Details</span><ExternalLink className="w-4 h-4" /></Link>
                </div>
              ))}
              {compareItems.length < 3 && <div className="min-w-[280px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700 font-black uppercase text-[10px] tracking-widest gap-2"><Plus className="w-6 h-6" /><span>Slot Available</span></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;