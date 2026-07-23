import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { Mail, Phone, Check, Send, HelpCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Contact: React.FC = () => {
  const { user } = useSealify();
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    setTimeout(() => {
      toast.success('Message sent successfully! Our support team will respond within 24 hours.');
      setFormData({ name: user?.fullName || '', email: user?.email || '', subject: '', message: '' });
      setStatus('sent');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <SEO 
        title="Contact Support — Sealify Nigeria"
        description="Get in touch with Sealify Customer Support for assistance with account verification, ad promotions, or safety inquiries."
      />
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3.5 py-1 rounded-full">
              <Mail className="w-4 h-4" />
              <span>Contact Support</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Get In Touch
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
              Have a question, report, or feedback? Send us a message and our support team will reach out.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Inquiry regarding verified vendor status"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Message</label>
              <textarea
                rows={5}
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                placeholder="Describe your question or issue in detail..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {status === 'sending' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{status === 'sending' ? 'Sending Message...' : 'Send Message to Sealify Support'}</span>
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800 pt-6 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">+234 800 000 0000</p>
                <p className="text-[10px] text-slate-400">Mon-Fri 9AM-5PM</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">support@sealify.ng</p>
                <p className="text-[10px] text-slate-400">24hr email support</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Ogbomoso, Oyo State</p>
                <p className="text-[10px] text-slate-400">Nigeria Hub</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Contact;