'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import ProductCard from './ProductCard';
import { getFeaturedProducts, type Product } from '@/lib/supabase/services';

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts(8)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
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

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-kili-card border border-kili-border rounded-xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-kili-muted">
            <Icon name="CubeIcon" size={40} className="mx-auto mb-3 opacity-40" />
            <p>No featured products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
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