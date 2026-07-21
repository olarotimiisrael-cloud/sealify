import React from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import { Bell, ShieldCheck, Info } from 'lucide-react';

const FAQ: React.FC = () => {
  const { isAuthenticated } = useSealify();

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <div className="Navbar" />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-slate-400 text-sm">
              Find answers to common questions about buying and selling on Sealify
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="font-bold text-xl text-white">General Questions</h2>
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <Info className="w-5 h-5 text-emerald-400 mr-2" />
                <p className="text-slate-300">
                  <strong>What is Sealify?</strong> Sealify is a local classifieds marketplace connecting buyers and sellers in Ogbomoso and surrounding areas.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <Info className="w-5 h-5 text-emerald-400 mr-2" />
                <p className="text-slate-300">
                  <strong>Is Sealify free to use?</strong> Yes! Listing items and browsing is completely free. We may introduce premium features in the future.
                </p>
              </div>
            </div>

            <h2 className="font-bold text-xl text-white">Transaction Questions</h2>
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2" />
                <p className="text-slate-300">
                  <strong>How do I pay for items?</strong> All transactions are conducted directly between buyers and sellers. We recommend meeting in person and using cash or secure payment methods.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2" />
                <p className="text-slate-300">
                  <strong>Is there a fee for sellers?</strong> No, listing items is completely free. We do not charge any fees for successful sales.
                </p>
              </div>
            </div>

            <h2 className="font-bold text-xl text-white">Safety & Security</h2>
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2" />
                <p className="text-slate-300">
                  <strong>What safety measures does Sealify have?</strong> We require all meetups to happen in public, well-lit areas. Our Safe Meetup Zones include police stations, libraries, and shopping centers.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2" />
                <p className="text-slate-300">
                  <strong>How do I report suspicious listings?</strong> Use the "Report Listing" button on any ad. Our safety team will review all reports within 24 hours.
                </p>
              </div>
            </div>

            <h2 className="font-bold text-xl text-white">Support</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-400" />
                <a href="mailto:support@sealify.ng" className="text-emerald-400 hover:text-white transition-colors">
                  support@sealify.ng
                </a>
              </div>
              <p className="text-slate-400">
                Our support team is available Monday-Friday 9AM-5PM. Response time: within 24 hours.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 text-center">
            <p className="text-slate-400">&copy; {new Date().getFullYear()} Sealify Classifieds. All rights reserved.</p>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default FAQ;