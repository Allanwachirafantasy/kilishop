'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: any;
  session: any;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  getCurrentUser: () => Promise<any>;
  getUserProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) return null;
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        phone: data.phone || '',
        avatarUrl: data.avatar_url || '',
        role: data.role,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: Record<string, string> = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.fullName || '',
          phone: metadata.phone || '',
          avatar_url: metadata.avatarUrl || '',
          role: metadata.role || 'customer',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    router.push('/login');
    router.refresh();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');
    const dbUpdates: Record<string, any> = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

    const { error } = await supabase
      .from('user_profiles')
      .update(dbUpdates)
      .eq('id', user.id);
    if (error) throw error;
    const updated = await fetchProfile(user.id);
    setProfile(updated);
  };

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  };

  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    return fetchProfile(user.id);
  };

  const isAdmin = profile?.role === 'admin';
  const isCustomer = profile?.role === 'customer';

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isAdmin,
    isCustomer,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    getCurrentUser,
    getUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
