import React from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { Link } from 'react-router-dom';
import { ShieldCheck, Plus, Trash2, CheckCircle, Package } from 'lucide-react';

export default function Dashboard() {
  const { user, listings, deleteListing, markAsSold } = useSealify();

  const myListings = listings.filter((l) => l.sellerId === user?.id);

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Profile Card */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 mx-auto sm:mx-0"
            />
            <div>
              <h2 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                {user?.fullName}
                {user?.verified && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
              </h2>
              <p className="text-xs text-slate-400">{user?.email} • {user?.phoneNumber}</p>
              <span className="inline-block mt-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                Verified Account
              </span>
            </div>
          </div>

          <Link
            to="/post-ad"
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> Post New Ad
          </Link>
        </div>

        {/* My Ads Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" /> My Active & Sold Ads ({myListings.length})
          </h3>
        </div>

        {/* Ads List */}
        {myListings.length === 0 ? (
          <div className="bg-slate-900 rounded-3xl p-12 text-center border border-slate-800 my-4">
            <p className="text-slate-400 text-xs mb-4">You have not posted any ads yet.</p>
            <Link
              to="/post-ad"
              className="inline-block px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
            >
              Start Selling Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myListings.map((item) => (
              <div key={item.id} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex gap-4 items-center">
                <img
                  src={item.images[0]}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover bg-slate-950 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                    item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {item.status}
                  </span>
                  <h4 className="font-bold text-white text-sm truncate mt-1">{item.title}</h4>
                  <p className="text-emerald-400 font-extrabold text-sm">{formatNGN(item.price)}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  {item.status === 'active' && (
                    <button
                      onClick={() => markAsSold(item.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Sold
                    </button>
                  )}
                  <button
                    onClick={() => deleteListing(item.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}