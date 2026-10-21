import React, { useState, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Users, AlertCircle, ShieldCheck, User, Gavel, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchAdminUsers, updateAdminUser, disableAdminUser } = useSealify();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers();
      setUsers(res?.data || res || []);
    } catch (err: any) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, data: any) => {
    try {
      await updateAdminUser(id, data);
      toast.success('User updated');
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  const handleDisableUser = async (id: string) => {
    if (!confirm('Disable this user?')) return;
    try {
      await disableAdminUser(id);
      toast.success('User disabled');
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to disable user');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Admin Users — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <Users className="w-3 h-3" />
            <span>User Management</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">Manage Users</h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            View, verify, and manage all platform users and their accounts.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-500 text-xs">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-slate-900">{u.name || 'Unknown'}</span>
                            <p className="text-[9px] text-slate-400">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 truncate max-w-xs">{u.email}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {u.role || 'buyer'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(u.created_at || u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const role = u.role === 'admin' ? 'buyer' : 'admin';
                              handleUpdateUser(u.id, { role });
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            title="Change Role"
                          >
                            <FileText className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDisableUser(u.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Disable User"
                          >
                            <AlertCircle className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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

