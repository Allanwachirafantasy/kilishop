'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

export default function AdminProductsPage() {
  const { user, isAdmin, loading, signOut, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router?.replace('/login?redirect=/admin/products');
      else if (!isAdmin) router?.replace('/homepage');
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kili-bg">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAdmin) return null;

  const products = [
    { id: 1, name: 'Samsung Galaxy A54', category: 'Electronics', price: 'KSh 45,000', stock: 24, status: 'Active' },
    { id: 2, name: 'Nike Air Max 270', category: 'Fashion', price: 'KSh 12,500', stock: 8, status: 'Active' },
    { id: 3, name: 'Blender Pro 2000W', category: 'Home', price: 'KSh 6,800', stock: 0, status: 'Out of Stock' },
    { id: 4, name: 'Organic Shea Butter', category: 'Beauty', price: 'KSh 1,200', stock: 45, status: 'Active' },
    { id: 5, name: 'Wireless Earbuds X3', category: 'Electronics', price: 'KSh 8,500', stock: 3, status: 'Low Stock' },
  ];

  return (
    <div className="min-h-screen bg-kili-bg">
      <header className="bg-kili-card border-b border-kili-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <AppLogo size={28} />
              <span className="font-display font-semibold text-kili-fg">KiliShop</span>
            </Link>
            <span className="text-kili-border">|</span>
            <span className="text-sm font-medium text-primary">Products</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="btn-secondary py-1.5 px-3 text-sm">
              <Icon name="ArrowLeftIcon" size={15} />
              Dashboard
            </Link>
            <button onClick={signOut} className="btn-secondary py-1.5 px-3 text-sm text-red-400">
              <Icon name="ArrowRightOnRectangleIcon" size={15} />
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold text-kili-fg">Product Management</h1>
            <p className="text-kili-muted text-sm mt-1">Manage your store&apos;s product catalog</p>
          </div>
          <button className="btn-primary py-2 px-4 text-sm">
            <Icon name="PlusIcon" size={16} />
            Add Product
          </button>
        </div>

        <div className="bg-kili-card border border-kili-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-kili-border flex items-center gap-3">
            <div className="flex-1 relative">
              <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kili-muted" />
              <input
                type="text"
                placeholder="Search products..."
                className="input-dark pl-9 py-2 text-sm"
              />
            </div>
            <select className="input-dark py-2 text-sm w-40">
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home</option>
              <option>Beauty</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-kili-border">
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Product</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Price</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Stock</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((p) => (
                  <tr key={p?.id} className="border-b border-kili-border last:border-0 hover:bg-kili-elevated transition-colors">
                    <td className="px-4 py-3 font-medium text-kili-fg">{p?.name}</td>
                    <td className="px-4 py-3 text-kili-muted">{p?.category}</td>
                    <td className="px-4 py-3 text-kili-fg">{p?.price}</td>
                    <td className="px-4 py-3 text-kili-fg">{p?.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p?.status === 'Active' ? 'bg-green-400/10 text-green-400' :
                        p?.status === 'Low Stock'? 'bg-yellow-400/10 text-yellow-400' : 'bg-red-400/10 text-red-400'
                      }`}>
                        {p?.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-kili-elevated text-kili-muted hover:text-primary transition-colors" aria-label="Edit">
                          <Icon name="PencilSquareIcon" size={15} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-kili-elevated text-kili-muted hover:text-red-400 transition-colors" aria-label="Delete">
                          <Icon name="TrashIcon" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
