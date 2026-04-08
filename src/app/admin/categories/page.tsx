'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import { getCategories, createCategory, updateCategory, deleteCategory, type Category } from '@/lib/supabase/services';

export default function AdminCategoriesPage() {
  const { user, isAdmin, loading, signOut, profile } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', icon: '📦', color: '#6366F1', description: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login?redirect=/admin/categories');
      else if (!isAdmin) router.replace('/homepage');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) {
      getCategories().then(setCategories).finally(() => setDataLoading(false));
    }
  }, [isAdmin]);

  const openAdd = () => {
    setEditingCat(null);
    setForm({ name: '', icon: '📦', color: '#6366F1', description: '' });
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color, description: cat.description });
    setSaveError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setSaveError('Name is required'); return; }
    setSaving(true);
    setSaveError('');
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, { name: form.name, icon: form.icon, color: form.color, description: form.description });
      } else {
        await createCategory({ name: form.name, icon: form.icon, color: form.color, description: form.description });
      }
      const cats = await getCategories();
      setCategories(cats);
      setShowModal(false);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category');
    }
  };

  if (loading || !profile) {
    return <div className="min-h-screen flex items-center justify-center bg-kili-bg"><span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-kili-bg">
      <header className="bg-kili-card border-b border-kili-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2"><AppLogo size={28} /><span className="font-display font-semibold text-kili-fg">KiliShop</span></Link>
            <span className="text-kili-border">|</span>
            <span className="text-sm font-medium text-primary">Categories</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="btn-secondary py-1.5 px-3 text-sm"><Icon name="ArrowLeftIcon" size={15} />Dashboard</Link>
            <button onClick={signOut} className="btn-secondary py-1.5 px-3 text-sm text-red-400"><Icon name="ArrowRightOnRectangleIcon" size={15} />Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold text-kili-fg">Category Management</h1>
            <p className="text-kili-muted text-sm mt-1">{categories.length} categories</p>
          </div>
          <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm">
            <Icon name="PlusIcon" size={16} />Add Category
          </button>
        </div>

        {dataLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-kili-card border border-kili-border rounded-2xl h-32 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-kili-card border border-kili-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{cat.icon}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-kili-elevated text-kili-muted hover:text-primary transition-colors"><Icon name="PencilSquareIcon" size={14} /></button>
                    <button onClick={() => setDeleteConfirm(cat.id)} className="p-1.5 rounded-lg hover:bg-kili-elevated text-kili-muted hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={14} /></button>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-kili-fg">{cat.name}</p>
                  {cat.description && <p className="text-xs text-kili-muted mt-0.5 line-clamp-2">{cat.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-kili-muted">{cat.color}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-kili-card border border-kili-border rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold text-kili-fg">{editingCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-kili-elevated text-kili-muted"><Icon name="XMarkIcon" size={20} /></button>
            </div>
            {saveError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{saveError}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-dark" placeholder="Electronics" />
              </div>
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Icon (emoji)</label>
                <input type="text" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="input-dark" placeholder="📱" />
              </div>
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Color</label>
                <div className="flex gap-2">
                  <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded-lg border border-kili-border bg-kili-elevated cursor-pointer" />
                  <input type="text" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="input-dark flex-1" placeholder="#6366F1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="input-dark resize-none" placeholder="Category description..." />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">{saving ? 'Saving...' : editingCat ? 'Update' : 'Add Category'}</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary py-2.5 px-4">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-kili-card border border-kili-border rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-semibold text-kili-fg">Delete Category?</h3>
            <p className="text-sm text-kili-muted">Products in this category will have their category removed.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-primary bg-red-600 hover:bg-red-700 flex-1 justify-center py-2">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary py-2 px-4">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
