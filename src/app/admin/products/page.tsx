'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import {
  uploadProductImage, getProductImages, saveProductImageRecord,
  deleteProductImageRecord, setProductCoverImage, deleteProductImageFromStorage,
  type ProductImageRecord
} from '@/lib/supabase/imageUpload';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: string;
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

interface LocalImage {
  file: File;
  previewUrl: string;
  isCover: boolean;
}

const emptyForm: ProductForm = {
  name: '', description: '', price: '', originalPrice: '', discount: '',
  categoryId: '', brand: '', stock: '', badge: '',
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

  // Image state
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImageRecord[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<ProductImageRecord[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
    setLocalImages([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setSaveError('');
    setShowModal(true);
  };

  const openEditModal = async (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      discount: product.discount?.toString() || '',
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
    setLocalImages([]);
    setImagesToDelete([]);
    setSaveError('');
    setImageLoading(true);
    setShowModal(true);
    try {
      const imgs = await getProductImages(product.id);
      setExistingImages(imgs);
    } catch {
      setExistingImages([]);
    } finally {
      setImageLoading(false);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    // Remove any existing local cover
    setLocalImages((prev) => {
      const filtered = prev.filter((img) => !img.isCover);
      return [{ file, previewUrl, isCover: true }, ...filtered];
    });
    // If editing, mark existing cover for deletion
    if (editingProduct) {
      const existingCover = existingImages.find((img) => img.isCover);
      if (existingCover) {
        setImagesToDelete((prev) => [...prev.filter((i) => i.id !== existingCover.id), existingCover]);
        setExistingImages((prev) => prev.filter((img) => img.id !== existingCover.id));
      }
    }
    e.target.value = '';
  };

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: LocalImage[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isCover: false,
    }));
    setLocalImages((prev) => [...prev, ...newImages]);
    e.target.value = '';
  };

  const removeLocalImage = (idx: number) => {
    setLocalImages((prev) => {
      const img = prev[idx];
      URL.revokeObjectURL(img.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExistingImage = (img: ProductImageRecord) => {
    setImagesToDelete((prev) => [...prev, img]);
    setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
  };

  const makeExistingCover = async (img: ProductImageRecord) => {
    if (!editingProduct) return;
    setExistingImages((prev) => prev.map((i) => ({ ...i, isCover: i.id === img.id })));
  };

  const makeLocalCover = (idx: number) => {
    setLocalImages((prev) => prev.map((img, i) => ({ ...img, isCover: i === idx })));
    // Also unset existing covers
    setExistingImages((prev) => prev.map((img) => ({ ...img, isCover: false })));
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
        imageUrl: '',
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

      let productId: string;

      if (editingProduct) {
        await updateProduct(editingProduct.id, input);
        productId = editingProduct.id;
      } else {
        const created = await createProduct(input);
        productId = created.id;
      }

      // Delete removed existing images
      for (const img of imagesToDelete) {
        await deleteProductImageRecord(img.id, img.imageUrl, true);
      }

      // Upload new local images
      const localCover = localImages.find((img) => img.isCover);
      const localGallery = localImages.filter((img) => !img.isCover);

      // Determine sort order start
      const maxExistingSort = existingImages.reduce((max, img) => Math.max(max, img.sortOrder), -1);
      let sortCounter = maxExistingSort + 1;

      // Upload cover
      if (localCover) {
        const url = await uploadProductImage(localCover.file, productId);
        await saveProductImageRecord(productId, url, true, 0);
        // Update products table
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        await supabase.from('products').update({ cover_image_url: url, image_url: url }).eq('id', productId);
      } else if (editingProduct) {
        // Update cover from existing if changed
        const newCover = existingImages.find((img) => img.isCover);
        if (newCover) {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          await supabase.from('product_images').update({ is_cover: false }).eq('product_id', productId);
          await supabase.from('product_images').update({ is_cover: true }).eq('id', newCover.id);
          await supabase.from('products').update({ cover_image_url: newCover.imageUrl, image_url: newCover.imageUrl }).eq('id', productId);
        }
      }

      // Upload gallery images
      for (const img of localGallery) {
        const url = await uploadProductImage(img.file, productId);
        await saveProductImageRecord(productId, url, false, sortCounter++);
      }

      // If no cover set yet and we have a first gallery image, use it as cover
      if (!localCover && !existingImages.some((img) => img.isCover) && localGallery.length > 0) {
        const allImgs = await getProductImages(productId);
        if (allImgs.length > 0) {
          await setProductCoverImage(productId, allImgs[0].id, allImgs[0].imageUrl);
        }
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
      // Delete all product images from storage first
      const imgs = await getProductImages(id);
      for (const img of imgs) {
        await deleteProductImageFromStorage(img.imageUrl);
      }
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

  const coverImage = localImages.find((img) => img.isCover) || null;
  const existingCover = existingImages.find((img) => img.isCover) || null;
  const galleryLocalImages = localImages.filter((img) => !img.isCover);
  const galleryExistingImages = existingImages.filter((img) => !img.isCover);

  if (loading || !profile) {
    return <div className="min-h-screen flex items-center justify-center bg-kili-bg"><span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-kili-bg">
      <header className="bg-kili-card border-b border-kili-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5"><AppLogo size={28} /><span className="font-display font-bold text-kili-fg tracking-tight">Alluvemall</span></Link>
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

            {/* Cover Image Upload */}
            <div>
              <p className="text-xs font-medium text-kili-muted uppercase tracking-wide mb-2">Cover Image</p>
              <div className="flex items-start gap-3">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-kili-border bg-kili-elevated flex items-center justify-center overflow-hidden shrink-0">
                  {coverImage ? (
                    <img src={coverImage.previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : existingCover ? (
                    <img src={existingCover.imageUrl} alt="Existing cover" className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="PhotoIcon" size={28} className="text-kili-border" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="btn-secondary py-2 px-3 text-xs w-full"
                  >
                    <Icon name="ArrowUpTrayIcon" size={14} />
                    {coverImage || existingCover ? 'Replace Cover Image' : 'Upload Cover Image'}
                  </button>
                  {(coverImage || existingCover) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (coverImage) {
                          URL.revokeObjectURL(coverImage.previewUrl);
                          setLocalImages((prev) => prev.filter((img) => !img.isCover));
                        } else if (existingCover) {
                          removeExistingImage(existingCover);
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1"
                    >
                      <Icon name="TrashIcon" size={12} />Remove cover
                    </button>
                  )}
                  <p className="text-xs text-kili-subtle">JPG, PNG, WebP — max 5MB</p>
                </div>
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFileChange} />
            </div>

            {/* Gallery Images */}
            <div>
              <p className="text-xs font-medium text-kili-muted uppercase tracking-wide mb-2">Gallery Images</p>
              {imageLoading ? (
                <div className="flex items-center gap-2 text-kili-muted text-sm py-2">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Loading images...
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-2">
                  {/* Existing gallery images */}
                  {galleryExistingImages.map((img) => (
                    <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-kili-border group">
                      <img src={img.imageUrl} alt="Gallery" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => makeExistingCover(img)}
                          title="Set as cover"
                          className="p-1 rounded bg-white/20 hover:bg-white/40 text-white"
                        >
                          <Icon name="StarIcon" size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img)}
                          title="Remove"
                          className="p-1 rounded bg-red-500/60 hover:bg-red-500/80 text-white"
                        >
                          <Icon name="TrashIcon" size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* New local gallery images */}
                  {galleryLocalImages.map((img, idx) => {
                    const realIdx = localImages.indexOf(img);
                    return (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-primary/40 group">
                        <img src={img.previewUrl} alt="New gallery" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => makeLocalCover(realIdx)}
                            title="Set as cover"
                            className="p-1 rounded bg-white/20 hover:bg-white/40 text-white"
                          >
                            <Icon name="StarIcon" size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLocalImage(realIdx)}
                            title="Remove"
                            className="p-1 rounded bg-red-500/60 hover:bg-red-500/80 text-white"
                          >
                            <Icon name="TrashIcon" size={12} />
                          </button>
                        </div>
                        <span className="absolute top-1 left-1 bg-primary text-white text-[9px] px-1 rounded">NEW</span>
                      </div>
                    );
                  })}
                  {/* Add more button */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-kili-border bg-kili-elevated flex flex-col items-center justify-center text-kili-muted hover:border-primary hover:text-primary transition-colors"
                  >
                    <Icon name="PlusIcon" size={20} />
                    <span className="text-[10px] mt-0.5">Add</span>
                  </button>
                </div>
              )}
              <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryFilesChange} />
              <p className="text-xs text-kili-subtle">Click ⭐ on any image to set it as cover. Hover to see options.</p>
            </div>

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
                {saving ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                ) : editingProduct ? 'Update Product' : 'Add Product'}
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
            <p className="text-sm text-kili-muted">This action cannot be undone. The product and all its images will be permanently removed.</p>
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
