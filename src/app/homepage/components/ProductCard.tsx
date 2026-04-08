'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { Product, formatPrice } from '@/lib/sampleData';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
}

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'sm' }) => {
  const starSize = size === 'sm' ? 12 : 14;
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={starSize}
          height={starSize}
          viewBox="0 0 20 20"
          fill={star <= Math.floor(rating) ? '#FFB800' : star - 0.5 <= rating ? 'url(#half)' : '#2A2A35'}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#FFB800" />
              <stop offset="50%" stopColor="#2A2A35" />
            </linearGradient>
          </defs>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onWishlist }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setWishlisted(!wishlisted);
    onWishlist?.(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setAddedToCart(true);
    onAddToCart?.(product);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <article className="product-card group relative flex flex-col h-full">
      {/* Image container */}
      <div className="relative overflow-hidden rounded-t-lg aspect-[4/3] bg-kili-elevated">
        <Link href="/product-detail" tabIndex={-1} aria-hidden="true">
          <AppImage
            src={product.image}
            alt={`${product.name} — ${product.category} product on dark background`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-image object-cover"
          />
        </Link>

        {/* Scrim for badges */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" aria-hidden="true" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.discount && product.discount > 0 && (
            <span className="badge-deal">{product.discount}% OFF</span>
          )}
          {product.isNew && !product.discount && (
            <span className="badge-new">NEW</span>
          )}
          {product.badge && !product.discount && !product.isNew && (
            <span className="badge-deal">{product.badge}</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          className={`wishlist-btn absolute top-2 right-2 ${wishlisted ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wishlisted}
        >
          <Icon
            name={wishlisted ? 'HeartIcon' : 'HeartIcon'}
            variant={wishlisted ? 'solid' : 'outline'}
            size={14}
          />
        </button>

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-kili-bg/70 flex items-center justify-center">
            <span className="text-kili-muted text-sm font-medium">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        {/* Category */}
        <p className="text-xs text-kili-subtle uppercase tracking-wide mb-1">{product.category}</p>

        {/* Name */}
        <Link href="/product-detail" className="flex-1">
          <h3 className="text-sm sm:text-base font-medium text-kili-fg leading-snug hover:text-primary transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-kili-subtle">({product.reviewCount.toLocaleString()})</span>
          {product.sold > 1000 && (
            <span className="text-xs text-kili-subtle ml-auto">{(product.sold / 1000).toFixed(1)}k sold</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="price-original">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
            addedToCart
              ? 'bg-green-600 text-white'
              : product.stock === 0
              ? 'bg-kili-elevated text-kili-subtle cursor-not-allowed' :'bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-white hover:border-primary'
          }`}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          aria-label={addedToCart ? 'Added to cart' : `Add ${product.name} to cart`}
        >
          {addedToCart ? (
            <>
              <Icon name="CheckIcon" size={14} />
              Added!
            </>
          ) : product.stock === 0 ? (
            'Out of Stock'
          ) : (
            <>
              <Icon name="ShoppingCartIcon" size={14} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export { StarRating };
export default ProductCard;