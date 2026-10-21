import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Package, Plus, Trash2, Edit2, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategories() {
  const { user } = useSealify();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Package',
    color: '#16a34a',
    description: '',
    sort_order: '0',
    is_active: 'true',
    parent_id: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data?.data || []);
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
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          icon: formData.icon,
          color: formData.color,
          description: formData.description,
          sort_order: parseInt(formData.sort_order || '0'),
          is_active: formData.is_active === 'true',
          parent_id: formData.parent_id || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to save category');
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', icon: 'Package', color: '#16a34a', description: '', sort_order: '0', is_active: 'true', parent_id: '' });
      toast.success(editingId ? 'Category updated' : 'Category created');
      loadCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: any) => {
    setFormData({
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      description: cat.description,
      sort_order: cat.sort_order?.toString() || '0',
      is_active: cat.is_active?.toString() || 'true',
      parent_id: cat.parent_id || '',
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Category deleted');
      loadCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  const handleDeleteCategory = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleDelete(id);
  };

  const iconOptions = [
    { id: 'Package', label: 'Package' },
    { id: 'Car', label: 'Vehicles' },
    { id: 'Smartphone', label: 'Electronics' },
    { id: 'Home', label: 'Real Estate' },
    { id: 'Shirt', label: 'Fashion' },
    { id: 'Armchair', label: 'Furniture' },
    { id: 'Wrench', label: 'Services' },
    { id: 'Briefcase', label: 'Jobs' },
    { id: 'Sparkles', label: 'Beauty' },
    { id: 'Zap', label: 'Energy' },
    { id: 'Building', label: 'Business' },
    { id: 'GraduationCap', label: 'Education' },
    { id: 'Camera', label: 'Photography' },
    { id: 'Music', label: 'Music' },
    { id: 'Truck', label: 'Logistics' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Admin Categories — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <Package className="w-3 h-3" />
            <span>Category Management</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">
            Manage Categories
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Add, edit, and organize marketplace categories with icons and colors.
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              setFormData({ name: '', icon: 'Package', color: '#16a34a', description: '', sort_order: '0', is_active: 'true', parent_id: '' });
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm shadow-emerald-200 transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
              <button
                onClick={() => {
                  setFormData({ name: '', icon: 'Package', color: '#16a34a', description: '', sort_order: '0', is_active: 'true', parent_id: '' });
                  setEditingId(null);
                  setShowForm(false);
                }}
                className="text-slate-600 hover:text-slate-900 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Electronics"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon.id} value={icon.id}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 bg-transparent border-none cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="Brief description of this category"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: e.target.value }))}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.value }))}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parent Category</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, parent_id: e.target.value }))}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">None (Top Level)</option>
                    {categories.filter((c) => c.id !== editingId).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-sm shadow-emerald-200"
                >
                  {loading ? 'Saving...' : 'Save Category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ name: '', icon: 'Package', color: '#16a34a', description: '', sort_order: '0', is_active: 'true', parent_id: '' });
                    setEditingId(null);
                    setShowForm(false);
                  }}
                  className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">Category List</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Icon</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Color</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort Order</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parent</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500 text-xs">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                            <span className="text-xs font-black">{cat.icon?.charAt(0) || '?'}</span>
                          </div>
                          <span className="text-xs text-slate-600">{cat.icon}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-900">{cat.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{cat.color}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{cat.sort_order}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          cat.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{cat.parent_id || '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteCategory(e, cat.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
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

