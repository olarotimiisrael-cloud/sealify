import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import SeoBrandingEditor from '@/components/admin/SeoBrandingEditor';
import { useSealify } from '@/context/SealifyContext';

/**
 * Standalone full-page entry point for the SEO & branding editor.
 *
 * The editor itself is shared with the Admin Dashboard tab, so the controls,
 * validation and live previews stay identical in both places.
 */
const AdminSiteMetadata: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useSealify();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 p-6">
        <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-rose-400" />
          <h1 className="text-2xl font-black">Access denied</h1>
          <p className="mt-3 text-sm text-slate-400">
            Only authorized administrators may manage site metadata.
          </p>
          <Button onClick={() => navigate('/admin')} className="mt-6 font-black">
            Return to Admin Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-3 text-emerald-400">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Branding &amp; Site Metadata
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Favicon · logo · headings · page titles · link previews
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/admin')} className="text-xs font-bold">
              <ArrowLeft className="w-4 h-4" /> Admin Terminal
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="text-xs font-bold"
            >
              <Palette className="w-4 h-4" /> Open in dashboard tab
            </Button>
          </div>
        </header>

        <SeoBrandingEditor />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default AdminSiteMetadata;