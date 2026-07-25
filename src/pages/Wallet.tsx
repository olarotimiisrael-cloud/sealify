import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  CreditCard,
  Plus,
  RefreshCw,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export const Wallet: React.FC = () => {
  const { wallet, transactions, requestPayout, user } = useSealify();
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const handlePayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payoutAmount);
    if (!amount || amount < 1000) {
      toast.error('Minimum payout is ₦1,000');
      return;
    }
    requestPayout(amount);
    setIsPayoutModalOpen(false);
    setPayoutAmount('');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-20 font-sans">
      <SEO title="Merchant Wallet & Payouts — Sealify" />
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8 flex-1">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Merchant Wallet</h1>
            <p className="text-xs text-slate-400 mt-1">Manage your earnings and withdraw funds to your local bank</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Secure Payments Node</span>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-500/20 space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Available Balance</span>
              <WalletIcon className="w-5 h-5 text-white/50" />
            </div>
            <p className="text-4xl font-black text-white">{formatNGN(wallet?.balance || 0)}</p>
            <button 
              onClick={() => setIsPayoutModalOpen(true)}
              className="w-full py-3 bg-white text-emerald-700 font-black rounded-2xl text-xs shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              WITHDRAW TO BANK
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Escrow Pending</span>
            </div>
            <p className="text-2xl font-black text-white">{formatNGN(wallet?.pendingBalance || 0)}</p>
            <p className="text-[10px] text-slate-500">Locked until buyers confirm delivery</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Withdrawn</span>
            </div>
            <p className="text-2xl font-black text-emerald-400">{formatNGN(wallet?.totalWithdrawn || 0)}</p>
            <p className="text-[10px] text-slate-500">Lifetime earnings processed</p>
          </div>
        </div>

        {/* Transaction History */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Recent Transactions</h2>
            <button className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:underline flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Refresh Feed
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl divide-y divide-slate-800">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs italic">No financial activity recorded yet.</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl border ${
                      tx.type === 'sale' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      tx.type === 'payout' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {tx.type === 'sale' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{tx.description}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-2">
                        {tx.createdAt} • <span className="uppercase font-black text-emerald-500/80">{tx.status}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${tx.amount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {tx.amount > 0 ? '+' : '-'}{formatNGN(tx.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Bank Details Hint */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-start gap-4">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-white uppercase tracking-widest">Settlement Bank</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Withdrawals are processed to the bank account linked in your profile settings. Standard settlement time is 2-4 hours across the Ogbomoso Node.
            </p>
          </div>
        </div>
      </main>

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative text-slate-100">
            <button 
              onClick={() => setIsPayoutModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>

            <form onSubmit={handlePayout} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Request Payout</h2>
                <p className="text-xs text-slate-400">Available to withdraw: {formatNGN(wallet?.balance || 0)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Amount to Withdraw (₦)</label>
                <input
                  type="number"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Minimum 1,000"
                  className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-2xl px-4 py-4 text-2xl font-black text-emerald-400 focus:outline-none transition-all placeholder:text-slate-800"
                />
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span>NETWORK FEE</span>
                  <span>₦0.00</span>
                </div>
                <div className="flex justify-between items-center text-xs font-black text-white">
                  <span>YOU WILL RECEIVE</span>
                  <span className="text-emerald-400">{formatNGN(Number(payoutAmount) || 0)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all active:scale-95"
              >
                CONFIRM WITHDRAWAL
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Wallet;