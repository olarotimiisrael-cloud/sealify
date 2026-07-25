import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ShieldCheck, Lock, Search, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Fingerprint } from 'lucide-react';

export const EscrowVerifier: React.FC = () => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<'valid' | 'invalid' | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsVerifying(true);
    setResult(null);

    // Simulate forensic blockchain-style verification
    setTimeout(() => {
      setIsVerifying(false);
      // Mock logic: if code starts with ESC it's valid for demo
      if (code.toUpperCase().startsWith('ESC-') && code.length >= 8) {
        setResult('valid');
      } else {
        setResult('invalid');
      }
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">
      <SEO 
        title="Safe Escrow Code Verifier — Sealify Nigeria" 
        description="Verify the authenticity of a Sealify Escrow Lock Code to ensure your transaction funds are held in secure neutral custody." 
      />
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-12 flex-1 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            <ShieldCheck className="w-4 h-4" />
            <span>Forensic Escrow Protection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">Code Authenticator</h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Received an Escrow Lock Code during a chat? Verify its status here to ensure funds are 100% secured by Sealify Node Administrators before proceeding with inspection.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <form onSubmit={handleVerify} className="relative z-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Unique Vault Lock Code</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Fingerprint className="w-5 h-5 text-teal-500 absolute left-4 top-4" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ESC-940281"
                    className="w-full bg-slate-950 border-2 border-slate-800 focus:border-teal-500 rounded-2xl pl-12 pr-4 py-4 text-lg font-mono font-black text-white focus:outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-8 py-4 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-slate-950 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Verify Security Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {result === 'valid' && (
              <div className="bg-emerald-500/10 border border-emerald-500/40 p-6 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Vault Code Authenticated</h3>
                    <p className="text-xs text-emerald-400 font-bold">Status: FUNDS SECURED & LOCKED IN NEUTRAL CUSTODY</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                   <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                      <p className="text-slate-500 font-bold uppercase text-[9px]">Protection Level</p>
                      <p className="text-white font-bold">100% Seller-Settle Guaranteed</p>
                   </div>
                   <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                      <p className="text-slate-500 font-bold uppercase text-[9px]">Release Condition</p>
                      <p className="text-white font-bold">Physical Buyer Approval Only</p>
                   </div>
                </div>
              </div>
            )}

            {result === 'invalid' && (
              <div className="bg-rose-500/10 border border-rose-500/40 p-6 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Security Alert: Invalid Code</h3>
                    <p className="text-xs text-rose-400 font-bold">Warning: NO ACTIVE VAULT FOUND FOR THIS RECORD</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The code you entered does not match any active escrow locks in the Ogbomoso Node. <strong>DO NOT proceed with payment</strong> or commitment fees if the seller provided this code manually.
                </p>
              </div>
            )}
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <Lock className="w-6 h-6 text-teal-400" />
              <h4 className="font-black text-white text-sm">Anti-Fraud Layer</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Prevents sellers from generating fake confirmation messages or "escrow" claims without actual fund backing.</p>
           </div>
           <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h4 className="font-black text-white text-sm">100% Reversible</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">If the item fails physical inspection at the safe meetup spot, funds are instantly returned to the buyer wallet.</p>
           </div>
           <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <CheckCircle2 className="w-6 h-6 text-blue-400" />
              <h4 className="font-black text-white text-sm">Verified Release</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Funds are only settled to the seller once the buyer scans the QR code or approves handover in person.</p>
           </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default EscrowVerifier;