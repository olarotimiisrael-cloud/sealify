import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import VerifiedBadge from '../components/VerifiedBadge';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import { UserProfile, VerificationBadgeType, Listing, PromotionPaymentRequest } from '../types/sealify';
import { 
  Shield, Package, Activity, Layers, RefreshCw, Edit3, Trash2,
  Search, ShieldCheck, Award, Check, X, Eye,
  KeyRound, Zap, Crown,
  Database, Plus, Sparkles, Upload,
  AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { AdminHeader } from '../components/AdminHeader';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, categories, addCategory, deleteCategory, updateCategory, analytics, listings, allUsers, updateUser, deleteUser, updateListing, deleteListing, t,
    passwordRequests, processPasswordRequest, verificationRequests, processVerificationRequest,
    promotionPaymentRequests, processPromotionPaymentRequest,
    logout
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'categories' | 'listings' | 'approvals' | 'promotionPayments'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [adSearch, setAdSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // New Category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');
  const [newCatColor, setNewCatColor] = useState('bg-emerald-500');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAds = listings.filter(l => 
    l.title.toLowerCase().includes(adSearch.toLowerCase()) || 
    l.sellerName.toLowerCase().includes(adSearch.toLowerCase())
  );

  const pendingPW = passwordRequests.filter(r => r.status === 'pending');
  const pendingVerif = verificationRequests.filter(r => r.status === 'pending');
  const pendingPromoPay = promotionPaymentRequests.filter(r => r.status === 'pending');
  const promotedAds = listings.filter(l => l.featured);

  // Function to check if a promotion has expired
  const isPromotionExpired = (listing: Listing): boolean => {
    if (!listing.promotionEndDate) return false;
    const endDate = new Date(listing.promotionEndDate);
    const now = new Date();
    return now > endDate;
  };

  const handleUpdateBadge = (userId: string, type: VerificationBadgeType) => {
    updateUser(userId, { 
      verificationType: type, 
      verified: type !== 'none' 
    });
    toast.success(`Badge updated to ${type.toUpperCase()}`);
    setEditingUser(null);
  };

  const handleToggleRole = (user: UserProfile) => {
    const nextRole = user.role === 'admin' ? 'seller' : user.role === 'seller' ? 'buyer' : 'admin';
    updateUser(user.id, { role: nextRole });
    toast.info(`${user.fullName}'s role changed to ${nextRole.toUpperCase()}`);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    addCategory({
      name: newCatName.trim(),
      iconName: newCatIcon,
      count: 0,
      color: newCatColor,
    });
    setNewCatName('');
    toast.success(`Category "${newCatName.trim()}" added successfully!`);
  };

  const handleSaveCatName = (id: string) => {
    if (!editingCatName.trim()) return;
    updateCategory(id, editingCatName.trim());
    setEditingCatId(null);
    toast.success('Category updated');
  };

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Restricted Access</h2>
          <p className="text-slate-400 text-xs mt-2">Only administrators can access this terminal.</p>
          <Link to="/" className="mt-6 inline-block px-5 py-2 bg-emerald-500 text-slate-950 rounded-xl font-bold transition-colors">
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        {/* Admin Header with Avatar & Logout */}
        <AdminHeader 
          user={allUsers.find(u => u.role === 'admin')} 
          isAdmin={true} 
          onLogout={logout} 
        />

        <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl gap-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Security Terminal</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Monitoring {listings.length} ads & {allUsers.length} active nodes</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
            {/* Tab navigation buttons */}
            <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>ANALYTICS</button>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'users' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>USERS</button>
            <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'categories' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>CATEGORIES</button>
            <button onClick={() => setActiveTab('listings')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'listings' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>ADS & PROMOTIONS</button>
            <button onClick={() => setActiveTab('approvals')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all relative ${activeTab === 'approvals' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              APPROVALS
              {(pendingPW.length + pendingVerif.length) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingPW.length + pendingVerif.length}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('promotionPayments')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all relative ${activeTab === 'promotionPayments' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              PROMOTION PAYMENTS
              {pendingPromoPay.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingPromoPay.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content: Categories */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Existing categories management content */}
          </div>
        )}

        {/* Tab Content: Users */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Existing users management content */}
            {/* Show editing user modal when editingUser is set */}
            {editingUser && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full text-center space-y-4">
                  <h3 className="text-lg font-bold text-white">Edit User: {editingUser.fullName}</h3>
                  <p className="text-slate-400">Update role or verification status</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateBadge(editingUser.id, 'none')} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl">Remove Badge</button>
                    <button onClick={() => handleUpdateBadge(editingUser.id, 'individual')} className="flex-1 py-2 bg-emerald-500 text-slate-950 rounded-xl">Individual Verified</button>
                    <button onClick={() => handleUpdateBadge(editingUser.id, 'business')} className="flex-1 bg-amber-500 text-slate-950 rounded-xl">Business Verified</button>
                    <button onClick={() => handleUpdateBadge(editingUser.id, 'premium')} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-slate-950 rounded-xl">Premium Verified</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Approvals */}
        {activeTab === 'approvals' && (
          <div className="space-y-10">
            {/* Existing approvals content */}
          </div>
        )}

        {/* Tab Content: Promotion Payments */}
        {activeTab === 'promotionPayments' && (
          <div className="space-y-6">
            {/* Existing promotion payments content */}
          </div>
        )}

        {/* Tab Content: Analytics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Existing analytics content */}
          </div>
        )}

        {/* Tab Content: Listings & Promotions */}
        {activeTab === 'listings' && (
          <div className="space-y-8">
            {/* Existing listings and promotions content */}
          </div>
        )}

        {/* Mobile Navigation */}
        <MobileNav />
      </main>
    </div>
  );
};

export default AdminDashboard;