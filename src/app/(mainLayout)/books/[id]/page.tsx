/**
 * app/books/[id]/page.tsx
 *
 * Book detail page — server component.
 * Reads book from mock data by ID. Swap books.find() with your API fetch when ready.
 *
 * Next.js 15 note: params is a Promise in Next.js 15+.
 * This file uses the async/await pattern for forward compatibility.
 */

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ChevronRight,
  ShoppingCart,
  Heart,
  BookOpen,
  Calendar,
  Globe,
  Users,
  Hash,
  ArrowLeft,
  Tag,
} from "lucide-react";
import { books } from '../Books';
import BookCard from '../BookCard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Metadata (optional — for SEO) ───────────────────────────────────────────

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const book = books.find((b) => b.id === id);
  if (!book) return { title: "Book Not Found" };
  return {
    title: `${book.title} — ${book.author}`,
    description: book.description,
  };
}

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-4 h-4 ${
              rating >= s
                ? "text-[#d4a24c] fill-[#d4a24c]"
                : rating >= s - 0.5
                ? "text-[#d4a24c] fill-[#d4a24c]/40"
                : "text-[#2a3040]"
            }`}
          />
        ))}
      </div>
      <span className="font-bold text-[#ede8dd]">{rating}</span>
      <span className="text-[#4a5568] text-sm">
        ({reviewCount.toLocaleString()} reviews)
      </span>
    </div>
  );
}

// ─── Quick Stat ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center text-center py-4 px-2">
      <div className="w-8 h-8 rounded-lg bg-[#d4a24c]/10 flex items-center justify-center mb-2">
        <Icon className="w-3.5 h-3.5 text-[#d4a24c]" />
      </div>
      <p className="text-[9px] uppercase tracking-[0.15em] text-[#4a5568] font-bold mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-[#ede8dd] leading-tight">{value}</p>
    </div>
  );
}

// ─── Availability Badge ───────────────────────────────────────────────────────

function AvailabilityDot({ status }: { status: "in-stock" | "limited" | "out-of-stock" }) {
  const config = {
    "in-stock": { dot: "bg-emerald-400", text: "text-emerald-400", label: "In Stock" },
    limited: { dot: "bg-amber-400", text: "text-amber-400", label: "Limited Stock" },
    "out-of-stock": { dot: "bg-red-400", text: "text-red-400", label: "Out of Stock" },
  }[status];

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const book = books.find((b) => b.id === id);

  if (!book) notFound();

  const relatedBooks = books
    .filter((b) => b.genre === book.genre && b.id !== book.id)
    .slice(0, 4);

  const discount = book.originalPrice
    ? Math.round(
        ((book.originalPrice - book.price) / book.originalPrice) * 100
      )
    : null;

  return (
    <>
      {/* Google Fonts — move to layout.tsx using next/font/google in production */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
      `}</style>

      <main
        className="min-h-screen bg-[#0a0c11] text-[#ede8dd]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* ── Breadcrumb ── */}
        <div className="border-b border-[#1a1f2e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <nav
              className="flex items-center gap-1.5 text-xs text-[#4a5568]"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="hover:text-[#d4a24c] transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-[#2a3040]" />
              <Link
                href="/books"
                className="hover:text-[#d4a24c] transition-colors"
              >
                Books
              </Link>
              <ChevronRight className="w-3 h-3 text-[#2a3040]" />
              <Link
                href={`/books?genre=${book.genre}`}
                className="hover:text-[#d4a24c] transition-colors"
              >
                {book.genre}
              </Link>
              <ChevronRight className="w-3 h-3 text-[#2a3040]" />
              <span className="text-[#6b7588] truncate max-w-[180px] sm:max-w-xs">
                {book.title}
              </span>
            </nav>
          </div>
        </div>

        {/* ── Hero Section ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

          {/* Back button */}
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-xs text-[#4a5568] hover:text-[#d4a24c] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to all books
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr] gap-10 lg:gap-16">

            {/* ── Left: Cover + Actions ── */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              {/* Book cover */}
              <div className="relative w-56 sm:w-64 lg:w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
                <Image
                  src={book.cover}
                  alt={`Cover of ${book.title}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 256px, 340px"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {book.bestseller && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-[#d4a24c] text-[#0a0c11] px-2.5 py-1 rounded-full">
                      Bestseller
                    </span>
                  )}
                  {discount && (
                    <span className="text-[9px] font-black bg-red-500 text-white px-2.5 py-1 rounded-full">
                      -{discount}% Off
                    </span>
                  )}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="w-full sm:w-64 lg:w-full space-y-2.5">
                <button
                  disabled={book.availability === "out-of-stock"}
                  className="w-full bg-[#d4a24c] text-[#0a0c11] font-bold py-3.5 rounded-xl hover:bg-[#e8b85c] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {book.availability === "out-of-stock"
                    ? "Out of Stock"
                    : `Add to Cart — $${book.price.toFixed(2)}`}
                </button>

                <button className="w-full bg-transparent border border-[#1f2535] text-[#ede8dd] font-medium py-3.5 rounded-xl hover:border-[#d4a24c]/40 hover:bg-[#d4a24c]/5 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4 text-[#4a5568]" />
                  Add to Wishlist
                </button>
              </div>

              {/* Availability */}
              <AvailabilityDot status={book.availability} />
            </div>

            {/* ── Right: Book Info ── */}
            <div className="flex flex-col">
              {/* Genre + tags row */}
              <div className="flex items-center flex-wrap gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4a24c]">
                  {book.genre}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#2a3040]" />
                {book.newRelease && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                    New Release
                  </span>
                )}
              </div>

              {/* Title */}
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#ede8dd] leading-[1.1] mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {book.title}
              </h1>

              {/* Author */}
              <p className="text-base text-[#6b7588] mb-5">
                by{" "}
                <span className="text-[#ede8dd] font-medium hover:text-[#d4a24c] cursor-pointer transition-colors">
                  {book.author}
                </span>
              </p>

              {/* Rating */}
              <div className="mb-6">
                <StarRating rating={book.rating} reviewCount={book.reviewCount} />
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-[#1a1f2e]">
                <span className="text-3xl font-black text-[#ede8dd]">
                  ${book.price.toFixed(2)}
                </span>
                {book.originalPrice && (
                  <>
                    <span className="text-lg text-[#4a5568] line-through">
                      ${book.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-4 bg-[#111318] border border-[#1a1f2e] rounded-xl divide-x divide-[#1a1f2e] mb-8">
                <StatCard icon={BookOpen} label="Pages" value={book.pages.toString()} />
                <StatCard icon={Calendar} label="Year" value={book.publishedYear.toString()} />
                <StatCard icon={Globe} label="Language" value={book.language} />
                <StatCard icon={Users} label="Reviews" value={`${(book.reviewCount / 1000).toFixed(1)}k`} />
              </div>

              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-3.5 h-3.5 text-[#d4a24c]" />
                  <h2 className="text-[10px] uppercase tracking-[0.18em] text-[#4a5568] font-bold">
                    About this Book
                  </h2>
                </div>
                <p className="text-[#9aa0b0] leading-relaxed text-sm">
                  {book.longDescription}
                </p>
              </div>

              {/* Tags */}
              <div className="flex items-center flex-wrap gap-2 mb-8">
                <Tag className="w-3 h-3 text-[#4a5568]" />
                {book.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-[#4a5568] border border-[#1a1f2e] px-2.5 py-1 rounded-full hover:border-[#d4a24c]/30 hover:text-[#d4a24c] cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Author bio card */}
              <div className="bg-[#111318] border border-[#1a1f2e] rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#d4a24c]/10 border border-[#d4a24c]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-[#d4a24c]">
                      {book.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-[#4a5568] font-bold">
                      About the Author
                    </p>
                    <p
                      className="font-semibold text-[#ede8dd] text-sm"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {book.author}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#6b7588] leading-relaxed">
                  {book.authorBio}
                </p>
              </div>

              {/* ISBN */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#2a3040]">
                <Hash className="w-3 h-3" />
                <span>ISBN: {book.isbn}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Related Books ── */}
        {relatedBooks.length > 0 && (
          <div className="border-t border-[#1a1f2e]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4a24c] font-bold mb-1.5">
                    More Like This
                  </p>
                  <h2
                    className="text-2xl font-bold text-[#ede8dd]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Related Books
                  </h2>
                </div>
                <Link
                  href={`/books?genre=${book.genre}`}
                  className="text-xs font-semibold text-[#d4a24c] hover:underline underline-offset-2 transition-colors flex items-center gap-1"
                >
                  All {book.genre}
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
                {relatedBooks.map((related, index) => (
                  <BookCard key={related.id} book={related} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
