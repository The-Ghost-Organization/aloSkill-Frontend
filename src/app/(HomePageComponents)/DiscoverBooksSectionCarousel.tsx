"use client";

import SectionHeader from "@/components/sections/SectionHeader";
import { apiClient } from "@/lib/api/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { BookResponse } from "../(withoutSidebarLayout)/books/Books.type";
import BookCard from "../(withoutSidebarLayout)/books/components/BookCard";

const AUTO_SCROLL_INTERVAL = 24;
const AUTO_SCROLL_STEP = 1;

export function DiscoverBooksSectionCarousel() {
  const [books, setBooks] = useState<BookResponse>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();

    autoScrollRef.current = setInterval(() => {
      const container = scrollContainerRef.current;
      if (!container || isPausedRef.current) return;

      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      if (maxScrollLeft <= 0) return;

      if (container.scrollLeft >= maxScrollLeft - 1) {
        container.scrollTo({ left: 0, behavior: "auto" });
      } else {
        container.scrollLeft += AUTO_SCROLL_STEP;
      }
    }, AUTO_SCROLL_INTERVAL);
  }, [stopAutoScroll]);

  const setPaused = useCallback((paused: boolean) => {
    isPausedRef.current = paused;
    setIsPaused(paused);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchBooks() {
      try {
        const session = await getSession();
        const headers: Record<string, string> = {};

        if (session?.accessToken) {
          headers["Authorization"] = `Bearer ${session.accessToken}`;
        }

        const response = await apiClient.get<BookResponse>("/book/public/all-books", headers);
        if (!mounted) return;

        if (response.success) {
          setBooks(response.data ?? []);
        } else {
          console.error("Failed to fetch books:", response);
          setBooks([]);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch books:", error);
          setBooks([]);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void fetchBooks();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (books.length > 0) startAutoScroll();

    return () => {
      stopAutoScroll();
      clearResumeTimeout();
    };
  }, [books.length, clearResumeTimeout, startAutoScroll, stopAutoScroll]);

  const pauseInteraction = useCallback(() => {
    clearResumeTimeout();
    setPaused(true);
  }, [clearResumeTimeout, setPaused]);

  const resumeInteraction = useCallback(() => {
    clearResumeTimeout();
    resumeTimeoutRef.current = setTimeout(() => setPaused(false), 700);
  }, [clearResumeTimeout, setPaused]);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      const container = scrollContainerRef.current;
      if (!container) return;

      pauseInteraction();
      const firstCard = container.querySelector<HTMLElement>("[data-book-card]");
      const distance = firstCard ? firstCard.offsetWidth + 24 : container.clientWidth * 0.8;

      container.scrollBy({
        left: direction === "left" ? -distance : distance,
        behavior: "smooth",
      });
      resumeInteraction();
    },
    [pauseInteraction, resumeInteraction]
  );

  return (
    <section className='overflow-hidden bg-white py-14 sm:py-20'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <SectionHeader
          title='Discover New Books Every Day'
          subtitle='Explore handpicked books from top authors and bestselling titles.'
          showButton
          buttonText='Browse All Books'
        />

        <div
          className='group/carousel relative mt-8'
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={scrollContainerRef}
            className='flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            onPointerDown={pauseInteraction}
            onPointerUp={resumeInteraction}
            onPointerCancel={resumeInteraction}
            aria-label='Discover books carousel'
          >
            {isLoading &&
              Array.from({ length: 5 }, (_, index) => (
                <div
                  key={`book-skeleton-${index}`}
                  className='w-[72vw] max-w-[240px] shrink-0 snap-start sm:w-[220px] lg:w-[calc((100%_-_6rem)/5)]'
                  aria-hidden='true'
                >
                  <div className='h-56 animate-pulse rounded-lg bg-gray-200' />
                  <div className='mt-3 h-4 animate-pulse rounded bg-gray-200' />
                  <div className='mt-2 h-3 w-2/3 animate-pulse rounded bg-gray-200' />
                </div>
              ))}

            {!isLoading &&
              books.map((book, index) => (
                <div
                  key={book.id}
                  data-book-card
                  className='w-[72vw] max-w-[240px] shrink-0 snap-start sm:w-[220px] lg:w-[calc((100%_-_6rem)/5)]'
                >
                  <BookCard
                    book={book}
                    index={index}
                    viewMode='grid'
                  />
                </div>
              ))}

            {!isLoading && books.length === 0 && (
              <div
                className='w-full py-16 text-center'
                role='status'
              >
                <p className='text-sm text-gray-500'>No books available at the moment.</p>
              </div>
            )}
          </div>

          {!isLoading && books.length > 1 && (
            <>
              <div className='pointer-events-none absolute inset-y-0 left-0 w-12 bg-transparent sm:w-20' />
              <div className='pointer-events-none absolute inset-y-0 right-0 w-12 bg-transparent sm:w-20' />

              <button
                type='button'
                onClick={() => scroll("left")}
                className='absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-2.5 shadow-md transition hover:border-orange-300 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:left-3'
                aria-label='Show previous books'
              >
                <ChevronLeft
                  className='h-5 w-5 text-gray-800'
                  aria-hidden='true'
                />
              </button>
              <button
                type='button'
                onClick={() => scroll("right")}
                className='absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-2.5 shadow-md transition hover:border-orange-300 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:right-3'
                aria-label='Show next books'
              >
                <ChevronRight
                  className='h-5 w-5 text-gray-800'
                  aria-hidden='true'
                />
              </button>
            </>
          )}

          <span
            className='sr-only'
            aria-live='polite'
          >
            {isPaused && books.length > 0 ? "Book carousel paused" : ""}
          </span>
        </div>
      </div>
    </section>
  );
}
