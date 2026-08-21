import { getAllBooks } from "./bookAction";
import type { BookResponse } from "./Books.type.ts";
import BooksClient from "./components/BooksClient";

export const metadata = {
  title: "All Books — Our Collection",
  // description: `Browse our curated collection of ${books.length} titles.`,
};

export default async function BooksPage() {
  const books = (await getAllBooks()) as BookResponse;
  console.log("books data:", books);
  return (
    <main className='min-h-screen bg-white'>
      {/* ── Static header — server-rendered, zero JS, perfect for SEO ── */}
      <div className='border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14'>
          <p className='text-xs font-bold uppercase tracking-[0.22em] text-amber-500 mb-2'>
            Our Collection
          </p>
          <h1 className='text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-none'>
            All Books
          </h1>
          <p className='text-gray-400 mt-2 text-sm'>
            {books?.length} titles curated for the discerning reader
          </p>
        </div>
      </div>

      {/* ── Interactive client island — filtering, sorting, view toggle ── */}
      <BooksClient initialBooks={books} />
    </main>
  );
}
