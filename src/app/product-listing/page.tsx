'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterSidebar from './components/FilterSidebar';
import ProductCard from '@/app/homepage/components/ProductCard';
import Icon from '@/components/ui/AppIcon';
import { PRODUCTS } from '@/lib/sampleData';

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular';

interface FilterState {
  categories: string[];
  priceMin: number;
  priceMax: number;
  rating: number;
  availability: string[];
  brands: string[];
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const ITEMS_PER_PAGE = 8;

export default function ProductListingPage() {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceMin: 0,
    priceMax: 100000,
    rating: 0,
    availability: [],
    brands: [],
  });
  const [sort, setSort] = useState<SortOption>('relevance');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter + sort products
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false)
      );
    }

    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    result = result.filter(
      (p) => p.price >= filters.priceMin && p.price <= filters.priceMax
    );

    if (filters.rating > 0) {
      result = result.filter((p) => p.rating >= filters.rating);
    }

    if (filters.brands.length > 0) {
      result = result.filter((p) => p.brand && filters.brands.includes(p.brand));
    }

    if (filters.availability.includes('In Stock')) {
      result = result.filter((p) => p.stock > 0);
    }
    if (filters.availability.includes('On Sale')) {
      result = result.filter((p) => p.isOnSale);
    }
    if (filters.availability.includes('New Arrivals')) {
      result = result.filter((p) => p.isNew);
    }
    if (filters.availability.includes('Featured')) {
      result = result.filter((p) => p.isFeatured);
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        result.sort((a, b) => b.sold - a.sold);
        break;
      case 'newest':
        result = result.filter((p) => p.isNew).concat(result.filter((p) => !p.isNew));
        break;
      default:
        break;
    }

    return result;
  }, [filters, sort, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    filters.availability.length +
    (filters.rating > 0 ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < 100000 ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-kili-bg">
      <Header cartCount={3} />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-kili-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-kili-subtle">
              <Link href="/homepage" className="hover:text-primary transition-colors">Home</Link>
              <Icon name="ChevronRightIcon" size={14} />
              <span className="text-kili-fg">All Products</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-semibold text-kili-fg">
                All Products
              </h1>
              <p className="text-sm text-kili-muted mt-1">
                {filteredProducts.length.toLocaleString()} products found
              </p>
            </div>

            {/* Search bar on listing page */}
            <div className="search-bar max-w-xs w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                aria-label="Search products"
              />
              <button className="px-3 py-2 text-kili-muted" aria-label="Search">
                <Icon name="MagnifyingGlassIcon" size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Sidebar - desktop */}
            <div className="hidden md:block">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                {/* Mobile filter button */}
                <button
                  className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-kili-border bg-kili-elevated text-sm text-kili-fg hover:border-primary transition-colors"
                  onClick={() => setFilterDrawerOpen(true)}
                  aria-label="Open filters"
                >
                  <Icon name="FunnelIcon" size={16} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="flex items-center gap-2 ml-auto">
                  <label htmlFor="sort-select" className="text-sm text-kili-muted hidden sm:block">Sort:</label>
                  <select
                    id="sort-select"
                    value={sort}
                    onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
                    className="input-dark text-sm py-2 w-auto pr-8"
                    style={{ backgroundImage: 'none' }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-kili-elevated">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View toggle */}
                <div className="flex items-center border border-kili-border rounded-lg overflow-hidden">
                  <button
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-kili-elevated text-kili-muted hover:text-kili-fg'}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    aria-pressed={viewMode === 'grid'}
                  >
                    <Icon name="Squares2X2Icon" size={16} />
                  </button>
                  <button
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-kili-elevated text-kili-muted hover:text-kili-fg'}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                  >
                    <Icon name="Bars3Icon" size={16} />
                  </button>
                </div>
              </div>

              {/* Active filters */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                    >
                      {cat}
                      <button
                        onClick={() => handleFilterChange({ ...filters, categories: filters.categories.filter((c) => c !== cat) })}
                        aria-label={`Remove ${cat} filter`}
                      >
                        <Icon name="XMarkIcon" size={12} />
                      </button>
                    </span>
                  ))}
                  {filters.brands.map((brand) => (
                    <span
                      key={brand}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                    >
                      {brand}
                      <button
                        onClick={() => handleFilterChange({ ...filters, brands: filters.brands.filter((b) => b !== brand) })}
                        aria-label={`Remove ${brand} filter`}
                      >
                        <Icon name="XMarkIcon" size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Products grid / list */}
              {paginatedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-5xl mb-4">🔍</div>
                  <h2 className="text-xl font-display font-semibold text-kili-fg mb-2">
                    No products found
                  </h2>
                  <p className="text-kili-muted mb-6 max-w-sm">
                    Try adjusting your filters or search term to find what you are looking for.
                  </p>
                  <button
                    onClick={() => {
                      setFilters({ categories: [], priceMin: 0, priceMax: 100000, rating: 0, availability: [], brands: [] });
                      setSearchQuery('');
                    }}
                    className="btn-primary"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {paginatedProducts.map((product) => (
                    <Link
                      key={product.id}
                      href="/product-detail"
                      className="card-dark rounded-xl p-4 flex gap-4 hover:border-primary/30 transition-all group"
                    >
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-kili-elevated shrink-0">
                        <img
                          src={product.image}
                          alt={`${product.name} product image`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-kili-subtle uppercase tracking-wide mb-1">{product.category}</p>
                        <h3 className="text-sm sm:text-base font-medium text-kili-fg group-hover:text-primary transition-colors line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} width="12" height="12" viewBox="0 0 20 20" fill={s <= Math.floor(product.rating) ? '#FFB800' : '#2A2A35'} aria-hidden="true">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-xs text-kili-subtle ml-1">({product.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="price-current">{product.price.toLocaleString('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 })}</span>
                          {product.originalPrice && (
                            <span className="price-original">{product.originalPrice.toLocaleString('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 })}</span>
                          )}
                          {product.discount && (
                            <span className="badge-deal">{product.discount}% OFF</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center gap-2 shrink-0">
                        <button
                          className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all"
                          aria-label={`Add ${product.name} to cart`}
                          onClick={(e) => e.preventDefault()}
                        >
                          <Icon name="ShoppingCartIcon" size={18} />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-kili-elevated text-kili-muted border border-kili-border hover:text-red-400 hover:border-red-400/30 transition-all"
                          aria-label={`Add ${product.name} to wishlist`}
                          onClick={(e) => e.preventDefault()}
                        >
                          <Icon name="HeartIcon" size={18} />
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8" role="navigation" aria-label="Pagination">
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <Icon name="ChevronLeftIcon" size={14} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                      if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                        acc.push('...');
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="text-kili-subtle px-1">...</span>
                      ) : (
                        <button
                          key={p}
                          className={`page-btn ${page === p ? 'active' : ''}`}
                          onClick={() => setPage(p as number)}
                          aria-label={`Page ${p}`}
                          aria-current={page === p ? 'page' : undefined}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    <Icon name="ChevronRightIcon" size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="drawer-overlay"
            onClick={() => setFilterDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-kili-card border-r border-kili-border overflow-y-auto animate-fade-in p-4">
            <FilterSidebar
              filters={filters}
              onFilterChange={(f) => { handleFilterChange(f); }}
              onClose={() => setFilterDrawerOpen(false)}
              isMobile
            />
            <div className="mt-4 pb-4">
              <button
                className="btn-primary w-full justify-center"
                onClick={() => setFilterDrawerOpen(false)}
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}