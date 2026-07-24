import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Mail, Phone, Facebook, Twitter, Instagram, Globe, Lock, Gavel, Radio, MessageCircle, ExternalLink, PlayCircle } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';
import EscrowProtectionModal from './EscrowProtectionModal';
import Logo from './Logo';

export const Footer: React.FC = () => {
  const { t } = useSealify();
  const [isEscrowOpen, setIsEscrowOpen] = useState(false);

  return (
    <>
      <footer className="bg-slate-900 border-t border-slate-800 pt-12 pb-24 md:pb-12 mt-12 font-sans">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Nigeria's most trusted local marketplace. We connect verified buyers and sellers in Ogbomosoland, Oyo State, and across the federation.
            </p>
            <div className="flex items-center gap-4 text-slate-500">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Browse All Ads</Link></li>
              <li><Link to="/how-it-works" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> How it Works & Video</Link></li>
              <li><Link to="/vendors" className="hover:text-emerald-400 transition-colors">Verified Merchants Directory</Link></li>
              <li><button onClick={() => setIsEscrowOpen(true)} className="hover:text-teal-400 text-teal-400/90 font-bold transition-colors text-left">Escrow Protection Protocol</button></li>
              <li><Link to="/post-ad" className="hover:text-emerald-400 transition-colors">Post an Ad</Link></li>
              <li><Link to="/safety" className="hover:text-emerald-400 transition-colors">Safety Center</Link></li>
              <li><Link to="/admin/login" className="hover:text-emerald-400 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Support & Community */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Support & Community</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/faq" className="hover:text-emerald-400 transition-colors">Help & FAQ</Link></li>
              <li><a href="https://whatsapp.com/channel/0029VaqFIYEC6ZvlrPCLql1R" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5"><Radio className="w-3.5 h-3.5" /> Broadcast Channel</a></li>
              <li><a href="https://chat.whatsapp.com/F0iRCn1r1z2JQuKLoRhmw4?s=cl&p=a&ilr=1" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> Community Support Group</a></li>
              <li><Link to="/dispute" className="text-rose-400 hover:text-rose-300 font-bold transition-colors flex items-center gap-1 mt-1"><Gavel className="w-3.5 h-3.5" /> File Trade Dispute</Link></li>
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

      <EscrowProtectionModal isOpen={isEscrowOpen} onClose={() => setIsEscrowOpen(false)} />
    </>
  );
};

export default Footer;