'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import AppImage from '@/components/ui/AppImage';
import {
  getAllProductsAdmin, getCategories, createProduct, updateProduct, deleteProduct,
  formatPrice, getStockStatus, type Product, type Category
} from '@/lib/supabase/services';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: string;
  imageUrl: string;
  categoryId: string;
  brand: string;
  stock: string;
  badge: string;
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isOnSale: boolean;
  isNew: boolean;
}

const emptyForm: ProductForm = {
  name: '', description: '', price: '', originalPrice: '', discount: '',
  imageUrl: '', categoryId: '', brand: '', stock: '', badge: '',
  isActive: true, isFeatured: false, isTrending: false, isOnSale: false, isNew: false,
};

export default function AdminProductsPage() {
  const { user, isAdmin, loading, signOut, profile } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login?redirect=/admin/products');
      else if (!isAdmin) router.replace('/homepage');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) {
      Promise.all([getAllProductsAdmin(), getCategories()])
        .then(([prods, cats]) => { setProducts(prods); setCategories(cats); })
        .finally(() => setDataLoading(false));
    }
  }, [isAdmin]);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setSaveError('');
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      discount: product.discount?.toString() || '',
      imageUrl: product.imageUrl,
      categoryId: product.categoryId || '',
      brand: product.brand,
      stock: product.stock.toString(),
      badge: product.badge,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isTrending: product.isTrending,
      isOnSale: product.isOnSale,
      isNew: product.isNew,
    });
    setSaveError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { setSaveError('Name and price are required'); return; }
    setSaving(true);
    setSaveError('');
    try {
      const input = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        discount: form.discount ? parseInt(form.discount) : 0,
        imageUrl: form.imageUrl,
        categoryId: form.categoryId || undefined,
        brand: form.brand,
        stock: parseInt(form.stock) || 0,
        badge: form.badge,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isTrending: form.isTrending,
        isOnSale: form.isOnSale,
        isNew: form.isNew,
      };
      if (editingProduct) {
        await updateProduct(editingProduct.id, input);
      } else {
        await createProduct(input);
      }
      const prods = await getAllProductsAdmin();
      setProducts(prods);
      setShowModal(false);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete product');
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !filterCategory || p.categoryId === filterCategory;
    return matchSearch && matchCat;
  });

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
            <span className="text-sm font-medium text-primary">Products</span>
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
            <h1 className="text-2xl font-display font-semibold text-kili-fg">Product Management</h1>
            <p className="text-kili-muted text-sm mt-1">{products.length} products in catalog</p>
          </div>
          <button onClick={openAddModal} className="btn-primary py-2 px-4 text-sm">
            <Icon name="PlusIcon" size={16} />Add Product
          </button>
        </div>

        <div className="bg-kili-card border border-kili-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-kili-border flex items-center gap-3 flex-wrap">
            <div className="flex-1 relative min-w-48">
              <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kili-muted" />
              <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-dark pl-9 py-2 text-sm" />
            </div>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-dark py-2 text-sm w-44">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {dataLoading ? (
            <div className="p-8 flex justify-center"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-kili-muted">
              <Icon name="CubeIcon" size={40} className="mx-auto mb-3 opacity-40" />
              <p>No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-kili-border">
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Product</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Category</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Price</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Stock</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Flags</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const stock = getStockStatus(p.stock);
                    return (
                      <tr key={p.id} className="border-b border-kili-border last:border-0 hover:bg-kili-elevated transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-kili-elevated shrink-0">
                              <AppImage src={p.imageUrl} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-medium text-kili-fg line-clamp-1">{p.name}</p>
                              <p className="text-xs text-kili-muted">{p.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-kili-muted">{p.category?.name || '—'}</td>
                        <td className="px-4 py-3 text-kili-fg">
                          <p>{formatPrice(p.price)}</p>
                          {p.originalPrice && <p className="text-xs text-kili-subtle line-through">{formatPrice(p.originalPrice)}</p>}
                        </td>
                        <td className="px-4 py-3 text-kili-fg">{p.stock}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stock.color}`}>{stock.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {p.isFeatured && <span className="px-1.5 py-0.5 rounded text-xs bg-blue-400/10 text-blue-400">Featured</span>}
                            {p.isTrending && <span className="px-1.5 py-0.5 rounded text-xs bg-orange-400/10 text-orange-400">Trending</span>}
                            {p.isOnSale && <span className="px-1.5 py-0.5 rounded text-xs bg-green-400/10 text-green-400">Sale</span>}
                            {p.isNew && <span className="px-1.5 py-0.5 rounded text-xs bg-purple-400/10 text-purple-400">New</span>}
                            {!p.isActive && <span className="px-1.5 py-0.5 rounded text-xs bg-red-400/10 text-red-400">Inactive</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(p)} className="p-1.5 rounded-lg hover:bg-kili-elevated text-kili-muted hover:text-primary transition-colors" aria-label="Edit">
                              <Icon name="PencilSquareIcon" size={15} />
                            </button>
                            <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg hover:bg-kili-elevated text-kili-muted hover:text-red-400 transition-colors" aria-label="Delete">
                              <Icon name="TrashIcon" size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-kili-card border border-kili-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold text-kili-fg">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-kili-elevated text-kili-muted"><Icon name="XMarkIcon" size={20} /></button>
            </div>

            {saveError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{saveError}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Product Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-dark" placeholder="Samsung Galaxy A54..." />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="input-dark resize-none" placeholder="Product description..." />
              </div>
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Price (KSh) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="input-dark" placeholder="28999" />
              </div>
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Original Price (KSh)</label>
                <input type="number" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))} className="input-dark" placeholder="35999" />
              </div>
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Discount (%)</label>
                <input type="number" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} className="input-dark" placeholder="19" />
              </div>
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Stock Quantity</label>
                <input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="input-dark" placeholder="100" />
              </div>
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Brand</label>
                <input type="text" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="input-dark" placeholder="Samsung" />
              </div>
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Category</label>
                <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="input-dark">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Image URL</label>
                <input type="url" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className="input-dark" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Badge Text</label>
                <input type="text" value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} className="input-dark" placeholder="HOT, NEW, BEST SELLER..." />
              </div>
            </div>

            {/* Flags */}
            <div>
              <p className="text-xs font-medium text-kili-muted uppercase tracking-wide mb-3">Product Flags</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'isActive', label: 'Active' },
                  { key: 'isFeatured', label: 'Featured' },
                  { key: 'isTrending', label: 'Trending' },
                  { key: 'isOnSale', label: 'On Sale' },
                  { key: 'isNew', label: 'New Arrival' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key as keyof ProductForm] as boolean}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-kili-border text-primary"
                    />
                    <span className="text-sm text-kili-fg">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
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
            <h3 className="font-semibold text-kili-fg">Delete Product?</h3>
            <p className="text-sm text-kili-muted">This action cannot be undone. The product will be permanently removed.</p>
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
