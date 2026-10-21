import React from 'react';
import { X, FileSpreadsheet, Printer, TrendingUp, DollarSign, Eye, Download } from 'lucide-react';
import { Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import { toast } from 'sonner';

interface SalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userListings: Listing[];
}

export const SalesReportModal: React.FC<SalesReportModalProps> = ({
  isOpen,
  onClose,
  userListings,
}) => {
  const { user } = useSealify();

  if (!isOpen) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const activeAds = userListings.filter((l) => l.status === 'active');
  const soldAds = userListings.filter((l) => l.status === 'sold');
  const activeCount = activeAds.length;

  const totalActiveValue = activeAds.reduce((acc, l) => acc + l.price, 0);
  const totalRealizedRevenue = soldAds.reduce((acc, l) => acc + l.price, 0);
  const totalViews = userListings.reduce((acc, l) => acc + (l.viewsCount || 0), 0);
  const avgPrice = userListings.length > 0 ? Math.round((totalActiveValue + totalRealizedRevenue) / userListings.length) : 0;

  const currentDate = new Date().toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleExportCSV = () => {
    if (userListings.length === 0) {
      toast.error('No listings available to export');
      return;
    }

    const headers = ['Listing ID', 'Title', 'Category', 'Condition', 'Price (NGN)', 'Status', 'Views', 'Location', 'Date Created'];
    const rows = userListings.map((l) => [
      l.id,
      `"${l.title.replace(/"/g, '""')}"`,
      l.category,
      l.condition,
      l.price,
      l.status,
      l.viewsCount || 0,
      `"${l.location}"`,
      l.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sealify_Sales_Report_${user?.fullName?.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Inventory & Sales report exported to CSV!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Merchant Sales & Inventory Report</h2>
              <p className="text-xs text-slate-600">Account Summary for {user?.fullName || 'Vendor'}</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-500/20">
            {currentDate}
          </span>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Active Inventory</span>
            <p className="text-xl font-black text-emerald-600">{formatNGN(totalActiveValue)}</p>
            <p className="text-[10px] text-slate-600">{activeCount} Active Ads</p>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Realized Revenue</span>
            <p className="text-xl font-black text-teal-600">{formatNGN(totalRealizedRevenue)}</p>
            <p className="text-[10px] text-slate-600">{soldAds.length} Items Sold</p>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Cumulative Views</span>
            <p className="text-xl font-black text-amber-600">{totalViews.toLocaleString()}</p>
            <p className="text-[10px] text-slate-600">Buyer Impressions</p>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Average Unit Price</span>
            <p className="text-xl font-black text-purple-600">{formatNGN(avgPrice)}</p>
            <p className="text-[10px] text-slate-600">Across {userListings.length} Total Ads</p>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Top Performing Items in Store</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {userListings.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-600">No inventory records found.</div>
            ) : (
              userListings
                .slice()
                .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-600">{item.category} • {item.condition}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-black text-emerald-600">{formatNGN(item.price)}</p>
                      <span className="text-[10px] text-slate-600 flex items-center gap-1 justify-end">
                        <Eye className="w-3 h-3" /> {item.viewsCount || 0} views
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
          <button
            onClick={handleExportCSV}
            className="py-3 bg-slate-100 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV Spreadsheet</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesReportModal;

