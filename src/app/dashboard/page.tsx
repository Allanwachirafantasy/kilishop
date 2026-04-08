'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CustomerDashboardPage() {
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile'>('overview');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

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

  const orders = [
    { id: '#KS-1042', date: 'Apr 8, 2026', items: 2, amount: 'KSh 4,500', status: 'Delivered' },
    { id: '#KS-1038', date: 'Mar 22, 2026', items: 1, amount: 'KSh 12,800', status: 'Delivered' },
    { id: '#KS-1031', date: 'Mar 10, 2026', items: 3, amount: 'KSh 8,200', status: 'Delivered' },
  ];

  const statusColors: Record<string, string> = {
    Delivered: 'bg-green-400/10 text-green-400',
    Processing: 'bg-yellow-400/10 text-yellow-400',
    Shipped: 'bg-blue-400/10 text-blue-400',
    Pending: 'bg-orange-400/10 text-orange-400',
    Cancelled: 'bg-red-400/10 text-red-400',
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'HomeIcon' },
    { id: 'orders', label: 'My Orders', icon: 'ShoppingBagIcon' },
    { id: 'profile', label: 'Profile', icon: 'UserCircleIcon' },
  ] as const;

  return (
    <div className="min-h-screen bg-kili-bg flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold text-kili-fg">
              My Account
            </h1>
            <p className="text-kili-muted text-sm mt-1">
              Welcome back, <span className="text-kili-fg font-medium">{profile.fullName}</span>
            </p>
          </div>
          <button
            onClick={signOut}
            className="btn-secondary py-2 px-3 text-sm text-red-400 hover:text-red-300"
          >
            <Icon name="ArrowRightOnRectangleIcon" size={16} />
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-kili-border gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-kili-muted hover:text-kili-fg'
              }`}
            >
              <Icon name={tab.icon as any} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Orders', value: orders.length.toString(), icon: 'ShoppingBagIcon', color: 'text-blue-400' },
                { label: 'Total Spent', value: 'KSh 25,500', icon: 'BanknotesIcon', color: 'text-green-400' },
                { label: 'Wishlist Items', value: '7', icon: 'HeartIcon', color: 'text-red-400' },
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

            {/* Recent Orders */}
            <div className="bg-kili-card border border-kili-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-kili-fg">Recent Orders</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-sm text-primary hover:text-primary-light transition-colors"
                >
                  View all →
                </button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 2).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-kili-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-kili-fg">{order.id}</p>
                      <p className="text-xs text-kili-muted">{order.date} · {order.items} item{order.items > 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-kili-fg">{order.amount}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Continue Shopping', href: '/product-listing', icon: 'ShoppingCartIcon' },
                { label: 'View Cart', href: '/cart', icon: 'ShoppingBagIcon' },
                { label: 'Checkout', href: '/checkout', icon: 'CreditCardIcon' },
                { label: 'Edit Profile', action: () => { setActiveTab('profile'); setEditMode(true); }, icon: 'PencilSquareIcon' },
              ].map((item) => (
                item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="bg-kili-card border border-kili-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/40 hover:bg-kili-elevated transition-all text-center"
                  >
                    <Icon name={item.icon as any} size={20} className="text-primary" />
                    <span className="text-xs font-medium text-kili-muted">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="bg-kili-card border border-kili-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/40 hover:bg-kili-elevated transition-all text-center"
                  >
                    <Icon name={item.icon as any} size={20} className="text-primary" />
                    <span className="text-xs font-medium text-kili-muted">{item.label}</span>
                  </button>
                )
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-kili-card border border-kili-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-kili-border">
              <h2 className="font-display font-semibold text-kili-fg">Order History</h2>
            </div>
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <Icon name="ShoppingBagIcon" size={40} className="text-kili-subtle mx-auto mb-3" />
                <p className="text-kili-muted">No orders yet</p>
                <Link href="/product-listing" className="btn-primary mt-4 inline-flex">Start Shopping</Link>
              </div>
            ) : (
              <div className="divide-y divide-kili-border">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-kili-elevated transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-kili-elevated flex items-center justify-center">
                        <Icon name="ShoppingBagIcon" size={18} className="text-kili-muted" />
                      </div>
                      <div>
                        <p className="font-medium text-kili-fg">{order.id}</p>
                        <p className="text-xs text-kili-muted">{order.date} · {order.items} item{order.items > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-kili-fg">{order.amount}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </div>
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
                <button
                  onClick={() => setEditMode(true)}
                  className="btn-secondary py-1.5 px-3 text-sm"
                >
                  <Icon name="PencilSquareIcon" size={15} />
                  Edit
                </button>
              )}
            </div>

            {saveMsg && (
              <div className={`p-3 rounded-xl text-sm ${saveMsg.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {saveMsg}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-2xl font-bold">{profile.fullName.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold text-kili-fg">{profile.fullName}</p>
                <p className="text-sm text-kili-muted">{profile.email}</p>
                <span className="px-2 py-0.5 rounded-full bg-kili-elevated text-kili-muted text-xs font-medium mt-1 inline-block">
                  {profile.role}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                  Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="input-dark"
                  />
                ) : (
                  <p className="text-kili-fg py-2">{profile.fullName}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                  Email Address
                </label>
                <p className="text-kili-fg py-2">{profile.email}</p>
                <p className="text-xs text-kili-subtle">Email cannot be changed here</p>
              </div>
              <div>
                <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                  Phone Number
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    className="input-dark"
                    placeholder="0712 345 678"
                  />
                ) : (
                  <p className="text-kili-fg py-2">{profile.phone || '—'}</p>
                )}
              </div>
            </div>

            {editMode && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary py-2 px-5"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
                <button
                  onClick={() => { setEditMode(false); setSaveMsg(''); setProfileForm({ fullName: profile.fullName, phone: profile.phone }); }}
                  className="btn-secondary py-2 px-5"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
