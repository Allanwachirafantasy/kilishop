'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

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

  // Redirect if already logged in
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
        setSuccessMsg('Account created! Welcome to KiliShop.');
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
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong. Please try again.';
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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <AppImage
          src="https://images.unsplash.com/photo-1551562641-9998f16c6bff"
          alt="Shopping bags, electronics and fashion items arranged on a dark surface with warm orange studio lighting"
          fill
          priority
          className="object-cover" />
        
        <div className="absolute inset-0 bg-gradient-to-r from-kili-bg/80 via-kili-bg/50 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-kili-bg/60 via-transparent to-transparent" aria-hidden="true" />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <Link href="/homepage" className="flex items-center gap-2">
            <AppLogo size={36} />
            <span className="font-display font-semibold text-xl text-white">KiliShop</span>
          </Link>
          <div className="space-y-4 pb-8">
            <h1 className="font-display text-4xl font-semibold text-white leading-tight">
              Africa&apos;s Premier<br />
              <span className="gradient-text">Online Marketplace</span>
            </h1>
            <p className="text-white/70 text-base max-w-xs leading-relaxed">
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
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">Demo Accounts</p>
              <div className="text-xs text-white/70 space-y-1">
                <p>🛡️ <span className="text-primary font-medium">Admin:</span> admin@kilishop.com / Admin@123</p>
                <p>🛒 <span className="text-primary font-medium">Customer:</span> customer@kilishop.com / Customer@123</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: auth form */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-8">
        <Link href="/homepage" className="flex items-center gap-2 mb-8 lg:hidden">
          <AppLogo size={32} />
          <span className="font-display font-semibold text-lg text-kili-fg">KiliShop</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Mode tabs */}
          <div className="flex border-b border-kili-border mb-6">
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
          <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3" role="alert">
              <Icon name="CheckCircleIcon" size={18} className="text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-green-400">{successMsg}</p>
            </div>
          }

          {/* Error message */}
          {errorMsg &&
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3" role="alert">
              <Icon name="ExclamationCircleIcon" size={18} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{errorMsg}</p>
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
                  <label htmlFor="forgot-email" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                    Email Address
                  </label>
                  <input
                  id="forgot-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className={`input-dark ${errors.email ? 'border-red-500' : ''}`}
                  autoComplete="email" />
                
                  {errors.email && <p className="text-xs text-red-400 mt-1" role="alert">{errors.email}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3">
                  {isLoading ?
                <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Sending...
                    </span> :
                'Send Reset Link'}
                </button>
                <button
                type="button"
                onClick={() => {setMode('login');setSuccessMsg('');setErrorMsg('');setErrors({});}}
                className="w-full text-sm text-kili-muted hover:text-primary transition-colors flex items-center justify-center gap-1">
                
                  <Icon name="ArrowLeftIcon" size={14} />
                  Back to Sign In
                </button>
              </form>
            </div> :

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {mode === 'register' &&
            <>
                  <div>
                    <label htmlFor="fullName" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                      Full Name *
                    </label>
                    <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Kwame Mensah"
                  className={`input-dark ${errors.fullName ? 'border-red-500' : ''}`}
                  autoComplete="name" />
                
                    {errors.fullName && <p className="text-xs text-red-400 mt-1" role="alert">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label htmlFor="reg-phone" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                      Phone Number *
                    </label>
                    <input
                  id="reg-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="0712 345 678"
                  className={`input-dark ${errors.phone ? 'border-red-500' : ''}`}
                  autoComplete="tel" />
                
                    {errors.phone && <p className="text-xs text-red-400 mt-1" role="alert">{errors.phone}</p>}
                  </div>
                </>
            }

              <div>
                <label htmlFor="auth-email" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                  Email Address *
                </label>
                <input
                id="auth-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your@email.com"
                className={`input-dark ${errors.email ? 'border-red-500' : ''}`}
                autoComplete="email" />
              
                {errors.email && <p className="text-xs text-red-400 mt-1" role="alert">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="auth-password" className="text-xs font-medium text-kili-muted uppercase tracking-wide">
                    Password *
                  </label>
                  {mode === 'login' &&
                <button
                  type="button"
                  onClick={() => {setMode('forgot');setSuccessMsg('');setErrorMsg('');setErrors({});}}
                  className="text-xs text-primary hover:text-primary-light transition-colors">
                  
                      Forgot password?
                    </button>
                }
                </div>
                <div className="relative">
                  <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={mode === 'register' ? 'Min. 6 characters' : 'Your password'}
                  className={`input-dark pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                
                  <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kili-subtle hover:text-kili-muted transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  
                    <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1" role="alert">{errors.password}</p>}
              </div>

              {mode === 'register' &&
            <>
                  <div>
                    <label htmlFor="confirm-password" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                    className={`input-dark pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    autoComplete="new-password" />
                  
                      <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-kili-subtle hover:text-kili-muted transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                    
                        <Icon name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-400 mt-1" role="alert">{errors.confirmPassword}</p>}
                  </div>
                  <div>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                    className="checkbox-custom mt-0.5 shrink-0" />
                  
                      <span className="text-sm text-kili-muted leading-relaxed">
                        I agree to the{' '}
                        <Link href="/homepage" className="text-primary hover:text-primary-light transition-colors">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/homepage" className="text-primary hover:text-primary-light transition-colors">Privacy Policy</Link>
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-xs text-red-400 mt-1" role="alert">{errors.agreeTerms}</p>}
                  </div>
                </>
            }

              <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3 text-base mt-2">
              
                {isLoading ?
              <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span> :
              mode === 'login' ?
              <>
                    <Icon name="ArrowRightOnRectangleIcon" size={18} />
                    Sign In
                  </> :

              <>
                    <Icon name="UserPlusIcon" size={18} />
                    Create Account
                  </>
              }
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-kili-border" aria-hidden="true" />
                <span className="text-xs text-kili-subtle">or continue with</span>
                <div className="flex-1 h-px bg-kili-border" aria-hidden="true" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="btn-secondary py-2.5 justify-center text-sm" aria-label="Sign in with Google (coming soon)">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button type="button" className="btn-secondary py-2.5 justify-center text-sm" aria-label="Sign in with Facebook (coming soon)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
              </div>
            </form>
          }
        </div>

        <p className="mt-6 text-sm text-kili-muted text-center">
          {mode === 'login' ?
          <>
              Don&apos;t have an account?{' '}
              <button
              onClick={() => {setMode('register');setSuccessMsg('');setErrorMsg('');setErrors({});}}
              className="text-primary font-medium hover:text-primary-light transition-colors">
              
                Sign up free
              </button>
            </> :
          mode === 'register' ?
          <>
              Already have an account?{' '}
              <button
              onClick={() => {setMode('login');setSuccessMsg('');setErrorMsg('');setErrors({});}}
              className="text-primary font-medium hover:text-primary-light transition-colors">
              
                Sign in
              </button>
            </> :
          null}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-kili-bg">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}