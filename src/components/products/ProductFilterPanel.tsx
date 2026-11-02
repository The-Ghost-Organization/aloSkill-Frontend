"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import {
  AVAILABILITY_OPTIONS,
  PRODUCT_SORT_OPTIONS,
  type ProductFilterState,
  type ProductSort,
  countActiveProductFilters,
  initialProductFilters,
} from "./productFilters";

function SectionLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  const cls = "block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2.5";
  return htmlFor ? (
    <label
      htmlFor={htmlFor}
      className={cls}
    >
      {children}
    </label>
  ) : (
    <p className={cls}>{children}</p>
  );
}

function Divider() {
  return <div className='my-5 h-px bg-gray-100' />;
}

const pill = (selected: boolean) =>
  `text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all duration-150 ${
    selected
      ? "bg-orange border-orange text-white shadow-sm"
      : "bg-white border-gray-200 text-gray-600 hover:border-orange-light hover:text-orange-dark hover:bg-orange-50"
  }`;

const inputCls =
  "w-full bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-light focus:ring-2 focus:ring-orange-100 transition-all duration-200";

/** Parse a numeric input; empty / invalid / negative → null (unbounded). */
function toBound(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

interface ProductFilterPanelProps {
  filters: ProductFilterState;
  onFiltersChange: (filters: ProductFilterState) => void;
  categories: { name: string; count: number }[];
  priceCeiling: number;
  resultCount: number;
  totalCount: number;
}

export default function ProductFilterPanel({
  filters,
  onFiltersChange,
  categories,
  priceCeiling,
  resultCount,
  totalCount,
}: ProductFilterPanelProps) {
  const update = (partial: Partial<ProductFilterState>) =>
    onFiltersChange({ ...filters, ...partial });

  const toggleCategory = (name: string) =>
    update({
      categories: filters.categories.includes(name)
        ? filters.categories.filter(c => c !== name)
        : [...filters.categories, name],
    });

  const activeCount = countActiveProductFilters(filters);
  const clearAll = () => onFiltersChange({ ...initialProductFilters, sort: filters.sort });
  const sliderValue = Math.min(filters.maxPrice ?? priceCeiling, priceCeiling);
  const sliderPct = (sliderValue / priceCeiling) * 100;

  return (
    <div className='w-full'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50'>
            <SlidersHorizontal className='h-3.5 w-3.5 text-orange' />
          </div>
          <span className='text-sm font-bold text-gray-900'>Filters</span>
          {activeCount > 0 && (
            <span className='flex h-5 w-5 items-center justify-center rounded-full bg-orange text-[10px] font-black text-white'>
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type='button'
            onClick={clearAll}
            className='flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-orange-dark'
          >
            <X className='h-3 w-3' />
            Clear all
          </button>
        )}
      </div>

      <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
        {/* Search */}
        <SectionLabel htmlFor='product-search'>Search</SectionLabel>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400' />
          <input
            id='product-search'
            type='search'
            value={filters.search}
            onChange={e => update({ search: e.target.value })}
            placeholder='Product or category...'
            className={`${inputCls} py-2.5 pl-9 pr-8`}
          />
          {filters.search && (
            <button
              type='button'
              onClick={() => update({ search: "" })}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600'
              aria-label='Clear search'
            >
              <X className='h-3 w-3' />
            </button>
          )}
        </div>

        <Divider />

        {/* Sort */}
        <SectionLabel htmlFor='product-sort'>Sort By</SectionLabel>
        <div className='relative'>
          <select
            id='product-sort'
            value={filters.sort}
            onChange={e => update({ sort: e.target.value as ProductSort })}
            className={`${inputCls} cursor-pointer appearance-none px-3 py-2.5 pr-8`}
          >
            {PRODUCT_SORT_OPTIONS.map(opt => (
              <option
                key={opt.value}
                value={opt.value}
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400' />
        </div>

        <Divider />

        {/* Category */}
        <SectionLabel>Category</SectionLabel>
        {categories.length === 0 ? (
          <p className='text-xs text-gray-400'>No categories yet.</p>
        ) : (
          <div className='flex flex-wrap gap-1.5'>
            {categories.map(category => {
              const selected = filters.categories.includes(category.name);
              return (
                <button
                  key={category.name}
                  type='button'
                  aria-pressed={selected}
                  onClick={() => toggleCategory(category.name)}
                  className={pill(selected)}
                >
                  {category.name}
                  <span className={selected ? "ml-1 text-white/80" : "ml-1 text-gray-400"}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <Divider />

        {/* Price */}
        <SectionLabel>Price Range (৳)</SectionLabel>
        <div className='mb-3 flex items-end gap-2'>
          <div className='flex-1'>
            <label
              htmlFor='product-min-price'
              className='mb-1 block text-[10px] text-gray-400'
            >
              Min
            </label>
            <input
              id='product-min-price'
              type='number'
              inputMode='decimal'
              min={0}
              placeholder='0'
              value={filters.minPrice ?? ""}
              onChange={e => update({ minPrice: toBound(e.target.value) })}
              className={`${inputCls} px-3 py-2`}
            />
          </div>
          <span className='mb-2 text-sm text-gray-300'>—</span>
          <div className='flex-1'>
            <label
              htmlFor='product-max-price'
              className='mb-1 block text-[10px] text-gray-400'
            >
              Max
            </label>
            <input
              id='product-max-price'
              type='number'
              inputMode='decimal'
              min={0}
              placeholder={String(priceCeiling)}
              value={filters.maxPrice ?? ""}
              onChange={e => update({ maxPrice: toBound(e.target.value) })}
              className={`${inputCls} px-3 py-2`}
            />
          </div>
        </div>
        <input
          type='range'
          aria-label='Maximum price'
          min={0}
          max={priceCeiling}
          step={1}
          value={sliderValue}
          onChange={e => {
            const val = Number(e.target.value);
            update({ maxPrice: val >= priceCeiling ? null : val });
          }}
          className='h-1.5 w-full cursor-pointer appearance-none rounded-full accent-orange'
          style={{
            background: `linear-gradient(to right, var(--color-orange) ${sliderPct}%, #e5e7eb ${sliderPct}%)`,
          }}
        />
        <div className='mt-1 flex justify-between'>
          <span className='text-[10px] text-gray-400'>৳0</span>
          <span className='text-[10px] text-gray-400'>৳{priceCeiling.toLocaleString("en-BD")}</span>
        </div>
        {filters.minPrice !== null &&
          filters.maxPrice !== null &&
          filters.minPrice > filters.maxPrice && (
            <p
              role='alert'
              className='mt-2 text-[11px] text-red-600'
            >
              Min price is higher than max price.
            </p>
          )}

        <Divider />

        {/* Availability */}
        <SectionLabel>Availability</SectionLabel>
        <div
          className='grid grid-cols-3 gap-1.5'
          role='radiogroup'
          aria-label='Availability'
        >
          {AVAILABILITY_OPTIONS.map(opt => {
            const active = filters.availability === opt.value;
            return (
              <button
                key={opt.value}
                type='button'
                role='radio'
                aria-checked={active}
                onClick={() => update({ availability: opt.value })}
                className={`rounded-xl border py-2 text-[11px] font-medium transition-all duration-150 ${
                  active
                    ? "border-orange bg-orange text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-orange-light hover:bg-orange-50 hover:text-orange-dark"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <Divider />

        <div className='flex items-center justify-between'>
          <p className='text-xs text-gray-500'>
            Showing <span className='font-bold text-orange-dark'>{resultCount}</span> of{" "}
            {totalCount}
          </p>
          {resultCount === 0 && activeCount > 0 && (
            <button
              type='button'
              onClick={clearAll}
              className='text-xs text-orange-dark underline-offset-2 hover:underline'
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
