'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type AuthMode = 'login' | 'register' | 'forgot';

function LoginPageInner() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { signIn, signUp, resetPassword, user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        router.replace(redirectTo || '/admin');
      } else {
        router.replace(redirectTo || '/homepage');
      }
    }
  }, [user, loading, isAdmin, redirectTo, router]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    setErrorMsg('');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (mode !== 'forgot') {
      if (!form.password || form.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    if (mode === 'register') {
      if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!form.agreeTerms) {
        newErrors.agreeTerms = 'You must agree to the terms';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'forgot') {
        await resetPassword(form.email);
        setSuccessMsg(`Password reset link sent to ${form.email}. Check your inbox.`);
      } else if (mode === 'register') {
        await signUp(form.email, form.password, {
          fullName: form.fullName,
          phone: form.phone,
          role: 'customer'
        });
        setSuccessMsg('Account created! Welcome to Alluvemall.');
        setTimeout(() => router.replace('/homepage'), 1500);
      } else {
        const data = await signIn(form.email, form.password);
        const role =
        data?.user?.user_metadata?.role ||
        data?.user?.app_metadata?.role ||
        'customer';
        if (role === 'admin') {
          router.replace(redirectTo || '/admin');
        } else {
          router.replace(redirectTo || '/homepage');
        }
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Something went wrong. Please try again.';
      if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Invalid email or password. Please try again.');
      } else if (msg.includes('Email not confirmed')) {
        setErrorMsg('Please verify your email before signing in.');
      } else if (msg.includes('User already registered')) {
        setErrorMsg('An account with this email already exists. Please sign in.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kili-bg">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>);

  }

  return (
    <div className="min-h-screen flex bg-kili-bg">
      {/* Left panel: hero image (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-kili-fg">
        <AppImage
          src="https://images.unsplash.com/photo-1643808889858-c2cab804e912"
          alt="Shopping bags, electronics and fashion items arranged with warm orange studio lighting"
          fill
          priority
          className="object-cover opacity-60" />
        
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/30" aria-hidden="true" />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <Link href="/homepage" className="flex items-center gap-2.5">
            <AppLogo size={38} />
            <span className="font-display font-bold text-2xl text-white tracking-tight">Alluvemall</span>
          </Link>
          <div className="space-y-5 pb-8">
            <h1 className="font-display text-4xl font-bold text-white leading-tight">
              Africa&apos;s Premier<br />
              <span className="gradient-text">Online Marketplace</span>
            </h1>
            <p className="text-white/75 text-base max-w-xs leading-relaxed">
              Join 2 million+ shoppers getting the best deals on electronics, fashion, home goods, and more.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              {[
              { icon: '🚚', text: 'Free delivery on orders over KSh 2,000' },
              { icon: '🔒', text: '100% secure payments & data protection' },
              { icon: '↩️', text: '7-day easy returns on all products' }].
              map((item) =>
              <div key={item.text} className="flex items-center gap-3 text-sm text-white/80">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              )}
            </div>
            {/* Demo credentials */}
            <div className="mt-4 p-4 rounded-xl bg-white/10 border border-white/15 space-y-2">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">Demo Accounts</p>
              <div className="text-xs text-white/75 space-y-1">
                <p>🛡️ <span className="text-primary font-semibold">Admin:</span> admin@kilishop.com / Admin@123</p>
                <p>🛒 <span className="text-primary font-semibold">Customer:</span> customer@kilishop.com / Customer@123</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: auth form */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-8 bg-white">
        <Link href="/homepage" className="flex items-center gap-2.5 mb-8 lg:hidden">
          <AppLogo size={32} />
          <span className="font-display font-bold text-xl text-kili-fg">Alluvemall</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Mode tabs */}
          <div className="flex border-b border-black/8 mb-6">
            <button
              className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {setMode('login');setSuccessMsg('');setErrorMsg('');setErrors({});}}>
              
              Sign In
            </button>
            <button
              className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {setMode('register');setSuccessMsg('');setErrorMsg('');setErrors({});}}>
              
              Create Account
            </button>
          </div>

          {/* Success message */}
          {successMsg &&
          <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3" role="alert">
              <Icon name="CheckCircleIcon" size={18} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{successMsg}</p>
            </div>
          }

          {/* Error message */}
          {errorMsg &&
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3" role="alert">
              <Icon name="ExclamationCircleIcon" size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{errorMsg}</p>
            </div>
          }

          {mode === 'forgot' ?
          <div className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon name="KeyIcon" size={24} className="text-primary" />
                </div>
                <h2 className="text-xl font-display font-semibold text-kili-fg">Reset Password</h2>
                <p className="text-sm text-kili-muted mt-1">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="text-xs font-semibold text-kili-muted uppercase tracking-wide block mb-1.5">
                    Email Address
                  </label>
                  <input
                  id="forgot-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className={`input-dark ${errors.email ? 'border-red-400' : ''}`}
                  autoComplete="email" />
                
                  {errors.email && <p className="text-xs text-red-500 mt-1" role="alert">{errors.email}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3">
                  {isLoading ?
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :

                'Send Reset Link'
                }
                </button>
                <button
                type="button"
                onClick={() => {setMode('login');setErrors({});setErrorMsg('');}}
                className="w-full text-sm text-kili-muted hover:text-primary transition-colors text-center">
                
                  ← Back to Sign In
                </button>
              </form>
            </div> :
          mode === 'login' ?
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="login-email" className="text-xs font-semibold text-kili-muted uppercase tracking-wide block mb-1.5">
                  Email Address
                </label>
                <input
                id="login-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your@email.com"
                className={`input-dark ${errors.email ? 'border-red-400' : ''}`}
                autoComplete="email" />
              
                {errors.email && <p className="text-xs text-red-500 mt-1" role="alert">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="login-password" className="text-xs font-semibold text-kili-muted uppercase tracking-wide block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={`input-dark pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  autoComplete="current-password" />
                
                  <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kili-subtle hover:text-kili-muted transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  
                    <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1" role="alert">{errors.password}</p>}
              </div>
              <div className="flex justify-end">
                <button
                type="button"
                onClick={() => {setMode('forgot');setErrors({});setErrorMsg('');}}
                className="text-xs text-primary hover:text-primary-dark transition-colors font-medium">
                
                  Forgot password?
                </button>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3">
                {isLoading ?
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :

              'Sign In'
              }
              </button>
              <p className="text-center text-sm text-kili-muted">
                Don&apos;t have an account?{' '}
                <button
                type="button"
                onClick={() => {setMode('register');setErrors({});setErrorMsg('');}}
                className="text-primary font-semibold hover:text-primary-dark transition-colors">
                
                  Create one
                </button>
              </p>
            </form> :

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="reg-name" className="text-xs font-semibold text-kili-muted uppercase tracking-wide block mb-1.5">
                  Full Name
                </label>
                <input
                id="reg-name"
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="John Doe"
                className={`input-dark ${errors.fullName ? 'border-red-400' : ''}`}
                autoComplete="name" />
              
                {errors.fullName && <p className="text-xs text-red-500 mt-1" role="alert">{errors.fullName}</p>}
              </div>
              <div>
                <label htmlFor="reg-email" className="text-xs font-semibold text-kili-muted uppercase tracking-wide block mb-1.5">
                  Email Address
                </label>
                <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your@email.com"
                className={`input-dark ${errors.email ? 'border-red-400' : ''}`}
                autoComplete="email" />
              
                {errors.email && <p className="text-xs text-red-500 mt-1" role="alert">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="reg-phone" className="text-xs font-semibold text-kili-muted uppercase tracking-wide block mb-1.5">
                  Phone Number
                </label>
                <input
                id="reg-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+254 700 000 000"
                className={`input-dark ${errors.phone ? 'border-red-400' : ''}`}
                autoComplete="tel" />
              
                {errors.phone && <p className="text-xs text-red-500 mt-1" role="alert">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="reg-password" className="text-xs font-semibold text-kili-muted uppercase tracking-wide block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className={`input-dark pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  autoComplete="new-password" />
                
                  <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kili-subtle hover:text-kili-muted transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  
                    <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1" role="alert">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="reg-confirm" className="text-xs font-semibold text-kili-muted uppercase tracking-wide block mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                  id="reg-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Repeat password"
                  className={`input-dark pr-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  autoComplete="new-password" />
                
                  <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kili-subtle hover:text-kili-muted transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                  
                    <Icon name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1" role="alert">{errors.confirmPassword}</p>}
              </div>
              <div className="flex items-start gap-2">
                <input
                id="reg-terms"
                type="checkbox"
                checked={form.agreeTerms}
                onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary" />
              
                <label htmlFor="reg-terms" className="text-sm text-kili-muted">
                  I agree to the{' '}
                  <Link href="/homepage" className="text-primary hover:text-primary-dark font-medium">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/homepage" className="text-primary hover:text-primary-dark font-medium">Privacy Policy</Link>
                </label>
              </div>
              {errors.agreeTerms && <p className="text-xs text-red-500" role="alert">{errors.agreeTerms}</p>}
              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3">
                {isLoading ?
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :

              'Create Account'
              }
              </button>
              <p className="text-center text-sm text-kili-muted">
                Already have an account?{' '}
                <button
                type="button"
                onClick={() => {setMode('login');setErrors({});setErrorMsg('');}}
                className="text-primary font-semibold hover:text-primary-dark transition-colors">
                
                  Sign in
                </button>
              </p>
            </form>
          }
        </div>
      </div>
    </div>);

}

export default function LoginPage() {
  return (
    <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center bg-kili-bg">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LoginPageInner />
    </Suspense>);

}