import React, { useState, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ShieldCheck, FileText, Clock, AlertCircle, CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Kyc() {
  const [status, setStatus] = useState<any>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { fetchKycStatus, submitKyc } = useSealify();

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await fetchKycStatus();
      setStatus(res?.data || res);
    } catch (err: any) {
      // Silent fail
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitKyc({ documents: documents.map((f) => f.name) });
      setStatus({ status: 'submitted' });
      setDocuments([]);
      toast.success('KYC submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'KYC submission failed');
    } finally {
      setLoading(false);
    }
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-600',
    submitted: 'bg-blue-100 text-blue-600',
    approved: 'bg-emerald-100 text-emerald-600',
    rejected: 'bg-rose-100 text-rose-600',
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="KYC Verification — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <ShieldCheck className="w-3 h-3" />
            <span>KYC Verification</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">Verify Your Identity</h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl">
            Complete KYC to become a verified seller and build buyer trust. Verified sellers get 50% more inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KYC Status */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6">Verification Status</h2>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Current Status</h3>
                    <p className="text-xs text-slate-500">Your verification review status</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusColor[status?.status || 'pending']}`}>
                    {(status?.status || 'pending').charAt(0).toUpperCase() + (status?.status || 'pending').slice(1)}
                  </span>
                </div>

                {status?.submitted_at && (
                  <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Submitted At</h3>
                      <p className="text-xs text-slate-500">When you submitted your documents</p>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">{new Date(status.submitted_at).toLocaleDateString()}</span>
                  </div>
                )}

                {status?.reviewed_at && (
                  <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Reviewed At</h3>
                      <p className="text-xs text-slate-500">When your documents were reviewed</p>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">{new Date(status.reviewed_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Required Documents</h3>
                <div className="space-y-3">
                  {[
                    { name: 'National ID (NIN)', icon: <Mail className="w-4 h-4" /> },
                    { name: 'Business Registration (CAC)', icon: <FileText className="w-4 h-4" /> },
                    { name: 'Proof of Address', icon: <MapPin className="w-4 h-4" /> },
                    { name: 'Selfie Verification', icon: <AlertCircle className="w-4 h-4" /> },
                  ].map((doc) => (
                    <div key={doc.name} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        {doc.icon}
                      </div>
                      <span className="text-xs text-slate-700 font-medium">{doc.name}</span>
                      <span className="ml-auto text-[10px] text-slate-400">Required</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit KYC */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm h-[400px]">
              <h2 className="text-xl font-black text-slate-900 mb-6">Submit Documents</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upload Documents</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer group">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleDocChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-slate-400 mb-2 group-hover:text-emerald-600 transition-colors" />
                      <span className="text-xs text-slate-600 font-medium group-hover:text-emerald-600">Click to upload documents</span>
                      <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (max 5MB each)</p>
                    </div>
                  </div>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    {documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="text-xs text-slate-700 truncate flex-1">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => setDocuments(documents.filter((_, j) => j !== i))}
                          className="text-[9px] text-rose-500 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || documents.length === 0}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all ${
                    loading || documents.length === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 active:scale-95'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit KYC Documents'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-[10px] text-slate-500">
                  Review takes 24 hours. You'll be notified via email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

