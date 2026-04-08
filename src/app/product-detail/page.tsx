'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import ProductCard from '@/app/homepage/components/ProductCard';
import { StarRating } from '@/app/homepage/components/ProductCard';
import { PRODUCTS, REVIEWS, formatPrice } from '@/lib/sampleData';

const product = PRODUCTS[0]; // Samsung Galaxy A54 as default detail product
const relatedProducts = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
const productReviews = REVIEWS.filter((r) => r.productId === product.id);

const RatingBreakdown: React.FC<{ rating: number; count: number; total: number }> = ({ rating, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-kili-muted w-6 text-right">{rating}</span>
      <svg width="12" height="12" viewBox="0 0 20 20" fill="#FFB800" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="flex-1 h-1.5 bg-kili-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${rating} star rating: ${Math.round(pct)}%`}
        />
      </div>
      <span className="text-xs text-kili-subtle w-8">{count}</span>
    </div>
  );
};

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  const images = product.images ?? [product.image];

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const ratingBreakdown = [
    { rating: 5, count: Math.round(product.reviewCount * 0.55) },
    { rating: 4, count: Math.round(product.reviewCount * 0.25) },
    { rating: 3, count: Math.round(product.reviewCount * 0.12) },
    { rating: 2, count: Math.round(product.reviewCount * 0.05) },
    { rating: 1, count: Math.round(product.reviewCount * 0.03) },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-kili-bg">
      <Header cartCount={3} />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-kili-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-kili-subtle flex-wrap">
              <Link href="/homepage" className="hover:text-primary transition-colors">Home</Link>
              <Icon name="ChevronRightIcon" size={14} />
              <Link href="/product-listing" className="hover:text-primary transition-colors capitalize">
                {product.category}
              </Link>
              <Icon name="ChevronRightIcon" size={14} />
              <span className="text-kili-fg line-clamp-1">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Main product section */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Image gallery */}
            <div className="space-y-3">
              {/* Main image */}
              <div className="relative rounded-xl overflow-hidden border border-kili-border bg-kili-elevated aspect-[4/3]">
                <AppImage
                  src={images[selectedImage]}
                  alt={`${product.name} — main product image showing device from front angle on dark background`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.discount && (
                    <span className="badge-deal">{product.discount}% OFF</span>
                  )}
                  {product.isNew && (
                    <span className="badge-new">NEW</span>
                  )}
                </div>
                {/* Wishlist */}
                <button
                  className={`wishlist-btn absolute top-3 right-3 w-10 h-10 ${wishlisted ? 'active' : ''}`}
                  onClick={() => setWishlisted(!wishlisted)}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-pressed={wishlisted}
                >
                  <Icon name="HeartIcon" variant={wishlisted ? 'solid' : 'outline'} size={18} />
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Product image thumbnails">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      role="listitem"
                      onClick={() => setSelectedImage(idx)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? 'border-primary' :'border-kili-border hover:border-kili-muted'
                      }`}
                      aria-label={`View image ${idx + 1}`}
                      aria-pressed={selectedImage === idx}
                    >
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="space-y-5">
              {/* Brand + title */}
              <div>
                <p className="text-sm text-primary font-medium mb-1">{product.brand}</p>
                <h1 className="text-xl sm:text-2xl font-display font-semibold text-kili-fg leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Rating row */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={product.rating} size="md" />
                  <span className="text-sm font-semibold text-kili-fg">{product.rating}</span>
                </div>
                <span className="text-sm text-kili-subtle">
                  ({product.reviewCount.toLocaleString()} reviews)
                </span>
                <span className="text-sm text-kili-subtle">
                  {product.sold.toLocaleString()} sold
                </span>
                <span
                  className={`status-badge ${product.stock > 0 ? 'status-delivered' : 'status-pending'}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    aria-hidden="true"
                  />
                  {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                </span>
              </div>

              <div className="divider" />

              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-kili-subtle line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                {product.discount && (
                  <p className="text-sm text-green-400 font-medium">
                    You save {formatPrice(product.originalPrice! - product.price)} ({product.discount}% off)
                  </p>
                )}
              </div>

              <div className="divider" />

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-kili-fg">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span
                    className="w-10 text-center text-sm font-semibold text-kili-fg"
                    aria-live="polite"
                    aria-label={`Quantity: ${quantity}`}
                  >
                    {quantity}
                  </span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-kili-subtle">Max {product.stock}</span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col xs:flex-row gap-3">
                <button
                  className={`btn-primary flex-1 justify-center py-3 ${addedToCart ? 'bg-green-600' : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  aria-label={addedToCart ? 'Added to cart' : 'Add to cart'}
                >
                  {addedToCart ? (
                    <>
                      <Icon name="CheckIcon" size={18} />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <Icon name="ShoppingCartIcon" size={18} />
                      Add to Cart
                    </>
                  )}
                </button>
                <Link
                  href="/checkout"
                  className="btn-secondary flex-1 justify-center py-3"
                >
                  Buy Now
                </Link>
              </div>

              {/* Delivery info */}
              <div className="rounded-xl border border-kili-border bg-kili-elevated p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="TruckIcon" size={18} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-kili-fg">Free Delivery</p>
                    <p className="text-xs text-kili-muted">Orders over KSh 2,000 qualify for free delivery. Est. 1-3 days.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="ArrowPathIcon" size={18} className="text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-kili-fg">7-Day Returns</p>
                    <p className="text-xs text-kili-muted">Return or exchange within 7 days of delivery. No questions asked.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="ShieldCheckIcon" size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-kili-fg">Genuine Product</p>
                    <p className="text-xs text-kili-muted">100% authentic. All products verified before dispatch.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Description / Specs / Reviews */}
          <div className="mb-12">
            <div className="flex border-b border-kili-border overflow-x-auto" role="tablist" aria-label="Product information tabs">
              {(['description', 'specs', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`tab-btn capitalize ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'reviews' ? `Reviews (${product.reviewCount})` : tab}
                </button>
              ))}
            </div>

            <div className="mt-6" role="tabpanel">
              {activeTab === 'description' && (
                <div className="max-w-3xl">
                  <p className="text-kili-muted leading-relaxed text-sm sm:text-base">
                    {product.description}
                  </p>
                  {product.tags && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-kili-elevated border border-kili-border text-xs text-kili-muted"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specs' && product.specs && (
                <div className="max-w-2xl">
                  <div className="rounded-xl border border-kili-border overflow-hidden">
                    {Object.entries(product.specs).map(([key, value], idx) => (
                      <div
                        key={key}
                        className={`flex gap-4 px-4 py-3 text-sm ${idx % 2 === 0 ? 'bg-kili-card' : 'bg-kili-elevated'}`}
                      >
                        <span className="font-medium text-kili-muted w-36 shrink-0">{key}</span>
                        <span className="text-kili-fg">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="max-w-3xl space-y-6">
                  {/* Rating summary */}
                  <div className="grid sm:grid-cols-2 gap-6 p-5 rounded-xl bg-kili-elevated border border-kili-border">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-5xl font-bold text-kili-fg mb-1">{product.rating}</div>
                      <StarRating rating={product.rating} size="md" />
                      <p className="text-sm text-kili-muted mt-1">
                        Based on {product.reviewCount.toLocaleString()} reviews
                      </p>
                    </div>
                    <div className="space-y-2">
                      {ratingBreakdown.map((rb) => (
                        <RatingBreakdown
                          key={rb.rating}
                          rating={rb.rating}
                          count={rb.count}
                          total={product.reviewCount}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review list */}
                  <div className="space-y-4">
                    {productReviews.length > 0 ? (
                      productReviews.map((review) => (
                        <div key={review.id} className="p-4 rounded-xl bg-kili-card border border-kili-border">
                          <div className="flex items-start gap-3 mb-3">
                            <img
                              src={review.avatar}
                              alt={`${review.userName} profile photo`}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-kili-fg">{review.userName}</span>
                                <span className="text-xs text-kili-subtle">
                                  {new Date(review.date).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <StarRating rating={review.rating} />
                            </div>
                          </div>
                          <p className="text-sm text-kili-muted leading-relaxed">{review.comment}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <button className="flex items-center gap-1 text-xs text-kili-subtle hover:text-primary transition-colors">
                              <Icon name="HandThumbUpIcon" size={14} />
                              Helpful ({review.helpful})
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-kili-muted">
                        <p>No reviews yet. Be the first to review this product!</p>
                      </div>
                    )}
                  </div>

                  {/* Write review CTA */}
                  <div className="p-4 rounded-xl border border-dashed border-kili-border text-center">
                    <p className="text-sm text-kili-muted mb-3">Share your experience with this product</p>
                    <Link href="/login" className="btn-secondary text-sm py-2 px-5">
                      Write a Review
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-display font-semibold text-kili-fg">Related Products</h2>
                <Link href="/product-listing" className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-1">
                  View all
                  <Icon name="ArrowRightIcon" size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}