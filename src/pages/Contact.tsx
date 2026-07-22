import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { Link } from 'react-router-dom';
import { X, Mail, Phone, ShieldAlert, Check, Send, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const Contact: React.FC = () => {
  const { isAuthenticated, sendMessage } = useSealify();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-slate-400">Please log in to contact support</p>
          <Link to="/login" className="mt-3 text-emerald-400 hover:underline font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    
    try {
      // In a real implementation, this would send to an API endpoint
      // For now, we'll simulate a successful send
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent successfully! Our support team will respond within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setStatus('sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again later.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <div className="Navbar" />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
              <Mail className="w-4 h-4" />
              <span>Contact Support</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Get In Touch
            </h1>
            <p className="text-slate-400 text-sm">
              Have a question or need assistance? Fill out the form below and our support team will reach out.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            {status === 'sending' && (
              <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl">
                <Send className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300">Sending message...</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Subject"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Describe your inquiry..."
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {status === 'sending' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>

          <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              <div className="flex-1">
                <p className="text-sm text-slate-400">
                  <strong>Support Hours:</strong> Mon-Fri 9AM-5PM (Nigeria Time)
                </p>
                <p className="text-sm text-slate-400">
                  <strong>Emergency:</strong> For urgent safety concerns, call +234 800 000 0000
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-emerbal-400" />
                <a href="tel:+2348000000000" className="text-emerald-400 hover:text-white">
                  +234 800 000 0000
                </a>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4 text-emerald-400" />
                <a href="mailto:support@sealify.ng" className="text-emerald-400 hover:text-white">
                  support@sealify.ng
                </a>
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