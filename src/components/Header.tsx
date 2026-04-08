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

  // Fetch real cart count
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
            ? 'bg-kili-card/95 backdrop-blur-md border-b border-kili-border shadow-card'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-16">
            {/* Logo */}
            <Link href="/homepage" className="flex items-center gap-2 shrink-0">
              <AppLogo size={32} />
              <span className="font-display font-semibold text-lg text-kili-fg hidden xs:block">
                KiliShop
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
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">
                        {profile?.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <Icon name="ChevronDownIcon" size={14} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-kili-card border border-kili-border rounded-xl shadow-card overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-kili-border">
                        <p className="text-sm font-medium text-kili-fg truncate">{profile?.fullName || 'User'}</p>
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
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-kili-elevated transition-colors"
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
          <nav className="hidden md:flex items-center gap-6 pb-2 text-sm font-medium text-kili-muted overflow-x-auto">
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
              className="text-primary font-semibold whitespace-nowrap hover:text-primary-light transition-colors"
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-kili-card border-l border-kili-border animate-slide-right overflow-y-auto">
            {/* Mobile menu header */}
            <div className="flex items-center justify-between p-4 border-b border-kili-border">
              <div className="flex items-center gap-2">
                <AppLogo size={28} />
                <span className="font-display font-semibold text-kili-fg">KiliShop</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors"
                aria-label="Close menu"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            {/* User section */}
            <div className="p-4 border-b border-kili-border">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">{profile?.fullName?.charAt(0) || 'U'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-kili-fg">{profile?.fullName}</p>
                      <p className="text-xs text-kili-muted">{user.email}</p>
                    </div>
                  </div>
                  {isAdmin ? (
                    <Link href="/admin" className="btn-primary w-full justify-center text-sm" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Cog6ToothIcon" size={16} />
                      Admin Panel
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="btn-primary w-full justify-center text-sm" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="UserCircleIcon" size={16} />
                      My Account
                    </Link>
                  )}
                  <button
                    onClick={() => { setMobileMenuOpen(false); signOut(); }}
                    className="btn-secondary w-full justify-center text-sm text-red-400"
                  >
                    <Icon name="ArrowRightOnRectangleIcon" size={16} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="btn-primary w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name="UserCircleIcon" size={18} />
                  Sign In / Register
                </Link>
              )}
            </div>

            {/* Nav links */}
            <nav className="p-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/product-listing?filter=deals"
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-primary hover:bg-primary-100 transition-colors text-sm font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                🔥 Flash Deals
              </Link>
            </nav>

            {/* Categories */}
            <div className="p-4 border-t border-kili-border">
              <p className="section-label mb-3">Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Grocery'].map((cat) => (
                  <Link
                    key={cat}
                    href="/product-listing"
                    className="px-3 py-2 rounded-lg bg-kili-elevated text-kili-muted hover:text-kili-fg text-sm text-center transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom links */}
            <div className="p-4 border-t border-kili-border flex flex-col gap-2">
              <Link
                href="/cart"
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="ShoppingCartIcon" size={18} />
                Cart ({cartCount})
              </Link>
              <Link
                href="/homepage"
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-kili-muted hover:text-kili-fg hover:bg-kili-elevated transition-colors text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="HeartIcon" size={18} />
                Wishlist
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;