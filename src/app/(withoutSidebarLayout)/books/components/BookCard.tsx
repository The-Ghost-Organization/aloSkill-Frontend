"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { BookResponse } from "../Books.type.ts";
import BookCardActions from "./BookCardActions";

// ─── Types ────────────────────────────────────────────────────────────────────

/*
 * `BookResponse` is the array type returned by the API
 * (`{...}[]`). A single book is one element of that array —
 * there's no standalone `Book` type to import.
 */
type Book = BookResponse[number];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvailabilityPill({ status }: { status: Book["stock"] }) {
  const styles = {
    "in-stock": "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",

    limited: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",

    "out-of-stock": "bg-red-50 text-red-500 ring-1 ring-red-100",
  } as const;

  const labels = {
    "in-stock": "In Stock",
    limited: "Limited",
    "out-of-stock": "Out of Stock",
  } as const;

  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function BookCover({
  src,
  title,
  priority = false,
  compact = false,
}: {
  src: string;
  title: string;
  priority?: boolean;
  compact?: boolean;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative isolate flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-stone-50 via-white to-amber-50/70 ${
        compact ? "p-2" : "p-4 sm:p-5"
      }`}
    >
      <div className='absolute inset-x-[12%] bottom-[5%] h-[10%] rounded-full bg-gray-900/15 blur-xl' />

      {!hasError && src ? (
        <div className='relative h-full max-h-full w-full max-w-full drop-shadow-[0_14px_16px_rgba(15,23,42,0.20)] transition duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.025]'>
          <Image
            src={src}
            alt={`Cover of ${title}`}
            fill
            priority={priority}
            onError={() => setHasError(true)}
            className='object-contain [filter:saturate(1.02)_contrast(1.01)]'
            sizes={compact ? "80px" : "(max-width: 640px) 76vw, (max-width: 1024px) 220px, 240px"}
          />
        </div>
      ) : (
        <div className='flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed border-amber-200 bg-white/70 px-3 text-center text-amber-700/70'>
          <BookOpen
            className={compact ? "h-6 w-6" : "h-10 w-10"}
            aria-hidden='true'
          />
          {!compact && (
            <span className='mt-2 line-clamp-2 text-xs font-semibold'>Cover unavailable</span>
          )}
        </div>
      )}

      <div className='pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/[0.04]' />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BookCardProps {
  book: Book;
  index?: number;
  viewMode?: "grid" | "list";
  cartItems?: {
    bookId: string;
    quantity: number;
  }[];
  onAddToCart?: (bookId: string, format?: "PHYSICAL" | "EBOOK") => void;
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

function GridCard({ book, index = 0, cartItems, onAddToCart }: BookCardProps) {
  const activeSalePrice = book.physicalSalePrice ?? book.digitalSalePrice;

  const activeRegularPrice = book.physicalRegularPrice ?? book.digitalRegularPrice;

  const discount =
    activeRegularPrice && activeSalePrice && activeRegularPrice > activeSalePrice
      ? Math.round(((activeRegularPrice - activeSalePrice) / activeRegularPrice) * 100)
      : null;

  return (
    <Link
      href={`/books/${book.id}`}
      className='group block'
    >
      <article className='bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-gray-200/70 hover:border-gray-200'>
        {/* ── Cover Image ── */}
        <div className='relative aspect-[3/4] w-full overflow-hidden bg-stone-50'>
          <BookCover
            src={book.coverImage}
            title={book.title}
            priority={index < 5}
          />

          {/* Permanent bottom gradient */}
          <div className='absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent' />

          {/* Hover actions */}
          <div className='absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-center bg-gradient-to-t from-black/70 via-black/25 to-transparent px-3 pb-4 pt-14 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100'>
            <BookCardActions
              bookId={book.id}
              bookTitle={book.title}
              isInCart={cartItems?.some(item => item.bookId === book.id) ?? false}
              onAddToCart={onAddToCart}
              format={book.formats}
              prices={{
                physical: {
                  salePrice: book.physicalSalePrice,
                  regularPrice: book.physicalRegularPrice,
                },
                digital: {
                  salePrice: book.digitalSalePrice,
                  regularPrice: book.digitalRegularPrice,
                },
              }}
            />
          </div>

          {/* Badges */}
          <div className='absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none'>
            {discount !== null && (
              <span className='text-[9px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full shadow-sm'>
                -{discount}%
              </span>
            )}
          </div>
        </div>

        {/* ── Card Body ── */}
        <div className='p-4'>
          <div className='flex items-center justify-between mb-1.5'>
            <span className='text-[10px] font-bold uppercase tracking-[0.14em] text-amber-500'>
              {book.author}
            </span>

            <span className='text-[10px] text-gray-400'>{book.createdAt}</span>
          </div>

          <h3 className='font-bold text-gray-900 text-sm leading-snug mb-0.5 line-clamp-2 transition-colors duration-200 group-hover:text-amber-600'>
            {book.title}
          </h3>

          <p className='text-[11px] text-gray-400 mb-2.5'>by {book.author}</p>

          {book.formats.map((format, index) => (
            <span
              key={`${format}-${index}`}
              className='text-[10px] text-gray-500 mr-2 last:mr-0 rounded-lg border border-gray-200 px-2 py-0.5'
            >
              {format}
            </span>
          ))}

          {/* Price & Availability */}
          <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
            <div className='flex items-baseline gap-1.5'>
              <span className='font-bold text-gray-900 text-sm'>${activeSalePrice}</span>

              {activeRegularPrice !== null && (
                <span className='text-[11px] text-gray-400 line-through'>
                  ${activeRegularPrice}
                </span>
              )}
            </div>

            <AvailabilityPill status={book.stock} />
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── List Card ────────────────────────────────────────────────────────────────

function ListCard({ book, cartItems, onAddToCart }: BookCardProps) {
  const activeSalePrice = book.physicalSalePrice ?? book.digitalSalePrice;

  const activeRegularPrice = book.physicalRegularPrice ?? book.digitalRegularPrice;

  const discount =
    activeRegularPrice && activeSalePrice && activeRegularPrice > activeSalePrice
      ? Math.round(((activeRegularPrice - activeSalePrice) / activeRegularPrice) * 100)
      : null;

  return (
    <Link
      href={`/books/${book.id}`}
      className='group block'
    >
      <article className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex gap-4 p-4 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-200/60 hover:border-gray-200'>
        {/* Cover */}
        <div className='relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-stone-50 shadow-sm'>
          <BookCover
            src={book.coverImage}
            title={book.title}
            compact
          />
        </div>

        {/* Info */}
        <div className='flex-1 min-w-0 flex flex-col justify-between'>
          <div>
            <div className='flex items-start justify-between gap-2 mb-0.5'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='text-[10px] font-bold uppercase tracking-[0.14em] text-amber-500'>
                  {book.author}
                </span>

                {book.formats.map((format, index) => (
                  <span
                    key={`${format}-${index}`}
                    className='text-[10px] text-gray-500 rounded-lg border border-gray-200 px-2 py-0.5'
                  >
                    {format}
                  </span>
                ))}
              </div>

              <span className='text-[10px] text-gray-400 shrink-0'>{book.createdAt}</span>
            </div>

            <h3 className='font-bold text-gray-900 text-base leading-tight mb-0.5 line-clamp-1 transition-colors duration-200 group-hover:text-amber-600'>
              {book.title}
            </h3>

            <p className='text-xs text-gray-400 mb-1.5'>by {book.author}</p>
          </div>

          {/* Price */}
          <div className='flex items-center justify-between mt-2'>
            <div className='flex items-center gap-2'>
              <div className='flex items-baseline gap-1'>
                <span className='font-bold text-gray-900 text-sm'>${activeSalePrice}</span>

                {discount !== null && (
                  <span className='text-[10px] font-bold text-red-500'>-{discount}%</span>
                )}

                {activeRegularPrice !== null && (
                  <span className='text-[10px] text-gray-400 line-through'>
                    ${activeRegularPrice}
                  </span>
                )}
              </div>

              <AvailabilityPill status={book.stock} />
            </div>
          </div>
        </div>

        {/* Hover action strip */}
        <div className='flex flex-col justify-center gap-1.5 shrink-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          <BookCardActions
            bookId={book.id}
            bookTitle={book.title}
            isInCart={cartItems?.some(item => item.bookId === book.id) ?? false}
            onAddToCart={onAddToCart}
            format={book.formats}
            prices={{
              physical: {
                salePrice: book.physicalSalePrice,
                regularPrice: book.physicalRegularPrice,
              },
              digital: {
                salePrice: book.digitalSalePrice,
                regularPrice: book.digitalRegularPrice,
              },
            }}
          />
        </div>
      </article>
    </Link>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function BookCard({
  book,
  index = 0,
  viewMode = "grid",
  cartItems = [],
  onAddToCart,
}: BookCardProps) {
  if (viewMode === "list") {
    return (
      <ListCard
        book={book}
        cartItems={cartItems}
        onAddToCart={onAddToCart}
      />
    );
  }

  return (
    <GridCard
      book={book}
      index={index}
      cartItems={cartItems}
      onAddToCart={onAddToCart}
    />
  );
}
