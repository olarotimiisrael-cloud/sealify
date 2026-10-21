import React, { useEffect, useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Gavel, AlertCircle, ShieldCheck, FileText, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchAdminReports, updateAdminReport } = useSealify();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminReports();
      setReports(res?.data || res || []);
    } catch (err: any) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReport = async (id: string, status: string) => {
    try {
      await updateAdminReport(id, { status });
      toast.success(`Report marked as ${status}`);
      loadReports();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update report');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Admin Reports — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <AlertCircle className="w-3 h-3" />
            <span>Reports & Disputes</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">Reports & Disputes</h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Review user-reported issues and trade disputes.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Report</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reporter</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-500 text-xs">
                      No reports found.
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-medium text-slate-900 truncate block">{r.title || 'Untitled Report'}</span>
                            <p className="text-[9px] text-slate-400 truncate max-w-xs">{r.description || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{r.reporter_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          r.type === 'dispute' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {r.type || 'report'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          r.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' : r.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(r.created_at || r.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateReport(r.id, 'resolved')}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
                            title="Mark Resolved"
                          >
                            <ShieldCheck className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleUpdateReport(r.id, 'rejected')}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Reject"
                          >
                            <AlertCircle className="w-3 h-3" />
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

