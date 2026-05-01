'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import { getAllUsers, updateUserStatus } from '@/lib/supabase/services';

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user, isAdmin, loading, signOut, profile } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login?redirect=/admin/users');
      else if (!isAdmin) router.replace('/homepage');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) {
      getAllUsers()
        .then(setUsers)
        .finally(() => setDataLoading(false));
    }
  }, [isAdmin]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(userId);
    try {
      await updateUserStatus(userId, !currentStatus);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err: any) {
      alert(err?.message || 'Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) =>
    !searchQuery ||
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <span className="text-sm font-medium text-primary">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="btn-secondary py-1.5 px-3 text-sm"><Icon name="ArrowLeftIcon" size={15} />Dashboard</Link>
            <button onClick={signOut} className="btn-secondary py-1.5 px-3 text-sm text-red-400"><Icon name="ArrowRightOnRectangleIcon" size={15} />Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-kili-fg">User Management</h1>
          <p className="text-kili-muted text-sm mt-1">{users.length} registered users</p>
        </div>

        <div className="bg-kili-card border border-kili-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-kili-border">
            <div className="relative">
              <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kili-muted" />
              <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-dark pl-9 py-2 text-sm" />
            </div>
          </div>

          {dataLoading ? (
            <div className="p-8 flex justify-center"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-kili-muted">
              <Icon name="UsersIcon" size={40} className="mx-auto mb-3 opacity-40" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-kili-border">
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">User</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Phone</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Role</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Joined</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-kili-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-kili-border last:border-0 hover:bg-kili-elevated transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-primary text-xs font-bold">{u.fullName?.charAt(0) || 'U'}</span>
                          </div>
                          <div>
                            <p className="font-medium text-kili-fg">{u.fullName}</p>
                            <p className="text-xs text-kili-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-kili-muted">{u.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-kili-elevated text-kili-muted'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-kili-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleToggleStatus(u.id, u.isActive)}
                            disabled={updatingId === u.id}
                            className={`text-xs font-medium transition-colors ${u.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                          >
                            {updatingId === u.id ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
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
