import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { User, ShieldCheck, Calendar, Phone, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user, setUser } = useSealify();
  const [editingProfile, setEditingProfile] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPhone, setNewPhone] = useState(user?.phoneNumber || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-slate-400">Please log in to access settings</p>
          <Link
            to="/"
            className="mt-3 inline-block px-5 py-2 bg-emerald-500 text-slate-950 rounded-xl font-bold transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!user) return;
    const updatedUser = {
      ...user,
      email: newEmail,
      phoneNumber: newPhone,
    };
    localStorage.setItem('sealify_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditingProfile(false);
    toast.success('Profile updated successfully!');
  };

  const handleConfirmDelete = () => {
    toast.success('Account deletion requested');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500"
              />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white">{user.fullName}</h1>
                <p className="text-slate-400 text-xs">Verified Marketplace User</p>
              </div>
            </div>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Information</h3>

            <div className="space-y-3">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">Email Address</h4>
                    <p className="text-sm text-slate-300 mt-0.5">{user.email}</p>
                  </div>
                </div>
                {editingProfile && (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="New email address"
                    />
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">Phone Number</h4>
                    <p className="text-sm text-slate-300 mt-0.5">{user.phoneNumber}</p>
                  </div>
                </div>
                {editingProfile && (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="New phone number"
                    />
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Two-Factor Authentication</h4>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">Enabled via SMS & Email</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Account Status</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Active & Verified since 2023</p>
                </div>
                <Calendar className="w-5 h-5 text-slate-500" />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account & Erase Personal Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full text-center space-y-4">
              <h3 className="text-lg font-bold text-white">Confirm Account Deletion</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete your account? All your active listings and saved messages will be permanently removed.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
};

export default Settings;