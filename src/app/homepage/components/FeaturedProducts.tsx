'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import ProductCard from './ProductCard';
import { FEATURED_PRODUCTS } from '@/lib/sampleData';

const FeaturedProducts: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal-hidden').forEach((el) => {
              el.classList.add('revealed');
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="reveal-hidden">
            <p className="section-label mb-1">Handpicked</p>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-kili-fg">
              Featured Products
            </h2>
          </div>
          <Link
            href="/product-listing?filter=featured"
            className="flex items-center gap-1.5 text-sm text-primary font-medium hover:gap-2.5 transition-all"
          >
            View all
            <Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
          {FEATURED_PRODUCTS.map((product) => (
            <div key={product.id} className="reveal-hidden">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View more CTA */}
        <div className="mt-8 text-center reveal-hidden">
          <Link href="/product-listing" className="btn-secondary">
            Browse All Products
            <Icon name="ArrowRightIcon" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;