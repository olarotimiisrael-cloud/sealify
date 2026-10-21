import React, { useEffect, useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { AlertTriangle, Users, Package, Gavel, ShieldCheck, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchAdminDisputes, updateAdminDispute } = useSealify();

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminDisputes();
      setDisputes(res?.data || res || []);
    } catch (err: any) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDispute = async (id: string, status: string) => {
    try {
      await updateAdminDispute(id, { status });
      toast.success(`Dispute marked as ${status}`);
      loadDisputes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update dispute');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Admin Disputes — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <Gavel className="w-3 h-3" />
            <span>Trade Disputes</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">Trade Disputes</h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Review and resolve trade disputes between buyers and sellers.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dispute</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buyer</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seller</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-500 text-xs">
                      No disputes found.
                    </td>
                  </tr>
                ) : (
                  disputes.map((d) => (
                    <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-medium text-slate-900 truncate block">{d.title || 'Trade Dispute'}</span>
                            <p className="text-[9px] text-slate-400 truncate max-w-xs">{d.description || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{d.buyer_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{d.seller_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          d.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' : d.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {d.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(d.created_at || d.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateDispute(d.id, 'resolved')}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
                            title="Mark Resolved"
                          >
                            <ShieldCheck className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleUpdateDispute(d.id, 'rejected')}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Reject"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

