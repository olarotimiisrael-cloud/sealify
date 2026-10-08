import React, { useState, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import { SavedSearchesManager } from '@/components/search/SavedSearchesManager';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav'
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const SavedSearchesPage: React.FC = () => {
  const { user } = useSealify();

  // Redirect to login if not authenticated
  if (!user) {
    // In a real app, we'd use navigate('/login') but we'll keep it simple for now
    return null;
  }

  return (
    <>
      <SEO title="Saved Searches & Alerts - Sealify Nigeria" />
      <Navbar />
      <main className="min-h-[calc(100vh-200px)] pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-3xl font-black text-white tracking-tight mb-6">
              Saved Searches & Alerts
            </h1>
            <p className="text-xl text-emerald-300 mb-8">
              Get notified when new listings match your criteria
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8">
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