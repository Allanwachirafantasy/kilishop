'use client';
import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { getCategories, type Category } from '@/lib/supabase/services';

const CategorySection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  // Bento grid config for first 6 categories
  const bentoConfig = [
    { cols: 'col-span-2', height: 'h-48', gradient: 'from-blue-900/30', border: 'hover:border-blue-500/40', textColor: 'text-blue-400', large: true },
    { cols: 'col-span-1', height: 'h-48', gradient: 'from-pink-900/30', border: 'hover:border-pink-500/40', textColor: 'text-pink-400', large: false },
    { cols: 'col-span-1', height: 'h-48', gradient: 'from-purple-900/30', border: 'hover:border-purple-500/40', textColor: 'text-purple-400', large: false },
    { cols: 'col-span-1', height: 'h-36', gradient: 'from-amber-900/30', border: 'hover:border-amber-500/40', textColor: 'text-amber-400', large: false },
    { cols: 'col-span-1', height: 'h-36', gradient: 'from-green-900/30', border: 'hover:border-green-500/40', textColor: 'text-green-400', large: false },
    { cols: 'col-span-2', height: 'h-36', gradient: 'from-emerald-900/30', border: 'hover:border-emerald-500/40', textColor: 'text-emerald-400', large: true },
  ];

  return (
    <section className="py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="section-label mb-1">Explore</p>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-kili-fg">Shop by Category</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll('left')} className="p-2 rounded-lg bg-kili-elevated border border-kili-border text-kili-muted hover:text-kili-fg hover:border-primary transition-colors" aria-label="Scroll left">
              <Icon name="ChevronLeftIcon" size={16} />
            </button>
            <button onClick={() => scroll('right')} className="p-2 rounded-lg bg-kili-elevated border border-kili-border text-kili-muted hover:text-kili-fg hover:border-primary transition-colors" aria-label="Scroll right">
              <Icon name="ChevronRightIcon" size={16} />
            </button>
          </div>
        </div>

        {/* Category chips */}
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar" style={{ scrollbarWidth: 'none' }} role="list" aria-label="Product categories">
          <Link href="/product-listing" className="cat-chip active shrink-0" role="listitem">
            <span>🏪</span>All
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/product-listing?category=${cat.slug}`} className="cat-chip shrink-0" role="listitem">
              <span>{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Bento grid - desktop */}
        {categories.length > 0 && (
          <div className="hidden md:grid grid-cols-4 gap-4 mt-8">
            {categories.slice(0, 6).map((cat, idx) => {
              const config = bentoConfig[idx] || bentoConfig[0];
              return (
                <div key={cat.id} className={config.cols}>
                  <Link
                    href={`/product-listing?category=${cat.slug}`}
                    className={`group relative block rounded-xl overflow-hidden border border-kili-border ${config.height} bg-gradient-to-br ${config.gradient} to-kili-elevated ${config.border} transition-all duration-300`}
                  >
                    <div className={`absolute inset-0 flex ${config.large ? 'items-center justify-between p-6' : 'flex-col items-center justify-center p-4 text-center'}`}>
                      {config.large ? (
                        <>
                          <div>
                            <p className="text-4xl mb-2">{cat.icon}</p>
                            <h3 className="font-display font-semibold text-xl text-kili-fg">{cat.name}</h3>
                            <div className={`mt-3 flex items-center gap-1 ${config.textColor} text-sm font-medium group-hover:gap-2 transition-all`}>
                              Shop now <Icon name="ArrowRightIcon" size={14} />
                            </div>
                          </div>
                          <div className="text-7xl opacity-20 group-hover:opacity-30 transition-opacity">{cat.icon}</div>
                        </>
                      ) : (
                        <>
                          <p className="text-3xl mb-2">{cat.icon}</p>
                          <h3 className="font-display font-semibold text-kili-fg">{cat.name}</h3>
                          <div className={`mt-2 ${config.textColor} text-xs font-medium group-hover:underline`}>Shop now</div>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;