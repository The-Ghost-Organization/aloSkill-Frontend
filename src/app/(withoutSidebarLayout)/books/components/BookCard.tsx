/**
 * components/books/BookCard.tsx  ←  SERVER COMPONENT (no "use client")
 *
 * Pure display component — zero JavaScript shipped for this file.
 * All hover effects (image zoom, overlay fade, card lift) are Tailwind
 * CSS-only and work without hydration.
 *
 * The only client-side behaviour (cart / wishlist button clicks) lives
 * in <BookCardActions>, a tiny island that is imported here but rendered
 * inside the CSS hover overlay so it is only hydrated once visible.
 */

import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Book } from "../Books";
import BookCardActions from "./BookCardActions";
import { type BookResponse } from '../bookAction';

// ─── Sub-components (also server-only) ───────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`w-3 h-3 ${
            rating >= s
              ? "text-amber-400 fill-amber-400"
              : rating >= s - 0.5
                ? "text-amber-400 fill-amber-200"
                : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function AvailabilityPill({ status }: { status: Book["availability"] }) {
  const styles = {
    "in-stock": "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    limited: "bg-amber-50  text-amber-600  ring-1 ring-amber-100",
    "out-of-stock": "bg-red-50    text-red-500    ring-1 ring-red-100",
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface BookCardProps {
  book: BookResponse[0];
  index?: number;
  viewMode?: "grid" | "list";
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

function GridCard({ book }: BookCardProps) {
  const discount = book.regularPrice
    ? Math.round(((book.regularPrice - book.salePrice) / book.regularPrice) * 100)
    : null;

  return (
    <Link
      href={`/books/${book.id}`}
      className='group block'
    >
      <article className='bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-gray-200/70 hover:border-gray-200'>
        {/* ── Cover Image ── */}
        <div className='relative w-full h-56 overflow-hidden bg-gray-100'>
          <Image
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            fill
            className='object-cover transition-transform duration-500 ease-out group-hover:scale-105'
            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
          />

          {/* Permanent bottom gradient */}
          <div className='absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent' />

          {/*
            CSS-only hover overlay — opacity driven purely by Tailwind group-hover.
            No JavaScript involved. BookCardActions (client island) sits inside
            and handles click events independently.
          */}
          <div className='absolute inset-0 bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center'>
            <BookCardActions
              bookId={book.id}
              bookTitle={book.title}
            />
          </div>

          {/* Badges */}
          <div className='absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none'>
            {/* {book.bestseller && (
              <span className='text-[9px] font-black uppercase tracking-wide bg-amber-400 text-white px-2 py-0.5 rounded-full shadow-sm'>
                Bestseller
              </span>
            )} */}
            {discount && (
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

          {/* <div className='flex items-center gap-1.5 mb-3'>
            <StarRating rating={book.rating} />
            <span className='text-[10px] text-gray-400'>
              {book.rating} ({book.reviewCount.toLocaleString()})
            </span>
          </div> */}

          <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
            <div className='flex items-baseline gap-1.5'>
              <span className='font-bold text-gray-900 text-sm'>${book.salePrice}</span>
              {book.regularPrice && (
                <span className='text-[11px] text-gray-400 line-through'>
                  ${book.regularPrice}
                </span>
              )}
            </div>
            <AvailabilityPill status={book.stock as Book["availability"]} />
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── List Card ────────────────────────────────────────────────────────────────

function ListCard({ book }: BookCardProps) {
  const discount = book.regularPrice
    ? Math.round(((book.regularPrice - book.salePrice) / book.regularPrice) * 100)
    : null;

  return (
    <Link
      href={`/books/${book.id}`}
      className='group block'
    >
      <article className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex gap-4 p-4 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-200/60 hover:border-gray-200'>
        {/* Cover */}
        <div className='relative w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100'>
          <Image
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            fill
            className='object-cover transition-transform duration-500 group-hover:scale-105'
            sizes='80px'
          />
          {/* {book.bestseller && (
            <span className='absolute top-1 left-1 text-[8px] font-black bg-amber-400 text-white px-1.5 py-0.5 rounded-full leading-none'>
              BS
            </span>
          )} */}
        </div>

        {/* Info */}
        <div className='flex-1 min-w-0 flex flex-col justify-between'>
          <div>
            <div className='flex items-start justify-between gap-2 mb-0.5'>
              <span className='text-[10px] font-bold uppercase tracking-[0.14em] text-amber-500'>
                {book.author}
              </span>
              <span className='text-[10px] text-gray-400 shrink-0'>{book.createdAt}</span>
            </div>
            <h3 className='font-bold text-gray-900 text-base leading-tight mb-0.5 line-clamp-1 transition-colors duration-200 group-hover:text-amber-600'>
              {book.title}
            </h3>
            <p className='text-xs text-gray-400 mb-1.5'>by {book.author}</p>
            <p className='text-xs text-gray-500 line-clamp-2'>{book.title}</p>
          </div>

          <div className='flex items-center justify-between mt-2'>
            {/* <div className='flex items-center gap-1.5'>
              <StarRating rating={book.rating} />
              <span className='text-[10px] text-gray-400'>
                ({book.reviewCount.toLocaleString()})
              </span>
            </div> */}
            <div className='flex items-center gap-2'>
              <div className='flex items-baseline gap-1'>
                <span className='font-bold text-gray-900 text-sm'>${book.salePrice.toFixed(2)}</span>
                {discount && (
                  <span className='text-[10px] font-bold text-red-500'>-{discount}%</span>
                )}
              </div>
              <AvailabilityPill status={book.stock as Book["availability"]} />
            </div>
          </div>
        </div>

        {/* Hover action strip */}
        <div className='flex flex-col justify-center gap-1.5 shrink-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          {/* Client island for list actions */}
          <BookCardActions
            bookId={book.id}
            bookTitle={book.title}
          />
        </div>
      </article>
    </Link>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function BookCard({ book, index = 0, viewMode = "grid" }: BookCardProps) {
  // index is accepted for API compatibility; used for potential future CSS delay
  void index;
  if (viewMode === "list") return <ListCard book={book} />;
  return <GridCard book={book} />;
}
