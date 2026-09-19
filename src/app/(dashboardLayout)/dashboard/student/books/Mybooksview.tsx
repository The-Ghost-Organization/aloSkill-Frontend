"use client";

import { BookOpen, Library, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import DashboardState from "../components/DashboardState";
import { BookRow } from "./Bookrow";
import { BookStats } from "./Bookstats";
import type { BookItem, BookType } from "./UserBook.type";

export function MyBooksView({ books }: { books: BookItem[] }) {
  const [activeTab, setActiveTab] = useState<BookType>("ebook");
  const [query, setQuery] = useState("");

  const visibleBooks = useMemo(() => {
    const search = query.trim().toLowerCase();
    return books
      .filter(book => book.type === activeTab)
      .filter(book => !search || book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search) || book.orderId.toLowerCase().includes(search))
      .sort((a, b) => +new Date(b.purchaseDate) - +new Date(a.purchaseDate));
  }, [activeTab, books, query]);

  if (books.length === 0) {
    return <DashboardState kind='empty' icon={Library} title='Your book library is empty' description='Purchased eBooks and physical books will be organized here.' action={<Link href='/books' className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'>Browse books</Link>} />;
  }

  const ebooks = books.filter(book => book.type === "ebook").length;
  const physical = books.length - ebooks;

  return (
    <div className='space-y-5'>
      <div><h1 className='text-2xl font-bold text-gray-900'>My Books</h1><p className='mt-1 text-sm text-gray-500'>Read or download your eBooks and view physical books you purchased.</p></div>
      <BookStats books={books} />

      <section className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-100 p-4 sm:p-5'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex rounded-lg bg-gray-100 p-1'>
              <button type='button' onClick={() => setActiveTab("ebook")} className={`rounded-md px-4 py-2 text-sm font-semibold ${activeTab === "ebook" ? "bg-white text-orange-600 shadow-sm" : "text-gray-600"}`}>Digital library ({ebooks})</button>
              <button type='button' onClick={() => setActiveTab("physical")} className={`rounded-md px-4 py-2 text-sm font-semibold ${activeTab === "physical" ? "bg-white text-orange-600 shadow-sm" : "text-gray-600"}`}>Physical books ({physical})</button>
            </div>
            <div className='relative w-full sm:max-w-xs'><Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' /><input type='search' value={query} onChange={event => setQuery(event.target.value)} placeholder='Search your books…' className='w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-orange-400 focus:outline-none' /></div>
          </div>
        </div>

        {visibleBooks.length === 0 ? (
          <DashboardState kind='empty' icon={BookOpen} title={query ? "No matching books" : activeTab === "ebook" ? "No eBooks yet" : "No physical books yet"} description={query ? "Try a different title, author, or order ID." : activeTab === "ebook" ? "Your readable and downloadable eBooks will appear here." : "Physical books from completed checkouts will appear here."} action={query ? <button type='button' onClick={() => setQuery("")} className='rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700'>Clear search</button> : undefined} />
        ) : (
          <div className='divide-y divide-gray-100'>{visibleBooks.map(book => <BookRow key={`${book.type}-${book.id}-${book.orderId}`} book={book} />)}</div>
        )}
      </section>
    </div>
  );
}
