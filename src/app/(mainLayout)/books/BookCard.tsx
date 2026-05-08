"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart, BookOpen } from "lucide-react";
import type { Book } from './Books';

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${starSize} ${
            rating >= s
              ? "text-[#d4a24c] fill-[#d4a24c]"
              : rating >= s - 0.5
              ? "text-[#d4a24c] fill-[#d4a24c]/40"
              : "text-[#2a3040]"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Availability Badge ───────────────────────────────────────────────────────

function AvailabilityBadge({ status }: { status: Book["availability"] }) {
  const styles = {
    "in-stock": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    limited: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "out-of-stock": "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const labels = {
    "in-stock": "In Stock",
    limited: "Limited",
    "out-of-stock": "Out of Stock",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// ─── Book Card Props ──────────────────────────────────────────────────────────

interface BookCardProps {
  book: Book;
  index?: number;
  viewMode?: "grid" | "list";
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

function GridCard({ book, index = 0 }: BookCardProps) {
  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.5) }}
      className="group"
    >
      <Link href={`/books/${book.id}`}>
        <div className="relative bg-[#111318] border border-[#1f2535] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#d4a24c]/40 hover:shadow-[0_8px_32px_rgba(212,162,76,0.07)] hover:-translate-y-1">

          {/* ── Cover Image ── */}
          <div className="relative aspect-3/4 overflow-hidden bg-[#0d0f16]">
            <Image
              src={book.cover}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-[#0a0c11]/80 via-transparent to-transparent" />

            {/* Hover action overlay */}
            <div className="absolute inset-0 bg-[#0a0c11]/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.preventDefault()}
                className="w-10 h-10 rounded-full bg-[#d4a24c] flex items-center justify-center text-[#0a0c11] shadow-lg"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.preventDefault()}
                className="w-10 h-10 rounded-full bg-[#1a1f2e] border border-[#2a3040] flex items-center justify-center text-[#ede8dd] shadow-lg"
                aria-label="Add to wishlist"
              >
                <Heart className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.preventDefault()}
                className="w-10 h-10 rounded-full bg-[#1a1f2e] border border-[#2a3040] flex items-center justify-center text-[#ede8dd] shadow-lg"
                aria-label="Quick view"
              >
                <BookOpen className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Top Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
              {book.bestseller && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-[#d4a24c] text-[#0a0c11] px-2 py-0.5 rounded">
                  Bestseller
                </span>
              )}
              {discount && (
                <span className="text-[9px] font-black bg-red-500 text-white px-2 py-0.5 rounded">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {/* ── Card Body ── */}
          <div className="p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#d4a24c]">
                {book.genre}
              </span>
              <span className="text-[10px] text-[#4a5568]">{book.publishedYear}</span>
            </div>

            <h3
              className="text-[#ede8dd] font-bold text-sm leading-snug mb-0.5 line-clamp-2 group-hover:text-[#d4a24c] transition-colors duration-200"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {book.title}
            </h3>

            <p className="text-[11px] text-[#6b7588] mb-2.5">by {book.author}</p>

            <StarRating rating={book.rating} />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1a1f2e]">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-[#ede8dd] text-sm">${book.price.toFixed(2)}</span>
                {book.originalPrice && (
                  <span className="text-[11px] text-[#4a5568] line-through">
                    ${book.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <AvailabilityBadge status={book.availability} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── List Card ────────────────────────────────────────────────────────────────

function ListCard({ book, index = 0 }: BookCardProps) {
  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="group"
    >
      <Link href={`/books/${book.id}`}>
        <div className="flex gap-5 bg-[#111318] border border-[#1f2535] rounded-xl overflow-hidden p-4 transition-all duration-300 hover:border-[#d4a24c]/40 hover:shadow-[0_4px_24px_rgba(212,162,76,0.07)]">

          {/* Cover */}
          <div className="relative w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-[#0d0f16]">
            <Image
              src={book.cover}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="80px"
            />
            {book.bestseller && (
              <div className="absolute top-1 left-1">
                <span className="text-[8px] font-black uppercase bg-[#d4a24c] text-[#0a0c11] px-1 py-0.5 rounded leading-none">
                  BS
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#d4a24c]">
                  {book.genre}
                </span>
                <span className="text-[10px] text-[#4a5568] shrink-0">{book.publishedYear}</span>
              </div>

              <h3
                className="text-[#ede8dd] font-bold text-base leading-tight mb-0.5 group-hover:text-[#d4a24c] transition-colors duration-200 line-clamp-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {book.title}
              </h3>
              <p className="text-xs text-[#6b7588] mb-2">by {book.author}</p>
              <p className="text-xs text-[#4a5568] line-clamp-2 mb-2">{book.description}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarRating rating={book.rating} />
                <span className="text-[11px] text-[#4a5568]">({book.reviewCount.toLocaleString()})</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-[#ede8dd] text-sm">${book.price.toFixed(2)}</span>
                  {discount && (
                    <span className="text-[10px] font-bold text-red-400">-{discount}%</span>
                  )}
                </div>
                <AvailabilityBadge status={book.availability} />
              </div>
            </div>
          </div>

          {/* Action buttons (visible on hover) */}
          <div className="flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => e.preventDefault()}
              className="w-9 h-9 rounded-lg bg-[#d4a24c] flex items-center justify-center text-[#0a0c11]"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => e.preventDefault()}
              className="w-9 h-9 rounded-lg bg-[#1a1f2e] border border-[#2a3040] flex items-center justify-center text-[#ede8dd]"
              aria-label="Add to wishlist"
            >
              <Heart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function BookCard({ book, index = 0, viewMode = "grid" }: BookCardProps) {
  if (viewMode === "list") {
    return <ListCard book={book} index={index} />;
  }
  return <GridCard book={book} index={index} />;
}
