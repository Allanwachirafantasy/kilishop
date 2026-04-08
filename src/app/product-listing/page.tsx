'use client';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterSidebar from './components/FilterSidebar';
import ProductCard from '@/app/homepage/components/ProductCard';
import Icon from '@/components/ui/AppIcon';
import { getProducts, type Product, type ProductFilters } from '@/lib/supabase/services';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';

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
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const ITEMS_PER_PAGE = 12;

function ProductListingContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const filterParam = searchParams.get('filter');
      const categoryParam = searchParams.get('category');

      const queryFilters: ProductFilters = {
        search: searchQuery || undefined,
        minPrice: filters.priceMin > 0 ? filters.priceMin : undefined,
        maxPrice: filters.priceMax < 100000 ? filters.priceMax : undefined,
        minRating: filters.rating > 0 ? filters.rating : undefined,
        inStock: filters.availability.includes('In Stock') || undefined,
        isOnSale: filterParam === 'deals' || filters.availability.includes('On Sale') || undefined,
        isFeatured: filterParam === 'featured' || undefined,
        isTrending: filterParam === 'trending' || undefined,
        isNew: filterParam === 'new' || filters.availability.includes('New Arrivals') || undefined,
        brands: filters.brands.length > 0 ? filters.brands : undefined,
        categorySlug: categoryParam || (filters.categories.length === 1 ? filters.categories[0] : undefined),
        sortBy: sort,
        page,
        limit: ITEMS_PER_PAGE,
      };

      const { products: data, total: count } = await getProducts(queryFilters);
      setProducts(data);
      setTotal(count);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, sort, page, searchQuery, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

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
      <Header />
      <main className="flex-1">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-semibold text-kili-fg">All Products</h1>
              <p className="text-sm text-kili-muted mt-1">{total.toLocaleString()} products found</p>
            </div>
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
            <div className="hidden md:block">
              <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <button
                  className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-kili-border bg-kili-elevated text-sm text-kili-fg hover:border-primary transition-colors"
                  onClick={() => setFilterDrawerOpen(true)}
                  aria-label="Open filters"
                >
                  <Icon name="FunnelIcon" size={16} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">{activeFilterCount}</span>
                  )}
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <label htmlFor="sort-select" className="text-sm text-kili-muted hidden sm:block">Sort:</label>
                  <select
                    id="sort-select"
                    value={sort}
                    onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
                    className="input-dark text-sm py-2 w-auto pr-8"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-kili-elevated">{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center border border-kili-border rounded-lg overflow-hidden">
                  <button className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-kili-elevated text-kili-muted hover:text-kili-fg'}`} onClick={() => setViewMode('grid')} aria-label="Grid view">
                    <Icon name="Squares2X2Icon" size={16} />
                  </button>
                  <button className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-kili-elevated text-kili-muted hover:text-kili-fg'}`} onClick={() => setViewMode('list')} aria-label="List view">
                    <Icon name="Bars3Icon" size={16} />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                    <div key={i} className="bg-kili-card border border-kili-border rounded-xl aspect-[3/4] animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <Icon name="MagnifyingGlassIcon" size={48} className="text-kili-subtle mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-kili-fg mb-2">No products found</h3>
                  <p className="text-kili-muted mb-6">Try adjusting your filters or search terms</p>
                  <button onClick={() => { setFilters({ categories: [], priceMin: 0, priceMax: 100000, rating: 0, availability: [], brands: [] }); setSearchQuery(''); }} className="btn-secondary">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4' : 'flex flex-col gap-3'}>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-kili-border bg-kili-elevated text-kili-muted hover:text-kili-fg disabled:opacity-40 transition-colors">
                        <Icon name="ChevronLeftIcon" size={16} />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === pageNum ? 'bg-primary text-white' : 'border border-kili-border bg-kili-elevated text-kili-muted hover:text-kili-fg'}`}>
                            {pageNum}
                          </button>
                        );
                      })}
                      <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-kili-border bg-kili-elevated text-kili-muted hover:text-kili-fg disabled:opacity-40 transition-colors">
                        <Icon name="ChevronRightIcon" size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setFilterDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-kili-card border-l border-kili-border overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-kili-fg">Filters</h3>
              <button onClick={() => setFilterDrawerOpen(false)} className="p-2 rounded-lg hover:bg-kili-elevated text-kili-muted">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <FilterSidebar filters={filters} onFilterChange={(f) => { handleFilterChange(f); setFilterDrawerOpen(false); }} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-kili-bg">
        <div className="flex-1 flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    }>
      <ProductListingContent />
    </Suspense>
  );
}