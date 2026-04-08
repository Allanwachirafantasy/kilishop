'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

export default function AdminUsersPage() {
  const { user, isAdmin, loading, signOut, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router?.replace('/login?redirect=/admin/users');
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

  const users = [
    { id: 1, name: 'Amara Osei', email: 'amara@example.com', phone: '+254712345678', role: 'customer', orders: 12, joined: 'Jan 2026', status: 'Active' },
    { id: 2, name: 'Fatima Diallo', email: 'fatima@example.com', phone: '+254723456789', role: 'customer', orders: 5, joined: 'Feb 2026', status: 'Active' },
    { id: 3, name: 'Kwame Mensah', email: 'kwame@example.com', phone: '+254734567890', role: 'customer', orders: 8, joined: 'Mar 2026', status: 'Active' },
    { id: 4, name: 'Nkechi Adeyemi', email: 'nkechi@example.com', phone: '+254745678901', role: 'customer', orders: 3, joined: 'Mar 2026', status: 'Inactive' },
    { id: 5, name: 'KiliShop Admin', email: 'admin@kilishop.com', phone: '+254700000001', role: 'admin', orders: 0, joined: 'Jan 2026', status: 'Active' },
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
            <span className="text-sm font-medium text-primary">Users</span>
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
          <h1 className="text-2xl font-display font-semibold text-kili-fg">User Management</h1>
          <p className="text-kili-muted text-sm mt-1">Manage customer and admin accounts</p>
        </div>

        <div className="bg-kili-card border border-kili-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-kili-border">
            <div className="relative">
              <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kili-muted" />
              <input type="text" placeholder="Search users..." className="input-dark pl-9 py-2 text-sm" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-kili-border">
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">User</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Phone</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Orders</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Joined</th>
                  <th className="text-left px-4 py-3 text-kili-muted font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u?.id} className="border-b border-kili-border last:border-0 hover:bg-kili-elevated transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary text-xs font-bold">{u?.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-kili-fg">{u?.name}</p>
                          <p className="text-xs text-kili-muted">{u?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-kili-muted">{u?.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u?.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-kili-elevated text-kili-muted'
                      }`}>
                        {u?.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-kili-fg">{u?.orders}</td>
                    <td className="px-4 py-3 text-kili-muted">{u?.joined}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u?.status === 'Active' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                      }`}>
                        {u?.status}
                      </span>
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
