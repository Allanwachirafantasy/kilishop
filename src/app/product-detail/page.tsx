'use client';
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import Icon from '@/components/ui/AppIcon';
import ProductCard from '@/app/homepage/components/ProductCard';
import { StarRating } from '@/app/homepage/components/ProductCard';
import {
  getProductById, getRelatedProducts, getProductReviews, addToCart, addToWishlist,
  isInWishlist, addReview, formatPrice, getStockStatus,
  type Product, type Review
} from '@/lib/supabase/services';
import { getProductImages, type ProductImageRecord } from '@/lib/supabase/imageUpload';
import { useAuth } from '@/contexts/AuthContext';

const FALLBACK_IMAGE = '/assets/images/no_image.png';

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('id');
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImageRecord[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!productId) {
      router.replace('/product-listing');
      return;
    }
    setLoading(true);
    getProductById(productId).then(async (p) => {
      if (!p) { router.replace('/product-listing'); return; }
      setProduct(p);

      // Fetch product_images table
      const imgs = await getProductImages(productId);
      setProductImages(imgs);

      // Set initial selected image: cover first, then first gallery, then product.imageUrl, then fallback
      const cover = imgs.find((img) => img.isCover);
      const firstImg = imgs[0];
      const initial = cover?.imageUrl || firstImg?.imageUrl || p.imageUrl || FALLBACK_IMAGE;
      setSelectedImageUrl(initial);

      if (p.categoryId) {
        const [related, revs] = await Promise.all([
          getRelatedProducts(p.categoryId, p.id, 4),
          getProductReviews(p.id),
        ]);
        setRelatedProducts(related);
        setReviews(revs);
      }
      if (user) {
        const wId = await isInWishlist(user.id, p.id);
        setWishlistItemId(wId);
      }
    }).finally(() => setLoading(false));
  }, [productId, user, router]);

  // Build the full image list for gallery display
  const allImages: string[] = React.useMemo(() => {
    if (productImages.length > 0) {
      // Sort: cover first, then by sort_order
      const sorted = [...productImages].sort((a, b) => {
        if (a.isCover && !b.isCover) return -1;
        if (!a.isCover && b.isCover) return 1;
        return a.sortOrder - b.sortOrder;
      });
      return sorted.map((img) => img.imageUrl);
    }
    // Fallback to product.images array or product.imageUrl
    if (product?.images?.length) return product.images;
    if (product?.imageUrl) return [product.imageUrl];
    return [FALLBACK_IMAGE];
  }, [productImages, product]);

  const selectedIndex = allImages.indexOf(selectedImageUrl);
  const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const goNext = () => {
    const next = (currentIndex + 1) % allImages.length;
    setSelectedImageUrl(allImages[next]);
  };

  const goPrev = () => {
    const prev = (currentIndex - 1 + allImages.length) % allImages.length;
    setSelectedImageUrl(allImages[prev]);
  };

  const handleAddToCart = async () => {
    if (!user) { router.push('/login'); return; }
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(user.id, product.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err: any) {
      alert(err?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) { router.push('/login'); return; }
    if (!product) return;
    if (!wishlistItemId) {
      await addToWishlist(user.id, product.id);
      const wId = await isInWishlist(user.id, product.id);
      setWishlistItemId(wId);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) { router.push('/login'); return; }
    setSubmittingReview(true);
    try {
      await addReview(product.id, user.id, reviewForm.rating, reviewForm.comment);
      const revs = await getProductReviews(product.id);
      setReviews(revs);
      setReviewMsg('Review submitted successfully!');
      setReviewForm({ rating: 5, comment: '' });
    } catch {
      setReviewMsg('Failed to submit review. You may have already reviewed this product.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
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

  if (!product) return null;

  const stockStatus = getStockStatus(product.stock);
  const displayImage = selectedImageUrl || FALLBACK_IMAGE;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-kili-bg">
      <Header />
      <main className="flex-1">
        <div className="border-b border-kili-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-kili-subtle flex-wrap">
              <Link href="/homepage" className="hover:text-primary transition-colors">Home</Link>
              <Icon name="ChevronRightIcon" size={14} />
              <Link href={`/product-listing?category=${product.category?.slug || ''}`} className="hover:text-primary transition-colors capitalize">
                {product.category?.name || 'Products'}
              </Link>
              <Icon name="ChevronRightIcon" size={14} />
              <span className="text-kili-fg line-clamp-1">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Image gallery */}
            <div className="space-y-3">
              {/* Main image */}
              <div className="relative rounded-xl overflow-hidden border border-kili-border bg-kili-elevated aspect-[4/3]">
                <img
                  src={displayImage}
                  alt={`${product.name} — main product image`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.discount && product.discount > 0 && (
                    <span className="badge-deal">{product.discount}% OFF</span>
                  )}
                  {product.isNew && <span className="badge-new">NEW</span>}
                </div>
                <button
                  className={`wishlist-btn absolute top-3 right-3 w-10 h-10 ${wishlistItemId ? 'active' : ''}`}
                  onClick={handleWishlist}
                  aria-label={wishlistItemId ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Icon name="HeartIcon" variant={wishlistItemId ? 'solid' : 'outline'} size={18} />
                </button>
                {/* Zoom button */}
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-lg bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  aria-label="Zoom image"
                >
                  <Icon name="MagnifyingGlassPlusIcon" size={18} />
                </button>
                {/* Prev/Next arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                      aria-label="Previous image"
                    >
                      <Icon name="ChevronLeftIcon" size={18} />
                    </button>
                    <button
                      onClick={goNext}
                      className="absolute right-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                      aria-label="Next image"
                    >
                      <Icon name="ChevronRightIcon" size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageUrl(img)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImageUrl === img ? 'border-primary' : 'border-kili-border hover:border-kili-muted'}`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Image counter */}
              {allImages.length > 1 && (
                <p className="text-xs text-kili-subtle text-center">{currentIndex + 1} / {allImages.length}</p>
              )}
            </div>

            {/* Product info */}
            <div className="space-y-5">
              <div>
                <p className="text-sm text-primary font-medium mb-1">{product.brand}</p>
                <h1 className="text-xl sm:text-2xl font-display font-semibold text-kili-fg leading-snug">{product.name}</h1>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={product.rating} size="md" />
                  <span className="text-sm font-semibold text-kili-fg">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-kili-subtle">({product.reviewCount.toLocaleString()} reviews)</span>
                <span className="text-sm text-kili-subtle">{product.sold.toLocaleString()} sold</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                  {stockStatus.label}
                </span>
              </div>

              <div className="divider" />

              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-kili-subtle line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                {product.discount && product.originalPrice && (
                  <p className="text-sm text-green-600 font-medium">
                    You save {formatPrice(product.originalPrice - product.price)} ({product.discount}% off)
                  </p>
                )}
              </div>

              {product.colors?.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {product.colors.map((color: string) => (
                    <span
                      key={color}
                      className="px-3 py-1 rounded-full border text-sm bg-gray-100"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              )}

              <div className="divider" />

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-kili-fg">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">−</button>
                  <span className="w-10 text-center text-sm font-semibold text-kili-fg">{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock} aria-label="Increase quantity">+</button>
                </div>
                <span className="text-xs text-kili-subtle">Max {product.stock}</span>
              </div>

              <div className="flex flex-col xs:flex-row gap-3">
                <button
                  className={`btn-primary flex-1 justify-center py-3 ${addedToCart ? 'bg-green-600' : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                >
                  {addedToCart ? (
                    <><Icon name="CheckIcon" size={18} />Added to Cart!</>
                  ) : addingToCart ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Icon name="ShoppingCartIcon" size={18} />Add to Cart</>
                  )}
                </button>
                <Link href="/checkout" className="btn-secondary flex-1 justify-center py-3">Buy Now</Link>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: '🚚', text: 'Free delivery over KSh 2,000' },
                  { icon: '↩️', text: '7-day easy returns' },
                  { icon: '🔒', text: 'Secure payment' },
                ].map((item) => (
                  <div key={item.text} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-kili-elevated border border-kili-border text-center">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs text-kili-muted leading-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-kili-border gap-1 mb-6">
              {(['description', 'specs', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-kili-muted hover:text-kili-fg'}`}
                >
                  {tab === 'reviews' ? `Reviews (${reviews.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <p className="text-kili-muted leading-relaxed">{product.description}</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(product.specs || {}).map(([key, value]) => (
                  <div key={key} className="flex gap-3 p-3 rounded-xl bg-kili-elevated border border-kili-border">
                    <span className="text-sm font-medium text-kili-muted w-32 shrink-0">{key}</span>
                    <span className="text-sm text-kili-fg">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex gap-8 p-5 bg-kili-elevated border border-kili-border rounded-xl">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-kili-fg">{product.rating.toFixed(1)}</p>
                    <StarRating rating={product.rating} size="md" />
                    <p className="text-xs text-kili-muted mt-1">{product.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {ratingBreakdown.map(({ rating: r, count }) => (
                      <div key={r} className="flex items-center gap-2">
                        <span className="text-xs text-kili-muted w-4">{r}</span>
                        <div className="flex-1 h-1.5 bg-kili-card rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }} />
                        </div>
                        <span className="text-xs text-kili-subtle w-6">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {user && (
                  <form onSubmit={handleSubmitReview} className="p-5 bg-kili-elevated border border-kili-border rounded-xl space-y-4">
                    <h3 className="font-semibold text-kili-fg">Write a Review</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-kili-muted">Rating:</span>
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button key={r} type="button" onClick={() => setReviewForm((f) => ({ ...f, rating: r }))} className={`text-2xl ${r <= reviewForm.rating ? 'text-accent' : 'text-kili-border'}`}>★</button>
                      ))}
                    </div>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                      placeholder="Share your experience with this product..."
                      rows={3}
                      className="input-dark resize-none"
                    />
                    {reviewMsg && <p className={`text-sm ${reviewMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{reviewMsg}</p>}
                    <button type="submit" disabled={submittingReview} className="btn-primary py-2 px-4 text-sm">
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <p className="text-center text-kili-muted py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 bg-kili-elevated border border-kili-border rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary text-xs font-bold">{review.userProfile?.fullName?.charAt(0) || 'U'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-kili-fg">{review.userProfile?.fullName || 'Customer'}</p>
                            <p className="text-xs text-kili-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="ml-auto">
                            <StarRating rating={review.rating} />
                          </div>
                        </div>
                        <p className="text-sm text-kili-muted">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-display font-semibold text-kili-fg mb-4">Related Products</h2>
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

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <Icon name="XMarkIcon" size={22} />
          </button>
          {allImages.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="Previous image"
              >
                <Icon name="ChevronLeftIcon" size={22} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="Next image"
              >
                <Icon name="ChevronRightIcon" size={22} />
              </button>
            </>
          )}
          <img
            src={displayImage}
            alt={`${product.name} — zoomed view`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
          />
          {allImages.length > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {currentIndex + 1} / {allImages.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-kili-bg">
        <div className="flex-1 flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  );
}