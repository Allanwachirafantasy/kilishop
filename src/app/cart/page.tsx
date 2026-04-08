'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { PRODUCTS, formatPrice } from '@/lib/sampleData';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  category: string;
  stock: number;
  brand?: string;
}

const initialCartItems: CartItem[] = [
  {
    id: 'ci1',
    productId: 'p1',
    name: 'Samsung Galaxy A54 5G Smartphone',
    image: PRODUCTS[0].image,
    price: 28999,
    originalPrice: 35999,
    quantity: 1,
    category: 'Electronics',
    stock: 45,
    brand: 'Samsung',
  },
  {
    id: 'ci2',
    productId: 'p2',
    name: 'Wireless Bluetooth Earbuds Pro',
    image: PRODUCTS[1].image,
    price: 3499,
    originalPrice: 5999,
    quantity: 2,
    category: 'Electronics',
    stock: 120,
    brand: 'TechSound',
  },
  {
    id: 'ci3',
    productId: 'p5',
    name: 'Vitamin C Brightening Face Serum',
    image: PRODUCTS[4].image,
    price: 1899,
    originalPrice: 2499,
    quantity: 1,
    category: 'Beauty',
    stock: 85,
    brand: 'GlowAfrica',
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(item.stock, item.quantity + delta)) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = cartItems.reduce((sum, item) => sum + (item.originalPrice ?? item.price) * item.quantity, 0);
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-kili-bg">
        <Header cartCount={0} />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-sm">
            <div className="text-7xl mb-6">🛒</div>
            <h1 className="text-2xl font-display font-semibold text-kili-fg mb-3">
              Your cart is empty
            </h1>
            <p className="text-kili-muted mb-8 leading-relaxed">
              Looks like you haven&apos;t added anything yet. Start shopping to fill it up!
            </p>
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
      <Header cartCount={cartItems.length} />

      <main className="flex-1">
        {/* Breadcrumb */}
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
            <span className="text-kili-muted font-normal text-base ml-2">
              ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </span>
          </h1>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => (
                <article
                  key={item.id}
                  className="card-dark rounded-xl p-4 flex gap-4 transition-all"
                >
                  {/* Image */}
                  <Link href="/product-detail" className="shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-kili-elevated">
                      <AppImage
                        src={item.image}
                        alt={`${item.name} product thumbnail`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-kili-subtle uppercase tracking-wide mb-0.5">{item.brand}</p>
                    <Link href="/product-detail">
                      <h2 className="text-sm sm:text-base font-medium text-kili-fg hover:text-primary transition-colors line-clamp-2 mb-2">
                        {item.name}
                      </h2>
                    </Link>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="price-current">{formatPrice(item.price)}</span>
                        {item.originalPrice && (
                          <span className="price-original">{formatPrice(item.originalPrice)}</span>
                        )}
                      </div>

                      {/* Quantity stepper */}
                      <div className="flex items-center gap-2">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span
                          className="w-8 text-center text-sm font-semibold text-kili-fg"
                          aria-live="polite"
                          aria-label={`${item.name} quantity: ${item.quantity}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Item total + remove */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-kili-muted">
                        Total: <span className="text-kili-fg font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1 text-xs text-kili-subtle hover:text-red-400 transition-colors"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Icon name="TrashIcon" size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {/* Continue shopping */}
              <Link
                href="/product-listing"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors py-2"
              >
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
                      <span>You save</span>
                      <span>−{formatPrice(savings)}</span>
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
                      <span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="divider" />

                {/* Coupon code */}
                <div className="space-y-2">
                  <label htmlFor="coupon-input" className="text-xs font-medium text-kili-muted uppercase tracking-wide">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="coupon-input"
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="input-dark text-sm py-2 flex-1"
                      aria-describedby={couponError ? 'coupon-error' : undefined}
                    />
                    <button
                      onClick={applyCoupon}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                        couponApplied
                          ? 'bg-green-600/20 text-green-400 border border-green-600/30' :'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white'
                      }`}
                      aria-label="Apply coupon code"
                    >
                      {couponApplied ? <Icon name="CheckIcon" size={16} /> : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p id="coupon-error" className="text-xs text-red-400" role="alert">{couponError}</p>
                  )}
                  {couponApplied && (
                    <p className="text-xs text-green-400" role="status">Coupon applied! 10% discount added.</p>
                  )}
                  {!couponApplied && !couponError && (
                    <p className="text-xs text-kili-subtle">Try code: KILI10</p>
                  )}
                </div>

                <div className="divider" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-kili-fg">Total</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                </div>

                {shipping === 0 && (
                  <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/5 border border-green-400/10 rounded-lg px-3 py-2">
                    <Icon name="TruckIcon" size={14} />
                    You qualify for free delivery!
                  </div>
                )}

                {shipping > 0 && (
                  <div className="flex items-center gap-2 text-xs text-kili-muted bg-kili-elevated border border-kili-border rounded-lg px-3 py-2">
                    <Icon name="TruckIcon" size={14} />
                    Add {formatPrice(2000 - subtotal)} more for free delivery
                  </div>
                )}

                <Link
                  href="/checkout"
                  className="btn-primary w-full justify-center py-3 text-base"
                >
                  Proceed to Checkout
                  <Icon name="ArrowRightIcon" size={18} />
                </Link>

                {/* Payment badges */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {['M-Pesa', 'Visa', 'Mastercard'].map((method) => (
                    <span
                      key={method}
                      className="px-2 py-1 rounded border border-kili-border text-xs text-kili-subtle bg-kili-elevated"
                    >
                      {method}
                    </span>
                  ))}
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