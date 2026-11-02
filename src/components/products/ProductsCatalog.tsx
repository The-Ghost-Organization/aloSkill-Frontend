"use client";

import {
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  RotateCw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import ProductFilterPanel from "./ProductFilterPanel";
import { productMoney } from "./product.types";
import {
  AVAILABILITY_OPTIONS,
  type ProductFilterState,
  applyProductFilters,
  hasActiveProductFilters,
  initialProductFilters,
  productCategories,
  productPriceCeiling,
} from "./productFilters";
import { useProductCatalog } from "./useProductCatalog";

const PAGE_SIZE = 12;

// ─── Active filter chips ─────────────────────────────────────────────────────

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs text-orange-dark'>
      {label}
      <button
        type='button'
        onClick={onRemove}
        className='transition-colors hover:text-navy-deep'
        aria-label={`Remove ${label} filter`}
      >
        <X className='h-2.5 w-2.5' />
      </button>
    </span>
  );
}

function ActiveChips({
  filters,
  onChange,
}: {
  filters: ProductFilterState;
  onChange: (f: ProductFilterState) => void;
}) {
  if (!hasActiveProductFilters(filters)) return null;
  const priceLabel =
    filters.minPrice !== null && filters.maxPrice !== null
      ? `${productMoney(filters.minPrice)} – ${productMoney(filters.maxPrice)}`
      : filters.minPrice !== null
        ? `From ${productMoney(filters.minPrice)}`
        : `Up to ${productMoney(filters.maxPrice)}`;

  return (
    <div className='border-b border-gray-100'>
      <div className='mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8'>
        <span className='text-[10px] font-bold uppercase tracking-widest text-gray-400'>
          Active:
        </span>
        {filters.search.trim() && (
          <Chip
            label={`"${filters.search.trim()}"`}
            onRemove={() => onChange({ ...filters, search: "" })}
          />
        )}
        {filters.categories.map(c => (
          <Chip
            key={c}
            label={c}
            onRemove={() =>
              onChange({ ...filters, categories: filters.categories.filter(x => x !== c) })
            }
          />
        ))}
        {(filters.minPrice !== null || filters.maxPrice !== null) && (
          <Chip
            label={priceLabel}
            onRemove={() => onChange({ ...filters, minPrice: null, maxPrice: null })}
          />
        )}
        {filters.availability !== "all" && (
          <Chip
            label={AVAILABILITY_OPTIONS.find(o => o.value === filters.availability)?.label ?? ""}
            onRemove={() => onChange({ ...filters, availability: "all" })}
          />
        )}
        <button
          type='button'
          onClick={() => onChange({ ...initialProductFilters, sort: filters.sort })}
          className='ml-1 text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-orange-dark'
        >
          Clear all
        </button>
      </div>
    </div>
  );
}

// ─── States ──────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div
      role='status'
      aria-label='Loading products'
      className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5 xl:grid-cols-4'
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function EmptyState({ filtered, onReset }: { filtered: boolean; onReset: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center py-24 text-center'>
      <div className='mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50'>
        <PackageSearch
          className='h-9 w-9 text-gray-300'
          aria-hidden='true'
        />
      </div>
      <h3 className='mb-2 text-xl font-bold text-gray-900'>
        {filtered ? "No products found" : "No products are available yet"}
      </h3>
      <p className='mb-5 max-w-xs text-sm text-gray-500'>
        {filtered
          ? "Your filters returned no results. Try broadening your search or removing some filters."
          : "Instructor-created learning tools will appear here once approved."}
      </p>
      {filtered && (
        <button
          type='button'
          onClick={onReset}
          className='rounded-full border border-orange-200 px-5 py-2 text-sm font-semibold text-orange-dark transition-colors duration-200 hover:bg-orange-50'
        >
          Reset all filters
        </button>
      )}
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  const btn =
    "inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-orange-light hover:text-orange-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-700";
  return (
    <nav
      aria-label='Product pages'
      className='mt-10 flex items-center justify-center gap-3'
    >
      <button
        type='button'
        className={btn}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft
          className='h-4 w-4'
          aria-hidden='true'
        />
        <span className='hidden sm:inline'>Previous</span>
      </button>
      <span
        className='text-sm text-gray-600'
        aria-live='polite'
      >
        Page <span className='font-semibold text-navy-deep'>{page}</span> of {pageCount}
      </span>
      <button
        type='button'
        className={btn}
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        <span className='hidden sm:inline'>Next</span>
        <ChevronRight
          className='h-4 w-4'
          aria-hidden='true'
        />
      </button>
    </nav>
  );
}

// ─── ProductsCatalog ─────────────────────────────────────────────────────────

export default function ProductsCatalog({
  onTotalChange,
}: {
  onTotalChange?: (total: number) => void;
}) {
  const { products, loading, error, truncated, reload } = useProductCatalog();
  const [filters, setFilters] = useState<ProductFilterState>(initialProductFilters);
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const gridTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) onTotalChange?.(products.length);
  }, [loading, products.length, onTotalChange]);

  const categories = useMemo(() => productCategories(products), [products]);
  const priceCeiling = useMemo(() => productPriceCeiling(products), [products]);

  // Filtering runs over the WHOLE catalog; pagination is applied afterwards.
  const filtered = useMemo(() => applyProductFilters(products, filters), [products, filters]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changeFilters = (next: ProductFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const changePage = (next: number) => {
    setPage(next);
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => changeFilters({ ...initialProductFilters, sort: filters.sort });

  return (
    <>
      {/* ── Toolbar ── */}
      <div className='border-b border-gray-100 bg-white'>
        <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8'>
          <p
            className='text-xs text-gray-500'
            aria-live='polite'
          >
            {loading ? (
              "Loading products…"
            ) : (
              <>
                <span className='font-semibold text-gray-900'>{filtered.length}</span>{" "}
                {filtered.length === 1 ? "product" : "products"} found
              </>
            )}
          </p>
          <button
            type='button'
            onClick={() => setMobileFilterOpen(v => !v)}
            aria-expanded={mobileFilterOpen}
            aria-controls='product-filters'
            className='flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors duration-200 hover:border-orange-light lg:hidden'
          >
            <SlidersHorizontal className='h-3.5 w-3.5 text-orange' />
            Filters
          </button>
        </div>
      </div>

      <ActiveChips
        filters={filters}
        onChange={changeFilters}
      />

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {error && (
          <div
            role='alert'
            className='mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between'
          >
            <span>{error}</span>
            <button
              type='button'
              onClick={reload}
              className='inline-flex items-center gap-1.5 self-start rounded-lg border border-red-300 bg-white px-3 py-1.5 font-semibold text-red-800 hover:bg-red-100 sm:self-auto'
            >
              <RotateCw
                className='h-3.5 w-3.5'
                aria-hidden='true'
              />{" "}
              Retry
            </button>
          </div>
        )}
        {truncated && (
          <p className='mb-6 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-dark'>
            Showing the first 1,000 products. Narrow your search to find more.
          </p>
        )}

        <div className='flex flex-col items-start gap-8 lg:flex-row'>
          <div
            id='product-filters'
            className={`w-full shrink-0 lg:sticky lg:top-36 lg:max-h-[calc(100vh-10rem)] lg:w-70 lg:self-start lg:overflow-y-auto ${
              mobileFilterOpen ? "block" : "hidden lg:block"
            }`}
          >
            <ProductFilterPanel
              filters={filters}
              onFiltersChange={changeFilters}
              categories={categories}
              priceCeiling={priceCeiling}
              resultCount={filtered.length}
              totalCount={products.length}
            />
          </div>

          <div
            ref={gridTopRef}
            className='min-w-0 flex-1 scroll-mt-40'
          >
            {loading ? (
              <GridSkeleton />
            ) : pageItems.length === 0 ? (
              error && products.length === 0 ? null : (
                <EmptyState
                  filtered={hasActiveProductFilters(filters)}
                  onReset={resetFilters}
                />
              )
            ) : (
              <>
                <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5 xl:grid-cols-4'>
                  {pageItems.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
                <Pagination
                  page={currentPage}
                  pageCount={pageCount}
                  onChange={changePage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
