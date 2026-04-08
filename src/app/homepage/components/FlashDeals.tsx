'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { FLASH_DEALS, formatPrice } from '@/lib/sampleData';
import { StarRating } from './ProductCard';

const FlashDeals: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 47, s: 23 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="py-10 px-4 sm:px-6 relative">
      {/* Background atmospheric effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,107,43,0.03) 0%, transparent 100%)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🔥</span>
                <p className="section-label">Limited Time</p>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-kili-fg">
                Flash Deals
              </h2>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-2 ml-4" aria-label={`Time remaining: ${pad(timeLeft.h)} hours ${pad(timeLeft.m)} minutes ${pad(timeLeft.s)} seconds`}>
              <div className="countdown-block">
                <div className="text-xl font-bold text-primary font-display" aria-hidden="true">{pad(timeLeft.h)}</div>
                <div className="text-xs text-kili-subtle" aria-hidden="true">HRS</div>
              </div>
              <span className="text-primary font-bold text-xl" aria-hidden="true">:</span>
              <div className="countdown-block">
                <div className="text-xl font-bold text-primary font-display" aria-hidden="true">{pad(timeLeft.m)}</div>
                <div className="text-xs text-kili-subtle" aria-hidden="true">MIN</div>
              </div>
              <span className="text-primary font-bold text-xl" aria-hidden="true">:</span>
              <div className="countdown-block">
                <div className="text-xl font-bold text-primary font-display" aria-hidden="true">{pad(timeLeft.s)}</div>
                <div className="text-xs text-kili-subtle" aria-hidden="true">SEC</div>
              </div>
            </div>
          </div>

          <Link
            href="/product-listing?filter=deals"
            className="flex items-center gap-1.5 text-sm text-primary font-medium hover:gap-2.5 transition-all self-start sm:self-auto"
          >
            All Deals
            <Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>

        {/* Deal cards - horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible scroll-snap-x"
          style={{ scrollbarWidth: 'none' }}>
          {FLASH_DEALS.map((product, idx) => (
            <Link
              key={product.id}
              href="/product-detail"
              className="group shrink-0 w-64 md:w-auto scroll-snap-item card-dark rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 flex flex-col"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-kili-elevated">
                <AppImage
                  src={product.image}
                  alt={`${product.name} flash deal product on dark background, well-lit product photography`}
                  fill
                  sizes="(max-width: 768px) 256px, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-kili-card/60 via-transparent to-transparent pointer-events-none" aria-hidden="true" />

                {/* Discount badge */}
                <div className="absolute top-2 left-2">
                  <span className="badge-deal">-{product.discount}%</span>
                </div>

                {/* Stock indicator */}
                {product.stock < 50 && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="h-1 bg-kili-bg/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                        style={{ width: `${Math.min((product.stock / 100) * 100, 90)}%` }}
                        role="progressbar"
                        aria-valuenow={product.stock}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${product.stock} items left`}
                      />
                    </div>
                    <p className="text-xs text-kili-muted mt-1">{product.stock} left in stock</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-xs text-kili-subtle uppercase tracking-wide mb-1">{product.brand}</p>
                <h3 className="text-sm font-medium text-kili-fg leading-snug line-clamp-2 mb-2 flex-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  <StarRating rating={product.rating} />
                  <span className="text-xs text-kili-subtle">({product.reviewCount})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="price-current text-base">{formatPrice(product.price)}</div>
                    {product.originalPrice && (
                      <div className="price-original text-xs">{formatPrice(product.originalPrice)}</div>
                    )}
                  </div>
                  <button
                    className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all"
                    aria-label={`Add ${product.name} to cart`}
                    onClick={(e) => e.preventDefault()}
                  >
                    <Icon name="ShoppingCartIcon" size={16} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlashDeals;