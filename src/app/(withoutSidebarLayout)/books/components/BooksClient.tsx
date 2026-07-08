"use client";

import { LayoutGrid, LayoutList, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { bookDraftStorage } from "../../../../lib/storage/courseDraftStorage";
import { useSessionContext } from "../../../contexts/SessionContext";
import { type BookResponse } from "../bookAction";
import { MAX_PRICE } from "../Books";
import { type FilterState, initialFilters } from "../Filters";
import BookCard from "./BookCard";
import FilterPanel from "./Filterpanel";

// export type AddToCartProps = {
//   bookId: string;
//   format?: "PHYSICAL" | "DIGITAL";
// };

// ─── Active Filter Chips ──────────────────────────────────────────────────────

function Chip({
  label,
  variant = "default",
  onRemove,
}: {
  label: string;
  variant?: "default" | "amber";
  onRemove: () => void;
}) {
  const base = "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border";
  const cls =
    variant === "amber"
      ? `${base} bg-amber-50 text-amber-600 border-amber-200`
      : `${base} bg-gray-100 text-gray-700 border-gray-200`;
  return (
    <span className={cls}>
      {label}
      <button
        onClick={onRemove}
        className='hover:text-gray-900 transition-colors'
        aria-label={`Remove ${label} filter`}
      >
        <X className='w-2.5 h-2.5' />
      </button>
    </span>
  );
}

function ActiveFilterChips({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}) {
  const hasChips =
    filters.search !== "" ||
    filters.genres.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < MAX_PRICE ||
    filters.minRating > 0;

  if (!hasChips) return null;

  return (
    <div className='border-b border-gray-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 flex-wrap'>
        <span className='text-[10px] uppercase tracking-widest text-gray-400 font-bold'>
          Active:
        </span>

        {filters.search && (
          <Chip
            label={`"${filters.search}"`}
            onRemove={() => onChange({ ...filters, search: "" })}
          />
        )}

        {filters.genres.map(g => (
          <Chip
            key={g}
            label={g}
            variant='amber'
            onRemove={() =>
              onChange({
                ...filters,
                genres: filters.genres.filter(x => x !== g),
              })
            }
          />
        ))}

        {(filters.priceRange[0] > 0 || filters.priceRange[1] < MAX_PRICE) && (
          <Chip
            label={`$${filters.priceRange[0]} – $${filters.priceRange[1]}`}
            variant='amber'
            onRemove={() => onChange({ ...filters, priceRange: [0, MAX_PRICE] })}
          />
        )}

        {filters.minRating > 0 && (
          <Chip
            label={`★ ${filters.minRating}+`}
            variant='amber'
            onRemove={() => onChange({ ...filters, minRating: 0 })}
          />
        )}

        <button
          onClick={() => onChange({ ...initialFilters, sort: filters.sort })}
          className='text-xs text-gray-400 hover:text-amber-500 transition-colors underline underline-offset-2 ml-1'
        >
          Clear all
        </button>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center py-24 text-center'>
      <div className='w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5'>
        <svg
          className='w-9 h-9 text-gray-300'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={1.5}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25'
          />
        </svg>
      </div>
      <h3 className='text-xl font-bold text-gray-900 mb-2'>No books found</h3>
      <p className='text-sm text-gray-500 mb-5 max-w-xs'>
        Your filters returned no results. Try broadening your search or removing some filters.
      </p>
      <button
        onClick={onReset}
        className='text-sm font-semibold text-amber-500 border border-amber-200 px-5 py-2 rounded-full hover:bg-amber-50 transition-colors duration-200'
      >
        Reset all filters
      </button>
    </div>
  );
}

// ─── BooksClient ──────────────────────────────────────────────────────────────

export default function BooksClient({ initialBooks }: { initialBooks: BookResponse }) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{ bookId: string; quantity: number }[]>([]);
  const [updateCart, setUpdateCart] = useState<boolean>(false);
  const { setCartUpdate } = useSessionContext();

  useEffect(() => {
    const storedCartItems = bookDraftStorage.get<{ bookId: string; quantity: number }[]>() || [];
    setCartItems(storedCartItems);
  }, [updateCart]);

  const filteredBooks = useMemo(() => {
    return initialBooks.filter(book => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!book.title.toLowerCase().includes(q) && !book.author.toLowerCase().includes(q))
          return false;
      }
      if (filters.genres.length > 0 && !filters.genres.includes(book.category?.name as string))
        return false;
      const currentPrice =
        book.physicalSalePrice ??
        book.physicalRegularPrice ??
        book.digitalSalePrice ??
        book.digitalRegularPrice ??
        0;
      if (currentPrice <= filters.priceRange[0] || currentPrice >= filters.priceRange[1]) {
        return false;
      }
      // if (book.rating < filters.minRating) return false;
      return true;
    });
    // .sort((a, b) => {
    //   switch (filters.sort) {
    //     case "newest":
    //       return b.createdAt.localeCompare(a.createdAt);
    //     case "oldest":
    //       return a.createdAt.localeCompare(b.createdAt);
    //     case "price-asc":
    //       return (a.salePrice ?? a.regularPrice) - (b.salePrice ?? b.regularPrice);
    //     case "price-desc":
    //       return (b.salePrice ?? b.regularPrice) - (a.salePrice ?? a.regularPrice);
    //     // case "rating":
    //     //   return b.rating - a.rating;
    //     default:
    //       return 0;
    //   }
    // });
  }, [initialBooks, filters]);

  const handleReset = useCallback(
    () => setFilters({ ...initialFilters, sort: filters.sort }),
    [filters.sort]
  );

  const bookAddToCartHandler = (bookId: string, format: "PHYSICAL" | "EBOOK") => {
    const getStorageData =
      bookDraftStorage.get<
        { bookId: string; format: "PHYSICAL" | "EBOOK"; quantity: number }[]
      >() || [];
    const existingBook = getStorageData?.find(item => item.bookId === bookId);
    if (existingBook?.format === format) return;
    if (existingBook?.format === "PHYSICAL" || existingBook?.format === "EBOOK") {
      getStorageData.splice(getStorageData.indexOf(existingBook), 1);
      getStorageData?.push({ bookId, format, quantity: 1 });
      bookDraftStorage.save(getStorageData);
      return;
    }
    getStorageData?.push({ bookId, format, quantity: 1 });
    bookDraftStorage.save(getStorageData);
    return;
  };

  const handleAddToCart = useCallback(
    (bookId: string, format?: "PHYSICAL" | "EBOOK") => {
      if (!format) return;
      bookAddToCartHandler(bookId, format);
      setUpdateCart(prev => !prev);
      setCartUpdate?.(prev => !prev);
    },
    [setCartUpdate]
  );

  return (
    <>
      {/* ── Toolbar ── */}
      <div className='border-b border-gray-100 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4'>
          <p className='text-xs text-gray-500'>
            <span className='text-gray-900 font-semibold'>{filteredBooks.length}</span>{" "}
            {filteredBooks.length === 1 ? "book" : "books"} found
            {filters.sort !== "popular" && (
              <>
                {" · "}
                <span className='text-amber-500 font-semibold capitalize'>
                  {filters.sort.replace(/-/g, " ")}
                </span>
              </>
            )}
          </p>

          <div className='flex items-center gap-2 shrink-0'>
            <button
              onClick={() => setMobileFilterOpen(v => !v)}
              className='lg:hidden flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-2 rounded-xl hover:border-amber-300 transition-colors duration-200'
            >
              <SlidersHorizontal className='w-3.5 h-3.5 text-amber-500' />
              Filters
            </button>

            <div className='flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1'>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-amber-400 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                aria-label='Grid view'
              >
                <LayoutGrid className='w-3.5 h-3.5' />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-amber-400 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                aria-label='List view'
              >
                <LayoutList className='w-3.5 h-3.5' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active filter chips ── */}
      <ActiveFilterChips
        filters={filters}
        onChange={setFilters}
      />

      {/* ── Main layout ── */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex flex-col lg:flex-row gap-8 items-start'>
          <div
            className={`
              w-full shrink-0
              lg:w-70 lg:sticky lg:top-36 lg:self-start
              lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto
              ${mobileFilterOpen ? "block" : "hidden lg:block"}
            `}
          >
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              resultCount={filteredBooks.length}
              totalCount={initialBooks.length}
            />
          </div>

          {/* ── Book grid / list ── */}
          <div className='flex-1 min-w-0'>
            {filteredBooks.length === 0 ? (
              <EmptyState onReset={handleReset} />
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-5"
                    : "flex flex-col gap-3"
                }
              >
                {filteredBooks.map((book, index) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={index}
                    viewMode={viewMode}
                    cartItems={cartItems}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
