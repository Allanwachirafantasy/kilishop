'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import { getAllOrders, updateOrderStatus, formatPrice, type Order } from '@/lib/supabase/services';

const STATUS_OPTIONS: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  processing: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  shipped: 'bg-blue-50 text-blue-700 border border-blue-200',
  pending: 'bg-orange-50 text-orange-700 border border-orange-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
};

const paymentStatusColors: Record<string, string> = {
  paid: 'bg-green-50 text-green-700 border border-green-200',
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  failed: 'bg-red-50 text-red-700 border border-red-200',
  refunded: 'bg-purple-50 text-purple-700 border border-purple-200',
};

export default function AdminOrdersPage() {
  const { user, isAdmin, loading, signOut, profile } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<(Order & { userEmail?: string; userName?: string })[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login?redirect=/admin/orders');
      else if (!isAdmin) router.replace('/homepage');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) {
      getAllOrders()
        .then(setOrders)
        .finally(() => setDataLoading(false));
    }
  }, [isAdmin]);

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    } catch (err: any) {
      alert(err?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !searchQuery ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.transactionId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
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
            <Link href="/admin" className="flex items-center gap-2.5"><AppLogo size={28} /><span className="font-display font-bold text-kili-fg tracking-tight">Alluvemall</span></Link>
            <span className="text-kili-border">|</span>
            <span className="text-sm font-medium text-primary">Orders</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="btn-secondary py-1.5 px-3 text-sm"><Icon name="ArrowLeftIcon" size={15} />Dashboard</Link>
            <button onClick={signOut} className="btn-secondary py-1.5 px-3 text-sm text-red-400"><Icon name="ArrowRightOnRectangleIcon" size={15} />Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-kili-fg">Order Management</h1>
          <p className="text-kili-muted text-sm mt-1">{orders.length} total orders</p>
        </div>

        <div className="bg-kili-card border border-kili-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-kili-border flex items-center gap-3 flex-wrap">
            <div className="flex-1 relative min-w-48">
              <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kili-muted" />
              <input type="text" placeholder="Search orders, customers, transaction IDs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-dark pl-9 py-2 text-sm" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-dark py-2 text-sm w-44">
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>

          {dataLoading ? (
            <div className="p-8 flex justify-center"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-kili-muted">
              <Icon name="ClipboardDocumentListIcon" size={40} className="mx-auto mb-3 opacity-40" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-kili-border">
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Order ID</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Customer</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Amount</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Payment</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-b border-kili-border last:border-0 hover:bg-kili-elevated transition-colors">
                      <td className="px-4 py-3 font-medium text-primary">#{o.orderNumber}</td>
                      <td className="px-4 py-3">
                        <p className="text-kili-fg font-medium">{o.userName || 'Customer'}</p>
                        <p className="text-xs text-kili-muted">{o.userEmail || ''}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-kili-fg">{formatPrice(o.total)}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-kili-muted capitalize">
                              {o.paymentMethod === 'mpesa' ? '📱 M-Pesa' : o.paymentMethod === 'card' ? '💳 Card' : '💵 COD'}
                            </span>
                          </div>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[o.paymentStatus] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                            {o.paymentStatus ? o.paymentStatus.charAt(0).toUpperCase() + o.paymentStatus.slice(1) : 'Pending'}
                          </span>
                          {o.transactionId && (
                            <p className="text-xs text-kili-muted font-mono truncate max-w-[120px]" title={o.transactionId}>
                              {o.transactionId}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-kili-muted">
                        <p>{new Date(o.createdAt).toLocaleDateString()}</p>
                        {o.paidAt && (
                          <p className="text-xs text-green-600">Paid {new Date(o.paidAt).toLocaleDateString()}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status] || ''}`}>
                          {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusUpdate(o.id, e.target.value as Order['status'])}
                          disabled={updatingId === o.id}
                          className="input-dark py-1 text-xs w-36"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
