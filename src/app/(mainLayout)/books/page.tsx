/**
 * app/books/page.tsx
 *
 * All Books page — client component (requires useState for live filtering).
 * Replace mock data import with your API call when ready.
 *
 * Dependencies:
 *   npm install framer-motion lucide-react
 *   # next/image and next/link are built into Next.js
 *
 * next.config.ts — add picsum.photos to allowed image domains:
 *   images: { remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }] }
 *
 * Fonts — add to app/layout.tsx:
 *   import { Playfair_Display, DM_Sans } from 'next/font/google'
 *   const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
 *   const dm = DM_Sans({ subsets: ['latin'], variable: '--font-dm' })
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  LayoutGrid,
  LayoutList,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import BookCard from './BookCard';
import { books, MAX_PRICE } from './Books';
import FilterPanel from './Filterpanel';
import { type FilterState, initialFilters } from './Filters';

// ─── Active Filter Chips ──────────────────────────────────────────────────────

function ActiveFilterChips({
  filters,
  onFiltersChange,
}: {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
}) {
  const hasChips =
    filters.search !== "" ||
    filters.genres.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < MAX_PRICE ||
    filters.minRating > 0;

  if (!hasChips) return null;

  const removeGenre = (g: string) =>
    onFiltersChange({
      ...filters,
      genres: filters.genres.filter((x) => x !== g),
    });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b border-[#1a1f2e]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-[#4a5568] font-bold">
          Active:
        </span>

        {filters.search && (
          <span className="inline-flex items-center gap-1.5 text-xs bg-[#1a1f2e] text-[#ede8dd] border border-[#2a3040] px-2.5 py-1 rounded-full">
            &ldquo;{filters.search}&rdquo;
            <button
              onClick={() => onFiltersChange({ ...filters, search: "" })}
              className="text-[#4a5568] hover:text-[#ede8dd] transition-colors"
              aria-label="Remove search filter"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        )}

        {filters.genres.map((g) => (
          <span
            key={g}
            className="inline-flex items-center gap-1.5 text-xs bg-[#d4a24c]/10 text-[#d4a24c] border border-[#d4a24c]/25 px-2.5 py-1 rounded-full"
          >
            {g}
            <button
              onClick={() => removeGenre(g)}
              className="hover:text-[#ede8dd] transition-colors"
              aria-label={`Remove ${g} filter`}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}

        {(filters.priceRange[0] > 0 || filters.priceRange[1] < MAX_PRICE) && (
          <span className="inline-flex items-center gap-1.5 text-xs bg-[#d4a24c]/10 text-[#d4a24c] border border-[#d4a24c]/25 px-2.5 py-1 rounded-full">
            ${filters.priceRange[0]} – ${filters.priceRange[1]}
            <button
              onClick={() =>
                onFiltersChange({ ...filters, priceRange: [0, MAX_PRICE] })
              }
              className="hover:text-[#ede8dd] transition-colors"
              aria-label="Remove price filter"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        )}

        {filters.minRating > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs bg-[#d4a24c]/10 text-[#d4a24c] border border-[#d4a24c]/25 px-2.5 py-1 rounded-full">
            ★ {filters.minRating}+
            <button
              onClick={() => onFiltersChange({ ...filters, minRating: 0 })}
              className="hover:text-[#ede8dd] transition-colors"
              aria-label="Remove rating filter"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        )}

        <button
          onClick={() => onFiltersChange({ ...initialFilters, sort: filters.sort })}
          className="text-xs text-[#4a5568] hover:text-[#d4a24c] transition-colors underline underline-offset-2 ml-1"
        >
          Clear all
        </button>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-28 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-[#111318] border border-[#1a1f2e] flex items-center justify-center mb-5">
        <BookOpen className="w-9 h-9 text-[#2a3040]" />
      </div>
      <h3
        className="text-xl font-bold text-[#ede8dd] mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        No books found
      </h3>
      <p className="text-sm text-[#4a5568] mb-5 max-w-xs">
        Your filters returned no results. Try broadening your search or removing
        some filters.
      </p>
      <button
        onClick={onReset}
        className="text-sm font-semibold text-[#d4a24c] border border-[#d4a24c]/30 px-5 py-2 rounded-full hover:bg-[#d4a24c]/10 transition-colors"
      >
        Reset all filters
      </button>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BooksPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Live filtering + sorting
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchTitle = book.title.toLowerCase().includes(q);
          const matchAuthor = book.author.toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor) return false;
        }
        if (filters.genres.length > 0 && !filters.genres.includes(book.genre))
          return false;
        if (
          book.price < filters.priceRange[0] ||
          book.price > filters.priceRange[1]
        )
          return false;
        if (book.rating < filters.minRating) return false;
        return true;
      })
      .sort((a, b) => {
        switch (filters.sort) {
          case "newest":
            return b.publishedYear - a.publishedYear;
          case "oldest":
            return a.publishedYear - b.publishedYear;
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "rating":
            return b.rating - a.rating;
          case "popular":
          default:
            return b.reviewCount - a.reviewCount;
        }
      });
  }, [filters]);

  const handleReset = useCallback(
    () => setFilters({ ...initialFilters, sort: filters.sort }),
    [filters.sort]
  );

  return (
    <>
      {/* Google Fonts — move to layout.tsx using next/font/google in production */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #d4a24c;
          cursor: pointer;
          border: 2px solid #0a0c11;
          box-shadow: 0 0 0 2px #d4a24c40;
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #d4a24c;
          cursor: pointer;
          border: 2px solid #0a0c11;
        }
      `}</style>

      <main
        className="min-h-screen bg-[#0a0c11]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* ── Page Header ── */}
        <div className="border-b border-[#1a1f2e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d4a24c] mb-2">
                  Our Collection
                </p>
                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#ede8dd] leading-none"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  All Books
                </h1>
                <p className="text-[#4a5568] mt-2 text-sm">
                  {books.length} titles curated for the discerning reader
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFilterOpen((v) => !v)}
                  className="lg:hidden flex items-center gap-1.5 bg-[#111318] border border-[#1a1f2e] text-[#ede8dd] text-xs font-medium px-3 py-2 rounded-lg"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters
                </button>

                {/* View mode toggle */}
                <div className="hidden sm:flex items-center gap-1 bg-[#111318] border border-[#1a1f2e] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-[#d4a24c] text-[#0a0c11]"
                        : "text-[#4a5568] hover:text-[#ede8dd]"
                    }`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-[#d4a24c] text-[#0a0c11]"
                        : "text-[#4a5568] hover:text-[#ede8dd]"
                    }`}
                    aria-label="List view"
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Active Filter Chips ── */}
        <AnimatePresence>
          <ActiveFilterChips filters={filters} onFiltersChange={setFilters} />
        </AnimatePresence>

        {/* ── Body ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Filter sidebar — hidden on mobile unless toggled */}
            <AnimatePresence>
              {(mobileFilterOpen || true) && (
                <motion.div
                  className={`${
                    mobileFilterOpen ? "block" : "hidden lg:block"
                  }`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={setFilters}
                    resultCount={filteredBooks.length}
                    totalCount={books.length}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Books area */}
            <div className="flex-1 min-w-0">
              {/* Result count + sort info */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-[#4a5568]">
                  <span className="text-[#ede8dd] font-semibold">
                    {filteredBooks.length}
                  </span>{" "}
                  {filteredBooks.length === 1 ? "book" : "books"} found
                </p>
                <p className="text-xs text-[#4a5568] hidden sm:block">
                  Sorted by{" "}
                  <span className="text-[#d4a24c] font-semibold capitalize">
                    {filters.sort.replace("-", " ")}
                  </span>
                </p>
              </div>

              {/* Grid / List */}
              <AnimatePresence mode="wait">
                {filteredBooks.length === 0 ? (
                  <EmptyState onReset={handleReset} />
                ) : (
                  <motion.div
                    key={`${viewMode}-${filters.genres.join()}-${filters.search}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
                        : "flex flex-col gap-3"
                    }
                  >
                    {filteredBooks.map((book, index) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        index={index}
                        viewMode={viewMode}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
