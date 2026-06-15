"use client";

import { ChevronDown, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { GENRES, MAX_PRICE } from "../Books";
import {
  type FilterState,
  type SortOption,
  SORT_OPTIONS,
  RATING_OPTIONS,
} from "../Filters";

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2.5">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100 my-5" />;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
  totalCount: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FilterPanel({
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
}: FilterPanelProps) {
  const update = (partial: Partial<FilterState>) =>
    onFiltersChange({ ...filters, ...partial });

  const toggleGenre = (genre: string) =>
    update({
      genres: filters.genres.includes(genre)
        ? filters.genres.filter((g) => g !== genre)
        : [...filters.genres, genre],
    });

  const activeCount = [
    filters.search !== "" ? 1 : 0,
    filters.genres.length,
    filters.priceRange[0] > 0 || filters.priceRange[1] < MAX_PRICE ? 1 : 0,
    filters.minRating > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAll = () =>
    onFiltersChange({
      search: "",
      genres: [],
      priceRange: [0, MAX_PRICE],
      minRating: 0,
      sort: filters.sort,
    });

  /*
    NOTE: No `sticky` here. Sticky positioning is applied by the wrapper div
    inside BooksClient so it sits on the direct flex child — the only place
    where `position: sticky` is guaranteed to work correctly.
  */
  return (
    <div className="w-full">

      {/* ── Panel header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="text-[10px] bg-amber-400 text-white font-black w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-amber-500 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* ── Panel body ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

        {/* Search */}
        <SectionLabel>Search</SectionLabel>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Title or author..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition-all duration-200"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <Divider />

        {/* Sort */}
        {/* <SectionLabel>Sort By</SectionLabel>
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value as SortOption })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 pr-8 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition-all duration-200 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        <Divider /> */}

        {/* Genre */}
        <SectionLabel>Genre</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((genre) => {
            const selected = filters.genres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all duration-150 ${
                  selected
                    ? "bg-amber-400 border-amber-400 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        <Divider />

        {/* Price Range */}
        <SectionLabel>Price Range</SectionLabel>
        <div className="flex items-end gap-2 mb-3">
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 block mb-1">Min</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                $
              </span>
              <input
                type="number"
                min={0}
                // max={filters.priceRange[1] - 1}
                value={filters.priceRange[0]}
                onChange={(e) =>
                  update({
                    priceRange: [
                      Math.min(Number(e.target.value), filters.priceRange[1] - 1),
                      filters.priceRange[1],
                    ],
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-5 pr-2 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition-all duration-200"
              />
            </div>
          </div>
          <span className="text-gray-300 text-sm mb-2">—</span>
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 block mb-1">Max</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                $
              </span>
              <input
                type="number"
                // min={filters.priceRange[0] + 1}
                min={0}
                // max={MAX_PRICE}
                value={filters.priceRange[1]}
                onChange={(e) =>
                  update({
                    priceRange: [
                      filters.priceRange[0],
                      Math.max(Number(e.target.value), filters.priceRange[0] + 1),
                    ],
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-5 pr-2 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={1}
          value={filters.priceRange[1]}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val > filters.priceRange[0])
              update({ priceRange: [filters.priceRange[0], val] });
          }}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-amber-400"
          style={{
            background: `linear-gradient(to right, #fbbf24 ${
              (filters.priceRange[1] / MAX_PRICE) * 100
            }%, #e5e7eb ${(filters.priceRange[1] / MAX_PRICE) * 100}%)`,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">$0</span>
          <span className="text-[10px] text-gray-400">${MAX_PRICE}</span>
        </div>

        <Divider />

        {/* Rating */}
        <SectionLabel>Minimum Rating</SectionLabel>
        <div className="grid grid-cols-4 gap-1.5">
          {RATING_OPTIONS.map((opt) => {
            const active = filters.minRating === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => update({ minRating: opt.value })}
                className={`py-2 text-[11px] rounded-xl border font-medium flex items-center justify-center gap-0.5 transition-all duration-150 ${
                  active
                    ? "bg-amber-400 border-amber-400 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50"
                }`}
              >
                {opt.value > 0 && <Star className="w-2.5 h-2.5 fill-current" />}
                {opt.label}
              </button>
            );
          })}
        </div>

        <Divider />

        {/* Result count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="text-amber-500 font-bold">{resultCount}</span> of{" "}
            {totalCount}
          </p>
          {resultCount === 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-amber-500 hover:underline underline-offset-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
