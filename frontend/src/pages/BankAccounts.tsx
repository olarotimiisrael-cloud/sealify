import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Banknote, Plus, AlertCircle, Clock, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BankAccounts() {
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    account_name: '',
  });
  const [loading, setLoading] = useState(false);
  const { fetchBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } = useSealify();

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetchBankAccounts();
      setBankAccounts(res?.data || res || []);
    } catch (err: any) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBankAccount(formData);
      setShowForm(false);
      setFormData({ bank_name: '', account_number: '', account_name: '' });
      toast.success('Bank account added');
      loadBankAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bank account?')) return;
    try {
      await deleteBankAccount(id);
      toast.success('Bank account removed');
      loadBankAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete bank account');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Bank Accounts — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
                <Banknote className="w-3 h-3" />
                <span>Bank Accounts</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Bank Accounts</h1>
              <p className="text-slate-600 text-xs">
                Add your bank account to receive payments for sales and promotions.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Add Account</span>
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bank Name</label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bank_name: e.target.value }))}
                  className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. GTBank, Access Bank"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Number</label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, account_number: e.target.value }))}
                  className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="0123456789"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Name</label>
                <input
                  type="text"
                  value={formData.account_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, account_name: e.target.value }))}
                  className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  {loading ? 'Adding...' : 'Add Bank Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">Saved Bank Accounts</h2>
          {bankAccounts.length === 0 ? (
            <div className="text-center py-12">
              <Banknote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2">No bank accounts</h3>
              <p className="text-slate-500 text-xs">Add a bank account to receive payments.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div key={account.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-900">{account.bank_name}</span>
                      <p className="text-[9px] text-slate-400">•••• {account.account_number?.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setFormData({
                          bank_name: account.bank_name,
                          account_number: account.account_number,
                          account_name: account.account_name,
                        });
                        setShowForm(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

