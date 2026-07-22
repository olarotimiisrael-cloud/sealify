import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { UserProfile } from '../types/sealify';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit3, 
  Key, 
  Trash2, 
  UserPlus, 
  X, 
  Check, 
  Package, 
  Shield, 
  Award, 
  Phone, 
  Mail, 
  MapPin 
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    user, 
    isAdmin, 
    allUsers, 
    addUser, 
    updateUser, 
    updateUserPassword, 
    deleteUser, 
    listings, 
    deleteListing 
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'users' | 'listings'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'seller' | 'admin'>('all');

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserProfile | null>(null);

  // New user form state
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [newLocation, setNewLocation] = useState('Ogbomoso, Oyo State');
  const [newPassword, setNewPassword] = useState('Sealify2025!');
  const [newVerified, setNewVerified] = useState(true);

  // Edit user form state
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [editLocation, setEditLocation] = useState('');
  const [editVerified, setEditVerified] = useState(false);

  // Update password state
  const [updatedPassValue, setUpdatedPassValue] = useState('');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Shield className="w-16 h-16 text-rose-500 mb-3" />
          <h2 className="text-2xl font-black text-white">Access Restricted</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">
            You do not have administrator permissions to access this control panel.
          </p>
          <a
            href="/admin/login"
            className="mt-4 px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
          >
            Go to Admin Login
          </a>
        </div>
        <MobileNav />
      </div>
    );
  }

  const filteredUsers = allUsers.filter((u) => {
    const matchSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRole = roleFilter === 'all' || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newFullName) {
      toast.error('Name and email are required');
      return;
    }

    addUser({
      email: newEmail,
      fullName: newFullName,
      phoneNumber: newPhone || '+234 800 000 0000',
      role: newRole,
      verified: newVerified,
      location: newLocation,
      password: newPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    setIsAddUserOpen(false);
    setNewFullName('');
    setNewEmail('');
    setNewPhone('');
  };

  const handleStartEdit = (u: UserProfile) => {
    setEditingUser(u);
    setEditFullName(u.fullName);
    setEditEmail(u.email);
    setEditPhone(u.phoneNumber);
    setEditRole(u.role);
    setEditLocation(u.location);
    setEditVerified(u.verified);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      fullName: editFullName,
      email: editEmail,
      phoneNumber: editPhone,
      role: editRole,
      location: editLocation,
      verified: editVerified,
    });

    setEditingUser(null);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser || !updatedPassValue.trim()) return;

    updateUserPassword(passwordUser.id, updatedPassValue.trim());
    setPasswordUser(null);
    setUpdatedPassValue('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        {/* Header Stats Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl font-black text-white">Sealify Admin Control Dashboard</h1>
                <span className="bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  SYSTEM ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged in as <strong className="text-slate-200">{user?.fullName}</strong> ({user?.email})
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User Record</span>
          </button>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total User Records</p>
            <p className="text-2xl font-black text-white">{allUsers.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Assigned Admins</p>
            <p className="text-2xl font-black text-emerald-400">
              {allUsers.filter((u) => u.role === 'admin').length}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Verified Vendors</p>
            <p className="text-2xl font-black text-teal-400">
              {allUsers.filter((u) => u.verified).length}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active Ad Listings</p>
            <p className="text-2xl font-black text-amber-400">{listings.length}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage User Records ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'listings'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Moderate Ads ({listings.length})</span>
          </button>
        </div>

        {/* Tab 1: Manage User Records */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user by name, email or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-1.5 bg-slate-900 p-1 border border-slate-800 rounded-xl">
                {(['all', 'buyer', 'seller', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                      roleFilter === r
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">User Details</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Phone / Location</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatarUrl}
                              alt={u.fullName}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                            />
                            <div>
                              <p className="font-bold text-white text-xs">{u.fullName}</p>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`font-black uppercase text-[9px] px-2.5 py-0.5 rounded-full border ${
                              u.role === 'admin'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : u.role === 'seller'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="text-white font-medium">{u.phoneNumber}</p>
                          <p className="text-[10px] text-slate-400">{u.location}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          {u.verified ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Unverified</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEdit(u)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg"
                              title="Edit User Record"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                            </button>

                            <button
                              onClick={() => {
                                setPasswordUser(u);
                                setUpdatedPassValue('');
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg"
                              title="Update Password"
                            >
                              <Key className="w-3.5 h-3.5 text-amber-400" />
                            </button>

                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Moderate Ad Listings */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((ad) => (
              <div
                key={ad.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={ad.images[0]} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">
                      {ad.category}
                    </span>
                    <h4 className="font-bold text-sm text-white truncate mt-0.5">{ad.title}</h4>
                    <p className="text-xs font-semibold text-emerald-400">₦{ad.price.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 truncate">Seller: {ad.sellerName}</p>
                  </div>
                </div>

                <button
                  onClick={() => deleteListing(ad.id)}
                  className="p-2.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl shrink-0"
                  title="Remove Listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal: Add New User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 space-y-4">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
              <UserPlus className="w-5 h-5" />
              <span>Create New User Account</span>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Samuel Adewale"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="samuel@example.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0803 000 0000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Assign Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller / Vendor</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Password</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkVerified"
                  checked={newVerified}
                  onChange={(e) => setNewVerified(e.target.checked)}
                  className="accent-emerald-500"
                />
                <label htmlFor="chkVerified" className="text-slate-300 font-semibold cursor-pointer">
                  Mark as Verified Seller Badge
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-colors mt-2"
              >
                Create Account Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 space-y-4">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
              <Edit3 className="w-5 h-5" />
              <span>Modify User Record: {editingUser.fullName}</span>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">User Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller / Vendor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkEditVerified"
                  checked={editVerified}
                  onChange={(e) => setEditVerified(e.target.checked)}
                  className="accent-emerald-500"
                />
                <label htmlFor="chkEditVerified" className="text-slate-300 font-semibold cursor-pointer">
                  Verified Trust Badge Active
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-colors mt-2"
              >
                Save Changes to Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Password */}
      {passwordUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 space-y-4">
            <button
              onClick={() => setPasswordUser(null)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-base">
              <Key className="w-5 h-5" />
              <span>Update Password</span>
            </div>

            <p className="text-xs text-slate-400">
              Set new account password for <strong className="text-slate-200">{passwordUser.fullName}</strong>
            </p>

            <form onSubmit={handleSavePassword} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">New Password</label>
                <input
                  type="text"
                  required
                  value={updatedPassValue}
                  onChange={(e) => setUpdatedPassValue(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-colors"
              >
                Update Password Record
              </button>
            </form>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
};

export default AdminDashboard;