"use client";

import { useState } from "react";
import { Badge } from "../Components";
import { BookActionButtonEditandView } from "./BookComponents";
import type { BookState } from "./books.types";

type Book = BookState["bookBreakdown"][number];
type Filter = "all" | "low" | "out" | "sus";
const PAGE_SIZE = 10;
const money = (value: number) => `৳ ${Number(value).toLocaleString("en-BD")}`;
const units = (book: Book) => book.orderItem.reduce((sum, item) => sum + item.quantity, 0);
const sales = (book: Book) => book.orderItem.reduce((sum, item) => sum + Number(item.price), 0);
const price = (book: Book) =>
  book.physicalSalePrice ??
  book.physicalRegularPrice ??
  book.digitalSalePrice ??
  book.digitalRegularPrice ??
  0;
const physical = (book: Book) => book.formats.includes("HARDCOVER");
const lowStock = (book: Book) => physical(book) && book.stock < 20;

export default function BookInventoryTable({ books }: { books: Book[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [requestedPage, setRequestedPage] = useState(1);
  const low = books.filter(book => lowStock(book) && book.stock > 0);
  const out = books.filter(book => physical(book) && book.stock === 0);
  const suspended = books.filter(book => book.status === "SUSPENDED");
  const visible =
    filter === "low" ? low : filter === "out" ? out : filter === "sus" ? suspended : books;
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const pageBooks = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectFilter = (next: Filter) => {
    setFilter(next);
    setRequestedPage(1);
  };
  const empty =
    filter === "all"
      ? "No approved or suspended books found. Pending submissions are in Approvals."
      : filter === "sus"
        ? "No suspended books found."
        : `No ${filter === "low" ? "low stock" : "out of stock"} books found.`;
  const status = (book: Book) => (
    <Badge
      variant={
        book.status === "APPROVED" ? "green" : book.status === "SUSPENDED" ? "red" : "orange"
      }
      fontSize='9'
    >
      {book.status}
    </Badge>
  );
  const formats = (book: Book) => (
    <span className='flex flex-wrap gap-1'>
      {book.formats.map(format => (
        <Badge
          key={format}
          fontSize='9'
          variant={format === "HARDCOVER" ? "blue" : "orange"}
        >
          {format}
        </Badge>
      ))}
    </span>
  );
  const stock = (book: Book) =>
    physical(book) ? (
      <span className={lowStock(book) ? "font-semibold text-red-400" : "text-slate-400"}>
        {book.stock}
        {lowStock(book) && <small className='ml-1'>{book.stock ? "Low" : "Out"}</small>}
      </span>
    ) : (
      "—"
    );

  return (
    <section className='min-w-0 overflow-hidden rounded border border-slate-800'>
      <div className='flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900 p-3'>
        {(
          [
            ["all", "All Books", books.length],
            ["low", "Low Stock", low.length],
            ["out", "Out of Stock", out.length],
            ["sus", "Suspended", suspended.length],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            type='button'
            onClick={() => selectFilter(key)}
            aria-pressed={filter === key}
            className={`rounded px-3 py-2 text-xs font-semibold ${filter === key ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            {label} ({count})
          </button>
        ))}
        <span className='ml-auto text-xs text-slate-500'>Ranked by paid units sold</span>
      </div>

      <div className='divide-y divide-slate-800 xl:hidden'>
        {!visible.length && <p className='p-10 text-center text-sm text-slate-500'>{empty}</p>}
        {pageBooks.map(book => (
          <article
            key={book.id}
            className={`min-w-0 p-4 ${lowStock(book) ? "bg-red-950/20" : ""}`}
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0 flex-1'>
                <p
                  className='truncate text-sm font-semibold text-slate-100'
                  title={book.title}
                >
                  <span className='mr-2 text-slate-500'>#{books.indexOf(book) + 1}</span>
                  {book.title}
                </p>
                <p
                  className='mt-1 truncate text-xs text-slate-400'
                  title={book.author}
                >
                  {book.author}
                </p>
              </div>
              <div className='shrink-0 whitespace-nowrap'>
                <BookActionButtonEditandView book={book} />
              </div>
            </div>
            <div className='mt-3 flex flex-wrap items-center gap-2'>
              {formats(book)}
              {status(book)}
            </div>
            <dl className='mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4'>
              {[
                ["Price", money(price(book))],
                ["Sold", units(book)],
                ["Sales", money(sales(book))],
                ["Stock", stock(book)],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className='text-slate-500'>{label}</dt>
                  <dd className='text-slate-200'>{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <table className='hidden w-full table-fixed border-collapse text-left xl:table'>
        <colgroup>
          {[4, 20, 15, 11, 7, 7, 7, 5, 8, 8].map((width, i) => (
            <col
              key={i}
              style={{ width: `${width}%` }}
            />
          ))}
        </colgroup>
        <thead className='bg-slate-900'>
          <tr>
            {[
              "#",
              "Title",
              "Author",
              "Type",
              "Price",
              "Sold",
              "Sales",
              "Stock",
              "Status",
              "Actions",
            ].map(label => (
              <th
                key={label}
                scope='col'
                className='border-b border-slate-800 px-2 py-3 text-[10px] font-semibold uppercase text-slate-500'
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-800'>
          {!visible.length && (
            <tr>
              <td
                colSpan={10}
                className='p-10 text-center text-sm text-slate-500'
              >
                {empty}
              </td>
            </tr>
          )}
          {pageBooks.map(book => (
            <tr
              key={book.id}
              className={`hover:bg-slate-800/60 ${lowStock(book) ? "bg-red-950/20" : ""}`}
            >
              <td className='px-2 py-3 text-xs text-slate-400'>{books.indexOf(book) + 1}</td>
              <td className='min-w-0 px-2 py-3 text-sm font-semibold text-slate-100'>
                <span
                  className='block truncate'
                  title={book.title}
                >
                  {book.title}
                </span>
              </td>
              <td className='min-w-0 px-2 py-3 text-xs text-slate-400'>
                <span
                  className='block truncate'
                  title={book.author}
                >
                  {book.author}
                </span>
              </td>
              <td className='px-2 py-3'>{formats(book)}</td>
              <td
                className='truncate px-2 py-3 text-xs text-slate-200'
                title={money(price(book))}
              >
                {money(price(book))}
              </td>
              <td className='px-2 py-3 text-xs text-slate-200'>{units(book)}</td>
              <td
                className='truncate px-2 py-3 text-xs text-emerald-400'
                title={money(sales(book))}
              >
                {money(sales(book))}
              </td>
              <td className='px-2 py-3 text-xs'>{stock(book)}</td>
              <td className='px-2 py-3'>{status(book)}</td>
              <td className='px-1 py-3 whitespace-nowrap'>
                <BookActionButtonEditandView book={book} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {visible.length > PAGE_SIZE && (
        <nav
          aria-label='Book pagination'
          className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-400'
        >
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, visible.length)} of{" "}
            {visible.length} books
          </span>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              disabled={page === 1}
              onClick={() => setRequestedPage(page - 1)}
              className='rounded border border-slate-700 px-3 py-1.5 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40'
            >
              Previous
            </button>
            <span
              aria-live='polite'
              className='min-w-20 text-center'
            >
              Page {page} of {pageCount}
            </span>
            <button
              type='button'
              disabled={page === pageCount}
              onClick={() => setRequestedPage(page + 1)}
              className='rounded border border-slate-700 px-3 py-1.5 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40'
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}
