"use client";

import { BookOpen, Download, ExternalLink, Truck } from "lucide-react";
import Link from "next/link";
import { BookCover } from "./Bookcover";
import { BookStatusBadge } from "./Bookstatusbadge";
import type { BookItem } from "./UserBook.type";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value)
  );

export function BookRow({ book }: { book: BookItem }) {
  return (
    <article className='flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5'>
      <div className='flex min-w-0 flex-1 items-center gap-4'>
        <BookCover
          title={book.title}
          coverUrl={book.coverUrl}
          id={book.id}
        />
        <div className='min-w-0'>
          <h3 className='truncate font-semibold text-gray-900'>{book.title}</h3>
          <p className='truncate text-sm text-gray-500'>{book.author}</p>
          <div className='mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500'>
            <span className='rounded-full bg-gray-100 px-2 py-1'>
              {book.type === "ebook" ? book.format : "Physical book"}
            </span>
            <span>Purchased {formatDate(book.purchaseDate)}</span>
            <span className='break-all'>#{book.orderId}</span>
          </div>
        </div>
      </div>

      {book.type === "ebook" ? (
        <div className='flex shrink-0 gap-2'>
          {book.readUrl ? (
            <a
              href={book.readUrl}
              target='_blank'
              rel='noreferrer'
              className='inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'
            >
              <BookOpen className='h-4 w-4' /> Read
            </a>
          ) : (
            <span className='inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm text-gray-400'>
              <BookOpen className='h-4 w-4' /> Reader unavailable
            </span>
          )}
          {book.downloadUrl && (
            <a
              href={book.downloadUrl}
              download
              className='inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-orange-200 px-4 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50'
            >
              <Download className='h-4 w-4' /> Download
            </a>
          )}
        </div>
      ) : (
        <div className='flex shrink-0 flex-col items-start gap-2 sm:items-end'>
          <BookStatusBadge status={book.status} />
          <Link
            href={`/dashboard/student/orders/${encodeURIComponent(book.orderId)}`}
            className='inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-600'
          >
            <Truck className='h-4 w-4' /> Track order <ExternalLink className='h-3.5 w-3.5' />
          </Link>
        </div>
      )}
    </article>
  );
}
