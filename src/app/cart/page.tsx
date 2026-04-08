'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import {
  getCartItems, updateCartQuantity, removeFromCart,
  formatPrice, type CartItem
} from '@/lib/supabase/services';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await getCartItems(user.id);
      setCartItems(items);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/cart');
      return;
    }
    if (user) fetchCart();
  }, [user, authLoading, fetchCart, router]);

  const handleUpdateQuantity = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (item.product && newQty > item.product.stock) return;
    setUpdatingId(item.id);
    try {
      await updateCartQuantity(item.id, newQty);
      setCartItems((prev) => prev.map((ci) => ci.id === item.id ? { ...ci, quantity: newQty } : ci));
    } catch {
      // revert
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdatingId(itemId);
    try {
      await removeFromCart(itemId);
      setCartItems((prev) => prev.filter((ci) => ci.id !== itemId));
    } finally {
      setUpdatingId(null);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const originalTotal = cartItems.reduce((sum, item) => sum + ((item.product?.originalPrice || item.product?.price || 0)) * item.quantity, 0);
  const savings = originalTotal - subtotal;
  const shipping = subtotal >= 2000 ? 0 : 350;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'KILI10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try KILI10 for 10% off.');
      setCouponApplied(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-kili-bg">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-kili-bg">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-sm">
            <div className="text-7xl mb-6">🛒</div>
            <h1 className="text-2xl font-display font-semibold text-kili-fg mb-3">Your cart is empty</h1>
            <p className="text-kili-muted mb-8 leading-relaxed">Looks like you haven&apos;t added anything yet. Start shopping to fill it up!</p>
            <Link href="/product-listing" className="btn-primary">
              <Icon name="ShoppingBagIcon" size={18} />
              Start Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-kili-bg">
      <Header />
      <main className="flex-1">
        <div className="border-b border-kili-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-kili-subtle">
              <Link href="/homepage" className="hover:text-primary transition-colors">Home</Link>
              <Icon name="ChevronRightIcon" size={14} />
              <span className="text-kili-fg">Shopping Cart</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-display font-semibold text-kili-fg mb-6">
            Shopping Cart
            <span className="text-kili-muted font-normal text-base ml-2">({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
          </h1>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => (
                <article key={item.id} className="card-dark rounded-xl p-4 flex gap-4 transition-all">
                  <Link href={`/product-detail?id=${item.productId}`} className="shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-kili-elevated">
                      <AppImage
                        src={item.product?.imageUrl || ''}
                        alt={`${item.product?.name || 'Product'} thumbnail`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-kili-subtle uppercase tracking-wide mb-0.5">{item.product?.brand}</p>
                    <Link href={`/product-detail?id=${item.productId}`}>
                      <h2 className="text-sm sm:text-base font-medium text-kili-fg hover:text-primary transition-colors line-clamp-2 mb-2">
                        {item.product?.name}
                      </h2>
                    </Link>

                    {/* Stock warning */}
                    {item.product && item.product.stock <= 5 && item.product.stock > 0 && (
                      <p className="text-xs text-yellow-400 mb-1">Only {item.product.stock} left in stock!</p>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="price-current">{formatPrice(item.product?.price || 0)}</span>
                        {item.product?.originalPrice && (
                          <span className="price-original">{formatPrice(item.product.originalPrice)}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className="qty-btn"
                          onClick={() => handleUpdateQuantity(item, -1)}
                          disabled={item.quantity <= 1 || updatingId === item.id}
                          aria-label={`Decrease quantity of ${item.product?.name}`}
                        >−</button>
                        <span className="w-8 text-center text-sm font-semibold text-kili-fg">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => handleUpdateQuantity(item, 1)}
                          disabled={!item.product || item.quantity >= item.product.stock || updatingId === item.id}
                          aria-label={`Increase quantity of ${item.product?.name}`}
                        >+</button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-kili-muted">
                        Total: <span className="text-kili-fg font-semibold">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                      </span>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={updatingId === item.id}
                        className="flex items-center gap-1 text-xs text-kili-subtle hover:text-red-400 transition-colors"
                        aria-label={`Remove ${item.product?.name} from cart`}
                      >
                        <Icon name="TrashIcon" size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              <Link href="/product-listing" className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors py-2">
                <Icon name="ArrowLeftIcon" size={16} />
                Continue Shopping
              </Link>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="card-dark rounded-xl p-5 sticky top-24 space-y-4">
                <h2 className="text-base font-semibold text-kili-fg">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-kili-muted">
                    <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="text-kili-fg">{formatPrice(subtotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Savings</span>
                      <span>-{formatPrice(savings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-kili-muted">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-400' : 'text-kili-fg'}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-green-400">
                      <span>Coupon (KILI10)</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                {/* Coupon */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="input-dark text-sm py-2 flex-1"
                    />
                    <button onClick={applyCoupon} className="btn-secondary py-2 px-3 text-sm shrink-0">Apply</button>
                  </div>
                  {couponError && <p className="text-xs text-red-400">{couponError}</p>}
                  {couponApplied && <p className="text-xs text-green-400">✓ Coupon applied!</p>}
                </div>

                <div className="divider" />
                <div className="flex justify-between font-semibold text-kili-fg">
                  <span>Total</span>
                  <span className="text-primary text-lg">{formatPrice(total)}</span>
                </div>

                <Link href="/checkout" className="btn-primary w-full justify-center py-3">
                  <Icon name="LockClosedIcon" size={16} />
                  Proceed to Checkout
                </Link>

                <div className="flex items-center justify-center gap-2 text-xs text-kili-subtle">
                  <Icon name="ShieldCheckIcon" size={14} />
                  Secure checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}