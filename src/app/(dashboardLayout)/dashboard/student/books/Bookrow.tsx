"use client";

import { ChevronDown, Download } from "lucide-react";
import { useState } from "react";
import { BookCover } from "./Bookcover";
import { BookStatusBadge } from "./Bookstatusbadge";
import { TrackingTimeline } from "./Trackingtimeline";
import type { BookItem } from "./UserBook.type";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(price: number, currency = "৳") {
  return `${currency} ${price.toLocaleString()}`;
}

export function BookRow({ book }: { book: BookItem }) {
  const [expanded, setExpanded] = useState(false);
  const isPhysical = book.type === "physical";

  return (
    <div className='border-b border-gray-100 last:border-b-0'>
      <div className='flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center'>
        {/* Cover + title */}
        <div className='flex flex-1 items-center gap-3 min-w-0'>
          <BookCover
            title={book.title}
            coverUrl={book.coverUrl}
            id={book.id}
          />
          <div className='min-w-0'>
            <p className='truncate font-medium text-gray-900'>{book.title}</p>
            <p className='truncate text-sm text-gray-500'>{book.author}</p>
            <div className='mt-1 flex items-center gap-2'>
              <span className='inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600'>
                {book.type === "ebook" ? book.format : "Physical"}
              </span>
              {book.type === "ebook" && (
                <span className='text-[11px] text-gray-400'>{book.fileSizeMb} MB</span>
              )}
            </div>
          </div>
        </div>

        {/* Order meta */}
        <div className='flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-500 sm:w-auto'>
          <div className='flex flex-col'>
            <span className='text-[11px] uppercase tracking-wide text-gray-400 sm:hidden'>
              Order ID
            </span>
            <span className='text-gray-700'>{book.orderId}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-[11px] uppercase tracking-wide text-gray-400 sm:hidden'>
              Date
            </span>
            <span>{formatDate(book.purchaseDate)}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-[11px] uppercase tracking-wide text-gray-400 sm:hidden'>
              Amount
            </span>
            <span className='font-medium text-gray-800'>{formatPrice(book.price)}</span>
          </div>
        </div>

        {/* Action */}
        <div className='flex shrink-0 items-center justify-end gap-2 sm:w-48'>
          {book.type === "ebook" ? (
            <a
              href={book.downloadUrl}
              download
              className='inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600'
            >
              <Download className='h-4 w-4' />
              Download
            </a>
          ) : (
            <>
              <BookStatusBadge status={book.status} />
              <button
                onClick={() => setExpanded(v => !v)}
                aria-expanded={expanded}
                className='inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50'
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </button>
            </>
          )}
        </div>
      </div>

      {isPhysical && expanded && <TrackingTimeline book={book} />}
    </div>
  );
}
