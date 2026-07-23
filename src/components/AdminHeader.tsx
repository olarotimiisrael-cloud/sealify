import React from 'react';
import { LogOut, ShieldCheck, User as UserIcon, Crown } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';
import { Link } from 'react-router-dom';

interface AdminHeaderProps {
  user: any;
  isAdmin: boolean;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user, isAdmin, onLogout }) => {
  if (!user) return null;

  const avatarUrl = user.avatarUrl || '/logo.png';
  const roleLabel = user.role === 'admin' ? 'Administrator' : 
                   user.role === 'seller' ? 'Seller' : 'Buyer';

  return (
    <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl mb-6">
      {/* User Avatar & Details */}
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12">
          <img
            src={avatarUrl}
            alt={user.fullName}
            className="w-full h-full rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
          />
          {user.verified && (
            <Crown className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-amber-300" />
          )}
        </div>

        <div className="flex flex-col">
          <p className="font-bold text-white text-base">{user.fullName}</p>
          <p className="text-slate-400 text-xs">{roleLabel}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold rounded-xl transition-colors"
          title="Log out of admin panel"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>

        {/* Admin Dashboard Link */}
        {isAdmin && (
          <Link
            to="/admin"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors"
          >
            <Crown className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        )}
      </div>
    </div>
  );
};