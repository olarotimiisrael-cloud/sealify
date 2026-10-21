import React, { useState, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import SavedSearchesManager from '@/components/search/SavedSearchesManager';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

const SavedSearchesPage: React.FC = () => {
  const { user, isAuthenticated } = useSealify();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/auth/login');
    return null;
  }

  return (
    <>
      <SEO title="Saved Searches & Alerts - Sealify Nigeria" />
      <Navbar />
      <main className="min-h-[calc(100vh-200px)] pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center">
                <Heart className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
                  Saved Searches & Alerts
                </h1>
                <p className="text-xl text-emerald-300 mb-8">
                  Get notified when new listings match your criteria
                </p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8">
              <SavedSearchesManager />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
};

export default SavedSearchesPage;

