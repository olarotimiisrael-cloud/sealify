import React, { useState, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { CreditCard, History, Clock, AlertCircle, Banknote, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Payments() {
  const [tab, setTab] = useState<'initiate' | 'history'>('initiate');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const { initiatePayment, fetchPayments, verifyPayment } = useSealify();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await fetchPayments();
      setPayments(res?.data || res || []);
    } catch (err: any) {
      // Silent fail - payments may not exist yet
    }
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await initiatePayment({ amount: Number(amount) });
      toast.success('Payment initiated! Redirecting to Paystack...');
      // In production, redirect to Paystack checkout URL
      if (res?.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!reference) return;
    setLoading(true);
    try {
      const res = await verifyPayment(reference);
      toast.success(res?.status === 'success' ? 'Payment verified!' : 'Payment verification completed');
      loadPayments();
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Payments — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <CreditCard className="w-3 h-3" />
            <span>Payments</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">Payments</h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Secure payments powered by Paystack. Pay for promotions, listings, and services safely.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Initiate Payment */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900">Initiate Payment</h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NGN</span>
              </div>

              <form onSubmit={handleInitiate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount (₦)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 text-xs">₦</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 text-lg text-slate-900 font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                      placeholder="5000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {[1000, 5000, 10000].forEach((amt) => {
                    (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt.toString())}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                          amount === amt.toString()
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                        }`}
                      >
                        ₦{amt.toLocaleString()}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  disabled={loading || !amount}
                  className={`w-full py-3.5 rounded-xl text-xs font-black transition-all ${
                    loading || !amount
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 active:scale-95'
                  }`}
                >
                  {loading ? 'Processing...' : 'Pay with Paystack'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>Payments are processed instantly via Paystack.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verify Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm h-[340px]">
              <h2 className="text-xl font-black text-slate-900 mb-6">Verify Payment</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reference</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="Enter Paystack reference"
                  />
                </div>
                <button
                  onClick={handleVerify}
                  disabled={loading || !reference}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                    loading || !reference
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  }`}
                >
                  {loading ? 'Verifying...' : 'Verify Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900">Payment History</h2>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{payments.length} transactions</span>
          </div>

          {payments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 text-center">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2">No payments yet</h3>
              <p className="text-slate-500 text-xs">Your payment history will appear here.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.reference || p.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs font-medium text-slate-700 truncate max-w-xs">{p.reference || p.id}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">₦{Number(p.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          p.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(p.created_at || p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

