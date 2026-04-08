'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

export default function AdminOrdersPage() {
  const { user, isAdmin, loading, signOut, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login?redirect=/admin/orders');
      else if (!isAdmin) router.replace('/homepage');
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

  const orders = [
    { id: '#KS-1042', customer: 'Amara Osei', email: 'amara@example.com', amount: 'KSh 4,500', date: 'Apr 8, 2026', status: 'Delivered' },
    { id: '#KS-1041', customer: 'Fatima Diallo', email: 'fatima@example.com', amount: 'KSh 12,800', date: 'Apr 7, 2026', status: 'Processing' },
    { id: '#KS-1040', customer: 'Kwame Mensah', email: 'kwame@example.com', amount: 'KSh 3,200', date: 'Apr 7, 2026', status: 'Shipped' },
    { id: '#KS-1039', customer: 'Nkechi Adeyemi', email: 'nkechi@example.com', amount: 'KSh 7,650', date: 'Apr 6, 2026', status: 'Pending' },
    { id: '#KS-1038', customer: 'Kofi Asante', email: 'kofi@example.com', amount: 'KSh 2,100', date: 'Apr 6, 2026', status: 'Cancelled' },
  ];

  const statusColors: Record<string, string> = {
    Delivered: 'bg-green-400/10 text-green-400',
    Processing: 'bg-yellow-400/10 text-yellow-400',
    Shipped: 'bg-blue-400/10 text-blue-400',
    Pending: 'bg-orange-400/10 text-orange-400',
    Cancelled: 'bg-red-400/10 text-red-400',
  };

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
            <span className="text-sm font-medium text-primary">Orders</span>
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
        <div>
          <h1 className="text-2xl font-display font-semibold text-kili-fg">Order Management</h1>
          <p className="text-kili-muted text-sm mt-1">View and manage all customer orders</p>
        </div>

        <div className="bg-kili-card border border-kili-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-kili-border flex items-center gap-3">
            <div className="flex-1 relative">
              <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kili-muted" />
              <input type="text" placeholder="Search orders..." className="input-dark pl-9 py-2 text-sm" />
            </div>
            <select className="input-dark py-2 text-sm w-40">
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-kili-border">
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Order ID</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-kili-border last:border-0 hover:bg-kili-elevated transition-colors">
                    <td className="px-4 py-3 font-medium text-primary">{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-kili-fg font-medium">{o.customer}</p>
                      <p className="text-xs text-kili-muted">{o.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-kili-fg">{o.amount}</td>
                    <td className="px-4 py-3 text-kili-muted">{o.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status] || ''}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-primary hover:text-primary-light transition-colors font-medium">
                        Update Status
                      </button>
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
