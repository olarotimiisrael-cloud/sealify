import React, { useEffect, useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ShieldCheck, Users, Package, DollarSign, AlertTriangle, Bell, Clock, FileText, Gavel } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { fetchAdminStats } = useSealify();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminStats();
      setStats(res?.data || res);
    } catch (err: any) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Admin Dashboard — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <ShieldCheck className="w-3 h-3" />
            <span>Admin Panel</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">Admin Dashboard</h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Manage users, listings, reports, disputes, and platform settings.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <AdminStatCard
            title="Total Users"
            value={stats?.total_users || 0}
            icon={Users}
            color="text-blue-600 bg-blue-50"
            subtitle="registered members"
          />
          <AdminStatCard
            title="Active Listings"
            value={stats?.total_listings || 0}
            icon={Package}
            color="text-emerald-600 bg-emerald-50"
            subtitle="items on marketplace"
          />
          <AdminStatCard
            title="Total Revenue"
            value={`?${Number(stats?.total_revenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="text-amber-600 bg-amber-50"
            subtitle="platform earnings"
          />
          <AdminStatCard
            title="Pending Reports"
            value={stats?.pending_reports || 0}
            icon={AlertTriangle}
            color="text-rose-600 bg-rose-50"
            subtitle="need attention"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminActionCard
            title="Manage Users"
            icon={Users}
            href="/admin/users"
            description="View and manage all platform users"
          />
          <AdminActionCard
            title="Manage Listings"
            icon={Package}
            href="/admin/listings"
            description="Review and moderate listings"
          />
          <AdminActionCard
            title="Reports & Disputes"
            icon={AlertTriangle}
            href="/admin/reports"
            description="Handle user reports and trade disputes"
          />
          <AdminActionCard
            title="Verifications"
            icon={FileText}
            href="/admin/verifications"
            description="Review KYC and seller verifications"
          />
          <AdminActionCard
            title="Promotions"
            icon={DollarSign}
            href="/admin/promotions"
            description="Manage paid promotions"
          />
          <AdminActionCard
            title="System Config"
            icon={Bell}
            href="/admin/system-config"
            description="Configure platform settings"
          />
        </div>

        {/* Audit Logs */}
        <div className="mt-10">
          <h2 className="text-xl font-black text-slate-900 mb-4">Recent Audit Logs</h2>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resource</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recent_audit_logs || []).map((log: any) => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs font-medium text-slate-700">{log.action}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{log.user_name || 'System'}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{log.resource_type}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(log.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(stats?.recent_audit_logs?.length || 0) === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500 text-xs">
                      No audit logs available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

function AdminStatCard({ title, value, icon: Icon, color, subtitle }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black {color}">{value}</span>
            <span className="text-[10px] text-slate-400 font-medium">{subtitle}</span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl ${color.split(' ')[1]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function AdminActionCard({ title, icon: Icon, href, description }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-5 hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer group">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
        <Icon className="w-5 h-5 text-slate-500 group-hover:text-white" />
      </div>
      <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-emerald-600 transition-colors">{title}</h4>
      <p className="text-[10px] text-slate-500">{description}</p>
    </div>
  );
}

