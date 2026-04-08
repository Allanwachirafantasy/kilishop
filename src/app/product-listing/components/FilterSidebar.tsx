'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { CATEGORIES } from '@/lib/sampleData';

interface FilterState {
  categories: string[];
  priceMin: number;
  priceMax: number;
  rating: number;
  availability: string[];
  brands: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const BRANDS = ['Samsung', 'Nike', 'Adidas', 'HP', 'TCL', 'KitchenPro', 'GlowAfrica', 'AfriStyle'];
const AVAILABILITY = ['In Stock', 'On Sale', 'New Arrivals', 'Featured'];

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onClose,
  isMobile = false,
}) => {
  const [priceMin, setPriceMin] = useState(filters.priceMin);
  const [priceMax, setPriceMax] = useState(filters.priceMax);
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    rating: true,
    availability: true,
    brands: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCategory = (catId: string) => {
    const updated = filters.categories.includes(catId)
      ? filters.categories.filter((c) => c !== catId)
      : [...filters.categories, catId];
    onFilterChange({ ...filters, categories: updated });
  };

  const toggleAvailability = (val: string) => {
    const updated = filters.availability.includes(val)
      ? filters.availability.filter((a) => a !== val)
      : [...filters.availability, val];
    onFilterChange({ ...filters, availability: updated });
  };

  const toggleBrand = (brand: string) => {
    const updated = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: updated });
  };

  const handlePriceApply = () => {
    onFilterChange({ ...filters, priceMin, priceMax });
  };

  const clearAll = () => {
    onFilterChange({
      categories: [],
      priceMin: 0,
      priceMax: 100000,
      rating: 0,
      availability: [],
      brands: [],
    });
    setPriceMin(0);
    setPriceMax(100000);
  };

  const FilterSection: React.FC<{
    title: string;
    sectionKey: keyof typeof openSections;
    children: React.ReactNode;
  }> = ({ title, sectionKey, children }) => (
    <div className="border-b border-kili-border py-4">
      <button
        className="w-full flex items-center justify-between text-sm font-semibold text-kili-fg hover:text-primary transition-colors"
        onClick={() => toggleSection(sectionKey)}
        aria-expanded={openSections[sectionKey]}
      >
        {title}
        <Icon
          name={openSections[sectionKey] ? 'ChevronUpIcon' : 'ChevronDownIcon'}
          size={16}
          className="text-kili-muted"
        />
      </button>
      {openSections[sectionKey] && (
        <div className="mt-3">{children}</div>
      )}
    </div>
  );

  return (
    <aside className={`${isMobile ? 'w-full' : 'w-64 shrink-0'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-4 border-b border-kili-border">
        <h2 className="text-base font-semibold text-kili-fg flex items-center gap-2">
          <Icon name="FunnelIcon" size={16} className="text-primary" />
          Filters
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            className="text-xs text-kili-muted hover:text-primary transition-colors"
          >
            Clear all
          </button>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-kili-elevated transition-colors text-kili-muted hover:text-kili-fg"
              aria-label="Close filters"
            >
              <Icon name="XMarkIcon" size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <FilterSection title="Categories" sectionKey="categories">
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="checkbox-custom"
                aria-label={`Filter by ${cat.name}`}
              />
              <span className="text-sm text-kili-muted group-hover:text-kili-fg transition-colors flex-1">
                {cat.icon} {cat.name}
              </span>
              <span className="text-xs text-kili-subtle">({cat.count.toLocaleString()})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range" sectionKey="price">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-kili-subtle mb-1 block">Min (KSh)</label>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                className="input-dark text-sm py-2"
                placeholder="0"
                min="0"
                aria-label="Minimum price in Kenyan Shillings"
              />
            </div>
            <span className="text-kili-subtle mt-5">—</span>
            <div className="flex-1">
              <label className="text-xs text-kili-subtle mb-1 block">Max (KSh)</label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="input-dark text-sm py-2"
                placeholder="100000"
                min="0"
                aria-label="Maximum price in Kenyan Shillings"
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100000}
            step={500}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            aria-label="Maximum price slider"
          />
          <button
            onClick={handlePriceApply}
            className="w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary hover:text-white transition-all"
          >
            Apply Price
          </button>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum Rating" sectionKey="rating">
        <div className="flex flex-col gap-2">
          {[4, 3, 2, 1].map((r) => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === r}
                onChange={() => onFilterChange({ ...filters, rating: r })}
                className="checkbox-custom"
                aria-label={`${r} stars and above`}
              />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    width="12"
                    height="12"
                    viewBox="0 0 20 20"
                    fill={s <= r ? '#FFB800' : '#2A2A35'}
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-xs text-kili-muted ml-1">& up</span>
              </div>
            </label>
          ))}
          {filters.rating > 0 && (
            <button
              onClick={() => onFilterChange({ ...filters, rating: 0 })}
              className="text-xs text-kili-subtle hover:text-primary transition-colors text-left"
            >
              Clear rating filter
            </button>
          )}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" sectionKey="availability">
        <div className="flex flex-col gap-2">
          {AVAILABILITY.map((val) => (
            <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.availability.includes(val)}
                onChange={() => toggleAvailability(val)}
                className="checkbox-custom"
                aria-label={`Filter by ${val}`}
              />
              <span className="text-sm text-kili-muted group-hover:text-kili-fg transition-colors">
                {val}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brands */}
      <FilterSection title="Brands" sectionKey="brands">
        <div className="flex flex-col gap-2">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="checkbox-custom"
                aria-label={`Filter by ${brand}`}
              />
              <span className="text-sm text-kili-muted group-hover:text-kili-fg transition-colors">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </aside>
  );
};

export default FilterSidebar;