'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import { getAdminStats, getAllOrders, formatPrice, type Order } from '@/lib/supabase/services';

export default function AdminDashboardPage() {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0, totalCustomers: 0, totalRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState<(Order & { userEmail?: string; userName?: string })[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login?redirect=/admin');
      else if (!isAdmin) router.replace('/homepage');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) {
      Promise.all([getAdminStats(), getAllOrders()])
        .then(([s, orders]) => {
          setStats(s);
          setRecentOrders(orders.slice(0, 5));
        })
        .catch(() => {})
        .finally(() => setStatsLoading(false));
    }
  }, [isAdmin]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kili-bg">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAdmin) return null;

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: 'ShoppingBagIcon', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Revenue (KSh)', value: formatPrice(stats.totalRevenue), icon: 'BanknotesIcon', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: 'CubeIcon', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Customers', value: stats.totalCustomers.toLocaleString(), icon: 'UsersIcon', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const adminLinks = [
    { label: 'Product Management', href: '/admin/products', icon: 'CubeIcon', desc: 'Add, edit, delete products' },
    { label: 'Order Management', href: '/admin/orders', icon: 'ClipboardDocumentListIcon', desc: 'View and update orders' },
    { label: 'User Management', href: '/admin/users', icon: 'UsersIcon', desc: 'Manage customer accounts' },
    { label: 'Category Management', href: '/admin/categories', icon: 'TagIcon', desc: 'Manage product categories' },
  ];

  const statusColors: Record<string, string> = {
    delivered: 'text-green-700 bg-green-50 border border-green-200',
    processing: 'text-yellow-700 bg-yellow-50 border border-yellow-200',
    shipped: 'text-blue-700 bg-blue-50 border border-blue-200',
    pending: 'text-orange-700 bg-orange-50 border border-orange-200',
    cancelled: 'text-red-700 bg-red-50 border border-red-200',
  };

  return (
    <div className="min-h-screen bg-kili-bg">
      {/* Admin Header */}
      <header className="bg-white border-b border-black/8 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/homepage" className="flex items-center gap-2.5">
              <AppLogo size={30} />
              <span className="font-display font-bold text-kili-fg text-lg tracking-tight">Alluvemall</span>
            </Link>
            <span className="text-black/15 text-lg">|</span>
            <span className="text-sm font-semibold text-primary">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold">{profile.fullName?.charAt(0) || 'A'}</span>
              </div>
              <span className="text-kili-fg font-medium">{profile.fullName}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">Admin</span>
            </div>
            <Link href="/homepage" className="btn-secondary py-1.5 px-3 text-sm">
              <Icon name="HomeIcon" size={15} />
              Store
            </Link>
            <button onClick={signOut} className="btn-secondary py-1.5 px-3 text-sm text-red-500 hover:text-red-600 hover:border-red-300">
              <Icon name="ArrowRightOnRectangleIcon" size={15} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-kili-fg">Welcome back, {profile.fullName.split(' ')[0]} 👋</h1>
          <p className="text-kili-muted mt-1 text-sm">Here&apos;s what&apos;s happening with your store today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-black/8 rounded-2xl p-5 h-28 animate-pulse" />
            ))
          ) : (
            statCards.map((stat) => (
              <div key={stat.label} className="bg-white border border-black/8 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-kili-muted font-semibold uppercase tracking-wide">{stat.label}</p>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon name={stat.icon as Parameters<typeof Icon>[0]['name']} size={16} className={stat.color} />
                  </div>
                </div>
                <p className="text-2xl font-display font-bold text-kili-fg">{stat.value}</p>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-display font-semibold text-kili-fg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminLinks.map((link) => (
              <Link key={link.label} href={link.href} className="bg-white border border-black/8 rounded-2xl p-5 flex items-start gap-4 hover:border-primary/40 hover:shadow-md transition-all group shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon name={link.icon as Parameters<typeof Icon>[0]['name']} size={20} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-kili-fg text-sm group-hover:text-primary transition-colors">{link.label}</p>
                  <p className="text-xs text-kili-muted mt-0.5">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-semibold text-kili-fg">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">View all →</Link>
          </div>
          {statsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-kili-elevated rounded-lg animate-pulse" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-center text-kili-muted py-8">No orders yet</p>
          ) : (
            <div className="space-y-1">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-black/6 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="ShoppingBagIcon" size={15} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-kili-fg">#{order.orderNumber}</p>
                      <p className="text-xs text-kili-muted">{order.userName || order.userEmail || 'Customer'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-kili-fg">{formatPrice(order.total)}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status] || ''}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
