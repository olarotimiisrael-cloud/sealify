import React from 'react';
import { useSealify } from '../context/SealifyContext';
import { Link } from 'react-router-dom';
import { User, Settings, ShieldCheck, Calendar, Phone, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user, updateListing, deleteListing } = useSealify();
  const [editingProfile, setEditingProfile] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState(user?.email || '');
  const [newPhone, setNewPhone] = React.useState(user?.phoneNumber || '');
  const [changePassword, setChangePassword] = React.useState({ current: '', newPassword: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-slate-400">Please log in to access settings</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-3 px-5 py-2 bg-emerald-500 text-slate-950 rounded-xl font-bold transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = () => {
    // In a real app, this would update the user profile in Supabase
    const updatedUser = {
      ...user,
      email: newEmail,
      phoneNumber: newPhone,
    };
    localStorage.setItem('sealify_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = async () => {
    if (!changePassword.current || !changePassword.newPassword) {
      toast.error('Please enter both current and new password');
      return;
    }
    // Password change logic would go here
    toast.success('Password updated successfully!');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    // Account deletion logic would go here
    toast.success('Account deletion requested');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <div className="Navbar" />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500" />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white">{user.fullName}</h1>
                <p className="text-slate-400 text-sm">Verified Seller</p>
              </div>
            </div>
            <button
              onClick={() => setEditingProfile(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="border-t border-slate-800 pt-4">
              <div className="flex items-start gap-3 py-3">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs">Account Settings</span>
                  <span className="text-white font-medium text-sm mt-1">Manage your profile and preferences</span>
                </div>
                <span className="text-slate-400 text-xs ml-auto">→</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-start gap-2">
                    <User className="w-6 h-6 mr-3" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white">Email Address</h3>
                      <p className="text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  {editingProfile && (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        placeholder="New email address"
                      />
                      <button
                        onClick={handleSave}
                        className="ml-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Phone className="w-6 h-6 mr-3" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white">Phone Number</h3>
                      <p className="text-slate-400">{user.phoneNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  {editingProfile && (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="tel"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        placeholder="New phone number"
                      />
                      <button
                        onClick={handleSave}
                        className="ml-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-6 h-6 mr-3" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white">Last Login</h3>
                      <p className="text-slate-400">Just now</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-6 h-6 mr-3" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white">Two-Factor Auth</h3>
                      <p className="text-slate-400">Disabled</p>
                    </div>
                  </div>
                  <button
                    className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Set Up</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Trash2 className="w-6 h-6 mr-3" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white">Delete Account</h3>
                      <p className="text-slate-400">Remove all your data permanently</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-slate-950 rounded-xl text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full">
                <div className="flex flex-col items-center gap-3">
                  <h2 className="text-xl font-bold text-white">Delete Account</h2>
                  <p className="text-slate-400 text-center">
                    Are you sure you want to delete your account? This action cannot be undone.
                  </p>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2.5 bg-rose-600 text-slate-950 font-bold rounded-xl"
                  >
                    Confirm Deletion
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2.5 bg-slate-800 text-slate-200 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default Settings;