import React, { useState, useEffect } from 'react';
import { UserProfile, VerificationBadgeType, UserStatus, Listing } from '../types/sealify';
import { useSealify } from '../context/SealifyContext';
import { X, Check, Edit3, User, Mail, Phone, MapPin, Building2, Shield, Award, Image, AlertOctagon, Info, Lock, KeyRound, Package, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface AdminEditUserModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onSave: (id: string, updated: Partial<UserProfile>) => void;
}

export const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const { listings, deleteListing } = useSealify();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [verificationType, setVerificationType] = useState<VerificationBadgeType>('none');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');
  
  // Moderation state
  const [status, setStatus] = useState<UserStatus>('active');
  const [restrictionReason, setRestrictionReason] = useState('');

  const userAds = user ? listings.filter((l) => l.sellerId === user.id) : [];

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setLocation(user.location || '');
      setBusinessName(user.businessName || '');
      setRole(user.role || 'buyer');
      setVerificationType(user.verificationType || 'none');
      setAvatarUrl(user.avatarUrl || '');
      setStatus(user.status || 'active');
      setRestrictionReason(user.restrictionReason || '');
      setPassword(user.password || '');
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Full Name and Email address are required.');
      return;
    }

    onSave(user.id, {
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      location: location.trim(),
      businessName: businessName.trim() || undefined,
      role,
      verified: verificationType !== 'none',
      verificationType,
      avatarUrl: avatarUrl.trim() || user.avatarUrl,
      status,
      restrictionReason: status !== 'active' ? restrictionReason.trim() : '',
      appealStatus: status === 'active' ? 'none' : user.appealStatus,
      password: password.trim() || undefined
    });

    toast.success(`User record for "${fullName}" updated!`);
    onClose();
  };

  const handleDeleteAllUserAds = () => {
    if (userAds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ALL ${userAds.length} ads posted by ${user.fullName}?`)) {
      userAds.forEach((ad) => deleteListing(ad.id));
      toast.success(`Purged all ${userAds.length} ads posted by ${user.fullName}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <img
            src={avatarUrl || user.avatarUrl}
            alt={user.fullName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0 bg-slate-950"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Edit User Record</h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                {user.id}
              </span>
            </div>
            <p className="text-xs text-slate-400">Modify profile, permissions, authentication & inspect ads</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Moderation Section */}
          <div className="p-4 bg-slate-950 border border-rose-500/30 rounded-2xl space-y-3">
             <div className="flex items-center gap-2 text-rose-400 font-extrabold uppercase tracking-widest">
                <AlertOctagon className="w-4 h-4" />
                <span>Account Status & Restrictions</span>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 capitalize"
                  >
                    <option value="active">Active (Normal)</option>
                    <option value="restricted">Restricted (No Post/Chat)</option>
                    <option value="suspended">Suspended (Temp Ban)</option>
                    <option value="banned">Perm Banned (Access Denied)</option>
                  </select>
                </div>

                <div className="space-y-1">
                   <label className="text-slate-400 font-bold uppercase">Appeal Status</label>
                   <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white capitalize flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                      {user.appealStatus || 'none'}
                   </div>
                </div>
             </div>

             {status !== 'active' && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                  <label className="text-slate-300 font-bold uppercase">Restriction Warning / Reason *</label>
                  <textarea
                    rows={2}
                    required
                    value={restrictionReason}
                    onChange={(e) => setRestrictionReason(e.target.value)}
                    placeholder="Enter warning for user..."
                    className="w-full bg-slate-900 border border-rose-500/40 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
             )}
          </div>

          {/* Security & Authentication Section */}
          <div className="p-4 bg-slate-950 border border-emerald-500/20 rounded-2xl space-y-3">
             <div className="flex items-center gap-2 text-emerald-400 font-extrabold uppercase tracking-widest">
                <Lock className="w-4 h-4" />
                <span>Security & Login Credentials</span>
             </div>

             <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Administrative Password Reset</span>
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password to overwrite"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+234..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ogbomoso, Oyo State"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Business / Store Name (Optional)</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Ogunleye Motors Ogbomoso"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Account Role</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 capitalize"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller / Vendor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verification Badge</span>
              </label>
              <select
                value={verificationType}
                onChange={(e) => setVerificationType(e.target.value as VerificationBadgeType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 capitalize"
              >
                <option value="none">None (Unverified)</option>
                <option value="individual">Verified ID (Individual)</option>
                <option value="business">Verified Business</option>
                <option value="premium">Premium Verified</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Image className="w-3.5 h-3.5 text-emerald-400" />
              <span>Avatar Image URL</span>
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* User's Posted Classified Ads Section */}
          <div className="p-4 bg-slate-950 border border-teal-500/30 rounded-2xl space-y-3 pt-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-400 font-extrabold uppercase tracking-widest">
                   <Package className="w-4 h-4" />
                   <span>Ads Posted by User ({userAds.length})</span>
                </div>
                {userAds.length > 0 && (
                   <button
                     type="button"
                     onClick={handleDeleteAllUserAds}
                     className="px-2.5 py-1 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white font-bold rounded-lg text-[10px] uppercase border border-rose-500/20 transition-all flex items-center gap-1"
                   >
                     <Trash2 className="w-3 h-3" /> Purge All {userAds.length} Ads
                   </button>
                )}
             </div>

             {userAds.length === 0 ? (
                <p className="text-slate-500 text-[11px] italic py-2">No classified ads posted by this user yet.</p>
             ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                   {userAds.map((ad) => (
                      <div key={ad.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                         <div className="flex items-center gap-2.5 min-w-0">
                            <img src={ad.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0" />
                            <div className="min-w-0">
                               <p className="font-bold text-white truncate text-xs">{ad.title}</p>
                               <p className="text-[10px] text-emerald-400 font-extrabold">₦{ad.price.toLocaleString()} • {ad.category}</p>
                            </div>
                         </div>

                         <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={`/listing/${ad.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                              title="View Ad"
                            >
                               <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => deleteListing(ad.id)}
                              className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                              title="Delete this ad"
                            >
                               <Trash2 className="w-3.5 h-3.5" />
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Record Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditUserModal;