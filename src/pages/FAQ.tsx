import React from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import { 
  Bell, 
  ShieldCheck, 
  Info, 
  BookOpen, 
  Phone, 
  Calendar, 
  Mail, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

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
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
              <Info className="w-4 h-4" />
              <span>Help Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-slate-400 text-sm">
              Find answers to common questions about buying and selling on Sealify
            </p>
          </div>

          <div className="space-y-6">
            {/* General Questions */}
            <h2 className="font-bold text-xl text-white">General Questions</h2>
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <Info className="w-5 h-5 text-emerald-400 mr-2 inline-block" />
                <p className="text-slate-300 inline">
                  <strong>What is Sealify?</strong> Sealify is a local classifieds marketplace connecting buyers and sellers in Ogbomoso and surrounding areas.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <Info className="w-5 h-5 text-emerald-400 mr-2 inline-block" />
                <p className="text-slate-300 inline">
                  <strong>Is Sealify free to use?</strong> Yes! Listing items and browsing is completely free. We may introduce premium features in the future.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <Info className="w-5 h-5 text-emerald-400 mr-2 inline-block" />
                <p className="text-slate-300 inline">
                  <strong>Do I need to verify my identity?</strong> Basic accounts don't require verification, but verified sellers gain trust indicators and better visibility.
                </p>
              </div>
            </div>

            {/* Transaction Questions */}
            <h2 className="font-bold text-xl text-white">Transaction Questions</h2>
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2 inline-block" />
                <p className="text-slate-300 inline">
                  <strong>How do I make a payment?</strong> All payments are conducted directly between buyers and sellers. We recommend meeting in person and using cash or secure payment methods.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2 inline-block" />
                <p className="text-slate-300 inline">
                  <strong>What if I receive a counterfeit item?</strong> Report the listing immediately using the <span className="text-emerald-400 hover:underline">Report Listing</span> button. Our safety team will investigate within 24 hours.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2 inline-block" />
                <p className="text-slate-300 inline">
                  <strong>Can I negotiate prices?</strong> Yes! Use the <span className="text-emerald-400 hover:underline">Make an Offer</span> feature to send price proposals to sellers.
                </p>
              </div>
            </div>

            {/* Safety & Security */}
            <h2 className="font-bold text-xl text-white">Safety & Security</h2>
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2 inline-block" />
                <p className="text-slate-300 inline">
                  <strong>Where are safe meetup locations?</strong> Use our <span className="text-emerald-400 hover:underline">Safe Meetup Zones</span> feature to find police stations, libraries, and shopping centers with CCTV coverage.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2 inline-block" />
                <p className="text-slate-300 inline">
                  <strong>How do I report suspicious activity?</strong> Use the <span className="text-emerald-400 hover:underline">Report Listing</span> button on any ad. Our safety team will review all reports promptly.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2 inline-block" />
                <p className="text-slate-300 inline">
                  <strong>Is my personal information protected?</strong> Yes. We never share your contact details with other users without your permission.
                </p>
              </div>
            </div>

            {/* Support & Contact */}
            <h2 className="font-bold text-xl text-white">Support & Contact</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl">
                <Phone className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-bold text-white"><strong>Phone Support:</strong> +234 800 000 0000</p>
                  <p className="text-slate-400">Available Mon-Fri 9AM-5PM</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl">
                <Mail className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-bold text-white"><strong>Email Us:</strong> support@sealify.ng</p>
                  <p className="text-slate-400">Response time: within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-bold text-white"><strong>Visit Our Office:</strong> 123 Main Street, Ogbomoso</p>
                  <p className="text-slate-400">Open: Mon-Fri 8AM-6PM</p>
                </div>
              </div>
            </div>

            {/* Premium Features */}
            <h2 className="font-bold text-xl text-white">Premium Features (Coming Soon)</h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl">
                <Sparkles className="w-4 h-4 text-emerald-400 mr-2 mt-1" />
                <div>
                  <p className="font-bold text-slate-300">Featured Listings</p>
                  <p className="text-slate-400">Boost visibility with top placement in search results</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 mt-1" />
                <div>
                  <p className="font-bold text-slate-300">Advanced Analytics</p>
                  <p className="text-slate-400">Detailed performance metrics for your ads</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 text-center">
              <p className="text-slate-400">&copy; {new Date().getFullYear()} Sealify Classifieds. All rights reserved.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-400" />
            <Link to="/help-center" className="text-slate-400 hover:text-emerald-400 transition-colors">
              Help Center
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-400" />
            <Link to="/contact" className="text-slate-400 hover:text-emerald-400 transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;