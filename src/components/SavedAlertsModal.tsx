import React, { useState } from 'react';
import { X, Bell, Plus, Trash2, CheckCircle, Sparkles, Filter } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';
import { SearchAlert } from '../types/sealify';
import { toast } from 'sonner';

interface SavedAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedAlertsModal: React.FC<SavedAlertsModalProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters } = useSealify();

  const [alerts, setAlerts] = useState<SearchAlert[]>([
    {
      id: 'alt_1',
      query: 'Tesla Model 3',
      category: 'Vehicles',
      maxPrice: 30000000,
      location: 'Ogbomoso',
      createdAt: '2 days ago',
      matchCount: 3,
    },
    {
      id: 'alt_2',
      query: 'MacBook Pro M2',
      category: 'Electronics',
      maxPrice: 1500000,
      location: 'Ibadan',
      createdAt: '1 week ago',
      matchCount: 5,
    },
  ]);

  if (!isOpen) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSaveCurrentFilter = () => {
    const query = filters.searchQuery || filters.category;
    if (query === 'All' && !filters.location) {
      toast.error('Please enter a search keyword or location before saving an alert');
      return;
    }

    const newAlert: SearchAlert = {
      id: 'alt_' + Date.now(),
      query: filters.searchQuery || `${filters.category} items`,
      category: filters.category,
      maxPrice: filters.maxPrice,
      location: filters.location || 'Any Location',
      createdAt: 'Just now',
      matchCount: 1,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    toast.success(`Search alert saved for "${newAlert.query}"!`);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.info('Search alert removed');
  };

  const handleApplyAlert = (alert: SearchAlert) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: alert.query.includes('items') ? '' : alert.query,
      category: (alert.category as any) || 'All',
      maxPrice: alert.maxPrice,
      location: alert.location === 'Any Location' ? '' : alert.location,
    }));
    toast.success(`Applied search alert for "${alert.query}"`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Saved Search Alerts</h3>
            <p className="text-xs text-slate-400">Get notified when matching classifieds are posted</p>
          </div>
        </div>

        <div className="my-4 p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
          <div className="text-xs min-w-0">
            <p className="font-bold text-white truncate">
              {filters.searchQuery || filters.category || 'Active Filter'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {filters.location ? `In ${filters.location}` : 'All Locations'} • {filters.maxPrice ? `Under ₦${filters.maxPrice.toLocaleString()}` : 'Any Price'}
            </p>
          </div>

          <button
            onClick={handleSaveCurrentFilter}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shrink-0 flex items-center gap-1 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Alert</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No saved alerts yet.</div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.id}
                className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-white truncate">{alt.query}</h4>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full shrink-0">
                      {alt.matchCount} new
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {alt.category} • {alt.location} {alt.maxPrice ? `(Max ₦${alt.maxPrice.toLocaleString()})` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleApplyAlert(alt)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-xl text-xs font-semibold"
                    title="Apply filter"
                  >
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alt.id)}
                    className="p-2 bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl"
                    title="Delete alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedAlertsModal;