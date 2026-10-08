import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings as SettingsIcon, Save, ShieldCheck } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';

const Navbar = () => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { t } = useSealify();
  const { isAdmin } = useSealify();

  return (
    <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Sealify" className="h-8 w-8" />
            <span className="text-xl font-bold text-white">Sealify</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors">Home</Link>
            <Link to="/listings" className="text-slate-300 hover:text-white transition-colors">Listings</Link>
            <Link to="/services" className="text-slate-300 hover:text-white transition-colors">Services</Link>
            <Link to="/how-it-works" className="text-slate-300 hover:text-white transition-colors">How It Works</Link>
            <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="p-2 text-slate-300 hover:text-white transition-colors"
            >
              <User className="w-5 h-5" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-sm font-medium text-white">User Menu</p>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-xl text-slate-200 font-bold transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-purple-400" />
                  <span>{t('settings')}</span>
                </Link>

                <Link
                  to="/saved-searches"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-xl text-slate-200 font-bold transition-colors"
                >
                  <Save className="w-4 h-4 text-blue-400" />
                  <span>Saved Searches</span>
                </Link>

                {isAdmin && (
                  <div>
                    <Link
                      to="/admin"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-xl text-slate-200 font-bold transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                      <span>Admin Panel</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;