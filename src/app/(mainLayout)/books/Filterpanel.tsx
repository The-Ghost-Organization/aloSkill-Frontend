"use client";

import { Search, X, SlidersHorizontal, ChevronDown, Star } from "lucide-react";

import { GENRES, MAX_PRICE } from './Books';
import { FilterState, RATING_OPTIONS, SORT_OPTIONS, SortOption } from './Filters';

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
  totalCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4a5568] mb-2.5">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px bg-[#1a1f2e] my-5" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FilterPanel({
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
}: FilterPanelProps) {
  // Partial update helper
  const update = (partial: Partial<FilterState>) =>
    onFiltersChange({ ...filters, ...partial });

  const toggleGenre = (genre: string) => {
    const genres = filters.genres.includes(genre)
      ? filters.genres.filter((g) => g !== genre)
      : [...filters.genres, genre];
    update({ genres });
  };

  // Count active filters (excluding sort)
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

  return (
    <aside className="w-full lg:w-[260px] xl:w-[280px] flex-shrink-0">
      <div className="sticky top-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#d4a24c]/10 flex items-center justify-center">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4a24c]" />
            </div>
            <span className="font-bold text-[#ede8dd] text-sm">Filters</span>
            {activeCount > 0 && (
              <span className="text-[10px] bg-[#d4a24c] text-[#0a0c11] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>

          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-[#4a5568] hover:text-[#d4a24c] transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        <div className="bg-[#111318] border border-[#1f2535] rounded-xl p-5">

          {/* ── Search ── */}
          <SectionLabel>Search</SectionLabel>
          <div className="relative mb-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a5568]" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => update({ search: e.target.value })}
              placeholder="Title or author..."
              className="w-full bg-[#0d0f16] border border-[#1a1f2e] rounded-lg pl-9 pr-8 py-2.5 text-xs text-[#ede8dd] placeholder-[#3a4050] focus:outline-none focus:border-[#d4a24c]/50 transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => update({ search: "" })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#ede8dd] transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <Divider />

          {/* ── Sort ── */}
          <SectionLabel>Sort By</SectionLabel>
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as SortOption })}
              className="w-full bg-[#0d0f16] border border-[#1a1f2e] rounded-lg px-3 pr-8 py-2.5 text-xs text-[#ede8dd] focus:outline-none focus:border-[#d4a24c]/50 transition-colors appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4a5568] pointer-events-none" />
          </div>

          <Divider />

          {/* ── Genre ── */}
          <SectionLabel>Genre</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map((genre) => {
              const selected = filters.genres.includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all duration-200 font-medium ${
                    selected
                      ? "bg-[#d4a24c] border-[#d4a24c] text-[#0a0c11] font-bold"
                      : "bg-transparent border-[#1a1f2e] text-[#6b7588] hover:border-[#d4a24c]/40 hover:text-[#ede8dd]"
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>

          <Divider />

          {/* ── Price Range ── */}
          <SectionLabel>Price Range</SectionLabel>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <label className="text-[10px] text-[#4a5568] block mb-1">Min</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#4a5568]">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  max={filters.priceRange[1] - 1}
                  value={filters.priceRange[0]}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), filters.priceRange[1] - 1);
                    update({ priceRange: [val, filters.priceRange[1]] });
                  }}
                  className="w-full bg-[#0d0f16] border border-[#1a1f2e] rounded-lg pl-5 pr-2 py-2 text-xs text-[#ede8dd] focus:outline-none focus:border-[#d4a24c]/50 transition-colors"
                />
              </div>
            </div>
            <div className="text-[#3a4050] text-sm mt-4">—</div>
            <div className="flex-1">
              <label className="text-[10px] text-[#4a5568] block mb-1">Max</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#4a5568]">
                  $
                </span>
                <input
                  type="number"
                  min={filters.priceRange[0] + 1}
                  max={MAX_PRICE}
                  value={filters.priceRange[1]}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), filters.priceRange[0] + 1);
                    update({ priceRange: [filters.priceRange[0], val] });
                  }}
                  className="w-full bg-[#0d0f16] border border-[#1a1f2e] rounded-lg pl-5 pr-2 py-2 text-xs text-[#ede8dd] focus:outline-none focus:border-[#d4a24c]/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Price slider */}
          <div className="px-1">
            <input
              type="range"
              min={0}
              max={MAX_PRICE}
              step={1}
              value={filters.priceRange[1]}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > filters.priceRange[0]) {
                  update({ priceRange: [filters.priceRange[0], val] });
                }
              }}
              className="w-full h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #d4a24c ${
                  (filters.priceRange[1] / MAX_PRICE) * 100
                }%, #1a1f2e ${(filters.priceRange[1] / MAX_PRICE) * 100}%)`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                WebkitAppearance: "none" as any,
              }}
            />
          </div>

          <Divider />

          {/* ── Rating ── */}
          <SectionLabel>Minimum Rating</SectionLabel>
          <div className="grid grid-cols-4 gap-1.5">
            {RATING_OPTIONS.map((opt) => {
              const active = filters.minRating === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => update({ minRating: opt.value })}
                  className={`py-2 text-[11px] rounded-lg border transition-all duration-200 flex items-center justify-center gap-0.5 font-medium ${
                    active
                      ? "bg-[#d4a24c] border-[#d4a24c] text-[#0a0c11] font-bold"
                      : "bg-[#0d0f16] border-[#1a1f2e] text-[#6b7588] hover:border-[#d4a24c]/40 hover:text-[#ede8dd]"
                  }`}
                >
                  {opt.value > 0 && <Star className="w-2.5 h-2.5 fill-current" />}
                  {opt.label}
                </button>
              );
            })}
          </div>

          <Divider />

          {/* ── Result Count ── */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#4a5568]">
              Showing{" "}
              <span className="text-[#d4a24c] font-bold">{resultCount}</span>{" "}
              of {totalCount} books
            </p>
            {resultCount === 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-[#d4a24c] hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
