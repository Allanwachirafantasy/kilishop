'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getUserOrders, formatPrice, type Order } from '@/lib/supabase/services';
import { createClient } from '@/lib/supabase/client';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string; step: number }
> = {
  pending:    { label: 'Order Placed',   color: 'text-orange-600', bg: 'bg-orange-500',  icon: 'ClipboardDocumentListIcon', step: 1 },
  processing: { label: 'Processing',     color: 'text-yellow-600', bg: 'bg-yellow-500',  icon: 'CogIcon',                   step: 2 },
  shipped:    { label: 'Shipped',        color: 'text-blue-600',   bg: 'bg-blue-500',    icon: 'TruckIcon',                 step: 3 },
  delivered:  { label: 'Delivered',      color: 'text-green-600',  bg: 'bg-green-500',   icon: 'CheckCircleIcon',           step: 4 },
  cancelled:  { label: 'Cancelled',      color: 'text-red-600',    bg: 'bg-red-500',     icon: 'XCircleIcon',               step: 0 },
};

const TIMELINE_STEPS = [
  { key: 'pending',    label: 'Order Placed',   icon: 'ClipboardDocumentListIcon', desc: 'Your order has been received' },
  { key: 'processing', label: 'Processing',     icon: 'CogIcon',                   desc: 'We\'re preparing your items' },
  { key: 'shipped',    label: 'Shipped',        icon: 'TruckIcon',                 desc: 'Your order is on the way' },
  { key: 'delivered',  label: 'Delivered',      icon: 'CheckCircleIcon',           desc: 'Order delivered successfully' },
];

function getEstimatedDelivery(order: Order): string {
  const created = new Date(order.createdAt);
  const status = order.status;
  if (status === 'delivered') return 'Delivered';
  if (status === 'cancelled') return 'Cancelled';
  const daysToAdd = status === 'shipped' ? 2 : status === 'processing' ? 4 : 5;
  const est = new Date(created);
  est.setDate(est.getDate() + daysToAdd);
  return est.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, isSelected, onClick }: { order: Order; isSelected: boolean; onClick: () => void }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all ${
        isSelected
          ? 'border-primary bg-primary/5' :'border-kili-border bg-kili-card hover:border-primary/40 hover:bg-kili-elevated'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-kili-fg text-sm">#{order.orderNumber}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color} bg-kili-elevated`}>
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-kili-muted">
        <span>{new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span className="font-semibold text-kili-fg">{formatPrice(order.total)}</span>
      </div>
      <div className="mt-2 text-xs text-kili-muted">
        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <span className="ml-2 text-primary">· Est. {getEstimatedDelivery(order)}</span>
        )}
      </div>
    </button>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function ShipmentTimeline({ order }: { order: Order }) {
  const currentStep = STATUS_CONFIG[order.status]?.step ?? 1;
  const isCancelled = order.status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
        <Icon name="XCircleIcon" size={24} className="text-red-500 shrink-0" />
        <div>
          <p className="font-medium text-red-600">Order Cancelled</p>
          <p className="text-xs text-kili-muted mt-0.5">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {TIMELINE_STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isPending = stepNum > currentStep;
        return (
          <div key={step.key} className="flex gap-4 pb-6 last:pb-0">
            {/* Connector line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-primary text-white shadow-glow'
                    : 'bg-kili-elevated border border-kili-border text-kili-subtle'
                }`}
              >
                {isCompleted ? (
                  <Icon name="CheckIcon" size={16} />
                ) : (
                  <Icon name={step.icon as any} size={16} />
                )}
              </div>
              {idx < TIMELINE_STEPS.length - 1 && (
                <div
                  className={`w-0.5 flex-1 mt-1 min-h-[24px] transition-all ${
                    isCompleted ? 'bg-green-500/60' : 'bg-kili-border'
                  }`}
                />
              )}
            </div>
            {/* Content */}
            <div className="pt-1.5 pb-2">
              <p
                className={`text-sm font-semibold ${
                  isCompleted ? 'text-green-600' : isActive ? 'text-kili-fg' : 'text-kili-subtle'
                }`}
              >
                {step.label}
                {isActive && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Live
                  </span>
                )}
              </p>
              <p className={`text-xs mt-0.5 ${isPending ? 'text-kili-subtle' : 'text-kili-muted'}`}>
                {step.desc}
              </p>
              {isCompleted && step.key === 'pending' && (
                <p className="text-xs text-kili-subtle mt-0.5">
                  {new Date(order.createdAt).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Order Detail Panel ───────────────────────────────────────────────────────
function OrderDetail({ order, liveUpdating }: { order: Order; liveUpdating: boolean }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const estDelivery = getEstimatedDelivery(order);

  return (
    <div className="space-y-5">
      {/* Live update indicator */}
      {liveUpdating && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live updates active — this page refreshes automatically
        </div>
      )}

      {/* Status hero */}
      <div className="bg-kili-card border border-kili-border rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-kili-muted uppercase tracking-wide font-medium mb-1">Order #{order.orderNumber}</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${cfg.color} bg-kili-elevated`}>
              <Icon name={cfg.icon as any} size={15} />
              {cfg.label}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-kili-muted mb-1">Total</p>
            <p className="text-xl font-display font-bold text-kili-fg">{formatPrice(order.total)}</p>
          </div>
        </div>

        {order.status !== 'cancelled' && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-kili-elevated rounded-xl">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="CalendarDaysIcon" size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-kili-muted">Estimated Delivery</p>
              <p className="text-sm font-semibold text-kili-fg">{estDelivery}</p>
            </div>
          </div>
        )}
      </div>

      {/* Shipment timeline */}
      <div className="bg-kili-card border border-kili-border rounded-2xl p-5">
        <h3 className="font-display font-semibold text-kili-fg mb-5">Shipment Timeline</h3>
        <ShipmentTimeline order={order} />
      </div>

      {/* Order items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-kili-card border border-kili-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-kili-border">
            <h3 className="font-display font-semibold text-kili-fg">Items Ordered</h3>
          </div>
          <div className="divide-y divide-kili-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-kili-elevated shrink-0">
                  <AppImage
                    src={item.productImage}
                    alt={item.productName}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-kili-fg truncate">{item.productName}</p>
                  <p className="text-xs text-kili-muted mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-kili-fg shrink-0">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-kili-border space-y-1.5">
            <div className="flex justify-between text-xs text-kili-muted">
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-kili-muted">
              <span>Shipping</span><span>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Discount</span><span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-kili-fg pt-1 border-t border-kili-border">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delivery address */}
      {order.deliveryAddress && (
        <div className="bg-kili-card border border-kili-border rounded-2xl p-5">
          <h3 className="font-display font-semibold text-kili-fg mb-3">Delivery Address</h3>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="MapPinIcon" size={15} className="text-primary" />
            </div>
            <div className="text-sm text-kili-muted space-y-0.5">
              <p className="text-kili-fg font-medium">
                {order.deliveryAddress.firstName} {order.deliveryAddress.lastName}
              </p>
              {order.deliveryAddress.address && <p>{order.deliveryAddress.address}</p>}
              {order.deliveryAddress.city && (
                <p>{order.deliveryAddress.city}{order.deliveryAddress.county ? `, ${order.deliveryAddress.county}` : ''}</p>
              )}
              {order.deliveryAddress.phone && <p>{order.deliveryAddress.phone}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Payment info */}
      <div className="bg-kili-card border border-kili-border rounded-2xl p-5">
        <h3 className="font-display font-semibold text-kili-fg mb-3">Payment</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-kili-muted">
            <Icon name="CreditCardIcon" size={16} className="text-kili-subtle" />
            <span className="capitalize">{order.paymentMethod === 'mpesa' ? 'M-Pesa' : order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          }`}>
            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function OrdersPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [liveUpdating, setLiveUpdating] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? orders[0] ?? null;

  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserOrders(user.id);
      setOrders(data);
      // Auto-select from query param or first order
      const qOrderId = searchParams.get('order');
      if (qOrderId) {
        setSelectedOrderId(qOrderId);
      } else if (!selectedOrderId && data.length > 0) {
        setSelectedOrderId(data[0].id);
      }
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [user, searchParams, selectedOrderId]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/orders');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  // Supabase real-time subscription
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadOrders();
        }
      )
      .subscribe((status) => {
        setLiveUpdating(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadOrders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kili-bg">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kili-bg flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="w-8 h-8 rounded-lg bg-kili-card border border-kili-border flex items-center justify-center hover:border-primary/40 transition-colors">
            <Icon name="ArrowLeftIcon" size={16} className="text-kili-muted" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-semibold text-kili-fg">My Orders</h1>
            <p className="text-sm text-kili-muted mt-0.5">Track your orders in real time</p>
          </div>
          {liveUpdating && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
          )}
        </div>

        {ordersLoading ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-kili-card border border-kili-border flex items-center justify-center mb-4">
              <Icon name="ShoppingBagIcon" size={36} className="text-kili-subtle" />
            </div>
            <h2 className="text-lg font-display font-semibold text-kili-fg mb-2">No orders yet</h2>
            <p className="text-kili-muted text-sm mb-6">Start shopping to see your orders here</p>
            <Link href="/product-listing" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[320px_1fr] gap-6">
            {/* Order list */}
            <div className="space-y-3">
              <p className="text-xs text-kili-muted uppercase tracking-wide font-medium px-1">
                {orders.length} Order{orders.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 scrollbar-thin">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isSelected={selectedOrder?.id === order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                  />
                ))}
              </div>
            </div>

            {/* Order detail */}
            <div className="min-w-0">
              {selectedOrder ? (
                <OrderDetail order={selectedOrder} liveUpdating={liveUpdating} />
              ) : (
                <div className="flex items-center justify-center h-40 text-kili-muted text-sm">
                  Select an order to view details
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-kili-bg">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <OrdersPageContent />
    </React.Suspense>
  );
}
