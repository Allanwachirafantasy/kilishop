'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { CATEGORIES } from '@/lib/sampleData';

const CategorySection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="section-label mb-1">Explore</p>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-kili-fg">
              Shop by Category
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-lg bg-kili-elevated border border-kili-border text-kili-muted hover:text-kili-fg hover:border-primary transition-colors"
              aria-label="Scroll left"
            >
              <Icon name="ChevronLeftIcon" size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-lg bg-kili-elevated border border-kili-border text-kili-muted hover:text-kili-fg hover:border-primary transition-colors"
              aria-label="Scroll right"
            >
              <Icon name="ChevronRightIcon" size={16} />
            </button>
          </div>
        </div>

        {/* Category chips - horizontal scroll */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scroll-snap-x hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          role="list"
          aria-label="Product categories"
        >
          {/* All categories chip */}
          <Link
            href="/product-listing"
            className="cat-chip active shrink-0 scroll-snap-item"
            role="listitem"
          >
            <span>🏪</span>
            All
          </Link>

          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/product-listing?category=${cat.id}`}
              className="cat-chip shrink-0 scroll-snap-item"
              role="listitem"
            >
              <span>{cat.icon}</span>
              {cat.name}
              <span className="text-xs text-kili-subtle ml-1">({cat.count.toLocaleString()})</span>
            </Link>
          ))}
        </div>

        {/* Category bento grid - desktop */}
        <div className="hidden md:grid grid-cols-4 gap-4 mt-8">
          {/* Large card: Electronics */}
          <div className="col-span-2 row-span-1">
            <Link
              href="/product-listing?category=electronics"
              className="group relative block rounded-xl overflow-hidden border border-kili-border h-48 bg-gradient-to-br from-blue-900/30 to-kili-elevated hover:border-blue-500/40 transition-all duration-300"
            >
              <div className="absolute inset-0 flex items-center justify-between p-6">
                <div>
                  <p className="text-4xl mb-2">📱</p>
                  <h3 className="font-display font-semibold text-xl text-kili-fg">Electronics</h3>
                  <p className="text-sm text-kili-muted mt-1">1,240 products</p>
                  <div className="mt-3 flex items-center gap-1 text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                    Shop now <Icon name="ArrowRightIcon" size={14} />
                  </div>
                </div>
                <div className="text-7xl opacity-20 group-hover:opacity-30 transition-opacity">📱</div>
              </div>
            </Link>
          </div>

          {/* Fashion */}
          <div className="col-span-1">
            <Link
              href="/product-listing?category=fashion"
              className="group relative block rounded-xl overflow-hidden border border-kili-border h-48 bg-gradient-to-br from-pink-900/30 to-kili-elevated hover:border-pink-500/40 transition-all duration-300"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <p className="text-3xl mb-2">👗</p>
                <h3 className="font-display font-semibold text-kili-fg">Fashion</h3>
                <p className="text-xs text-kili-muted mt-1">3,560 products</p>
                <div className="mt-2 text-pink-400 text-xs font-medium group-hover:underline">
                  Shop now
                </div>
              </div>
            </Link>
          </div>

          {/* Beauty */}
          <div className="col-span-1">
            <Link
              href="/product-listing?category=beauty"
              className="group relative block rounded-xl overflow-hidden border border-kili-border h-48 bg-gradient-to-br from-purple-900/30 to-kili-elevated hover:border-purple-500/40 transition-all duration-300"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <p className="text-3xl mb-2">💄</p>
                <h3 className="font-display font-semibold text-kili-fg">Beauty</h3>
                <p className="text-xs text-kili-muted mt-1">670 products</p>
                <div className="mt-2 text-purple-400 text-xs font-medium group-hover:underline">
                  Shop now
                </div>
              </div>
            </Link>
          </div>

          {/* Home & Living */}
          <div className="col-span-1">
            <Link
              href="/product-listing?category=home"
              className="group relative block rounded-xl overflow-hidden border border-kili-border h-36 bg-gradient-to-br from-amber-900/30 to-kili-elevated hover:border-amber-500/40 transition-all duration-300"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <p className="text-2xl mb-1">🏠</p>
                <h3 className="font-display font-semibold text-sm text-kili-fg">Home & Living</h3>
                <div className="mt-1 text-amber-400 text-xs font-medium group-hover:underline">
                  Shop now
                </div>
              </div>
            </Link>
          </div>

          {/* Sports */}
          <div className="col-span-1">
            <Link
              href="/product-listing?category=sports"
              className="group relative block rounded-xl overflow-hidden border border-kili-border h-36 bg-gradient-to-br from-green-900/30 to-kili-elevated hover:border-green-500/40 transition-all duration-300"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <p className="text-2xl mb-1">⚽</p>
                <h3 className="font-display font-semibold text-sm text-kili-fg">Sports</h3>
                <div className="mt-1 text-green-400 text-xs font-medium group-hover:underline">
                  Shop now
                </div>
              </div>
            </Link>
          </div>

          {/* Grocery - spans 2 cols */}
          <div className="col-span-2">
            <Link
              href="/product-listing?category=grocery"
              className="group relative block rounded-xl overflow-hidden border border-kili-border h-36 bg-gradient-to-br from-emerald-900/30 to-kili-elevated hover:border-emerald-500/40 transition-all duration-300"
            >
              <div className="absolute inset-0 flex items-center justify-between p-6">
                <div>
                  <p className="text-3xl mb-1">🛒</p>
                  <h3 className="font-display font-semibold text-kili-fg">Grocery & Food</h3>
                  <p className="text-xs text-kili-muted mt-0.5">1,100+ items</p>
                  <div className="mt-2 text-emerald-400 text-xs font-medium group-hover:underline flex items-center gap-1">
                    Order now <Icon name="ArrowRightIcon" size={12} />
                  </div>
                </div>
                <div className="text-5xl opacity-20">🛒</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;