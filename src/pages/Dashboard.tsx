import React from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { Link } from 'react-router-dom';
import { ShieldCheck, Plus, Trash2, CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { currentUser, listings, deleteListing, markAsSold } = useApp();

  const myListings = listings.filter((l) => l.seller_id === currentUser?.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <img
              src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser?.full_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 mx-auto sm:mx-0"
            />
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
                {currentUser?.full_name}
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </h2>
              <p className="text-xs text-slate-500">{currentUser?.email} • {currentUser?.phone_number}</p>
              <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                Verified Seller
              </span>
            </div>
          </div>

          <Link to="/post-ad">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold">
              <Plus className="w-4 h-4 mr-1.5" /> Post New Ad
            </Button>
          </Link>
        </div>

        {/* My Ads Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" /> My Active & Sold Ads ({myListings.length})
          </h3>
        </div>

        {/* Ads List */}
        {myListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 my-4">
            <p className="text-slate-500 text-sm mb-4">You have not posted any ads yet.</p>
            <Link to="/post-ad">
              <Button className="bg-emerald-600 text-white rounded-full">Start Selling Now</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myListings.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 flex gap-4 items-center">
                <img
                  src={item.images[0]}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                    item.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.status}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm truncate mt-1">{item.title}</h4>
                  <p className="text-emerald-600 font-extrabold text-sm">${item.price}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  {item.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsSold(item.id)}
                      className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 rounded-xl h-8"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Sold
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteListing(item.id)}
                    className="text-xs text-rose-600 hover:bg-rose-50 rounded-xl h-8"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
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