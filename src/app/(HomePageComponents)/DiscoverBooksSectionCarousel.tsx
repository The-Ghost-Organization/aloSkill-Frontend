"use client";

import SectionHeader from "@/components/sections/SectionHeader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { books } from "../(withoutSidebarLayout)/books/Books.ts";
import BookCard from "../(withoutSidebarLayout)/books/components/BookCard.tsx";

export function DiscoverBooksSectionCarousel() {
  const [isPaused, setIsPaused] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    autoScrollRef.current = setInterval(() => {
      if (!scrollContainerRef.current || isPaused) return;
      const container = scrollContainerRef.current;
      container.scrollLeft += 1;
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
        container.scrollLeft = 0;
      }
    }, 16);
  }, [isPaused]);

  const restartAutoScroll = () => {
    stopAutoScroll();
    startAutoScroll();
  };

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [startAutoScroll]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    stopAutoScroll();
    container.scrollTo({
      left: direction === "left" ? container.scrollLeft - 420 : container.scrollLeft + 420,
      behavior: "smooth",
    });
    setTimeout(restartAutoScroll, 500);
  };

  return (
    <section className='py-20 bg-linear-to-br from-orange-50 via-white to-blue-50 overflow-hidden'>
      <div className='max-w-7xl mx-auto px-4'>
        <SectionHeader
          title='Discover New Books Every Day'
          subtitle='Explore handpicked books from top authors and bestselling titles.'
          showButton
          buttonText='Browse All Books'
        />

        <div
          className='relative'
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={scrollContainerRef}
            className='flex gap-6 overflow-x-auto scrollbar-hide pb-4'
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseDown={stopAutoScroll}
            onMouseUp={restartAutoScroll}
          >
            {books.map((book, index) => (
              <div
                key={book.id}
                className='w-[200px] shrink-0'
              >
                <BookCard
                  book={book}
                  index={index}
                  viewMode='grid' // grid = vertical card, correct for carousel
                />
              </div>
            ))}
          </div>

          <div className='absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-orange-50 to-transparent pointer-events-none' />
          <div className='absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-orange-50 to-transparent pointer-events-none' />
        </div>

        <div className='flex justify-center gap-4 mt-8'>
          <button
            onClick={() => scroll("left")}
            className='p-3 bg-white border-2 border-gray-200 rounded-full hover:border-[var(--color-orange)] hover:bg-orange-50 transition-all shadow-md hover:scale-110'
            aria-label='Previous books'
          >
            <ChevronLeft className='w-6 h-6 text-[var(--color-text-dark)]' />
          </button>
          <button
            onClick={() => scroll("right")}
            className='p-3 bg-white border-2 border-gray-200 rounded-full hover:border-[var(--color-orange)] hover:bg-orange-50 transition-all shadow-md hover:scale-110'
            aria-label='Next books'
          >
            <ChevronRight className='w-6 h-6 text-[var(--color-text-dark)]' />
          </button>
        </div>

        {isPaused && (
          <div className='text-center mt-4'>
            <span className='text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200'>
              Auto-scroll paused
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
