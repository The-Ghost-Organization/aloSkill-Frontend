"use client";

import { BookOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { BookRow } from "./Bookrow";
import {
  BooksFilterBar,
  type SortOption,
  type StatusFilter,
  type TypeFilter,
} from "./Booksfilterbar";
import { BookStats } from "./Bookstats";
import type { BookItem } from "./UserBook.type";

export function MyBooksView({ books }: { books: BookItem[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    let result = [...books];

    if (typeFilter !== "all") {
      result = result.filter(b => b.type === typeFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter(b => b.type === "physical" && b.status === statusFilter);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.orderId.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return +new Date(a.purchaseDate) - +new Date(b.purchaseDate);
        case "price_high":
          return b.price - a.price;
        case "price_low":
          return a.price - b.price;
        case "newest":
        default:
          return +new Date(b.purchaseDate) - +new Date(a.purchaseDate);
      }
    });

    return result;
  }, [books, typeFilter, statusFilter, query, sort]);

  return (
    <div className='space-y-6'>
      <BookStats books={books} />

      <div className='rounded border border-gray-200 bg-white'>
        <div className='border-b border-gray-100 px-6 py-5'>
          <h2 className='font-serif text-lg font-semibold text-gray-900'>My Books</h2>
          <div className='mt-3'>
            <BooksFilterBar
              query={query}
              onQueryChange={setQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sort={sort}
              onSortChange={setSort}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 px-6 py-16 text-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
              <BookOpen className='h-6 w-6 text-gray-400' />
            </div>
            <p className='font-medium text-gray-700'>No books match your filters</p>
            <p className='text-sm text-gray-500'>
              Try a different search term or clear your filters.
            </p>
          </div>
        ) : (
          <div>
            {filtered.map(book => (
              <BookRow
                key={book.id}
                book={book}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
