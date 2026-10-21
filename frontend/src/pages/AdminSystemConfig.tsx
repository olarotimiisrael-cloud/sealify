import React, { useEffect, useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Bell, Users, Package, ShieldCheck, FileText, Gavel } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSiteConfig() {
  const [config, setConfig] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { fetchSystemConfig, updateSystemConfig } = useSealify();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetchSystemConfig();
      const data = res?.data || res || {};
      setConfig(data);
      setFormData({ ...data });
    } catch (err: any) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSystemConfig(formData);
      setEditing(false);
      toast.success('Settings saved');
      loadConfig();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="System Config — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <Bell className="w-3 h-3" />
            <span>System Config</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">System Configuration</h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Configure platform settings, features, and global options.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading...</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">Platform Settings</h2>
              {editing ? (
                <button
                  onClick={() => setEditing(false)}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Edit Settings
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </label>
                      <input
                        type="text"
                        value={String(value || '')}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(config).map(([key, value]) => (
                  <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-xs font-medium text-slate-700">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

