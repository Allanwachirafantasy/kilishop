import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-black/8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <AppLogo size={32} />
              <span className="font-display font-bold text-lg text-kili-fg tracking-tight">Alluvemall</span>
            </div>
            <p className="text-sm text-kili-muted leading-relaxed">
              Africa&apos;s premier online marketplace. Shop thousands of products at unbeatable prices.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a href="#" className="text-kili-subtle hover:text-primary transition-colors" aria-label="Instagram">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="text-kili-subtle hover:text-primary transition-colors" aria-label="Twitter / X">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-kili-subtle hover:text-primary transition-colors" aria-label="Facebook">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-kili-fg mb-3 text-sm uppercase tracking-wide">Shop</h4>
            <nav className="space-y-2">
              {[
                { label: 'All Products', href: '/product-listing' },
                { label: 'Flash Deals', href: '/product-listing?filter=deals' },
                { label: 'New Arrivals', href: '/product-listing?filter=new' },
                { label: 'Featured', href: '/product-listing?filter=featured' },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="block text-sm text-kili-muted hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-kili-fg mb-3 text-sm uppercase tracking-wide">Account</h4>
            <nav className="space-y-2">
              {[
                { label: 'Sign In', href: '/login' },
                { label: 'My Orders', href: '/orders' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Cart', href: '/cart' },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="block text-sm text-kili-muted hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-kili-fg mb-3 text-sm uppercase tracking-wide">Support</h4>
            <nav className="space-y-2">
              {[
                { label: 'Help Center', href: '/homepage' },
                { label: 'Track Order', href: '/orders' },
                { label: 'Returns', href: '/homepage' },
                { label: 'Contact Us', href: '/homepage' },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="block text-sm text-kili-muted hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-black/8">
          <span className="text-xs text-kili-subtle">© 2026 Alluvemall. All rights reserved.</span>
          <div className="flex items-center gap-4 text-xs text-kili-subtle">
            <Link href="/homepage" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/homepage" className="hover:text-primary transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link href="/homepage" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;