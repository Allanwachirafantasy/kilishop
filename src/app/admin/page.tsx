'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

export default function AdminDashboardPage() {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login?redirect=/admin');
      } else if (!isAdmin) {
        router.replace('/homepage');
      }
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

  const stats = [
    { label: 'Total Orders', value: '1,284', icon: 'ShoppingBagIcon', change: '+12%', color: 'text-blue-400' },
    { label: 'Revenue (KSh)', value: '2.4M', icon: 'BanknotesIcon', change: '+8%', color: 'text-green-400' },
    { label: 'Total Products', value: '342', icon: 'CubeIcon', change: '+5', color: 'text-purple-400' },
    { label: 'Active Users', value: '8,921', icon: 'UsersIcon', change: '+3%', color: 'text-orange-400' },
  ];

  const adminLinks = [
    { label: 'Product Management', href: '/admin/products', icon: 'CubeIcon', desc: 'Add, edit, delete products' },
    { label: 'Order Management', href: '/admin/orders', icon: 'ClipboardDocumentListIcon', desc: 'View and update orders' },
    { label: 'User Management', href: '/admin/users', icon: 'UsersIcon', desc: 'Manage customer accounts' },
    { label: 'Category Management', href: '/admin/categories', icon: 'TagIcon', desc: 'Manage product categories' },
    { label: 'Inventory', href: '/admin/inventory', icon: 'ArchiveBoxIcon', desc: 'Track stock levels' },
    { label: 'Analytics', href: '/admin/analytics', icon: 'ChartBarIcon', desc: 'Sales reports & insights' },
  ];

  return (
    <div className="min-h-screen bg-kili-bg">
      {/* Admin Header */}
      <header className="bg-kili-card border-b border-kili-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/homepage" className="flex items-center gap-2">
              <AppLogo size={28} />
              <span className="font-display font-semibold text-kili-fg">KiliShop</span>
            </Link>
            <span className="text-kili-border">|</span>
            <span className="text-sm font-medium text-primary">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-kili-muted">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon name="UserCircleIcon" size={18} className="text-primary" />
              </div>
              <span className="text-kili-fg font-medium">{profile.fullName}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">Admin</span>
            </div>
            <Link href="/homepage" className="btn-secondary py-1.5 px-3 text-sm">
              <Icon name="HomeIcon" size={15} />
              Store
            </Link>
            <button onClick={signOut} className="btn-secondary py-1.5 px-3 text-sm text-red-400 hover:text-red-300">
              <Icon name="ArrowRightOnRectangleIcon" size={15} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-display font-semibold text-kili-fg">
            Welcome back, {profile.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-kili-muted mt-1 text-sm">Here&apos;s what&apos;s happening with your store today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-kili-card border border-kili-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-kili-muted font-medium uppercase tracking-wide">{stat.label}</p>
                <Icon name={stat.icon as any} size={18} className={stat.color} />
              </div>
              <p className="text-2xl font-display font-bold text-kili-fg">{stat.value}</p>
              <p className="text-xs text-green-400 font-medium">{stat.change} this month</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-display font-semibold text-kili-fg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="bg-kili-card border border-kili-border rounded-2xl p-5 flex items-start gap-4 hover:border-primary/40 hover:bg-kili-elevated transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon name={link.icon as any} size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-kili-fg text-sm group-hover:text-primary transition-colors">{link.label}</p>
                  <p className="text-xs text-kili-muted mt-0.5">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders placeholder */}
        <div className="bg-kili-card border border-kili-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-kili-fg">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:text-primary-light transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { id: '#KS-1042', customer: 'Amara Osei', amount: 'KSh 4,500', status: 'Delivered', statusColor: 'text-green-400 bg-green-400/10' },
              { id: '#KS-1041', customer: 'Fatima Diallo', amount: 'KSh 12,800', status: 'Processing', statusColor: 'text-yellow-400 bg-yellow-400/10' },
              { id: '#KS-1040', customer: 'Kwame Mensah', amount: 'KSh 3,200', status: 'Shipped', statusColor: 'text-blue-400 bg-blue-400/10' },
              { id: '#KS-1039', customer: 'Nkechi Adeyemi', amount: 'KSh 7,650', status: 'Pending', statusColor: 'text-orange-400 bg-orange-400/10' },
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-kili-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-kili-elevated flex items-center justify-center">
                    <Icon name="ShoppingBagIcon" size={14} className="text-kili-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-kili-fg">{order.id}</p>
                    <p className="text-xs text-kili-muted">{order.customer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-kili-fg">{order.amount}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.statusColor}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
