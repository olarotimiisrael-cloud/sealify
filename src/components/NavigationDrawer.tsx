import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Heart, PlusCircle, MessageSquare, Shield, User, Settings, Wallet, Store, HelpCircle, LogOut, Newspaper, BadgeCheck, TrendingUp, PlayCircle, Building2 } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, isAuthenticated, t } = useSealify();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/saved', label: t('saved'), icon: Heart },
    { path: '/post-ad', label: t('sell'), icon: PlusCircle, highlight: true },
    { path: '/messages', label: t('inbox'), icon: MessageSquare },
    { path: '/vendors', label: 'Vendors', icon: Building2 },
    { path: '/community', label: 'Community', icon: Newspaper },
    { path: '/how-it-works', label: 'Guide', icon: PlayCircle },
    { path: '/requests', label: t('requests'), icon: HelpCircle },
    { path: '/safety', label: t('safety'), icon: Shield },
    { path: '/escrow-verify', label: 'Verify Escrow', icon: BadgeCheck },
    { path: '/market-insights', label: t('insights'), icon: TrendingUp },
  ];

  const userItems = isAuthenticated ? [
    { path: '/my-ads', label: t('my_ads'), icon: Store },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/settings', label: t('settings'), icon: Settings },
    { path: '/escrow-verify', label: 'Verify Escrow', icon: BadgeCheck },
  ] : [
    { path: '/login', label: t('login'), icon: User },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-sm bg-slate-900 h-full overflow-y-auto p-6 space-y-6 shadow-2xl border-l border-slate-800 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <span>Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-800 space-y-1">
          {userItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 font-bold hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
            >
              <Shield className="w-5 h-5" />
              <span>Admin Terminal</span>
            </Link>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationDrawer;