import React, { useState, useEffect } from 'react';
import { UserProfile, VerificationBadgeType } from '../types/sealify';
import { X, Check, Edit3, User, Mail, Phone, MapPin, Building2, Shield, Award, Image } from 'lucide-react';
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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [verificationType, setVerificationType] = useState<VerificationBadgeType>('none');
  const [avatarUrl, setAvatarUrl] = useState('');

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
    });

    toast.success(`User record for "${fullName}" updated!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
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
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
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
            <p className="text-xs text-slate-400">Modify profile, permissions, and status</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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