'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { getCartCount } from '@/lib/supabase/services';

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const { user, profile, isAdmin, signOut, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (user) {
      getCartCount(user.id).then(setCartCount).catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [user]);

  const navLinks = [
    { label: 'Shop', href: '/product-listing' },
    { label: 'Deals', href: '/product-listing?filter=deals' },
    { label: 'Categories', href: '/product-listing' },
    { label: 'New Arrivals', href: '/product-listing?filter=new' },
  ];

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-primary text-white text-center py-2 text-xs font-medium tracking-wide hidden sm:block">
        🚚 Free delivery on orders over KSh 2,000 &nbsp;|&nbsp; 📦 Same-day delivery in Nairobi
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled || !transparent
            ? 'bg-white/95 backdrop-blur-md border-b border-black/8 shadow-sm'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-16">
            {/* Logo */}
            <Link href="/homepage" className="flex items-center gap-2.5 shrink-0">
              <AppLogo size={34} />
              <span className="font-display font-bold text-xl text-kili-fg hidden xs:block tracking-tight">
                Alluvemall
              </span>
            </Link>

            {/* Search bar - desktop */}
            <div className="flex-1 max-w-xl hidden md:block mx-4">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                />
                <button
                  className="px-4 py-2.5 bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors shrink-0"
                  aria-label="Search"
                >
                  <Icon name="MagnifyingGlassIcon" size={18} />
                </button>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Mobile search toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Toggle search"
              >
                <Icon name="MagnifyingGlassIcon" size={20} />
              </button>

              {/* Wishlist */}
              <Link
                href="/homepage"
                className="p-2 rounded-lg text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors hidden sm:flex items-center justify-center"
                aria-label="Wishlist"
              >
                <Icon name="HeartIcon" size={20} />
              </Link>

              {/* Account — auth-aware */}
              {!loading && user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors"
                    aria-label="Account menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {profile?.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <Icon name="ChevronDownIcon" size={14} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-black/8 rounded-xl shadow-lg overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-black/8 bg-kili-bg">
                        <p className="text-sm font-semibold text-kili-fg truncate">{profile?.fullName || 'User'}</p>
                        <p className="text-xs text-kili-muted truncate">{user.email}</p>
                      </div>
                      {isAdmin ? (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Icon name="Cog6ToothIcon" size={16} />
                          Admin Panel
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Icon name="UserCircleIcon" size={16} />
                            My Account
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Icon name="TruckIcon" size={16} />
                            Track Orders
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => { setUserMenuOpen(false); signOut(); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Icon name="ArrowRightOnRectangleIcon" size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 rounded-lg text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors hidden sm:flex items-center justify-center"
                  aria-label="Account"
                >
                  <Icon name="UserCircleIcon" size={20} />
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-lg text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors flex items-center justify-center"
                aria-label={`Cart with ${cartCount} items`}
              >
                <Icon name="ShoppingCartIcon" size={20} />
                {cartCount > 0 && (
                  <span className="notif-badge">{cartCount}</span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors ml-1"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <Icon name="Bars3Icon" size={22} />
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {searchOpen && (
            <div className="md:hidden pb-3 animate-fade-in">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  aria-label="Search products"
                />
                <button
                  className="px-4 py-2.5 bg-primary text-white text-sm shrink-0"
                  aria-label="Search"
                >
                  <Icon name="MagnifyingGlassIcon" size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Category nav - desktop */}
          <nav className="hidden md:flex items-center gap-6 pb-2 text-sm font-medium text-kili-muted overflow-x-auto border-t border-black/5 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-kili-fg whitespace-nowrap transition-colors pb-1 border-b-2 border-transparent hover:border-primary"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/product-listing?filter=trending"
              className="text-primary font-semibold whitespace-nowrap hover:text-primary-dark transition-colors"
            >
              🔥 Flash Deals
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col animate-slide-right">
            <div className="flex items-center justify-between p-4 border-b border-black/8">
              <div className="flex items-center gap-2">
                <AppLogo size={28} />
                <span className="font-display font-bold text-kili-fg">Alluvemall</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-kili-muted hover:bg-kili-elevated transition-colors"
                aria-label="Close menu"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/product-listing?filter=trending"
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-primary font-semibold hover:bg-primary/5 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                🔥 Flash Deals
              </Link>
            </nav>
            <div className="p-4 border-t border-black/8 space-y-2">
              {user ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-kili-muted hover:bg-kili-elevated transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="UserCircleIcon" size={16} />My Account
                  </Link>
                  <button onClick={() => { setMobileMenuOpen(false); signOut(); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <Icon name="ArrowRightOnRectangleIcon" size={16} />Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn-primary w-full justify-center" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;