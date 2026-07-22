import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Mail, Phone, Facebook, Twitter, Instagram, Globe } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';

export const Footer: React.FC = () => {
  const { t } = useSealify();
  
  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-12 pb-24 md:pb-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div className="space-y-4">
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-700/50 w-fit">
            <img src="/logo.png" alt="Sealify" className="h-8 w-auto object-contain" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            Nigeria's most trusted local marketplace. We connect verified buyers and sellers in Ogbomosoland, Oyo State, and across the federation.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <Facebook className="w-5 h-5 hover:text-emerald-400 cursor-pointer transition-colors" />
            <Twitter className="w-5 h-5 hover:text-emerald-400 cursor-pointer transition-colors" />
            <Instagram className="w-5 h-5 hover:text-emerald-400 cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Marketplace</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Browse All Ads</Link></li>
            <li><Link to="/post-ad" className="hover:text-emerald-400 transition-colors">Post an Ad</Link></li>
            <li><Link to="/safety" className="hover:text-emerald-400 transition-colors">Safety Center</Link></li>
            <li><Link to="/admin/login" className="hover:text-emerald-400 transition-colors">Admin Portal</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Support</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link to="/faq" className="hover:text-emerald-400 transition-colors">Help & FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Support</Link></li>
            <li><Link to="/help-center" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="/help-center" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Our Hub</h4>
          <ul className="space-y-3 text-xs text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ogbomosoland, Oyo State, Nigeria</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>support@sealify.ng</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+234 813 120 8468</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 uppercase font-black tracking-widest">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>© 2024 SEALIFY NIGERIA. ALL RIGHTS RESERVED.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          <span>Proudly Serving Ogbomosoland & Oyo State</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;