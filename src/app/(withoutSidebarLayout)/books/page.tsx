/**
 * app/books/page.tsx  ←  SERVER COMPONENT (no "use client")
 *
 * Responsibilities:
 *  - Fetch / import the book data (swap books import for your API call)
 *  - Render the static heading that is SEO-crawlable and streams first
 *  - Hand the books array to <BooksClient> (the interactive client island)
 *
 * Nothing here requires JavaScript in the browser, so this file stays
 * a React Server Component.  Only the interactive filtering, sorting, and
 * view-mode toggling live in the client island below.
 */

import { books } from './Books';
import BooksClient from './components/BooksClient';


export const metadata = {
  title: "All Books — Our Collection",
  description: `Browse our curated collection of ${books.length} titles.`,
};

export default function BooksPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Static header — server-rendered, zero JS, perfect for SEO ── */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-500 mb-2">
            Our Collection
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-none">
            All Books
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {books.length} titles curated for the discerning reader
          </p>
        </div>
      </div>

      {/* ── Interactive client island — filtering, sorting, view toggle ── */}
      <BooksClient initialBooks={books} />
    </main>
  );
}
