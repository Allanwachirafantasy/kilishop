'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getUserOrders, formatPrice, type Order } from '@/lib/supabase/services';

export default function CustomerDashboardPage() {
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile'>('overview');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setProfileForm({ fullName: profile.fullName, phone: profile.phone });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      getUserOrders(user.id)
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kili-bg">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await updateProfile({ fullName: profileForm.fullName, phone: profileForm.phone });
      setSaveMsg('Profile updated successfully!');
      setEditMode(false);
    } catch {
      setSaveMsg('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const statusColors: Record<string, string> = {
    delivered: 'bg-green-50 text-green-700 border border-green-200',
    processing: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    shipped: 'bg-blue-50 text-blue-700 border border-blue-200',
    pending: 'bg-orange-50 text-orange-700 border border-orange-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
  };

  const totalSpent = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'HomeIcon' },
    { id: 'orders', label: 'My Orders', icon: 'ShoppingBagIcon' },
    { id: 'profile', label: 'Profile', icon: 'UserCircleIcon' },
  ] as const;

  return (
    <div className="min-h-screen bg-kili-bg flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold text-kili-fg">My Account</h1>
            <p className="text-kili-muted text-sm mt-1">
              Welcome back, <span className="text-kili-fg font-medium">{profile.fullName}</span>
            </p>
          </div>
          <button onClick={signOut} className="btn-secondary py-2 px-3 text-sm text-red-500 hover:text-red-600 hover:border-red-300">
            <Icon name="ArrowRightOnRectangleIcon" size={16} />
            Sign Out
          </button>
        </div>

        <div className="flex border-b border-kili-border gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-kili-muted hover:text-kili-fg'}`}
            >
              <Icon name={tab.icon as any} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Orders', value: orders.length.toString(), icon: 'ShoppingBagIcon', color: 'text-blue-600' },
                { label: 'Total Spent', value: formatPrice(totalSpent), icon: 'BanknotesIcon', color: 'text-green-600' },
                { label: 'Pending Orders', value: orders.filter((o) => o.status === 'pending' || o.status === 'processing').length.toString(), icon: 'ClockIcon', color: 'text-orange-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-kili-card border border-kili-border rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-kili-muted font-medium">{stat.label}</p>
                    <Icon name={stat.icon as any} size={16} className={stat.color} />
                  </div>
                  <p className="text-xl font-display font-bold text-kili-fg">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-kili-card border border-kili-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-kili-fg">Recent Orders</h2>
                <button onClick={() => setActiveTab('orders')} className="text-sm text-primary hover:text-primary-light transition-colors">View all →</button>
              </div>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="h-12 bg-kili-elevated rounded-lg animate-pulse" />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="ShoppingBagIcon" size={32} className="text-kili-subtle mx-auto mb-2" />
                  <p className="text-kili-muted text-sm">No orders yet</p>
                  <Link href="/product-listing" className="btn-primary mt-3 inline-flex text-sm py-2">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-kili-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-kili-fg">#{order.orderNumber}</p>
                        <p className="text-xs text-kili-muted">{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 0} item(s)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-kili-fg">{formatPrice(order.total)}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || ''}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Continue Shopping', href: '/product-listing', icon: 'ShoppingCartIcon' },
                { label: 'View Cart', href: '/cart', icon: 'ShoppingBagIcon' },
                { label: 'Track Orders', href: '/orders', icon: 'TruckIcon' },
                { label: 'Checkout', href: '/checkout', icon: 'CreditCardIcon' },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="bg-kili-card border border-kili-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/40 hover:bg-kili-elevated transition-all text-center">
                  <Icon name={item.icon as any} size={20} className="text-primary" />
                  <span className="text-xs font-medium text-kili-muted">{item.label}</span>
                </Link>
              ))}
              <button onClick={() => { setActiveTab('profile'); setEditMode(true); }} className="bg-kili-card border border-kili-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/40 hover:bg-kili-elevated transition-all text-center">
                <Icon name="PencilSquareIcon" size={20} className="text-primary" />
                <span className="text-xs font-medium text-kili-muted">Edit Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-kili-card border border-kili-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-kili-border">
              <h2 className="font-display font-semibold text-kili-fg">Order History</h2>
            </div>
            {ordersLoading ? (
              <div className="p-8 flex justify-center">
                <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <Icon name="ShoppingBagIcon" size={40} className="text-kili-subtle mx-auto mb-3" />
                <p className="text-kili-muted">No orders yet</p>
                <Link href="/product-listing" className="btn-primary mt-4 inline-flex">Start Shopping</Link>
              </div>
            ) : (
              <div className="divide-y divide-kili-border">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-kili-elevated transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-kili-elevated flex items-center justify-center">
                          <Icon name="ShoppingBagIcon" size={18} className="text-kili-muted" />
                        </div>
                        <div>
                          <p className="font-medium text-kili-fg">#{order.orderNumber}</p>
                          <p className="text-xs text-kili-muted">{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 0} item(s)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-kili-fg">{formatPrice(order.total)}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || ''}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="ml-13 pl-13 text-xs text-kili-muted">
                        {order.items.slice(0, 2).map((item) => (
                          <span key={item.id} className="mr-2">{item.productName} × {item.quantity}</span>
                        ))}
                        {order.items.length > 2 && <span>+{order.items.length - 2} more</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-kili-card border border-kili-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-kili-fg">Profile Settings</h2>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="btn-secondary py-1.5 px-3 text-sm">
                  <Icon name="PencilSquareIcon" size={15} />
                  Edit
                </button>
              )}
            </div>

            {saveMsg && (
              <div className={`p-3 rounded-xl text-sm ${saveMsg.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {saveMsg}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-kili-elevated rounded-xl">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xl font-bold">{profile.fullName?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <p className="font-semibold text-kili-fg">{profile.fullName}</p>
                  <p className="text-sm text-kili-muted">{profile.email}</p>
                  <span className="px-2 py-0.5 rounded-full bg-kili-card text-kili-muted text-xs font-medium mt-1 inline-block">Customer</span>
                </div>
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm((f) => ({ ...f, fullName: e.target.value }))}
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+254712345678"
                      className="input-dark"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-primary py-2 px-4 text-sm">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={() => { setEditMode(false); setSaveMsg(''); }} className="btn-secondary py-2 px-4 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', value: profile.fullName },
                    { label: 'Email', value: profile.email },
                    { label: 'Phone', value: profile.phone || 'Not set' },
                    { label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 bg-kili-elevated rounded-xl">
                      <p className="text-xs text-kili-muted mb-1">{label}</p>
                      <p className="text-sm text-kili-fg font-medium">{value}</p>
                    </div>
                  ))}
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
